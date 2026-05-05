"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { Field } from "@/components/shared/Field";
import { useToast } from "@/components/shared/ToastProvider";
import { useFormValidation } from "@/hooks/useFormValidation";
import { adminInputStyle, primaryBtn, secondaryBtn } from "../ui-styles";
import type { Voucher } from "@/lib/types";

interface VoucherFormModalProps {
  onClose: () => void;
  onSave: (form: Omit<Voucher, "id" | "used">) => void | Promise<void>;
}

const INITIAL: Omit<Voucher, "id" | "used"> = {
  code: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  limit: 0,
  expires: "2026-12-31",
  active: true,
};

export function VoucherFormModal({ onClose, onSave }: VoucherFormModalProps) {
  const toast = useToast();
  const { values: form, errors, touched, setField, blur, validate, touchAll } =
    useFormValidation<typeof INITIAL>(INITIAL, {
      code: (v) =>
        !v || !String(v).trim()
          ? "Kode voucher wajib diisi"
          : String(v).length < 4
            ? "Minimal 4 karakter"
            : null,
      value: (v) => (!v || (v as number) <= 0 ? "Nilai harus lebih dari 0" : null),
      minOrder: (v) => ((v as number) < 0 ? "Tidak boleh negatif" : null),
      limit: (v) => ((v as number) < 0 ? "Tidak boleh negatif" : null),
      expires: (v) => (!v ? "Tanggal berakhir wajib diisi" : null),
    });

  const upd = <K extends keyof typeof INITIAL>(k: K, v: (typeof INITIAL)[K]) =>
    setField(k, v);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = async () => {
    if (!validate()) {
      touchAll();
      toast.error("Periksa kembali isian yang ditandai merah.");
      return;
    }
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
      title="Buat voucher baru"
      subtitle="Atur kode promo dan ketentuannya."
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
            {submitting ? "Menyimpan…" : "Buat voucher"}
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
      <Field label="Kode voucher" required error={touched.code ? errors.code : null}>
        <input
          value={form.code}
          onChange={(e) => upd("code", e.target.value.toUpperCase())}
          onBlur={() => blur("code")}
          style={{
            ...adminInputStyle,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            textTransform: "uppercase",
          }}
          placeholder="GAJIAN10"
        />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Tipe diskon">
          <select
            value={form.type}
            onChange={(e) => upd("type", e.target.value as Voucher["type"])}
            style={adminInputStyle}
          >
            <option value="percent">Persentase (%)</option>
            <option value="fixed">Potongan tetap (Rp)</option>
          </select>
        </Field>
        <Field
          label={form.type === "percent" ? "Nilai (%)" : "Nilai (Rp)"}
          required
          error={touched.value ? errors.value : null}
        >
          <input
            type="number"
            min="0"
            value={form.value}
            onChange={(e) => upd("value", +e.target.value)}
            onBlur={() => blur("value")}
            style={adminInputStyle}
          />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field
          label="Min. order (Rp)"
          error={touched.minOrder ? errors.minOrder : null}
        >
          <input
            type="number"
            min="0"
            value={form.minOrder}
            onChange={(e) => upd("minOrder", +e.target.value)}
            onBlur={() => blur("minOrder")}
            style={adminInputStyle}
          />
        </Field>
        <Field
          label="Limit pemakaian"
          hint="0 = unlimited"
          error={touched.limit ? errors.limit : null}
        >
          <input
            type="number"
            min="0"
            value={form.limit}
            onChange={(e) => upd("limit", +e.target.value)}
            onBlur={() => blur("limit")}
            style={adminInputStyle}
          />
        </Field>
      </div>
      <Field
        label="Berlaku sampai"
        required
        error={touched.expires ? errors.expires : null}
      >
        <input
          type="date"
          value={form.expires}
          onChange={(e) => upd("expires", e.target.value)}
          onBlur={() => blur("expires")}
          style={adminInputStyle}
        />
      </Field>
    </Modal>
  );
}
