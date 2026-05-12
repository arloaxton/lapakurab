"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { fmtIDR } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const SORT_OPTIONS = [
  { id: "popular", label: "Populer" },
  { id: "price-low", label: "Termurah" },
  { id: "price-high", label: "Termahal" },
  { id: "rating", label: "Rating tertinggi" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["id"];

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function CatalogClient({ initialProducts, categories }: Props) {
  return (
    <Suspense fallback={null}>
      <CatalogInner initialProducts={initialProducts} categories={categories} />
    </Suspense>
  );
}

function CatalogInner({ initialProducts, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Build category filter list ("all" + DB categories). Single source of truth.
  const filterCategories = useMemo(
    () => [
      { id: "all", label: "Semua", emoji: "✦" } as Category,
      ...categories,
    ],
    [categories]
  );

  // Init dari URL hanya sekali (saat mount). Selanjutnya local state.
  // Ini bikin slider & chip kategori instan responsif (no router round-trip).
  const initRef = useRef({
    cat: sp.get("cat") ?? "all",
    sort: (sp.get("sort") ?? "popular") as SortKey,
    maxPrice: Number(sp.get("maxPrice") ?? "50000"),
  });
  const [cat, setCat] = useState<string>(initRef.current.cat);
  const [sort, setSort] = useState<SortKey>(initRef.current.sort);
  const [maxPrice, setMaxPrice] = useState<number>(initRef.current.maxPrice);
  // Products datang dari server — tidak perlu fetch ulang.
  const products = initialProducts;

  // Debounced URL sync — supaya share-able / bookmark-able tapi tidak bikin lag.
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (cat !== "all") params.set("cat", cat);
      if (sort !== "popular") params.set("sort", sort);
      if (maxPrice !== 50000) params.set("maxPrice", String(maxPrice));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 350);
    return () => clearTimeout(t);
  }, [cat, sort, maxPrice, router, pathname]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => cat === "all" || p.cat === cat);
    list = list.filter((p) => p.priceIDR <= maxPrice);
    if (sort === "price-low") list = [...list].sort((a, b) => a.priceIDR - b.priceIDR);
    if (sort === "price-high") list = [...list].sort((a, b) => b.priceIDR - a.priceIDR);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, cat, sort, maxPrice]);

  const paged = usePagination(filtered, 12);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          className="lk-h1-page"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "0 0 8px",
            color: "var(--ink)",
          }}
        >
          Katalog produk
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 15, margin: 0 }}>
          {filtered.length} produk siap kirim instan
        </p>
      </div>

      <div className="lk-sidebar-main">
        <aside
          style={{
            background: "var(--surface)",
            borderRadius: 24,
            padding: 20,
            border: "1.5px solid var(--border)",
            alignSelf: "start",
            position: "sticky",
            top: 84,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
              marginBottom: 12,
            }}
          >
            Kategori
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
            {filterCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: 0,
                  cursor: "pointer",
                  background: cat === c.id ? "var(--ink)" : "transparent",
                  color: cat === c.id ? "white" : "var(--ink)",
                  fontWeight: 600,
                  fontSize: 14,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 16 }}>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
              marginBottom: 12,
            }}
          >
            Harga max
          </div>
          <input
            type="range"
            min={5000}
            max={50000}
            step={1000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--primary)" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "var(--ink-soft)",
              marginTop: 6,
            }}
          >
            <span>Rp5rb</span>
            <strong style={{ color: "var(--primary)" }}>{fmtIDR(maxPrice)}</strong>
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 18,
                marginBottom: 4,
                color: "var(--ink)",
              }}
            >
              Garansi 100%
            </div>
            <div style={{ fontSize: 12, color: "var(--ink)", opacity: 0.75 }}>
              Akun bermasalah? Kami ganti baru atau refund full.
            </div>
          </div>
        </aside>

        <div style={{ minWidth: 0 }}>
          <div
            className="lk-sort-bar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 16,
              background: "var(--surface)",
              borderRadius: 14,
              padding: "10px 16px",
              border: "1.5px solid var(--border)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Urutkan:</div>
            <div style={{ display: "flex", gap: 6 }}>
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSort(s.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: 0,
                    cursor: "pointer",
                    background: sort === s.id ? "var(--primary)" : "transparent",
                    color: sort === s.id ? "white" : "var(--ink-soft)",
                    fontWeight: 600,
                    fontSize: 12,
                    fontFamily: "inherit",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lk-grid-3">
            {paged.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div
              style={{
                padding: 48,
                textAlign: "center",
                color: "var(--ink-soft)",
              }}
            >
              Yah, ga ada yang cocok 😢 coba ubah filternya.
            </div>
          )}
          <Pagination api={paged} />
        </div>
      </div>
    </div>
  );
}
