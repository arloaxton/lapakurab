"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { TableShell } from "@/components/admin/TableShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { VoucherFormModal } from "@/components/admin/modals/VoucherFormModal";
import { primaryBtn, miniBtn } from "@/components/admin/ui-styles";
import { useToast } from "@/components/shared/ToastProvider";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { fmtIDR, fmtDate } from "@/lib/format";
import type { Voucher } from "@/lib/types";
import { isSupabaseConfigured } from "@/backend/env";
import {
  createVoucherClient,
  deleteVoucherClient,
  updateVoucherClient,
} from "@/lib/data/vouchers-client";

export default function AdminVouchersPage() {
  const { vouchers, updateVouchers } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [adding, setAdding] = useState(false);
  const paged = usePagination(vouchers, 10);

  const useApi = isSupabaseConfigured();

  const remove = async (id: string) => {
    const target = vouchers.find((v) => v.id === id);
    const ok = await confirm({
      title: "Hapus voucher?",
      description: target
        ? `Voucher "${target.code}" akan dihapus permanen. ${target.used > 0 ? `Sudah dipakai ${target.used}x.` : "Belum pernah dipakai."}`
        : "Voucher akan dihapus permanen.",
      confirmLabel: "Ya, hapus",
      cancelLabel: "Batal",
      danger: true,
    });
    if (!ok) return;

    let snapshot: Voucher[] | null = null;
    updateVouchers((list) => {
      snapshot = list;
      return list.filter((v) => v.id !== id);
    });
    if (useApi) {
      try {
        await deleteVoucherClient(id);
      } catch (e) {
        if (snapshot) updateVouchers(() => snapshot!);
        toast.error("Gagal hapus", e instanceof Error ? e.message : "Coba lagi.");
        return;
      }
      toast.success("Voucher dihapus");
      return;
    }
    toast.undo("Voucher dihapus", () => {
      if (snapshot) updateVouchers(() => snapshot!);
      toast.success("Dipulihkan");
    });
  };

  const toggle = async (id: string) => {
    const prev = vouchers.find((v) => v.id === id);
    if (!prev) return;
    const next = !prev.active;
    updateVouchers((list) =>
      list.map((v) => (v.id === id ? { ...v, active: next } : v))
    );
    if (useApi) {
      try {
        await updateVoucherClient(id, { active: next });
      } catch (e) {
        updateVouchers((list) =>
          list.map((v) => (v.id === id ? { ...v, active: !next } : v))
        );
        toast.error("Gagal toggle", e instanceof Error ? e.message : "Coba lagi.");
      }
    }
  };

  const save = async (form: Omit<Voucher, "id" | "used">) => {
    // Errors propagate ke modal (modal show inline + stays open).
    if (useApi) {
      const saved = await createVoucherClient({
        code: form.code,
        type: form.type,
        value: form.value,
        minOrder: form.minOrder,
        limit: form.limit,
        expires: form.expires || undefined,
        active: form.active,
      });
      updateVouchers((list) => [saved, ...list]);
    } else {
      updateVouchers((list) => [
        { ...form, id: "v" + Date.now(), used: 0 } as Voucher,
        ...list,
      ]);
    }
    toast.success("Voucher dibuat", form.code);
    setAdding(false);
  };

  return (
    <div>
      <PageHeader
        title="Voucher & diskon"
        subtitle={`${vouchers.filter((v) => v.active).length} voucher aktif · ${vouchers.reduce((s, v) => s + v.used, 0)} kali dipakai`}
        action={
          <button data-cmd="add-voucher" onClick={() => setAdding(true)} style={primaryBtn}>
            + Buat voucher
          </button>
        }
      />

      <TableShell
        columns={[
          "Kode",
          "Diskon",
          "Min. order",
          "Pemakaian",
          "Berlaku s/d",
          "Status",
          "",
        ]}
        rows={paged.items.map((v) => [
          <code
            key="c"
            style={{
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontWeight: 700,
              fontSize: 13,
              padding: "2px 8px",
              background: "var(--surface-2)",
              borderRadius: 5,
              border: "1px solid var(--border)",
              color: "var(--ink)",
            }}
          >
            {v.code}
          </code>,
          <span key="d" style={{ fontWeight: 600, color: "var(--ink)" }}>
            {v.type === "percent" ? `${v.value}%` : fmtIDR(v.value)}
          </span>,
          <span key="m" style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>
            {v.minOrder ? fmtIDR(v.minOrder) : "—"}
          </span>,
          <span key="u" style={{ fontVariantNumeric: "tabular-nums", fontSize: 12, color: "var(--ink)" }}>
            {v.used} {v.limit > 0 ? `/ ${v.limit}` : ""}
          </span>,
          <span key="e" style={{ fontSize: 12, color: "var(--ink)" }}>
            {fmtDate(v.expires)}
          </span>,
          <StatusPill key="s" status={v.active ? "active" : "inactive"} />,
          <div key="a" style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button onClick={() => toggle(v.id)} style={miniBtn}>
              {v.active ? "Off" : "On"}
            </button>
            <button onClick={() => remove(v.id)} style={{ ...miniBtn, color: "var(--danger)" }}>
              Hapus
            </button>
          </div>,
        ])}
        empty="Belum ada voucher"
        emptyIcon="🎟️"
        emptyDesc="Buat voucher diskon untuk promo, retensi, atau campaign khusus."
        emptyCta={
          <button onClick={() => setAdding(true)} style={primaryBtn}>
            + Buat voucher
          </button>
        }
      />

      <Pagination api={paged} />

      {adding && <VoucherFormModal onClose={() => setAdding(false)} onSave={save} />}
    </div>
  );
}
