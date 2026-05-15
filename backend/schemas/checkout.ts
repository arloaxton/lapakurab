import { z } from "zod";

// Pakasir cuma support QRIS — channel ditetap statis.
const PAKASIR_CHANNEL = ["qris"] as const;

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().toLowerCase().email("Email tidak valid"),
  customerPhone: z.string().trim().min(8).max(40),
  paymentChannel: z.enum(PAKASIR_CHANNEL).optional().default("qris"),
  voucherCode: z.string().trim().toUpperCase().max(40).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(40),
        productName: z.string().trim().min(1).max(120),
        duration: z.string().trim().min(1).max(40),
        qty: z.number().int().positive().max(99),
        accountType: z.enum(["private", "sharing"]).optional().default("private"),
        unitPriceIDR: z.number().int().nonnegative(),
      })
    )
    .min(1, "Cart kosong")
    .max(20),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
