-- ════════════════════════════════════════════════════════════════════════
--  Migration 002: categories table + products.cat → category_id (FK)
-- ────────────────────────────────────────────────────────────────────────
--  Run sekali di Supabase SQL Editor. Idempotent (safe untuk re-run).
--
--  Before: products.cat text check (cat in ('streaming', 'vpn'))
--  After:  categories (id PK) + products.category_id FK references categories.id
--
--  Strategi backward-compat: slug-as-ID. Value lama 'streaming' & 'vpn' jadi
--  PK kategori, products.category_id auto-copy dari products.cat.
-- ════════════════════════════════════════════════════════════════════════

-- ─── 1. Bikin tabel categories ──────────────────────────────────────────
create table if not exists public.categories (
  id text primary key,                          -- slug, mis. 'streaming', 'gaming'
  label text not null,                          -- display, mis. 'Streaming Premium'
  emoji text default '✦',
  description text,                             -- optional, untuk SEO/header katalog
  sort_order int not null default 100,          -- ordering di home/filter
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists categories_active_idx on public.categories(active);
create index if not exists categories_sort_idx on public.categories(sort_order);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ─── 2. Seed 2 kategori awal dari hardcoded value lama ─────────────────
insert into public.categories (id, label, emoji, sort_order, active) values
  ('streaming', 'Streaming', '▶', 10, true),
  ('vpn', 'VPN', '◈', 20, true)
on conflict (id) do nothing;

-- ─── 3. Migrasi products.cat → products.category_id ────────────────────
-- Strategi: add new column dulu, copy value, baru drop old.
alter table public.products
  add column if not exists category_id text;

-- Backfill dari kolom cat lama (kalau masih ada datanya)
update public.products
set category_id = cat
where category_id is null and cat is not null;

-- Drop check constraint lama (kalau ada — nama default Postgres)
do $$
declare
  c text;
begin
  select conname into c from pg_constraint
   where conrelid = 'public.products'::regclass
     and conname like 'products_cat_check%'
   limit 1;
  if c is not null then
    execute format('alter table public.products drop constraint %I', c);
  end if;
end $$;

-- Drop index lama
drop index if exists public.products_cat_idx;

-- Drop kolom cat lama (sudah di-backfill)
alter table public.products drop column if exists cat;

-- Add FK constraint (set null kalau category dihapus — produk tetap ada)
alter table public.products
  drop constraint if exists products_category_id_fkey;
alter table public.products
  add constraint products_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete set null;

-- Index baru
create index if not exists products_category_id_idx on public.products(category_id);

-- ─── 4. RLS untuk categories ────────────────────────────────────────────
alter table public.categories enable row level security;

-- Public read: storefront butuh list kategori (semua user, termasuk anon)
drop policy if exists "anyone select active categories" on public.categories;
create policy "anyone select active categories"
  on public.categories for select
  using (active = true or public.is_admin(auth.uid()));

-- Admin: full write
drop policy if exists "admins write categories" on public.categories;
create policy "admins write categories"
  on public.categories for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  Done. Verifikasi:
--    select id, label, sort_order from public.categories order by sort_order;
--    select id, name, category_id from public.products limit 5;
-- ════════════════════════════════════════════════════════════════════════
