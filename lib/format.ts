import type { Currency } from "./types";

export const fmtIDR = (n: number): string =>
  "Rp" + (n || 0).toLocaleString("id-ID");

export const fmtUSD = (n: number): string => "$" + (n / 15500).toFixed(2);

export const fmtPrice = (n: number, currency: Currency = "IDR"): string =>
  currency === "USD" ? fmtUSD(n) : fmtIDR(n);

export const fmtDate = (s: string): string => {
  const d = new Date(s);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const fmtDateTime = (s: string): string => {
  const d = new Date(s);
  return (
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
};

export const relTime = (iso: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return Math.floor(diff / 60) + " menit lalu";
  if (diff < 86400) return Math.floor(diff / 3600) + " jam lalu";
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + " hari lalu";
  return fmtDate(iso);
};

export const downloadCSV = (filename: string, rows: (string | number | null | undefined)[][]) => {
  const csv = rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c == null ? "" : c);
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
