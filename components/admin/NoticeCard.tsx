interface NoticeCardProps {
  icon: string;
  color: string;
  title: string;
  desc: string;
}

export function NoticeCard({ icon, color, title, desc }: NoticeCardProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 14,
        display: "flex",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: color,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: "var(--ink)" }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{desc}</div>
      </div>
    </div>
  );
}
