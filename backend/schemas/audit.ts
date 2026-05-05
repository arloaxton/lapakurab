import { z } from "zod";

export const createAuditSchema = z.object({
  action: z.string().trim().min(1).max(80),
  target: z.string().trim().min(1).max(200),
  detail: z.string().trim().max(500).optional(),
});

export const listAuditQuerySchema = z.object({
  action: z.string().trim().min(1).max(80).optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type ListAuditQuery = z.infer<typeof listAuditQuerySchema>;
