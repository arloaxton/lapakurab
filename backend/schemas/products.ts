import { z } from "zod";

const baseFields = {
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama terlalu panjang"),
  // Category slug — divalidasi FK ke tabel categories di DB level, jadi
  // sini cukup format check (lowercase slug 2-32 char).
  cat: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Kategori wajib diisi")
    .max(32, "Slug kategori terlalu panjang")
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "Slug kategori tidak valid"),
  tagline: z.string().trim().min(2, "Tagline terlalu pendek").max(140, "Tagline terlalu panjang"),
  priceIDR: z.number().int().positive("Harga harus positif"),
  oldIDR: z.number().int().nonnegative("Harga lama tidak boleh negatif"),
  stock: z.number().int().nonnegative("Stok tidak boleh negatif"),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().nonnegative().optional(),
  durations: z.array(z.string().trim().min(1)).min(1, "Minimal satu durasi"),
  hue: z.number().int().min(0).max(360),
  emoji: z.string().trim().max(8).optional(),
  active: z.boolean().optional(),
  imageUrl: z.string().trim().max(500).optional().nullable(),
  credentialFormat: z
    .enum([
      "email_password",
      "email_pin",
      "email_profile_pin",
      "key_only",
      "link_only",
      "cookie",
      "custom",
    ])
    .optional(),
};

export const createProductSchema = z.object({
  ...baseFields,
  id: z.string().trim().min(1).max(40).optional(),
});

export const updateProductSchema = z
  .object({
    name: baseFields.name.optional(),
    cat: baseFields.cat.optional(),
    tagline: baseFields.tagline.optional(),
    priceIDR: baseFields.priceIDR.optional(),
    oldIDR: baseFields.oldIDR.optional(),
    stock: baseFields.stock.optional(),
    rating: baseFields.rating,
    reviews: baseFields.reviews,
    durations: baseFields.durations.optional(),
    hue: baseFields.hue.optional(),
    emoji: baseFields.emoji,
    active: baseFields.active,
    imageUrl: baseFields.imageUrl,
    credentialFormat: baseFields.credentialFormat,
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Tidak ada field yang di-update" });

export const listProductsQuerySchema = z.object({
  // 'all' = no filter, atau slug kategori. Cek FK kalau bukan 'all'.
  cat: z
    .string()
    .trim()
    .toLowerCase()
    .max(32)
    .optional(),
  activeOnly: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
