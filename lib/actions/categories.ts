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

/**
 * Borra una categoría.
 *
 * Con `conArticulos` en falso —lo que ocurre si nadie lo pide— una categoría
 * que todavía tiene artículos no se borra, y el mensaje dice cuántos hay. Con
 * `conArticulos` en cierto se va todo: los artículos, sus fotos y la categoría.
 *
 * El borrado completo no lo hacen dos consultas seguidas sino la función
 * `eliminar_categoria` de Postgres, que las mete en una sola transacción. La
 * diferencia importa el día que la segunda falle: con dos llamadas sueltas los
 * artículos ya no existirían y la categoría sí, y no habría manera de
 * recuperarlos. La función devuelve las rutas de las imágenes huérfanas, que se
 * retiran de Storage después, cuando la base de datos ya confirmó el borrado.
 */
export async function deleteCategory(
  id: string,
  opciones: { conArticulos?: boolean } = {},
): Promise<ActionResult<{ name: string; articulos: number }>> {
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

  // Se cuenta antes de borrar para poder decir cuántos artículos se llevará
  // por delante —o cuántos estorban—, en vez de soltar el error de clave
  // foránea tal cual.
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  const articulos = count ?? 0;

  if (articulos > 0 && !opciones.conArticulos) {
    const plural = articulos === 1 ? "1 artículo" : `${articulos} artículos`;
    return failure(
      `"${category.name}" tiene ${plural}. Confirma que quieres borrar la categoría con todo lo que hay dentro, o muévelos antes a otra categoría.`,
    );
  }

  if (articulos > 0) {
    const { data: huerfanas, error } = await supabase.rpc("eliminar_categoria", { p_id: id });

    if (error) {
      return failure(explainDatabaseError(error, "categoria"));
    }

    // Las fotos se retiran una a una y sin cortar el flujo: si alguna falla, la
    // fila ya no existe y lo único que queda es un archivo suelto, que
    // `removeImage` deja anotado en el registro.
    for (const ruta of huerfanas ?? []) {
      await removeImage(ruta);
    }

    refreshPublicPages();
    return success({ name: category.name, articulos });
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    return failure(explainDatabaseError(error, "categoria"));
  }

  await removeImage(category.image_path);
  refreshPublicPages();
  return success({ name: category.name, articulos: 0 });
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
