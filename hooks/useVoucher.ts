"use client";

import { useState, useCallback } from "react";
import type { Voucher } from "@/lib/types";
import { SEED_VOUCHERS } from "@/lib/mock";

export interface AppliedVoucher {
  voucher: Voucher;
  discount: number;
}

/**
 * Cart-side voucher logic. Reads vouchers from seed data (in real app:
 * /admin updates persist to localStorage; could be wired up later via a
 * shared store).
 */
export function useVoucher(subtotal: number) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<AppliedVoucher | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(() => {
    setError(null);
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) {
      setError("Masukkan kode voucher dulu");
      return false;
    }
    const v = SEED_VOUCHERS.find((x) => x.code.toUpperCase() === cleaned);
    if (!v) {
      setError("Kode voucher tidak ditemukan");
      return false;
    }
    if (!v.active) {
      setError("Voucher sudah tidak aktif");
      return false;
    }
    if (new Date(v.expires) < new Date()) {
      setError("Voucher sudah kadaluwarsa");
      return false;
    }
    if (v.limit > 0 && v.used >= v.limit) {
      setError("Voucher sudah mencapai limit pemakaian");
      return false;
    }
    if (subtotal < v.minOrder) {
      setError(
        `Min. order Rp${v.minOrder.toLocaleString("id-ID")} untuk voucher ini`
      );
      return false;
    }
    const discount =
      v.type === "percent"
        ? Math.round((subtotal * v.value) / 100)
        : Math.min(v.value, subtotal);
    setApplied({ voucher: v, discount });
    return true;
  }, [code, subtotal]);

  const remove = useCallback(() => {
    setApplied(null);
    setCode("");
    setError(null);
  }, []);

  return {
    code,
    setCode,
    applied,
    error,
    apply,
    remove,
    discount: applied?.discount ?? 0,
  };
}
