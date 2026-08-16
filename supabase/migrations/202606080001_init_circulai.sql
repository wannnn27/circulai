create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  tailor_name text not null,
  tailor_city text not null,
  price integer not null check (price >= 0),
  badges text[] not null default '{}',
  category text not null,
  eta text not null,
  rating numeric(3, 2) not null default 0,
  saved_fabric text not null default '0.0m',
  material text not null,
  color text,
  image text,
  description text,
  measurements text[] not null default '{}',
  recommendations text[] not null default '{}',
  order_type text not null default 'catalog',
  sort_order integer not null default 0,
  stock integer not null default 10,
  initial_stock integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tailors (
  id bigserial primary key,
  name text not null unique,
  city text not null,
  specialty text,
  rating numeric(3, 2) not null default 0,
  sold integer not null default 0,
  experience text,
  response_time text,
  verified boolean not null default true,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_user_code text not null default 'USR-001',
  name text not null,
  email text,
  phone text,
  photo_uri text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.measurements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  height text,
  chest text,
  waist text,
  hips text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notifications jsonb not null default '{}',
  security jsonb not null default '{}',
  privacy jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.style_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  receiver text not null,
  phone text not null,
  detail text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text,
  product_snapshot jsonb not null,
  customization jsonb not null default '{}',
  quantity integer not null default 1 check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'WAITING_PAYMENT',
  payload jsonb not null,
  return_request jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.return_requests (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null references public.orders(id) on delete cascade,
  status text not null default 'REVIEWING',
  reason_id text not null,
  reason_label text not null,
  notes text not null,
  evidence_photos text[] not null default '{}',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tailor_name text not null,
  sender text not null check (sender in ('user', 'tailor', 'system')),
  text text not null,
  context jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null references public.orders(id) on delete cascade,
  provider text not null default 'midtrans',
  status text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cart_items_user_id_idx on public.cart_items(user_id);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists messages_user_tailor_idx on public.messages(user_id, tailor_name, created_at);
create index if not exists return_requests_user_id_idx on public.return_requests(user_id);

alter table public.products enable row level security;
alter table public.tailors enable row level security;
alter table public.profiles enable row level security;
alter table public.measurements enable row level security;
alter table public.preferences enable row level security;
alter table public.style_profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.return_requests enable row level security;
alter table public.messages enable row level security;
alter table public.payment_attempts enable row level security;

create policy "Products are readable by everyone" on public.products for select using (true);
create policy "Tailors are readable by everyone" on public.tailors for select using (true);

create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own measurements" on public.measurements for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own preferences" on public.preferences for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own style profile" on public.style_profiles for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own addresses" on public.addresses for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own wishlist" on public.wishlists for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own cart" on public.cart_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own orders" on public.orders for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own return requests" on public.return_requests for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own messages" on public.messages for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own payment attempts" on public.payment_attempts for select to authenticated using (auth.uid() = user_id);

create or replace function public.place_order(
  p_order_id text,
  p_status text,
  p_payload jsonb
)
returns public.orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_order public.orders;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.orders (id, user_id, status, payload)
  values (p_order_id, auth.uid(), p_status, p_payload)
  returning * into created_order;

  delete from public.cart_items where user_id = auth.uid();
  return created_order;
end;
$$;

revoke all on function public.place_order(text, text, jsonb) from public;
grant execute on function public.place_order(text, text, jsonb) to authenticated;

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('return-evidence', 'return-evidence', true)
on conflict (id) do update set public = excluded.public;

create policy "Users upload own avatars" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update own avatars" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Avatar public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Users upload own return evidence" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'return-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Return evidence public read for demo" on storage.objects
  for select using (bucket_id = 'return-evidence');

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

insert into public.tailors (id, name, city, specialty, rating, sold, experience, response_time, verified, image)
values
  (1, 'Rahayu Tailor', 'Sleman, Yogyakarta', 'Blouse, Outer, Casual Wear', 4.9, 284, '9 tahun', '< 15 menit', true, 'https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'),
  (2, 'Kartika Studio', 'Bandung', 'Dress, Kebaya Modern', 4.8, 196, '7 tahun', '< 20 menit', true, 'https://images.unsplash.com/photo-1457972657980-4c9fddebec8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'),
  (3, 'Sari Tailor', 'Solo', 'Batik Modern, Casual', 4.7, 312, '11 tahun', '< 10 menit', true, 'https://images.unsplash.com/photo-1578353022142-09264fd64295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'),
  (4, 'Jogja Atelier', 'Yogyakarta', 'Outer, Tenun, Layering', 4.8, 228, '8 tahun', '< 20 menit', true, 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500')
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  specialty = excluded.specialty,
  rating = excluded.rating,
  sold = excluded.sold,
  experience = excluded.experience,
  response_time = excluded.response_time,
  verified = excluded.verified,
  image = excluded.image;

insert into public.products (
  id, name, tailor_name, tailor_city, price, badges, category, eta, rating, saved_fabric,
  material, color, image, description, measurements, recommendations, sort_order
)
values
  ('1', 'Luna Wrap Top', 'Rahayu Tailor', 'Sleman, Yogyakarta', 189000, array['Made-to-Order','Kain Sisa'], 'Outer', '5-7 hari', 4.9, '0.8m', 'Rayon lokal sisa produksi', '#D7B39A', 'https://images.unsplash.com/photo-1596636222220-dfb7071e3676?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', 'Wrap top serbaguna dengan tali pinggang yang membentuk siluet tanpa terasa ketat.', array['Lingkar dada','Panjang top','Lingkar lengan'], array['Office-to-dinner','Rectangle body','Warm earth palette'], 1),
  ('2', 'Olive Linen Dress', 'Kartika Studio', 'Bandung', 245000, array['Made-to-Order'], 'Dress', '7-10 hari', 4.8, '1.0m', 'Linen blend deadstock', '#7D8C55', 'https://images.unsplash.com/photo-1637248360598-6bc357ae6958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', 'Dress olive dengan potongan loose, cocok untuk daily wear dan acara semi formal.', array['Lingkar dada','Lingkar pinggang','Panjang dress'], array['Minimalist','Medium olive skin','Daily wear'], 2),
  ('3', 'Earth Tone Blouse', 'Sari Tailor', 'Solo', 165000, array['Kain Sisa','Local Tailor'], 'Kemeja', '4-6 hari', 4.7, '0.5m', 'Katun poplin sisa atelier', '#C97B63', 'https://images.unsplash.com/photo-1640257846267-9db046ffe896?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', 'Blouse earthy yang ringan dengan detail clean untuk dipadukan dengan celana high waist.', array['Lingkar dada','Lebar bahu','Panjang lengan'], array['Clean casual','Smart casual','Office'], 3),
  ('4', 'Casual Outer Wrap', 'Jogja Atelier', 'Yogyakarta', 320000, array['Low Waste'], 'Outer', '6-9 hari', 4.8, '1.2m', 'Tenun rayon mixed scraps', '#8E6F5A', 'https://images.unsplash.com/photo-1647714028322-4bde00824b65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', 'Outer wrap dengan garis panjang untuk layering yang nyaman dan memanjangkan siluet.', array['Panjang outer','Lebar bahu','Lingkar lengan'], array['Traveling','Layering','Apple body'], 4),
  ('5', 'Terracotta Midi Dress', 'Kartika Studio', 'Bandung', 278000, array['Made-to-Order','Kain Sisa'], 'Dress', '7-10 hari', 4.9, '1.1m', 'Rayon flowy', '#B96E5B', 'https://images.unsplash.com/photo-1682615826492-78dee8c1afed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', 'Midi dress terracotta dengan potongan flowy untuk special event yang tetap mindful.', array['Lingkar dada','Lingkar pinggang','Panjang midi'], array['Special event','Feminine soft','Medium warm skin'], 5),
  ('6', 'Natural Linen Shirt', 'Rahayu Tailor', 'Sleman, Yogyakarta', 198000, array['Local Tailor'], 'Kemeja', '5-7 hari', 4.7, '0.6m', 'Linen natural lokal', '#E8DCC8', 'https://images.unsplash.com/photo-1752770260282-6abbc0443762?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900', 'Kemeja linen natural dengan detail minimal untuk capsule wardrobe.', array['Lingkar dada','Panjang kemeja','Lebar bahu'], array['Minimalist','Smart casual','Formal'], 6)
on conflict (id) do update set
  name = excluded.name,
  tailor_name = excluded.tailor_name,
  tailor_city = excluded.tailor_city,
  price = excluded.price,
  badges = excluded.badges,
  category = excluded.category,
  eta = excluded.eta,
  rating = excluded.rating,
  saved_fabric = excluded.saved_fabric,
  material = excluded.material,
  color = excluded.color,
  image = excluded.image,
  description = excluded.description,
  measurements = excluded.measurements,
  recommendations = excluded.recommendations,
  sort_order = excluded.sort_order;
