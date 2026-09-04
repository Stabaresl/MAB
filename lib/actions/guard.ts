import "server-only";

import { getAdminUser } from "@/lib/supabase/server";
import { failure, type ActionResult } from "@/lib/validation";

/**
 * Comprobación de sesión al principio de cada acción de escritura.
 *
 * Es la tercera barrera, después del middleware y de RLS. Su valor no es
 * impedir el acceso — de eso ya se encarga Postgres — sino devolver un mensaje
 * claro en vez de un error críptico de permisos cuando a un administrador se le
 * caduca la sesión con el formulario abierto.
 */
export async function requireAdmin(): Promise<ActionResult<{ id: string }>> {
  const user = await getAdminUser();
  if (!user) {
    return failure("Tu sesión caducó. Vuelve a entrar para guardar los cambios.");
  }
  return { ok: true, data: { id: user.id } };
}

/**
 * Traduce los errores de Postgres a algo que el administrador pueda entender y
 * resolver. Los códigos vienen del catálogo estándar de PostgreSQL.
 */
export function explainDatabaseError(
  error: { code?: string; message?: string; details?: string } | null,
  context: "categoria" | "producto" | "ajustes",
): string {
  if (!error) return "Error desconocido.";

  switch (error.code) {
    case "23503": // foreign_key_violation
      if (context === "categoria") {
        return "No se puede borrar la categoría porque todavía tiene artículos. Muévelos a otra categoría o elimínalos primero.";
      }
      return "La categoría elegida ya no existe. Recarga la página y vuelve a intentarlo.";

    case "23505": // unique_violation
      return "Ya existe otro registro con ese nombre. Cámbialo un poco y vuelve a guardar.";

    case "23514": // check_violation
      return "Algún dato no cumple el formato esperado. Revisa la longitud de los campos.";

    case "42501": // insufficient_privilege
      return "Tu sesión no tiene permiso para esta operación. Vuelve a entrar.";

    case "PGRST116": // sin filas donde se esperaba una
      return "El registro ya no existe. Puede que se haya borrado desde otra pestaña.";

    default:
      return `No se pudo guardar: ${error.message ?? "error desconocido"}`;
  }
}
