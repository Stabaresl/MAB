-- ---------------------------------------------------------------------------
-- Tres cosas que hasta ahora estaban escritas en el código y que MAB tiene que
-- poder cambiar sin esperar a un despliegue:
--
--   clients  — los logotipos del carrusel de referencias
--   stats    — los contadores de la portada
--   reviews  — las reseñas de clientes
--
-- Y una cuarta que no es una tabla: una función para borrar una categoría con
-- todo lo que tenga dentro, de una vez y sin dejar el catálogo a medias.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- clients
--
-- Los trece nombres venían de `lib/site.ts` y los seis logotipos, de archivos
-- en `public/clientes/`. Eso obligaba a tocar el repositorio para añadir un
-- cliente. Ahora viven aquí; los logotipos que ya existen se conservan como
-- rutas relativas, que `next/image` sirve igual que una URL de Storage.
-- ---------------------------------------------------------------------------
create table public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null check (length(btrim(name)) between 2 and 80),
  logo_url   text,
  logo_path  text,
  position   integer     not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_position_idx on public.clients (position, name);

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

comment on column public.clients.logo_path is
  'Ruta en Storage. Nula en los logotipos que vinieron con el repositorio: esos son archivos estáticos y no hay nada que borrar.';

-- ---------------------------------------------------------------------------
-- stats — los contadores de la portada
--
-- `source` decide de dónde sale el número. Con 'manual' lo escribe el
-- administrador; con cualquier otro valor lo cuenta el servidor, y así la cifra
-- de artículos publicados no se queda vieja en cuanto se sube uno nuevo.
-- ---------------------------------------------------------------------------
create table public.stats (
  id           uuid primary key default gen_random_uuid(),
  label        text        not null check (length(btrim(label)) between 2 and 60),
  value        bigint      not null default 0 check (value >= 0 and value <= 100000000),
  suffix       text        check (length(suffix) <= 4),
  icon         text        not null default 'obra',
  source       text        not null default 'manual'
                 check (source in ('manual', 'productos', 'categorias', 'clientes')),
  is_published boolean     not null default true,
  position     integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index stats_position_idx on public.stats (position, created_at);

create trigger stats_set_updated_at
  before update on public.stats
  for each row execute function public.set_updated_at();

comment on column public.stats.value is
  'Solo cuenta cuando source = manual. En los demás casos el servidor sobreescribe el número al leerlo.';

-- ---------------------------------------------------------------------------
-- reviews
--
-- MAB recibe las opiniones por WhatsApp y por correo, así que la reseña la
-- sube la empresa: una captura o una foto, y el texto transcrito. La imagen es
-- opcional; el texto no, porque es lo que se lee y lo que indexa el buscador.
-- ---------------------------------------------------------------------------
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  author       text        not null check (length(btrim(author)) between 2 and 80),
  role         text        check (length(role) <= 120),
  quote        text        not null check (length(btrim(quote)) between 10 and 600),
  image_url    text,
  image_path   text,
  rating       smallint    check (rating between 1 and 5),
  is_published boolean     not null default true,
  position     integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index reviews_position_idx  on public.reviews (position, created_at desc);
create index reviews_published_idx on public.reviews (is_published) where is_published;

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

comment on column public.reviews.role is
  'Cargo y empresa de quien opina. Opcional: hay clientes que no quieren que se publique dónde trabajan.';

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Mismo reparto que en el resto del esquema: el visitante lee, el
-- administrador escribe, y lo decide Postgres. Las reseñas sin publicar no
-- salen de la base de datos para un visitante.
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.stats   enable row level security;
alter table public.reviews enable row level security;

create policy "clientes visibles para todos"
  on public.clients for select to anon, authenticated using (true);
create policy "solo el administrador crea clientes"
  on public.clients for insert to authenticated with check (true);
create policy "solo el administrador edita clientes"
  on public.clients for update to authenticated using (true) with check (true);
create policy "solo el administrador borra clientes"
  on public.clients for delete to authenticated using (true);

create policy "indicadores publicados visibles para el visitante"
  on public.stats for select to anon using (is_published);
create policy "el administrador ve todos los indicadores"
  on public.stats for select to authenticated using (true);
create policy "solo el administrador crea indicadores"
  on public.stats for insert to authenticated with check (true);
create policy "solo el administrador edita indicadores"
  on public.stats for update to authenticated using (true) with check (true);
create policy "solo el administrador borra indicadores"
  on public.stats for delete to authenticated using (true);

create policy "resenas publicadas visibles para el visitante"
  on public.reviews for select to anon using (is_published);
create policy "el administrador ve todas las resenas"
  on public.reviews for select to authenticated using (true);
create policy "solo el administrador crea resenas"
  on public.reviews for insert to authenticated with check (true);
create policy "solo el administrador edita resenas"
  on public.reviews for update to authenticated using (true) with check (true);
create policy "solo el administrador borra resenas"
  on public.reviews for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Borrar una categoría entera
--
-- La clave foránea sigue siendo `on delete restrict`, y eso no cambia: es la
-- red que impide que un borrado accidental desde cualquier otro sitio se lleve
-- el catálogo por delante. Lo que se añade es una puerta explícita —esta
-- función— que el panel usa cuando el administrador confirma que sí, que
-- quiere borrar la categoría con sus artículos dentro.
--
-- Va en una función y no en dos llamadas desde la aplicación porque el cuerpo
-- de una función es una sola transacción: si el borrado de la categoría
-- fallara, los artículos vuelven. Con dos llamadas sueltas, un fallo a mitad
-- dejaría la categoría vacía y los artículos perdidos.
--
-- Devuelve las rutas de las imágenes que quedaron sin dueño para que quien
-- llama las retire de Storage. La base de datos no puede borrar archivos.
--
-- `security invoker`: las políticas RLS se aplican igual, así que un visitante
-- que la invocara no borraría nada.
-- ---------------------------------------------------------------------------
create or replace function public.eliminar_categoria(p_id uuid)
returns setof text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Los artículos primero. La clave foránea es `restrict`, así que la
  -- categoría no se deja borrar mientras quede uno; dentro de la misma
  -- transacción, para cuando llega la segunda instrucción ya no queda ninguno.
  return query
    with borrados as (
      delete from public.products where category_id = p_id returning image_path
    )
    select b.image_path from borrados b where b.image_path is not null;

  return query
    with borrada as (
      delete from public.categories where id = p_id returning image_path
    )
    select c.image_path from borrada c where c.image_path is not null;
end;
$$;

-- `from public, anon` y no solo `from public`.
--
-- Supabase deja puestos privilegios por defecto en el esquema `public` que
-- conceden EXECUTE sobre cada función nueva a `anon`, `authenticated` y
-- `service_role`. Ese permiso es un grant directo al rol, así que revocárselo a
-- PUBLIC —el pseudo-rol «todo el mundo»— no se lo quita: hay que nombrar a
-- `anon`. Sin esta línea, un visitante podía llamar a la función.
--
-- No habría llegado a borrar nada: la función respeta RLS y `anon` no tiene
-- política de DELETE, así que los borrados afectan a cero filas. Pero una
-- puerta que no lleva a ninguna parte sigue siendo una puerta, y la única razón
-- por la que no lleva a ninguna parte es una política que alguien podría
-- cambiar mañana.
revoke all on function public.eliminar_categoria(uuid) from public, anon;
grant execute on function public.eliminar_categoria(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Contenido inicial
--
-- Los trece clientes son los de la página 23 del portafolio, en ese orden. Los
-- seis logotipos son los archivos que ya estaban en el repositorio.
-- ---------------------------------------------------------------------------
insert into public.clients (name, logo_url, position) values
  ('Grupo Área',                    '/clientes/grupoarea.webp',    0),
  ('Colpatria',                     '/clientes/colpatria.webp',    1),
  ('Mejía Villegas',                null,                          2),
  ('Super Havit',                   null,                          3),
  ('Prabic',                        null,                          4),
  ('Infante Vives',                 '/clientes/infantevives.webp', 5),
  ('Prodesa',                       '/clientes/prodesa.webp',      6),
  ('Mipko',                         null,                          7),
  ('AD Arquitectos',                null,                          8),
  ('MB Gerencia y Construcciones',  null,                          9),
  ('Gran Morada',                   '/clientes/granmorada.webp',  10),
  ('CFC Constructora',              '/clientes/cfc.webp',         11),
  ('Puertas del Sol Constructora SAS', null,                      12);

-- Los cuatro indicadores de arranque son datos comprobables: dos los cuenta el
-- servidor y los otros dos salen del portafolio. Ninguno es una cifra
-- inventada de escaparate. El administrador puede cambiarlos y añadir los
-- suyos —cotizaciones cerradas, obras atendidas— cuando tenga el número real.
insert into public.stats (label, value, suffix, icon, source, position) values
  ('Años en el mercado',          15, '+',  'trayectoria', 'manual',     0),
  ('Artículos en el catálogo',     0, null, 'catalogo',    'productos',  1),
  ('Categorías de material',       0, null, 'categorias',  'categorias', 2),
  ('Constructoras que confían',    0, null, 'clientes',    'clientes',   3);
