"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { FormRow } from "../FormRow";
import { adminInputStyle, primaryBtn, secondaryBtn } from "../ui-styles";
import type { Category } from "@/lib/types";

export interface CategoryFormValues {
  id: string;
  label: string;
  emoji: string;
  description: string;
  sortOrder: number;
  active: boolean;
}

interface CategoryFormModalProps {
  /** null = create new, Category = edit existing (id immutable). */
  initial: Category | null;
  onClose: () => void;
  onSave: (values: CategoryFormValues) => void | Promise<void>;
}

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export function CategoryFormModal({ initial, onClose, onSave }: CategoryFormModalProps) {
  const isEdit = initial !== null;
  const [form, setForm] = useState<CategoryFormValues>({
    id: initial?.id ?? "",
    label: initial?.label ?? "",
    emoji: initial?.emoji ?? "✦",
    description: initial?.description ?? "",
    sortOrder: initial?.sortOrder ?? 100,
    active: initial?.active !== false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const upd = <K extends keyof CategoryFormValues>(k: K, v: CategoryFormValues[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSubmitError(null);
  };

  const handleSave = async () => {
    setSubmitError(null);
    // Client-side validation
    if (!form.label.trim()) {
      setSubmitError("Nama kategori wajib diisi");
      return;
    }
    if (!isEdit) {
      if (!form.id.trim()) {
        setSubmitError("ID (slug) wajib diisi");
        return;
      }
      if (!SLUG_REGEX.test(form.id)) {
        setSubmitError(
          "Slug hanya huruf kecil, angka, dan tanda hubung (mis. 'streaming', 'cloud-gaming')"
        );
        return;
      }
    }
    setSubmitting(true);
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
      title={isEdit ? `Edit kategori: ${initial!.label}` : "Tambah kategori baru"}
      maxWidth={520}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} style={secondaryBtn}>
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            style={{
              ...primaryBtn,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Menyimpan…" : isEdit ? "Simpan" : "Buat kategori"}
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

      <FormRow label="ID (slug)" hint={isEdit ? "Tidak bisa diubah setelah dibuat" : "Lowercase, angka, tanda hubung. Akan dipakai di URL (mis. /catalog?cat=streaming)"}>
        <input
          value={form.id}
          onChange={(e) => upd("id", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          disabled={isEdit}
          style={{
            ...adminInputStyle,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            opacity: isEdit ? 0.6 : 1,
          }}
          placeholder="streaming, vpn, cloud-gaming"
        />
      </FormRow>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 12 }}>
        <FormRow label="Nama tampilan">
          <input
            value={form.label}
            onChange={(e) => upd("label", e.target.value)}
            style={adminInputStyle}
            placeholder="cth. Streaming Premium"
          />
        </FormRow>
        <FormRow label="Emoji">
          <input
            value={form.emoji}
            onChange={(e) => upd("emoji", e.target.value)}
            style={{
              ...adminInputStyle,
              textAlign: "center",
              fontSize: 18,
            }}
            placeholder="✦"
          />
        </FormRow>
      </div>

      <FormRow label="Deskripsi (opsional)" hint="Muncul di header katalog untuk SEO. Maks 280 karakter.">
        <textarea
          value={form.description}
          onChange={(e) => upd("description", e.target.value)}
          rows={3}
          style={{ ...adminInputStyle, resize: "vertical", fontFamily: "inherit" }}
          placeholder="Akun streaming dengan kualitas terbaik..."
        />
      </FormRow>

      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
        <FormRow label="Urutan">
          <input
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(e) => upd("sortOrder", Number(e.target.value) || 0)}
            style={adminInputStyle}
          />
        </FormRow>
        <FormRow label="Status">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              border: "1px solid var(--border)",
              borderRadius: 10,
              cursor: "pointer",
              background: form.active ? "rgba(34,197,94,0.06)" : "var(--surface)",
            }}
          >
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => upd("active", e.target.checked)}
              style={{ accentColor: "var(--primary)" }}
            />
            <span style={{ fontSize: 13, color: "var(--ink)" }}>
              {form.active ? "Aktif (tampil di storefront)" : "Nonaktif"}
            </span>
          </label>
        </FormRow>
      </div>
    </Modal>
  );
}
