"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAdmin } from "./AdminProvider";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/ToastProvider";
import { relTime } from "@/lib/format";
import type { NotificationKind } from "@/lib/types";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: "M3 12l2-2 4 4 8-8 2 2-10 10-6-6z" },
  { id: "products", label: "Produk", href: "/admin/products", icon: "M20 7L12 3 4 7v10l8 4 8-4V7zM12 12L4 8m8 4l8-4m-8 4v9" },
  { id: "categories", label: "Kategori", href: "/admin/categories", icon: "M4 6h16M4 12h16M4 18h16" },
  { id: "orders", label: "Pesanan", href: "/admin/orders", icon: "M9 11l3 3 8-8M3 12c0 5 4 9 9 9s9-4 9-9-4-9-9-9" },
  { id: "stock", label: "Stok akun", href: "/admin/stock", icon: "M21 8v13H3V8M1 3h22v5H1zM10 12h4" },
  { id: "users", label: "Member", href: "/admin/users", icon: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { id: "vouchers", label: "Voucher", href: "/admin/vouchers", icon: "M2 9V7a2 2 0 012-2h16a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 000-4zm7 0v6" },
  { id: "gateways", label: "Pembayaran", href: "/admin/gateways", icon: "M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22" },
  { id: "audit", label: "Activity log", href: "/admin/audit", icon: "M12 8v4l3 3M3 12a9 9 0 1018 0 9 9 0 00-18 0z" },
  { id: "settings", label: "Settings", href: "/admin/settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.5 7.5 0 00-.1-1.4l2-1.6-2-3.4-2.4.9a7.4 7.4 0 00-2.4-1.4L14 2h-4l-.5 2.6a7.4 7.4 0 00-2.4 1.4l-2.4-.9-2 3.4 2 1.6a7.5 7.5 0 000 2.8l-2 1.6 2 3.4 2.4-.9a7.4 7.4 0 002.4 1.4L10 22h4l.5-2.6a7.4 7.4 0 002.4-1.4l2.4.9 2-3.4-2-1.6c.07-.46.1-.93.1-1.4z" },
];

