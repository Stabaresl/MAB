"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";

import { FormFeedback } from "@/components/admin/form-feedback";
import { toggleProductFeatured, toggleProductPublished } from "@/lib/actions/products";
import { fold } from "@/lib/slug";
import { thumbUrl } from "@/lib/storage-url";

type Row = {
  id: string;
  name: string;
  slug: string;
  specs: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  categoryName: string;
  categorySlug: string;
};

/**
 * Listado del panel.
 *
 * El interruptor de publicado cambia de aspecto antes de que responda el
 * servidor y se revierte solo si la escritura falla: el administrador ve el
 * efecto inmediato sin que la interfaz mienta cuando algo va mal.
 */
export function ProductTable({
  products,
  categories,
}: {
  products: Row[];
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "todos" | "publicados" | "borradores" | "destacados"
  >("todos");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [rows, applyOptimistic] = useOptimistic(
    products,
    (state: Row[], update: { id: string } & Partial<Row>) =>
      state.map((row) => (row.id === update.id ? { ...row, ...update } : row)),
  );

  const visible = useMemo(() => {
    const needle = fold(query.trim());
    return rows.filter((row) => {
      if (filter === "publicados" && !row.isPublished) return false;
      if (filter === "borradores" && row.isPublished) return false;
      if (filter === "destacados" && !row.isFeatured) return false;
      if (category && row.categorySlug !== category) return false;
      if (!needle) return true;
      return fold(`${row.name} ${row.specs ?? ""} ${row.categoryName}`).includes(needle);
    });
  }, [rows, query, filter, category]);

  function onToggle(row: Row) {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ id: row.id, isPublished: !row.isPublished });
      const result = await toggleProductPublished(row.id, !row.isPublished);
      if (!result.ok) {
        setError(result.error);
      }
      // Refrescar reconcilia el estado optimista con lo que hay en la base de
      // datos, tanto si salió bien como si no.
      router.refresh();
    });
  }

  /**
   * Marca o desmarca «más vendido».
   *
   * Va aquí y no solo en el formulario porque armar la vitrina es una tarea de
   * lista: se mira el catálogo entero y se van eligiendo cinco o seis. Abrir y
   * guardar seis formularios para eso sería el mismo trabajo que antes costaba
   * vaciar una categoría a mano.
   */
  function onToggleFeatured(row: Row) {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ id: row.id, isFeatured: !row.isFeatured });
      const result = await toggleProductFeatured(row.id, !row.isFeatured);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div>
      <FormFeedback error={error} />

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <label htmlFor="filtrar" className="sr-only">
            Buscar artículos
          </label>
          <input
            id="filtrar"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, medida o categoría…"
            className="field"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="categoria" className="sr-only">
            Filtrar por categoría
          </label>
          <select
            id="categoria"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="field md:w-56"
          >
            <option value="">Todas las categorías</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1 rounded-md border border-line bg-canvas p-1">
          {(["todos", "publicados", "borradores", "destacados"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`h-9 rounded-sm px-3 text-[14px] capitalize transition-colors ${
                filter === value ? "bg-paper-2 text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="spec mt-5 text-ink-3">
        {visible.length} de {rows.length} · {rows.filter((r) => r.isFeatured).length} entre los más
        vendidos
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 rounded-lg border border-line bg-canvas p-10 text-center">
          <p className="text-ink">Ningún artículo coincide con este filtro.</p>
        </div>
      ) : (
        <ul className="mt-4 overflow-hidden rounded-lg border border-line">
          {visible.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-4 border-b border-line bg-canvas p-4 last:border-b-0"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-paper">
                {row.imageUrl && (
                  <Image
                    src={thumbUrl(row.imageUrl) ?? row.imageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 basis-48">
                <Link
                  href={`/admin/articulos/${row.id}`}
                  className="text-ink hover:text-accent-ink"
                >
                  {row.name}
                </Link>
                <p className="spec mt-1 truncate text-ink-3">
                  {row.categoryName}
                  {row.specs && ` · ${row.specs}`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.isFeatured}
                  onClick={() => onToggleFeatured(row)}
                  title={
                    row.isFeatured
                      ? "Quitar de los más vendidos"
                      : "Añadir a los más vendidos"
                  }
                  className={`flex h-11 w-11 items-center justify-center rounded-md border transition-colors ${
                    row.isFeatured
                      ? "border-sun-line bg-sun-soft text-sun-ink"
                      : "border-line-2 bg-canvas text-ink-3 hover:border-ink-3 hover:text-ink-2"
                  }`}
                >
                  <span className="sr-only">
                    {row.isFeatured ? "Quitar de los más vendidos" : "Añadir a los más vendidos"}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill={row.isFeatured ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  >
                    <path d="M10 1.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L2.2 7.5l5.4-.8z" />
                  </svg>
                </button>

                <button
                  type="button"
                  role="switch"
                  aria-checked={row.isPublished}
                  onClick={() => onToggle(row)}
                  className={`spec h-11 rounded-md border px-3 transition-colors ${
                    row.isPublished
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-warning/40 bg-warning/10 text-warning"
                  }`}
                >
                  {row.isPublished ? "Publicado" : "Borrador"}
                </button>

                <Link
                  href={`/admin/articulos/${row.id}`}
                  className="btn btn-secondary h-11 px-4 text-[14px]"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
