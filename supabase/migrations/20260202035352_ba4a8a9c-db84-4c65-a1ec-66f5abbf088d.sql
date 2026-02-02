
-- ===========================================
-- LISTING SERVICE - CREDIT-BASED SAAS MODEL
-- ===========================================

-- 1. PLATFORM SETTINGS (Super Admin configurable)
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('listing_credits', '{"post_listing": 1, "extra_image": 1, "auction_listing": 2}', 'Credit costs for listing actions'),
  ('boost_credits', '{"highlight": 5, "top_search": 10, "premium": 20}', 'Credit costs per boost type per day'),
  ('auction_settings', '{"min_duration_days": 1, "max_duration_days": 7, "platform_fee_percent": 5}', 'Auction configuration'),
  ('listing_limits', '{"max_free_images": 5, "max_total_images": 10, "max_active_listings": 50}', 'Listing limits'),
  ('moderation_settings', '{"auto_approve_kyc": true, "review_new_users": true, "new_user_threshold": 3}', 'Moderation rules');

-- 2. CREDIT PACKAGES (for purchase)
CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default credit packages
INSERT INTO public.credit_packages (name, credits, price, bonus_credits, is_featured, sort_order) VALUES
  ('Starter', 10, 15000, 0, false, 1),
  ('Basic', 50, 65000, 5, false, 2),
  ('Popular', 100, 120000, 15, true, 3),
  ('Pro', 250, 275000, 50, false, 4),
  ('Enterprise', 500, 500000, 150, false, 5);

-- 3. USER CREDITS (balance)
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_purchased INTEGER DEFAULT 0,
  lifetime_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CREDIT TRANSACTIONS (history)
CREATE TYPE public.credit_transaction_type AS ENUM ('purchase', 'usage', 'refund', 'bonus', 'expired');

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type credit_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  payment_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id),
  icon_url TEXT,
  attributes_schema JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Elektronik', 'elektronik', 1),
  ('Kendaraan', 'kendaraan', 2),
  ('Properti', 'properti', 3),
  ('Fashion', 'fashion', 4),
  ('Hobi & Koleksi', 'hobi-koleksi', 5),
  ('Rumah Tangga', 'rumah-tangga', 6),
  ('Jasa', 'jasa', 7),
  ('Lainnya', 'lainnya', 99);

-- 6. LISTINGS
CREATE TYPE public.listing_price_type AS ENUM ('fixed', 'negotiable', 'auction');
CREATE TYPE public.listing_type AS ENUM ('sale', 'rent', 'service', 'wanted');
CREATE TYPE public.listing_condition AS ENUM ('new', 'like_new', 'good', 'fair');
CREATE TYPE public.listing_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'expired', 'rejected', 'deleted');

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  group_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  price_type listing_price_type NOT NULL DEFAULT 'fixed',
  listing_type listing_type NOT NULL DEFAULT 'sale',
  condition listing_condition DEFAULT 'good',
  status listing_status NOT NULL DEFAULT 'draft',
  attributes JSONB DEFAULT '{}',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  city TEXT,
  province TEXT,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  credits_used INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 7. LISTING IMAGES
CREATE TABLE public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. BOOST TYPES
CREATE TYPE public.boost_type AS ENUM ('highlight', 'top_search', 'premium');

CREATE TABLE public.boost_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type boost_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  credits_per_day INTEGER NOT NULL,
  multiplier NUMERIC DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default boost types
INSERT INTO public.boost_types (type, name, description, credits_per_day, multiplier) VALUES
  ('highlight', 'Highlight', 'Listing ditandai dengan warna berbeda', 5, 1.5),
  ('top_search', 'Top Search', 'Muncul di atas hasil pencarian', 10, 2),
  ('premium', 'Premium', 'Highlight + Top Search + Badge Premium', 20, 3);

-- 9. LISTING BOOSTS
CREATE TYPE public.boost_status AS ENUM ('active', 'expired', 'cancelled');

CREATE TABLE public.listing_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  boost_type boost_type NOT NULL,
  credits_used INTEGER NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  status boost_status NOT NULL DEFAULT 'active',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. LISTING AUCTIONS
CREATE TYPE public.auction_status AS ENUM ('active', 'ended', 'sold', 'cancelled', 'no_winner');

CREATE TABLE public.listing_auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE UNIQUE,
  starting_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  min_increment NUMERIC NOT NULL DEFAULT 10000,
  buy_now_price NUMERIC,
  ends_at TIMESTAMPTZ NOT NULL,
  winner_id UUID REFERENCES auth.users(id),
  total_bids INTEGER DEFAULT 0,
  platform_fee_percent NUMERIC DEFAULT 5,
  platform_fee_amount NUMERIC DEFAULT 0,
  status auction_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. AUCTION BIDS
CREATE TABLE public.auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.listing_auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  is_auto_bid BOOLEAN DEFAULT false,
  max_auto_amount NUMERIC,
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. SAVED LISTINGS (Wishlist)
CREATE TABLE public.saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- 13. LISTING REPORTS
CREATE TYPE public.report_reason AS ENUM ('spam', 'fraud', 'inappropriate', 'wrong_category', 'duplicate', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'action_taken', 'dismissed');

CREATE TABLE public.listing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reason report_reason NOT NULL,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Auto-create user_credits on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_credits
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_credits();

-- Update timestamps
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listing_auctions_updated_at
  BEFORE UPDATE ON public.listing_auctions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- RLS POLICIES
-- ===========================================

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boost_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

-- Platform Settings: Admin only
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
  FOR SELECT USING (true);

-- Credit Packages: Public read, admin manage
CREATE POLICY "Anyone can view active credit packages" ON public.credit_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage credit packages" ON public.credit_packages
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- User Credits: Own only
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credits" ON public.user_credits
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Credit Transactions: Own only
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.credit_transactions
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Categories: Public read
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Listings: Complex policies
CREATE POLICY "Anyone can view active listings" ON public.listings
  FOR SELECT USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Users can view own listings" ON public.listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create listings" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON public.listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all listings" ON public.listings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Listing Images
CREATE POLICY "Anyone can view listing images" ON public.listing_images
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own listing images" ON public.listing_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid())
  );

-- Boost Types: Public read
CREATE POLICY "Anyone can view active boost types" ON public.boost_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage boost types" ON public.boost_types
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Listing Boosts
CREATE POLICY "Users can view own boosts" ON public.listing_boosts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create boosts" ON public.listing_boosts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all boosts" ON public.listing_boosts
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Listing Auctions
CREATE POLICY "Anyone can view active auctions" ON public.listing_auctions
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage own auctions" ON public.listing_auctions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all auctions" ON public.listing_auctions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Auction Bids
CREATE POLICY "Anyone can view bids on active auctions" ON public.auction_bids
  FOR SELECT USING (true);

CREATE POLICY "Users can place bids" ON public.auction_bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Admins can manage bids" ON public.auction_bids
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Saved Listings
CREATE POLICY "Users can manage own saved listings" ON public.saved_listings
  FOR ALL USING (auth.uid() = user_id);

-- Listing Reports
CREATE POLICY "Users can create reports" ON public.listing_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.listing_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports" ON public.listing_reports
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_price_type ON public.listings(price_type);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listing_images_listing_id ON public.listing_images(listing_id);
CREATE INDEX idx_listing_boosts_listing_id ON public.listing_boosts(listing_id);
CREATE INDEX idx_listing_boosts_status ON public.listing_boosts(status);
CREATE INDEX idx_auction_bids_auction_id ON public.auction_bids(auction_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_saved_listings_user_id ON public.saved_listings(user_id);
