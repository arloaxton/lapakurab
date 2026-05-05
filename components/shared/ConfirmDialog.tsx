"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Render confirm button in danger color */
  danger?: boolean;
}

interface ConfirmCtxApi {
  /** Returns true if user confirms, false otherwise. */
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmCtx = createContext<ConfirmCtxApi | null>(null);

export function useConfirm(): ConfirmCtxApi["confirm"] {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) {
    // Fallback to native confirm if no provider — should not happen in app.
    return async (opts) =>
      typeof window !== "undefined"
        ? window.confirm(`${opts.title}\n\n${opts.description ?? ""}`.trim())
        : false;
  }
  return ctx.confirm;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setOpts(options);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const finish = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setOpts(null);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!opts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(false);
      if (e.key === "Enter") finish(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [opts, finish]);

  return (
    <ConfirmCtx.Provider value={{ confirm }}>
      {children}
      {opts && (
        <div
          onClick={() => finish(false)}
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,20,20,0.55)",
            backdropFilter: "blur(2px)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            animation: "lkFadeIn 160ms ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lk-confirm-title"
            style={{
              background: "var(--surface)",
              borderRadius: 16,
              border: "1px solid var(--border)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              maxWidth: 420,
              width: "100%",
              padding: "24px 24px 16px",
            }}
          >
            <h2
              id="lk-confirm-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                margin: "0 0 8px",
                color: "var(--ink)",
              }}
            >
              {opts.title}
            </h2>
            {opts.description && (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  lineHeight: 1.55,
                  margin: "0 0 20px",
                }}
              >
                {opts.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={() => finish(false)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {opts.cancelLabel ?? "Batal"}
              </button>
              <button
                onClick={() => finish(true)}
                autoFocus
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: 0,
                  background: opts.danger ? "#DC2626" : "var(--ink)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {opts.confirmLabel ?? "Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
