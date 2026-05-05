import type { Metadata, Viewport } from "next";
import { fontVariables, fontBody } from "./fonts";
import { ConfirmDialogProvider } from "@/components/shared/ConfirmDialog";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://lapakurab.id";
const SITE_NAME = "lapakurab";
const SITE_TAGLINE = "Toko Akun Digital · Streaming, VPN, premium services";
const SITE_DESCRIPTION =
  "Marketplace akun digital terpercaya — streaming, VPN, dan premium services dengan harga termurah, kirim instan via QRIS & e-wallet, garansi penuh selama masa aktif.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    "akun streaming murah",
    "netflix premium",
    "spotify premium",
    "disney plus",
    "vpn premium",
    "qris e-wallet",
    "akun digital indonesia",
  ],
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    // og:image auto-injected oleh app/opengraph-image.tsx (1200×630)
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    // twitter:image auto-injected oleh app/twitter-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // icon + apple-icon auto-detected dari app/icon.tsx + app/apple-icon.tsx
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1626" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={fontVariables}>
      <body className={fontBody.className}>
        <a href="#main" className="lk-skip-link">
          Skip ke konten utama
        </a>
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
      </body>
    </html>
  );
}
