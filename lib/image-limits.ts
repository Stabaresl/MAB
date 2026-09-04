/**
 * Límites de subida de imágenes.
 *
 * Viven en su propio archivo, sin `server-only`, porque los necesitan las dos
 * orillas: el campo del formulario para avisar antes de subir, y el servidor
 * para rechazar de verdad. Un único sitio donde cambiarlos evita que el aviso
 * del navegador y la comprobación real se separen.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB — coincide con el bucket
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";
export const MIN_DIMENSION = 200; // px por lado

export type AcceptedMime = (typeof ACCEPTED_MIME)[number];
