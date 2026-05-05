import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa password",
  description: "Reset password akun lapakurab kamu.",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
