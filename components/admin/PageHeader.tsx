import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 24,
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            margin: "0 0 4px",
            color: "var(--ink)",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: 0 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
