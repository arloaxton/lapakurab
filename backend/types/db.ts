/**
 * Database types — manual untuk sekarang. Nanti bisa di-replace dengan
 * generated types via `supabase gen types typescript`.
 *
 * Konvensi naming:
 *   - DB pakai snake_case (price_idr, created_at)
 *   - Frontend types di lib/types.ts pakai camelCase (priceIDR, createdAt)
 *   - Mapping dilakukan di service / repo layer.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfileRow, "id">>;
      };
      products: {
        Row: ProductRow;
        Insert: Omit<ProductRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProductRow, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}

// ─── Row types ──────────────────────────────────────────────────────────

export interface ProfileRow {
  id: string; // uuid, references auth.users
  name: string | null;
  email: string;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  name: string;
  cat: "streaming" | "vpn";
  tagline: string;
  price_idr: number;
  old_idr: number;
  stock: number;
  rating: number;
  reviews: number;
  durations: string[];
  hue: number;
  emoji: string | null;
  active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
