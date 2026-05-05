"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { SelectionApi } from "@/hooks/useSelection";

interface TableShellProps<T> {
  columns: ReactNode[];
  rows: ReactNode[][];
  ids?: string[] | null;
  selection?: SelectionApi<T> | null;
  empty?: string;
  emptyIcon?: string;
  emptyDesc?: string;
  emptyCta?: ReactNode;
  loading?: boolean;
  skeletonRows?: number;
  /** Last column treated as actions row in mobile cards. Default true. */
  hasActionColumn?: boolean;
}

const checkboxStyle: React.CSSProperties = {
  width: 14,
  height: 14,
  cursor: "pointer",
  accentColor: "var(--primary)",
};

/**
 * Admin table — desktop renders <table>, mobile renders card list.
 * Toggling controlled by .lk-table-desktop / .lk-cards-mobile in globals.css.
 *
 * Convention: last column is treated as the action column (header empty,
 * cell contains buttons). On mobile that cell is rendered at the bottom of
 * each card. The first cell is rendered as the card header (typically
 * avatar + name). Middle cells become "label: value" rows inside the card.
 */
export function TableShell<T>({
  columns,
  rows,
  ids = null,
  selection = null,
  empty = "Tidak ada data.",
  emptyIcon = "📭",
  emptyDesc = "",
  emptyCta = null,
  loading = false,
  skeletonRows = 4,
  hasActionColumn = true,
}: TableShellProps<T>) {
  const hasSel = !!selection;

  // Determine where actions live: last column if hasActionColumn
  const actionIdx = hasActionColumn ? columns.length - 1 : -1;

  return (
    <div
      className="lk-table-shell"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* ─────────── DESKTOP table ─────────── */}
      <div className="lk-table-desktop" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {hasSel && selection && (
                <th
                  style={{
                    padding: "11px 12px 11px 16px",
                    width: 36,
                    textAlign: "left",
                  }}
                >
                  <input
                    type="checkbox"
                    style={checkboxStyle}
                    checked={selection.allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !selection.allSelected && selection.someSelected;
                    }}
                    onChange={selection.toggleAll}
                  />
                </th>
              )}
              {columns.map((c, i) => (
                <th
                  key={i}
                  style={{
                    padding: "11px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--ink-soft)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr
                  key={"sk" + i}
                  style={{
                    borderBottom: i < skeletonRows - 1 ? "1px solid var(--border)" : 0,
                  }}
                >
                  {hasSel && (
                    <td style={{ padding: "14px 12px 14px 16px" }}>
                      <Skeleton h={14} w={14} />
                    </td>
                  )}
                  {columns.map((_, j) => (
                    <td key={j} style={{ padding: "14px 16px" }}>
                      <Skeleton h={12} w={j === 0 ? "70%" : "50%"} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasSel ? 1 : 0)}
                  style={{ padding: "8px" }}
                >
                  <EmptyState
                    icon={emptyIcon}
                    title={empty}
                    desc={emptyDesc}
                    cta={emptyCta}
                    compact
                  />
                </td>
              </tr>
            ) : (
              rows.map((row, i) => {
                const id = ids ? ids[i] : null;
                const isSel = hasSel && id != null && selection!.has(id);
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : 0,
                      transition: "background 120ms ease",
                      background: isSel ? "rgba(91,124,250,0.06)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSel) e.currentTarget.style.background = "var(--surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSel) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {hasSel && (
                      <td style={{ padding: "12px 12px 12px 16px" }}>
                        <input
                          type="checkbox"
                          style={checkboxStyle}
                          checked={isSel}
                          onChange={() => id != null && selection!.toggle(id)}
                        />
                      </td>
                    )}
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        style={{ padding: "12px 16px", fontSize: 13, verticalAlign: "middle" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─────────── MOBILE cards ─────────── */}
      <div className="lk-cards-mobile">
        {loading ? (
          Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={"sk" + i} className="lk-mobile-card">
              <Skeleton h={36} w="60%" />
              <div style={{ height: 10 }} />
              <Skeleton h={12} w="100%" />
              <div style={{ height: 6 }} />
              <Skeleton h={12} w="80%" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <div style={{ padding: "8px" }}>
            <EmptyState
              icon={emptyIcon}
              title={empty}
              desc={emptyDesc}
              cta={emptyCta}
              compact
            />
          </div>
        ) : (
          rows.map((row, i) => {
            const id = ids ? ids[i] : null;
            const isSel = hasSel && id != null && selection!.has(id);
            const headerCell = row[0];
            const actionCell = actionIdx >= 0 ? row[actionIdx] : null;
            const middleStart = 1;
            const middleEnd = actionIdx >= 0 ? actionIdx : row.length;

            return (
              <div
                key={i}
                className="lk-mobile-card"
                data-selected={isSel ? "true" : "false"}
              >
                {/* Header: checkbox + first cell (typically avatar + name) */}
                <div className="lk-mobile-card-header">
                  {hasSel && id != null && (
                    <input
                      type="checkbox"
                      style={checkboxStyle}
                      checked={isSel}
                      onChange={() => selection!.toggle(id)}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>{headerCell}</div>
                </div>

                {/* Body: label/value pairs for middle cells */}
                {middleEnd > middleStart && (
                  <div className="lk-mobile-card-body">
                    {row.slice(middleStart, middleEnd).map((cell, j) => {
                      const colLabel = columns[middleStart + j];
                      return (
                        <div key={j} className="lk-mobile-card-kv">
                          <span className="lk-mobile-card-key">{colLabel}</span>
                          <span className="lk-mobile-card-val">{cell}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer: action buttons */}
                {actionCell ? (
                  <div className="lk-mobile-card-actions">{actionCell}</div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
