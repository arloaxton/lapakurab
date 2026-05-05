"use client";

import { useEffect, useMemo, useState } from "react";

export interface PaginationApi<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
  setPage: (n: number) => void;
  prev: () => void;
  next: () => void;
  rangeLabel: string; // e.g. "1–10 dari 42"
}

/**
 * Slice an array into pages with bounded page index. Auto-clamps if items
 * shrink below current page (e.g. setelah filter / delete).
 */
export function usePagination<T>(items: T[], pageSize = 10): PaginationApi<T> {
  const [page, setPageState] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp page if list shrinks
  useEffect(() => {
    if (page > totalPages) setPageState(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;

  const sliced = useMemo(() => items.slice(start, end), [items, start, end]);

  const rangeLabel = totalItems === 0
    ? "0 hasil"
    : `${start + 1}–${Math.min(end, totalItems)} dari ${totalItems}`;

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    items: sliced,
    setPage: (n) => setPageState(Math.max(1, Math.min(totalPages, n))),
    prev: () => setPageState((p) => Math.max(1, p - 1)),
    next: () => setPageState((p) => Math.min(totalPages, p + 1)),
    rangeLabel,
  };
}
