import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().max(40).optional().nullable(),
    role: z.enum(["user", "admin"]).optional(),
    status: z.enum(["active", "banned"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Tidak ada field yang di-update" });

export const createNoteSchema = z.object({
  text: z.string().trim().min(1).max(1000),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
