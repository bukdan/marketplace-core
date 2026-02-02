-- =====================================================
-- TESTIMONIALS TABLE
-- =====================================================
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  role TEXT, -- e.g. "Pemilik UMKM", "Pengusaha Kuliner"
  avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create own testimonials" 
ON public.testimonials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own testimonials" 
ON public.testimonials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all testimonials" 
ON public.testimonials 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- BANNERS TABLE (Sponsor Ads System)
-- =====================================================
CREATE TYPE public.banner_position AS ENUM ('hero', 'sidebar', 'inline', 'footer');
CREATE TYPE public.banner_status AS ENUM ('pending', 'active', 'paused', 'expired', 'rejected');
CREATE TYPE public.banner_pricing_model AS ENUM ('cpc', 'cpm', 'fixed');

CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  position banner_position NOT NULL DEFAULT 'inline',
  status banner_status NOT NULL DEFAULT 'pending',
  pricing_model banner_pricing_model NOT NULL DEFAULT 'cpc',
  
  -- Budget & Pricing
  budget_total NUMERIC NOT NULL DEFAULT 0,
  budget_spent NUMERIC NOT NULL DEFAULT 0,
  cost_per_click NUMERIC DEFAULT 500, -- Rp 500 per click
  cost_per_mille NUMERIC DEFAULT 5000, -- Rp 5000 per 1000 views
  
  -- Stats
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Schedule
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Priority for sorting (higher = more priority)
  priority INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active banners" 
ON public.banners 
FOR SELECT 
USING (status = 'active' AND deleted_at IS NULL AND (ends_at IS NULL OR ends_at > now()));

CREATE POLICY "Users can create banners" 
ON public.banners 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banners" 
ON public.banners 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own banners" 
ON public.banners 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all banners" 
ON public.banners 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- UPDATE banner_events to reference banners table
-- =====================================================
ALTER TABLE public.banner_events
ADD CONSTRAINT banner_events_banner_id_fkey 
FOREIGN KEY (banner_id) REFERENCES public.banners(id) ON DELETE CASCADE;

-- =====================================================
-- SEED DATA: Sample Testimonials
-- =====================================================
INSERT INTO public.testimonials (user_id, name, role, content, rating, is_featured, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'Budi Santoso', 'Pemilik Toko Elektronik', 'Marketplace UMKM ID sangat membantu saya menjangkau pelanggan lebih luas. Omzet naik 40% dalam 3 bulan!', 5, true, null),
('00000000-0000-0000-0000-000000000002', 'Siti Rahayu', 'Pengusaha Kuliner', 'Platform yang sangat mudah digunakan. Fitur lelang sangat membantu untuk produk-produk limited edition saya.', 5, true, null),
('00000000-0000-0000-0000-000000000003', 'Ahmad Wijaya', 'Penjual Fashion', 'Kredit sistem yang fleksibel dan harga terjangkau. Sangat cocok untuk UMKM seperti saya.', 4, true, null);

-- =====================================================
-- PLATFORM STATS VIEW (for landing page)
-- =====================================================
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
  (SELECT COUNT(*) FROM public.listings WHERE status = 'active' AND deleted_at IS NULL) as total_listings,
  (SELECT COUNT(DISTINCT user_id) FROM public.listings) as total_sellers,
  (SELECT COUNT(*) FROM public.categories WHERE is_active = true) as total_categories,
  (SELECT COUNT(*) FROM public.listing_auctions WHERE status = 'active') as active_auctions;