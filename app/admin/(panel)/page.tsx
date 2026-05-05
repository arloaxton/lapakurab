"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { NoticeCard } from "@/components/admin/NoticeCard";
import { fmtIDR } from "@/lib/format";

const CHART_BY_PERIOD: Record<string, number[]> = {
  "14": [12, 18, 15, 22, 28, 24, 32, 38, 35, 42, 48, 44, 52, 58],
  "30": [
    8, 12, 15, 11, 18, 22, 19, 24, 28, 25, 30, 35, 32, 38, 42, 40, 45, 50, 48, 52, 55, 60, 58,
    62, 65, 70, 68, 72, 75, 80,
  ],
  "90": Array.from({ length: 30 }, (_, i) => Math.round(20 + Math.sin(i / 3) * 15 + i * 0.8)),
};

const SELECT_STYLE: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: 8,
  border: "1.5px solid var(--border)",
  background: "var(--surface)",
  fontSize: 11,
  fontFamily: "inherit",
  color: "var(--ink)",
  outline: "none",
  cursor: "pointer",
};

export default function AdminDashboardPage() {
  const { orders, products, users, stock } = useAdmin();
  const [period, setPeriod] = useState<"14" | "30" | "90">("14");

  const revenue = orders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => p.stock <= 5 && p.active).length;
  const availStock = stock.filter((s) => s.status === "available").length;

  const chart = CHART_BY_PERIOD[period];
  const maxC = Math.max(...chart);

  const topProducts = useMemo(() => {
    const productSales: Record<string, number> = {};
    orders.forEach((o) => {
      productSales[o.product] = (productSales[o.product] || 0) + 1;
    });
    return Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [orders]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan performa toko 14 hari terakhir."
      />

      <div className="lk-grid-4" style={{ gap: 14, marginBottom: 24 }}>
        <StatCard label="Pendapatan" value={fmtIDR(revenue)} delta="+18.4%" accent="var(--primary)" />
        <StatCard label="Total Pesanan" value={orders.length} delta="+12.0%" accent="var(--mint)" />
        <StatCard label="Member" value={users.length} delta="+5.2%" accent="var(--lilac)" />
        <StatCard
          label="Stok tersedia"
          value={availStock}
          delta={lowStock > 0 ? `-${lowStock} low` : "+0"}
          accent="var(--peach)"
        />
      </div>

      <div
        className="lk-admin-2col"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {/* Revenue chart */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>
                Pendapatan harian
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                Per hari, 14 hari terakhir
              </div>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "14" | "30" | "90")}
              style={SELECT_STYLE}
            >
              <option value="14">14 hari</option>
              <option value="30">30 hari</option>
              <option value="90">90 hari</option>
            </select>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              height: 140,
              padding: "0 4px",
            }}
          >
            {chart.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${(v / maxC) * 100}%`,
                    background: "linear-gradient(180deg, var(--primary), rgba(91,141,239,0.4))",
                    borderRadius: "4px 4px 0 0",
                    minHeight: 4,
                  }}
                />
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--ink-soft)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <div
            style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: "var(--ink)" }}
          >
            Produk terlaris
          </div>
          {topProducts.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Belum ada penjualan.</div>
          )}
          {topProducts.map(([name, count], i) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: i < topProducts.length - 1 ? "1px solid var(--border)" : 0,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--ink-soft)",
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "var(--ink)",
                  }}
                >
                  {name}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--ink)",
                }}
              >
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notices */}
      <div className="lk-grid-3" style={{ gap: 12 }}>
        <NoticeCard
          icon="◐"
          color="var(--warn)"
          title={`${pendingCount} pesanan menunggu`}
          desc="Cek tab Pesanan untuk konfirmasi."
        />
        <NoticeCard
          icon="◇"
          color="var(--danger)"
          title={`${lowStock} produk stok menipis`}
          desc="Tambah stok akun atau nonaktifkan."
        />
        <NoticeCard
          icon="✓"
          color="var(--success)"
          title="Sistem normal"
          desc="Semua gateway pembayaran aktif."
        />
      </div>
    </div>
  );
}
