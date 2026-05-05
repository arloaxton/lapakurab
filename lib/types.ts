// Type definitions untuk seluruh app.
// Strict false di tsconfig — beberapa field optional disimpan as-is dari data lama.

// ─── Storefront ─────────────────────────────────────────────────────────────

export type ProductCategory = "all" | "streaming" | "vpn";

export interface Product {
  id: string;
  name: string;
  cat: Exclude<ProductCategory, "all">;
  tagline: string;
  priceIDR: number;
  oldIDR: number;
  stock: number;
  rating: number;
  reviews: number;
  durations: string[];
  hue: number;
  emoji: string;
  active?: boolean;
  imageUrl?: string;
}

export interface Category {
  id: ProductCategory;
  label: string;
  emoji: string;
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
  /** Tokopay channel code (Phase 4). Untuk QRIS realtime + e-wallet. */
  tokopayChannel?: string;
}

// Order yang ditampilkan di dashboard pelanggan
export interface CustomerOrder {
  id: string;
  date: string;
  product: string;
  duration: string;
  total: number;
  status: "Aktif" | "Selesai" | "Dibatalkan";
  daysLeft: number;
}

export interface CartItem {
  productId: string;
  duration: string;
  qty: number;
}

export interface StoreUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedAt?: string;
}

export type Currency = "IDR" | "USD";
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

export interface StockItem {
  id: string;
  productId: string;
  email: string;
  password: string;
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
