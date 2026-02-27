-- Fix RBAC policy predicates and admin role assignment trigger behavior.

-- 1) Repair admin policies to check auth.uid() against profiles.user_id.
DROP POLICY IF EXISTS "Admins full access to profiles" ON public.profiles;
CREATE POLICY "Admins full access to profiles"
ON public.profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins full access payments" ON public.payment_requests;
CREATE POLICY "Admins full access payments"
ON public.payment_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins insert log" ON public.admin_access_log;
CREATE POLICY "Admins insert log"
ON public.admin_access_log
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins view log" ON public.admin_access_log;
CREATE POLICY "Admins view log"
ON public.admin_access_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- 2) Ensure auto-admin assignment runs in BEFORE trigger context.
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'admin@structura.test' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_admin_on_profile_create ON public.profiles;
CREATE TRIGGER auto_admin_on_profile_create
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_admin_role();
