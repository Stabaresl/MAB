"use server";

import { revalidatePath } from "next/cache";

import { explainDatabaseError, requireAdmin } from "@/lib/actions/guard";
import { removeImage, uploadImage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { clientSchema, failure, fieldErrorsFrom, success, type ActionResult } from "@/lib/validation";

/**
 * Clientes del carrusel de referencias.
 *
 * El logotipo es opcional a propósito: de los trece clientes del portafolio
 * solo seis publican un archivo utilizable, y la ficha sin logotipo se lee como
 * una más porque el nombre va debajo de todas. Obligar a subir una imagen
 * dejaría fuera a la mitad de las referencias reales.
 */

function refrescarPortada() {
  // El carrusel está en la portada; el pie va en el layout, así que se revalida
  // el árbol entero por si el conteo de clientes alimenta un contador.
  revalidatePath("/", "layout");
}

export async function createClientRow(formData: FormData): Promise<ActionResult<{ name: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = clientSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const file = formData.get("image");
  let logo: { url: string; path: string } | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file, "clientes");
    if (!uploaded.ok) return failure(uploaded.error, { image: uploaded.error });
    logo = uploaded.image;
  }

  const supabase = await createClient();

  // Va al final de la fila. Se lee el máximo en vez de contar filas: si alguna
  // vez se borra una del medio, contar daría una posición ya ocupada.
  const { data: ultima } = await supabase
    .from("clients")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("clients").insert({
    name: parsed.data.name,
    logo_url: logo?.url ?? null,
    logo_path: logo?.path ?? null,
    position: (ultima?.position ?? -1) + 1,
  });

  if (error) {
    // La fila no entró: el logotipo recién subido se queda sin dueño.
    await removeImage(logo?.path ?? null);
    return failure(explainDatabaseError(error, "cliente"));
  }

  refrescarPortada();
  return success({ name: parsed.data.name });
}

export async function updateClientRow(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ name: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = clientSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const supabase = await createClient();
  const { data: actual } = await supabase
    .from("clients")
    .select("logo_path")
    .eq("id", id)
    .maybeSingle();

  if (!actual) return failure("Ese cliente ya no existe.");

  const file = formData.get("image");
  let logo: { url: string; path: string } | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file, "clientes");
    if (!uploaded.ok) return failure(uploaded.error, { image: uploaded.error });
    logo = uploaded.image;
  }

  const { error } = await supabase
    .from("clients")
    .update({
      name: parsed.data.name,
      ...(logo ? { logo_url: logo.url, logo_path: logo.path } : {}),
    })
    .eq("id", id);

  if (error) {
    await removeImage(logo?.path ?? null);
    return failure(explainDatabaseError(error, "cliente"));
  }

  // El anterior solo se borra cuando el nuevo ya está guardado.
  if (logo && actual.logo_path) await removeImage(actual.logo_path);

  refrescarPortada();
  return success({ name: parsed.data.name });
}

export async function deleteClientRow(id: string): Promise<ActionResult<{ name: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data: fila } = await supabase
    .from("clients")
    .select("name, logo_path")
    .eq("id", id)
    .maybeSingle();

  if (!fila) return failure("Ese cliente ya no existe.");

  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return failure(explainDatabaseError(error, "cliente"));

  await removeImage(fila.logo_path);
  refrescarPortada();
  return success({ name: fila.name });
}

/** Quita el logotipo dejando el cliente, que sigue apareciendo con su nombre. */
export async function clearClientLogo(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data: fila } = await supabase
    .from("clients")
    .select("logo_path")
    .eq("id", id)
    .maybeSingle();

  if (!fila) return failure("Ese cliente ya no existe.");

  const { error } = await supabase
    .from("clients")
    .update({ logo_url: null, logo_path: null })
    .eq("id", id);

  if (error) return failure(explainDatabaseError(error, "cliente"));

  await removeImage(fila.logo_path);
  refrescarPortada();
  return success(undefined);
}

export async function reorderClients(ids: string[]): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  for (const [position, id] of ids.entries()) {
    const { error } = await supabase.from("clients").update({ position }).eq("id", id);
    if (error) return failure(`No se pudo guardar el orden: ${error.message}`);
  }

  refrescarPortada();
  return success(undefined);
}
