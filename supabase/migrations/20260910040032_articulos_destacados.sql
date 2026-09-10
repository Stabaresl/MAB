-- ---------------------------------------------------------------------------
-- Artículos destacados: «los más vendidos» del catálogo.
--
-- Es una marca por artículo y no una tabla aparte con su propio orden. La
-- alternativa —una lista de destacados con sus posiciones— obliga a mantener
-- dos sitios sincronizados: al borrar un artículo hay que acordarse de sacarlo
-- de la lista, y al despublicarlo hay que acordarse de esconderlo. Con una
-- columna, el artículo es el único dueño de su estado y las dos cosas salen
-- gratis.
--
-- `featured_position` va aparte de `position` porque el orden dentro de la
-- categoría y el orden en la vitrina de más vendidos no tienen por qué
-- coincidir: el lavadero puede ser el primero de zona húmeda y el tercero de la
-- vitrina.
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists is_featured       boolean not null default false,
  add column if not exists featured_position integer not null default 0;

comment on column public.products.is_featured is
  'Aparece en la vitrina de más vendidos del catálogo. Un artículo sin publicar nunca sale, aunque esté marcado: lo filtra la misma política RLS que al resto.';

-- Índice parcial: solo indexa las filas marcadas, que son un puñado, en vez de
-- las cuarenta y cinco. La consulta de la vitrina es exactamente este subconjunto.
create index if not exists products_featured_idx
  on public.products (featured_position, name)
  where is_featured;
