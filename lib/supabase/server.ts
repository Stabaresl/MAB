import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Cliente de Supabase para el servidor (Server Components, Server Actions y
 * Route Handlers). Usa la clave anónima a propósito: las escrituras las
 * autoriza la sesión del administrador a través de RLS, no una clave con
 * privilegios. Si alguien alcanza este cliente sin sesión, Postgres rechaza la
 * escritura por su cuenta.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Un Server Component no puede escribir cookies. El middleware ya
          // refrescó la sesión antes de llegar aquí, así que ignorarlo es
          // correcto y no oculta ningún fallo real.
        }
      },
    },
  });
}

/**
 * Devuelve la sesión del administrador, o null si no hay ninguna.
 * `getUser()` valida el token contra Supabase; `getSession()` solo lee la
 * cookie y por eso no sirve para decidir permisos.
 */
export async function getAdminUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
