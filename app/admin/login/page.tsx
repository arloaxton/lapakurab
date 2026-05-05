"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { isSupabaseConfigured } from "@/backend/env";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1.5px solid var(--border)",
  background: "var(--surface)",
  fontSize: 13,
  fontFamily: "inherit",
  color: "var(--ink)",
  outline: "none",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const { authed, login } = useAdmin();
  const [email, setEmail] = useState(
    isSupabaseConfigured() ? "" : "admin@lapakurab.id"
  );
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authed) router.replace("/admin");
  }, [authed, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!isSupabaseConfigured()) {
      // Mock mode (legacy demo): password 'admin123' atau 'demo'
      if (pw === "admin123" || pw === "demo") {
        login();
        router.replace("/admin");
      } else {
        setErr('Email atau password salah. (Demo: password = "admin123")');
      }
      return;
    }

    // Supabase mode: login lewat /api/auth/login, cek role admin
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error ?? "Login gagal");
        return;
      }
      if (data.role !== "admin") {
        setErr("Akses ditolak — akun ini bukan admin.");
        // Logout supaya tidak terbawa session non-admin
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }
      login();
      router.replace("/admin");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login gagal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--primary), var(--lilac))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 18,
              fontFamily: "var(--font-display)",
            }}
          >
            L
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            lapakurab
            <span style={{ color: "var(--ink-soft)", fontWeight: 500, marginLeft: 4 }}>
              · admin
            </span>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="lk-admin-login-form"
          style={{
            background: "var(--surface)",
            borderRadius: 16,
            padding: "32px 28px",
            border: "1px solid var(--border)",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.04), 0 24px 60px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 6px",
              color: "var(--ink)",
            }}
          >
            Masuk ke admin panel
          </h1>
          <p
            style={{
              color: "var(--ink-soft)",
              fontSize: 13,
              margin: "0 0 24px",
            }}
          >
            Kelola produk, order, dan stok akun lapakurab.
          </p>

          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 6,
            }}
          >
            Email admin
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            style={inputStyle}
          />

          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 6,
              marginTop: 14,
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type={show ? "text" : "password"}
              placeholder="••••••••"
              style={{ ...inputStyle, paddingRight: 62 }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
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
              {show ? "Sembunyi" : "Tampil"}
            </button>
          </div>

          {err && (
            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "rgba(220,38,38,0.08)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--danger)",
              }}
            >
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: 0,
              cursor: submitting ? "wait" : "pointer",
              background: submitting ? "var(--ink-soft)" : "var(--ink)",
              color: "white",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "inherit",
              opacity: submitting ? 0.85 : 1,
            }}
          >
            {submitting ? "Memproses…" : "Masuk →"}
          </button>

          {!isSupabaseConfigured() && (
            <div
              style={{
                marginTop: 18,
                padding: 12,
                background: "var(--surface-2)",
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 11,
                color: "var(--ink-soft)",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "var(--ink)" }}>Demo credentials:</strong>
              <br />
              Email: <code>admin@lapakurab.id</code>
              <br />
              Password: <code>admin123</code>
            </div>
          )}

          <Link
            href="/"
            style={{
              marginTop: 14,
              width: "100%",
              padding: "8px",
              background: "none",
              border: 0,
              cursor: "pointer",
              color: "var(--ink-soft)",
              fontSize: 12,
              fontFamily: "inherit",
              textAlign: "center",
              display: "block",
              textDecoration: "none",
            }}
          >
            ← Kembali ke toko
          </Link>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 11,
            color: "var(--ink-soft)",
          }}
        >
          🔒 Akses internal staff lapakurab.id
        </div>
      </div>
    </div>
  );
}
