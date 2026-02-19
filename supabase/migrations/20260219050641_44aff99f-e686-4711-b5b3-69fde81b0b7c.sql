
-- Tabel kupon kredit
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  credits_amount INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabel riwayat penggunaan kupon (mencegah 1 user pakai kupon yg sama 2x)
CREATE TABLE public.coupon_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  credits_given INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

-- RLS coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons (code check)"
  ON public.coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS coupon_uses
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon uses"
  ON public.coupon_uses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupon uses"
  ON public.coupon_uses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage coupon uses"
  ON public.coupon_uses FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger updated_at untuk coupons
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fungsi redeem kupon (atomic: cek + increment + beri kredit)
CREATE OR REPLACE FUNCTION public.redeem_coupon(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Ambil dan lock kupon
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kode kupon tidak valid atau sudah tidak aktif');
  END IF;

  -- Cek sudah expired?
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kode kupon sudah kadaluarsa');
  END IF;

  -- Cek sudah habis?
  IF v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kuota kupon sudah habis');
  END IF;

  -- Cek user sudah pakai?
  IF EXISTS (SELECT 1 FROM public.coupon_uses WHERE coupon_id = v_coupon.id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Anda sudah menggunakan kupon ini sebelumnya');
  END IF;

  -- Ambil saldo kredit user
  SELECT balance INTO v_current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akun kredit tidak ditemukan');
  END IF;

  v_new_balance := v_current_balance + v_coupon.credits_amount;

  -- Update saldo kredit user
  UPDATE public.user_credits
  SET balance = v_new_balance
  WHERE user_id = p_user_id;

  -- Catat penggunaan kupon
  INSERT INTO public.coupon_uses (coupon_id, user_id, credits_given)
  VALUES (v_coupon.id, p_user_id, v_coupon.credits_amount);

  -- Increment used_count kupon
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = v_coupon.id;

  -- Catat ke credit_transactions
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description, reference_type, reference_id)
  VALUES (p_user_id, 'topup', v_coupon.credits_amount, v_new_balance, 'Kupon: ' || v_coupon.code, 'coupon', v_coupon.id);

  RETURN jsonb_build_object(
    'success', true,
    'credits_given', v_coupon.credits_amount,
    'new_balance', v_new_balance,
    'message', 'Kupon berhasil digunakan! ' || v_coupon.credits_amount || ' kredit ditambahkan'
  );
END;
$$;

-- Fungsi admin tambah kredit manual ke user
CREATE OR REPLACE FUNCTION public.admin_add_credits(p_user_id UUID, p_amount INTEGER, p_description TEXT, p_admin_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Cek admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak');
  END IF;

  IF p_amount <= 0 OR p_amount > 100000 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Jumlah kredit tidak valid (1 - 100.000)');
  END IF;

  SELECT balance INTO v_current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'User tidak ditemukan');
  END IF;

  v_new_balance := v_current_balance + p_amount;

  UPDATE public.user_credits
  SET balance = v_new_balance
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description, reference_type)
  VALUES (p_user_id, 'topup', p_amount, v_new_balance, p_description, 'admin_adjustment');

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'message', 'Kredit berhasil ditambahkan'
  );
END;
$$;
