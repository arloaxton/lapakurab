"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { AuthFormField } from "@/components/store/AuthFormField";
import { useToast } from "@/components/shared/ToastProvider";
import { useFormValidation } from "@/hooks/useFormValidation";
import { signUp, verifyOtp } from "@/lib/data/auth-repo";
import * as v from "@/lib/validators";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

interface RegisterValues {
  name: string;
  email: string;
  pw: string;
}

function RegisterInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  const { setUser } = useStore();
  const toast = useToast();

  const { values, errors, touched, setField, blur, validate, touchAll } =
    useFormValidation<RegisterValues>(
      { name: "", email: "", pw: "" },
      {
        name: v.name(2),
        email: v.email(),
        pw: v.password(6),
      }
    );

  const [step, setStep] = useState<"form" | "otp">("form");
  const [submitting, setSubmitting] = useState(false);
  // OTP length = 6 (Supabase mailer_otp_length project ini di-set 6).
  const OTP_LEN = 6;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      touchAll();
      toast.error("Periksa form daftar", "Lengkapi semua field dengan format yang benar.");
      return;
    }
    setSubmitting(true);
    const result = await signUp({
      name: values.name,
      email: values.email,
      password: values.pw,
    });
    setSubmitting(false);

    if (result.error) {
      toast.error("Pendaftaran gagal", result.error);
      return;
    }

    // Supabase email confirm flow → tampilkan OTP input
    if (result.needsConfirmation) {
      setStep("otp");
      setResendIn(60);
      setOtp(Array(OTP_LEN).fill(""));
      setOtpError(null);
      toast.success("Kode konfirmasi terkirim", `Cek inbox di ${values.email}`);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }

    // Auto-login (Supabase confirm-disabled mode atau mock)
    if (result.user) {
      setUser(result.user);
      toast.success("Akun dibuat", `Halo, ${result.user.name}!`);
      router.push(next);
    }
  };

  const resendEmail = async () => {
    if (resendIn > 0) return;
    setResendIn(60);
    const result = await signUp({
      name: values.name,
      email: values.email,
      password: values.pw,
    });
    if (result.error && !result.error.includes("already")) {
      toast.error("Gagal kirim ulang", result.error);
    } else {
      toast.success("Kode terkirim ulang", `Cek inbox di ${values.email}`);
    }
  };

  const submitOtp = async (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setOtpError(null);
    const result = await verifyOtp(values.email, code);
    setVerifying(false);
    if (result.error || !result.user) {
      setOtpError(result.error || "Kode tidak valid");
      setOtp(Array(OTP_LEN).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      return;
    }
    setUser(result.user);
    toast.success("Verifikasi berhasil", `Halo, ${result.user.name}!`);
    router.push(next);
  };

  const updateOtp = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    setOtpError(null);
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < OTP_LEN - 1) otpRefs.current[idx + 1]?.focus();
    if (next.every((d) => d !== "")) {
      setTimeout(() => submitOtp(next.join("")), 100);
    }
  };

  const onOtpKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const onOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const txt = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, OTP_LEN);
    if (txt.length === OTP_LEN) {
      e.preventDefault();
      const next = txt.split("");
      setOtp(next);
      setTimeout(() => submitOtp(txt), 100);
    }
  };

  if (step === "otp") {
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
        <div style={{ maxWidth: 480, width: "100%" }}>
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 20,
              padding: "40px 36px 28px",
              border: "1px solid var(--border)",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.04), 0 24px 60px rgba(0,0,0,0.06)",
            }}
          >
            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--ink-soft)",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span style={{ color: "var(--ink)" }}>Detail akun</span>
              </div>
              <div style={{ flex: 1, height: 1, background: "var(--ink)" }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  2
                </div>
                <span>Verifikasi</span>
              </div>
            </div>

            {/* Email envelope illustration */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ position: "relative", width: 88, height: 88 }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 20,
                    background: "linear-gradient(135deg, var(--lilac) 0%, var(--primary) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 12px 32px rgba(123,97,255,0.25)",
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <polyline points="3 7 12 13 21 7" />
                  </svg>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#0F8B5C",
                    border: "3px solid var(--surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "white",
                    }}
                  />
                </div>
              </div>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                margin: "0 0 10px",
                textAlign: "center",
                color: "var(--ink)",
              }}
            >
              Cek email kamu
            </h2>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 13,
                margin: "0 0 4px",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Kode 6 digit sudah dikirim ke
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                margin: "0 0 24px",
                textAlign: "center",
                wordBreak: "break-all",
                color: "var(--ink)",
              }}
            >
              {values.email || "kamu@email.com"}
              <button
                type="button"
                onClick={() => setStep("form")}
                style={{
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  color: "var(--primary)",
                  fontWeight: 600,
                  fontSize: 12,
                  fontFamily: "inherit",
                  padding: "0 0 0 8px",
                }}
              >
                Ubah
              </button>
            </p>

            {/* 6-digit OTP input */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 14,
                justifyContent: "center",
              }}
              onPaste={onOtpPaste}
            >
              {otp.map((d, i) => (
                <div key={i} style={{ display: "contents" }}>
                  <input
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={d}
                    onChange={(e) => updateOtp(i, e.target.value)}
                    onKeyDown={(e) => onOtpKey(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    disabled={verifying}
                    className="lk-otp-input"
                    style={{
                      width: 48,
                      height: 60,
                      textAlign: "center",
                      fontSize: 24,
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                      borderRadius: 10,
                      border: `1.5px solid ${
                        otpError ? "#DC2626" : d ? "var(--ink)" : "var(--border)"
                      }`,
                      background: otpError
                        ? "rgba(220,38,38,0.04)"
                        : d
                          ? "var(--surface)"
                          : "var(--surface-2)",
                      color: "var(--ink)",
                      outline: "none",
                      transition: "all 0.15s",
                      opacity: verifying ? 0.5 : 1,
                    }}
                  />
                  {i === 2 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "var(--ink-soft)",
                        fontSize: 18,
                        fontWeight: 300,
                      }}
                    >
                      —
                    </div>
                  )}
                </div>
              ))}
            </div>

            {otpError ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#DC2626",
                  marginBottom: 20,
                  padding: "8px 12px",
                  background: "rgba(220,38,38,0.08)",
                  borderRadius: 8,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {otpError}
              </div>
            ) : verifying ? (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  marginBottom: 20,
                  padding: "8px 12px",
                }}
              >
                Memverifikasi…
              </div>
            ) : (
              <div style={{ height: 20, marginBottom: 20 }} />
            )}

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--ink-soft)" }}>
              Email belum masuk? Cek folder spam, atau{" "}
              {resendIn > 0 ? (
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  kirim ulang dalam{" "}
                  <strong style={{ color: "var(--ink)" }}>{resendIn}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resendEmail}
                  style={{
                    background: "none",
                    border: 0,
                    cursor: "pointer",
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: 13,
                    fontFamily: "inherit",
                    padding: 0,
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                  }}
                >
                  kirim ulang
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 11,
              color: "var(--ink-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Verifikasi dilindungi enkripsi end-to-end
          </div>
        </div>
      </div>
    );
  }

  // step === 'form'
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
          maxWidth: 440,
          width: "100%",
          background: "var(--surface)",
          borderRadius: 24,
          padding: "36px 32px",
          border: "1.5px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
        }}
      >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: "0 0 4px",
              color: "var(--ink)",
            }}
          >
            Buat akun baru
          </h2>
          <p
            style={{
              color: "var(--ink-soft)",
              fontSize: 13,
              margin: "0 0 20px",
            }}
          >
            Gratis, cuma butuh 30 detik.
          </p>

          <form onSubmit={submit} noValidate>
            <AuthFormField
              label="Nama"
              required
              value={values.name}
              onChange={(v) => setField("name", v)}
              onBlur={() => blur("name")}
              error={touched.name ? errors.name : null}
              placeholder="Nama lengkap"
              autoComplete="name"
              autoFocus
            />
            <AuthFormField
              label="Email"
              required
              value={values.email}
              onChange={(v) => setField("email", v)}
              onBlur={() => blur("email")}
              error={touched.email ? errors.email : null}
              placeholder="kamu@email.com"
              type="email"
              inputMode="email"
              autoComplete="email"
            />
            <AuthFormField
              label="Password"
              required
              value={values.pw}
              onChange={(v) => setField("pw", v)}
              onBlur={() => blur("pw")}
              error={touched.pw ? errors.pw : null}
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              showToggle
              hint="Minimal 6 karakter"
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
              {submitting ? "Memproses…" : "Daftar →"}
            </button>
          </form>

          {/* Switch ke /login */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--border)",
              textAlign: "center",
              fontSize: 13,
              color: "var(--ink-soft)",
            }}
          >
            Sudah punya akun?{" "}
            <Link
              href={next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
              style={{
                color: "var(--primary)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Masuk di sini →
            </Link>
          </div>
      </div>
    </div>
  );
}
