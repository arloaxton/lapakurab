"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormField } from "@/components/store/AuthFormField";
import { useToast } from "@/components/shared/ToastProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || !confirm) {
      setError("Semua field wajib diisi");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (newPassword !== confirm) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || `HTTP ${res.status}`);
        setSubmitting(false);
        return;
      }
      setDone(true);
      toast.success("Password berhasil di-reset", "Anda akan diarahkan ke dashboard.");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal reset password");
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 24,
          padding: 32,
          border: "1.5px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
          maxWidth: 440,
          width: "100%",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(15,139,92,0.12)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0F8B5C"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: "0 0 8px",
                color: "var(--ink)",
              }}
            >
              Password berhasil di-reset
            </h1>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: 0 }}>
              Mengarahkan ke dashboard…
            </p>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: "0 0 8px",
                color: "var(--ink)",
              }}
            >
              Buat password baru
            </h1>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 13,
                lineHeight: 1.55,
                margin: "0 0 24px",
              }}
            >
              Pilih password baru untuk akun kamu. Pastikan minimal 8 karakter.
            </p>

            <form onSubmit={submit} noValidate>
              <AuthFormField
                label="Password baru"
                required
                value={newPassword}
                onChange={setNewPassword}
                type="password"
                autoComplete="new-password"
                showToggle
                autoFocus
                hint="Minimal 8 karakter"
              />
              <AuthFormField
                label="Konfirmasi password baru"
                required
                value={confirm}
                onChange={setConfirm}
                type="password"
                autoComplete="new-password"
                showToggle
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

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: 0,
                  cursor: submitting ? "wait" : "pointer",
                  background: submitting ? "var(--ink-soft)" : "var(--primary)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: "inherit",
                  boxShadow: submitting ? "none" : "0 8px 24px rgba(255,107,157,0.4)",
                  marginTop: 8,
                  opacity: submitting ? 0.85 : 1,
                  transition: "background 0.15s, opacity 0.15s",
                }}
              >
                {submitting ? "Memproses…" : "Simpan password baru →"}
              </button>
            </form>

            <div
              style={{
                marginTop: 20,
                paddingTop: 18,
                borderTop: "1px solid var(--border)",
                textAlign: "center",
                fontSize: 12,
                color: "var(--ink-soft)",
              }}
            >
              Link sudah kadaluarsa?{" "}
              <Link
                href="/forgot-password"
                style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}
              >
                Minta link baru →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
