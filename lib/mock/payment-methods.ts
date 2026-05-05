import type { PaymentMethod } from "../types";

// Mapping ke Tokopay channel:
// - QRIS realtime  → QRISREALTIME (instant)
// - GoPay          → GOPAY
// - DANA           → DANA
// - ShopeePay      → SHOPEEPAY
// - LinkAja        → LINKAJA
// OVO TIDAK didukung Tokopay → dihapus dari list.
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "qris", name: "QRIS", desc: "Semua e-wallet & m-banking", tag: "Instant", tokopayChannel: "QRISREALTIME" },
  { id: "gopay", name: "GoPay", desc: "Bayar pakai saldo GoPay", tag: "Populer", tokopayChannel: "GOPAY" },
  { id: "dana", name: "DANA", desc: "Bayar pakai saldo DANA", tag: null, tokopayChannel: "DANA" },
  { id: "shopeepay", name: "ShopeePay", desc: "Pakai saldo ShopeePay", tag: null, tokopayChannel: "SHOPEEPAY" },
  { id: "linkaja", name: "LinkAja", desc: "Bayar pakai saldo LinkAja", tag: null, tokopayChannel: "LINKAJA" },
];
