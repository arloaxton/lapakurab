"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AdminNotification,
  AdminOrder,
  AdminSettings,
  AdminState,
  AdminUser,
  AuditEntry,
  Gateway,
  MemberNote,
  NotificationKind,
  Product,
  StockItem,
  Voucher,
} from "@/lib/types";
import {
  PRODUCTS as SEED_PRODUCTS,
  SEED_ADMIN_ORDERS,
  SEED_STOCK,
  SEED_USERS,
  SEED_VOUCHERS,
  SEED_GATEWAYS,
  SEED_SETTINGS,
  SEED_AUDIT,
  SEED_NOTIFICATIONS,
} from "@/lib/mock";

const LS_KEY = "lapakurab_admin_v1";
const SESSION_KEY = "lapakurab_admin_session";
const DARK_KEY = "lapakurab_admin_dark";

const SEED: AdminState = {
  products: SEED_PRODUCTS,
  orders: SEED_ADMIN_ORDERS,
  stock: SEED_STOCK,
  users: SEED_USERS,
  vouchers: SEED_VOUCHERS,
  gateways: SEED_GATEWAYS,
  settings: SEED_SETTINGS,
  audit: SEED_AUDIT,
  notifications: SEED_NOTIFICATIONS,
  notes: [],
};

function loadState(): AdminState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    return {
      products: parsed.products || SEED.products,
      orders: parsed.orders || SEED.orders,
      stock: parsed.stock || SEED.stock,
      users: parsed.users || SEED.users,
      vouchers: parsed.vouchers || SEED.vouchers,
      gateways: parsed.gateways || SEED.gateways,
      settings: parsed.settings || SEED.settings,
      audit: parsed.audit || SEED.audit,
      notifications: parsed.notifications || SEED.notifications,
      notes: parsed.notes || SEED.notes,
    };
  } catch {
    return SEED;
  }
}

