
-- Update trigger function to read initial credits from platform_settings
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_initial_credits INTEGER;
BEGIN
  -- Read initial credits from platform_settings, default 500
  SELECT COALESCE((value->>'amount')::INTEGER, 500)
  INTO v_initial_credits
  FROM public.platform_settings
  WHERE key = 'initial_user_credits';

  IF v_initial_credits IS NULL THEN
    v_initial_credits := 500;
  END IF;

  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.user_id, v_initial_credits)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Insert default setting if not exists
INSERT INTO public.platform_settings (key, value, description)
VALUES ('initial_user_credits', '{"amount": 500}'::jsonb, 'Jumlah kredit awal untuk user baru')
ON CONFLICT (key) DO NOTHING;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(p_listing_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  UPDATE public.listings
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_listing_id AND deleted_at IS NULL;
$function$;
