-- Fix: Replace SECURITY DEFINER view with a function
-- Drop the view first
DROP VIEW IF EXISTS public.platform_stats;

-- Create a security definer function instead (safer approach)
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  total_listings BIGINT,
  total_sellers BIGINT,
  total_categories BIGINT,
  active_auctions BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.listings WHERE status = 'active' AND deleted_at IS NULL),
    (SELECT COUNT(DISTINCT user_id) FROM public.listings),
    (SELECT COUNT(*) FROM public.categories WHERE is_active = true),
    (SELECT COUNT(*) FROM public.listing_auctions WHERE status = 'active');
$$;