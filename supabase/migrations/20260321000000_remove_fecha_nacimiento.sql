-- Remove fecha_nacimiento column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS fecha_nacimiento;

-- Update trigger to no longer insert fecha_nacimiento
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, apellidos, email, plan)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', ''),
    COALESCE(new.raw_user_meta_data->>'apellidos', ''),
    new.email,
    COALESCE((new.raw_user_meta_data->>'plan')::user_plan, 'free')
  );
  RETURN new;
END;
$$;
