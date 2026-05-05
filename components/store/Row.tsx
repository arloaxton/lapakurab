interface RowProps {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}

export function Row({ label, value, bold, valueColor }: RowProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: bold ? 17 : 13 }}>
      <span
        style={{
          color: bold ? "var(--ink)" : "var(--ink-soft)",
          fontWeight: bold ? 700 : 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontWeight: bold ? 800 : 600,
          color: valueColor || "var(--ink)",
          fontFamily: bold ? "var(--font-display)" : "inherit",
        }}
      >
        {value}
      </span>
    </div>
  );
}
