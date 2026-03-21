-- Trigger para reforzar el límite de favoritos del plan gratuito a nivel de base de datos.
-- Los usuarios con plan 'free' no pueden tener más de 10 recetas favoritas.
-- Esto complementa la validación del frontend y garantiza el límite incluso
-- si se llama directamente a la API de Supabase.

create or replace function public.check_favorites_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_plan_val public.user_plan;
  favorites_count integer;
begin
  -- Obtiene el plan del usuario que intenta añadir el favorito
  select plan into user_plan_val
  from public.profiles
  where id = new.user_id;

  -- Solo aplica restricción al plan gratuito
  if user_plan_val = 'free' then
    select count(*) into favorites_count
    from public.favorites
    where user_id = new.user_id;

    if favorites_count >= 10 then
      raise exception 'Plan gratuito: máximo 10 favoritos alcanzado. Cambia a VIP para ilimitados.';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_favorites_limit
  before insert on public.favorites
  for each row execute function public.check_favorites_limit();
