
-- Drop unused tables (no foreign key dependencies to worry about)
-- 1. cart_items depends on carts and products, drop first
DROP TABLE IF EXISTS public.cart_items CASCADE;

-- 2. product_images depends on products
DROP TABLE IF EXISTS public.product_images CASCADE;

-- 3. Now drop parent tables
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- 4. admin_logs (replaced by audit_logs)
DROP TABLE IF EXISTS public.admin_logs CASCADE;
