"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface NavBtnProps {
  children: ReactNode;
  href: string;
  active?: boolean;
}

export function NavBtn({ children, href, active }: NavBtnProps) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: "1.5px solid transparent",
        background: active ? "rgba(255,107,157,0.12)" : "transparent",
        color: active ? "var(--primary)" : "var(--ink)",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </Link>
  );
}
