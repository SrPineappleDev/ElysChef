-- ================================================================
-- ElysChef — Esquema completo (idempotente)
-- Añade: profiles.role, countries, categories, diets,
--        recipes FK columns, allergies, user_allergies
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- 1. Función auxiliar is_admin()
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ────────────────────────────────────────────────────────────────
-- 2. profiles.role
-- ────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ────────────────────────────────────────────────────────────────
-- 3. countries
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.countries (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text    NOT NULL UNIQUE,
  archived   boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read countries" ON public.countries;
CREATE POLICY "Authenticated users can read countries" ON public.countries
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can write countries" ON public.countries;
CREATE POLICY "Admins can write countries" ON public.countries
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ────────────────────────────────────────────────────────────────
-- 4. categories
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  value      text    NOT NULL UNIQUE,
  label      text    NOT NULL,
  archived   boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read categories" ON public.categories;
CREATE POLICY "Authenticated users can read categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can write categories" ON public.categories;
CREATE POLICY "Admins can write categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ────────────────────────────────────────────────────────────────
-- 5. diets
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.diets (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  value      text    NOT NULL UNIQUE,
  label      text    NOT NULL,
  archived   boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.diets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read diets" ON public.diets;
CREATE POLICY "Authenticated users can read diets" ON public.diets
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can write diets" ON public.diets;
CREATE POLICY "Admins can write diets" ON public.diets
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ────────────────────────────────────────────────────────────────
-- 6. recipes — columnas FK al catálogo
-- ────────────────────────────────────────────────────────────────
ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS diet        text,
  ADD COLUMN IF NOT EXISTS country_id  uuid REFERENCES public.countries(id)  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS diet_id     uuid REFERENCES public.diets(id)      ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recipes_country_id  ON public.recipes(country_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON public.recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_recipes_diet_id     ON public.recipes(diet_id);


-- ────────────────────────────────────────────────────────────────
-- 7. allergies
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.allergies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read allergies" ON public.allergies;
CREATE POLICY "Authenticated users can read allergies" ON public.allergies
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can write allergies" ON public.allergies;
CREATE POLICY "Admins can write allergies" ON public.allergies
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ────────────────────────────────────────────────────────────────
-- 8. user_allergies
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_allergies (
  user_id    uuid NOT NULL REFERENCES auth.users(id)       ON DELETE CASCADE,
  allergy_id uuid NOT NULL REFERENCES public.allergies(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, allergy_id)
);
ALTER TABLE public.user_allergies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own allergies" ON public.user_allergies;
CREATE POLICY "Users can manage own allergies" ON public.user_allergies
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────────
-- 9. Actualizar trigger handle_new_user
-- ────────────────────────────────────────────────────────────────
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
    COALESCE((new.raw_user_meta_data->>'plan')::user_plan, 'free'),
    CASE WHEN COALESCE(new.raw_user_meta_data->>'plan', 'free') = 'vip'
         THEN 500 ELSE 200 END,
    'user'
  );
  RETURN new;
END;
$$;
