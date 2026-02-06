-- =========================================
-- UMKM PROFILES
-- =========================================
create table public.umkm_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  umkm_name text not null,
  brand_name text,
  description text,
  category_id uuid references public.categories(id),
  phone text,
  whatsapp text,
  email text,
  website text,
  logo_url text,
  banner_url text,
  address text,
  city text,
  province text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- PRODUCTS (for UMKM)
-- =========================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  umkm_id uuid references public.umkm_profiles(id) on delete cascade,
  category_id uuid references public.categories(id),
  name text not null,
  slug text,
  description text,
  price numeric(12,2),
  stock int default 0,
  sku text,
  is_service boolean default false,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- PRODUCT IMAGES
-- =========================================
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- =========================================
-- CARTS
-- =========================================
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  quantity int not null default 1,
  price numeric(12,2) not null,
  created_at timestamptz default now()
);

-- =========================================
-- UMKM ORDERS (separate from existing orders)
-- =========================================
create table public.umkm_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  umkm_id uuid references public.umkm_profiles(id),
  order_number text unique,
  status text default 'pending',
  subtotal numeric(12,2),
  shipping_fee numeric(12,2) default 0,
  total_amount numeric(12,2),
  payment_status text default 'unpaid',
  shipping_address text,
  shipping_method text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- UMKM ORDER ITEMS
-- =========================================
create table public.umkm_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.umkm_orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text,
  price numeric(12,2),
  quantity int,
  total numeric(12,2),
  created_at timestamptz default now()
);

-- =========================================
-- PAYMENTS (for UMKM orders)
-- =========================================
create table public.umkm_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.umkm_orders(id) on delete cascade,
  provider text,
  method text,
  transaction_id text,
  amount numeric(12,2),
  status text default 'pending',
  paid_at timestamptz,
  raw_response jsonb,
  created_at timestamptz default now()
);

-- =========================================
-- PRODUCT REVIEWS
-- =========================================
create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid references public.products(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- NOTIFICATIONS
-- =========================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text,
  type text default 'info',
  channel text default 'in_app',
  is_read boolean default false,
  data jsonb,
  created_at timestamptz default now()
);

-- =========================================
-- SUBSCRIPTIONS (UMKM Plans)
-- =========================================
create table public.umkm_subscriptions (
  id uuid primary key default gen_random_uuid(),
  umkm_id uuid references public.umkm_profiles(id) on delete cascade,
  plan text not null,
  status text default 'active',
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- SUPPORT TICKETS
-- =========================================
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject text not null,
  message text,
  status text default 'open',
  priority text default 'normal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- OTP CODES
-- =========================================
create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  channel text not null,
  code text not null,
  expires_at timestamptz not null,
  is_used boolean default false,
  created_at timestamptz default now()
);

-- =========================================
-- ENABLE RLS
-- =========================================
alter table public.umkm_profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.umkm_orders enable row level security;
alter table public.umkm_order_items enable row level security;
alter table public.umkm_payments enable row level security;
alter table public.product_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.umkm_subscriptions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.otp_codes enable row level security;

-- =========================================
-- RLS POLICIES - UMKM PROFILES
-- =========================================
create policy "umkm_public_read" on public.umkm_profiles
  for select using (true);

create policy "umkm_owner_insert" on public.umkm_profiles
  for insert with check (owner_id = auth.uid());

