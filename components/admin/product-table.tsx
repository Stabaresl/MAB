"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";

import { FormFeedback } from "@/components/admin/form-feedback";
import { toggleProductPublished } from "@/lib/actions/products";
import { fold } from "@/lib/slug";
import { thumbUrl } from "@/lib/storage-url";

type Row = {
  id: string;
  name: string;
  slug: string;
  specs: string | null;
  imageUrl: string | null;
  isPublished: boolean;
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
  const [filter, setFilter] = useState<"todos" | "publicados" | "borradores">("todos");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [rows, applyOptimistic] = useOptimistic(
    products,
    (state: Row[], update: { id: string; isPublished: boolean }) =>
      state.map((row) => (row.id === update.id ? { ...row, isPublished: update.isPublished } : row)),
  );

  const visible = useMemo(() => {
    const needle = fold(query.trim());
    return rows.filter((row) => {
      if (filter === "publicados" && !row.isPublished) return false;
      if (filter === "borradores" && row.isPublished) return false;
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

        <div className="flex gap-1 rounded-md border border-hairline bg-surface-1 p-1">
          {(["todos", "publicados", "borradores"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`h-9 rounded-sm px-3 text-[14px] capitalize transition-colors ${
                filter === value ? "bg-surface-3 text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="spec mt-5 text-ink-subtle">
        {visible.length} de {rows.length}
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 rounded-lg border border-hairline bg-surface-1 p-10 text-center">
          <p className="text-ink">Ningún artículo coincide con este filtro.</p>
        </div>
      ) : (
        <ul className="mt-4 overflow-hidden rounded-lg border border-hairline">
          {visible.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-4 border-b border-hairline bg-surface-1 p-4 last:border-b-0"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-canvas/50">
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
                  className="text-ink hover:text-accent-text"
                >
                  {row.name}
                </Link>
                <p className="spec mt-1 truncate text-ink-subtle">
                  {row.categoryName}
                  {row.specs && ` · ${row.specs}`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
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
