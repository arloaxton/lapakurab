import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "40px 28px",
          boxShadow: "0 12px 28px var(--shadow)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 96,
            fontWeight: 800,
            background: "linear-gradient(135deg, var(--primary), var(--lilac))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
            margin: "0 0 12px",
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 700,
            margin: "0 0 8px",
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
        >
          Halaman tidak ditemukan
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
          Mungkin link-nya udah berubah, atau kamu salah ketik. Coba kembali ke
          halaman utama.
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              padding: "12px 22px",
              borderRadius: 999,
              background: "var(--ink)",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(26,22,38,0.25)",
            }}
          >
            ← Beranda
          </Link>
          <Link
            href="/catalog"
            style={{
              padding: "12px 22px",
              borderRadius: 999,
              border: "1.5px solid var(--border)",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
