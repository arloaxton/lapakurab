/**
 * Server Component — search query dari URL params, fetch hasil di server.
 * No client-side useEffect, no fetch flicker.
 */

import { ProductCard } from "@/components/store/ProductCard";
import { searchProducts } from "@/lib/data/products-repo";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const results = await searchProducts(q);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          margin: "0 0 8px",
          color: "var(--ink)",
        }}
      >
        Hasil pencarian:{" "}
        <span style={{ color: "var(--primary)" }}>&quot;{q}&quot;</span>
      </h1>
      <p style={{ color: "var(--ink-soft)", margin: "0 0 24px" }}>
        {results.length} produk ditemukan
      </p>
      {results.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            background: "var(--surface)",
            borderRadius: 24,
            border: "1.5px solid var(--border)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>?</div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 6,
              color: "var(--ink)",
            }}
          >
            Hmm, ga nemu nih.
          </div>
          <div style={{ color: "var(--ink-soft)" }}>
            Coba kata kunci lain atau lihat katalog lengkap.
          </div>
        </div>
      ) : (
        <div className="lk-products-grid">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
