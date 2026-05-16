"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { Field } from "@/components/shared/Field";
import { useToast } from "@/components/shared/ToastProvider";
import { adminInputStyle, primaryBtn, secondaryBtn } from "../ui-styles";
import { getCredentialFormat } from "@/lib/credential-format";
import type { Product, StockItem, StockStatus } from "@/lib/types";

interface EditStockModalProps {
  stock: StockItem;
  products: Product[];
  onClose: () => void;
  onSave: (id: string, patch: Partial<StockItem>) => void | Promise<void>;
}

const STATUS_OPTIONS: StockStatus[] = ["available", "reserved", "sold", "expired"];

export function EditStockModal({
  stock,
  products,
  onClose,
  onSave,
}: EditStockModalProps) {
  const toast = useToast();
  const product = products.find((p) => p.id === stock.productId);
  const format = product?.credentialFormat || "email_password";
  const formatDef = getCredentialFormat(format);

  const [field1, setField1] = useState(stock.field1 || "");
  const [field2, setField2] = useState(stock.field2 || "");
  const [field3, setField3] = useState(stock.field3 || "");
  const [notes, setNotes] = useState(stock.notes || "");
  const [status, setStatus] = useState<StockStatus>(stock.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (formatDef.fields.field1?.required && !field1.trim()) {
      setError(`${formatDef.fields.field1.label} wajib diisi`);
      return;
    }
    if (formatDef.fields.field2?.required && !field2.trim()) {
      setError(`${formatDef.fields.field2.label} wajib diisi`);
      return;
    }
    if (formatDef.fields.field3?.required && !field3.trim()) {
      setError(`${formatDef.fields.field3.label} wajib diisi`);
      return;
    }
    setSubmitting(true);
    try {
      await onSave(stock.id, {
        field1: field1.trim(),
        field2: field2.trim(),
        field3: field3.trim(),
        notes: notes.trim(),
        status,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal simpan";
      setError(msg);
      toast.error("Gagal simpan", msg);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Edit stok kredensial"
      subtitle={`${product?.name || "Produk"} · ${stock.accountType === "sharing" ? "Sharing" : "Private"}`}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} style={secondaryBtn}>
            Batal
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            style={{ ...primaryBtn, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}
          >
            {submitting ? "Menyimpan…" : "Simpan perubahan"}
          </button>
        </>
      }
    >
      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.25)",
            color: "#DC2626",
            fontSize: 12,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      {formatDef.fields.field1 && (
        <Field
          label={formatDef.fields.field1.label}
          required={formatDef.fields.field1.required}
        >
          <input
            value={field1}
            onChange={(e) => setField1(e.target.value)}
            placeholder={formatDef.fields.field1.placeholder}
            style={adminInputStyle}
          />
        </Field>
      )}
      {formatDef.fields.field2 && (
        <Field
          label={formatDef.fields.field2.label}
          required={formatDef.fields.field2.required}
        >
          <input
            value={field2}
            onChange={(e) => setField2(e.target.value)}
            placeholder={formatDef.fields.field2.placeholder}
            style={adminInputStyle}
            type={formatDef.fields.field2.sensitive ? "text" : "text"}
          />
        </Field>
      )}
      {formatDef.fields.field3 && (
        <Field
          label={formatDef.fields.field3.label}
          required={formatDef.fields.field3.required}
        >
          <input
            value={field3}
            onChange={(e) => setField3(e.target.value)}
            placeholder={formatDef.fields.field3.placeholder}
            style={adminInputStyle}
          />
        </Field>
      )}
      {formatDef.fields.notes && (
        <Field label={formatDef.fields.notes.label}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={formatDef.fields.notes.placeholder}
            rows={3}
            style={{ ...adminInputStyle, resize: "vertical" }}
          />
        </Field>
      )}
      <Field label="Status">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StockStatus)}
          style={adminInputStyle}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
    </Modal>
  );
}