create policy "umkm_owner_update" on public.umkm_profiles
  for update using (owner_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "umkm_owner_delete" on public.umkm_profiles
  for delete using (owner_id = auth.uid() or has_role(auth.uid(), 'admin'));

-- =========================================
-- RLS POLICIES - PRODUCTS
-- =========================================
create policy "products_public_read" on public.products
  for select using (status = 'active');

create policy "products_owner_read_all" on public.products
  for select using (
    exists (
      select 1 from public.umkm_profiles u
      where u.id = umkm_id and u.owner_id = auth.uid()
    )
  );

create policy "products_owner_insert" on public.products
  for insert with check (
    exists (
      select 1 from public.umkm_profiles u
      where u.id = umkm_id and u.owner_id = auth.uid()
    )
  );

create policy "products_owner_update" on public.products
  for update using (
    exists (
      select 1 from public.umkm_profiles u
      where u.id = umkm_id and u.owner_id = auth.uid()
    ) or has_role(auth.uid(), 'admin')
  );

create policy "products_owner_delete" on public.products
  for delete using (
    exists (
      select 1 from public.umkm_profiles u
      where u.id = umkm_id and u.owner_id = auth.uid()
    ) or has_role(auth.uid(), 'admin')
  );

-- =========================================
-- RLS POLICIES - PRODUCT IMAGES
-- =========================================
create policy "product_images_public_read" on public.product_images
  for select using (true);

create policy "product_images_owner_manage" on public.product_images
  for all using (
    exists (
      select 1 from public.products p
      join public.umkm_profiles u on u.id = p.umkm_id
      where p.id = product_id and u.owner_id = auth.uid()
    )
  );

-- =========================================
-- RLS POLICIES - CARTS
-- =========================================
create policy "carts_own" on public.carts
  for all using (user_id = auth.uid());

create policy "cart_items_own" on public.cart_items
  for all using (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  );

-- =========================================
-- RLS POLICIES - UMKM ORDERS
-- =========================================
create policy "umkm_orders_buyer_read" on public.umkm_orders
  for select using (user_id = auth.uid());

create policy "umkm_orders_seller_read" on public.umkm_orders
  for select using (
    exists (
      select 1 from public.umkm_profiles u
      where u.id = umkm_id and u.owner_id = auth.uid()
    )
  );

create policy "umkm_orders_admin_read" on public.umkm_orders
  for select using (has_role(auth.uid(), 'admin'));

create policy "umkm_orders_buyer_insert" on public.umkm_orders
  for insert with check (user_id = auth.uid());

create policy "umkm_orders_buyer_update" on public.umkm_orders
  for update using (user_id = auth.uid());

create policy "umkm_orders_seller_update" on public.umkm_orders
  for update using (
    exists (
      select 1 from public.umkm_profiles u
      where u.id = umkm_id and u.owner_id = auth.uid()
    )
  );

-- =========================================
-- RLS POLICIES - UMKM ORDER ITEMS
-- =========================================
create policy "umkm_order_items_read" on public.umkm_order_items
  for select using (
    exists (
      select 1 from public.umkm_orders o
      where o.id = order_id and (
        o.user_id = auth.uid() or
        exists (
          select 1 from public.umkm_profiles u
          where u.id = o.umkm_id and u.owner_id = auth.uid()
        )
      )
    ) or has_role(auth.uid(), 'admin')
  );

-- =========================================
-- RLS POLICIES - UMKM PAYMENTS
-- =========================================
create policy "umkm_payments_read" on public.umkm_payments
  for select using (
    exists (
      select 1 from public.umkm_orders o
      where o.id = order_id and (
        o.user_id = auth.uid() or
        exists (
          select 1 from public.umkm_profiles u
          where u.id = o.umkm_id and u.owner_id = auth.uid()
        )
      )
    ) or has_role(auth.uid(), 'admin')
  );

-- =========================================
-- RLS POLICIES - PRODUCT REVIEWS
-- =========================================
create policy "product_reviews_public_read" on public.product_reviews
  for select using (true);

create policy "product_reviews_user_insert" on public.product_reviews
  for insert with check (user_id = auth.uid());

create policy "product_reviews_user_update" on public.product_reviews
  for update using (user_id = auth.uid());

create policy "product_reviews_user_delete" on public.product_reviews
  for delete using (user_id = auth.uid() or has_role(auth.uid(), 'admin'));

-- =========================================
-- RLS POLICIES - NOTIFICATIONS
-- =========================================
create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid() or has_role(auth.uid(), 'admin'));

-- =========================================
-- RLS POLICIES - UMKM SUBSCRIPTIONS
-- =========================================
create policy "umkm_subscriptions_owner_read" on public.umkm_subscriptions
  for select using (
    exists (
      select 1 from public.umkm_profiles u
      where u.id = umkm_id and u.owner_id = auth.uid()
    ) or has_role(auth.uid(), 'admin')
  );

-- =========================================
-- RLS POLICIES - SUPPORT TICKETS
-- =========================================
create policy "support_tickets_own" on public.support_tickets
  for all using (user_id = auth.uid() or has_role(auth.uid(), 'admin'));

-- =========================================
-- RLS POLICIES - OTP CODES
-- =========================================
create policy "otp_codes_own" on public.otp_codes
  for select using (user_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "otp_codes_insert" on public.otp_codes
  for insert with check (user_id = auth.uid());

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================
create index idx_umkm_profiles_owner on public.umkm_profiles(owner_id);
create index idx_umkm_profiles_category on public.umkm_profiles(category_id);
create index idx_products_umkm on public.products(umkm_id);
create index idx_products_category on public.products(category_id);
create index idx_products_status on public.products(status);
create index idx_product_images_product on public.product_images(product_id);
create index idx_carts_user on public.carts(user_id);
create index idx_cart_items_cart on public.cart_items(cart_id);
create index idx_umkm_orders_user on public.umkm_orders(user_id);
create index idx_umkm_orders_umkm on public.umkm_orders(umkm_id);
create index idx_umkm_order_items_order on public.umkm_order_items(order_id);
create index idx_product_reviews_product on public.product_reviews(product_id);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_read on public.notifications(user_id, is_read);
create index idx_support_tickets_user on public.support_tickets(user_id);
create index idx_otp_codes_user on public.otp_codes(user_id);