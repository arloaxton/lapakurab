"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "./StoreProvider";

/**
 * Avatar bulat di topbar — klik buka dropdown:
 *   - Nama + email
 *   - Link "Dashboard"
 *   - Tombol "Keluar"
 *
 * Sembunyi jika user belum login (caller render "Masuk" link sendiri).
 */
export function UserMenu() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!user) return null;

  const initial = user.name?.trim().charAt(0).toUpperCase() || "?";
  const handleLogout = () => {
    setUser(null);
    setOpen(false);
    router.push("/");
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label="Menu akun"
        aria-expanded={open}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1.5px solid var(--border)",
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--lilac) 100%)",
          cursor: "pointer",
          color: "white",
          fontWeight: 800,
          fontSize: 14,
          fontFamily: "var(--font-display)",
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "transform 0.15s",
        }}
      >
        {initial}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 240,
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {/* Header: nama + email */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--ink)",
                marginBottom: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
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

          {/* Menu items */}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink)",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--surface-2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: 14 }}>📊</span>
            Profil & langganan
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "#DC2626",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              borderTop: "1px solid var(--border)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(220,38,38,0.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: 14 }}>🚪</span>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
