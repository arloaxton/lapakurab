-- Migration 007: tambah account_type ke orders table
--
-- Pre-req: migration 006 sudah di-apply (stock_items.account_type ada).
--
-- Order menyimpan account_type yang dipilih customer saat checkout, supaya
-- saat payment webhook confirm (mark paid → claim_stock), bisa filter
-- stock by type yang match dengan order.

alter table public.orders
  add column if not exists account_type text not null default 'private';

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_account_type_check'
  ) then
    alter table public.orders drop constraint orders_account_type_check;
  end if;
  alter table public.orders
    add constraint orders_account_type_check
    check (account_type in ('private', 'sharing'));
end $$;
