"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "./AdminProvider";

const LS_DISMISSED = "lapakurab_onboarding_dismissed";
const SEED_CS_WA = "+62 812-3456-7890";

interface Task {
  id: string;
  label: string;
  done: boolean;
  href: string;
  optional?: boolean;
}

export function OnboardingChecklist() {
  const { products, settings, stock, gateways, vouchers, orders } = useAdmin();
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(LS_DISMISSED) === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const hasCustomCS = settings?.csWA && settings.csWA !== SEED_CS_WA;
  const enabledGateways = gateways.filter((g) => g.enabled).length;

  const tasks: Task[] = [
    {
      id: "product",
      label: "Tambah produk pertama",
      done: products.length > 8, // SEED has 8 products; >8 = added new
      href: "/admin/products",
    },
    {
      id: "cs",
      label: "Set nomor WhatsApp CS",
      done: !!hasCustomCS,
      href: "/admin/settings",
    },
    {
      id: "stock",
      label: "Tambah stok kredensial",
      done: stock.length > 5, // SEED has 5
      href: "/admin/stock",
    },
    {
      id: "gateway",
      label: "Aktifkan payment gateway",
      done: enabledGateways > 0,
      href: "/admin/gateways",
    },
    {
      id: "voucher",
      label: "Buat voucher promo",
      done: vouchers.length > 4, // SEED has 4
      href: "/admin/vouchers",
      optional: true,
    },
    {
      id: "order",
      label: "Terima pesanan pertama",
      done: orders.some((o) => o.status === "paid" || o.status === "delivered"),
      href: "/admin/orders",
    },
  ];

  const completed = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const allDone = completed === total;
  const requiredDone = tasks.filter((t) => !t.optional).every((t) => t.done);

  if (!hydrated || dismissed || allDone) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(LS_DISMISSED, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: open ? 320 : "auto",
        background: "var(--surface)",
        color: "var(--ink)",
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        border: "1px solid var(--border)",
        zIndex: 80,
        overflow: "hidden",
        transition: "width 0.2s ease",
      }}
    >
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "var(--ink)",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "var(--primary)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {completed}/{total}
          </span>
          <span>Setup toko</span>
        </button>
      )}

      {open && (
        <>
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                }}
              >
                Setup toko lo
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                {completed} dari {total} selesai
                {requiredDone ? " · Toko siap jalan" : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setOpen(false)}
                title="Minimize"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--ink-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <button
                onClick={dismiss}
                title="Tutup permanen"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--ink-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div style={{ height: 4, background: "var(--surface-2)" }}>
            <div
              style={{
                height: "100%",
                width: `${(completed / total) * 100}%`,
                background: "var(--primary)",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          <div
            style={{
              padding: "8px 8px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {tasks.map((t) =>
              t.done ? (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    color: "var(--ink)",
                    fontSize: 13,
                    opacity: 0.55,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "var(--success)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontWeight: 400,
                      textDecoration: "line-through",
                    }}
                  >
                    {t.label}
                  </span>
                </div>
              ) : (
                <Link
                  key={t.id}
                  href={t.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    color: "var(--ink)",
                    fontFamily: "inherit",
                    fontSize: 13,
                    transition: "background 0.15s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-2)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: "1.5px solid var(--border-strong)",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                  <span style={{ flex: 1, fontWeight: 500 }}>
                    {t.label}
                    {t.optional && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 10,
                          color: "var(--ink-soft)",
                          fontWeight: 400,
                        }}
                      >
                        · opsional
                      </span>
                    )}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ color: "var(--ink-soft)", flexShrink: 0 }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
