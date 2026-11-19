create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_name text not null check (char_length(customer_name) between 1 and 160),
  email text not null check (char_length(email) between 3 and 320),
  phone text not null check (char_length(phone) between 6 and 32),
  address1 text not null check (char_length(address1) between 1 and 300),
  address2 text,
  city text not null check (char_length(city) between 1 and 120),
  postal_code text not null check (char_length(postal_code) between 1 and 32),
  country text not null check (char_length(country) between 1 and 120),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  item_count integer not null check (item_count > 0),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  savings_cents integer not null default 0 check (savings_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  payment_method text not null check (payment_method in ('card', 'cod')),
  payment_status text not null default 'unpaid' check (payment_status in ('paid', 'unpaid', 'refunded')),
  card_last4 text check (card_last4 is null or card_last4 ~ '^[0-9]{4}$'),
  status text not null default 'new' check (status in ('new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  notes text,
  notified_at timestamptz
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_payment_status_idx on public.orders (payment_status);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can see their own membership" on public.admin_users;

create policy "Admins can see their own membership"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

revoke all on public.admin_users from anon;
grant select on public.admin_users to authenticated;

alter table public.orders enable row level security;

drop policy if exists "Customers can place orders" on public.orders;
drop policy if exists "Admins can read orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;

create policy "Customers can place orders"
  on public.orders
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and item_count > 0
    and total_cents >= 0
    and jsonb_typeof(items) = 'array'
  );

create policy "Admins can read orders"
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where public.admin_users.user_id = auth.uid()
    )
  );

create policy "Admins can update orders"
  on public.orders
  for update
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where public.admin_users.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users
      where public.admin_users.user_id = auth.uid()
    )
  );

create policy "Admins can delete orders"
  on public.orders
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where public.admin_users.user_id = auth.uid()
    )
  );

revoke all on public.orders from anon;
grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
grant usage on schema public to service_role;
grant all on public.orders to service_role;
grant all on public.admin_users to service_role;

create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;

create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_orders_updated_at();

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
