-- ════════════════════════════════════════════════════════════════════════
--  Migration 003: auto-sync products.stock dengan COUNT(stock_items available)
-- ────────────────────────────────────────────────────────────────────────
--  Sebelumnya products.stock = static counter yang diisi manual saat
--  create product. Tidak ter-update saat admin tambah/hapus stok_items.
--
--  Fix: trigger AFTER INSERT/UPDATE/DELETE on stock_items → recalc
--  products.stock berdasarkan COUNT stock_items dengan status='available'.
--
--  Plus: one-shot recalc untuk semua produk existing (sync data sekarang).
-- ════════════════════════════════════════════════════════════════════════

-- ─── 1. Helper function: recalc stock untuk 1 product_id ───────────────
create or replace function public.recalc_product_stock(p_product_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if p_product_id is null then return; end if;
  select count(*) into v_count
  from public.stock_items
  where product_id = p_product_id and status = 'available';
  update public.products set stock = v_count where id = p_product_id;
end;
$$;

-- ─── 2. Trigger function: dispatch berdasarkan operation ───────────────
create or replace function public.stock_items_sync_product_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.recalc_product_stock(new.product_id);
  elsif tg_op = 'UPDATE' then
    -- Recalc untuk product_id lama (kalau berubah) + baru
    if old.product_id is distinct from new.product_id then
      perform public.recalc_product_stock(old.product_id);
    end if;
    perform public.recalc_product_stock(new.product_id);
  elsif tg_op = 'DELETE' then
    perform public.recalc_product_stock(old.product_id);
    return old;
  end if;
  return new;
end;
$$;

-- ─── 3. Pasang trigger ──────────────────────────────────────────────────
drop trigger if exists stock_items_sync_product_stock_trigger on public.stock_items;
create trigger stock_items_sync_product_stock_trigger
  after insert or update or delete on public.stock_items
  for each row execute function public.stock_items_sync_product_stock();

-- ─── 4. One-shot recalc untuk semua produk existing ────────────────────
-- Update products.stock = COUNT(stock_items available) untuk setiap product.
update public.products p
set stock = coalesce(s.cnt, 0)
from (
  select product_id, count(*) as cnt
  from public.stock_items
  where status = 'available'
  group by product_id
) s
where s.product_id = p.id;

-- Untuk produk yang TIDAK punya stock_items sama sekali, set stock=0
update public.products
set stock = 0
where id not in (
  select distinct product_id from public.stock_items where product_id is not null
);

-- ════════════════════════════════════════════════════════════════════════
--  Done. Verifikasi:
--    select p.id, p.name, p.stock as cached, count(s.id) as actual
--    from public.products p
--    left join public.stock_items s
--      on s.product_id = p.id and s.status = 'available'
--    group by p.id, p.name, p.stock
--    order by p.created_at;
--
--  cached === actual untuk semua row.
-- ════════════════════════════════════════════════════════════════════════
