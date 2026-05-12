import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama terlalu panjang"),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").max(72, "Password terlalu panjang"),
});

export const resetSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  // Supabase mailer_otp_length default 6, tapi project ini di-config 8.
  // Allow range 6-10 supaya tahan kalau setting diubah lagi nanti.
  token: z
    .string()
    .trim()
    .regex(/^\d{6,10}$/, "Kode harus 6-10 digit angka"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
