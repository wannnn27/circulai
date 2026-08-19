-- Storage bucket for product images (managed by admin/tailor)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

-- Allow public read for product images
drop policy if exists "Product images public read" on storage.objects;
create policy "Product images public read" on storage.objects
  for select using (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images');

-- Allow authenticated users to update/replace product images
drop policy if exists "Authenticated update product images" on storage.objects;
create policy "Authenticated update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

-- Allow authenticated users to delete product images
drop policy if exists "Authenticated delete product images" on storage.objects;
create policy "Authenticated delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images');

-- Add image_storage_path column to products for tracking uploaded images
alter table public.products
  add column if not exists image_storage_path text;

-- Allow authenticated users to update product image fields
drop policy if exists "Authenticated update product image" on public.products;
create policy "Authenticated update product image" on public.products
  for update to authenticated
  using (true)
  with check (true);
