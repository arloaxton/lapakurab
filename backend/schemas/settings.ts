import { z } from "zod";

export const updateSettingsSchema = z
  .object({
    storeName: z.string().trim().min(1).max(120).optional(),
    storeTagline: z.string().trim().max(200).optional(),
    logo: z.string().max(500_000).optional(), // data URL kecil OK
    csWA: z.string().trim().max(40).optional(),
    csEmail: z.string().trim().max(200).optional(),
    notifEmail: z.string().trim().max(200).optional(),
    notifyOnOrder: z.boolean().optional(),
    notifyOnLowStock: z.boolean().optional(),
    notifyOnRefund: z.boolean().optional(),
    autoDelivery: z.boolean().optional(),
    autoPauseOutOfStock: z.boolean().optional(),
    lowStockThreshold: z.number().int().nonnegative().max(9999).optional(),
    invoicePrefix: z.string().trim().max(20).optional(),
    taxPercent: z.number().min(0).max(100).optional(),
    adminFeeIDR: z.number().int().nonnegative().max(1_000_000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Tidak ada field yang di-update" });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
