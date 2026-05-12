"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { AuthFormField } from "@/components/store/AuthFormField";
import { useToast } from "@/components/shared/ToastProvider";
import { useFormValidation } from "@/hooks/useFormValidation";
import { signIn } from "@/lib/data/auth-repo";
import * as v from "@/lib/validators";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

interface LoginValues {
  email: string;
  pw: string;
}

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  const { setUser } = useStore();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, touched, setField, blur, validate, touchAll } =
    useFormValidation<LoginValues>(
      { email: "", pw: "" },
      {
        email: v.email(),
        pw: v.password(6),
      }
    );

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      touchAll();
      toast.error("Periksa data login", "Email atau password belum sesuai.");
      return;
    }
    setSubmitting(true);
    const result = await signIn({ email: values.email, password: values.pw });
    setSubmitting(false);
    if (!result.user) {
      toast.error("Login gagal", result.error ?? "Coba lagi.");
      return;
    }
    setUser(result.user);
    toast.success("Selamat datang", `Halo, ${result.user.name}!`);
    router.push(next);
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
            Masuk akun
          </h2>
          <p
            style={{
              color: "var(--ink-soft)",
              fontSize: 13,
              margin: "0 0 20px",
            }}
          >
            Selamat datang kembali!
          </p>

          <form onSubmit={submit} noValidate>
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
              autoFocus
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
              autoComplete="current-password"
              showToggle
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
              {submitting ? "Memproses…" : "Masuk →"}
            </button>

            <div style={{ textAlign: "center", marginTop: 12 }}>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Lupa password?
              </Link>
            </div>
          </form>

          {/* Switch ke /register */}
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
            Belum punya akun?{" "}
            <Link
              href={next === "/dashboard" ? "/register" : `/register?next=${encodeURIComponent(next)}`}
              style={{
                color: "var(--primary)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Daftar di sini →
            </Link>
          </div>
      </div>
    </div>
  );
}
