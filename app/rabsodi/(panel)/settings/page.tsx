"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormRow } from "@/components/admin/FormRow";
import {
  adminInputStyle,
  primaryBtn,
  secondaryBtn,
} from "@/components/admin/ui-styles";
import type { AdminSettings } from "@/lib/types";
import { isSupabaseConfigured } from "@/backend/env";
import { updateSettingsClient } from "@/lib/data/settings-client";
import { useToast } from "@/components/shared/ToastProvider";

function previewLinkStyle(color: string): CSSProperties {
  return {
    padding: "5px 10px",
    borderRadius: 6,
    background: color,
    color: "white",
    fontSize: 11,
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  };
}

function SettingsCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 20,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: "-0.01em",
          marginBottom: 3,
          color: "var(--ink)",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 18 }}>{desc}</div>
      {children}
    </div>
  );
}

function NotifToggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>{desc}</div>
      </div>
      <label
        style={{
          position: "relative",
          display: "inline-block",
          width: 36,
          height: 20,
          cursor: "pointer",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            background: value ? "var(--ink)" : "var(--border)",
            transition: "0.2s",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: value ? 18 : 2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "white",
              transition: "0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </span>
      </label>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { settings, updateSettings, logAudit } = useAdmin();
  const [form, setForm] = useState<AdminSettings>(settings);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setForm(settings), [settings]);

  const upd = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("Maks 500KB ya bro");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => upd("logo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const toast = useToast();
  const useApi = isSupabaseConfigured();

  const onSave = async () => {
    if (useApi) {
      try {
        const saved = await updateSettingsClient(form);
        updateSettings(saved);
      } catch (e) {
        toast.error("Gagal simpan", e instanceof Error ? e.message : "Coba lagi.");
        return;
      }
    } else {
      updateSettings(form);
    }
    logAudit("settings.update", "Pengaturan toko", "Konfigurasi diperbarui");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Konfigurasi toko, customer service, notifikasi, dan automasi."
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {saved && (
              <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>
                ✓ Tersimpan
              </span>
            )}
            <button onClick={onSave} style={primaryBtn}>
              Simpan perubahan
            </button>
          </div>
        }
      />

      <div className="lk-grid-2" style={{ gap: 14 }}>
        <SettingsCard title="Info toko" desc="Identitas brand yang muncul di invoice & email.">
          <FormRow label="Nama toko">
            <input
              value={form.storeName}
              onChange={(e) => upd("storeName", e.target.value)}
              style={adminInputStyle}
            />
          </FormRow>
          <FormRow label="Tagline">
            <input
              value={form.storeTagline}
              onChange={(e) => upd("storeTagline", e.target.value)}
              style={adminInputStyle}
            />
          </FormRow>
          <FormRow label="Logo (PNG/SVG, maks 500KB)">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  border: "1.5px dashed var(--border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: form.logo ? "var(--surface)" : "var(--surface-2)",
                  overflow: "hidden",
                }}
              >
                {form.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.logo}
                    alt="logo"
                    style={{ maxWidth: "80%", maxHeight: "80%" }}
                  />
                ) : (
                  <span
                    style={{
                      color: "var(--ink-soft)",
                      fontSize: 24,
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                    }}
                  >
                    L
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onLogo}
                  style={{ display: "none" }}
                />
                <button onClick={() => fileRef.current?.click()} style={secondaryBtn}>
                  Upload logo
                </button>
                {form.logo && (
                  <button
                    onClick={() => upd("logo", "")}
                    style={{ ...secondaryBtn, marginLeft: 6, color: "var(--danger)" }}
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </FormRow>
          <FormRow label="Prefix nomor invoice">
            <input
              value={form.invoicePrefix}
              onChange={(e) =>
                upd("invoicePrefix", e.target.value.toUpperCase().slice(0, 5))
              }
              style={{
                ...adminInputStyle,
                fontFamily: "var(--font-mono), ui-monospace, monospace",
              }}
            />
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>
              Contoh: <code>{form.invoicePrefix}-2841</code>
            </div>
          </FormRow>
          <FormRow label="Tax / PPN (%)">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.taxPercent}
              onChange={(e) => upd("taxPercent", +e.target.value)}
              style={adminInputStyle}
            />
          </FormRow>
        </SettingsCard>

        <SettingsCard
          title="Customer service"
          desc="Channel kontak yang ditampilkan ke pelanggan."
        >
          <FormRow label="WhatsApp CS">
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span
                style={{
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  borderRadius: 8,
                  border: "1.5px solid var(--border)",
                  fontSize: 13,
                  color: "var(--ink-soft)",
                }}
              >
                📱
              </span>
              <input
                value={form.csWA}
                onChange={(e) => upd("csWA", e.target.value)}
                style={adminInputStyle}
                placeholder="+62 812-..."
              />
            </div>
          </FormRow>
          <FormRow label="Email customer service">
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span
                style={{
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  borderRadius: 8,
                  border: "1.5px solid var(--border)",
                  fontSize: 13,
                  color: "var(--ink-soft)",
                }}
              >
                ✉
              </span>
              <input
                type="email"
                value={form.csEmail}
                onChange={(e) => upd("csEmail", e.target.value)}
                style={adminInputStyle}
              />
            </div>
          </FormRow>

          <div
            style={{
              marginTop: 18,
              padding: 12,
              background: "var(--surface-2)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ink)",
                marginBottom: 6,
              }}
            >
              Preview di toko
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <a
                href={`https://wa.me/${form.csWA.replace(/\D/g, "")}`}
                style={previewLinkStyle("#25D366")}
              >
                💬 Chat WhatsApp
              </a>
              <a href={`mailto:${form.csEmail}`} style={previewLinkStyle("var(--primary)")}>
                ✉ Email kami
              </a>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Notifikasi email"
          desc="Trigger email ke admin saat event penting terjadi."
        >
          <FormRow label="Email penerima notifikasi">
            <input
              type="email"
              value={form.notifEmail}
              onChange={(e) => upd("notifEmail", e.target.value)}
              style={adminInputStyle}
            />
          </FormRow>
          <NotifToggle
            label="Pesanan baru masuk"
            desc="Email tiap kali ada order baru."
            value={form.notifyOnOrder}
            onChange={(v) => upd("notifyOnOrder", v)}
          />
          <NotifToggle
            label="Stok produk menipis"
            desc="Alert saat stok ≤ threshold."
            value={form.notifyOnLowStock}
            onChange={(v) => upd("notifyOnLowStock", v)}
          />
          <NotifToggle
            label="Refund diproses"
            desc="Notifikasi refund yang dijalankan."
            value={form.notifyOnRefund}
            onChange={(v) => upd("notifyOnRefund", v)}
          />
        </SettingsCard>

        <SettingsCard title="Automasi" desc="Rule otomatis untuk operasional toko.">
          <NotifToggle
            label="Auto-delivery"
            desc="Setelah pembayaran terverifikasi, kirim kredensial otomatis dari pool stok."
            value={form.autoDelivery}
            onChange={(v) => upd("autoDelivery", v)}
          />
          <NotifToggle
            label="Auto-pause produk stok kosong"
            desc="Produk dengan stok 0 otomatis di-nonaktifkan dari katalog."
            value={form.autoPauseOutOfStock}
            onChange={(v) => upd("autoPauseOutOfStock", v)}
          />
          <FormRow label={`Threshold "stok menipis": ${form.lowStockThreshold} akun`}>
            <input
              type="range"
              min="1"
              max="20"
              value={form.lowStockThreshold}
              onChange={(e) => upd("lowStockThreshold", +e.target.value)}
              style={{ width: "100%", accentColor: "var(--primary)" }}
            />
          </FormRow>
        </SettingsCard>
      </div>
    </div>
  );
}
