"use client";

import { useState } from "react";

interface AuthFormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal" | "url";
  autoComplete?: string;
  autoFocus?: boolean;
  error?: string | null;
  hint?: string;
  required?: boolean;
  /** Render show/hide toggle (only when type starts with password) */
  showToggle?: boolean;
}

/** Styled input used in /login, /register, /dashboard profile, /checkout. */
export function AuthFormField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  autoFocus,
  error,
  hint,
  required,
  showToggle,
}: AuthFormFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && revealed ? "text" : type;
  const hasError = !!error;

  return (
    <div style={{ marginBottom: 8 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ink-soft)",
          display: "flex",
          gap: 4,
          marginBottom: 6,
        }}
      >
        {label}
        {required && <span style={{ color: "#DC2626" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={effectiveType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={hasError || undefined}
          style={{
            width: "100%",
            padding: showToggle && isPassword ? "12px 56px 12px 14px" : "12px 14px",
            borderRadius: 12,
            border: `1.5px solid ${hasError ? "#DC2626" : "var(--border)"}`,
            background: "var(--bg)",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            color: "var(--ink)",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = hasError ? "#DC2626" : "var(--primary)")
          }
        />
        {showToggle && isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((s) => !s)}
            aria-label={revealed ? "Sembunyikan password" : "Tampilkan password"}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: 0,
              cursor: "pointer",
              color: "var(--ink-soft)",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 8px",
              fontFamily: "inherit",
            }}
          >
            {revealed ? "Sembunyi" : "Tampil"}
          </button>
        )}
      </div>
      {/* Reserved-space error/hint slot — fixed min-height supaya card tidak
          ke-shift saat error muncul/hilang. aria-live untuk a11y. */}
      <div
        aria-live="polite"
        style={{
          minHeight: 18,
          marginTop: 5,
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          color: hasError ? "#DC2626" : "var(--ink-soft)",
          lineHeight: 1.3,
        }}
      >
        {hasError ? (
          <>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </>
        ) : hint ? (
          <span>{hint}</span>
        ) : null}
      </div>
    </div>
  );
}
