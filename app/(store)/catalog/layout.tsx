import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog produk",
  description:
    "Jelajahi katalog akun streaming, VPN, dan premium services. Filter berdasarkan kategori dan harga, kirim instan setelah bayar.",
  alternates: { canonical: "/catalog" },
  openGraph: { url: "/catalog", title: "Katalog produk · lapakurab" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
