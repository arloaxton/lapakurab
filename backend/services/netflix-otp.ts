/**
 * Fetch latest Netflix OTP code dari tempmail inbox.
 *
 * Flow:
 *   1. Lookup inbox by email (admin sudah simpan email tempmail di stock.field1)
 *   2. List recent messages (last 10 menit)
 *   3. Filter: from Netflix domain ATAU subject mengandung "Netflix"
 *   4. Get detail message terbaru, extract 4-digit code via regex
 *
 * Netflix kirim banyak jenis email (login code, password change, dll).
 * Yang kita target: subject seperti "Your Netflix sign-in code", "Netflix:
 * Your one-time code", "Important: Your Netflix code". Body biasanya
 * contain 4-digit code di dalam table/heading.
 */

import {
  findInboxByEmail,
  listMessages,
  getMessageText,
} from "./tempmail";

export interface NetflixOtpResult {
  code: string;
  subject: string;
  receivedAt: string;
  messageId: string;
}

const NETFLIX_FROM_PATTERNS = [
  /netflix\.com/i,
  /info@account\.netflix/i,
  /no-reply@netflix/i,
];

const NETFLIX_SUBJECT_PATTERNS = [
  /netflix/i,
  /sign[- ]?in code/i,
  /one[- ]?time code/i,
  /kode masuk/i,
  /verifikasi/i,
];

// Netflix OTP biasanya 4 digit. Kadang 6 digit. Cari yang paling prominent.
const OTP_PATTERNS = [
  // Common: "code is 1234", "code: 1234", "kode: 1234"
  /\b(?:code|kode)[\s:]*([0-9]{4,6})\b/i,
  // Sometimes: "Enter this code: 1234"
  /enter\s+(?:this|the)\s+code[\s:]*([0-9]{4,6})/i,
  // Fallback: standalone 4-digit number after newline/space (less reliable)
  /(?:^|\s|>)([0-9]{4})(?:\s|<|$)/m,
];

function isNetflixMessage(msg: { from: string; subject: string }): boolean {
  const from = msg.from || "";
  const subject = msg.subject || "";
  if (NETFLIX_FROM_PATTERNS.some((re) => re.test(from))) return true;
  if (NETFLIX_SUBJECT_PATTERNS.some((re) => re.test(subject))) return true;
  return false;
}

function extractOtpCode(text: string): string | null {
  if (!text) return null;
  for (const re of OTP_PATTERNS) {
    const m = text.match(re);
    if (m && m[1]) {
      // Filter: harus 4-6 digit
      const code = m[1];
      if (code.length >= 4 && code.length <= 6) return code;
    }
  }
  return null;
}

/**
 * Ambil OTP Netflix terbaru untuk email tertentu.
 * Return null kalau:
 *   - Inbox belum ada (admin belum bikin di tempmail)
 *   - Tidak ada email Netflix dalam `lookbackMinutes` terakhir
 *   - Email ada tapi tidak ada kode terdeteksi (mis. format aneh)
 */
export async function fetchLatestNetflixOtp(
  email: string,
  lookbackMinutes = 10
): Promise<NetflixOtpResult | null> {
  const inbox = await findInboxByEmail(email);
  if (!inbox) return null;

  const since = new Date(Date.now() - lookbackMinutes * 60 * 1000).toISOString();
  const messages = await listMessages(inbox.id, { since, limit: 20 });
  if (messages.length === 0) return null;

  // Sort by received_at desc, ambil yang Netflix
  const netflix = messages
    .filter(isNetflixMessage)
    .sort((a, b) => b.received_at.localeCompare(a.received_at));
  if (netflix.length === 0) return null;

  // Loop dari terbaru; ambil yang punya code valid
  for (const msg of netflix) {
    const detail = await getMessageText(msg.id);
    const body = detail.text || detail.body || detail.html || "";
    const code = extractOtpCode(body) ?? extractOtpCode(msg.subject);
    if (code) {
      return {
        code,
        subject: msg.subject,
        receivedAt: msg.received_at,
        messageId: msg.id,
      };
    }
  }
  return null;
}
