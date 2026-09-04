import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/** Rutas del panel que sí puede ver alguien sin sesión. */
const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/recuperar", "/admin/nueva-clave"];

/**
 * Refresca la sesión de Supabase en cada petición y cierra el panel a quien no
 * la tenga.
 *
 * Esta es la primera de las dos barreras. La segunda, y la que de verdad
 * importa, son las políticas RLS en Postgres: aunque alguien saltara este
 * middleware, la base de datos seguiría rechazando cualquier escritura sin
 * sesión. El middleware existe para que el visitante vea una pantalla de acceso
 * en vez de un error.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // No se puede meter lógica entre createServerClient y getUser: cualquier
  // await intermedio puede dejar la sesión sin refrescar y desloguear al
  // administrador de forma aleatoria.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAdminArea && !isPublicAdminRoute && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    // Para devolver al administrador a donde iba después de entrar.
    login.searchParams.set("siguiente", pathname);
    return NextResponse.redirect(login);
  }

  // El caso contrario — ya tiene sesión y pide /admin/login — se resuelve en la
  // propia página, no aquí. Un `NextResponse.redirect` responde con una
  // redirección HTTP normal, y cuando la petición es una recarga de datos del
  // router de Next el cliente espera una carga útil RSC y se encuentra un
  // cuerpo vacío: "Unexpected end of JSON input". El `redirect()` de la página
  // sí emite lo que el router entiende.

  return response;
}
