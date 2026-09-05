-- ---------------------------------------------------------------------------
-- Catálogo de Distribuciones M.A.B — esquema base
--
-- Tres tablas: categorías, productos y una fila única de ajustes del sitio.
-- Row Level Security queda activo en las tres. El sitio público lee con la
-- clave anónima; escribir exige una sesión autenticada, y eso lo comprueba
-- Postgres, no la aplicación.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null check (length(btrim(name)) between 2 and 80),
  slug        text        not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text        check (length(description) <= 600),
  image_url   text,
  image_path  text,
  position    integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index categories_position_idx on public.categories (position, name);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

comment on column public.categories.image_path is
  'Ruta dentro del bucket de Storage. Se guarda aparte de image_url para poder borrar el archivo cuando se borra la fila.';

-- ---------------------------------------------------------------------------
-- products
--
-- on delete restrict es deliberado: borrar una categoría con artículos dentro
-- debe fallar de forma visible y explicada, no llevarse el catálogo por delante.
-- ---------------------------------------------------------------------------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid        not null references public.categories (id) on delete restrict,
  name         text        not null check (length(btrim(name)) between 2 and 120),
  slug         text        not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description  text        check (length(description) <= 2000),
  specs        text        check (length(specs) <= 200),
  image_url    text,
  image_path   text,
  is_published boolean     not null default true,
  position     integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index products_category_idx  on public.products (category_id, position, name);
create index products_published_idx on public.products (is_published) where is_published;
create index products_created_idx   on public.products (created_at desc);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- site_settings — fila única
--
-- El check (id = 1) garantiza que no puedan existir dos filas de ajustes, que
-- es el fallo clásico de este patrón: la aplicación lee una y el panel edita
-- la otra.
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id                 integer primary key default 1 check (id = 1),
  whatsapp_primary   text not null,
  whatsapp_secondary text,
  email              text not null,
  address            text not null,
  city               text not null,
  nit                text not null,
  updated_at         timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- El visitante (rol anon) solo lee. El administrador (rol authenticated) es el
-- único que escribe. Los productos sin publicar no salen de la base de datos
-- para un visitante: el filtro está en la política, no en una consulta que
-- alguien pueda olvidar poner.
-- ---------------------------------------------------------------------------
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.site_settings enable row level security;

-- categories
create policy "categorias visibles para todos"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "solo el administrador crea categorias"
  on public.categories for insert
  to authenticated
  with check (true);

create policy "solo el administrador edita categorias"
  on public.categories for update
  to authenticated
  using (true) with check (true);

create policy "solo el administrador borra categorias"
  on public.categories for delete
  to authenticated
  using (true);

-- products
create policy "productos publicados visibles para el visitante"
  on public.products for select
  to anon
  using (is_published);

create policy "el administrador ve todos los productos"
  on public.products for select
  to authenticated
  using (true);

create policy "solo el administrador crea productos"
  on public.products for insert
  to authenticated
  with check (true);

create policy "solo el administrador edita productos"
  on public.products for update
  to authenticated
  using (true) with check (true);

create policy "solo el administrador borra productos"
  on public.products for delete
  to authenticated
  using (true);

-- site_settings
create policy "ajustes visibles para todos"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "solo el administrador edita los ajustes"
  on public.site_settings for update
  to authenticated
  using (true) with check (true);

-- Nadie inserta ni borra ajustes: la fila la crea la semilla y vive para
-- siempre. Sin política de insert ni de delete, RLS las bloquea por defecto.
