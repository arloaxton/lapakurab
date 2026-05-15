-- Migration 008: rename orders.tokopay_trx_id → orders.payment_trx_id
--
-- Generic field name supaya tidak vendor-locked. Pakasir kita pakai
-- column ini untuk menyimpan order_id Pakasir (yang juga = payment_ref
-- kita). Idempotent: rename hanya kalau column lama ada.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'tokopay_trx_id'
  ) then
    alter table public.orders rename column tokopay_trx_id to payment_trx_id;
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'payment_trx_id'
  ) then
    -- Edge case: belum ada sama sekali. Bikin baru.
    alter table public.orders add column payment_trx_id text;
  end if;
end $$;
