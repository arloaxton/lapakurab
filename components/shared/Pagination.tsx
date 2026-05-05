"use client";

import type { PaginationApi } from "@/hooks/usePagination";

interface PaginationProps {
  api: PaginationApi<unknown>;
  showRangeLabel?: boolean;
}

const btnBase: React.CSSProperties = {
  minWidth: 32,
  height: 32,
  padding: "0 10px",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--ink)",
  fontSize: 12,
  fontWeight: 500,
  fontFamily: "inherit",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontVariantNumeric: "tabular-nums",
};

const btnActive: React.CSSProperties = {
  ...btnBase,
  background: "var(--ink)",
  color: "white",
  borderColor: "var(--ink)",
};

const btnDisabled: React.CSSProperties = {
  ...btnBase,
  opacity: 0.4,
  cursor: "not-allowed",
};

/**
 * Build a compact page list: 1, …, 4, 5, 6, …, 12 (max ~7 buttons visible).
 */
function pageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "ellipsis")[] = [1];
  if (current > 3) items.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) items.push(i);
  if (current < total - 2) items.push("ellipsis");
  items.push(total);
  return items;
}

export function Pagination({ api, showRangeLabel = true }: PaginationProps) {
  if (api.totalPages <= 1) {
    return showRangeLabel && api.totalItems > 0 ? (
      <div
        style={{
          fontSize: 11,
          color: "var(--ink-soft)",
          padding: "12px 4px",
          textAlign: "right",
        }}
      >
        {api.rangeLabel}
      </div>
    ) : null;
  }

  const items = pageItems(api.page, api.totalPages);
  const isFirst = api.page === 1;
  const isLast = api.page === api.totalPages;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "12px 4px",
        flexWrap: "wrap",
      }}
    >
      {showRangeLabel ? (
        <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{api.rangeLabel}</div>
      ) : (
        <div />
      )}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <button
          onClick={api.prev}
          disabled={isFirst}
          aria-label="Previous page"
          style={isFirst ? btnDisabled : btnBase}
        >
          ‹
        </button>
        {items.map((it, i) =>
          it === "ellipsis" ? (
            <span
              key={`e${i}`}
              style={{ minWidth: 24, color: "var(--ink-soft)", fontSize: 12, textAlign: "center" }}
            >
              …
            </span>
          ) : (
            <button
              key={it}
              onClick={() => api.setPage(it)}
              style={it === api.page ? btnActive : btnBase}
              aria-current={it === api.page ? "page" : undefined}
            >
              {it}
            </button>
          )
        )}
        <button
          onClick={api.next}
          disabled={isLast}
          aria-label="Next page"
          style={isLast ? btnDisabled : btnBase}
        >
          ›
        </button>
      </div>
    </div>
  );
}
