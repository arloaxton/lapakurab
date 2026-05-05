import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title?: string;
  desc?: string;
  cta?: ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon = "📦",
  title = "Belum ada data",
  desc = "",
  cta = null,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding: compact ? "32px 20px" : "56px 24px",
        textAlign: "center",
        background: "var(--surface, #fff)",
        border: "1px dashed var(--border, #e5e5e5)",
        borderRadius: 14,
        animation: "lkFadeIn 280ms ease-out",
      }}
    >
      <div
        style={{
          width: compact ? 48 : 64,
          height: compact ? 48 : 64,
          margin: "0 auto 14px",
          borderRadius: "50%",
          background: "var(--surface-2, #f5f3ef)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: compact ? 22 : 28,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display, inherit)",
          fontWeight: 600,
          fontSize: compact ? 14 : 16,
          color: "var(--ink, #1a1a1a)",
          letterSpacing: "-0.01em",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {desc && (
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-soft, #666)",
            maxWidth: 380,
            margin: "0 auto 14px",
            lineHeight: 1.5,
          }}
        >
          {desc}
        </div>
      )}
      {cta}
    </div>
  );
}
