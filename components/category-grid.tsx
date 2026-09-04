"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

import { fold } from "@/lib/slug";
import type { CategoriaCarrusel } from "@/components/category-carousel";

/**
 * Rejilla de categorías con buscador.
 *
 * Acompaña al carrusel: el carrusel sirve para pasear, esto para ir directo.
 * El filtro busca también dentro de la descripción, así que escribir "gas"
 * encuentra tanto la categoría de cajas como la de rejillas de ventilación,
 * que es donde alguien buscaría sin saber el nombre exacto.
 */
export function CategoryGrid({ categorias }: { categorias: CategoriaCarrusel[] }) {
  const [consulta, setConsulta] = useState("");
  const quieto = useReducedMotion();

  const resultados = useMemo(() => {
    const aguja = fold(consulta.trim());
    if (!aguja) return categorias;
    return categorias.filter((c) =>
      fold(`${c.name} ${c.description ?? ""}`).includes(aguja),
    );
  }, [categorias, consulta]);

  return (
    <div>
      <div className="relative max-w-[440px]">
        <label htmlFor="buscar-categoria" className="sr-only">
          Buscar una categoría
        </label>
        <input
          id="buscar-categoria"
          type="search"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Buscar: baños, rejillas, gas…"
          autoComplete="off"
          className="field pl-11"
        />
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M13.5 13.5L17 17" strokeLinecap="round" />
        </svg>
      </div>

      <p aria-live="polite" className="spec mt-5 text-ink-3">
        {resultados.length === 0
          ? "Ninguna categoría coincide"
          : `${resultados.length} ${resultados.length === 1 ? "categoría" : "categorías"}`}
      </p>

      {resultados.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {resultados.map((categoria) => (
              <motion.li
                key={categoria.id}
                layout={!quieto}
                initial={quieto ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={quieto ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                className="min-w-0"
              >
                <Link
                  href={`/catalogo/${categoria.slug}`}
                  className="card card-hover group flex h-full items-start gap-5 p-5"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-paper">
                    {categoria.imageUrl && (
                      <Image
                        src={categoria.imageUrl}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-text text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-ink">
                      {categoria.name}
                    </h3>
                    <p className="spec mt-1 text-ink-3">
                      {categoria.productCount}{" "}
                      {categoria.productCount === 1 ? "artículo" : "artículos"}
                    </p>
                    {categoria.description && (
                      <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-3">
                        {categoria.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="card mt-4 p-10 text-center">
          <p className="text-ink">No encontramos ninguna categoría con esa palabra.</p>
          <button type="button" onClick={() => setConsulta("")} className="btn btn-secondary mt-6">
            Limpiar la búsqueda
          </button>
        </div>
      )}
    </div>
  );
}
