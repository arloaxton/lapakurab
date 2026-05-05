import type { CSSProperties } from "react";

export const adminInputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1.5px solid var(--border)",
  background: "var(--surface)",
  fontSize: 13,
  fontFamily: "inherit",
  color: "var(--ink)",
  outline: "none",
};

export const primaryBtn: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: 0,
  cursor: "pointer",
  background: "var(--ink)",
  color: "white",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

export const secondaryBtn: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  cursor: "pointer",
  background: "var(--surface)",
  color: "var(--ink)",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "inherit",
};

export const miniBtn: CSSProperties = {
  padding: "4px 10px",
  borderRadius: 5,
  border: "1px solid var(--border)",
  cursor: "pointer",
  background: "var(--surface)",
  color: "var(--ink)",
  fontSize: 11,
  fontWeight: 500,
  fontFamily: "inherit",
};

export const chipStyle = (active: boolean): CSSProperties => ({
  padding: "5px 10px",
  borderRadius: 5,
  border: "1px solid var(--border)",
  cursor: "pointer",
  background: active ? "var(--ink)" : "var(--surface)",
  color: active ? "white" : "var(--ink)",
  fontSize: 11,
  fontWeight: 500,
  fontFamily: "inherit",
});

export const dangerMiniBtn: CSSProperties = {
  ...miniBtn,
  color: "var(--danger)",
  borderColor: "rgba(220,38,38,0.3)",
};
