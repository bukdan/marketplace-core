
-- =============================================
-- PHASE 1: REGION TABLES
-- =============================================

-- Provinces
CREATE TABLE IF NOT EXISTS public.provinces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_alt text,
  latitude double precision,
  longitude double precision,
  regency_count integer NOT NULL DEFAULT 0,
  district_count integer NOT NULL DEFAULT 0,
  village_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view provinces" ON public.provinces FOR SELECT USING (true);
CREATE POLICY "Admins can manage provinces" ON public.provinces FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Regencies (Kabupaten/Kota)
CREATE TABLE IF NOT EXISTS public.regencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province_id uuid NOT NULL REFERENCES public.provinces(id),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'kabupaten',
  latitude double precision,
  longitude double precision,
  district_count integer NOT NULL DEFAULT 0,
  village_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.regencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view regencies" ON public.regencies FOR SELECT USING (true);
CREATE POLICY "Admins can manage regencies" ON public.regencies FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Districts (Kecamatan)
CREATE TABLE IF NOT EXISTS public.districts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  regency_id uuid NOT NULL REFERENCES public.regencies(id),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  latitude double precision,
  longitude double precision,
  village_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Admins can manage districts" ON public.districts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Villages (Desa/Kelurahan)
CREATE TABLE IF NOT EXISTS public.villages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id uuid NOT NULL REFERENCES public.districts(id),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  type text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view villages" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Admins can manage villages" ON public.villages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for region tables
CREATE INDEX IF NOT EXISTS idx_regencies_province_id ON public.regencies(province_id);
CREATE INDEX IF NOT EXISTS idx_districts_regency_id ON public.districts(regency_id);
CREATE INDEX IF NOT EXISTS idx_villages_district_id ON public.villages(district_id);

-- =============================================
-- PHASE 2: ENHANCE EXISTING TABLES
-- =============================================

-- Enhance categories
ALTER TABLE public.categories 
  ADD COLUMN IF NOT EXISTS image_banner_url text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS listing_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS umkm_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS keywords text,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

-- Enhance listings
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS umkm_id uuid REFERENCES public.umkm_profiles(id),
  ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS gallery jsonb,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS specifications jsonb,
  ADD COLUMN IF NOT EXISTS promo_type text NOT NULL DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS promo_details jsonb,
  ADD COLUMN IF NOT EXISTS contact_preference text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_whatsapp text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS province_id uuid REFERENCES public.provinces(id),
  ADD COLUMN IF NOT EXISTS regency_id uuid REFERENCES public.regencies(id),
  ADD COLUMN IF NOT EXISTS district_id uuid REFERENCES public.districts(id),
  ADD COLUMN IF NOT EXISTS village_id uuid REFERENCES public.villages(id),
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS is_sold boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_rented boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sold_at timestamptz,
  ADD COLUMN IF NOT EXISTS rented_at timestamptz,
  ADD COLUMN IF NOT EXISTS sold_to uuid,
  ADD COLUMN IF NOT EXISTS rented_to uuid,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS share_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS favorite_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inquiry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS keywords text,
  ADD COLUMN IF NOT EXISTS price_negotiable boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS rental_period text,
  ADD COLUMN IF NOT EXISTS rental_price double precision,
  ADD COLUMN IF NOT EXISTS price_formatted text;

-- Enhance profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS primary_role text NOT NULL DEFAULT 'user';

-- Enhance banners
ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Enhance listing_reports
ALTER TABLE public.listing_reports
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- Enhance support_tickets
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by uuid;

-- Enhance user_roles
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS assigned_by uuid,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Enhance kyc_verifications
ALTER TABLE public.kyc_verifications
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- =============================================
-- PHASE 3: NEW FEATURE TABLES
-- =============================================

