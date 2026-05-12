import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Buat password baru untuk akun lapakurab kamu.",
  alternates: { canonical: "/reset-password" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
