"use client";

import { useMemo, useState } from "react";
import { Modal } from "../Modal";
import { Field } from "@/components/shared/Field";
import { useToast } from "@/components/shared/ToastProvider";
import { adminInputStyle, primaryBtn, secondaryBtn } from "../ui-styles";
import type { Product } from "@/lib/types";
import { getCredentialFormat } from "@/lib/credential-format";

export interface AddStockForm {
  productId: string;
  /** Tipe akun: private (1 buyer = full akun) atau sharing (1 buyer = 1 profil). */
  accountType: "private" | "sharing";
  /** Raw textarea content — parsed sesuai credential_format produk. */
  lines: string;
}

interface AddStockModalProps {
  products: Product[];
  onClose: () => void;
  onSave: (form: AddStockForm) => void | Promise<void>;
}

// Generate placeholder example untuk format tertentu
function exampleFor(format: string): string {
  switch (format) {
    case "email_password":
      return "user1@mail.id | Pass#123\nuser2@mail.id | Pass#456";
    case "email_pin":
      return "user1@mail.id | 1234\nuser2@mail.id | 5678";
    case "key_only":
      return "XXXX-XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY-YYYY";
    case "link_only":
      return "https://redeem.example.com/abc123\nhttps://redeem.example.com/xyz789";
    case "cookie":
      return "session_id=abc123; auth_token=xyz789\nsession_id=def456; auth_token=uvw012";
    case "custom":
      return "field1 value | field2 value | field3 value | catatan";
    default:
      return "user@mail.id | password";
  }
}

// Syntax hint per format (untuk Field hint text)
function syntaxHintFor(format: string): string {
  const fmt = getCredentialFormat(format);
  const fields = fmt.fields;
  const parts: string[] = [];
  if (fields.field1) parts.push(fields.field1.label);
  if (fields.field2) parts.push(fields.field2.label);
  if (fields.field3) parts.push(fields.field3.label);
  if (fields.notes) parts.push(fields.notes.label);
  if (parts.length === 1) {
    return `Satu ${parts[0]} per baris`;
  }
  return `Format: ${parts.join(" | ")} (satu akun per baris, pisah dengan |)`;
}

// Parse single line jadi {field1, field2, field3, notes}
function parseLine(line: string): { field1: string; field2: string; field3: string; notes: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("|").map((p) => p.trim());
  return {
    field1: parts[0] ?? "",
    field2: parts[1] ?? "",
    field3: parts[2] ?? "",
    notes: parts[3] ?? "",
  };
}

export function AddStockModal({ products, onClose, onSave }: AddStockModalProps) {
  const toast = useToast();
  const activeProducts = products.filter((p) => p.active);
  const [productId, setProductId] = useState(activeProducts[0]?.id || "");
  const [accountType, setAccountType] = useState<"private" | "sharing">("private");
  const [lines, setLines] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );
  const format = selectedProduct?.credentialFormat || "email_password";
  const formatDef = getCredentialFormat(format);

  // Cek apakah format butuh field2 (kalau ya, line wajib mengandung "|")
  const needsField2 = Boolean(formatDef.fields.field2?.required);

  // Count valid lines
  const validLines = useMemo(() => {
    return lines
      .split("\n")
      .map(parseLine)
      .filter((p): p is { field1: string; field2: string; field3: string; notes: string } => {
        if (!p) return false;
        if (!p.field1) return false;
        if (needsField2 && !p.field2) return false;
        return true;
      });
  }, [lines, needsField2]);

  const linesError =
    touched && !lines.trim()
      ? "Minimal satu baris akun"
      : touched && validLines.length === 0
        ? `Tidak ada baris valid. ${syntaxHintFor(format)}`
        : null;

  const submit = async () => {
    setTouched(true);
    if (!productId) {
      toast.error("Pilih produk dulu");
      return;
    }
    if (validLines.length === 0) {
      toast.error("Tidak ada baris valid");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSave({ productId, accountType, lines });
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
      subtitle="Bulk import kredensial — satu item per baris."
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
            {submitting
              ? "Menyimpan…"
              : `Simpan ${validLines.length > 0 ? `(${validLines.length} item)` : ""}`}
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
          {activeProducts.length === 0 && (
            <option value="" disabled>
              Belum ada produk aktif
            </option>
          )}
          {activeProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {getCredentialFormat(p.credentialFormat).label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Tipe akun"
        required
        hint={
          selectedProduct?.priceSharingIDR
            ? "Produk ini punya varian Private & Sharing"
            : "Produk ini cuma Private (set Harga sharing di produk untuk aktifkan)"
        }
      >
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as "private" | "sharing")}
          style={adminInputStyle}
          disabled={!selectedProduct?.priceSharingIDR && accountType === "private" ? false : !selectedProduct?.priceSharingIDR}
        >
          <option value="private">Private (full akun)</option>
          <option value="sharing" disabled={!selectedProduct?.priceSharingIDR}>
            Sharing (1 profil)
            {!selectedProduct?.priceSharingIDR ? " — set harga sharing dulu di produk" : ""}
          </option>
        </select>
      </Field>

      <div
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          background: "var(--surface-2)",
          fontSize: 12,
          color: "var(--ink-soft)",
          marginBottom: 14,
        }}
      >
        <strong style={{ color: "var(--ink)" }}>Format: {formatDef.label}</strong>
      </div>

      <Field
        label="Daftar item"
        required
        hint={syntaxHintFor(format)}
        error={linesError}
      >
        <textarea
          value={lines}
          onChange={(e) => setLines(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={8}
          placeholder={exampleFor(format)}
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
            color: validLines.length > 0 ? "var(--success)" : "var(--ink-soft)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {validLines.length > 0 ? "✓" : "·"}{" "}
          <span>{validLines.length} item valid terdeteksi</span>
        </div>
      )}
    </Modal>
  );
}
