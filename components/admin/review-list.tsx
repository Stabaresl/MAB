"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormFeedback } from "@/components/admin/form-feedback";
import { OrderButtons } from "@/components/admin/order-buttons";
import { deleteReview, reorderReviews, toggleReview } from "@/lib/actions/reviews";
import type { Review } from "@/lib/database.types";

/** Las reseñas publicadas y las que están guardadas sin publicar. */
export function ReviewList({ resenas }: { resenas: Review[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function ejecutar(accion: () => Promise<{ ok: boolean; error?: string }>, exito: string) {
    setError(null);
    setOk(null);
    startTransition(async () => {
      const result = await accion();
      setConfirmando(null);
      if (!result.ok) {
        setError(result.error ?? "No se pudo completar la operación.");
        return;
      }
      setOk(exito);
      router.refresh();
    });
  }

  function mover(indice: number, salto: -1 | 1) {
    const destino = indice + salto;
    if (destino < 0 || destino >= resenas.length) return;
    const ids = resenas.map((r) => r.id);
    // Intercambio con dos variables y no desestructurando: con
    // `noUncheckedIndexedAccess` el acceso por índice puede ser indefinido, y
    // la forma corta no le da a TypeScript ninguna manera de saber que aquí no
    // lo es.
    const aqui = ids[indice];
    const alla = ids[destino];
    if (!aqui || !alla) return;
    ids[indice] = alla;
    ids[destino] = aqui;
    ejecutar(() => reorderReviews(ids), "Orden guardado.");
  }

  if (resenas.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-canvas p-10 text-center">
        <p className="text-ink">Todavía no hay reseñas.</p>
        <p className="mt-2 max-w-[52ch] mx-auto text-ink-2">
          Cuando un cliente escriba algo bueno por WhatsApp o por correo, guarda la captura y
          añádela aquí. Mientras no haya ninguna, la sección no aparece en la portada.
        </p>
        <Link href="/admin/resenas/nueva" className="btn btn-primary mt-6">
          Añadir la primera
        </Link>
      </div>
    );
  }

  return (
    <div>
      <FormFeedback error={error} success={ok} />

      <ul className="mt-4 flex flex-col gap-3">
        {resenas.map((resena, indice) => (
          <li key={resena.id} className="rounded-lg border border-line bg-canvas">
            <div className="flex flex-wrap items-start gap-4 p-4">
              <OrderButtons
                indice={indice}
                total={resenas.length}
                deshabilitado={pending}
                onMover={(salto) => mover(indice, salto)}
                que={`la reseña de ${resena.author}`}
              />

              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-paper">
                {resena.image_url ? (
                  <Image
                    src={resena.image_url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-center text-[11px] text-ink-3">
                    Sin
                    <br />
                    imagen
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 basis-56">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/resenas/${resena.id}`}
                    className="font-semibold text-ink hover:text-accent-ink"
                  >
                    {resena.author}
                  </Link>
                  {!resena.is_published && (
                    <span className="spec rounded-full bg-warning/15 px-2.5 py-0.5 text-warning">
                      Sin publicar
                    </span>
                  )}
                  {resena.rating !== null && (
                    <span className="spec text-ink-3">{resena.rating}/5</span>
                  )}
                </div>
                {resena.role && <p className="spec mt-0.5 text-ink-3">{resena.role}</p>}
                <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-2">
                  {resena.quote}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    ejecutar(
                      () => toggleReview(resena.id, !resena.is_published),
                      resena.is_published ? "Reseña retirada." : "Reseña publicada.",
                    )
                  }
                  disabled={pending}
                  className="btn btn-secondary h-11 px-4 text-[14px]"
                >
                  {resena.is_published ? "Retirar" : "Publicar"}
                </button>
                <Link
                  href={`/admin/resenas/${resena.id}`}
                  className="btn btn-secondary h-11 px-4 text-[14px]"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmando(confirmando === resena.id ? null : resena.id)}
                  aria-expanded={confirmando === resena.id}
                  className="btn btn-secondary h-11 border-danger/40 px-4 text-[14px] text-danger hover:border-danger hover:bg-danger/10"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {confirmando === resena.id && (
              <div className="flex flex-wrap items-center gap-3 border-t border-line bg-paper p-4">
                <span className="text-[14px] text-ink">
                  ¿Borrar la reseña de «{resena.author}» definitivamente?
                </span>
                <button
                  type="button"
                  onClick={() =>
                    ejecutar(() => deleteReview(resena.id), "Reseña eliminada.")
                  }
                  disabled={pending}
                  className="btn h-11 bg-danger px-4 text-[14px] font-semibold text-white hover:opacity-90"
                >
                  {pending ? "Borrando…" : "Sí, borrar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(null)}
                  className="btn btn-secondary h-11 px-4 text-[14px]"
                >
                  Cancelar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
