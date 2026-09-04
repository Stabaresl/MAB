import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Cliente sin cookies para todo el sitio público.
 *
 * Leer con cookies obliga a Next a renderizar cada página en cada visita, y el
 * catálogo no necesita saber quién mira: son datos públicos. Sin cookies, las
 * páginas se generan una vez y se revalidan por tiempo, que es lo que hace que
 * el sitio responda rápido y salga barato en Vercel.
 *
 * De paso resuelve un detalle incómodo: con sesión abierta, el administrador
 * veía en la web pública sus propios borradores. Sin sesión, el rol es `anon` y
 * las políticas RLS solo devuelven lo publicado, sin depender de que nadie se
 * acuerde de filtrar.
 */
export function publicClient() {
  return createSupabaseClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Slugs de las categorías, para prerenderizar sus páginas. */
export async function getCategorySlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    console.warn("getCategorySlugs: Supabase sin configurar; no se prerenderiza ninguna categoría.");
    return [];
  }

  const { data, error } = await publicClient()
    .from("categories")
    .select("slug")
    .order("position", { ascending: true });

  if (error) {
    console.error("getCategorySlugs:", error.message);
    return [];
  }
  return (data ?? []).map((row) => row.slug);
}

/** Slugs de los artículos publicados, para prerenderizar sus fichas. */
export async function getProductSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    console.warn("getProductSlugs: Supabase sin configurar; no se prerenderiza ninguna ficha.");
    return [];
  }

  const { data, error } = await publicClient()
    .from("products")
    .select("slug")
    .eq("is_published", true);

  if (error) {
    console.error("getProductSlugs:", error.message);
    return [];
  }
  return (data ?? []).map((row) => row.slug);
}
