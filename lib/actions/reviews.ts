"use server";

import { revalidatePath } from "next/cache";

import { explainDatabaseError, requireAdmin } from "@/lib/actions/guard";
import { removeImage, uploadImage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { failure, fieldErrorsFrom, reviewSchema, success, type ActionResult } from "@/lib/validation";

/**
 * Reseñas de clientes.
 *
 * MAB recibe las opiniones por WhatsApp y por correo, no por un formulario del
 * sitio: no hay manera de que las escriba el propio cliente, y fingir que sí
 * —con un formulario público— abriría la puerta a que cualquiera publique lo
 * que quiera en la portada. Las sube la empresa, con la captura o la foto y el
 * texto transcrito.
 */

function refrescarPortada() {
  revalidatePath("/", "layout");
}

function camposDelFormulario(formData: FormData) {
  return {
    author: formData.get("author"),
    role: formData.get("role"),
    quote: formData.get("quote"),
    rating: formData.get("rating"),
    isPublished: formData.get("isPublished") === "on",
  };
}

export async function createReview(formData: FormData): Promise<ActionResult<{ author: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = reviewSchema.safeParse(camposDelFormulario(formData));
  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const file = formData.get("image");
  let imagen: { url: string; path: string } | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file, "resenas");
    if (!uploaded.ok) return failure(uploaded.error, { image: uploaded.error });
    imagen = uploaded.image;
  }

  const supabase = await createClient();

  const { data: ultima } = await supabase
    .from("reviews")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("reviews").insert({
    author: parsed.data.author,
    role: parsed.data.role,
    quote: parsed.data.quote,
    rating: parsed.data.rating,
    is_published: parsed.data.isPublished,
    image_url: imagen?.url ?? null,
    image_path: imagen?.path ?? null,
    position: (ultima?.position ?? -1) + 1,
  });

  if (error) {
    await removeImage(imagen?.path ?? null);
    return failure(explainDatabaseError(error, "resena"));
  }

  refrescarPortada();
  return success({ author: parsed.data.author });
}

export async function updateReview(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ author: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = reviewSchema.safeParse(camposDelFormulario(formData));
  if (!parsed.success) {
    return failure("Revisa los campos marcados.", fieldErrorsFrom(parsed.error));
  }

  const supabase = await createClient();
  const { data: actual } = await supabase
    .from("reviews")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  if (!actual) return failure("Esa reseña ya no existe.");

  const file = formData.get("image");
  let imagen: { url: string; path: string } | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file, "resenas");
    if (!uploaded.ok) return failure(uploaded.error, { image: uploaded.error });
    imagen = uploaded.image;
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      author: parsed.data.author,
      role: parsed.data.role,
      quote: parsed.data.quote,
      rating: parsed.data.rating,
      is_published: parsed.data.isPublished,
      ...(imagen ? { image_url: imagen.url, image_path: imagen.path } : {}),
    })
    .eq("id", id);

  if (error) {
    await removeImage(imagen?.path ?? null);
    return failure(explainDatabaseError(error, "resena"));
  }

  if (imagen && actual.image_path) await removeImage(actual.image_path);

  refrescarPortada();
  return success({ author: parsed.data.author });
}

export async function deleteReview(id: string): Promise<ActionResult<{ author: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data: fila } = await supabase
    .from("reviews")
    .select("author, image_path")
    .eq("id", id)
    .maybeSingle();

  if (!fila) return failure("Esa reseña ya no existe.");

  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return failure(explainDatabaseError(error, "resena"));

  await removeImage(fila.image_path);
  refrescarPortada();
  return success({ author: fila.author });
}

/** Publicar o retirar sin abrir el formulario. */
export async function toggleReview(id: string, publicar: boolean): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ is_published: publicar }).eq("id", id);
  if (error) return failure(explainDatabaseError(error, "resena"));

  refrescarPortada();
  return success(undefined);
}

export async function reorderReviews(ids: string[]): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  for (const [position, id] of ids.entries()) {
    const { error } = await supabase.from("reviews").update({ position }).eq("id", id);
    if (error) return failure(`No se pudo guardar el orden: ${error.message}`);
  }

  refrescarPortada();
  return success(undefined);
}
