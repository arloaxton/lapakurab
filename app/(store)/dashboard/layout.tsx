import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Pantau pesanan, lihat kredensial akun aktif, dan kelola profil.",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
