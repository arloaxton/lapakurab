/**
 * Email sender — dual mode: SMTP (Postfix lokal / external) atau Resend API.
 *
 * Priority:
 *   1. Kalau SMTP_HOST di-set → pakai SMTP via nodemailer
 *   2. Kalau RESEND_API_KEY di-set → pakai Resend HTTP API
 *   3. Else → no-op (return skipped)
 *
 * Kalau env kosong, fungsi `sendEmail` no-op (return `{ ok: false, skipped: true }`)
 * supaya server tidak crash di dev.
 */

import { env, isEmailConfigured, isSmtpConfigured } from "../../env";
import nodemailer, { type Transporter } from "nodemailer";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  ok: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
}

// Lazy-init transporter — cache after first use untuk reuse koneksi.
let smtpTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter {
  if (smtpTransporter) return smtpTransporter;
  smtpTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE, // true untuk port 465; false untuk 25/587 (STARTTLS upgrade kalau available)
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    // Untuk Postfix lokal di-localhost tanpa TLS: ignoreTLS opsional
    ignoreTLS: env.SMTP_HOST === "localhost" || env.SMTP_HOST === "127.0.0.1",
    // Connection pool — reuse connection antar kirim
    pool: true,
    maxConnections: 5,
  });
  return smtpTransporter;
}

async function sendViaSmtp(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const t = getSmtpTransporter();
    const info = await t.sendMail({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return { ok: true, id: info.messageId };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "smtp send failed",
    };
  }
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!res.ok) {
      return { ok: false, error: data?.message || `HTTP ${res.status}` };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "resend send failed",
    };
  }
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return { ok: false, skipped: true };
  }
  if (isSmtpConfigured()) {
    return sendViaSmtp(input);
  }
  return sendViaResend(input);
}
