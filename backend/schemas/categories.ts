import { z } from "zod";

// Slug: lowercase, hyphen-allowed, 2-32 char (URL-safe)
const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

const baseFields = {
  id: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "ID minimal 2 karakter")
    .max(32, "ID maksimal 32 karakter")
    .regex(slugRegex, "ID hanya huruf kecil, angka, dan tanda hubung (mis. 'streaming', 'cloud-gaming')"),
  label: z.string().trim().min(1, "Nama wajib diisi").max(60, "Nama terlalu panjang"),
  emoji: z.string().trim().max(8, "Emoji terlalu panjang").default("✦"),
  description: z.string().trim().max(280, "Deskripsi terlalu panjang").optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(100),
  active: z.boolean().default(true),
};

export const createCategorySchema = z.object(baseFields);

export const updateCategorySchema = z.object({
  // id tidak boleh di-update (immutable slug)
  label: baseFields.label.optional(),
  emoji: baseFields.emoji.optional(),
  description: baseFields.description,
  sortOrder: baseFields.sortOrder.optional(),
  active: baseFields.active.optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
