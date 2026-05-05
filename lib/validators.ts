// Shared form validators — return error string or null.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+?62|0)8\d{7,12}$/;

export const required = (msg = "Wajib diisi") => (v: unknown) =>
  !v || (typeof v === "string" && !v.trim()) ? msg : null;

export const email = (msg = "Format email tidak valid") => (v: string) => {
  if (!v || !v.trim()) return "Email wajib diisi";
  if (!EMAIL_RE.test(v.trim())) return msg;
  return null;
};

export const minLength = (n: number, msg?: string) => (v: string) => {
  if (!v) return null;
  if (v.length < n) return msg ?? `Minimal ${n} karakter`;
  return null;
};

export const password = (min = 6) => (v: string) => {
  if (!v) return "Password wajib diisi";
  if (v.length < min) return `Password minimal ${min} karakter`;
  return null;
};

export const phoneID = () => (v: string) => {
  if (!v || !v.trim()) return "Nomor WhatsApp wajib diisi";
  const cleaned = v.replace(/[\s-]/g, "");
  if (!PHONE_RE.test(cleaned)) return "Format harus 08xxx atau +62 8xxx";
  return null;
};

export const name = (min = 2) => (v: string) => {
  if (!v || !v.trim()) return "Nama wajib diisi";
  if (v.trim().length < min) return `Nama minimal ${min} karakter`;
  return null;
};

export const numberMin = (min: number, msg?: string) => (v: number) => {
  if (v == null || isNaN(Number(v))) return "Wajib diisi";
  if (Number(v) < min) return msg ?? `Minimal ${min}`;
  return null;
};

export const numberRange = (min: number, max: number) => (v: number) => {
  if (v < min || v > max) return `Harus antara ${min}–${max}`;
  return null;
};
