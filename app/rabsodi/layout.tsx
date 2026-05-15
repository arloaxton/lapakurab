"use client";

import type { CSSProperties, ReactNode } from "react";
import { AdminProvider, useAdmin } from "@/components/admin/AdminProvider";
import { getAdminTheme } from "@/lib/theme";

type CSSVars = CSSProperties & Record<`--${string}`, string>;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminThemeWrap>{children}</AdminThemeWrap>
    </AdminProvider>
  );
}

function AdminThemeWrap({ children }: { children: ReactNode }) {
  const { darkMode } = useAdmin();
  const theme = getAdminTheme(darkMode) as CSSVars;
  return (
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
  );
}
