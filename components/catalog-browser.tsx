"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { fold } from "@/lib/slug";
import type { ProductCard as ProductCardData } from "@/lib/catalog";

type Category = { id: string; slug: string; name: string; productCount: number };

/**
 * Buscador y filtro del catálogo.
 *
 * Filtra en el cliente sobre la lista ya cargada: con este volumen de artículos
 * es instantáneo y evita un viaje al servidor por cada tecla. Si el catálogo
 * llegara a varios cientos de piezas, convendría moverlo a una consulta con
 * `ilike` en Postgres.
 */
export function CatalogBrowser({
  products,
  categories,
}: {
  products: ProductCardData[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const needle = fold(deferredQuery.trim());

    return products.filter((product) => {
      if (activeCategory && product.category.slug !== activeCategory) return false;
      if (!needle) return true;

      const haystack = fold(
        `${product.name} ${product.specs ?? ""} ${product.category.name} ${product.description ?? ""}`,
      );
      return needle.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [products, deferredQuery, activeCategory]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <label htmlFor="buscar" className="sr-only">
            Buscar en el catálogo
          </label>
          <input
            id="buscar"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar lavadero, rejilla, monomando…"
            className="field pl-11"
            autoComplete="off"
          />
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M13.5 13.5L17 17" strokeLinecap="round" />
          </svg>
        </div>

        <div className="scroll-x -mx-5 px-5 md:mx-0 md:px-0">
          <div className="flex w-max gap-2 pb-1">
            <FilterChip
              active={activeCategory === null}
              onClick={() => setActiveCategory(null)}
              label="Todas"
              count={products.length}
            />
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                active={activeCategory === category.slug}
                onClick={() => setActiveCategory(category.slug)}
                label={category.name}
                count={category.productCount}
              />
            ))}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="spec mt-6 text-ink-subtle">
        {results.length === 0
          ? "Ningún artículo coincide"
          : `${results.length} ${results.length === 1 ? "artículo" : "artículos"}`}
      </p>

      {results.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} showCategory={activeCategory === null} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-lg border border-hairline bg-surface-1 p-10 text-center">
          <p className="text-ink">No encontramos nada con esa búsqueda.</p>
          <p className="mt-2 text-ink-muted">
            Trabajamos con muchas más referencias de las que están publicadas. Escríbenos y te
            decimos si la tenemos.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory(null);
            }}
            className="btn btn-secondary mt-6"
          >
            Limpiar la búsqueda
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-md border px-4 transition-colors ${
        active
          ? "border-accent bg-accent-quiet text-accent-text"
          : "border-hairline bg-surface-1 text-ink-muted hover:border-hairline-strong hover:text-ink"
      }`}
    >
      {label}
      <span className="spec text-ink-subtle">{count}</span>
    </button>
  );
}
