"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { FormRow } from "../FormRow";
import { adminInputStyle, primaryBtn, secondaryBtn } from "../ui-styles";
import type { Gateway } from "@/lib/types";

interface GatewayEditModalProps {
  gateway: Gateway;
  onClose: () => void;
  onSave: (g: Gateway) => void | Promise<void>;
}

export function GatewayEditModal({ gateway, onClose, onSave }: GatewayEditModalProps) {
  const [form, setForm] = useState<Gateway>(gateway);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSave = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSave(form);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Gagal simpan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={`Konfig ${gateway.name}`}
      maxWidth={480}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} style={secondaryBtn}>
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            style={{ ...primaryBtn, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}
          >
            {submitting ? "Menyimpan…" : "Simpan"}
          </button>
        </>
      }
    >
      {submitError && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.25)",
            color: "var(--danger, #DC2626)",
            fontSize: 12,
          }}
        >
          {submitError}
        </div>
      )}
      <FormRow label="API key">
        <input
          value={form.key}
          onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
          style={{
            ...adminInputStyle,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
          }}
          placeholder="paste key di sini"
        />
      </FormRow>
      <FormRow label="Fee gateway (%)">
        <input
          type="number"
          step="0.1"
          value={form.fee}
          onChange={(e) => setForm((f) => ({ ...f, fee: +e.target.value }))}
          style={adminInputStyle}
        />
      </FormRow>
    </Modal>
  );
}
