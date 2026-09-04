"use server";

import { revalidatePath } from "next/cache";

import { explainDatabaseError, requireAdmin } from "@/lib/actions/guard";
import { removeImage, uploadImage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { isSlugConflict, uniqueSlug } from "@/lib/slug";
import {
  failure,
  fieldErrorsFrom,
  productSchema,
  success,
  type ActionResult,
} from "@/lib/validation";

const MAX_SLUG_ATTEMPTS = 3;

async function takenSlugs(exceptId?: string): Promise<string[]> {
  const supabase = await createClient();
  const query = supabase.from("products").select("slug");
  const { data } = exceptId ? await query.neq("id", exceptId) : await query;
  return (data ?? []).map((row) => row.slug);
}

async function refreshFor(categoryId: string, productSlug?: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", categoryId)
    .maybeSingle();

  revalidatePath("/", "layout");
  revalidatePath("/catalogo");
  if (data?.slug) revalidatePath(`/catalogo/${data.slug}`);
  if (productSlug) revalidatePath(`/producto/${productSlug}`);
}

function readForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    specs: formData.get("specs"),
    isPublished: formData.get("isPublished") === "on" || formData.get("isPublished") === "true",
  });
}

export async function createProduct(formData: FormData): Promise<ActionResult<{ slug: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = readForm(formData);
  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const file = formData.get("image");
  let image: { url: string; path: string } | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file, "productos");
    if (!uploaded.ok) return failure(uploaded.error, { image: uploaded.error });
    image = uploaded.image;
  }

  const supabase = await createClient();
  const existing = await takenSlugs();

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = uniqueSlug(parsed.data.name, existing);
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: parsed.data.name,
        slug,
        category_id: parsed.data.categoryId,
        description: parsed.data.description,
        specs: parsed.data.specs,
        is_published: parsed.data.isPublished,
        image_url: image?.url ?? null,
        image_path: image?.path ?? null,
      })
      .select("slug")
      .single();

    if (!error && data) {
      await refreshFor(parsed.data.categoryId, data.slug);
      return success({ slug: data.slug });
    }

    if (isSlugConflict(error)) {
      existing.push(slug);
      continue;
    }

    // La escritura falló después de subir la foto: se retira para no dejarla
    // huérfana ocupando espacio en Storage.
    await removeImage(image?.path ?? null);
    return failure(explainDatabaseError(error, "producto"));
  }

  await removeImage(image?.path ?? null);
  return failure("No se pudo generar una dirección única para ese artículo. Cambia un poco el nombre.");
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = readForm(formData);
  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("products")
    .select("slug, name, image_path, category_id")
    .eq("id", id)
    .maybeSingle();

  if (!current) {
    return failure("Ese artículo ya no existe. Puede que se haya borrado desde otra pestaña.");
  }

  const file = formData.get("image");
  let image: { url: string; path: string } | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file, "productos");
    if (!uploaded.ok) return failure(uploaded.error, { image: uploaded.error });
    image = uploaded.image;
  }

  const slug =
    parsed.data.name === current.name
      ? current.slug
      : uniqueSlug(parsed.data.name, await takenSlugs(id));

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      slug,
      category_id: parsed.data.categoryId,
      description: parsed.data.description,
      specs: parsed.data.specs,
      is_published: parsed.data.isPublished,
      ...(image ? { image_url: image.url, image_path: image.path } : {}),
    })
    .eq("id", id);

  if (error) {
    await removeImage(image?.path ?? null);
    return failure(explainDatabaseError(error, "producto"));
  }

  if (image && current.image_path) {
    await removeImage(current.image_path);
  }

  await refreshFor(parsed.data.categoryId, slug);
  if (current.category_id !== parsed.data.categoryId) {
    await refreshFor(current.category_id);
  }
  revalidatePath(`/producto/${current.slug}`);
  return success({ slug });
}

export async function deleteProduct(id: string): Promise<ActionResult<{ name: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, slug, image_path, category_id")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    return failure("Ese artículo ya no existe.");
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return failure(explainDatabaseError(error, "producto"));
  }

  // La foto se borra después de que la fila desaparezca. Si se hiciera antes y
  // el borrado fallara, quedaría un artículo sin imagen.
  await removeImage(product.image_path);
  await refreshFor(product.category_id, product.slug);
  return success({ name: product.name });
}

/** Publica o retira un artículo sin abrir el formulario completo. */
export async function toggleProductPublished(
  id: string,
  isPublished: boolean,
): Promise<ActionResult<{ isPublished: boolean }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ is_published: isPublished })
    .eq("id", id)
    .select("slug, category_id, is_published")
    .single();

  if (error || !data) {
    return failure(explainDatabaseError(error, "producto"));
  }

  await refreshFor(data.category_id, data.slug);
  return success({ isPublished: data.is_published });
}
