
-- Plan enum
create type public.user_plan as enum ('free', 'vip');

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre varchar(100) not null default '',
  apellidos varchar(150) not null default '',
  fecha_nacimiento date not null default current_date,
  email varchar(150) not null default '',
  plan user_plan not null default 'free',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Recipes table
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(255) not null,
  description text,
  image text,
  calories integer default 0,
  time varchar(50) default '',
  servings integer default 1,
  protein varchar(50) default '',
  carbs varchar(50) default '',
  fat varchar(50) default '',
  ingredients jsonb default '[]'::jsonb,
  steps jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.recipes enable row level security;

create policy "Users can read own recipes" on public.recipes for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own recipes" on public.recipes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete own recipes" on public.recipes for delete to authenticated using (auth.uid() = user_id);

-- Favorites table
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, recipe_id)
);

alter table public.favorites enable row level security;

create policy "Users can read own favorites" on public.favorites for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own favorites" on public.favorites for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on public.favorites for delete to authenticated using (auth.uid() = user_id);

-- Indexes
create index idx_recipes_user_id on public.recipes(user_id);
create index idx_favorites_user_id on public.favorites(user_id);
create index idx_profiles_email on public.profiles(email);

-- Trigger for auto-creating profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, apellidos, fecha_nacimiento, email, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'apellidos', ''),
    coalesce((new.raw_user_meta_data->>'fecha_nacimiento')::date, current_date),
    new.email,
    coalesce((new.raw_user_meta_data->>'plan')::user_plan, 'free')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
