"use client";

import type { CSSProperties, ReactNode } from "react";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { getAdminTheme } from "@/lib/theme";

type CSSVars = CSSProperties & Record<`--${string}`, string>;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const theme = getAdminTheme(false) as CSSVars;
  return (
    <AdminProvider>
      <div
        style={{
          ...theme,
          background: "var(--bg)",
          color: "var(--ink)",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </AdminProvider>
  );
}
