"use client";

import type { CSSProperties, ReactNode } from "react";
import { useModalKey } from "@/hooks/useModalKey";
import { useAdmin } from "./AdminProvider";
import { getAdminTheme } from "@/lib/theme";

// CSS custom properties tidak ada di CSSProperties bawaan React.
type CSSVars = CSSProperties & Record<`--${string}`, string>;

interface ModalProps {
  open?: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: number;
  children: ReactNode;
  footer?: ReactNode;
}

const modalBg: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(34,48,74,0.45)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 200,
};

/**
 * Admin modal shell. Re-applies admin theme tokens because the modal renders
 * at the body root (could be outside the AdminProvider's themed div in some
 * portal configurations); duplicating the tokens is harmless.
 */
export function Modal({
  onClose,
  title,
  subtitle,
  maxWidth = 580,
  children,
  footer,
}: ModalProps) {
  const { darkMode } = useAdmin();
  useModalKey(true, onClose);
  const theme = getAdminTheme(darkMode) as CSSVars;

  return (
    <div style={modalBg} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...theme,
          background: "var(--surface)",
          borderRadius: 14,
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          color: "var(--ink)",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: 0,
              fontSize: 20,
              color: "var(--ink-soft)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: 22,
            maxHeight: "70vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              background: "var(--surface-2)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
