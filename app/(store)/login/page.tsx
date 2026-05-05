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
                Welcome
                <br />
                back,
                <br />
                member.
              </div>
              <div style={{ marginTop: 16, fontSize: 14, opacity: 0.85 }}>
                Akses akun favoritmu lebih cepat.
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
          {/* Tab switcher */}
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
              Masuk
            </div>
            <Link
              href={next === "/dashboard" ? "/register" : `/register?next=${encodeURIComponent(next)}`}
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
              Daftar
            </Link>
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
        </div>
      </div>
    </div>
  );
}
