/**
 * Generación de slugs.
 *
 * "Baños" tiene que llegar a la URL como `banos`, y dos artículos llamados
 * igual no pueden pisarse. La unicidad real la impone el constraint UNIQUE de
 * Postgres; esta función solo propone el candidato y el siguiente si el primero
 * ya está cogido.
 */

const SEPARATORS = /[\s_/\\.,;:!?"'`()[\]{}<>|@#$%^&*+=~]+/g;

/**
 * Quita tildes, diéresis y la eñe, y baja a minúsculas. Sirve para comparar
 * texto: escrito así, "baños" y "banos" son la misma palabra, que es lo que
 * espera quien busca en el catálogo sin poner tildes.
 */
export function fold(input: string): string {
  return input
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function slugify(input: string): string {
  return fold(input)
    .replace(SEPARATORS, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90)
    .replace(/-$/, "");
}

/**
 * Slug único dentro de una lista de existentes: `lavadero-60x60`, y si está
 * ocupado, `lavadero-60x60-2`, `-3`, y así.
 */
export function uniqueSlug(name: string, taken: Iterable<string>): string {
  const base = slugify(name) || "articulo";
  const used = new Set(taken);
  if (!used.has(base)) return base;

  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
  // Con mil colisiones del mismo nombre, algo va mal en otra parte; un sufijo
  // aleatorio evita el bucle infinito sin romperle el flujo al administrador.
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Detecta el error de clave duplicada de Postgres sobre una columna de slug. */
export function isSlugConflict(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "23505" && /slug/i.test(error.message ?? "");
}
