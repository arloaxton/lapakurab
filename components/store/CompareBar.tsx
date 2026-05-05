"use client";

import { useStore } from "./StoreProvider";
import { ProductTile } from "./ProductTile";

export function CompareBar() {
  const { compareList, clearCompare, toggleCompare, setCompareOpen } = useStore();
  if (compareList.length === 0) return null;

  return (
    <div
      className="lk-compare-bar"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        zIndex: 80,
        background: "var(--surface)",
        borderRadius: 24,
        border: "1.5px solid var(--border)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
        padding: "10px 12px 10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        maxWidth: "min(640px, calc(100vw - 32px))",
        animation: "compareBarSlide 0.25s ease-out",
      }}
    >
      <style>{`@keyframes compareBarSlide { from { transform: translate(-50%, 30px); opacity:0; } to { transform: translate(-50%, 0); opacity:1; } }`}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>
          Bandingkan
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
          {compareList.length}/3 dipilih
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {compareList.map((p) => (
          <div key={p.id} style={{ position: "relative" }} title={p.name}>
            <ProductTile hue={p.hue} emoji={p.emoji} size={38} rounded={9} />
            <button
              onClick={() => toggleCompare(p.id)}
              aria-label={`Hapus ${p.name}`}
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "var(--ink)",
                color: "white",
                border: "2px solid var(--surface)",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
        {Array.from({ length: 3 - compareList.length }).map((_, i) => (
          <div
            key={"empty" + i}
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              border: "2px dashed var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-soft)",
              fontSize: 18,
              opacity: 0.5,
            }}
          >
            +
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button
        onClick={clearCompare}
        style={{
          background: "none",
          border: 0,
          color: "var(--ink-soft)",
          fontSize: 12,
          cursor: "pointer",
          fontFamily: "inherit",
          padding: "6px 8px",
        }}
      >
        Reset
      </button>
      <button
        onClick={() => setCompareOpen(true)}
        disabled={compareList.length < 2}
        style={{
          padding: "10px 18px",
          borderRadius: 999,
          border: 0,
          background: compareList.length < 2 ? "var(--surface-2)" : "var(--primary)",
          color: compareList.length < 2 ? "var(--ink-soft)" : "white",
          fontWeight: 700,
          fontSize: 13,
          fontFamily: "inherit",
          cursor: compareList.length < 2 ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        Bandingkan →
      </button>
    </div>
  );
}
