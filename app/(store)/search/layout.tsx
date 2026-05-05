import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cari produk",
  description: "Cari akun streaming, VPN, dan premium services.",
  alternates: { canonical: "/search" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
