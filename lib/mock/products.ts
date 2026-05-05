import type { Product } from "../types";

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Streamflix Premium", cat: "streaming", tagline: "4K UHD · 4 Profil", priceIDR: 25000, oldIDR: 55000, stock: 12, rating: 4.9, reviews: 1284, durations: ["1 Bulan", "3 Bulan", "6 Bulan", "1 Tahun"], hue: 340, emoji: "▶", active: true },
  { id: "p2", name: "Tunify Family", cat: "streaming", tagline: "Musik tanpa iklan · 6 akun", priceIDR: 18000, oldIDR: 42000, stock: 8, rating: 4.8, reviews: 932, durations: ["1 Bulan", "3 Bulan", "6 Bulan"], hue: 140, emoji: "♪", active: true },
  { id: "p3", name: "CloudVPN Pro", cat: "vpn", tagline: "80+ negara · No-log", priceIDR: 15000, oldIDR: 35000, stock: 24, rating: 4.7, reviews: 512, durations: ["1 Bulan", "6 Bulan", "1 Tahun", "2 Tahun"], hue: 220, emoji: "◈", active: true },
  { id: "p4", name: "Disnia+ Hotstart", cat: "streaming", tagline: "Marvel · Star Wars · Pixar", priceIDR: 22000, oldIDR: 49000, stock: 5, rating: 4.9, reviews: 2104, durations: ["1 Bulan", "3 Bulan", "1 Tahun"], hue: 265, emoji: "✦", active: true },
  { id: "p5", name: "YouTune Premium", cat: "streaming", tagline: "No ads · Background play", priceIDR: 12000, oldIDR: 28000, stock: 31, rating: 4.8, reviews: 1876, durations: ["1 Bulan", "3 Bulan", "6 Bulan", "1 Tahun"], hue: 10, emoji: "▷", active: true },
  { id: "p6", name: "NordSecure VPN", cat: "vpn", tagline: "5500+ server · Kill switch", priceIDR: 20000, oldIDR: 48000, stock: 17, rating: 4.6, reviews: 743, durations: ["1 Bulan", "1 Tahun", "2 Tahun"], hue: 200, emoji: "◇", active: true },
  { id: "p7", name: "HBO Mix", cat: "streaming", tagline: "Series premium · Original", priceIDR: 28000, oldIDR: 60000, stock: 3, rating: 4.9, reviews: 654, durations: ["1 Bulan", "3 Bulan"], hue: 285, emoji: "◉", active: true },
  { id: "p8", name: "Surfly VPN Lite", cat: "vpn", tagline: "Ringan & cepat · 1 device", priceIDR: 9000, oldIDR: 22000, stock: 42, rating: 4.5, reviews: 298, durations: ["1 Bulan", "3 Bulan", "6 Bulan"], hue: 170, emoji: "≈", active: false },
];

export const getProduct = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);
