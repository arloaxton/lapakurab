// Type definitions untuk seluruh app.
// Strict false di tsconfig — beberapa field optional disimpan as-is dari data lama.

// ─── Storefront ─────────────────────────────────────────────────────────────

// Filter UI pakai "all" untuk no-filter. Category slug = string apa saja.
export type ProductCategory = string;
export type CatFilter = "all" | string;

export type AccountType = "private" | "sharing";

export interface Product {
  id: string;
  name: string;
  /** Category slug (DB FK: category_id). Boleh null kalau kategori dihapus. */
  cat: string;
  tagline: string;
  priceIDR: number;
  oldIDR: number;
  /** Harga varian sharing. Null = produk tidak punya varian sharing
   *  (cuma dijual private). Constraint DB: < priceIDR. */
  priceSharingIDR?: number | null;
  stock: number;
  rating: number;
  reviews: number;
  durations: string[];
  hue: number;
  emoji: string;
  active?: boolean;
  imageUrl?: string;
  /** Template kredensial yang dipakai saat tambah stok + kirim email customer.
   *  Default 'email_password' untuk produk yang ada sebelum field ini ada. */
  credentialFormat?: string; // CredentialFormat — loose untuk fwd-compat
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  description?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface Review {
  name: string;
  rating: number;
  text: string;
  when: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  desc: string;
  tag: string | null;
}

// Order yang ditampilkan di dashboard pelanggan
export interface CustomerOrder {
  id: string;
  date: string;
  product: string;
  duration: string;
  total: number;
  /** Retail price snapshot (product.oldIDR saat order — dari JOIN).
   *  Untuk compute "Total hemat" di dashboard. 0 = no saving. */
  retailIDR?: number;
  status: "Aktif" | "Selesai" | "Dibatalkan";
  daysLeft: number;
}

export interface CartItem {
  productId: string;
  duration: string;
  qty: number;
  /** Default 'private' (saat produk gak punya varian sharing). */
  accountType: AccountType;
}

export interface StoreUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedAt?: string;
  /** "admin" untuk staff lapakurab — tombol user di topbar arah ke /admin. */
  role?: "user" | "admin";
}

export type FontKey = "groovy" | "editorial" | "clean";

// ─── Admin ──────────────────────────────────────────────────────────────────

export type AdminOrderStatus = "paid" | "pending" | "delivered" | "refunded" | "failed";

export interface AdminOrder {
  id: string;
  date: string; // YYYY-MM-DD
  customer: string;
  email: string;
  product: string;
  duration: string;
  total: number;
  status: AdminOrderStatus;
  payment: string;
}

export type StockStatus = "available" | "sold" | "reserved" | "expired";

// Format kredensial — admin pilih saat bikin produk. Menentukan label
// field di admin stock form + di email yang dikirim ke customer.
export type CredentialFormat =
  | "email_password" // Streaming (Netflix, Spotify, Disney+)
  | "email_pin"      // Game (Mobile Legends, dll)
  | "key_only"       // License key / serial (Windows, Office)
  | "link_only"      // URL redeem / activation link
  | "cookie"         // Cookie JSON (Netflix cookie share)
  | "custom";        // 2-3 field bebas + notes

export interface StockItem {
  id: string;
  productId: string;
  /** Field 1 (mis. email, key, atau url tergantung format). Wajib. */
  field1: string;
  /** Field 2 (mis. password, PIN). Opsional untuk format key_only/link_only. */
  field2?: string;
  /** Field 3 (extra slot untuk custom format). */
  field3?: string;
  /** Catatan free-text (mis. cara redeem, expiry, dll). */
  notes?: string;
  /** Tipe akun: private (full access) atau sharing (1 profil). Default 'private'. */
  accountType: AccountType;
  status: StockStatus;
  addedAt: string; // YYYY-MM-DD
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  joined: string; // YYYY-MM-DD
  orders: number;
  spent: number;
  status: "active" | "banned";
}

export type VoucherType = "percent" | "fixed";

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minOrder: number;
  used: number;
  limit: number; // 0 = unlimited
  expires: string; // YYYY-MM-DD
  active: boolean;
}

export interface Gateway {
  id: string;
  name: string;
  enabled: boolean;
  fee: number; // percent
  key: string;
}

export interface AdminSettings {
  storeName: string;
  storeTagline: string;
  logo: string;
  csWA: string;
  csEmail: string;
  notifEmail: string;
  notifyOnOrder: boolean;
  notifyOnLowStock: boolean;
  notifyOnRefund: boolean;
  autoDelivery: boolean;
  autoPauseOutOfStock: boolean;
  lowStockThreshold: number;
  invoicePrefix: string;
  taxPercent: number;
  adminFeeIDR: number;
}

export interface AuditEntry {
  id: string;
  at: string; // ISO datetime
  actor: string;
  action: string;
  target: string;
  detail: string;
}

export type NotificationKind = "order" | "success" | "warn" | "danger" | "info";

export interface AdminNotification {
  id: string;
  at: string; // ISO datetime
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
}

export interface MemberNote {
  userId: string;
  at: string;
  actor: string;
  text: string;
}

export interface AdminState {
  products: Product[];
  orders: AdminOrder[];
  stock: StockItem[];
  users: AdminUser[];
  vouchers: Voucher[];
  gateways: Gateway[];
  settings: AdminSettings;
  audit: AuditEntry[];
  notifications: AdminNotification[];
  notes: MemberNote[];
}

// ─── Toast ──────────────────────────────────────────────────────────────────

export type ToastKind = "success" | "error" | "warn" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastInput {
  kind?: ToastKind;
  title?: string;
  desc?: string;
  duration?: number;
  action?: ToastAction | null;
}

export interface ToastItem extends Required<Omit<ToastInput, "action">> {
  id: number;
  action: ToastAction | null;
}

// ─── Command palette ────────────────────────────────────────────────────────

export interface CommandItem {
  icon?: string;
  title: string;
  section?: string;
  keywords?: string;
  shortcut?: string;
  onRun: () => void;
}
