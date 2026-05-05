-- ════════════════════════════════════════════════════════════════════════
--  lapakurab — Phase 1 schema
-- ────────────────────────────────────────────────────────────────────────
--  Run di: Supabase Dashboard → SQL Editor → paste & run.
--  Idempotent? Tidak — jangan run 2x kecuali drop dulu.
--
--  Tabel di phase 1: profiles, products
--  RLS aktif dgn policy basic: user lihat punya sendiri, admin lihat semua.
-- ════════════════════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────────────────
-- Auth (auth.users) sudah ada bawaan Supabase.
-- Storage juga sudah ada bawaan.
-- pg_trgm dibutuhkan untuk trigram index (search produk).
create extension if not exists pg_trgm;

-- ════════════════════════════════════════════════════════════════════════
--  profiles
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'banned')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Idempotent: tambah column status kalau belum ada (re-run safe)
alter table public.profiles
  add column if not exists status text not null default 'active'
  check (status in ('active', 'banned'));

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_role_idx on public.profiles(role);

-- Auto-create profile saat user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger (re-usable)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
--  products
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.products (
  id text primary key,
  name text not null,
  cat text not null check (cat in ('streaming', 'vpn')),
  tagline text not null,
  price_idr int not null check (price_idr > 0),
  old_idr int not null check (old_idr >= price_idr),
  stock int not null default 0 check (stock >= 0),
  rating numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  reviews int not null default 0 check (reviews >= 0),
  durations text[] not null default array['1 Bulan']::text[],
  hue int not null check (hue between 0 and 360),
  emoji text default '✦',
  active boolean not null default true,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_cat_idx on public.products(cat);
create index if not exists products_active_idx on public.products(active);
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
--  Helper function: cek apakah caller adalah admin
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- ════════════════════════════════════════════════════════════════════════
--  RLS — profiles
-- ════════════════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;

drop policy if exists "users select own profile" on public.profiles;
create policy "users select own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "admins select all profiles" on public.profiles;
create policy "admins select all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "admins update any profile" on public.profiles;
create policy "admins update any profile"
  on public.profiles for update
  using (public.is_admin(auth.uid()));

-- (no insert policy — handled by trigger on auth signup)

-- ════════════════════════════════════════════════════════════════════════
--  RLS — products
-- ════════════════════════════════════════════════════════════════════════
alter table public.products enable row level security;

-- Public read: semua user (termasuk anonymous) bisa lihat produk active.
-- Admin: bisa lihat semua (termasuk inactive).
drop policy if exists "anyone select active products" on public.products;
create policy "anyone select active products"
  on public.products for select
  using (active = true or public.is_admin(auth.uid()));

drop policy if exists "admins write products" on public.products;
create policy "admins write products"
  on public.products for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  Seed data — 8 produk awal (mirror lib/mock/products.ts)
-- ════════════════════════════════════════════════════════════════════════
insert into public.products (id, name, cat, tagline, price_idr, old_idr, stock, rating, reviews, durations, hue, emoji, active) values
  ('p1', 'Streamflix Premium', 'streaming', '4K UHD · 4 Profil', 25000, 55000, 12, 4.9, 1284, array['1 Bulan','3 Bulan','6 Bulan','1 Tahun'], 340, '▶', true),
  ('p2', 'Tunify Family', 'streaming', 'Musik tanpa iklan · 6 akun', 18000, 42000, 8, 4.8, 932, array['1 Bulan','3 Bulan','6 Bulan'], 140, '♪', true),
  ('p3', 'CloudVPN Pro', 'vpn', '80+ negara · No-log', 15000, 35000, 24, 4.7, 512, array['1 Bulan','6 Bulan','1 Tahun','2 Tahun'], 220, '◈', true),
  ('p4', 'Disnia+ Hotstart', 'streaming', 'Marvel · Star Wars · Pixar', 22000, 49000, 5, 4.9, 2104, array['1 Bulan','3 Bulan','1 Tahun'], 265, '✦', true),
  ('p5', 'YouTune Premium', 'streaming', 'No ads · Background play', 12000, 28000, 31, 4.8, 1876, array['1 Bulan','3 Bulan','6 Bulan','1 Tahun'], 10, '▷', true),
  ('p6', 'NordSecure VPN', 'vpn', '5500+ server · Kill switch', 20000, 48000, 17, 4.6, 743, array['1 Bulan','1 Tahun','2 Tahun'], 200, '◇', true),
  ('p7', 'HBO Mix', 'streaming', 'Series premium · Original', 28000, 60000, 3, 4.9, 654, array['1 Bulan','3 Bulan'], 285, '◉', true),
  ('p8', 'Surfly VPN Lite', 'vpn', 'Ringan & cepat · 1 device', 9000, 22000, 42, 4.5, 298, array['1 Bulan','3 Bulan','6 Bulan'], 170, '≈', false)
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════════════
--  orders (Phase 2A)
-- ════════════════════════════════════════════════════════════════════════
--  Satu cart line = satu order row (mirror struktur AdminOrder mock).
--  Voucher & admin fee TIDAK di-split per row di phase 2A.
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  duration text not null,
  qty int not null default 1 check (qty > 0),
  total_idr int not null check (total_idr >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'delivered', 'refunded', 'failed')),
  payment_method text,
  notes text,
  delivered_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ─── RLS — orders ───────────────────────────────────────────────────────