function saveState(state: AdminState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

type Updater<T> = T | ((prev: T) => T);
function applyUpdater<T>(prev: T, fn: Updater<T>): T {
  return typeof fn === "function" ? (fn as (prev: T) => T)(prev) : fn;
}

interface AdminApi extends AdminState {
  authed: boolean;
  /** True setelah hydration selesai (session + data API resolve). UI auth
   *  guard pakai ini untuk distinguish "loading" vs "not authenticated". */
  hydrated: boolean;
  login: () => void;
  logout: () => void;

  darkMode: boolean;
  toggleDark: () => void;

  updateProducts: (fn: Updater<Product[]>) => void;
  updateOrders: (fn: Updater<AdminOrder[]>) => void;
  updateStock: (fn: Updater<StockItem[]>) => void;
  updateUsers: (fn: Updater<AdminUser[]>) => void;
  updateVouchers: (fn: Updater<Voucher[]>) => void;
  updateGateways: (fn: Updater<Gateway[]>) => void;
  updateSettings: (fn: Updater<AdminSettings>) => void;
  updateNotifications: (fn: Updater<AdminNotification[]>) => void;
  updateNotes: (fn: Updater<MemberNote[]>) => void;

  logAudit: (action: string, target: string, detail: string) => void;
  pushNotif: (kind: NotificationKind, title: string, body: string) => void;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;
  resetData: () => void;
}

const AdminCtx = createContext<AdminApi | null>(null);

export const useAdmin = (): AdminApi => {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState<AdminState>(SEED);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage / sessionStorage
  useEffect(() => {
    setData(loadState());
    setDarkMode(localStorage.getItem(DARK_KEY) === "1");

    // Auth: di Supabase mode, cek session di server lewat /api/auth/session.
    // Mock mode: pakai sessionStorage flag legacy.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    const isSupabase = Boolean(url && key);

    if (!isSupabase) {
      setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
      setHydrated(true);
      return;
    }

    // Race fix: batch fetch semua hydration sources, lalu satu setData
    // dengan merged result. Ini cegah UI jumping saat 11 fetches resolve
    // di waktu beda. Auth juga di-batch supaya hydrated baru true setelah
    // semua data + auth siap.
    let alive = true;
    const fetchJSON = async <T,>(path: string): Promise<T | null> => {
      try {
        const res = await fetch(path, { credentials: "include" });
        if (!res.ok) return null;
        return (await res.json()) as T;
      } catch {
        return null;
      }
    };

    // Step 1: session check (priority — UI gate-keeper). Set authed +
    // hydrated SECEPATNYA setelah session resolve, jangan tunggu 10 fetch
    // data lain. Data lain di-fetch paralel di background — kalau lambat,
    // table tampil dengan mock/empty (loading state per-page).
    fetchJSON<{ user: unknown; role: string }>("/api/auth/session")
      .then((session) => {
        if (!alive) return;
        setAuthed(Boolean(session?.user && session?.role === "admin"));
        setHydrated(true);
      })
      .catch(() => {
        if (!alive) return;
        setAuthed(false);
        setHydrated(true);
      });

    // Step 2: data fetches (background, settled independently)
    Promise.all([
      fetchJSON<{ products: Product[] }>("/api/products?activeOnly=false"),
      fetchJSON<{ orders: AdminOrder[] }>("/api/orders?scope=all"),
      fetchJSON<{ stock: StockItem[] }>("/api/stock"),
      fetchJSON<{ vouchers: Voucher[] }>("/api/vouchers"),
      fetchJSON<{ users: AdminUser[] }>("/api/users"),
      fetchJSON<{ audit: AuditEntry[] }>("/api/audit"),
      fetchJSON<{ notifications: AdminNotification[] }>("/api/notifications"),
      fetchJSON<{ settings: AdminSettings }>("/api/settings"),
      fetchJSON<{ gateways: Gateway[] }>("/api/gateways"),
    ]).then(([prods, ords, stk, vchs, usrs, aud, notifs, sets, gws]) => {
      if (!alive) return;
      setData((d) => ({
        ...d,
        products: Array.isArray(prods?.products) ? prods.products : d.products,
        orders: Array.isArray(ords?.orders) ? ords.orders : d.orders,
        stock: Array.isArray(stk?.stock) ? stk.stock : d.stock,
        vouchers: Array.isArray(vchs?.vouchers) ? vchs.vouchers : d.vouchers,
        users: Array.isArray(usrs?.users) ? usrs.users : d.users,
        audit: Array.isArray(aud?.audit) ? aud.audit : d.audit,
        notifications: Array.isArray(notifs?.notifications)
          ? notifs.notifications
          : d.notifications,
        settings: sets?.settings ?? d.settings,
        gateways: Array.isArray(gws?.gateways) ? gws.gateways : d.gateways,
      }));
    }).catch(() => {
      /* silent — data fallback ke seed/mock yang sudah loaded */
    });

    // Realtime subscribe (Phase 5 — live admin notifications + orders)
    let unsubscribe: (() => void) | null = null;
    (async () => {
      try {
        const { getBrowserClient } = await import("@/backend/db/client");
        const sb = getBrowserClient();
        const channel = sb
          .channel("admin-live")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "admin_notifications" },
            (payload) => {
              const row = payload.new as Record<string, unknown>;
              setData((d) => {
                if (d.notifications.some((n) => n.id === row.id)) return d;
                return {
                  ...d,
                  notifications: [
                    {
                      id: String(row.id),
                      at: String(row.at),
                      kind: row.kind as AdminNotification["kind"],
                      title: String(row.title),
                      body: String(row.body),
                      read: Boolean(row.read),
                    },
                    ...d.notifications,
                  ].slice(0, 100),
                };
              });
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "orders" },
            (payload) => {
              const row = payload.new as Record<string, unknown>;
              setData((d) => ({
                ...d,
                orders: d.orders.map((o) =>
                  o.id === row.id
                    ? {
                        ...o,
                        status: row.status as AdminOrder["status"],
                      }
                    : o
                ),
              }));
            }
          )
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "orders" },
            (payload) => {
              const row = payload.new as Record<string, unknown>;
              setData((d) => {
                if (d.orders.some((o) => o.id === row.id)) return d;
                const newOrder: AdminOrder = {
                  id: String(row.id),
                  date: String(row.created_at).slice(0, 10),
                  customer: String(row.customer_name),
                  email: String(row.customer_email),
                  product: String(row.product_name),
                  duration: String(row.duration),
                  total: Number(row.total_idr),
                  status: row.status as AdminOrder["status"],
                  payment: String(row.payment_method ?? "—"),
                };
                return { ...d, orders: [newOrder, ...d.orders] };
              });
            }
          )
          .subscribe();
        unsubscribe = () => {
          sb.removeChannel(channel);
        };
      } catch {
        /* Realtime gagal subscribe — admin tetap pakai polling refresh manual */
      }
    })();
    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, []);

  // Persist data
  useEffect(() => {
    if (!hydrated) return;
    saveState(data);
  }, [data, hydrated]);

  // Persist dark mode
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DARK_KEY, darkMode ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [darkMode, hydrated]);

  // Auto-pause produk yang stoknya 0 (kalau setting aktif)
  useEffect(() => {
    if (!hydrated) return;
    if (!data.settings?.autoPauseOutOfStock) return;
    const toToggle = data.products.filter((p) => p.stock === 0 && p.active);
    if (toToggle.length > 0) {
      setData((d) => ({
        ...d,
        products: d.products.map((p) =>
          p.stock === 0 && p.active ? { ...p, active: false } : p
        ),
      }));
      toToggle.forEach((p) =>
        setData((d) => ({
          ...d,
          notifications: [
            {
              id: "n" + Date.now() + Math.random(),
              at: new Date().toISOString(),
              kind: "warn" as NotificationKind,
              title: `Auto-pause: ${p.name}`,
              body: "Produk dinonaktifkan otomatis karena stok habis.",
              read: false,
            },
            ...d.notifications,
          ].slice(0, 100),
        }))
      );
    }
  }, [hydrated, data.products, data.settings?.autoPauseOutOfStock]);

  const updateProducts = useCallback(
    (fn: Updater<Product[]>) =>
      setData((d) => ({ ...d, products: applyUpdater(d.products, fn) })),
    []
  );
  const updateOrders = useCallback(
    (fn: Updater<AdminOrder[]>) =>
      setData((d) => ({ ...d, orders: applyUpdater(d.orders, fn) })),
    []
  );
  const updateStock = useCallback(
    (fn: Updater<StockItem[]>) =>
      setData((d) => ({ ...d, stock: applyUpdater(d.stock, fn) })),
    []
  );
  const updateUsers = useCallback(
    (fn: Updater<AdminUser[]>) =>
      setData((d) => ({ ...d, users: applyUpdater(d.users, fn) })),
    []
  );
  const updateVouchers = useCallback(
    (fn: Updater<Voucher[]>) =>
      setData((d) => ({ ...d, vouchers: applyUpdater(d.vouchers, fn) })),
    []
  );
  const updateGateways = useCallback(
    (fn: Updater<Gateway[]>) =>
      setData((d) => ({ ...d, gateways: applyUpdater(d.gateways, fn) })),
    []
  );
  const updateSettings = useCallback(
    (fn: Updater<AdminSettings>) =>
      setData((d) => ({ ...d, settings: applyUpdater(d.settings, fn) })),
    []
  );
  const updateNotifications = useCallback(
    (fn: Updater<AdminNotification[]>) =>
      setData((d) => ({ ...d, notifications: applyUpdater(d.notifications, fn) })),
    []
  );
  const updateNotes = useCallback(
    (fn: Updater<MemberNote[]>) =>
      setData((d) => ({ ...d, notes: applyUpdater(d.notes, fn) })),
    []
  );

  const logAudit = useCallback(
    (action: string, target: string, detail: string) => {
      setData((d) => ({
        ...d,
        audit: [
          {
            id: "a" + Date.now(),
            at: new Date().toISOString(),
            actor: "admin@lapakurab.id",
            action,
            target,
            detail,
          } as AuditEntry,
          ...d.audit,
        ].slice(0, 200),
      }));
      // Persist ke DB di Supabase mode (best-effort)
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
      if (url && key) {
        fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, target, detail }),
        }).catch(() => {
          /* silent — local state tetap terupdate */
        });
      }
    },
    []
  );

  const pushNotif = useCallback(
    (kind: NotificationKind, title: string, body: string) => {
      setData((d) => ({
        ...d,
        notifications: [
          {
            id: "n" + Date.now(),
            at: new Date().toISOString(),
            kind,
            title,
            body,
            read: false,
          },
          ...d.notifications,
        ].slice(0, 100),
      }));
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
      if (url && key) {
        fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, title, body }),
        }).catch(() => {
          /* silent */
        });
      }
    },
    []
  );

  const markNotifRead = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      notifications: d.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (url && key) {
      fetch(`/api/notifications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }).catch(() => {
        /* silent */
      });
    }
  }, []);

  const markAllNotifsRead = useCallback(() => {
    setData((d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, read: true })),
    }));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (url && key) {
      fetch("/api/notifications", { method: "PATCH" }).catch(() => {
        /* silent */
      });
    }
  }, []);

  const resetData = useCallback(() => {
    setData(SEED);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setAuthed(true);
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setAuthed(false);
    // Di Supabase mode, juga clear session cookie
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (url && key) {
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {
        /* ignore — best effort */
      });
    }
  }, []);

  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  const api: AdminApi = {
    ...data,
    authed,
    hydrated,
    login,
    logout,
    darkMode,
    toggleDark,
    updateProducts,
    updateOrders,
    updateStock,
    updateUsers,
    updateVouchers,
    updateGateways,
    updateSettings,
    updateNotifications,
    updateNotes,
    logAudit,
    pushNotif,
    markNotifRead,
    markAllNotifsRead,
    resetData,
  };

  return <AdminCtx.Provider value={api}>{children}</AdminCtx.Provider>;
}
