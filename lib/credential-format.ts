/**
 * Credential format templates — single source of truth untuk label field
 * di admin form, stock list, email kredensial, dashboard customer.
 *
 * Tambah template baru di sini → otomatis available di semua surface.
 */

export interface FieldDef {
  /** Label yang ditampilkan ke user (admin & customer). */
  label: string;
  /** Required di form admin saat tambah stok? */
  required: boolean;
  /** Hint placeholder. */
  placeholder?: string;
  /** Render sebagai textarea (multi-line) instead of single input. */
  multiline?: boolean;
  /** Sensitive (password-style) — UI sembunyikan dengan toggle reveal. */
  sensitive?: boolean;
}

export interface CredentialFormatDef {
  /** Id slug — sama dengan value di products.credential_format. */
  id: string;
  /** Display name di dropdown admin product form. */
  label: string;
  /** Layout label per field. Kalau field tidak di-define = hidden di form. */
  fields: {
    field1?: FieldDef;
    field2?: FieldDef;
    field3?: FieldDef;
    notes?: FieldDef;
  };
}

export const CREDENTIAL_FORMATS: CredentialFormatDef[] = [
  {
    id: "email_password",
    label: "Email + Password",
    fields: {
      field1: { label: "Email", required: true, placeholder: "user@mail.com" },
      field2: { label: "Password", required: true, placeholder: "password", sensitive: true },
      notes: { label: "Catatan (opsional)", required: false, placeholder: "mis. profil utama, screen 1", multiline: true },
    },
  },
  {
    id: "email_pin",
    label: "Email + PIN",
    fields: {
      field1: { label: "Email / Username", required: true, placeholder: "user@mail.com" },
      field2: { label: "PIN", required: true, placeholder: "1234", sensitive: true },
      notes: { label: "Catatan (opsional)", required: false, multiline: true },
    },
  },
  {
    id: "email_profile_pin",
    label: "Email + Profil + PIN",
    fields: {
      field1: { label: "Email", required: true, placeholder: "user@mail.com" },
      field2: { label: "Profil", required: true, placeholder: "Profile 1" },
      field3: { label: "PIN", required: true, placeholder: "1234", sensitive: true },
      notes: { label: "Catatan (opsional)", required: false, multiline: true },
    },
  },
  {
    id: "key_only",
    label: "License Key",
    fields: {
      field1: { label: "License Key / Serial", required: true, placeholder: "XXXX-XXXX-XXXX-XXXX", sensitive: true },
      notes: { label: "Catatan / cara aktivasi", required: false, multiline: true },
    },
  },
  {
    id: "link_only",
    label: "Link / URL",
    fields: {
      field1: { label: "Link / URL", required: true, placeholder: "https://..." },
      notes: { label: "Catatan / cara redeem", required: false, multiline: true },
    },
  },
  {
    id: "cookie",
    label: "Cookie / Session",
    fields: {
      field1: { label: "Cookie / Session JSON", required: true, placeholder: "[{...}] atau sesssion=...", multiline: true, sensitive: true },
      notes: { label: "Catatan / cara import", required: false, multiline: true },
    },
  },
  {
    id: "custom",
    label: "Custom (3 field bebas)",
    fields: {
      field1: { label: "Field 1", required: true, placeholder: "value 1" },
      field2: { label: "Field 2 (opsional)", required: false, placeholder: "value 2" },
      field3: { label: "Field 3 (opsional)", required: false, placeholder: "value 3" },
      notes: { label: "Catatan", required: false, multiline: true },
    },
  },
];

const FORMAT_MAP: Record<string, CredentialFormatDef> = Object.fromEntries(
  CREDENTIAL_FORMATS.map((f) => [f.id, f])
);

/** Resolve format definition. Fallback ke email_password kalau id invalid. */
export function getCredentialFormat(id: string | null | undefined): CredentialFormatDef {
  if (!id) return FORMAT_MAP.email_password;
  return FORMAT_MAP[id] ?? FORMAT_MAP.email_password;
}
