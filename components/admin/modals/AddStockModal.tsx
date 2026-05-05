"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { Field } from "@/components/shared/Field";
import { useToast } from "@/components/shared/ToastProvider";
import { adminInputStyle, primaryBtn, secondaryBtn } from "../ui-styles";
import type { Product } from "@/lib/types";

export interface AddStockForm {
  productId: string;
  lines: string;
}

interface AddStockModalProps {
  products: Product[];
  onClose: () => void;
  onSave: (form: AddStockForm) => void | Promise<void>;
}

export function AddStockModal({ products, onClose, onSave }: AddStockModalProps) {
  const toast = useToast();
  const activeProducts = products.filter((p) => p.active);
  const [productId, setProductId] = useState(activeProducts[0]?.id || "");
  const [lines, setLines] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const linesValid = lines
    .split("\n")
    .filter((l) => l.trim() && l.includes("|")).length;

  const linesError =
    touched && !lines.trim()
      ? "Minimal satu baris akun"
      : touched && linesValid === 0
        ? "Format harus: email | password (satu per baris)"
        : null;

  const submit = async () => {
    setTouched(true);
    if (!productId || !lines.trim() || linesValid === 0) {
      toast.error("Periksa kembali isian.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSave({ productId, lines });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Gagal simpan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Tambah stok akun"
      subtitle="Bulk import kredensial — satu akun per baris."
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
            {submitting ? "Menyimpan…" : `Simpan ${linesValid > 0 ? `(${linesValid} akun)` : ""}`}
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
      <Field label="Produk" required>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          style={adminInputStyle}
        >
          {activeProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Daftar akun"
        required
        hint="Format: email | password — satu akun per baris"
        error={linesError}
      >
        <textarea
          value={lines}
          onChange={(e) => setLines(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={8}
          placeholder={"user1@mail.id | Pass#123\nuser2@mail.id | Pass#456"}
          style={{
            ...adminInputStyle,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: 12,
            resize: "vertical",
          }}
        />
      </Field>
      {lines.trim() && (
        <div
          style={{
            fontSize: 11,
            color: linesValid > 0 ? "var(--success)" : "var(--ink-soft)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {linesValid > 0 ? "✓" : "·"}{" "}
          <span>{linesValid} baris akun valid terdeteksi</span>
        </div>
      )}
    </Modal>
  );
}
