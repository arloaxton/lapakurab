import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar akun",
  description:
    "Bikin akun lapakurab dalam 30 detik — gratis. Dapatkan promo & garansi penuh.",
  alternates: { canonical: "/register" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
