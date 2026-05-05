import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keranjang belanja",
  description: "Cek isi keranjang dan lanjutkan ke pembayaran.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
