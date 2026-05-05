"use client";

import { useState } from "react";

export interface SelectionApi<T> {
  ids: Set<string>;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  toggleAll: () => void;
  clear: () => void;
  count: number;
  allSelected: boolean;
  someSelected: boolean;
  selectedItems: T[];
}

/** Multi-select state for tables / bulk actions. */
export function useSelection<T>(items: T[], getId: (x: T) => string = (x) => (x as { id: string }).id): SelectionApi<T> {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const visibleIds = items.map(getId);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => ids.has(id));
  const someSelected = visibleIds.some((id) => ids.has(id));

  return {
    ids,
    has: (id: string) => ids.has(id),
    toggle: (id: string) =>
      setIds((s) => {
        const n = new Set(s);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      }),
    toggleAll: () =>
      setIds((s) => {
        if (allSelected) {
          const n = new Set(s);
          visibleIds.forEach((id) => n.delete(id));
          return n;
        }
        return new Set([...s, ...visibleIds]);
      }),
    clear: () => setIds(new Set()),
    count: ids.size,
    allSelected,
    someSelected,
    selectedItems: items.filter((x) => ids.has(getId(x))),
  };
}
