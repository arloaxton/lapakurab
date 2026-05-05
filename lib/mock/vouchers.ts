import type { Voucher } from "../types";

export const SEED_VOUCHERS: Voucher[] = [
  { id: "v1", code: "WELCOME10", type: "percent", value: 10, minOrder: 50000, used: 34, limit: 100, expires: "2026-12-31", active: true },
  { id: "v2", code: "GAJIAN50K", type: "fixed", value: 50000, minOrder: 200000, used: 12, limit: 50, expires: "2026-05-31", active: true },
  { id: "v3", code: "NEWBIE5", type: "percent", value: 5, minOrder: 0, used: 201, limit: 0, expires: "2026-12-31", active: true },
  { id: "v4", code: "EXPIRED2025", type: "percent", value: 20, minOrder: 100000, used: 88, limit: 88, expires: "2025-12-31", active: false },
];
