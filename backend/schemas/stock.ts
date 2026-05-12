import { z } from "zod";

const STOCK_STATUS = ["available", "reserved", "sold", "expired"] as const;

// Generic field schema — label resolved di UI berdasarkan product.credentialFormat
const fieldStr = z.string().trim().max(2000);
const fieldRequired = z.string().trim().min(1, "Wajib diisi").max(2000);

export const createStockItemSchema = z.object({
  productId: z.string().trim().min(1).max(40),
  field1: fieldRequired,
  field2: fieldStr.optional().default(""),
  field3: fieldStr.optional().default(""),
  notes: fieldStr.optional().default(""),
  status: z.enum(STOCK_STATUS).optional(),
});

export const bulkCreateStockSchema = z.object({
  productId: z.string().trim().min(1).max(40),
  items: z
    .array(
      z.object({
        field1: fieldRequired,
        field2: fieldStr.optional().default(""),
        field3: fieldStr.optional().default(""),
        notes: fieldStr.optional().default(""),
      })
    )
    .min(1, "Minimal satu item")
    .max(500, "Terlalu banyak — max 500 per batch"),
});

export const updateStockItemSchema = z
  .object({
    status: z.enum(STOCK_STATUS).optional(),
    field1: fieldRequired.optional(),
    field2: fieldStr.optional(),
    field3: fieldStr.optional(),
    notes: fieldStr.optional(),
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
