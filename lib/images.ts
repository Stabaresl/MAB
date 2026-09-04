import "server-only";

import sharp from "sharp";

import {
  ACCEPTED_MIME,
  MAX_UPLOAD_BYTES,
  MIN_DIMENSION,
  type AcceptedMime,
} from "@/lib/image-limits";

/**
 * Validación y normalización de las imágenes que sube el administrador.
 *
 * El tipo declarado por el navegador no se cree: un `.exe` renombrado a `.jpg`
 * llega con `Content-Type: image/jpeg` y hay que rechazarlo. Se comprueban los
 * bytes de cabecera y después se reprocesa el archivo con sharp, que descarta
 * cualquier cosa que no sea una imagen real y de paso elimina los metadatos y
 * cualquier carga escondida entre ellos.
 */

const FULL_WIDTH = 1200;
const THUMB_WIDTH = 480;

type Signature = { mime: string; matches: (bytes: Uint8Array) => boolean };

const SIGNATURES: Signature[] = [
  {
    mime: "image/jpeg",
    matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    matches: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    mime: "image/webp",
    matches: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

/** Tipo real del archivo según sus primeros bytes, o null si no es imagen. */
export function sniffMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  return SIGNATURES.find((s) => s.matches(bytes))?.mime ?? null;
}

export type ProcessedImage = {
  full: Buffer;
  thumb: Buffer;
  extension: "webp";
  contentType: "image/webp";
};

export type ImageError =
  | { ok: false; error: string };

export type ImageResult = { ok: true; image: ProcessedImage } | ImageError;

/**
 * Comprueba y convierte una imagen subida. Devuelve dos WebP: uno de detalle y
 * una miniatura para las rejillas del catálogo.
 */
export async function processUpload(file: File): Promise<ImageResult> {
  if (file.size === 0) {
    return { ok: false, error: "El archivo está vacío." };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      error: `La imagen pesa ${mb} MB y el máximo son 5 MB. Comprímela o usa una versión más pequeña.`,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const realMime = sniffMime(bytes);

  if (!realMime) {
    return {
      ok: false,
      error: "El archivo no es una imagen. Se aceptan JPG, PNG y WEBP.",
    };
  }

  if (!ACCEPTED_MIME.includes(realMime as AcceptedMime)) {
    return { ok: false, error: `Formato ${realMime} no admitido. Usa JPG, PNG o WEBP.` };
  }

  try {
    const source = sharp(bytes, { failOn: "error" });
    const meta = await source.metadata();

    if (!meta.width || !meta.height) {
      return { ok: false, error: "No se pudieron leer las dimensiones de la imagen." };
    }

    if (meta.width < MIN_DIMENSION || meta.height < MIN_DIMENSION) {
      return {
        ok: false,
        error: `La imagen es de ${meta.width}×${meta.height} px y se vería borrosa. Usa una de al menos ${MIN_DIMENSION}×${MIN_DIMENSION}.`,
      };
    }

    // Dos pasadas independientes: sharp consume el pipeline al ejecutarlo.
    const full = await sharp(bytes)
      .rotate() // respeta la orientación EXIF antes de descartarla
      .resize({ width: FULL_WIDTH, height: FULL_WIDTH, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer();

    const thumb = await sharp(bytes)
      .rotate()
      .resize({ width: THUMB_WIDTH, height: THUMB_WIDTH, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    return {
      ok: true,
      image: { full, thumb, extension: "webp", contentType: "image/webp" },
    };
  } catch (cause) {
    // sharp falla si el archivo tiene una cabecera válida pero el contenido
    // está corrupto o manipulado. Es un rechazo legítimo, no un fallo interno.
    const detail = cause instanceof Error ? cause.message : String(cause);
    return {
      ok: false,
      error: `La imagen no se pudo procesar: ${detail}`,
    };
  }
}

/**
 * Nombre de archivo aleatorio. Evita las colisiones entre dos subidas
 * simultáneas y cierra de raíz cualquier intento de recorrido de rutas a través
 * del nombre original.
 */
export function storagePath(folder: string, extension: string): string {
  const id = crypto.randomUUID();
  return `${folder}/${id}.${extension}`;
}

export function thumbPathFor(path: string): string {
  return path.replace(/\.webp$/, "-thumb.webp");
}
