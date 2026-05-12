"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { ProductTile } from "@/components/store/ProductTile";
import { Footer } from "@/components/store/Footer";
import { AuthFormField } from "@/components/store/AuthFormField";
import { useToast } from "@/components/shared/ToastProvider";
import { Pagination } from "@/components/shared/Pagination";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { useCopy } from "@/hooks/useCopy";
import { usePagination } from "@/hooks/usePagination";
import { PRODUCTS } from "@/lib/mock";
import { CUSTOMER_ORDERS as MOCK_CUSTOMER_ORDERS } from "@/lib/mock/customer-orders";
import { fetchMyOrders } from "@/lib/data/orders-client";
import { fetchMyCredentials, type MyCredential } from "@/lib/data/stock-client";
import { isSupabaseConfigured } from "@/backend/env";
import type { CustomerOrder } from "@/lib/types";

type DashboardTab = "orders" | "active" | "profile" | "help";

const TABS: { id: DashboardTab; l: string }[] = [
  { id: "orders", l: "Overview" },
  { id: "active", l: "Langganan aktif" },
  { id: "profile", l: "Profil & keamanan" },
  { id: "help", l: "Pusat bantuan" },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { user, setUser, fmt } = useStore();
  const toast = useToast();
  const copy = useCopy();
  const confirm = useConfirm();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const tab = (sp.get("tab") as DashboardTab) || "orders";

  const toggleReveal = (id: string) =>
    setRevealed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const handleSaveProfile = () => {
    if (!user) return;
    if (!user.name || user.name.trim().length < 2) {
      toast.error("Nama tidak valid", "Nama minimal 2 karakter.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      toast.error("Email tidak valid", "Periksa format email kamu.");
      return;
    }
    if (user.phone && !/^(\+?62|0)8\d{7,12}$/.test(user.phone.replace(/[\s-]/g, ""))) {
      toast.error("Nomor WhatsApp tidak valid", "Format harus 08xxx atau +62 8xxx.");
      return;
    }
    toast.success("Profil tersimpan", "Perubahan info kontak berhasil diterapkan.");
  };

  const handleSecurityAction = (label: string) => {
    toast.info(
      `${label}…`,
      "Fitur ini di-mock untuk demo. Di production akan buka modal verifikasi."
    );
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm({
      title: "Hapus akun?",
      description:
        "Semua data lapakurab kamu akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.",
      confirmLabel: "Hapus akun",
      cancelLabel: "Batal",
      danger: true,
    });
    if (!ok) return;
    toast.warn("Akun dihapus", "Anda akan logout dalam 2 detik.");
    setTimeout(() => {
      setUser(null);
      router.push("/");
    }, 1800);
  };

  const handleHelp = (kind: "wa" | "email" | "status") => {
    if (kind === "wa") window.open("https://wa.me/6281234567890", "_blank", "noopener");
    else if (kind === "email") window.open("mailto:cs@lapakurab.id", "_blank", "noopener");
    else toast.success("Status sistem", "Semua sistem operasional normal.", { duration: 2400 });
  };

  // Redirect to login if not authed (after hydration completed)
  useEffect(() => {
    if (user === null) {
      // Wait a tick — user may still be hydrating from localStorage
      const t = setTimeout(() => {
        if (user === null) router.replace("/login");
      }, 50);
      return () => clearTimeout(t);
    }
  }, [user, router]);

  const [orders, setOrders] = useState<CustomerOrder[]>(
    isSupabaseConfigured() ? [] : MOCK_CUSTOMER_ORDERS
  );
  const [credentials, setCredentials] = useState<MyCredential[]>([]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchMyOrders()
      .then((list) => {
        if (alive) setOrders(list);
      })
      .catch(() => {});
    fetchMyCredentials()
      .then((list) => {
        if (alive) setCredentials(list);
      })
      .catch(() => {});

    // Realtime: refresh orders + creds saat ada UPDATE di order milik user.
    let cleanup: (() => void) | null = null;
    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const { getBrowserClient } = await import("@/backend/db/client");
          const sb = getBrowserClient();
          const channel = sb
            .channel(`my-orders-${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "orders",
                filter: `user_id=eq.${user.id}`,
              },
              () => {
                // Re-fetch list (RLS sudah filter own orders)
                fetchMyOrders().then((list) => {
                  if (alive) setOrders(list);
                });
                fetchMyCredentials().then((list) => {
                  if (alive) setCredentials(list);
                });
              }
            )
            .subscribe();
          cleanup = () => sb.removeChannel(channel);
        } catch {
          /* fallback ke polling biasa kalau realtime gagal */
        }
      })();
    }

    return () => {
      alive = false;
      cleanup?.();
    };
  }, [user]);

  const credByOrder = new Map<string, MyCredential>();
  for (const c of credentials) credByOrder.set(c.orderId, c);
  /** Backward-compat helper — return field1 sebagai "email" + field2 sebagai
   *  "password" untuk UI lama. Yang baru tampilkan semua field via creds.field1/field2. */
  const credFor = (orderId: string): { email: string; password: string } => {
    const real = credByOrder.get(orderId);
    if (real) return { email: real.field1, password: real.field2 || "—" };
    // Not yet delivered: placeholder.
    return {
      email: `user•${orderId.slice(-3)}@stream.mail`,
      password: `pw•${orderId.slice(-3)}#X9k`,
    };
  };

  // Hooks must run before any early return — keep above the loading guard.
  const ordersPaged = usePagination(orders, 8);

  if (!user) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 70px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          color: "var(--ink-soft)",
        }}
      >
        Loading…
      </div>
    );
  }

  const setTab = (id: DashboardTab) => {
    const params = new URLSearchParams(sp.toString());
    if (id === "orders") params.delete("tab");
    else params.set("tab", id);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const activeOrders = orders.filter((o) => o.status === "Aktif");
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const nextRenewal = activeOrders.reduce<{
    daysLeft: number;
    product: string;
    duration?: string;
  }>(
    (min, o) => (o.daysLeft < min.daysLeft ? o : min),
    activeOrders[0] || { daysLeft: 0, product: "-" }
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px" }}>
      <div className="lk-sidebar-narrow">
        {/* Sidebar */}
        <aside className="lk-dash-sidebar" style={{ alignSelf: "start", position: "sticky", top: 84 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
              padding: "10px 12px",
              borderRadius: 12,
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 600,
                fontSize: 13,
                fontFamily: "var(--font-display)",
              }}
            >
              {user.name[0]}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "var(--ink)",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-soft)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.email}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--ink-soft)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0 12px 8px",
            }}
          >
            Akun
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 16 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: tab === t.id ? "var(--surface)" : "transparent",
                  color: "var(--ink)",
                  fontWeight: tab === t.id ? 600 : 500,
                  fontSize: 13,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: "inherit",
                  boxShadow: tab === t.id ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
                  border: tab === t.id ? "1px solid var(--border)" : "1px solid transparent",
                }}
              >
                <span>{t.l}</span>
                {t.id === "active" && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--ink-soft)",
                      background: "var(--surface-2)",
                      padding: "1px 6px",
                      borderRadius: 6,
                    }}
                  >
                    {activeOrders.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setUser(null);
              router.push("/");
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: 0,
              background: "transparent",
              color: "var(--ink-soft)",
              fontWeight: 500,
              fontSize: 13,
              textAlign: "left",
              cursor: "pointer",
              width: "100%",
              fontFamily: "inherit",
            }}
          >
            Keluar →
          </button>
        </aside>

        {/* Content */}
        <div style={{ minWidth: 0 }}>
          {tab === "orders" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-soft)",
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Selamat datang kembali
                </div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 30,
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    margin: 0,
                    color: "var(--ink)",
                  }}
                >
                  {user.name.split(" ")[0]} 👋
                </h1>
              </div>

              {/* Hero status card */}
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  padding: 24,
                  marginBottom: 24,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "3px 10px",
                      borderRadius: 6,
                      background: "rgba(15,139,92,0.1)",
                      color: "#0F8B5C",
                      fontSize: 11,
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0F8B5C" }} />
                    {activeOrders.length} langganan aktif
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      marginBottom: 6,
                      color: "var(--ink)",
                    }}
                  >
                    Perpanjangan berikutnya dalam {nextRenewal.daysLeft} hari
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                    {nextRenewal.product} · {nextRenewal.duration || ""}
                  </div>
                </div>
                <Link
                  href="/catalog"
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: 0,
                    cursor: "pointer",
                    background: "var(--ink)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 13,
                    fontFamily: "inherit",
                    textDecoration: "none",
                  }}
                >
                  + Beli langganan baru
                </Link>
              </div>

              {/* Stat tiles */}
              <div
                className="lk-grid-4"
                style={{
                  gap: 12,
                  marginBottom: 32,
                }}
              >
                {[
                  { l: "Total order", n: String(orders.length), sub: "sepanjang waktu", big: false },
                  { l: "Aktif", n: String(activeOrders.length), sub: "langganan berjalan", big: false },
                  { l: "Total belanja", n: fmt(totalSpent), sub: "sepanjang waktu", big: true },
                  { l: "Total hemat", n: fmt(285000), sub: "vs harga retail", big: true },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--ink-soft)",
                        marginBottom: 8,
                      }}
                    >
                      {s.l}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: s.big ? 18 : 24,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        color: "var(--ink)",
                      }}
                    >
                      {s.n}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Orders table */}
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    margin: 0,
                    color: "var(--ink)",
                  }}
                >
                  Riwayat order
                </h2>
                <button
                  onClick={() => toast.info("Filter", "Filter lanjutan akan tersedia di update berikutnya.")}
                  style={{
                    background: "none",
                    border: 0,
                    color: "var(--ink-soft)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Filter ▾
                </button>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="lk-table-grid-row lk-orders-head"
                  style={{
                    padding: "12px 16px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--ink-soft)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <div>Produk</div>
                  <div>Order ID</div>
                  <div>Tanggal</div>
                  <div>Total</div>
                  <div>Status</div>
                  <div></div>
                </div>
                {ordersPaged.items.map((o, i) => {
                  const prod = PRODUCTS.find((p) => p.name === o.product) || PRODUCTS[0];
                  return (
                    <div
                      key={o.id}
                      className="lk-orders-row"
                      style={{
                        padding: "14px 16px",
                        alignItems: "center",
                        fontSize: 13,
                        borderBottom: i < ordersPaged.items.length - 1 ? "1px solid var(--border)" : 0,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ProductTile hue={prod.hue} emoji={prod.emoji} size={32} rounded={6} />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: "var(--ink)",
                            }}
                          >
                            {o.product}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{o.duration}</div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: "var(--font-mono), ui-monospace, monospace",
                          color: "var(--ink-soft)",
                        }}
                      >
                        {o.id}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{o.date}</div>
                      <div
                        style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}
                      >
                        {fmt(o.total)}
                      </div>
                      <div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "2px 8px",
                            borderRadius: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            background: o.status === "Aktif" ? "rgba(15,139,92,0.1)" : "var(--surface-2)",
                            color: o.status === "Aktif" ? "#0F8B5C" : "var(--ink-soft)",
                            border: `1px solid ${
                              o.status === "Aktif" ? "rgba(15,139,92,0.2)" : "var(--border)"
                            }`,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: o.status === "Aktif" ? "#0F8B5C" : "var(--ink-soft)",
                            }}
                          />
                          {o.status}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <button
                          onClick={() => copy(o.id, "Order ID")}
                          title="Salin Order ID"
                          style={{
                            background: "none",
                            border: 0,
                            color: "var(--ink-soft)",
                            fontSize: 13,
                            cursor: "pointer",
                            padding: 4,
                          }}
                        >
                          ⋯
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination api={ordersPaged} />
            </div>
          )}

          {tab === "active" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 24,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    margin: "0 0 6px",
                    color: "var(--ink)",
                  }}
                >
                  Langganan aktif
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: 0 }}>
                  Kelola akses akun, lihat kredensial, dan perpanjang langganan.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activeOrders.map((o) => {
                  const prod = PRODUCTS.find((p) => p.name === o.product) || PRODUCTS[0];
                  const pct = Math.min(100, Math.max(0, (o.daysLeft / 365) * 100));
                  const expiringSoon = o.daysLeft < 14;
                  return (
                    <div
                      key={o.id}
                      style={{
                        background: "var(--surface)",
                        borderRadius: 12,
                        padding: 20,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="lk-sub-header"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          marginBottom: 16,
                        }}
                      >
                        <ProductTile hue={prod.hue} emoji={prod.emoji} size={44} rounded={10} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className="lk-sub-name-row"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
                              {prod.name}
                            </div>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "1px 7px",
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                background: expiringSoon
                                  ? "rgba(217,119,6,0.1)"
                                  : "rgba(15,139,92,0.1)",
                                color: expiringSoon ? "#B45309" : "#0F8B5C",
                                border: `1px solid ${
                                  expiringSoon ? "rgba(217,119,6,0.2)" : "rgba(15,139,92,0.2)"
                                }`,
                              }}
                            >
                              <span
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: expiringSoon ? "#B45309" : "#0F8B5C",
                                }}
                              />
                              {expiringSoon ? "Akan berakhir" : "Aktif"}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                            {o.duration} · Order {o.id}
                          </div>
                        </div>
                        <div className="lk-sub-days" style={{ textAlign: "right", flexShrink: 0 }}>
                          <div
                            className="lk-sub-days-num"
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 600,
                              fontSize: 18,
                              fontVariantNumeric: "tabular-nums",
                              color: "var(--ink)",
                            }}
                          >
                            {o.daysLeft}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>hari tersisa</div>
                        </div>
                      </div>

                      <div
                        style={{
                          height: 4,
                          background: "var(--surface-2)",
                          borderRadius: 999,
                          overflow: "hidden",
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: expiringSoon ? "#D97706" : "#0F8B5C",
                          }}
                        />
                      </div>

                      <div
                        className="lk-sub-creds"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            background: "var(--surface-2)",
                            borderRadius: 8,
                            padding: "10px 12px",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--ink-soft)",
                              marginBottom: 3,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                            }}
                          >
                            Email
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono), ui-monospace, monospace",
                              fontSize: 12,
                              fontWeight: 500,
                              color: "var(--ink)",
                            }}
                          >
                            {credFor(o.id).email}
                          </div>
                        </div>
                        <div
                          style={{
                            background: "var(--surface-2)",
                            borderRadius: 8,
                            padding: "10px 12px",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--ink-soft)",
                              marginBottom: 3,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                            }}
                          >
                            Password
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono), ui-monospace, monospace",
                              fontSize: 12,
                              fontWeight: 500,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              color: "var(--ink)",
                            }}
                          >
                            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {revealed.has(o.id) ? credFor(o.id).password : "••••••••"}
                            </span>
                            <button
                              onClick={() => toggleReveal(o.id)}
                              style={{
                                background: "none",
                                border: 0,
                                color: "var(--ink-soft)",
                                cursor: "pointer",
                                fontSize: 11,
                                fontWeight: 500,
                                padding: 0,
                                fontFamily: "inherit",
                              }}
                            >
                              {revealed.has(o.id) ? "Sembunyi" : "Lihat"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => {
                            const c = credFor(o.id);
                            copy(`Email: ${c.email}\nPassword: ${c.password}`, "Kredensial");
                          }}
                          style={{
                            flex: 1,
                            padding: "9px 14px",
                            borderRadius: 8,
                            border: "1px solid var(--border)",
                            cursor: "pointer",
                            background: "var(--surface)",
                            color: "var(--ink)",
                            fontWeight: 500,
                            fontSize: 12,
                            fontFamily: "inherit",
                          }}
                        >
                          Salin kredensial
                        </button>
                        <button
                          onClick={() => router.push(`/products/${prod.id}`)}
                          style={{
                            flex: 1,
                            padding: "9px 14px",
                            borderRadius: 8,
                            border: 0,
                            cursor: "pointer",
                            background: "var(--ink)",
                            color: "white",
                            fontWeight: 500,
                            fontSize: 12,
                            fontFamily: "inherit",
                          }}
                        >
                          {expiringSoon ? "Perpanjang sekarang" : "Perpanjang"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "profile" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 24,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    margin: "0 0 6px",
                    color: "var(--ink)",
                  }}
                >
                  Profil &amp; keamanan
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: 0 }}>
                  Update info kontak dan kelola password akun lapakurab kamu.
                </p>
              </div>

              <div className="lk-grid-2">
                <div
                  style={{
                    background: "var(--surface)",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                      Informasi kontak
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>
                      Dipakai untuk kirim invoice &amp; info akun.
                    </div>
                  </div>
                  <div style={{ padding: 18 }}>
                    <AuthFormField
                      label="Nama"
                      value={user.name}
                      onChange={(v) => setUser({ ...user, name: v })}
                    />
                    <AuthFormField
                      label="Email"
                      value={user.email}
                      onChange={(v) => setUser({ ...user, email: v })}
                    />
                    <AuthFormField
                      label="No. WhatsApp"
                      value={user.phone || ""}
                      onChange={(v) => setUser({ ...user, phone: v })}
                    />
                    <button
                      onClick={handleSaveProfile}
                      style={{
                        marginTop: 4,
                        padding: "9px 16px",
                        borderRadius: 8,
                        border: 0,
                        cursor: "pointer",
                        background: "var(--ink)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: 12,
                        fontFamily: "inherit",
                      }}
                    >
                      Simpan perubahan
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div
                    style={{
                      background: "var(--surface)",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "14px 18px",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                        Keamanan
                      </div>
                    </div>
                    <div style={{ padding: 18 }}>
                      {[
                        { l: "Password", s: "Terakhir diubah 2 bulan lalu", a: "Ubah" },
                        { l: "2-Factor auth", s: "Belum aktif", a: "Aktifkan" },
                        { l: "Sesi aktif", s: "2 perangkat", a: "Kelola" },
                      ].map((r, i, arr) => (
                        <div
                          key={r.l}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 0",
                            borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : 0,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13, color: "var(--ink)" }}>
                              {r.l}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.s}</div>
                          </div>
                          <button
                            onClick={() => handleSecurityAction(r.l)}
                            style={{
                              background: "none",
                              border: "1px solid var(--border)",
                              color: "var(--ink)",
                              padding: "5px 10px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {r.a}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--surface)",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        marginBottom: 4,
                        color: "var(--ink)",
                      }}
                    >
                      Zona berbahaya
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 12 }}>
                      Hapus akun lapakurab beserta semua data secara permanen.
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        background: "none",
                        border: "1px solid #DC2626",
                        color: "#DC2626",
                        padding: "7px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Hapus akun
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "help" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 24,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    margin: "0 0 6px",
                    color: "var(--ink)",
                  }}
                >
                  Pusat bantuan
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: 0 }}>
                  Punya kendala? Cari jawaban di FAQ atau langsung chat support kami.
                </p>
              </div>

              <div
                className="lk-grid-3"
                style={{
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {[
                  { l: "Chat WhatsApp", s: "Avg. 2 menit", a: "Buka →", ok: false, kind: "wa" as const },
                  { l: "Email support", s: "Avg. 4 jam", a: "Kirim →", ok: false, kind: "email" as const },
                  { l: "Status sistem", s: "Semua sistem normal", a: "Lihat →", ok: true, kind: "status" as const },
                ].map((c) => (
                  <div
                    key={c.l}
                    style={{
                      background: "var(--surface)",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      {c.ok && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#0F8B5C",
                          }}
                        />
                      )}
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                        {c.l}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 10 }}>
                      {c.s}
                    </div>
                    <button
                      onClick={() => handleHelp(c.kind)}
                      style={{
                        background: "none",
                        border: 0,
                        color: "var(--ink)",
                        padding: 0,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {c.a}
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 12 }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 14,
                    fontWeight: 600,
                    margin: 0,
                    color: "var(--ink)",
                  }}
                >
                  Pertanyaan umum
                </h2>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    q: "Akun saya tidak bisa login. Apa yang harus saya lakukan?",
                    a: "Coba reset password via dashboard kamu, atau chat CS untuk garansi instan dalam < 10 menit.",
                  },
                  {
                    q: "Berapa lama pengiriman setelah pembayaran?",
                    a: "Otomatis dalam 5 menit setelah pembayaran sukses. Jika lebih, hubungi support.",
                  },
                  {
                    q: "Apakah saya bisa refund?",
                    a: "Bisa, selama akun belum dipakai atau ada kendala teknis dari sisi kami dalam 24 jam pertama.",
                  },
                  {
                    q: "Sampai kapan garansi berlaku?",
                    a: "Selama masa aktif paket yang kamu beli. Akun bermasalah? Kami ganti gratis.",
                  },
                  {
                    q: "Apakah satu akun bisa dipakai banyak orang?",
                    a: "Tergantung paket. Cek detail di halaman produk masing-masing — tertulis berapa profil/device yang didukung.",
                  },
                ].map((f, i, arr) => (
                  <details
                    key={i}
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : 0 }}
                  >
                    <summary
                      style={{
                        padding: "14px 18px",
                        cursor: "pointer",
                        fontWeight: 500,
                        fontSize: 13,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        listStyle: "none",
                        color: "var(--ink)",
                      }}
                    >
                      <span>{f.q}</span>
                      <span style={{ color: "var(--ink-soft)", fontSize: 14 }}>+</span>
                    </summary>
                    <div
                      style={{
                        padding: "0 18px 14px",
                        fontSize: 13,
                        color: "var(--ink-soft)",
                        lineHeight: 1.6,
                      }}
                    >
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
