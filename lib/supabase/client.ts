"use client";

import { createBrowserClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Cliente de navegador. Solo lo necesita el formulario de acceso, que llama a
 * `signInWithPassword` para que la sesión quede en las cookies del navegador.
 * Todo lo demás — lecturas del catálogo y escrituras del panel — pasa por el
 * servidor.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
}
