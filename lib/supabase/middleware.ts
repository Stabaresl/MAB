import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

/** Rutas del panel que sí puede ver alguien sin sesión. */
const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/recuperar", "/admin/nueva-clave"];

/** ¿La ruta pertenece al panel y exige sesión? */
function exigeSesion(pathname: string): boolean {
  if (!pathname.startsWith("/admin")) return false;
  return !PUBLIC_ADMIN_ROUTES.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );
}

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
  const { pathname } = request.nextUrl;

  /*
   * Sin credenciales de Supabase no hay sesión que refrescar.
   *
   * El middleware corre en TODAS las rutas, así que si aquí se lanza una
   * excepción no falla una página: falla el sitio entero, con un
   * MIDDLEWARE_INVOCATION_FAILED en cada dirección. Eso es lo que pasaba
   * cuando las variables no estaban puestas en Vercel — el catálogo, que no
   * necesita sesión para nada, se caía junto con el panel.
   *
   * Así que se sale por las buenas: las páginas públicas se sirven (el
   * catálogo saldrá vacío, y `lib/catalog.ts` lo avisa en el registro) y el
   * panel manda a la pantalla de acceso, que es donde el problema se ve y se
   * explica en vez de quedar en un 500 sin pistas.
   */
  if (!isSupabaseConfigured()) {
    console.error(
      "Middleware: faltan SUPABASE_URL o SUPABASE_ANON_KEY. " +
        "El sitio público se sirve sin sesión y el panel queda cerrado. " +
        "En Vercel: Settings → Environment Variables, y volver a desplegar.",
    );
    if (exigeSesion(pathname)) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("siguiente", pathname);
      return NextResponse.redirect(login);
    }
    return response;
  }

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

  if (exigeSesion(pathname) && !user) {
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
