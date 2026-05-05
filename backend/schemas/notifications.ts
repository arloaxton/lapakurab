import { z } from "zod";

const KIND = ["order", "success", "warn", "danger", "info"] as const;

export const createNotifSchema = z.object({
  kind: z.enum(KIND),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(1000),
});

export const updateNotifSchema = z
  .object({
    read: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Tidak ada field yang di-update" });

export type CreateNotifInput = z.infer<typeof createNotifSchema>;
export type UpdateNotifInput = z.infer<typeof updateNotifSchema>;
