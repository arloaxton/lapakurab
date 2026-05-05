import { z } from "zod";

const STOCK_STATUS = ["available", "reserved", "sold", "expired"] as const;

export const createStockItemSchema = z.object({
  productId: z.string().trim().min(1).max(40),
  email: z.string().trim().min(3).max(200),
  password: z.string().trim().min(1).max(200),
  status: z.enum(STOCK_STATUS).optional(),
});

export const bulkCreateStockSchema = z.object({
  productId: z.string().trim().min(1).max(40),
  items: z
    .array(
      z.object({
        email: z.string().trim().min(3).max(200),
        password: z.string().trim().min(1).max(200),
      })
    )
    .min(1, "Minimal satu item")
    .max(500, "Terlalu banyak — max 500 per batch"),
});

export const updateStockItemSchema = z
  .object({
    status: z.enum(STOCK_STATUS).optional(),
    email: z.string().trim().min(3).max(200).optional(),
    password: z.string().trim().min(1).max(200).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Tidak ada field yang di-update" });

export const listStockQuerySchema = z.object({
  productId: z.string().trim().min(1).max(40).optional(),
  status: z.enum(STOCK_STATUS).optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export type CreateStockItemInput = z.infer<typeof createStockItemSchema>;
export type BulkCreateStockInput = z.infer<typeof bulkCreateStockSchema>;
export type UpdateStockItemInput = z.infer<typeof updateStockItemSchema>;
export type ListStockQuery = z.infer<typeof listStockQuerySchema>;
export type StockStatus = (typeof STOCK_STATUS)[number];
