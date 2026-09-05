-- ---------------------------------------------------------------------------
-- search_path fijo en la función del trigger
--
-- El linter de Supabase la marcaba con «search_path mutable». La función no es
-- SECURITY DEFINER, así que el riesgo era bajo, pero con la ruta vacía ningún
-- esquema puesto por delante puede secuestrar un nombre dentro de ella.
-- `now()` sigue resolviendo: pg_catalog está siempre en la ruta implícita.
-- ---------------------------------------------------------------------------

alter function public.set_updated_at() set search_path = '';
