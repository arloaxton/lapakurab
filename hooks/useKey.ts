"use client";

import { useEffect } from "react";

/**
 * Listen for a keyboard combo and call handler.
 * combo format: "Escape", "Enter", "$mod+k", "$mod+Enter", "shift+$mod+p"
 *   $mod  = Cmd (mac) or Ctrl (win/linux)
 *   shift = ShiftKey
 *   alt   = AltKey
 */
export function useKey(
  combo: string,
  handler: (e: KeyboardEvent) => void,
  deps: unknown[] = []
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const parts = combo.toLowerCase().split("+");
      const key = parts[parts.length - 1];
      const needMod = parts.includes("$mod");
      const needShift = parts.includes("shift");
      const needAlt = parts.includes("alt");

      const k = e.key.toLowerCase();
      if (k !== key) return;
      if (needMod && !(e.metaKey || e.ctrlKey)) return;
      if (!needMod && (e.metaKey || e.ctrlKey)) return;
      if (needShift !== e.shiftKey) return;
      if (needAlt !== e.altKey) return;

      handler(e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
