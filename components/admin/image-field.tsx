"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { ACCEPTED_EXTENSIONS, MAX_UPLOAD_BYTES } from "@/lib/image-limits";
import { FieldError } from "@/components/admin/form-feedback";

/**
 * Campo de imagen con vista previa.
 *
 * La comprobación de tamaño que hay aquí es una cortesía para no hacer subir
 * 20 MB por una red móvil y descubrir el rechazo al final. La validación que
 * cuenta ocurre en el servidor, que además mira los bytes reales del archivo y
 * no se fía de la extensión.
 */
export function ImageField({
  name = "image",
  currentUrl,
  error,
  label = "Imagen",
  hint,
}: {
  name?: string;
  currentUrl?: string | null;
  error?: string;
  label?: string;
  hint?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  // El error que devolvió el servidor deja de valer en cuanto el administrador
  // elige otro archivo: si no, el aviso del envío anterior tapa el del archivo
  // nuevo y parece que no pasa nada al cambiarlo.
  const [replaced, setReplaced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const shown = preview ?? currentUrl ?? null;
  const shownError = replaced ? localError : (error ?? localError);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setLocalError(null);
    setReplaced(true);

    if (!file) {
      setPreview(null);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setLocalError(
        `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo son 5 MB.`,
      );
      event.target.value = "";
      setPreview(null);
      return;
    }

    setPreview(URL.createObjectURL(file));
  }

  function clear() {
    setPreview(null);
    setLocalError(null);
    setReplaced(true);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label htmlFor={name} className="label block text-ink-subtle">
        {label}
      </label>

      <div className="mt-3 flex flex-wrap items-start gap-5">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md border border-hairline bg-surface-2">
          {shown ? (
            // Es una URL temporal de blob o una de Supabase; `unoptimized` evita
            // que next/image intente procesar una previsualización local.
            <Image
              src={shown}
              alt=""
              fill
              unoptimized
              sizes="112px"
              className="object-contain p-2"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-center text-[12px] text-ink-subtle">
              Sin
              <br />
              imagen
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            id={name}
            name={name}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={onChange}
            aria-invalid={Boolean(shownError)}
            className="block w-full text-[14px] text-ink-muted file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-3 file:px-4 file:font-semibold file:text-ink hover:file:bg-hairline-strong"
          />
          <p className="mt-2 text-[13px] text-ink-subtle">
            {hint ?? "JPG, PNG o WEBP. Máximo 5 MB. Se convierte a WebP al guardar."}
          </p>
          {preview && (
            <button
              type="button"
              onClick={clear}
              className="mt-2 text-[13px] text-accent-text underline underline-offset-4 hover:text-accent"
            >
              Quitar la imagen elegida
            </button>
          )}
          <FieldError message={shownError ?? undefined} />
        </div>
      </div>
    </div>
  );
}
