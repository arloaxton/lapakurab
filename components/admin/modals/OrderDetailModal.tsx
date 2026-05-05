"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { DetailRow } from "../DetailRow";
import { StatusPill } from "../StatusPill";
import { useToast } from "@/components/shared/ToastProvider";
import { useCopy } from "@/hooks/useCopy";
import { primaryBtn, secondaryBtn, miniBtn } from "../ui-styles";
import { fmtIDR, fmtDate } from "@/lib/format";
import type { AdminOrder, AdminOrderStatus } from "@/lib/types";

interface OrderDetailModalProps {
  order: AdminOrder;
  onClose: () => void;
  setStatus: (id: string, status: AdminOrderStatus) => void;
}

export function OrderDetailModal({ order, onClose, setStatus }: OrderDetailModalProps) {
  const toast = useToast();
  const copy = useCopy();
  const [showPw, setShowPw] = useState(false);
  const isPaidOrDelivered =
    order.status === "paid" || order.status === "delivered";

  const fakeEmail = `delivered+${order.id.slice(-3)}@lapakurab.id`;
  const fakePassword = `Px9#${order.id.slice(-4)}!Q`;

  return (
    <Modal
      onClose={onClose}
      title={`#${order.id}`}
      subtitle={fmtDate(order.date)}
      maxWidth={520}
      footer={
        <>
          {isPaidOrDelivered && (
            <button
              onClick={() => {
                setStatus(order.id, "refunded");
                onClose();
                toast.success(
                  "Refund diproses",
                  `#${order.id} dikembalikan ke pelanggan.`
                );
              }}
              style={{
                ...secondaryBtn,
                color: "var(--danger)",
                borderColor: "rgba(220,38,38,0.3)",
              }}
            >
              Refund
            </button>
          )}
          <button onClick={onClose} style={primaryBtn}>
            Tutup
          </button>
        </>
      }
    >
      <div>
        <DetailRow label="Status">
          <StatusPill status={order.status} />
        </DetailRow>
        <DetailRow label="Pelanggan">
          <div>{order.customer}</div>
          <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{order.email}</div>
        </DetailRow>
        <DetailRow label="Produk">
          <div>{order.product}</div>
          <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{order.duration}</div>
        </DetailRow>
        <DetailRow label="Pembayaran">{order.payment}</DetailRow>
        <DetailRow label="Total">
          <span
            style={{
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtIDR(order.total)}
          </span>
        </DetailRow>

        {isPaidOrDelivered && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: "var(--surface-2)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 12 }}>
                Kredensial yang dikirim ke pembeli
              </div>
              <button
                onClick={() =>
                  copy(`Email: ${fakeEmail}\nPassword: ${fakePassword}`, "Kredensial")
                }
                style={{ ...miniBtn, padding: "2px 8px", fontSize: 10 }}
              >
                Salin
              </button>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: 12,
              }}
            >
              <div>
                Email: <span style={{ fontWeight: 500 }}>{fakeEmail}</span>
              </div>
              <div>
                Pass:{" "}
                <span style={{ fontWeight: 500 }}>
                  {showPw ? fakePassword : "•••••••••"}{" "}
                  <button
                    onClick={() => setShowPw((s) => !s)}
                    style={{ ...miniBtn, padding: "1px 6px", fontSize: 10 }}
                  >
                    {showPw ? "Sembunyi" : "Tampil"}
                  </button>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
