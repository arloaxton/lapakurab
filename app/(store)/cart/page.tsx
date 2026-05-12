"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { ProductTile } from "@/components/store/ProductTile";
import { Row } from "@/components/store/Row";
import { useToast } from "@/components/shared/ToastProvider";

const ADMIN_FEE = 0;

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQty,
    cartTotal,
    fmt,
    user,
    appliedVoucher,
    voucherDiscount,
    applyVoucherCode,
    removeVoucher,
  } = useStore();
  const toast = useToast();
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const handleApplyVoucher = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const result = await applyVoucherCode(voucherInput);
    if (result.ok) {
      toast.success("Voucher diterapkan", `Kode "${voucherInput.toUpperCase()}" aktif.`);
      setVoucherInput("");
      setVoucherError(null);
    } else {
      setVoucherError(result.error ?? "Voucher tidak valid");
    }
  };

  if (cart.length === 0) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "80px auto",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 16 }}>⛛</div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 36,
            fontWeight: 800,
            margin: "0 0 8px",
            color: "var(--ink)",
          }}
        >
          Keranjang masih kosong
        </h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: 24 }}>
          Yuk pilih akun favoritmu dulu!
        </p>
        <Link
          href="/catalog"
          style={{
            padding: "14px 28px",
            borderRadius: 999,
            border: 0,
            background: "var(--ink)",
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "inherit",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Mulai belanja →
        </Link>
      </div>
    );
  }

  const total = Math.max(0, cartTotal + ADMIN_FEE - voucherDiscount);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
      <h1
        className="lk-h1-mid"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          margin: "0 0 24px",
          color: "var(--ink)",
        }}
      >
        Keranjang kamu ({cart.length})
      </h1>

      <div className="lk-cart-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cart.map((it) => (
            <div
              key={it.key}
              className="lk-cart-line"
              style={{
                background: "var(--surface)",
                borderRadius: 20,
                padding: 16,
                border: "1.5px solid var(--border)",
                display: "flex",
                gap: 16,
                alignItems: "center",
              }}
            >
              <ProductTile hue={it.product.hue} emoji={it.product.emoji} size={80} rounded={14} />
              <div className="lk-cart-info" style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
                  {it.product.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
                  Durasi: {it.duration}
                  {" · "}
                  <span
                    style={{
                      fontWeight: 700,
                      color: it.accountType === "sharing" ? "#92400E" : "#1E40AF",
                    }}
                  >
                    {it.accountType === "sharing" ? "Sharing" : "Private"}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--primary)",
                    marginTop: 6,
                  }}
                >
                  {fmt(
                    (it.accountType === "sharing" && it.product.priceSharingIDR
                      ? it.product.priceSharingIDR
                      : it.product.priceIDR) * it.qty
                  )}
                </div>
              </div>
              <div
                className="lk-cart-qty"
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid var(--border)",
                  borderRadius: 999,
                }}
              >
                <button
                  type="button"
                  onClick={() => updateQty(it.key, it.qty - 1)}
                  style={{
                    width: 32,
                    height: 32,
                    border: 0,
                    background: "none",
                    fontSize: 16,
                    cursor: "pointer",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  −
                </button>
                <div
                  style={{
                    width: 32,
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--ink)",
                  }}
                >
                  {it.qty}
                </div>
                <button
                  type="button"
                  onClick={() => updateQty(it.key, it.qty + 1)}
                  style={{
                    width: 32,
                    height: 32,
                    border: 0,
                    background: "none",
                    fontSize: 16,
                    cursor: "pointer",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(it.key)}
                aria-label="Hapus"
                className="lk-cart-del"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: 0,
                  background: "#FEE2E2",
                  color: "#DC2626",
                  fontSize: 16,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <aside
          style={{
            background: "var(--surface)",
            borderRadius: 24,
            padding: 24,
            border: "1.5px solid var(--border)",
            alignSelf: "start",
            position: "sticky",
            top: 84,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "var(--ink)" }}>
            Ringkasan
          </div>

          {/* Voucher input */}
          {appliedVoucher ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: "rgba(127,231,199,0.18)",
                border: "1px solid rgba(15,139,92,0.3)",
                borderRadius: 10,
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 16 }}>🎟️</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--ink)",
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                  }}
                >
                  {appliedVoucher.code}
                </div>
                <div style={{ fontSize: 11, color: "#0F8B5C", fontWeight: 600 }}>
                  Hemat {fmt(voucherDiscount)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeVoucher();
                  toast.info("Voucher dihapus");
                }}
                aria-label="Hapus voucher"
                style={{
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  padding: 4,
                  fontFamily: "inherit",
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyVoucher} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  value={voucherInput}
                  onChange={(e) => {
                    setVoucherInput(e.target.value.toUpperCase());
                    if (voucherError) setVoucherError(null);
                  }}
                  placeholder="Kode voucher"
                  aria-label="Kode voucher"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1.5px solid ${voucherError ? "#DC2626" : "var(--border)"}`,
                    background: "var(--bg)",
                    fontSize: 13,
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                    outline: "none",
                    letterSpacing: "0.04em",
                  }}
                />
                <button
                  type="submit"
                  disabled={!voucherInput.trim()}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: 0,
                    cursor: voucherInput.trim() ? "pointer" : "not-allowed",
                    background: voucherInput.trim() ? "var(--ink)" : "var(--surface-2)",
                    color: voucherInput.trim() ? "white" : "var(--ink-soft)",
                    fontWeight: 600,
                    fontSize: 12,
                    fontFamily: "inherit",
                  }}
                >
                  Pakai
                </button>
              </div>
              {voucherError && (
                <div style={{ fontSize: 11, color: "#DC2626", marginTop: 6 }}>
                  {voucherError}
                </div>
              )}
            </form>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingBottom: 16,
              borderBottom: "1px dashed var(--border)",
              marginBottom: 16,
            }}
          >
            <Row label="Subtotal" value={fmt(cartTotal)} />
            <Row
              label="Diskon"
              value={"−" + fmt(voucherDiscount)}
              valueColor={voucherDiscount > 0 ? "#0F8B5C" : "var(--ink-soft)"}
            />
          </div>
          <Row label="Total" value={fmt(total)} bold />
          <Link
            href={user ? "/checkout" : "/login?next=/checkout"}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: 0,
              cursor: "pointer",
              background: "var(--primary)",
              color: "white",
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "inherit",
              boxShadow: "0 8px 24px rgba(255,107,157,0.4)",
              textAlign: "center",
              textDecoration: "none",
              display: "block",
              boxSizing: "border-box",
            }}
          >
            {user ? "Lanjut ke pembayaran →" : "Login dulu untuk checkout →"}
          </Link>
          <div
            style={{
              marginTop: 14,
              fontSize: 11,
              color: "var(--ink-soft)",
              textAlign: "center",
            }}
          >
            🔒 Pembayaran aman &amp; terenkripsi
            {!user && (
              <>
                <br />
                Belum punya akun?{" "}
                <Link
                  href="/register?next=/checkout"
                  style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}
                >
                  Daftar gratis
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
