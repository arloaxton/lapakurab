import type { Metadata } from "next";
import { fontVariables, fontBody } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "lapakurab — Toko Akun Digital",
  description:
    "Marketplace akun digital — streaming, VPN, premium services dengan harga termurah & garansi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={fontVariables}>
      <body className={fontBody.className}>{children}</body>
    </html>
  );
}
