"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ToastInput, ToastItem, ToastKind } from "@/lib/types";

interface ToastApi {
  push: (opts: ToastInput) => number;
  success: (title: string, desc?: string, opts?: Partial<ToastInput>) => number;
  error: (title: string, desc?: string, opts?: Partial<ToastInput>) => number;
  warn: (title: string, desc?: string, opts?: Partial<ToastInput>) => number;
  info: (title: string, desc?: string, opts?: Partial<ToastInput>) => number;
  undo: (title: string, onUndo: () => void, opts?: Partial<ToastInput>) => number;
  remove: (id: number) => void;
}

const ToastCtx = createContext<ToastApi | null>(null);

const FALLBACK_API: ToastApi = {
  push: () => 0,
  success: () => 0,
  error: () => 0,
  warn: () => 0,
  info: () => 0,
  undo: () => 0,
  remove: () => {},
};

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  return ctx ?? FALLBACK_API;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback(
    (id: number) => setToasts((list) => list.filter((t) => t.id !== id)),
    []
  );

  const push = useCallback(
    (opts: ToastInput) => {
      const id = ++idRef.current;
      const t: ToastItem = {
        id,
        kind: opts.kind ?? "info",
        title: opts.title ?? "",
        desc: opts.desc ?? "",
        duration: opts.duration ?? 3500,
        action: opts.action ?? null,
      };
      setToasts((list) => [...list, t]);
      if (t.duration > 0) setTimeout(() => remove(id), t.duration);
      return id;
    },
    [remove]
  );

  const api: ToastApi = {
    push,
    success: (title, desc, opts = {}) =>
      push({ kind: "success", title, desc, ...opts }),
    error: (title, desc, opts = {}) =>
      push({ kind: "error", title, desc, ...opts }),
    warn: (title, desc, opts = {}) =>
      push({ kind: "warn", title, desc, ...opts }),
    info: (title, desc, opts = {}) =>
      push({ kind: "info", title, desc, ...opts }),
    undo: (title, onUndo, opts = {}) =>
      push({
        kind: "info",
        title,
        duration: 6000,
        action: { label: "Undo", onClick: onUndo },
        ...opts,
      }),
    remove,
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} remove={remove} />
    </ToastCtx.Provider>
  );
}

const PALETTE: Record<ToastKind, { bg: string; icon: string }> = {
  success: { bg: "#0F8B5C", icon: "✓" },
  error: { bg: "#DC2626", icon: "✕" },
  warn: { bg: "#D97706", icon: "!" },
  info: { bg: "#1F1F1F", icon: "•" },
};

function ToastViewport({
  toasts,
  remove,
}: {
  toasts: ToastItem[];
  remove: (id: number) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const p = PALETTE[t.kind] || PALETTE.info;
        return (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              background: p.bg,
              color: "white",
              padding: "12px 14px",
              borderRadius: 10,
              minWidth: 280,
              maxWidth: 380,
              boxShadow:
                "0 12px 28px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              animation: "lkToastIn 220ms cubic-bezier(0.2,0.8,0.2,1)",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {p.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: t.desc ? 2 : 0,
                }}
              >
                {t.title}
              </div>
              {t.desc && (
                <div style={{ fontSize: 11, opacity: 0.9 }}>{t.desc}</div>
              )}
            </div>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick();
                  remove(t.id);
                }}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: 0,
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => remove(t.id)}
              style={{
                background: "none",
                border: 0,
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontSize: 14,
                padding: 0,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
