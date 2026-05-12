"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/shared/ToastProvider";

interface Props {
  orderId: string;
}

interface OtpResponse {
  ok: boolean;
  found: boolean;
  code?: string;
  subject?: string;
  receivedAt?: string;
  message?: string;
  error?: string;
}

/**
 * Button "Ambil OTP" untuk credential Netflix.
 * Auto-poll setiap 5 detik selama "watching" state aktif.
 * Stop polling kalau code ketemu atau user klik "Berhenti".
 */
export function NetflixOtpButton({ orderId }: Props) {
  const toast = useToast();
  const [watching, setWatching] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [receivedAt, setReceivedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setWatching(false);
  }, []);

  const fetchOtp = useCallback(async () => {
    try {
      const res = await fetch(`/api/me/netflix-otp?orderId=${encodeURIComponent(orderId)}`);
      const data: OtpResponse = await res.json();
      setLastChecked(new Date());
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
        stopPolling();
        return;
      }
      setError(null);
      if (data.found && data.code) {
        setCode(data.code);
        setReceivedAt(data.receivedAt || null);
        stopPolling();
        toast.success("OTP Netflix diterima", `Kode: ${data.code}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal fetch OTP");
      stopPolling();
    }
  }, [orderId, stopPolling, toast]);

  const start = useCallback(() => {
    setCode(null);
    setReceivedAt(null);
    setError(null);
    setWatching(true);
    fetchOtp(); // langsung cek sekali
    pollRef.current = setInterval(fetchOtp, 5000);
  }, [fetchOtp]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const copy = useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code).catch(() => {});
    toast.success("Kode disalin", code);
  }, [code, toast]);

  // Tampilkan code kalau ada
  if (code) {
    return (
      <div
        style={{
          marginTop: 10,
          padding: "12px 14px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #E50914 0%, #B30710 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", opacity: 0.9 }}>
            KODE OTP NETFLIX
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.1em",
              marginTop: 2,
            }}
          >
            {code}
          </div>
          {receivedAt && (
            <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
              Diterima {new Date(receivedAt).toLocaleTimeString("id-ID")}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={copy}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1.5px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontWeight: 700,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Salin
          </button>
          <button
            onClick={() => setCode(null)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1.5px solid rgba(255,255,255,0.4)",
              background: "transparent",
              color: "white",
              fontWeight: 600,
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      {!watching ? (
        <button
          onClick={start}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1.5px solid #E50914",
            background: "rgba(229,9,20,0.06)",
            color: "#E50914",
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>📩</span>
          Ambil OTP Netflix
        </button>
      ) : (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--surface-2)",
            border: "1.5px dashed var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#E50914",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
                Menunggu OTP Netflix…
              </div>
              <div style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 2 }}>
                Login Netflix sekarang, kode muncul otomatis di sini.
                {lastChecked &&
                  ` · Cek terakhir ${lastChecked.toLocaleTimeString("id-ID")}`}
              </div>
            </div>
          </div>
          <button
            onClick={stopPolling}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--ink-soft)",
              fontSize: 10,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Berhenti
          </button>
        </div>
      )}
      {error && (
        <div
          style={{
            marginTop: 6,
            padding: "8px 10px",
            borderRadius: 8,
            background: "rgba(220,38,38,0.08)",
            color: "#DC2626",
            fontSize: 11,
          }}
        >
          {error}
        </div>
      )}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