const NOTIF_PALETTE: Record<NotificationKind | "info", string> = {
  order: "var(--primary)",
  success: "var(--success)",
  warn: "var(--warn)",
  danger: "var(--danger)",
  info: "var(--ink-soft)",
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout, resetData, notifications, markNotifRead, markAllNotifsRead, darkMode, toggleDark } = useAdmin();
  const confirm = useConfirm();
  const toast = useToast();
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const handleResetData = async () => {
    const ok = await confirm({
      title: "Reset semua data demo?",
      description:
        "Produk, pesanan, stok, member, voucher, gateway, audit log — semua dikembalikan ke data awal.",
      confirmLabel: "Reset data",
      danger: true,
    });
    if (!ok) return;
    resetData();
    toast.success("Data demo di-reset", "Semua data dikembalikan ke seed.");
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Keluar dari admin panel?",
      description: "Sesi admin saat ini akan ditutup.",
      confirmLabel: "Keluar",
    });
    if (!ok) return;
    logout();
  };

  const current = NAV_ITEMS.find((n) => isActive(pathname, n.href)) || NAV_ITEMS[0];

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-notif-bell]")) setNotifOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [notifOpen]);

  // Close drawer when route changes (user navigated via sidebar link)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  // Lock body scroll when drawer open (mobile)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("lk-no-scroll");
      return () => document.body.classList.remove("lk-no-scroll");
    }
  }, [sidebarOpen]);

  return (
    <div
      className="lk-admin-shell"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        color: "var(--ink)",
      }}
    >
      {/* Mobile backdrop */}
      <div
        className="lk-admin-backdrop"
        data-open={sidebarOpen ? "true" : "false"}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className="lk-admin-sidebar"
        data-open={sidebarOpen ? "true" : "false"}
        style={{
          width: 240,
          flexShrink: 0,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--primary), var(--lilac))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 14,
              fontFamily: "var(--font-display)",
            }}
          >
            L
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.01em",
                color: "var(--ink)",
              }}
            >
              lapakurab
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--ink-soft)",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Admin Panel
            </div>
          </div>
          {/* Close button — mobile drawer only */}
          <button
            type="button"
            className="lk-admin-drawer-close"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-soft)",
              padding: 0,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--ink-soft)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "8px 8px 6px",
            }}
          >
            Menu
          </div>
          {NAV_ITEMS.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.id}
                href={n.href}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: active ? "var(--surface-2)" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-soft)",
                  fontWeight: active ? 600 : 500,
                  fontSize: 13,
                  fontFamily: "inherit",
                  textAlign: "left",
                  marginBottom: 2,
                  borderLeft: active
                    ? "2px solid var(--primary)"
                    : "2px solid transparent",
                  transition: "all 0.12s",
                  textDecoration: "none",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={n.icon} />
                </svg>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleResetData}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              cursor: "pointer",
              background: "var(--surface)",
              color: "var(--ink-soft)",
              fontSize: 11,
              fontWeight: 500,
              fontFamily: "inherit",
              marginBottom: 6,
            }}
          >
            Reset data demo
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              cursor: "pointer",
              background: "var(--surface)",
              color: "var(--ink)",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main id="main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          className="lk-admin-topbar"
          style={{
            height: 56,
            padding: "0 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "var(--ink-soft)",
              minWidth: 0,
            }}
          >
            <button
              type="button"
              className="lk-admin-hamburger"
              aria-label="Buka menu"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span>Admin</span>
            <span>›</span>
            <span
              style={{
                color: "var(--ink)",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {current.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/"
              className="lk-admin-topbar-store"
              style={{
                fontSize: 12,
                color: "var(--ink-soft)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 6,
                border: "1px solid var(--border)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Lihat toko
            </Link>
            <button
              onClick={toggleDark}
              title={darkMode ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
              aria-label={darkMode ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink)",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
            >
              {darkMode ? (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <div data-notif-bell style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifOpen((o) => !o);
                }}
                style={{
                  position: "relative",
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ink)",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
                </svg>
                {unread > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      minWidth: 16,
                      height: 16,
                      padding: "0 4px",
                      borderRadius: 8,
                      background: "var(--danger)",
                      color: "white",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 340,
                    maxHeight: 440,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 50,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                      Notifikasi{" "}
                      <span style={{ color: "var(--ink-soft)", fontWeight: 500 }}>
                        · {unread} baru
                      </span>
                    </div>
                    <button
                      onClick={markAllNotifsRead}
                      style={{
                        fontSize: 11,
                        color: "var(--primary)",
                        background: "none",
                        border: 0,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: 500,
                      }}
                    >
                      Tandai semua dibaca
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {notifications.length === 0 && (
                      <div
                        style={{
                          padding: 24,
                          textAlign: "center",
                          fontSize: 12,
                          color: "var(--ink-soft)",
                        }}
                      >
                        Belum ada notifikasi.
                      </div>
                    )}
                    {notifications.map((n) => {
                      const palette = NOTIF_PALETTE[n.kind] || NOTIF_PALETTE.info;
                      return (
                        <div
                          key={n.id}
                          onClick={() => markNotifRead(n.id)}
                          style={{
                            padding: "11px 14px",
                            borderBottom: "1px solid var(--border)",
                            background: n.read ? "transparent" : "rgba(91,141,239,0.04)",
                            display: "flex",
                            gap: 10,
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              alignSelf: "stretch",
                              borderRadius: 3,
                              background: palette,
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: n.read ? 500 : 600,
                                marginBottom: 2,
                                color: "var(--ink)",
                              }}
                            >
                              {n.title}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--ink-soft)",
                                marginBottom: 3,
                              }}
                            >
                              {n.body}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--ink-soft)" }}>
                              {relTime(n.at)}
                            </div>
                          </div>
                          {!n.read && (
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "var(--primary)",
                                marginTop: 5,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div style={{ width: 1, height: 20, background: "var(--border)" }} />
            <div className="lk-admin-topbar-user" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
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
                A
              </div>
              <div style={{ fontSize: 12 }}>
                <div style={{ fontWeight: 600, color: "var(--ink)" }}>Admin</div>
                <div style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                  admin@lapakurab.id
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="lk-admin-content" style={{ padding: "28px 32px", flex: 1, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
