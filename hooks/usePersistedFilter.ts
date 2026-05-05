"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * Sync a filter value with a Next.js URL search param.
 * Replacement of legacy `usePersistedFilter` which used window.location.hash.
 *
 * - Reads the current value from `?<key>=...`
 * - Writes via `router.replace` (no scroll, shallow URL update)
 * - Setting value back to `defaultVal` (or empty / "all") removes the param
 */
export function usePersistedFilter<T extends string>(
  key: string,
  defaultVal: T
): [T, (next: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = (searchParams.get(key) ?? defaultVal) as T;

  const setVal = useCallback(
    (next: T) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next == null || next === "" || next === defaultVal || next === ("all" as T)) {
        params.delete(key);
      } else {
        params.set(key, String(next));
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [defaultVal, key, pathname, router, searchParams]
  );

  return [current, setVal];
}
