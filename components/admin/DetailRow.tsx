import type { ReactNode } from "react";

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      <div style={{ textAlign: "right" }}>{children}</div>
    </div>
  );
}
