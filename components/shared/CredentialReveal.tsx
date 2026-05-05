"use client";

import { useState } from "react";
import { useCopy } from "@/hooks/useCopy";

interface CredentialRevealProps {
  label?: string;
  value: string;
  masked?: boolean;
}

/** Masked email/password with eye toggle + copy button. */
export function CredentialReveal({ label, value, masked = true }: CredentialRevealProps) {
  const [show, setShow] = useState(false);
  const copy = useCopy();
  const display = show || !masked ? value : "•".repeat(Math.min(value.length, 14));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, monospace",
        fontSize: 12,
      }}
    >
      {label && (
        <span style={{ color: "var(--ink-soft)", fontWeight: 600, minWidth: 60 }}>
          {label}
        </span>
      )}
      <span
        style={{
          flex: 1,
          color: "var(--ink)",
          fontWeight: 500,
          userSelect: show ? "all" : "none",
          letterSpacing: show ? 0 : "0.1em",
        }}
      >
        {display}
      </span>
      <button
        onClick={() => setShow((s) => !s)}
        title={show ? "Sembunyikan" : "Tampilkan"}
        style={{
          background: "none",
          border: 0,
          cursor: "pointer",
          padding: 4,
          color: "var(--ink-soft)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {show ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
      <button
        onClick={() => copy(value, label ? label + " disalin" : "Disalin")}
        title="Salin"
        style={{
          background: "none",
          border: 0,
          cursor: "pointer",
          padding: 4,
          color: "var(--ink-soft)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </button>
    </div>
  );
}
