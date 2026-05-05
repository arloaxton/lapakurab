import type { Gateway } from "../types";

export const SEED_GATEWAYS: Gateway[] = [
  { id: "qris", name: "QRIS", enabled: true, fee: 0.7, key: "qr_live_xxxxxxxxx" },
  { id: "gopay", name: "GoPay", enabled: true, fee: 2.0, key: "gp_live_xxxxxxxxx" },
  { id: "ovo", name: "OVO", enabled: true, fee: 2.0, key: "ovo_live_xxxxxxxx" },
  { id: "dana", name: "DANA", enabled: true, fee: 1.5, key: "dn_live_xxxxxxxxx" },
  { id: "shopeepay", name: "ShopeePay", enabled: false, fee: 2.0, key: "" },
];
