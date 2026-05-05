"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { AuthFormField } from "@/components/store/AuthFormField";
import { useToast } from "@/components/shared/ToastProvider";
import { useFormValidation } from "@/hooks/useFormValidation";
import { signUp } from "@/lib/data/auth-repo";
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

  const [step, setStep] = useState<"form" | "sent">("form");
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);

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

    // Supabase email confirm flow → tampilkan "cek email" UI
    if (result.needsConfirmation) {
      setStep("sent");
      setResendIn(60);
      toast.success("Link konfirmasi terkirim", `Cek inbox di ${values.email}`);
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
      toast.success("Link terkirim ulang", `Cek inbox di ${values.email}`);
    }
  };

  if (step === "sent") {
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
              Link konfirmasi sudah dikirim ke
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

            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 20,
                fontSize: 13,
                lineHeight: 1.55,
                color: "var(--ink)",
              }}
            >
              Klik tautan konfirmasi di email tersebut untuk mengaktifkan akun.
              Link berlaku <strong>1 jam</strong>. Setelah konfirmasi, kamu bisa{" "}
              <Link
                href="/login"
                style={{ color: "var(--primary)", fontWeight: 600 }}
              >
                masuk di sini
              </Link>
              .
            </div>

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
        className="lk-split-2"
        style={{
          maxWidth: 980,
          width: "100%",
        }}
      >
        {/* Left: visual */}
        <div className="lk-auth-visual" style={{ position: "relative", height: 440 }}>
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 60,
              bottom: 60,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 32,
              transform: "rotate(-3deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 60,
              right: 20,
              bottom: 20,
              background: "linear-gradient(135deg, var(--lilac) 0%, #1A1538 100%)",
              borderRadius: 32,
              transform: "rotate(2deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 30px 80px rgba(123,97,255,0.3)",
            }}
          >
            <div style={{ textAlign: "center", padding: 24 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 48,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Join the
                <br />
                club,
                <br />
                hemat 60%.
              </div>
              <div style={{ marginTop: 16, fontSize: 14, opacity: 0.85 }}>
                Premium accounts, fair price.
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: 32,
            padding: 32,
            border: "1.5px solid var(--border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 24,
              padding: 4,
              background: "var(--bg)",
              borderRadius: 999,
            }}
          >
            <Link
              href={next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 999,
                background: "transparent",
                color: "var(--ink-soft)",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "inherit",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Masuk
            </Link>
            <div
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 999,
                background: "var(--ink)",
                color: "white",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "inherit",
                textAlign: "center",
              }}
            >
              Daftar
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
}
