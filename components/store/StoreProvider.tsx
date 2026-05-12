"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Currency, Product, StoreUser, Voucher } from "@/lib/types";
import { fmtIDR, fmtUSD } from "@/lib/format";
import { PRODUCTS } from "@/lib/mock";
import { validateVoucherCode } from "@/lib/data/vouchers-client";
import { getCurrentUser, signOut as authSignOut } from "@/lib/data/auth-repo";
import { isSupabaseConfigured } from "@/backend/env";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CartLine {
  key: string; // productId|duration|accountType
  product: Product;
  duration: string;
  /** 'private' atau 'sharing'. Default 'private' kalau produk gak punya varian. */
  accountType: "private" | "sharing";
  qty: number;
}

export interface FlyAnim {
  rect: { left: number; top: number; width: number; height: number };
  hue: number;
  ts: number;
}

export interface CartToastState {
  msg: string;
  ts: number;
}

export interface StoreApi {
  // cart
  cart: CartLine[];
  cartTotal: number;
  cartCount: number;
  addToCart: (
    product: Product,
    duration: string,
    originRect?: DOMRect | null,
    accountType?: "private" | "sharing"
  ) => void;
  removeFromCart: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clearCart: () => void;

  // user
  user: StoreUser | null;
  setUser: (u: StoreUser | null) => void;

  // currency
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  fmt: (n: number) => string;

  // dark mode (storefront)
  darkMode: boolean;
  toggleDark: () => void;

  // toast (cart specific — bubble bawah)
  cartToast: CartToastState | null;
  setCartToast: (t: CartToastState | null) => void;

  // fly-to-cart anim
  flyAnim: FlyAnim | null;
  setFlyAnim: (f: FlyAnim | null) => void;

  // compare
  compareIds: string[];
  compareList: Product[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  compareOpen: boolean;
  setCompareOpen: (v: boolean) => void;

  // voucher
  appliedVoucher: Voucher | null;
  voucherDiscount: number;
  applyVoucherCode: (code: string) => Promise<{ ok: boolean; error?: string }>;
  removeVoucher: () => void;
}

const StoreCtx = createContext<StoreApi | null>(null);

export const useStore = (): StoreApi => {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
};

// ─── localStorage keys ──────────────────────────────────────────────────────
const LS_CART = "lapakurab_cart_v1";
const LS_USER = "lapakurab_user_v1";
const LS_COMPARE = "lapakurab_compare_v1";
const LS_CURRENCY = "lapakurab_currency_v1";
const LS_DARK = "lapakurab_dark_v1";

// ─── Provider ───────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [user, setUser] = useState<StoreUser | null>(null);
  const [currency, setCurrency] = useState<Currency>("IDR");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [cartToast, setCartToast] = useState<CartToastState | null>(null);
  const [flyAnim, setFlyAnim] = useState<FlyAnim | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage (client only).
  // Race fix: kalau Supabase mode, hydrated baru true setelah getCurrentUser
  // resolve — supaya user state stabil sebelum dependent components render.
  useEffect(() => {
    let alive = true;
    try {
      const c = localStorage.getItem(LS_CART);
      if (c) {
        const parsed = JSON.parse(c) as {
          key: string;
          productId: string;
          duration: string;
          accountType?: "private" | "sharing";
          qty: number;
        }[];
        const lines: CartLine[] = parsed
          .map((p) => {
            const product = PRODUCTS.find((x) => x.id === p.productId);
            if (!product) return null;
            return {
              key: p.key,
              product,
              duration: p.duration,
              accountType: p.accountType ?? "private",
              qty: p.qty,
            };
          })
          .filter((x): x is CartLine => x != null);
        setCart(lines);
      }
      const cmp = localStorage.getItem(LS_COMPARE);
      if (cmp) setCompareIds(JSON.parse(cmp));
      const cur = localStorage.getItem(LS_CURRENCY);
      if (cur === "IDR" || cur === "USD") setCurrency(cur);
      const d = localStorage.getItem(LS_DARK);
      if (d === "1") setDarkMode(true);
    } catch {
      /* ignore */
    }

    // Mock mode: localStorage user, hydrate synchronously.
    if (!isSupabaseConfigured()) {
      try {
        const u = localStorage.getItem(LS_USER);
        if (u) setUser(JSON.parse(u));
      } catch {
        /* ignore */
      }
      setHydrated(true);
      return;
    }

    // Supabase mode: tunggu session API sebelum mark hydrated.
    getCurrentUser()
      .then((u) => {
        if (!alive) return;
        if (u) setUser(u);
      })
      .catch(() => {
        /* ignore — anon */
      })
      .finally(() => {
        if (alive) setHydrated(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Persist on change (only after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const slim = cart.map((l) => ({
        key: l.key,
        productId: l.product.id,
        duration: l.duration,
        accountType: l.accountType,
        qty: l.qty,
      }));
      localStorage.setItem(LS_CART, JSON.stringify(slim));
    } catch {
      /* ignore */
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    // Mock mode: persist user di localStorage (session simulation).
    // Supabase mode: session di cookies — localStorage user tidak dipakai.
    if (isSupabaseConfigured()) return;
    try {
      if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
      else localStorage.removeItem(LS_USER);
    } catch {
      /* ignore */
    }
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_COMPARE, JSON.stringify(compareIds));
    } catch {
      /* ignore */
    }
  }, [compareIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_CURRENCY, currency);
    } catch {
      /* ignore */
    }
  }, [currency, hydrated]);

