import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="lk-footer-grid"
      style={{
        maxWidth: 1200,
        margin: "64px auto 0",
        padding: "40px 24px 24px",
        borderTop: "1.5px solid var(--border)",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--primary), var(--lilac))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: 18,
              fontFamily: "var(--font-display)",
              transform: "rotate(-6deg)",
            }}
          >
            Lk
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              fontFamily: "var(--font-display)",
            }}
          >
            lapakurab
            <span style={{ color: "var(--primary)" }}>_</span>
          </div>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--ink-soft)",
            lineHeight: 1.6,
            maxWidth: 300,
            margin: 0,
          }}
        >
          Marketplace akun digital premium. Garansi penuh, kirim instan via QRIS &amp; e-wallet.
        </p>
      </div>
      {[
        {
          h: "Belanja",
          l: [
            { label: "Streaming", href: "/catalog?cat=streaming" },
            { label: "VPN", href: "/catalog?cat=vpn" },
            { label: "Semua produk", href: "/catalog" },
          ],
        },
        {
          h: "Bantuan",
          l: [
            { label: "FAQ", href: "/faq" },
            { label: "Hubungi CS", href: "/help" },
            { label: "Garansi", href: "/faq" },
          ],
        },
        {
          h: "Tentang",
          l: [
            { label: "Tentang kami", href: "/about" },
          ],
        },
      ].map((c) => (
        <div key={c.h}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{c.h}</div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 13,
              color: "var(--ink-soft)",
            }}
          >
            {c.l.map((x) => (
              <li key={x.label}>
                <Link
                  href={x.href}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {x.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div
        style={{
          gridColumn: "1 / -1",
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
          fontSize: 12,
          color: "var(--ink-soft)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>© 2026 lapakurab. Semua hak dilindungi.</span>
        <span>Made with ♥ in Jakarta</span>
      </div>
    </footer>
  );
}
