import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Todas las rutas salvo los archivos estáticos y las imágenes. La sesión se
     * refresca también en las páginas públicas para que el administrador no
     * pierda el acceso por navegar por el catálogo.
     */
    "/((?!_next/static|_next/image|favicon.ico|catalogo/.*\\.(?:webp|png|jpg|svg)|marca/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
