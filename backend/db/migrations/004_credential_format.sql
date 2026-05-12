-- ════════════════════════════════════════════════════════════════════════
--  Migration 004: flexible credential format
-- ────────────────────────────────────────────────────────────────────────
--  Sebelumnya stock_items kaku: email + password wajib. Tidak cocok untuk
--  game (email+PIN), license key, link redeem, cookie.
--
--  Setelah migration:
--  - products.credential_format enum: pilihan template per produk
--  - stock_items: kolom email/password di-rename jadi field1/field2 (generic),
--    plus field3 + notes untuk format yang butuh lebih
--  - Label field di-resolve di UI berdasarkan credential_format
--  - claim_stock RPC di-update untuk return generic fields + format
-- ════════════════════════════════════════════════════════════════════════

-- ─── 1. Add credential_format ke products ──────────────────────────────
alter table public.products
  add column if not exists credential_format text not null default 'email_password';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_credential_format_check'
  ) then
    alter table public.products
      add constraint products_credential_format_check
      check (credential_format in (
        'email_password', 'email_pin', 'key_only', 'link_only', 'cookie', 'custom'
      ));
  end if;
end $$;

-- ─── 2. Add generic fields ke stock_items ──────────────────────────────
alter table public.stock_items add column if not exists field1 text;
alter table public.stock_items add column if not exists field2 text;
alter table public.stock_items add column if not exists field3 text;
alter table public.stock_items add column if not exists notes text;

-- ─── 3. Backfill dari email/password lama (kalau masih ada) ────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stock_items' and column_name = 'email'
  ) then
    execute 'update public.stock_items set field1 = email where field1 is null and email is not null';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stock_items' and column_name = 'password'
  ) then
    execute 'update public.stock_items set field2 = password where field2 is null and password is not null';
  end if;
end $$;

-- ─── 4. Drop kolom email/password lama ─────────────────────────────────
alter table public.stock_items drop column if exists email;
alter table public.stock_items drop column if exists password;

-- ─── 5. Add NOT NULL constraint untuk field1 (minimal 1 field wajib) ───
-- Backfill kosong → set string kosong supaya constraint pass (edge case)
update public.stock_items set field1 = '' where field1 is null;
alter table public.stock_items alter column field1 set not null;
alter table public.stock_items alter column field1 set default '';

-- ─── 6. Update claim_stock RPC: return generic fields + format ─────────
drop function if exists public.claim_stock(text, text);

create or replace function public.claim_stock(p_order_id text, p_product_id text)
returns table (
  id text,
  field1 text,
  field2 text,
  field3 text,
  notes text,
  credential_format text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_id text;
  fmt text;
begin
  -- Pick + lock satu stock available
  select s.id into claimed_id
  from public.stock_items s
  where s.product_id = p_product_id and s.status = 'available'
  order by s.added_at asc
  limit 1
  for update skip locked;

  if claimed_id is null then
    return; -- empty: stock habis, order tetap 'paid'
  end if;

  update public.stock_items
  set status = 'sold', order_id = p_order_id, sold_at = now()
  where stock_items.id = claimed_id;

  update public.orders
  set status = 'delivered', delivered_at = now()
  where orders.id = p_order_id;

  -- Lookup credential_format dari products
  select p.credential_format into fmt
  from public.products p where p.id = p_product_id;

  return query
  select
    s.id,
    s.field1,
    s.field2,
    s.field3,
    s.notes,
    coalesce(fmt, 'email_password') as credential_format
  from public.stock_items s
  where s.id = claimed_id;
end;
$$;

revoke all on function public.claim_stock(text, text) from public;
grant execute on function public.claim_stock(text, text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════
--  Done. Verifikasi:
--    select id, name, credential_format from public.products;
--    select id, product_id, field1, field2, field3, notes, status
--    from public.stock_items;
-- ════════════════════════════════════════════════════════════════════════
