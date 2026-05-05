"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthFormField } from "@/components/store/AuthFormField";
import { useToast } from "@/components/shared/ToastProvider";
import { useFormValidation } from "@/hooks/useFormValidation";
import { requestPasswordReset } from "@/lib/data/auth-repo";
import * as v from "@/lib/validators";

interface ForgotValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, touched, setField, blur, validate, touchAll } =
    useFormValidation<ForgotValues>(
      { email: "" },
      { email: v.email() }
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      touchAll();
      return;
    }
    setSubmitting(true);
    const result = await requestPasswordReset(values.email);
    setSubmitting(false);
    if (!result.ok) {
      toast.error("Gagal kirim", result.error ?? "Coba lagi.");
      return;
    }
    setSent(true);
    toast.success("Email reset terkirim", `Cek inbox di ${values.email}`);
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
          maxWidth: 420,
          width: "100%",
        }}
      >
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 16,
            fontSize: 12,
            color: "var(--ink-soft)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Kembali ke login
        </Link>

        {sent ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  display: "inline-flex",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(15,139,92,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
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
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: "0 0 8px",
                textAlign: "center",
                color: "var(--ink)",
              }}
            >
              Cek email kamu
            </h1>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 13,
                lineHeight: 1.6,
                textAlign: "center",
                margin: "0 0 20px",
              }}
            >
              Kami sudah kirim link reset password ke{" "}
              <strong style={{ color: "var(--ink)" }}>{values.email}</strong>. Klik link di
              email untuk buat password baru.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 14,
                border: "1.5px solid var(--border)",
                background: "var(--surface)",
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Kirim ulang
            </button>
          </>
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
              Lupa password?
            </h1>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 13,
                lineHeight: 1.55,
                margin: "0 0 24px",
              }}
            >
              Masukkan email akun kamu. Kami kirim link untuk reset password.
            </p>

            <form onSubmit={submit} noValidate>
              <AuthFormField
                label="Email"
                required
                value={values.email}
                onChange={(val) => setField("email", val)}
                onBlur={() => blur("email")}
                error={touched.email ? errors.email : null}
                placeholder="kamu@email.com"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
              />

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
                {submitting ? "Memproses…" : "Kirim link reset →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
