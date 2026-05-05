import { z } from "zod";

const VOUCHER_TYPE = ["percent", "fixed"] as const;

const baseFields = {
  code: z.string().trim().toUpperCase().min(2).max(40),
  type: z.enum(VOUCHER_TYPE),
  value: z.number().int().nonnegative(),
  minOrder: z.number().int().nonnegative().optional(),
  limit: z.number().int().nonnegative().optional(),
  expires: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .optional()
    .nullable(),
  active: z.boolean().optional(),
};

export const createVoucherSchema = z.object({
  ...baseFields,
  id: z.string().trim().min(1).max(40).optional(),
});

export const updateVoucherSchema = z
  .object({
    code: baseFields.code.optional(),
    type: baseFields.type.optional(),
    value: baseFields.value.optional(),
    minOrder: baseFields.minOrder,
    limit: baseFields.limit,
    expires: baseFields.expires,
    active: baseFields.active,
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Tidak ada field yang di-update" });

export const validateVoucherSchema = z.object({
  code: z.string().trim().toUpperCase().min(1).max(40),
  cartTotal: z.number().int().nonnegative().optional(),
});

export const redeemVoucherSchema = z.object({
  code: z.string().trim().toUpperCase().min(1).max(40),
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
export type ValidateVoucherInput = z.infer<typeof validateVoucherSchema>;
export type RedeemVoucherInput = z.infer<typeof redeemVoucherSchema>;
