import type { ReactNode } from "react";

interface FormRowProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

export function FormRow({ label, required, children }: FormRowProps) {
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
    </div>
  );
}
