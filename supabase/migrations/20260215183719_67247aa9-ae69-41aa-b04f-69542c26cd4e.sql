
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.user_id, 500)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;
