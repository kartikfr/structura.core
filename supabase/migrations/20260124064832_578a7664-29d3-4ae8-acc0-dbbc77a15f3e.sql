-- Lock down the admin auto-assign to prevent exploitation
-- Only assign admin role if NO admin with this email already exists
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_exists boolean;
BEGIN
  -- Only process the master test admin email
  IF NEW.email = 'admin@structura.test' THEN
    -- Check if ANY admin role has ever been assigned to this email
    -- This prevents re-registration exploits
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.user_id = ur.user_id
      WHERE p.email = 'admin@structura.test' 
        AND ur.role = 'admin'::app_role
    ) INTO v_admin_exists;
    
    -- Only assign admin if this is the FIRST time (no existing admin with this email)
    IF NOT v_admin_exists THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.user_id, 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;