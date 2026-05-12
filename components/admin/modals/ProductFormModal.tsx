"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Modal } from "../Modal";
import { FormRow } from "../FormRow";
import { Field } from "@/components/shared/Field";
import { useToast } from "@/components/shared/ToastProvider";
import { useFormValidation } from "@/hooks/useFormValidation";
import { adminInputStyle, primaryBtn, secondaryBtn } from "../ui-styles";
import type { Category, Product } from "@/lib/types";
import { isSupabaseConfigured } from "@/backend/env";
import { fetchCategories } from "@/lib/data/categories-client";
import { CATEGORIES as MOCK_CATEGORIES } from "@/lib/mock/categories";
import { CREDENTIAL_FORMATS } from "@/lib/credential-format";

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (form: Product) => void | Promise<void>;
}

const DEFAULT_PRODUCT: Product = {
  id: "",
  name: "",
  cat: "", // di-isi via dropdown setelah categories di-fetch
  credentialFormat: "email_password",
  tagline: "",
  priceIDR: 0,
  oldIDR: 0,
  stock: 0,
  rating: 5.0,
  reviews: 0,
  durations: ["1 Bulan"],
  hue: 340,
  emoji: "▶",
  active: true,
};

export function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const toast = useToast();
  const initial: Product = product || DEFAULT_PRODUCT;

  // Fetch categories aktif dari DB (untuk dropdown). Fallback ke mock kalau
  // Supabase belum di-konfig.
  const [categories, setCategories] = useState<Category[]>(() =>
    MOCK_CATEGORIES.filter((c) => c.id !== "all")
  );
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let alive = true;
    fetchCategories({ admin: true })
      .then((list) => {
        if (alive && list.length > 0) setCategories(list);
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  // Auto-select kategori pertama (yang aktif) kalau form.cat kosong / invalid.
  useEffect(() => {
    if (form.cat) return;
    const firstActive = categories.find((c) => c.active !== false);
    if (firstActive) setField("cat", firstActive.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const { values: form, errors, touched, setField, blur, validate, touchAll } =
    useFormValidation<Product>(initial, {
      name: (v) =>
        !v || !String(v).trim()
          ? "Nama produk wajib diisi"
          : String(v).length < 3
            ? "Minimal 3 karakter"
            : null,
      tagline: (v) =>
        !v || !String(v).trim() ? "Tagline wajib diisi" : null,
      priceIDR: (v) => (!v || (v as number) <= 0 ? "Harga harus lebih dari 0" : null),
      oldIDR: (v, all) =>
        v && (v as number) > 0 && (v as number) <= (all.priceIDR as number)
          ? "Harga coret harus lebih besar dari harga jual"
          : null,
      stock: (v) => ((v as number) < 0 ? "Stok tidak boleh negatif" : null),
      hue: (v) => ((v as number) < 0 || (v as number) > 360 ? "Hue harus 0–360" : null),
      durations: (v) =>
        !v || (v as string[]).length === 0 ? "Minimal satu durasi" : null,
    });

  const upd = <K extends keyof Product>(k: K, v: Product[K]) => setField(k, v);

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const useApi = isSupabaseConfigured();

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File terlalu besar", "Maksimal 2MB.");
      return;
    }
    if (!useApi) {
      // Mock mode: simpan sebagai data URL (lokal saja)
      const reader = new FileReader();
      reader.onload = () => upd("imageUrl", reader.result as string);
      reader.readAsDataURL(file);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/product-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      upd("imageUrl", data.url as string);
      toast.success("Gambar diunggah");
    } catch (err) {
      toast.error("Upload gagal", err instanceof Error ? err.message : "Coba lagi.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

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
      title={product ? "Edit produk" : "Tambah produk baru"}
      subtitle="Lengkapi detail produk yang akan dijual."
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
            {submitting ? "Menyimpan…" : product ? "Simpan perubahan" : "Tambah produk"}
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
      <Field label="Nama produk" required error={touched.name ? errors.name : null}>
        <input
          value={form.name}
          onChange={(e) => upd("name", e.target.value)}
          onBlur={() => blur("name")}
          style={adminInputStyle}
          placeholder="cth. Streamflix Premium"
        />
      </Field>
      <Field label="Tagline" required error={touched.tagline ? errors.tagline : null}>
        <input
          value={form.tagline}
          onChange={(e) => upd("tagline", e.target.value)}
          onBlur={() => blur("tagline")}
          style={adminInputStyle}
          placeholder="cth. 4K UHD · 4 Profil"
        />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Kategori">
          {categories.length === 0 ? (
            <div
              style={{
                ...adminInputStyle,
                color: "var(--danger, #DC2626)",
                fontSize: 12,
                lineHeight: 1.5,
                display: "flex",
                alignItems: "center",
              }}
            >
              Belum ada kategori. Tambah dulu di{" "}
              <a
                href="/admin/categories"
                style={{ color: "var(--primary)", fontWeight: 600, marginLeft: 4 }}
              >
                /admin/categories
              </a>
            </div>
          ) : (
            <select
              value={form.cat}
              onChange={(e) => upd("cat", e.target.value)}
              style={adminInputStyle}
            >
              {!categories.find((c) => c.id === form.cat) && (
                <option value="" disabled>
                  — pilih kategori —
                </option>
              )}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                  {c.active === false ? " (nonaktif)" : ""}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Stok" error={touched.stock ? errors.stock : null}>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => upd("stock", +e.target.value)}
            onBlur={() => blur("stock")}
            style={adminInputStyle}
          />
        </Field>
      </div>
      <Field label="Format kredensial">
        <select
          value={form.credentialFormat || "email_password"}
          onChange={(e) => upd("credentialFormat", e.target.value)}
          style={adminInputStyle}
        >
          {CREDENTIAL_FORMATS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label} — {f.hint}
            </option>
          ))}
        </select>
        <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.4 }}>
          Pilih template yang sesuai. Form admin tambah stok + email yang
          dikirim ke customer akan adaptif berdasarkan format ini.
        </div>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field
          label="Harga jual (IDR)"
          required
          error={touched.priceIDR ? errors.priceIDR : null}
        >
          <input
            type="number"
            min="0"
            value={form.priceIDR}
            onChange={(e) => upd("priceIDR", +e.target.value)}
            onBlur={() => blur("priceIDR")}
            style={adminInputStyle}
          />
        </Field>
        <Field
          label="Harga coret (IDR)"
          error={touched.oldIDR ? errors.oldIDR : null}
          hint={!touched.oldIDR ? "Untuk menampilkan diskon" : undefined}
        >
          <input
            type="number"
            min="0"
            value={form.oldIDR}
            onChange={(e) => upd("oldIDR", +e.target.value)}
            onBlur={() => blur("oldIDR")}
            style={adminInputStyle}
          />
        </Field>
      </div>
      <Field
        label="Durasi tersedia (pisahkan koma)"
        error={touched.durations ? errors.durations : null}
      >
        <input
          value={form.durations.join(", ")}
          onChange={(e) =>
            upd(
              "durations",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          onBlur={() => blur("durations")}
          style={adminInputStyle}
          placeholder="1 Bulan, 3 Bulan, 1 Tahun"
        />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field
          label="Warna brand (hue 0-360)"
          error={touched.hue ? errors.hue : null}
        >
          <input
            type="number"
            min="0"
            max="360"
            value={form.hue}
            onChange={(e) => upd("hue", +e.target.value)}
            onBlur={() => blur("hue")}
            style={adminInputStyle}
          />
        </Field>
        <Field label="Glyph">
          <input
            value={form.emoji}
            onChange={(e) => upd("emoji", e.target.value)}
            style={adminInputStyle}
            maxLength={2}
          />
        </Field>
      </div>
      <Field label="Gambar produk" hint="Opsional · JPG/PNG/WebP, max 2MB">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {form.imageUrl &&
            (form.imageUrl.startsWith("data:") ? (
              // Data URL preview (mock mode) — next/image tidak support data URL
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imageUrl}
                alt="Preview"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  objectFit: "cover",
                  border: "1px solid var(--border)",
                }}
              />
            ) : (
              <div
                style={{
                  position: "relative",
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              >
                <Image src={form.imageUrl} alt="Preview" fill sizes="64px" style={{ objectFit: "cover" }} />
              </div>
            ))}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onPickImage}
            disabled={uploading}
            style={{ flex: 1, fontSize: 12 }}
          />
          {form.imageUrl && (
            <button
              type="button"
              onClick={() => upd("imageUrl", undefined)}
              style={{ ...secondaryBtn, fontSize: 11 }}
            >
              Hapus
            </button>
          )}
        </div>
      </Field>
      <FormRow label="Status di toko">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            cursor: "pointer",
            color: "var(--ink)",
          }}
        >
          <input
            type="checkbox"
            checked={!!form.active}
            onChange={(e) => upd("active", e.target.checked)}
          />
          Aktif (tampil di katalog publik)
        </label>
      </FormRow>
    </Modal>
  );
}
