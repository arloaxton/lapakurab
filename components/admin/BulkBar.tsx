"use client";

import type { SelectionApi } from "@/hooks/useSelection";

interface BulkAction<T> {
  label: string;
  danger?: boolean;
  onRun: (selectedItems: T[]) => void;
}

interface BulkBarProps<T> {
  selection: SelectionApi<T> | null;
  actions?: BulkAction<T>[];
}

export function BulkBar<T>({ selection, actions = [] }: BulkBarProps<T>) {
  if (!selection || selection.count === 0) return null;
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        marginBottom: 12,
        padding: "10px 14px",
        borderRadius: 10,
        background: "var(--ink, #1a1a1a)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 14,
        animation: "lkFadeIn 160ms ease-out",
        boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600 }}>{selection.count} dipilih</span>
      <button
        onClick={selection.clear}
        style={{
          background: "rgba(255,255,255,0.14)",
          border: 0,
          color: "#fff",
          padding: "5px 10px",
          borderRadius: 6,
          fontSize: 12,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Batal
      </button>
      <div style={{ flex: 1 }} />
      {actions.map((a, i) => (
        <button
          key={i}
          onClick={() => {
            a.onRun(selection.selectedItems);
            selection.clear();
          }}
          style={{
            background: a.danger ? "#DC2626" : "rgba(255,255,255,0.18)",
            border: 0,
            color: "#fff",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
