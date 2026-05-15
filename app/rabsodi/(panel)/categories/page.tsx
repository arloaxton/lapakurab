"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusPill } from "@/components/admin/StatusPill";
import { miniBtn, primaryBtn } from "@/components/admin/ui-styles";
import { useToast } from "@/components/shared/ToastProvider";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import {
  CategoryFormModal,
  type CategoryFormValues,
} from "@/components/admin/modals/CategoryFormModal";
import {
  createCategory,
  deleteCategoryClient,
  fetchCategories,
  updateCategoryClient,
} from "@/lib/data/categories-client";
import { isSupabaseConfigured } from "@/backend/env";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const useApi = isSupabaseConfigured();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);

  // Initial load
  useEffect(() => {
    if (!useApi) {
      setLoading(false);
      return;
    }
    fetchCategories({ admin: true })
      .then((list) => setCategories(list))
      .catch((e) =>
        toast.error("Gagal load", e instanceof Error ? e.message : "")
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveCreate = async (values: CategoryFormValues) => {
    const created = await createCategory({
      id: values.id,
      label: values.label,
      emoji: values.emoji || "✦",
      description: values.description.trim() || null,
      sortOrder: values.sortOrder,
      active: values.active,
    });
    setCategories((list) => [...list, created].sort((a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100)));
    toast.success("Kategori dibuat", values.label);
    setAdding(false);
  };

  const handleSaveEdit = async (values: CategoryFormValues) => {
    if (!editing) return;
    const updated = await updateCategoryClient(editing.id, {
      label: values.label,
      emoji: values.emoji || "✦",
      description: values.description.trim() || null,
      sortOrder: values.sortOrder,
      active: values.active,
    });
    setCategories((list) =>
      list
        .map((c) => (c.id === updated.id ? updated : c))
        .sort((a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100))
    );
    toast.success("Kategori diperbarui", values.label);
    setEditing(null);
  };

  const handleDelete = async (c: Category) => {
    const ok = await confirm({
      title: `Hapus kategori "${c.label}"?`,
      description:
        "Produk yang menggunakan kategori ini akan jadi tanpa kategori (tetap ada di DB). Tindakan ini tidak bisa di-undo.",
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteCategoryClient(c.id);
      setCategories((list) => list.filter((x) => x.id !== c.id));
      toast.success("Kategori dihapus", c.label);
    } catch (e) {
      toast.error("Gagal hapus", e instanceof Error ? e.message : "Coba lagi.");
    }
  };

  const toggleActive = async (c: Category) => {
    const next = !(c.active !== false);
    // optimistic
    setCategories((list) =>
      list.map((x) => (x.id === c.id ? { ...x, active: next } : x))
    );
    try {
      await updateCategoryClient(c.id, { active: next });
    } catch (e) {
      // rollback
      setCategories((list) =>
        list.map((x) => (x.id === c.id ? { ...x, active: !next } : x))
      );
      toast.error("Gagal toggle", e instanceof Error ? e.message : "");
    }
  };

  return (
    <div>
      <PageHeader
        title="Kategori"
        subtitle="Kategori produk yang muncul di storefront. Slug ID dipakai di URL — pilih dengan hati-hati."
        action={
          <button type="button" onClick={() => setAdding(true)} style={primaryBtn}>
            + Tambah kategori
          </button>
        }
      />

      {loading && (
        <div style={{ padding: 32, textAlign: "center", color: "var(--ink-soft)" }}>
          Memuat...
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px dashed var(--border)",
            color: "var(--ink-soft)",
          }}
        >
          Belum ada kategori. Klik <strong>+ Tambah kategori</strong> untuk mulai.
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {categories.map((c) => (
            <div
              key={c.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {c.emoji || "✦"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>
                    {c.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-soft)",
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    {c.id}
                  </div>
                </div>
                <StatusPill status={c.active !== false ? "active" : "inactive"} />
              </div>

              {c.description && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-soft)",
                    lineHeight: 1.5,
                  }}
                >
                  {c.description}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--ink-soft)",
                }}
              >
                <span>Urutan: {c.sortOrder ?? 100}</span>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setEditing(c)}
                  style={miniBtn}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(c)}
                  style={miniBtn}
                >
                  {c.active !== false ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c)}
                  style={{
                    ...miniBtn,
                    color: "var(--danger, #DC2626)",
                    borderColor: "rgba(220,38,38,0.3)",
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <CategoryFormModal
          initial={null}
          onClose={() => setAdding(false)}
          onSave={handleSaveCreate}
        />
      )}

      {editing && (
        <CategoryFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}

    </div>
  );
}
