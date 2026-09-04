-- ---------------------------------------------------------------------------
-- Bucket de imágenes del catálogo
--
-- Lectura pública (las fotos salen en el sitio), escritura solo con sesión.
-- El límite de tamaño y la lista de tipos se declaran también aquí, no solo en
-- la aplicación: si alguien llamara a la API de Storage directamente, el
-- servidor sigue rechazando un archivo de 40 MB o un ejecutable.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalogo',
  'catalogo',
  true,
  5242880,                                          -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "imagenes del catalogo visibles para todos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'catalogo');

create policy "solo el administrador sube imagenes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'catalogo');

create policy "solo el administrador reemplaza imagenes"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'catalogo')
  with check (bucket_id = 'catalogo');

create policy "solo el administrador borra imagenes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'catalogo');
