/**
 * Checkout orchestrator — bridge antara cart, orders, dan Pakasir.
 *
 * Flow:
 *   1. Authenticated user POST /api/checkout dengan cart items + voucherCode.
 *   2. Server VALIDATE voucher (anti tamper). Hitung discount + admin fee.
 *   3. Server insert N orders (status=pending) dengan shared payment_ref.
 *   4. Server panggil Pakasir createTransaction(qris) dengan total final.
 *   5. Server attach payment_ref/url/qr_string ke semua order + redeem voucher.
 *   6. Return ke client: payUrl, qrString, paymentRef, breakdown.
 *   7. Client tampilkan QR + polling status.
 *   8. Pakasir kirim webhook → /api/payments/pakasir/callback → settlePaymentRef
 */

import { createPendingOrder, attachPaymentToOrders } from "@/lib/data/orders-repo";
import { findVoucherByCode, redeemVoucher } from "@/lib/data/vouchers-repo";
import { getSettings } from "@/lib/data/settings-repo";
import { createPakasirTransaction } from "./payments/pakasir";
import { env, isPakasirConfigured } from "../env";
import { getCurrentSession } from "./auth";
import type { CheckoutInput } from "../schemas/checkout";
import type { Voucher } from "@/lib/types";

export interface CheckoutResult {
  paymentRef: string;
  payUrl: string;
  qrString: string | null;
  qrLink: string | null;
  trxId: string | null;
  subtotal: number;
  discount: number;
  adminFee: number;
  totalAmount: number;
  orderIds: string[];
}

function generatePaymentRef(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `LP${yy}${mm}${dd}${rand}`;
}

function computeDiscount(voucher: Voucher, subtotal: number): number {
  if (voucher.type === "percent") {
    return Math.round((subtotal * voucher.value) / 100);
  }
  return Math.min(voucher.value, subtotal);
}

export async function checkoutService(input: CheckoutInput): Promise<CheckoutResult> {
  if (!isPakasirConfigured()) {
    throw new Error(
      "Payment gateway belum di-konfigurasi. Set PAKASIR_API_KEY + PAKASIR_PROJECT di .env."
    );
  }
  const sess = await getCurrentSession();
  if (!sess) throw new Error("Unauthorized");

  // ─── 1. Compute subtotal dari items (server-side, anti tamper) ──────────
  const subtotal = input.items.reduce(
    (s, it) => s + it.unitPriceIDR * it.qty,
    0
  );
  if (subtotal <= 0) throw new Error("Total transaksi tidak valid");

  // ─── 2. Validate voucher (kalau ada) — re-check di server ──────────────
  let appliedVoucher: Voucher | null = null;
  let discount = 0;
  if (input.voucherCode) {
    const v = await findVoucherByCode(input.voucherCode);
    if (!v) {
      throw new Error("Kode voucher tidak ditemukan");
    }
    if (!v.active) {
      throw new Error("Voucher sudah tidak aktif");
    }
    if (v.expires && new Date(v.expires) < new Date()) {
      throw new Error("Voucher sudah kadaluwarsa");
    }
    if (v.limit > 0 && v.used >= v.limit) {
      throw new Error("Voucher sudah habis dipakai");
    }
    if (subtotal < v.minOrder) {
      throw new Error(
        `Min. order Rp${v.minOrder.toLocaleString("id-ID")} untuk voucher ini`
      );
    }
    appliedVoucher = v;
    discount = computeDiscount(v, subtotal);
  }

  // ─── 3. Admin fee dari settings (default 0 = no fee) ────────────────────
  const settings = await getSettings();
  const adminFee = settings.adminFeeIDR ?? 0;

  // ─── 4. Total final yang di-charge ke customer via Pakasir ──────────────
  const totalAmount = Math.max(0, subtotal - discount + adminFee);
  if (totalAmount <= 0) throw new Error("Total akhir tidak valid");

  const paymentRef = generatePaymentRef();

  // ─── 5. Create N pending orders. Discount + adminFee di order pertama ──
  const orderIds: string[] = [];
  for (let i = 0; i < input.items.length; i++) {
    const it = input.items[i];
    const isFirst = i === 0;
    const { id } = await createPendingOrder(
      {
        productId: it.productId,
        productName: it.productName,
        duration: it.duration,
        qty: it.qty,
        totalIDR: it.unitPriceIDR * it.qty,
        accountType: it.accountType,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        paymentMethod: input.paymentChannel,
        notes: appliedVoucher ? `voucher:${appliedVoucher.code}` : undefined,
      },
      sess.user.id
    );
    orderIds.push(id);
    // Set fee/discount + voucher_code di order ini (admin fee + discount cuma di first)
    if (isFirst && (discount > 0 || adminFee > 0 || appliedVoucher)) {
      const { getServerClient } = await import("../db/server-client");
      const sb = await getServerClient();
      await sb
        .from("orders")
        .update({
          discount_idr: discount,
          admin_fee_idr: adminFee,
          voucher_code: appliedVoucher?.code ?? null,
        })
        .eq("id", id);
    }
  }

  // ─── 6. Call Pakasir create-transaction (QRIS) dengan total final ─────
  let pakasirData;
  try {
    const redirectUrl = env.SITE_URL
      ? `${env.SITE_URL}/checkout/success?ref=${paymentRef}`
      : undefined;
    pakasirData = await createPakasirTransaction({
      orderId: paymentRef,
      amount: totalAmount,
      redirectUrl,
    });
  } catch (e) {
    // Cleanup: orders sudah ke-insert tapi gateway gagal. Tandai 'failed'.
    const { getServerClient } = await import("../db/server-client");
    const sb = await getServerClient();
    await sb.from("orders").update({ status: "failed" }).in("id", orderIds);
    throw e;
  }

  // Pakasir return payment_number = QR string. Tidak ada pay_url terpisah
  // — client render QR sendiri. Untuk fallback, sediakan link "pay page"
  // Pakasir kalau client butuh.
  const qrString = pakasirData.payment_number;
  const qrLink: string | null = null;
  const payUrl = `${env.PAKASIR_BASE_URL}/pay/${env.PAKASIR_PROJECT}/${totalAmount}?order_id=${encodeURIComponent(paymentRef)}&qris_only=1${
    env.SITE_URL ? `&redirect=${encodeURIComponent(env.SITE_URL + "/checkout/success?ref=" + paymentRef)}` : ""
  }`;
  const trxId: string | null = null;

  // ─── 7. Attach payment metadata + redeem voucher ───────────────────────
  await attachPaymentToOrders(orderIds, paymentRef, payUrl, trxId, qrString);

  if (appliedVoucher) {
    // Best-effort. Kalau gagal, voucher.used tidak ke-increment tapi order
    // tetap di-create. Admin bisa adjust manual.
    try {
      await redeemVoucher(appliedVoucher.code);
    } catch {
      /* silent */
    }
  }

  return {
    paymentRef,
    payUrl,
    qrString,
    qrLink,
    trxId,
    subtotal,
    discount,
    adminFee,
    totalAmount,
    orderIds,
  };
}
