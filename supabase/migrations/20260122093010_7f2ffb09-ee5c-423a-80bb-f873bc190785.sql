-- Tighten profiles updates and enforce free-tier usage limit server-side

-- 1) Remove user self-update policy (prevents users from resetting analyses_used)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2) Allow admins to manage profiles (for support + premium upgrades if needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles'
      AND policyname = 'Admins can manage all profiles'
  ) THEN
    CREATE POLICY "Admins can manage all profiles"
    ON public.profiles
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- 3) Secure server-side increment with hard limit for free users
CREATE OR REPLACE FUNCTION public.increment_analyses_used()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_premium boolean;
  v_used int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
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
$$;

-- Ensure authenticated users can execute the function
REVOKE ALL ON FUNCTION public.increment_analyses_used() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_analyses_used() TO authenticated;
