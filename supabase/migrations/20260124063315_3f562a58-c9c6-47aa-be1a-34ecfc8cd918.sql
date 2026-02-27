-- Create trigger to auto-assign admin role to specific test email
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign admin role to the master test admin email
  IF NEW.email = 'admin@structura.test' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (via profiles since we can't directly trigger on auth.users)
DROP TRIGGER IF EXISTS auto_admin_on_profile_create ON public.profiles;
CREATE TRIGGER auto_admin_on_profile_create
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_admin_role();