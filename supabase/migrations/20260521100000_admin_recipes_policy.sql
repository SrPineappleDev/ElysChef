-- Permite al admin leer todas las recetas para generar informes
CREATE POLICY "Admins can read all recipes" ON public.recipes
  FOR SELECT TO authenticated
  USING (public.is_admin());
