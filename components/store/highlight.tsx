import type { ReactNode } from "react";

/** Highlight a query substring inside text — case-insensitive. */
export function highlightMatch(text: string, query: string): ReactNode {
  if (!query || !query.trim()) return text;
  const q = query.trim();
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark
        style={{
          background: "rgba(255,107,157,0.22)",
          color: "var(--ink)",
          padding: 0,
          borderRadius: 2,
          fontWeight: 700,
        }}
      >
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}
