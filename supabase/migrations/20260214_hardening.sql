-- Database Hardening Migration: Zero-Trust RLS & RBAC

-- 1. Add role column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role public.app_role NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- 2. Migrate existing roles from user_roles to profiles & Drop user_roles
DO $$
BEGIN
    -- Update profiles based on user_roles
    UPDATE public.profiles p
    SET role = ur.role
    FROM public.user_roles ur
    WHERE p.user_id = ur.user_id;
    
    -- Drop user_roles table if it exists
    DROP TABLE IF EXISTS public.user_roles;
END $$;

-- 3. Create Update Trigger to prevent Privilege Escalation
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent user from changing their own role
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Only allow if executed by service role (superuser) or a specific admin function
        -- But for strict zero-trust, we block it from standard RLS updates entirely.
        -- Admin updates via service key (dashboard) bypass RLS, so this only blocks RLS users.
        RAISE EXCEPTION 'You cannot change your own role.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_role_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_change();


-- 4. Create Admin Audit Log
CREATE TABLE IF NOT EXISTS public.admin_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_access_log ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies

-- PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can access own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile basic info"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id);
    -- Note: Role change prevented by trigger

CREATE POLICY "Admins full access to profiles"
    ON public.profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- PAYMENT_REQUESTS
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can update all payment requests" ON public.payment_requests;

CREATE POLICY "Users access own payments"
    ON public.payment_requests
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users create own payments"
    ON public.payment_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Only allow update if pending
CREATE POLICY "Users update own pending payments"
    ON public.payment_requests
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins full access payments"
    ON public.payment_requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ADMIN_ACCESS_LOG
CREATE POLICY "Admins insert log"
    ON public.admin_access_log
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins view log"
    ON public.admin_access_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- 6. Updated RPC Functions for Backward Compatibility & Security

-- Update has_role to check profiles table
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update auto_assign_admin_role to use profiles
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'admin@structura.test' THEN
     -- Direct update since we are in a trigger on profiles
     NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$;
