export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "64px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 36,
          boxShadow: "0 12px 28px var(--shadow)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px",
            borderRadius: 999,
            background: "rgba(255,107,157,0.12)",
            color: "var(--primary)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Tahap 1 · Scaffold
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0,
            color: "var(--ink)",
          }}
        >
          lapakurab_
        </h1>
        <p
          style={{
            color: "var(--ink-soft)",
            marginTop: 10,
            lineHeight: 1.6,
            fontSize: 15,
          }}
        >
          Next.js + App Router + TypeScript + Tailwind v4 sudah siap.
          Kode prototype lama diarsip di{" "}
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              padding: "1px 6px",
              borderRadius: 4,
              background: "var(--surface-2)",
            }}
          >
            _legacy/
          </code>
          .
        </p>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <RouteRow label="Storefront routes" hint="Belum dibuat — Tahap 3" disabled />
          <RouteRow label="Admin routes" hint="Belum dibuat — Tahap 5" disabled />
        </div>
      </div>
    </main>
  );
}

function RouteRow({
  label,
  hint,
  disabled,
}: {
  label: string;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
        {label}
      </span>
      <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{hint}</span>
    </div>
  );
}
