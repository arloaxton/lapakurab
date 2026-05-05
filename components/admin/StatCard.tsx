interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  accent?: string;
}

export function StatCard({ label, value, delta, accent }: StatCardProps) {
  const pos = delta ? delta.startsWith("+") : false;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--ink-soft)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
            color: "var(--ink)",
          }}
        >
          {value}
        </div>
        {delta && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: pos ? "var(--success)" : "var(--danger)",
              background: pos
                ? "rgba(15,139,92,0.08)"
                : "rgba(220,38,38,0.08)",
              padding: "2px 7px",
              borderRadius: 5,
            }}
          >
            {delta}
          </div>
        )}
      </div>
      {accent && (
        <div
          style={{
            marginTop: 10,
            height: 3,
            borderRadius: 2,
            background: accent,
            opacity: 0.7,
          }}
        />
      )}
    </div>
  );
}
