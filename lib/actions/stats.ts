"use server";

import { revalidatePath } from "next/cache";

import { explainDatabaseError, requireAdmin } from "@/lib/actions/guard";
import { createClient } from "@/lib/supabase/server";
import { failure, fieldErrorsFrom, statSchema, success, type ActionResult } from "@/lib/validation";

/**
 * Contadores de la portada.
 *
 * Un contador con `source` distinto de `manual` ignora el número escrito: lo
 * cuenta el servidor al servir la página. El campo se guarda igual para que, si
 * alguna vez se cambia la fuente a manual, quede el último valor tecleado en
 * lugar de un cero.
 */

function refrescarPortada() {
  revalidatePath("/", "layout");
}

function camposDelFormulario(formData: FormData) {
  return {
    label: formData.get("label"),
    value: formData.get("value"),
    suffix: formData.get("suffix"),
    icon: formData.get("icon"),
    source: formData.get("source"),
    isPublished: formData.get("isPublished") === "on",
  };
}

export async function createStat(formData: FormData): Promise<ActionResult<{ label: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = statSchema.safeParse(camposDelFormulario(formData));
  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const supabase = await createClient();

  const { data: ultimo } = await supabase
    .from("stats")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("stats").insert({
    label: parsed.data.label,
    value: parsed.data.value,
    suffix: parsed.data.suffix,
    icon: parsed.data.icon,
    source: parsed.data.source,
    is_published: parsed.data.isPublished,
    position: (ultimo?.position ?? -1) + 1,
  });

  if (error) return failure(explainDatabaseError(error, "indicador"));

  refrescarPortada();
  return success({ label: parsed.data.label });
}

export async function updateStat(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ label: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = statSchema.safeParse(camposDelFormulario(formData));
  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stats")
    .update({
      label: parsed.data.label,
      value: parsed.data.value,
      suffix: parsed.data.suffix,
      icon: parsed.data.icon,
      source: parsed.data.source,
      is_published: parsed.data.isPublished,
    })
    .eq("id", id);

  if (error) return failure(explainDatabaseError(error, "indicador"));

  refrescarPortada();
  return success({ label: parsed.data.label });
}

export async function deleteStat(id: string): Promise<ActionResult<{ label: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data: fila } = await supabase.from("stats").select("label").eq("id", id).maybeSingle();
  if (!fila) return failure("Ese indicador ya no existe.");

  const { error } = await supabase.from("stats").delete().eq("id", id);
  if (error) return failure(explainDatabaseError(error, "indicador"));

  refrescarPortada();
  return success({ label: fila.label });
}

export async function reorderStats(ids: string[]): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  for (const [position, id] of ids.entries()) {
    const { error } = await supabase.from("stats").update({ position }).eq("id", id);
    if (error) return failure(`No se pudo guardar el orden: ${error.message}`);
  }

  refrescarPortada();
  return success(undefined);
}
