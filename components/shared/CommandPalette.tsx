"use client";

import { useEffect, useRef, useState } from "react";
import type { CommandItem } from "@/lib/types";

interface CommandPaletteProps {
  commands: CommandItem[];
  open: boolean;
  onClose: () => void;
}

/** Cmd+K command palette overlay. */
export function CommandPalette({ commands, open, onClose }: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = q
    ? commands.filter((c) =>
        (c.title + " " + (c.section || "") + " " + (c.keywords || ""))
          .toLowerCase()
          .includes(q.toLowerCase())
      )
    : commands;

  useEffect(() => {
    if (idx >= filtered.length) setIdx(0);
  }, [q, filtered.length, idx]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[idx];
      if (c) {
        c.onRun();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(20,20,20,0.42)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        animation: "lkFadeIn 140ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: "92vw",
          background: "var(--surface, #fff)",
          border: "1px solid var(--border, #e5e5e5)",
          borderRadius: 14,
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border, #e5e5e5)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 14, color: "var(--ink-soft, #888)" }}>⌘K</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Cari halaman, action, produk…"
            style={{
              flex: 1,
              border: 0,
              outline: "none",
              fontSize: 15,
              fontFamily: "inherit",
              color: "var(--ink, #1a1a1a)",
              background: "transparent",
            }}
          />
          <kbd
            style={{
              fontSize: 11,
              padding: "3px 6px",
              background: "var(--surface-2,#f5f3ef)",
              border: "1px solid var(--border,#e5e5e5)",
              borderRadius: 4,
              color: "var(--ink-soft,#666)",
              fontFamily: "inherit",
            }}
          >
            Esc
          </kbd>
        </div>
        <div style={{ maxHeight: "52vh", overflowY: "auto", padding: 6 }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "var(--ink-soft,#888)",
                fontSize: 13,
              }}
            >
              Tidak ada hasil untuk &quot;{q}&quot;
            </div>
          ) : (
            filtered.map((c, i) => (
              <div
                key={i}
                onClick={() => {
                  c.onRun();
                  onClose();
                }}
                onMouseEnter={() => setIdx(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: idx === i ? "var(--surface-2,#f5f3ef)" : "transparent",
                }}
              >
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>
                  {c.icon || "•"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--ink,#1a1a1a)",
                    }}
                  >
                    {c.title}
                  </div>
                  {c.section && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--ink-soft,#888)",
                        marginTop: 1,
                      }}
                    >
                      {c.section}
                    </div>
                  )}
                </div>
                {c.shortcut && (
                  <kbd
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      background: "var(--surface-2,#f5f3ef)",
                      border: "1px solid var(--border,#e5e5e5)",
                      borderRadius: 3,
                      color: "var(--ink-soft,#888)",
                      fontFamily: "inherit",
                    }}
                  >
                    {c.shortcut}
                  </kbd>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
