import type { ReactNode } from "react";

interface FormRowProps {
  label: string;
  required?: boolean;
  /** Helper text di bawah field (12px, ink-soft). */
  hint?: string;
  children: ReactNode;
}

export function FormRow({ label, required, hint, children }: FormRowProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ink)",
          marginBottom: 5,
        }}
      >
        {label}
        {required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && (
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            color: "var(--ink-soft)",
            lineHeight: 1.4,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
