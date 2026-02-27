CREATE OR REPLACE FUNCTION public.increment_analyses_used()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_is_premium boolean;
  v_used int;
  v_is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Admins are exempt from trial limits
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
    INTO v_is_admin;

  IF COALESCE(v_is_admin, false) THEN
    RETURN;
  END IF;

  SELECT is_premium, analyses_used
    INTO v_is_premium, v_used
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_is_premium THEN
    -- Premium: no limit
    RETURN;
  END IF;

  IF v_used >= 5 THEN
    RAISE EXCEPTION 'Analysis limit reached. Please upgrade to premium.';
  END IF;

  UPDATE public.profiles
  SET analyses_used = analyses_used + 1,
      updated_at = now()
  WHERE user_id = auth.uid();
END;
$function$;