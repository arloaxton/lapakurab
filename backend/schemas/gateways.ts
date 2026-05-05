import { z } from "zod";

export const createGatewaySchema = z.object({
  id: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(80),
  enabled: z.boolean().optional(),
  fee: z.number().min(0).max(100).optional(),
  key: z.string().trim().max(200).optional(),
});

export const updateGatewaySchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    enabled: z.boolean().optional(),
    fee: z.number().min(0).max(100).optional(),
    key: z.string().trim().max(200).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Tidak ada field yang di-update" });

export type CreateGatewayInput = z.infer<typeof createGatewaySchema>;
export type UpdateGatewayInput = z.infer<typeof updateGatewaySchema>;
