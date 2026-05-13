/**
 * Parse durasi langganan (string label) → jumlah hari.
 * Dipakai untuk hitung expires_at = delivered_at + days.
 *
 * Format yang di-support:
 *   "1 Bulan", "3 Bulan", "6 Bulan", "1 Tahun", "2 Tahun"
 *   Case-insensitive, fallback 30 hari kalau gak match.
 */

export function durationToDays(duration: string): number {
  const s = duration.trim().toLowerCase();
  const m = s.match(/^(\d+)\s+(bulan|tahun|hari|minggu|month|year|day|week)/);
  if (!m) return 30; // default 1 bulan
  const n = parseInt(m[1], 10);
  const unit = m[2];
  switch (unit) {
    case "hari":
    case "day":
      return n;
    case "minggu":
    case "week":
      return n * 7;
    case "bulan":
    case "month":
      return n * 30;
    case "tahun":
    case "year":
      return n * 365;
    default:
      return 30;
  }
}
