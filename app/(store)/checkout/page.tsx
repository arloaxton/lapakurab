"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/store/StoreProvider";
import { useToast } from "@/components/shared/ToastProvider";
import { ProductTile } from "@/components/store/ProductTile";
import { Row } from "@/components/store/Row";
import { useFormValidation } from "@/hooks/useFormValidation";
import * as v from "@/lib/validators";
import { PAYMENT_METHODS } from "@/lib/mock";
import { isSupabaseConfigured } from "@/backend/env";
import { createOrderClient } from "@/lib/data/orders-client";
import { redeemVoucherCode } from "@/lib/data/vouchers-client";
import { fetchPublicGateways, type PublicGateway } from "@/lib/data/settings-client";

interface CheckoutResponse {
  paymentRef: string;
  payUrl: string;
  qrString: string | null;
  qrLink: string | null;
  trxId: string | null;
  totalAmount: number;
  orderIds: string[];
}

const ADMIN_FEE = 2500;

interface CheckoutValues {
  email: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, fmt, clearCart, user, appliedVoucher, voucherDiscount } = useStore();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState("qris");
  const [paying, setPaying] = useState(false);
  const [hydrationDone, setHydrationDone] = useState(false);
  const [publicGateways, setPublicGateways] = useState<PublicGateway[] | null>(null);

  // Fetch enabled gateways dari /api/gateways/public. Fall back ke
  // PAYMENT_METHODS mock kalau API gagal atau Supabase belum di-konfig.
  useEffect(() => {
    let alive = true;
    fetchPublicGateways()
      .then((list) => {
        if (alive) setPublicGateways(list);
      })
      .catch(() => {
        if (alive) setPublicGateways([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Render list = irisan PAYMENT_METHODS (untuk metadata desc/tag/channel)
  // dengan publicGateways (filter enabled). Kalau publicGateways masih null
  // atau kosong, fallback ke PAYMENT_METHODS full.
  const enabledIds = publicGateways
    ? new Set(publicGateways.map((g) => g.id))
    : null;
  const methodList = enabledIds
    ? PAYMENT_METHODS.filter((m) => enabledIds.has(m.id))
    : PAYMENT_METHODS;

  // Kalau method yang di-set sebelumnya tidak ada di list, switch ke yang pertama.
  useEffect(() => {
    if (methodList.length === 0) return;
    if (!methodList.some((m) => m.id === method)) {
      setMethod(methodList[0].id);
    }
  }, [methodList, method]);

  const { values, errors, touched, setField, blur, validate, touchAll, setValues } =
    useFormValidation<CheckoutValues>(
      { email: user?.email || "", phone: user?.phone || "" },
      {
        email: v.email(),
        phone: v.phoneID(),
      }
    );
  const email = values.email;

  // Wait one tick for StoreProvider to hydrate from localStorage before
  // making auth/cart-empty redirects.
  useEffect(() => {
    const t = setTimeout(() => setHydrationDone(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Redirect to /cart if cart is empty (after hydration)
  useEffect(() => {
    if (!hydrationDone) return;
    if (cart.length === 0) router.replace("/cart");
  }, [hydrationDone, cart.length, router]);

  // Auth gate — must be logged in to checkout
  useEffect(() => {
    if (!hydrationDone) return;
    if (cart.length > 0 && user === null) {
      toast.warn("Login dulu yuk", "Buat akun atau masuk untuk lanjut ke pembayaran.");
      router.replace("/login?next=/checkout");
    }
  }, [hydrationDone, cart.length, user, router, toast]);

  // Sync form fields when user hydrates after mount
  useEffect(() => {
    if (user) {
      setValues((prev) => ({
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const total = Math.max(0, cartTotal + ADMIN_FEE - voucherDiscount);

  const goToStep2 = () => {
    if (!validate()) {
      touchAll();
      toast.error("Lengkapi info kontak", "Email & nomor WhatsApp wajib valid.");
      return;
    }
    setStep(2);
  };

  const handlePay = async () => {
    setPaying(true);

    // Mock mode: simulate gateway delay then redirect.
    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        clearCart();
        router.push(`/checkout/success?email=${encodeURIComponent(email)}`);
      }, 2400);
      return;
    }

    // Supabase + Tokopay mode: POST /api/checkout, redirect ke pay_url.
    try {
      const methodMeta = PAYMENT_METHODS.find((p) => p.id === method);
      const channel = methodMeta?.tokopayChannel;
      if (!channel) {
        throw new Error("Metode pembayaran tidak terhubung ke gateway.");
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: user?.name ?? values.email.split("@")[0],
          customerEmail: values.email,
          customerPhone: values.phone,
          paymentChannel: channel,
          voucherCode: appliedVoucher?.code ?? null,
          items: cart.map((line) => ({
            productId: line.product.id,
            productName: line.product.name,
            duration: line.duration,
            qty: line.qty,
            accountType: line.accountType,
            unitPriceIDR:
              line.accountType === "sharing" && line.product.priceSharingIDR
                ? line.product.priceSharingIDR
                : line.product.priceIDR,
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as
        | CheckoutResponse
        | { error?: string };
      if (!res.ok || !("payUrl" in data)) {
        throw new Error(
          ("error" in data && data.error) || "Checkout gagal di gateway"
        );
      }
      // Voucher.used sudah di-increment server-side di /api/checkout
      clearCart();
      // Redirect ke Tokopay (hosted payment page / e-wallet deeplink).
      // Sukses → Tokopay redirect ke /checkout/success?ref=PAYMENT_REF
      window.location.href = data.payUrl;
    } catch (e) {
      // Fallback: legacy flow create order langsung. Disable kalau Tokopay
      // belum di-konfig di server (server return 503).
      const msg = e instanceof Error ? e.message : "Pembayaran gagal";
      // Kalau gateway belum di-konfig, fallback ke flow lama (mark paid langsung).
      if (msg.includes("Payment gateway belum")) {
        try {
          const methodMeta = PAYMENT_METHODS.find((p) => p.id === method);
          const paymentLabel = methodMeta?.name ?? method;
          await Promise.all(
            cart.map((line) => {
              const linePrice =
                line.accountType === "sharing" && line.product.priceSharingIDR
                  ? line.product.priceSharingIDR
                  : line.product.priceIDR;
              return createOrderClient({
                productId: line.product.id,
                productName: line.product.name,
                duration: line.duration,
                qty: line.qty,
                totalIDR: linePrice * line.qty,
                accountType: line.accountType,
                customerName: user?.name ?? values.email.split("@")[0],
                customerEmail: values.email,
                customerPhone: values.phone || undefined,
                paymentMethod: paymentLabel,
                notes: appliedVoucher ? `voucher:${appliedVoucher.code}` : undefined,
              });
            })
          );
          if (appliedVoucher) {
            redeemVoucherCode(appliedVoucher.code).catch(() => {});
          }
          clearCart();
          router.push(`/checkout/success?email=${encodeURIComponent(email)}`);
          return;
        } catch (fallbackErr) {
          setPaying(false);
          toast.error(
            "Pembayaran gagal",
            fallbackErr instanceof Error
              ? fallbackErr.message
              : "Coba lagi sebentar."
          );
          return;
        }
      }
      setPaying(false);
      toast.error("Pembayaran gagal", msg);
    }
  };

  // Tahan render sampai hydration & auth confirmed
  if (!hydrationDone || cart.length === 0 || user === null) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 70px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-soft)",
          fontSize: 13,
        }}
      >
        Memuat checkout…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      <h1
        className="lk-h1-mid"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          margin: "0 0 8px",
          color: "var(--ink)",
        }}
      >
        Checkout
      </h1>

      {/* Stepper */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
          marginTop: 16,
        }}
      >
        {["Info", "Pembayaran", "Selesai"].map((label, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", flex: i < 2 ? "0 0 auto" : "0 0 auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background:
                    step > i ? "var(--mint)" : step === i + 1 ? "var(--ink)" : "var(--border)",
                  color: step >= i + 1 ? (step > i ? "var(--ink)" : "white") : "var(--ink-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {step > i ? "✓" : i + 1}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: step === i + 1 ? 700 : 500,
                  color: step >= i + 1 ? "var(--ink)" : "var(--ink-soft)",
                }}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  width: 80,
                  marginLeft: 12,
                  marginRight: 0,
                  height: 2,
                  background: step > i + 1 ? "var(--mint)" : "var(--border)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="lk-checkout-grid">
        <div
          style={{
            background: "var(--surface)",
            borderRadius: 24,
            padding: 24,
            border: "1.5px solid var(--border)",
          }}
        >
          {step === 1 && (
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 16,
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                }}
              >
                Info kontak
              </div>
              <CheckoutField
                label="Email"
                value={values.email}
                onChange={(v) => setField("email", v)}
                onBlur={() => blur("email")}
                error={touched.email ? errors.email : null}
                placeholder="kamu@email.com"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
              />
              <CheckoutField
                label="No. WhatsApp"
                value={values.phone}
                onChange={(v) => setField("phone", v)}
                onBlur={() => blur("phone")}
                error={touched.phone ? errors.phone : null}
                placeholder="08xxxxxxx"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
              />
              <div
                style={{
                  padding: 12,
                  background: "rgba(127,231,199,0.2)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  marginTop: 12,
                }}
              >
                💌 Akun akan dikirim ke email &amp; WhatsApp ini. Pastikan benar ya!
              </div>
              <button
                onClick={goToStep2}
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: 0,
                  cursor: "pointer",
                  background: "var(--ink)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: "inherit",
                }}
              >
                Lanjut ke pembayaran →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 16,
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                }}
              >
                Pilih metode pembayaran
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {methodList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className="lk-pay-item"
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      cursor: "pointer",
                      textAlign: "left",
                      border:
                        method === m.id
                          ? "2px solid var(--primary)"
                          : "1.5px solid var(--border)",
                      background: method === m.id ? "rgba(255,107,157,0.06)" : "var(--surface)",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      fontFamily: "inherit",
                    }}
                  >
                    <div
                      className="lk-pay-item-icon"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, oklch(0.85 0.12 ${m.id.length * 30}), oklch(0.78 0.14 ${(m.id.length * 30 + 50) % 360}))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 800,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{m.desc}</div>
                    </div>
                    {m.tag && (
                      <div
                        className="lk-pay-item-tag"
                        style={{
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "var(--mint)",
                          color: "var(--ink)",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {m.tag}
                      </div>
                    )}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border:
                          method === m.id
                            ? "6px solid var(--primary)"
                            : "2px solid var(--border)",
                      }}
                    />
                  </button>
                ))}
              </div>

              {method === "qris" && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 20,
                    background: "#F8F5FF",
                    borderRadius: 16,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 10, color: "var(--ink)" }}>
                    Scan QRIS
                  </div>
                  <div
                    style={{
                      width: 160,
                      height: 160,
                      margin: "0 auto",
                      borderRadius: 14,
                      background: "white",
                      backgroundImage: `
                        linear-gradient(45deg, var(--ink) 25%, transparent 25%),
                        linear-gradient(-45deg, var(--ink) 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, var(--ink) 75%),
                        linear-gradient(-45deg, transparent 75%, var(--ink) 75%)`,
                      backgroundSize: "14px 14px",
                      backgroundPosition: "0 0, 0 7px, 7px -7px, -7px 0px",
                      border: "2px solid var(--ink)",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        background: "white",
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 11,
                          color: "var(--ink)",
                        }}
                      >
                        QRIS
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 10 }}
                  >
                    Berlaku 15 menit
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: "14px 20px",
                    borderRadius: 14,
                    cursor: "pointer",
                    border: "1.5px solid var(--border)",
                    background: "transparent",
                    color: "var(--ink)",
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: "inherit",
                  }}
                >
                  ← Kembali
                </button>
                <button
                  onClick={handlePay}
                  disabled={paying}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: 14,
                    border: 0,
                    cursor: paying ? "wait" : "pointer",
                    background: paying ? "var(--ink-soft)" : "var(--primary)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 15,
                    fontFamily: "inherit",
                    boxShadow: "0 8px 24px rgba(255,107,157,0.4)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {paying ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "tk-spin 0.8s linear infinite",
                          display: "inline-block",
                        }}
                      />
                      Memproses...
                    </span>
                  ) : (
                    `Bayar ${fmt(total)} →`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside
          style={{
            background: "var(--surface)",
            borderRadius: 24,
            padding: 20,
            border: "1.5px solid var(--border)",
            alignSelf: "start",
          }}
        >
          <div
            style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--ink)" }}
          >
            Ringkasan pesanan
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 14,
              paddingBottom: 14,
              borderBottom: "1px dashed var(--border)",
            }}
          >
            {cart.map((it) => (
              <div
                key={it.key}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <ProductTile hue={it.product.hue} emoji={it.product.emoji} size={40} rounded={10} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "var(--ink)",
                    }}
                  >
                    {it.product.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                    {it.duration} × {it.qty}
                  </div>
                </div>
                <div
                  style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}
                >
                  {fmt(it.product.priceIDR * it.qty)}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 14,
              paddingBottom: 14,
              borderBottom: "1px dashed var(--border)",
            }}
          >
            <Row label="Subtotal" value={fmt(cartTotal)} />
            <Row label="Biaya admin" value={fmt(ADMIN_FEE)} />
            {appliedVoucher && (
              <Row
                label={`Voucher · ${appliedVoucher.code}`}
                value={"−" + fmt(voucherDiscount)}
                valueColor="#0F8B5C"
              />
            )}
          </div>
          <Row label="Total" value={fmt(total)} bold />
        </aside>
      </div>
    </div>
  );
}

interface CheckoutFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal" | "url";
  autoComplete?: string;
  error?: string | null;
  required?: boolean;
}
function CheckoutField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  error,
  required,
}: CheckoutFieldProps) {
  const hasError = !!error;
  const fieldId = `chkfield-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        htmlFor={fieldId}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ink-soft)",
          display: "flex",
          gap: 4,
          marginBottom: 6,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#DC2626" }} aria-label="wajib diisi">
            *
          </span>
        )}
      </label>
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onBlur?.()}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${fieldId}-err` : undefined}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: `1.5px solid ${hasError ? "#DC2626" : "var(--border)"}`,
          background: "var(--bg)",
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
          color: "var(--ink)",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = hasError ? "#DC2626" : "var(--primary)")
        }
      />
      {hasError && (
        <div
          id={`${fieldId}-err`}
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 5,
            fontSize: 11,
            color: "#DC2626",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
