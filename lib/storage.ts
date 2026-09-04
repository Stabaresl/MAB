import "server-only";

import { processUpload, storagePath, thumbPathFor } from "@/lib/images";
import { createClient } from "@/lib/supabase/server";

export { thumbUrl } from "@/lib/storage-url";

const BUCKET = "catalogo";

export type UploadedImage = { url: string; path: string };

/**
 * Sube una imagen ya validada y devuelve su URL pública y su ruta.
 *
 * La ruta se guarda junto a la URL en la fila porque es lo que hace falta para
 * borrar el archivo después. Sin ella, borrar un artículo dejaría su foto
 * ocupando espacio en Storage para siempre.
 */
export async function uploadImage(
  file: File,
  folder: string,
): Promise<{ ok: true; image: UploadedImage } | { ok: false; error: string }> {
  const processed = await processUpload(file);
  if (!processed.ok) return processed;

  const supabase = await createClient();
  const path = storagePath(folder, processed.image.extension);
  const thumbPath = thumbPathFor(path);

  const main = await supabase.storage.from(BUCKET).upload(path, processed.image.full, {
    contentType: processed.image.contentType,
    cacheControl: "31536000",
    upsert: false,
  });

  if (main.error) {
    return { ok: false, error: `No se pudo guardar la imagen: ${main.error.message}` };
  }

  const thumb = await supabase.storage.from(BUCKET).upload(thumbPath, processed.image.thumb, {
    contentType: processed.image.contentType,
    cacheControl: "31536000",
    upsert: false,
  });

  if (thumb.error) {
    // La miniatura falló: se retira también la principal para no dejar el par
    // a medias. Mejor no tener imagen que tener media.
    await supabase.storage.from(BUCKET).remove([path]);
    return { ok: false, error: `No se pudo guardar la miniatura: ${thumb.error.message}` };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, image: { url: data.publicUrl, path } };
}

/**
 * Borra una imagen y su miniatura. Se usa en dos momentos: al eliminar una
 * fila, y al deshacer una subida cuya escritura en base de datos falló.
 *
 * No lanza: si el archivo ya no está, el objetivo se cumple igual. Lo que sí
 * hace es dejar constancia en el registro para que un huérfano no pase
 * inadvertido.
 */
export async function removeImage(path: string | null): Promise<void> {
  if (!path) return;

  try {
    const supabase = await createClient();
    const { error } = await supabase.storage.from(BUCKET).remove([path, thumbPathFor(path)]);
    if (error) {
      console.error(`removeImage: quedó huérfano ${path} — ${error.message}`);
    }
  } catch (cause) {
    console.error(`removeImage: quedó huérfano ${path}`, cause);
  }
}
