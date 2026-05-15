import type { PaymentMethod } from "../types";

// Pakasir cuma support QRIS. Customer scan QR dari app apapun (GoPay,
// DANA, OVO, ShopeePay, m-banking) — QRIS interop handle routing.
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    desc: "Bayar dari GoPay, DANA, OVO, ShopeePay, m-banking — scan QR",
    tag: "Instant",
  },
];
