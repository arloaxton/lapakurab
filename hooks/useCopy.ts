"use client";

import { useCallback } from "react";
import { useToast } from "@/components/shared/ToastProvider";

export function useCopy() {
  const t = useToast();
  return useCallback(
    async (text: string, label = "Disalin") => {
      try {
        await navigator.clipboard.writeText(text);
        t.success(
          label,
          '"' + (text.length > 30 ? text.slice(0, 28) + "…" : text) + '" disalin ke clipboard.',
          { duration: 2200 }
        );
      } catch {
        t.error("Gagal menyalin", "Browser kamu blokir clipboard. Salin manual ya.");
      }
    },
    [t]
  );
}
