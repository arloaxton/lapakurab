// Theme tokens — port dari THEME object di store-app.jsx & admin-app.jsx.
// CSS variables sudah di-set di app/globals.css. Object ini untuk inline-style
// references yang tidak bisa pakai var() (mis. SVG fill, dynamic computed).

// ─── Storefront (Y2K Bubble / Soft Cloud) ───────────────────────────────────
export const STORE_THEME = {
  bg: "#FFF8F2",
  surface: "#FFFFFF",
  surface2: "#f0eee9",
  ink: "#1A1626",
  inkSoft: "#5A5168",
  primary: "#FF6B9D",
  primaryInk: "#FFFFFF",
  mint: "#7FE7C7",
  lilac: "#C5A3FF",
  peach: "#FFC97A",
  sky: "#9FD4FF",
  border: "#E8DFD3",
  shadow: "rgba(26,22,38,0.08)",
} as const;

// ─── Admin (Soft Cloud — light) ─────────────────────────────────────────────
// Note: --font-display di-override ke Plus Jakarta Sans (admin font), bukan
// Space Grotesk (storefront). Variable --font-admin-display di-set lewat
// next/font di app/fonts.ts.
export const ADMIN_THEME_LIGHT = {
  "--bg": "#F4F1EC",
  "--surface": "#FFFFFF",
  "--surface-2": "#FAF7F1",
  "--ink": "#22304A",
  "--ink-soft": "#7A8499",
  "--primary": "#5B8DEF",
  "--mint": "#9DD9C5",
  "--peach": "#F7C39A",
  "--lilac": "#B8A5E3",
  "--border": "#E6E0D6",
  "--border-strong": "#D7CFC1",
  "--success": "#0F8B5C",
  "--warn": "#D97706",
  "--danger": "#DC2626",
  "--font-display": "var(--font-admin-display)",
} as const;

// ─── Admin (Soft Cloud — dark) ──────────────────────────────────────────────
export const ADMIN_THEME_DARK = {
  "--bg": "#0F1219",
  "--surface": "#161A24",
  "--surface-2": "#1D2230",
  "--ink": "#E8EBF0",
  "--ink-soft": "#8993A8",
  "--primary": "#6B97F5",
  "--mint": "#7BC4AC",
  "--peach": "#E5A975",
  "--lilac": "#A28BD4",
  "--border": "#2A3142",
  "--border-strong": "#374058",
  "--success": "#3DBE85",
  "--warn": "#E89846",
  "--danger": "#E85555",
  "--font-display": "var(--font-admin-display)",
} as const;

export const getAdminTheme = (dark: boolean) =>
  dark ? ADMIN_THEME_DARK : ADMIN_THEME_LIGHT;

export type AdminThemeVars = typeof ADMIN_THEME_LIGHT;
