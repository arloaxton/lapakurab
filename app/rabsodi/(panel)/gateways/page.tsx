"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusPill } from "@/components/admin/StatusPill";
import { GatewayEditModal } from "@/components/admin/modals/GatewayEditModal";
import { miniBtn } from "@/components/admin/ui-styles";
import { useToast } from "@/components/shared/ToastProvider";
import type { Gateway } from "@/lib/types";
import { isSupabaseConfigured } from "@/backend/env";
import { updateGatewayClient } from "@/lib/data/settings-client";

export default function AdminGatewaysPage() {
  const { gateways, updateGateways, logAudit } = useAdmin();
  const toast = useToast();
  const [editing, setEditing] = useState<Gateway | null>(null);

  const useApi = isSupabaseConfigured();

  const toggle = async (id: string) => {
    const prev = gateways.find((g) => g.id === id);
    if (!prev) return;
    const next = !prev.enabled;
    updateGateways((list) =>
      list.map((g) => (g.id === id ? { ...g, enabled: next } : g))
    );
    if (useApi) {
      try {
        await updateGatewayClient(id, { enabled: next });
      } catch (e) {
        updateGateways((list) =>
          list.map((g) => (g.id === id ? { ...g, enabled: !next } : g))
        );
        toast.error("Gagal toggle", e instanceof Error ? e.message : "Coba lagi.");
      }
    }
  };

  const save = async (g: Gateway) => {
    // Errors propagate ke modal (modal show inline + stays open).
    if (useApi) {
      const saved = await updateGatewayClient(g.id, {
        name: g.name,
        enabled: g.enabled,
        fee: g.fee,
        key: g.key,
      });
      updateGateways((list) => list.map((x) => (x.id === saved.id ? saved : x)));
    } else {
      updateGateways((list) => list.map((x) => (x.id === g.id ? g : x)));
    }
    logAudit("gateway.update", g.name, "API key diperbarui");
    toast.success("Gateway disimpan", g.name);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Pembayaran"
        subtitle="Aktifkan/nonaktifkan metode pembayaran dan kelola API key gateway."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {gateways.map((g) => (
          <div
            key={g.id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, color: "var(--ink)" }}>
                  {g.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                  Fee: {g.fee}% per transaksi
                </div>
              </div>
              <label
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: 36,
                  height: 20,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={g.enabled}
                  onChange={() => toggle(g.id)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    background: g.enabled ? "var(--ink)" : "var(--border)",
                    transition: "0.2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: g.enabled ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "white",
                      transition: "0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </span>
              </label>
            </div>

            <div
              style={{
                background: "var(--surface-2)",
                borderRadius: 6,
                padding: "8px 10px",
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: 11,
                color: "var(--ink-soft)",
                marginBottom: 10,
                border: "1px solid var(--border)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {g.key || "— belum diset —"}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <StatusPill status={g.enabled ? "active" : "inactive"} />
              <button onClick={() => setEditing(g)} style={miniBtn}>
                Edit API key
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <GatewayEditModal
          gateway={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
