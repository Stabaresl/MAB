"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/env";
import { failure, loginSchema, success, fieldErrorsFrom, type ActionResult } from "@/lib/validation";

/**
 * Entrada al panel.
 *
 * El mensaje de error es deliberadamente el mismo tanto si el correo no existe
 * como si la contraseña es incorrecta: distinguirlos le diría a un desconocido
 * qué correos tienen cuenta.
 */
export async function signIn(formData: FormData): Promise<ActionResult<never>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return failure("Revisa los datos de acceso.", fieldErrorsFrom(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return failure("Correo o contraseña incorrectos.");
  }

  const requested = formData.get("siguiente");
  // Solo se acepta una ruta interna del panel: si no, un enlace preparado
  // podría usar el acceso para rebotar a un sitio externo.
  const next =
    typeof requested === "string" && requested.startsWith("/admin") && !requested.startsWith("//")
      ? requested
      : "/admin";

  revalidatePath("/", "layout");

  // La navegación la hace el servidor, no el cliente. `redirect()` lanza la
  // señal que el router de Next entiende y entrega la página nueva con la
  // sesión ya escrita en las cookies; hacerlo desde el cliente obligaba a una
  // recarga de datos sobre la página de acceso que ya no correspondía.
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

/** Envía el correo de recuperación de contraseña. */
export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.includes("@")) {
    return failure("Escribe un correo válido.", { email: "Escribe un correo válido." });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/admin/nueva-clave`,
  });

  if (error) {
    return failure(`No se pudo enviar el correo: ${error.message}`);
  }

  return success(undefined);
}

/** Fija la contraseña nueva una vez el administrador llega desde el correo. */
export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const password = formData.get("password");
  const confirm = formData.get("confirm");

  if (typeof password !== "string" || password.length < 8) {
    return failure("La contraseña nueva necesita al menos 8 caracteres.", {
      password: "Al menos 8 caracteres.",
    });
  }

  if (password !== confirm) {
    return failure("Las dos contraseñas no coinciden.", {
      confirm: "No coincide con la anterior.",
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return failure(`No se pudo cambiar la contraseña: ${error.message}`);
  }

  return success(undefined);
}