  // Persist + apply dark mode by toggling data-theme on <html>
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_DARK, darkMode ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    }
  }, [darkMode, hydrated]);

  // ─── Cart actions ─────────────────────────────────────────────────────────
  const addToCart = useCallback(
    (
      product: Product,
      duration: string,
      originRect?: DOMRect | null,
      accountType: "private" | "sharing" = "private"
    ) => {
      const key = product.id + "|" + duration + "|" + accountType;
      setCart((c) => {
        const existing = c.find((it) => it.key === key);
        if (existing)
          return c.map((it) => (it.key === key ? { ...it, qty: it.qty + 1 } : it));
        return [...c, { key, product, duration, accountType, qty: 1 }];
      });
      if (originRect) {
        setFlyAnim({
          rect: {
            left: originRect.left,
            top: originRect.top,
            width: originRect.width,
            height: originRect.height,
          },
          hue: product.hue,
          ts: Date.now(),
        });
      }
      setCartToast({ msg: `${product.name} ditambahkan ke keranjang!`, ts: Date.now() });
      setTimeout(
        () =>
          setCartToast((cur) => (cur && cur.ts <= Date.now() - 2400 ? null : cur)),
        2500
      );
    },
    []
  );

  const removeFromCart = useCallback(
    (key: string) => setCart((c) => c.filter((it) => it.key !== key)),
    []
  );

  const updateQty = useCallback(
    (key: string, qty: number) =>
      setCart((c) =>
        qty <= 0
          ? c.filter((it) => it.key !== key)
          : c.map((it) => (it.key === key ? { ...it, qty } : it))
      ),
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedVoucher(null);
  }, []);

  const cartTotal = useMemo(
    () =>
      cart.reduce((s, it) => {
        const price =
          it.accountType === "sharing" && it.product.priceSharingIDR
            ? it.product.priceSharingIDR
            : it.product.priceIDR;
        return s + price * it.qty;
      }, 0),
    [cart]
  );
  const cartCount = useMemo(
    () => cart.reduce((s, it) => s + it.qty, 0),
    [cart]
  );

  // ─── Voucher actions ──────────────────────────────────────────────────────
  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.type === "percent") {
      return Math.round((cartTotal * appliedVoucher.value) / 100);
    }
    return Math.min(appliedVoucher.value, cartTotal);
  }, [appliedVoucher, cartTotal]);

  // Auto-remove voucher if cart subtotal drops below minOrder
  useEffect(() => {
    if (appliedVoucher && cartTotal < appliedVoucher.minOrder) {
      setAppliedVoucher(null);
      setCartToast({
        msg: "Voucher dilepas — total pesanan di bawah minimum",
        ts: Date.now(),
      });
      setTimeout(() => setCartToast(null), 2400);
    }
  }, [appliedVoucher, cartTotal]);

  const applyVoucherCode = useCallback(
    async (rawCode: string): Promise<{ ok: boolean; error?: string }> => {
      const cleaned = rawCode.trim().toUpperCase();
      if (!cleaned) return { ok: false, error: "Masukkan kode voucher dulu" };
      const result = await validateVoucherCode(cleaned, cartTotal);
      if (!result.ok || !result.voucher) {
        return { ok: false, error: result.error ?? "Voucher tidak valid" };
      }
      setAppliedVoucher(result.voucher);
      return { ok: true };
    },
    [cartTotal]
  );

  const removeVoucher = useCallback(() => setAppliedVoucher(null), []);

  // ─── Compare actions ──────────────────────────────────────────────────────
  const toggleCompare = useCallback((productId: string) => {
    setCompareIds((ids) => {
      if (ids.includes(productId)) return ids.filter((i) => i !== productId);
      if (ids.length >= 3) {
        setCartToast({ msg: "Maksimal 3 produk untuk dibandingkan", ts: Date.now() });
        setTimeout(() => setCartToast(null), 2200);
        return ids;
      }
      return [...ids, productId];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const compareList = useMemo(
    () =>
      compareIds
        .map((id) => PRODUCTS.find((p) => p.id === id))
        .filter((x): x is Product => !!x),
    [compareIds]
  );

  const fmt = currency === "USD" ? fmtUSD : fmtIDR;

  const toggleCurrency = useCallback(() => setCurrency((c) => (c === "IDR" ? "USD" : "IDR")), []);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  // Wrap setUser: kalau di Supabase mode dan user di-set ke null, panggil
  // signOut Supabase juga (clear cookie session di server).
  const setUserWrapped = useCallback((u: StoreUser | null) => {
    setUser(u);
    if (u === null && isSupabaseConfigured()) {
      authSignOut().catch(() => {
        /* ignore — best-effort */
      });
    }
  }, []);

  const value: StoreApi = {
    cart, cartTotal, cartCount, addToCart, removeFromCart, updateQty, clearCart,
    user, setUser: setUserWrapped,
    currency, setCurrency, toggleCurrency, fmt,
    darkMode, toggleDark,
    cartToast, setCartToast,
    flyAnim, setFlyAnim,
    compareIds, compareList, toggleCompare, clearCompare, compareOpen, setCompareOpen,
    appliedVoucher, voucherDiscount, applyVoucherCode, removeVoucher,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
