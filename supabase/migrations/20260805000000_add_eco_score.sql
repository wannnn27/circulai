-- Add eco_score column to products table
alter table public.products 
  add column if not exists eco_score integer not null default 20 
  check (eco_score >= 0 and eco_score <= 100);

-- Populate eco_score for initial products based on formula:
-- baseline(20) + Kain Sisa(+30) + Made-to-Order(+20) + min(30, floor(savedFabric / 0.1))
update public.products set eco_score = least(100,
  20
  + case when 'Kain Sisa' = any(badges) then 30 else 0 end
  + case when 'Made-to-Order' = any(badges) then 20 else 0 end
  + least(30, floor(
      cast(nullif(regexp_replace(saved_fabric, '[^0-9.]', '', 'g'), '') as numeric) / 0.1
    )::integer)
);
