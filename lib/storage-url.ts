/**
 * Utilidades de URL de Storage.
 *
 * Separadas de `lib/storage.ts`, que es `server-only` por manejar la clave y el
 * cliente de Supabase. Esto es aritmética de cadenas y lo necesitan también las
 * tarjetas y las tablas que se pintan en el navegador.
 */

/**
 * Miniatura a partir de la URL principal. Las dos se suben juntas, así que si
 * existe una existe la otra.
 */
export function thumbUrl(url: string | null): string | null {
  if (!url) return null;
  return url.replace(/\.webp(\?|$)/, "-thumb.webp$1");
}
