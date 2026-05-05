import { z } from "zod";

const ORDER_STATUS = ["pending", "paid", "delivered", "refunded", "failed"] as const;

export const createOrderSchema = z.object({
  productId: z.string().trim().min(1, "Product wajib").max(40),
  productName: z.string().trim().min(1).max(120),
  duration: z.string().trim().min(1).max(40),
  qty: z.number().int().positive().max(99),
  totalIDR: z.number().int().nonnegative(),
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().toLowerCase().email("Email tidak valid"),
  customerPhone: z.string().trim().max(40).optional(),
  paymentMethod: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateOrderSchema = z
  .object({
    status: z.enum(ORDER_STATUS).optional(),
    paymentMethod: z.string().trim().max(40).optional(),
    notes: z.string().trim().max(500).optional(),
    deliveredAt: z.string().datetime().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Tidak ada field yang di-update" });

export const listOrdersQuerySchema = z.object({
  scope: z.enum(["me", "all"]).optional(),
  status: z.enum(ORDER_STATUS).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type OrderStatus = (typeof ORDER_STATUS)[number];