-- KYC Documents
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kyc_verification_id uuid NOT NULL REFERENCES public.kyc_verifications(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_name text NOT NULL,
  document_number text,
  image_url text NOT NULL,
  file_name text,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  full_name text,
  birth_place text,
  birth_date timestamptz,
  gender text,
  blood_type text,
  religion text,
  marital_status text,
  occupation text,
  nationality text DEFAULT 'WNI',
  province_id uuid REFERENCES public.provinces(id),
  regency_id uuid REFERENCES public.regencies(id),
  district_id uuid REFERENCES public.districts(id),
  village_id uuid REFERENCES public.villages(id),
  rt text,
  rw text,
  address text,
  postal_code text,
  npwp_number text,
  npwp_name text,
  npwp_address text,
  business_name text,
  business_type text,
  business_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kyc documents" ON public.kyc_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.kyc_verifications kv WHERE kv.id = kyc_documents.kyc_verification_id AND kv.user_id = auth.uid()));
CREATE POLICY "Users can insert own kyc documents" ON public.kyc_documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.kyc_verifications kv WHERE kv.id = kyc_documents.kyc_verification_id AND kv.user_id = auth.uid()));
CREATE POLICY "Users can update own kyc documents" ON public.kyc_documents FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.kyc_verifications kv WHERE kv.id = kyc_documents.kyc_verification_id AND kv.user_id = auth.uid() AND kv.status IN ('not_submitted', 'rejected')));
CREATE POLICY "Admins can manage kyc documents" ON public.kyc_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin Logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view admin logs" ON public.admin_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert admin logs" ON public.admin_logs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  module text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated can view permissions" ON public.permissions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Role Permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  can_access boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated can view role permissions" ON public.role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Ticket Replies
CREATE TABLE IF NOT EXISTS public.ticket_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view ticket replies" ON public.ticket_replies FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_replies.ticket_id AND (st.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))) AND (is_internal = false OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Users can insert ticket replies" ON public.ticket_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_replies.ticket_id AND (st.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))));
CREATE POLICY "Admins can manage ticket replies" ON public.ticket_replies FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- PHASE 4: ENHANCE UMKM TABLES
-- =============================================

-- Enhance umkm_profiles
ALTER TABLE public.umkm_profiles
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS business_scale text NOT NULL DEFAULT 'micro',
  ADD COLUMN IF NOT EXISTS year_established integer,
  ADD COLUMN IF NOT EXISTS province_id uuid REFERENCES public.provinces(id),
  ADD COLUMN IF NOT EXISTS regency_id uuid REFERENCES public.regencies(id),
  ADD COLUMN IF NOT EXISTS district_id uuid REFERENCES public.districts(id),
  ADD COLUMN IF NOT EXISTS village_id uuid REFERENCES public.villages(id),
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS gallery jsonb,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS tiktok text,
  ADD COLUMN IF NOT EXISTS twitter text,
  ADD COLUMN IF NOT EXISTS youtube text,
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS operational_hours jsonb,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS plan_ends_at timestamptz;

-- Rename umkm_name to business_name if needed (keep both for compatibility)
-- We'll keep umkm_name as is and add business_name alias logic in code

-- UMKM Portfolios
CREATE TABLE IF NOT EXISTS public.umkm_portfolios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  umkm_id uuid NOT NULL REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.umkm_portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active portfolios" ON public.umkm_portfolios FOR SELECT USING (is_active = true);
CREATE POLICY "UMKM owners can manage portfolios" ON public.umkm_portfolios FOR ALL
  USING (EXISTS (SELECT 1 FROM public.umkm_profiles u WHERE u.id = umkm_portfolios.umkm_id AND u.owner_id = auth.uid()));
CREATE POLICY "Admins can manage portfolios" ON public.umkm_portfolios FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- UMKM Reviews
CREATE TABLE IF NOT EXISTS public.umkm_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  umkm_id uuid NOT NULL REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  rating integer NOT NULL,
  title text,
  content text,
  is_anonymous boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.umkm_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view umkm reviews" ON public.umkm_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create umkm reviews" ON public.umkm_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own umkm reviews" ON public.umkm_reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete own umkm reviews" ON public.umkm_reviews FOR DELETE USING (auth.uid() = reviewer_id);
CREATE POLICY "Admins can manage umkm reviews" ON public.umkm_reviews FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_listings_province_id ON public.listings(province_id);
CREATE INDEX IF NOT EXISTS idx_listings_regency_id ON public.listings(regency_id);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_umkm_id ON public.listings(umkm_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_kyc_id ON public.kyc_documents(kyc_verification_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON public.ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_umkm_profiles_province_id ON public.umkm_profiles(province_id);
CREATE INDEX IF NOT EXISTS idx_umkm_profiles_slug ON public.umkm_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_umkm_portfolios_umkm_id ON public.umkm_portfolios(umkm_id);
CREATE INDEX IF NOT EXISTS idx_umkm_reviews_umkm_id ON public.umkm_reviews(umkm_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
