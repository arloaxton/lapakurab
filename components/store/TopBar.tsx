"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "./StoreProvider";
import { NavBtn } from "./NavBtn";
import { ProductTile } from "./ProductTile";
import { highlightMatch } from "./highlight";
import { PRODUCTS } from "@/lib/mock";
import { fmtIDR } from "@/lib/format";

const LS_RECENT = "lapakurab_recent_searches";
const POPULAR_QUERIES = ["Netflix", "Spotify", "VPN", "Disney+", "YouTube"];

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, user } = useStore();

  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_RECENT);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const liveResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.cat.includes(q)
    ).slice(0, 5);
  }, [search]);

  const trendingProducts = useMemo(
    () =>
      [...PRODUCTS]
        .filter((p) => p.active !== false)
        .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        .slice(0, 4),
    []
  );

  const saveRecent = (q: string) => {
    if (!q || !q.trim()) return;
    const next = [
      q.trim(),
      ...recent.filter((r) => r.toLowerCase() !== q.trim().toLowerCase()),
    ].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(LS_RECENT, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(LS_RECENT);
    } catch {
      /* ignore */
    }
  };

  const submitSearch = (q: string) => {
    setSearch(q);
    saveRecent(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchFocus(false);
  };

  const showDropdown =
    searchFocus &&
    (search.trim() ? true : recent.length > 0 || trendingProducts.length > 0);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="lk-topbar-inner"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            background: "none",
            border: 0,
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--primary), var(--lilac))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: 18,
              fontFamily: "var(--font-display)",
              boxShadow: "0 4px 12px rgba(255,107,157,0.35)",
              transform: "rotate(-6deg)",
            }}
          >
            Lk
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
              color: "var(--ink)",
            }}
          >
            lapakurab<span style={{ color: "var(--primary)" }}>_</span>
          </div>
        </Link>

        {/* Search */}
        <div className="lk-topbar-search" style={{ flex: 1, position: "relative", maxWidth: 520, marginLeft: 20 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim()) submitSearch(search);
            }}
            placeholder="Cari akun streaming, VPN..."
            style={{
              width: "100%",
              padding: "12px 16px 12px 42px",
              borderRadius: 999,
              border: "1.5px solid var(--border)",
              background: "var(--surface)",
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
              transition: "all 0.2s",
              boxShadow: searchFocus
                ? "0 0 0 4px rgba(255,107,157,0.15)"
                : "none",
              borderColor: searchFocus ? "var(--primary)" : "var(--border)",
              color: "var(--ink)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--ink-soft)",
              fontSize: 16,
            }}
          >
            ⌕
          </div>
          {search.trim() && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setSearch("")}
              aria-label="Bersihkan"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: 0,
                cursor: "pointer",
                background: "var(--surface-2)",
                color: "var(--ink-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
              }}
            >
              ×
            </button>
          )}

          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 8,
                background: "var(--surface)",
                borderRadius: 18,
                border: "1.5px solid var(--border)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                overflow: "hidden",
                zIndex: 60,
                maxHeight: 480,
                overflowY: "auto",
              }}
            >
              {search.trim() && liveResults.length > 0 && (
                <>
                  <div
                    style={{
                      padding: "10px 16px 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--ink-soft)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Produk
                  </div>
                  {liveResults.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        router.push(`/products/${p.id}`);
                        setSearchFocus(false);
                        setSearch("");
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        background: "none",
                        border: 0,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(255,107,157,0.06)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <ProductTile hue={p.hue} emoji={p.emoji} size={40} rounded={10} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>
                          {highlightMatch(p.name, search)}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                          {p.tagline}
                        </div>
                      </div>
                      <div
                        style={{ fontWeight: 700, fontSize: 14, color: "var(--primary)" }}
                      >
                        {fmtIDR(p.priceIDR)}
                      </div>
                    </button>
                  ))}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => submitSearch(search)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "var(--surface-2)",
                      border: 0,
                      borderTop: "1px solid var(--border)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--primary)",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    Lihat semua hasil untuk &quot;{search}&quot; →
                  </button>
                </>
              )}

              {search.trim() && liveResults.length === 0 && (
                <div style={{ padding: "24px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 6, opacity: 0.5 }}>⌕</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    Nggak ketemu &quot;{search}&quot;
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      marginBottom: 12,
                    }}
                  >
                    Coba kata lain atau lihat saran berikut.
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {POPULAR_QUERIES.map((q) => (
                      <button
                        key={q}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setSearch(q)}
                        style={{
                          padding: "5px 11px",
                          borderRadius: 999,
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          cursor: "pointer",
                          fontSize: 12,
                          fontFamily: "inherit",
                          color: "var(--ink)",
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!search.trim() && (
                <>
                  {recent.length > 0 && (
                    <>
                      <div
                        style={{
                          padding: "10px 16px 6px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--ink-soft)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          Pencarian terakhir
                        </span>
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={clearRecent}
                          style={{
                            fontSize: 11,
                            color: "var(--ink-soft)",
                            background: "none",
                            border: 0,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                      {recent.map((r) => (
                        <button
                          key={r}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => submitSearch(r)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "8px 16px",
                            background: "none",
                            border: 0,
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: "inherit",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "var(--surface-2)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "var(--surface-2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--ink-soft)",
                              fontSize: 12,
                              flexShrink: 0,
                            }}
                          >
                            ↻
                          </span>
                          <span style={{ flex: 1, fontSize: 13, color: "var(--ink)" }}>
                            {r}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>↗</span>
                        </button>
                      ))}
                    </>
                  )}
                  <div
                    style={{
                      padding: "10px 16px 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--ink-soft)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Lagi populer
                  </div>
                  {trendingProducts.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        router.push(`/products/${p.id}`);
                        setSearchFocus(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 14px",
                        background: "none",
                        border: 0,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(255,107,157,0.06)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <ProductTile hue={p.hue} emoji={p.emoji} size={32} rounded={8} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                          {p.cat === "vpn" ? "VPN" : "Streaming"} · ⭐ {p.rating}
                        </div>
                      </div>
                      <div
                        style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}
                      >
                        {fmtIDR(p.priceIDR)}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <NavBtn href="/catalog" active={pathname === "/catalog"}>
            Katalog
          </NavBtn>
          <NavBtn
            href={user ? "/dashboard" : "/login"}
            active={pathname === "/dashboard" || pathname === "/login"}
          >
            {user ? user.name.split(" ")[0] : "Masuk"}
          </NavBtn>
          <Link
            href="/cart"
            data-cart-target
            style={{
              position: "relative",
              padding: "10px 14px",
              borderRadius: 999,
              border: "1.5px solid var(--ink)",
              background: "var(--ink)",
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
              textDecoration: "none",
            }}
          >
            <span>⛛</span>
            <span className="lk-topbar-cart-text">Keranjang</span>
            {cartCount > 0 && (
              <span
                style={{
                  background: "var(--primary)",
                  color: "white",
                  borderRadius: 999,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 800,
                  minWidth: 20,
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </div>
  );
}
