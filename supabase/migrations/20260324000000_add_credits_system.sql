-- Añade columna de créditos a la tabla profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 0;

-- Backfill: asigna créditos según el plan actual de cada usuario
UPDATE public.profiles
  SET credits = CASE WHEN plan = 'vip' THEN 500 ELSE 200 END;

-- Restricción: los créditos nunca pueden ser negativos
ALTER TABLE public.profiles
  ADD CONSTRAINT credits_non_negative CHECK (credits >= 0);

-- Actualiza el trigger para que los nuevos usuarios reciban los créditos correctos al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, apellidos, email, plan, credits)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', ''),
    COALESCE(new.raw_user_meta_data->>'apellidos', ''),
    new.email,
    COALESCE((new.raw_user_meta_data->>'plan')::user_plan, 'free'),
    CASE WHEN COALESCE(new.raw_user_meta_data->>'plan', 'free') = 'vip' THEN 500 ELSE 200 END
  );
  RETURN new;
END;
$$;
