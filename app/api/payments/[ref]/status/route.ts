/**
 * Polling endpoint untuk customer cek status pembayaran.
 *
 * Authenticated user pemilik order (RLS otomatis filter user_id).
 * Return: status global ('pending' | 'paid' | 'delivered' | 'refunded' | 'failed')
 * dan list order ringkas. Optional: re-sync via Pakasir status check kalau
 * stuck pending lebih dari X menit.
 */

import { NextResponse } from "next/server";
import { isSupabaseConfigured, isPakasirConfigured } from "@/backend/env";
import { getCurrentSession } from "@/backend/services/auth";
import {
  findOrdersByPaymentRef,
  settlePaymentRef,
} from "@/lib/data/orders-repo";
import { checkPakasirStatus } from "@/backend/services/payments/pakasir";

interface Ctx {
  params: Promise<{ ref: string }>;
}

export async function GET(req: Request, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Backend belum di-konfigurasi" }, { status: 503 });
  }
  try {
    const { ref } = await params;
    const sess = await getCurrentSession();
    if (!sess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await findOrdersByPaymentRef(ref);
    if (orders.length === 0) {
      return NextResponse.json({ error: "Payment ref tidak ditemukan" }, { status: 404 });
    }

    // Authorization: user hanya boleh lihat ref milik sendiri (kecuali admin)
    const isOwner = orders.every((o) => o.user_id === sess.user.id);
    if (!isOwner && sess.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Auto-resync: kalau ada poll-side dan masih pending, cek Pakasir langsung.
    const url = new URL(req.url);
    const wantSync = url.searchParams.get("sync") === "1";
    if (wantSync && orders.some((o) => o.status === "pending") && isPakasirConfigured()) {
      try {
        // Total amount untuk re-verify: ambil dari order pertama.total_idr
        // (semua order di payment_ref ini share total Pakasir = total order pertama
        // + biaya extra; tapi createTransaction pakai totalAmount=subtotal-disc+fee).
        // Idealnya pakai total_idr semua order yang sama dengan amount Pakasir.
        const totalAmount = orders.reduce((s, o) => s + o.total_idr, 0);
        const tk = await checkPakasirStatus(ref, totalAmount);
        if (tk.status?.toLowerCase() === "completed") {
          await settlePaymentRef(ref);
        }
      } catch {
        // silent
      }
    }

    // Re-fetch setelah potential settle
    const refreshed = wantSync ? await findOrdersByPaymentRef(ref) : orders;

    // Aggregate status: kalau semua delivered → delivered. Kalau semua paid → paid.
    // Kalau ada pending → pending. Kalau ada failed → failed.
    const statuses = new Set(refreshed.map((o) => o.status));
    let aggregate: string;
    if (statuses.has("failed")) aggregate = "failed";
    else if (statuses.has("pending")) aggregate = "pending";
    else if (statuses.has("paid")) aggregate = "paid";
    else if (statuses.has("delivered")) aggregate = "delivered";
    else aggregate = refreshed[0].status;

    return NextResponse.json({
      paymentRef: ref,
      status: aggregate,
      orders: refreshed.map((o) => ({
        id: o.id,
        productName: o.product_name,
        duration: o.duration,
        total: o.total_idr,
        status: o.status,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal cek status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