alter table public.orders enable row level security;

drop policy if exists "users select own orders" on public.orders;
create policy "users select own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "admins select all orders" on public.orders;
create policy "admins select all orders"
  on public.orders for select
  using (public.is_admin(auth.uid()));

drop policy if exists "users insert own orders" on public.orders;
create policy "users insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders"
  on public.orders for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders"
  on public.orders for delete
  using (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  stock_items (Phase 2B) — pool kredensial siap kirim
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.stock_items (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  email text not null,
  password text not null,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold', 'expired')),
  order_id text references public.orders(id) on delete set null,
  added_at timestamptz default now(),
  sold_at timestamptz
);

create index if not exists stock_items_product_idx on public.stock_items(product_id);
create index if not exists stock_items_status_idx on public.stock_items(status);
create index if not exists stock_items_order_idx on public.stock_items(order_id);

-- ─── RLS — stock_items ──────────────────────────────────────────────────
alter table public.stock_items enable row level security;

-- Admin: full access.
drop policy if exists "admins all stock" on public.stock_items;
create policy "admins all stock"
  on public.stock_items for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- User: bisa lihat HANYA stock yang sudah di-link ke order miliknya.
drop policy if exists "users select own stock" on public.stock_items;
create policy "users select own stock"
  on public.stock_items for select
  using (
    order_id is not null
    and exists (
      select 1 from public.orders o
      where o.id = stock_items.order_id and o.user_id = auth.uid()
    )
  );

-- ─── claim_stock RPC ────────────────────────────────────────────────────
-- Atomic: pilih satu stock available untuk product, mark sold, link ke order,
-- update status order ke 'delivered'. Return kredensial ke caller.
-- security definer agar bisa write meski user RLS terbatas.
create or replace function public.claim_stock(p_order_id text, p_product_id text)
returns table (id text, email text, password text)
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_id text;
begin
  -- Pick + lock satu stock available
  select s.id into claimed_id
  from public.stock_items s
  where s.product_id = p_product_id and s.status = 'available'
  order by s.added_at asc
  limit 1
  for update skip locked;

  if claimed_id is null then
    return; -- empty result: stock habis, order tetap 'paid'
  end if;

  update public.stock_items
  set status = 'sold', order_id = p_order_id, sold_at = now()
  where stock_items.id = claimed_id;

  update public.orders
  set status = 'delivered', delivered_at = now()
  where orders.id = p_order_id;

  return query
  select s.id, s.email, s.password
  from public.stock_items s
  where s.id = claimed_id;
end;
$$;

revoke all on function public.claim_stock(text, text) from public;
grant execute on function public.claim_stock(text, text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
--  vouchers (Phase 2C)
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.vouchers (
  id text primary key,
  code text unique not null,
  type text not null check (type in ('percent', 'fixed')),
  value int not null check (value >= 0),
  min_order int not null default 0 check (min_order >= 0),
  used int not null default 0 check (used >= 0),
  limit_total int not null default 0 check (limit_total >= 0),  -- 0 = unlimited
  expires date,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists vouchers_code_idx on public.vouchers(code);
create index if not exists vouchers_active_idx on public.vouchers(active);

drop trigger if exists vouchers_set_updated_at on public.vouchers;
create trigger vouchers_set_updated_at
  before update on public.vouchers
  for each row execute function public.set_updated_at();

alter table public.vouchers enable row level security;

-- Authenticated user: bisa baca voucher aktif (untuk validate kode)
drop policy if exists "auth select active vouchers" on public.vouchers;
create policy "auth select active vouchers"
  on public.vouchers for select
  to authenticated
  using (active = true or public.is_admin(auth.uid()));

drop policy if exists "admins write vouchers" on public.vouchers;
create policy "admins write vouchers"
  on public.vouchers for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- RPC: increment voucher.used (atomic)
create or replace function public.redeem_voucher(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
  v_limit int;
  v_used int;
  v_active boolean;
  v_expires date;
begin
  select id, limit_total, used, active, expires
  into v_id, v_limit, v_used, v_active, v_expires
  from public.vouchers
  where code = p_code
  for update;

  if v_id is null then return false; end if;
  if not v_active then return false; end if;
  if v_expires is not null and v_expires < current_date then return false; end if;
  if v_limit > 0 and v_used >= v_limit then return false; end if;

  update public.vouchers
  set used = used + 1
  where id = v_id;

  return true;
end;
$$;

revoke all on function public.redeem_voucher(text) from public;
grant execute on function public.redeem_voucher(text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
--  audit_log (Phase 2C)
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.audit_log (
  id bigserial primary key,
  at timestamptz default now(),
  actor uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  target text not null,
  detail text
);

create index if not exists audit_log_at_idx on public.audit_log(at desc);
create index if not exists audit_log_action_idx on public.audit_log(action);
create index if not exists audit_log_actor_idx on public.audit_log(actor);

alter table public.audit_log enable row level security;

drop policy if exists "admins select audit" on public.audit_log;
create policy "admins select audit"
  on public.audit_log for select
  using (public.is_admin(auth.uid()));

drop policy if exists "admins insert audit" on public.audit_log;
create policy "admins insert audit"
  on public.audit_log for insert
  with check (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  admin_notifications (Phase 2C)
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.admin_notifications (
  id text primary key,
  at timestamptz default now(),
  kind text not null check (kind in ('order', 'success', 'warn', 'danger', 'info')),
  title text not null,
  body text not null,
  read boolean not null default false
);

create index if not exists admin_notifications_at_idx on public.admin_notifications(at desc);
create index if not exists admin_notifications_read_idx on public.admin_notifications(read);

alter table public.admin_notifications enable row level security;

drop policy if exists "admins all admin_notifs" on public.admin_notifications;
create policy "admins all admin_notifs"
  on public.admin_notifications for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  member_notes (Phase 2C) — catatan admin per-member
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.member_notes (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  at timestamptz default now(),
  actor uuid references auth.users(id) on delete set null,
  actor_email text,
  text text not null
);

create index if not exists member_notes_user_idx on public.member_notes(user_id);
create index if not exists member_notes_at_idx on public.member_notes(at desc);

alter table public.member_notes enable row level security;

drop policy if exists "admins all notes" on public.member_notes;
create policy "admins all notes"
  on public.member_notes for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  settings (Phase 2D) — single-row config toko
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.settings (
  id text primary key default 'singleton',
  store_name text not null default 'lapakurab',
  store_tagline text not null default 'Premium accounts, fair price',
  logo text default '',
  cs_wa text default '',
  cs_email text default '',
  notif_email text default '',
  notify_on_order boolean not null default true,
  notify_on_low_stock boolean not null default true,
  notify_on_refund boolean not null default true,
  auto_delivery boolean not null default true,
  auto_pause_out_of_stock boolean not null default false,
  low_stock_threshold int not null default 5,
  invoice_prefix text not null default 'TKA',
  tax_percent numeric(5,2) not null default 0,
  admin_fee_idr int not null default 2500,
  updated_at timestamptz default now()
);

-- Idempotent: tambah column admin_fee kalau settings sudah ada
alter table public.settings
  add column if not exists admin_fee_idr int not null default 2500;

-- Seed singleton row
insert into public.settings (id) values ('singleton') on conflict (id) do nothing;

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

alter table public.settings enable row level security;

-- Public read: storefront butuh storeName/tagline/logo/cs info
drop policy if exists "anyone select settings" on public.settings;
create policy "anyone select settings"
  on public.settings for select
  using (true);

drop policy if exists "admins update settings" on public.settings;
create policy "admins update settings"
  on public.settings for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  gateways (Phase 2D) — payment gateway config
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.gateways (
  id text primary key,
  name text not null,
  enabled boolean not null default false,
  fee numeric(5,2) not null default 0 check (fee >= 0),
  api_key text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists gateways_set_updated_at on public.gateways;
create trigger gateways_set_updated_at
  before update on public.gateways
  for each row execute function public.set_updated_at();

-- Seed initial gateways (idempotent — kalau sudah ada, skip)
insert into public.gateways (id, name, enabled, fee, api_key) values
  ('qris', 'QRIS', true, 0.7, 'qr_live_xxxxxxxxx'),
  ('gopay', 'GoPay', true, 2.0, 'gp_live_xxxxxxxxx'),
  ('ovo', 'OVO', true, 2.0, 'ovo_live_xxxxxxxx'),
  ('dana', 'DANA', true, 1.5, 'dn_live_xxxxxxxxx'),
  ('shopeepay', 'ShopeePay', false, 2.0, '')
on conflict (id) do nothing;

alter table public.gateways enable row level security;

-- api_key sensitif → admin only untuk SELECT & ALL.
-- Untuk public-facing checkout, frontend sekarang masih pakai PAYMENT_METHODS mock;
-- Phase 4 akan add separate /api/gateways/public yang return tanpa key.
drop policy if exists "admins all gateways" on public.gateways;
create policy "admins all gateways"
  on public.gateways for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  Storage: product-images bucket (Phase 3)
-- ════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public view product images" on storage.objects;
create policy "public view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin(auth.uid()));

drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));

drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  orders payment fields (Phase 4 — Tokopay)
-- ════════════════════════════════════════════════════════════════════════
alter table public.orders
  add column if not exists payment_ref text;
alter table public.orders
  add column if not exists payment_url text;
alter table public.orders
  add column if not exists tokopay_trx_id text;
alter table public.orders
  add column if not exists qr_string text;
alter table public.orders
  add column if not exists discount_idr int not null default 0;
alter table public.orders
  add column if not exists admin_fee_idr int not null default 0;
alter table public.orders
  add column if not exists voucher_code text;

create index if not exists orders_payment_ref_idx on public.orders(payment_ref);

-- ════════════════════════════════════════════════════════════════════════
--  Realtime publication (Phase 5 — live admin updates)
-- ════════════════════════════════════════════════════════════════════════
-- supabase_realtime publication sudah ada bawaan Supabase. Kita add
-- table-table yang mau dipantau via Realtime channel.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- admin_notifications: admin panel subscribe untuk live notif badge
    begin
      alter publication supabase_realtime add table public.admin_notifications;
    exception when duplicate_object then null;
    end;
    -- orders: customer dashboard + admin panel subscribe untuk status update
    begin
      alter publication supabase_realtime add table public.orders;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

-- ════════════════════════════════════════════════════════════════════════
--  Hardening (Phase 5): webhook_log + auto-pause trigger
-- ════════════════════════════════════════════════════════════════════════

-- ─── webhook_log: dedup + audit trail ──────────────────────────────────
create table if not exists public.webhook_log (
  id bigserial primary key,
  source text not null,
  reff_id text not null,
  signature text not null,
  payload jsonb,
  status int,
  received_at timestamptz default now()
);

create unique index if not exists webhook_log_source_signature_uq
  on public.webhook_log(source, signature);
create index if not exists webhook_log_received_at_idx
  on public.webhook_log(received_at desc);

alter table public.webhook_log enable row level security;

drop policy if exists "admins select webhook_log" on public.webhook_log;
create policy "admins select webhook_log"
  on public.webhook_log for select
  using (public.is_admin(auth.uid()));

-- ─── Auto-pause trigger ────────────────────────────────────────────────
-- Server-side enforcement: kalau settings.auto_pause_out_of_stock = true
-- dan stock baru jadi 0, paksa active = false. Berlaku untuk semua client
-- yang mutate products (admin panel, cron, RPC).
create or replace function public.products_auto_pause()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  enabled boolean;
begin
  if new.stock = 0 and new.active = true then
    select auto_pause_out_of_stock into enabled
    from public.settings where id = 'singleton';
    if coalesce(enabled, false) then
      new.active := false;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists products_auto_pause_trigger on public.products;
create trigger products_auto_pause_trigger
  before update of stock on public.products
  for each row execute function public.products_auto_pause();

-- ─── Stock pool low-stock notifier ──────────────────────────────────────
-- Saat stock_items berubah ke 'sold', cek sisa available untuk product itu.
-- Kalau ≤ settings.low_stock_threshold dan settings.notify_on_low_stock,
-- insert admin_notifications entry.
create or replace function public.notify_low_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  threshold int;
  notify_enabled boolean;
  available_count int;
  prod_name text;
begin
  -- Hanya trigger saat status berubah jadi 'sold' (delivered to customer)
  if new.status <> 'sold' or coalesce(old.status, '') = 'sold' then
    return new;
  end if;

  select low_stock_threshold, notify_on_low_stock
  into threshold, notify_enabled
  from public.settings where id = 'singleton';

  if not coalesce(notify_enabled, false) then
    return new;
  end if;

  select count(*) into available_count
  from public.stock_items
  where product_id = new.product_id and status = 'available';

  if available_count <= coalesce(threshold, 5) then
    select name into prod_name from public.products where id = new.product_id;
    insert into public.admin_notifications (id, kind, title, body)
    values (
      'lowstock-' || new.product_id || '-' || extract(epoch from now())::text,
      'warn',
      'Stok hampir habis: ' || coalesce(prod_name, new.product_id),
      'Sisa stok available: ' || available_count || '. Tambah stok di /admin/stock.'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists stock_items_low_stock_notif on public.stock_items;
create trigger stock_items_low_stock_notif
  after update of status on public.stock_items
  for each row execute function public.notify_low_stock();

-- ─── Order status notifier (notifyOnOrder + notifyOnRefund) ─────────────
-- AFTER UPDATE on orders: kalau status pending → paid/delivered, fire notif
-- order baru. Kalau status → refunded, fire notif refund. Hormati settings.
create or replace function public.notify_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  notify_order boolean;
  notify_refund boolean;
begin
  if old.status = new.status then return new; end if;

  select notify_on_order, notify_on_refund
  into notify_order, notify_refund
  from public.settings where id = 'singleton';

  -- Order baru paid (transition pending → paid/delivered)
  if old.status = 'pending'
     and (new.status = 'paid' or new.status = 'delivered')
     and coalesce(notify_order, false) then
    insert into public.admin_notifications (id, kind, title, body)
    values (
      'ord-' || new.id || '-paid',
      'order',
      'Order baru: ' || new.product_name,
      'Customer ' || new.customer_name || ' (' || new.customer_email || ') · Rp' ||
        new.total_idr::text || ' · #' || new.id
    )
    on conflict (id) do nothing;
  end if;

  -- Refund (transition any → refunded)
  if new.status = 'refunded'
     and old.status <> 'refunded'
     and coalesce(notify_refund, false) then
    insert into public.admin_notifications (id, kind, title, body)
    values (
      'ord-' || new.id || '-refund',
      'danger',
      'Refund diproses: ' || new.product_name,
      '#' || new.id || ' · ' || new.customer_email || ' dikembalikan Rp' || new.total_idr::text
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_notify_status on public.orders;
create trigger orders_notify_status
  after update of status on public.orders
  for each row execute function public.notify_order_status();

-- ════════════════════════════════════════════════════════════════════════
--  Done. Setelah run:
--    1. Daftar 1 user via /register di app.
--    2. Promote user jadi admin (ganti email):
--         update public.profiles set role = 'admin'
--         where email = 'you@example.com';
--    3. Login ke /admin, akses harus OK.
-- ════════════════════════════════════════════════════════════════════════
