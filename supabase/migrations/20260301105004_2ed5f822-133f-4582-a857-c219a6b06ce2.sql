CREATE OR REPLACE FUNCTION public.apply_listing_boost(
  p_listing_id uuid,
  p_boost_type boost_type,
  p_days integer DEFAULT 7
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_boost boost_types%ROWTYPE;
  v_credits user_credits%ROWTYPE;
  v_total_credits integer;
  v_ends_at timestamptz;
  v_listing_owner uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  IF p_days < 1 OR p_days > 30 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Durasi boost harus 1-30 hari');
  END IF;

  SELECT user_id INTO v_listing_owner
  FROM public.listings
  WHERE id = p_listing_id
    AND deleted_at IS NULL
    AND status = 'active';

  IF v_listing_owner IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Iklan tidak ditemukan atau tidak aktif');
  END IF;

  IF v_listing_owner <> v_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Anda tidak punya akses ke iklan ini');
  END IF;

  SELECT * INTO v_boost
  FROM public.boost_types
  WHERE type = p_boost_type
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Tipe boost tidak aktif');
  END IF;

  v_total_credits := v_boost.credits_per_day * p_days;
  v_ends_at := now() + make_interval(days => p_days);

  SELECT * INTO v_credits
  FROM public.user_credits
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akun kredit tidak ditemukan');
  END IF;

  IF COALESCE(v_credits.balance, 0) < v_total_credits THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Kredit tidak cukup',
      'required', v_total_credits,
      'balance', COALESCE(v_credits.balance, 0)
    );
  END IF;

  INSERT INTO public.listing_boosts (
    listing_id,
    user_id,
    boost_type,
    credits_used,
    ends_at,
    status
  ) VALUES (
    p_listing_id,
    v_user_id,
    p_boost_type,
    v_total_credits,
    v_ends_at,
    'active'
  );

  UPDATE public.user_credits
  SET
    balance = COALESCE(balance, 0) - v_total_credits,
    lifetime_used = COALESCE(lifetime_used, 0) + v_total_credits,
    updated_at = now()
  WHERE user_id = v_user_id;

  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    type,
    reference_type,
    reference_id,
    description
  ) VALUES (
    v_user_id,
    -v_total_credits,
    COALESCE(v_credits.balance, 0) - v_total_credits,
    'usage',
    'boost',
    p_listing_id,
    'Boost ' || v_boost.name || ' untuk ' || p_days || ' hari'
  );

  IF p_boost_type = 'premium' THEN
    UPDATE public.listings
    SET
      is_featured = true,
      featured_until = GREATEST(COALESCE(featured_until, now()), v_ends_at),
      updated_at = now()
    WHERE id = p_listing_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Boost berhasil diaktifkan',
    'total_credits', v_total_credits,
    'new_balance', COALESCE(v_credits.balance, 0) - v_total_credits,
    'ends_at', v_ends_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_listing_boost(uuid, boost_type, integer) TO authenticated;