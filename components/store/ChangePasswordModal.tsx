"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/shared/ToastProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!current || !next || !confirm) {
      setError("Semua field wajib diisi");
      return;
    }
    if (next.length < 8) {
      setError("Password baru minimal 8 karakter");
      return;
    }
    if (next !== confirm) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    if (next === current) {
      setError("Password baru tidak boleh sama dengan password lama");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || `HTTP ${res.status}`);
        setSubmitting(false);
        return;
      }
      toast.success("Password berhasil diubah", "Gunakan password baru untuk login berikutnya.");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal ubah password");
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: 16,
          maxWidth: 440,
          width: "100%",
          padding: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 800,
            margin: "0 0 6px",
            color: "var(--ink)",
          }}
        >
          Ubah password
        </h2>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 20px" }}>
          Untuk keamanan, kamu perlu verifikasi password lama dulu.
        </p>

        <form onSubmit={submit}>
          <PasswordField
            label="Password lama"
            value={current}
            onChange={setCurrent}
            disabled={submitting}
            autoFocus
          />
          <PasswordField
            label="Password baru"
            value={next}
            onChange={setNext}
            disabled={submitting}
            hint="Minimal 8 karakter"
          />
          <PasswordField
            label="Konfirmasi password baru"
            value={confirm}
            onChange={setConfirm}
            disabled={submitting}
          />

          {error && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.25)",
                color: "#DC2626",
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                background: "none",
                border: "1.5px solid var(--border)",
                color: "var(--ink)",
                padding: "10px 18px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? "wait" : "pointer",
                fontFamily: "inherit",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? "var(--ink-soft)" : "var(--ink)",
                border: 0,
                color: "white",
                padding: "10px 22px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: submitting ? "wait" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {submitting ? "Menyimpan…" : "Simpan password baru"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  disabled,
  autoFocus,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hint?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ink-soft)",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoFocus={autoFocus}
          style={{
            width: "100%",
            padding: "12px 56px 12px 14px",
            borderRadius: 12,
            border: "1.5px solid var(--border)",
            background: "var(--bg)",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            color: "var(--ink)",
          }}
        />
        <button
          type="button"
          onClick={() => setRevealed((s) => !s)}
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
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 5 }}>
          {hint}
        </div>
      )}
    </div>
  );
}
