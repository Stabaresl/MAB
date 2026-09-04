"use server";

import { revalidatePath } from "next/cache";

import { explainDatabaseError, requireAdmin } from "@/lib/actions/guard";
import { removeImage, uploadImage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { isSlugConflict, uniqueSlug } from "@/lib/slug";
import {
  categorySchema,
  failure,
  fieldErrorsFrom,
  success,
  type ActionResult,
} from "@/lib/validation";

const MAX_SLUG_ATTEMPTS = 3;

/** Slugs ya usados, opcionalmente ignorando el de la fila que se está editando. */
async function takenSlugs(exceptId?: string): Promise<string[]> {
  const supabase = await createClient();
  const query = supabase.from("categories").select("slug");
  const { data } = exceptId ? await query.neq("id", exceptId) : await query;
  return (data ?? []).map((row) => row.slug);
}

function refreshPublicPages() {
  revalidatePath("/", "layout");
  revalidatePath("/catalogo");
}

export async function createCategory(formData: FormData): Promise<ActionResult<{ slug: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const file = formData.get("image");
  let image: { url: string; path: string } | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file, "categorias");
    if (!uploaded.ok) return failure(uploaded.error, { image: uploaded.error });
    image = uploaded.image;
  }

  const supabase = await createClient();
  const existing = await takenSlugs();

  // Reintento acotado: entre leer los slugs y escribir, otra pestaña puede
  // haber creado el mismo. El UNIQUE de Postgres lo detecta y aquí se propone
  // el siguiente sufijo libre.
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = uniqueSlug(parsed.data.name, existing);
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        image_url: image?.url ?? null,
        image_path: image?.path ?? null,
      })
      .select("slug")
      .single();

    if (!error && data) {
      refreshPublicPages();
      return success({ slug: data.slug });
    }

    if (isSlugConflict(error)) {
      existing.push(slug);
      continue;
    }

    // La fila no entró: la imagen recién subida se queda sin dueño, así que se
    // retira. Storage y base de datos no pueden desincronizarse.
    await removeImage(image?.path ?? null);
    return failure(explainDatabaseError(error, "categoria"));
  }

  await removeImage(image?.path ?? null);
  return failure("No se pudo generar una dirección única para esa categoría. Prueba con otro nombre.");
}

export async function updateCategory(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("categories")
    .select("slug, name, image_path")
    .eq("id", id)
    .maybeSingle();

  if (readError || !current) {
    return failure("Esa categoría ya no existe. Puede que se haya borrado desde otra pestaña.");
  }

  const file = formData.get("image");
  let image: { url: string; path: string } | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file, "categorias");
    if (!uploaded.ok) return failure(uploaded.error, { image: uploaded.error });
    image = uploaded.image;
  }

  // El slug solo cambia si cambió el nombre: reescribirlo sin motivo rompería
  // los enlaces que MAB ya haya compartido por WhatsApp.
  const slug =
    parsed.data.name === current.name
      ? current.slug
      : uniqueSlug(parsed.data.name, await takenSlugs(id));

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      ...(image ? { image_url: image.url, image_path: image.path } : {}),
    })
    .eq("id", id);

  if (error) {
    await removeImage(image?.path ?? null);
    return failure(explainDatabaseError(error, "categoria"));
  }

  // La imagen anterior solo se borra cuando la nueva ya está guardada.
  if (image && current.image_path) {
    await removeImage(current.image_path);
  }

  refreshPublicPages();
  revalidatePath(`/catalogo/${slug}`);
  return success({ slug });
}

export async function deleteCategory(id: string): Promise<ActionResult<{ name: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name, image_path")
    .eq("id", id)
    .maybeSingle();

  if (!category) {
    return failure("Esa categoría ya no existe.");
  }

  // Se cuenta antes de intentar borrar para poder decir cuántos artículos
  // estorban, en vez de soltar el error de clave foránea tal cual.
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    const plural = count === 1 ? "1 artículo" : `${count} artículos`;
    return failure(
      `No se puede borrar "${category.name}" porque tiene ${plural}. Muévelos a otra categoría o elimínalos primero.`,
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    return failure(explainDatabaseError(error, "categoria"));
  }

  await removeImage(category.image_path);
  refreshPublicPages();
  return success({ name: category.name });
}

/** Guarda el orden que el administrador dejó arrastrando las categorías. */
export async function reorderCategories(ids: string[]): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();

  for (const [position, id] of ids.entries()) {
    const { error } = await supabase.from("categories").update({ position }).eq("id", id);
    if (error) {
      return failure(`No se pudo guardar el orden: ${error.message}`);
    }
  }

  refreshPublicPages();
  return success(undefined);
}
