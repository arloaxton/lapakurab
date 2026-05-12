-- Migration 006: tambah account_type ke stock_items + price_sharing_idr ke products
--
-- Use case: Netflix, Spotify, Disney+, dll bisa dijual sebagai akun
-- "private" (1 user/buyer dapat akses penuh) atau "sharing" (1 profil
-- dari akun yang di-share ke beberapa buyer). Pricing biasanya beda.
--
-- Idempotent: pakai add column if not exists + drop/create constraint.

-- ─── 1. stock_items.account_type ────────────────────────────────────────
alter table public.stock_items
  add column if not exists account_type text not null default 'private';

-- Constraint: hanya 'private' atau 'sharing'
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.stock_items'::regclass
      and conname = 'stock_items_account_type_check'
  ) then
    alter table public.stock_items
      drop constraint stock_items_account_type_check;
  end if;
  alter table public.stock_items
    add constraint stock_items_account_type_check
    check (account_type in ('private', 'sharing'));
end $$;

create index if not exists stock_items_product_type_status_idx
  on public.stock_items (product_id, account_type, status);

-- ─── 2. products.price_sharing_idr ──────────────────────────────────────
-- Nullable: NULL = produk hanya dijual sebagai private (no sharing variant)
alter table public.products
  add column if not exists price_sharing_idr int;

-- Constraint: kalau diisi, harus > 0 dan < price_idr (sharing lebih murah)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_price_sharing_check'
  ) then
    alter table public.products
      drop constraint products_price_sharing_check;
  end if;
  alter table public.products
    add constraint products_price_sharing_check
    check (price_sharing_idr is null or (price_sharing_idr > 0 and price_sharing_idr < price_idr));
end $$;

-- ─── 3. Update claim_stock RPC: terima p_account_type, filter stock ─────
drop function if exists public.claim_stock(text, text);
drop function if exists public.claim_stock(text, text, text);

create or replace function public.claim_stock(
  p_order_id text,
  p_product_id text,
  p_account_type text default 'private'
)
returns table (
  id text,
  field1 text,
  field2 text,
  field3 text,
  notes text,
  credential_format text,
  account_type text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_id text;
  fmt text;
begin
  if p_account_type not in ('private', 'sharing') then
    raise exception 'Invalid account_type: %', p_account_type;
  end if;

  -- Pick + lock satu stock available dengan account_type yang match
  select s.id into claimed_id
  from public.stock_items s
  where s.product_id = p_product_id
    and s.status = 'available'
    and s.account_type = p_account_type
  order by s.added_at asc
  limit 1
  for update skip locked;

  if claimed_id is null then
    return; -- empty: stock habis untuk tipe ini, order tetap 'paid'
  end if;

  update public.stock_items
  set status = 'sold', order_id = p_order_id, sold_at = now()
  where stock_items.id = claimed_id;

  update public.orders
  set status = 'delivered', delivered_at = now()
  where orders.id = p_order_id;

  select p.credential_format into fmt
  from public.products p where p.id = p_product_id;

  return query
  select
    s.id,
    s.field1,
    s.field2,
    s.field3,
    s.notes,
    coalesce(fmt, 'email_password') as credential_format,
    s.account_type
  from public.stock_items s
  where s.id = claimed_id;
end;
$$;

revoke all on function public.claim_stock(text, text, text) from public;
grant execute on function public.claim_stock(text, text, text) to authenticated;
