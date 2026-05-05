interface StatusPillProps {
  status: string;
}

const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  paid: { bg: "rgba(91,141,239,0.1)", color: "#3567C8", label: "Dibayar" },
  pending: { bg: "rgba(217,119,6,0.1)", color: "#B45309", label: "Menunggu" },
  delivered: { bg: "rgba(15,139,92,0.1)", color: "#0F8B5C", label: "Terkirim" },
  refunded: { bg: "rgba(122,132,153,0.12)", color: "#7A8499", label: "Refund" },
  failed: { bg: "rgba(220,38,38,0.08)", color: "#DC2626", label: "Gagal" },
  available: { bg: "rgba(15,139,92,0.1)", color: "#0F8B5C", label: "Tersedia" },
  sold: { bg: "rgba(122,132,153,0.12)", color: "#7A8499", label: "Terjual" },
  reserved: { bg: "rgba(217,119,6,0.1)", color: "#B45309", label: "Reserved" },
  expired: { bg: "rgba(122,132,153,0.12)", color: "#7A8499", label: "Expired" },
  active: { bg: "rgba(15,139,92,0.1)", color: "#0F8B5C", label: "Aktif" },
  banned: { bg: "rgba(220,38,38,0.08)", color: "#DC2626", label: "Banned" },
  inactive: { bg: "rgba(122,132,153,0.12)", color: "#7A8499", label: "Nonaktif" },
};

export function StatusPill({ status }: StatusPillProps) {
  const s =
    STATUS_MAP[status] || {
      bg: "var(--surface-2)",
      color: "var(--ink-soft)",
      label: status,
    };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.color,
        }}
      />
      {s.label}
    </span>
  );
}
