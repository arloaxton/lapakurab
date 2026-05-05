import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Selesaikan pembayaran via QRIS atau e-wallet.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
