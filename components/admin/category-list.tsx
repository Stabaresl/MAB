"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormFeedback } from "@/components/admin/form-feedback";
import { deleteCategory } from "@/lib/actions/categories";

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
};

export function CategoryList({ categories }: { categories: Row[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete(row: Row) {
    setError(null);
    setOk(null);
    startTransition(async () => {
      const result = await deleteCategory(row.id);
      setConfirming(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOk(`Categoría «${result.data.name}» eliminada.`);
      router.refresh();
    });
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-canvas p-10 text-center">
        <p className="text-ink">Todavía no hay categorías.</p>
        <p className="mt-2 text-ink-2">
          Crea la primera con el formulario de al lado. Sin categorías no se pueden crear
          artículos.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FormFeedback error={error} success={ok} />

      <ul className="mt-4 overflow-hidden rounded-lg border border-line">
        {categories.map((row) => (
          <li key={row.id} className="border-b border-line bg-canvas last:border-b-0">
            <div className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-paper">
                {row.imageUrl && (
                  <Image
                    src={row.imageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 basis-48">
                <Link
                  href={`/admin/categorias/${row.id}`}
                  className="text-ink hover:text-accent-ink"
                >
                  {row.name}
                </Link>
                <p className="spec mt-1 text-ink-3">
                  {row.productCount} {row.productCount === 1 ? "artículo" : "artículos"} · /
                  {row.slug}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/admin/categorias/${row.id}`}
                  className="btn btn-secondary h-11 px-4 text-[14px]"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirming(confirming === row.id ? null : row.id)}
                  aria-expanded={confirming === row.id}
                  className="btn btn-secondary h-11 border-danger/40 px-4 text-[14px] text-danger hover:border-danger hover:bg-danger/10"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {confirming === row.id && (
              <div className="flex flex-wrap items-center gap-3 border-t border-line bg-paper p-4">
                {row.productCount > 0 ? (
                  <p className="text-[14px] text-ink">
                    «{row.name}» tiene {row.productCount}{" "}
                    {row.productCount === 1 ? "artículo" : "artículos"}. Muévelos a otra categoría
                    o elimínalos antes de poder borrarla.
                  </p>
                ) : (
                  <>
                    <span className="text-[14px] text-ink">
                      ¿Borrar «{row.name}» definitivamente?
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(row)}
                      disabled={pending}
                      className="btn h-11 bg-danger px-4 text-[14px] font-semibold text-white hover:opacity-90"
                    >
                      {pending ? "Borrando…" : "Sí, borrar"}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
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
