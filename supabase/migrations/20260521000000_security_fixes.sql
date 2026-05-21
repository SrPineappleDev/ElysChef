-- ================================================================
-- Security fixes 2026-05-21
-- Fix #1: Trigger always assigns 'free' plan regardless of metadata
-- Fix #2: INSERT policy on profiles must include WITH CHECK (role = 'user')
-- ================================================================


-- Fix #1: Ignore plan/credits from raw_user_meta_data
-- El upgrade a VIP solo puede hacerse desde un webhook de pago con service role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, apellidos, email, plan, credits, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', ''),
    COALESCE(new.raw_user_meta_data->>'apellidos', ''),
    new.email,
    'free',
    200,
    'user'
  );
  RETURN new;
END;
$$;


-- Fix #2: La política de INSERT debe impedir que el cliente asigne role = 'admin'
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'user');
