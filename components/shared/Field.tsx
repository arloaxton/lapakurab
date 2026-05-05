import type { CSSProperties, ReactNode } from "react";

interface FieldProps {
  label: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

/** Form field wrapper with error/hint display. */
export function Field({ label, error, hint, required, children, style = {} }: FieldProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ink-soft, #666)",
          display: "flex",
          gap: 4,
        }}
      >
        {label}
        {required && <span style={{ color: "#DC2626" }}>*</span>}
      </span>
      {children}
      {error ? (
        <span
          style={{
            fontSize: 11,
            color: "#DC2626",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      ) : hint ? (
        <span style={{ fontSize: 11, color: "var(--ink-soft, #888)" }}>{hint}</span>
      ) : null}
    </label>
  );
}
