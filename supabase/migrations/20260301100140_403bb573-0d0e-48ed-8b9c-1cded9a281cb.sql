
-- Table for manual bank transfer topup requests
CREATE TABLE public.credit_topup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid REFERENCES public.credit_packages(id),
  amount numeric NOT NULL,
  credits_amount integer NOT NULL,
  bonus_credits integer NOT NULL DEFAULT 0,
  bank_name text NOT NULL DEFAULT 'BNI',
  account_number text NOT NULL DEFAULT '1186096134',
  account_holder text NOT NULL DEFAULT 'PT. Ihsan Media Kreatif',
  proof_image_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_topup_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own requests
CREATE POLICY "Users can create topup requests"
  ON public.credit_topup_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "Users can view own topup requests"
  ON public.credit_topup_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update own pending requests (upload proof)
CREATE POLICY "Users can update own pending requests"
  ON public.credit_topup_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all
CREATE POLICY "Admins can view all topup requests"
  ON public.credit_topup_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all
CREATE POLICY "Admins can update topup requests"
  ON public.credit_topup_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for transfer proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('topup-proofs', 'topup-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for topup proofs
CREATE POLICY "Users can upload topup proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'topup-proofs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view topup proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'topup-proofs');
