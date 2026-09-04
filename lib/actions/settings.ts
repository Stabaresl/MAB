"use server";

import { revalidatePath } from "next/cache";

import { explainDatabaseError, requireAdmin } from "@/lib/actions/guard";
import { createClient } from "@/lib/supabase/server";
import {
  failure,
  fieldErrorsFrom,
  settingsSchema,
  success,
  type ActionResult,
} from "@/lib/validation";

/**
 * Datos de contacto del sitio.
 *
 * Viven en base de datos y no en el código para que MAB pueda cambiar un
 * número de WhatsApp sin esperar a un despliegue. El cambio se refleja de
 * inmediato en el pie, en la página de contacto y en el botón de cada ficha de
 * producto, porque las tres leen de aquí.
 */
export async function updateSettings(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = settingsSchema.safeParse({
    whatsappPrimary: formData.get("whatsappPrimary"),
    whatsappSecondary: formData.get("whatsappSecondary"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
    nit: formData.get("nit"),
  });

  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      whatsapp_primary: parsed.data.whatsappPrimary,
      whatsapp_secondary: parsed.data.whatsappSecondary ?? null,
      email: parsed.data.email,
      address: parsed.data.address,
      city: parsed.data.city,
      nit: parsed.data.nit,
    })
    .eq("id", 1);

  if (error) {
    return failure(explainDatabaseError(error, "ajustes"));
  }

  // El pie de página está en el layout: se revalida todo el árbol.
  revalidatePath("/", "layout");
  return success(undefined);
}
