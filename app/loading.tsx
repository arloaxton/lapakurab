export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: "var(--ink-soft)",
        fontSize: 13,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: 18,
          height: 18,
          border: "2px solid var(--border)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "tk-spin 0.8s linear infinite",
        }}
      />
      Memuat…
    </div>
  );
}
