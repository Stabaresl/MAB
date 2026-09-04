"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type CategoriaCarrusel = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
};

/**
 * Carrusel de categorías.
 *
 * Es la puerta al catálogo: en vez de volcar 45 artículos sueltos, el visitante
 * elige primero el tipo de material, que es como piensa quien está comprando
 * para una obra.
 *
 * Se arrastra con el dedo, con la rueda horizontal y con el teclado, y las
 * flechas se apagan al llegar a cada extremo en lugar de desaparecer, para que
 * la fila de controles no cambie de tamaño.
 */
export function CategoryCarousel({ categorias }: { categorias: CategoriaCarrusel[] }) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    loop: false,
  });

  const [puedeAnterior, setPuedeAnterior] = useState(false);
  const [puedeSiguiente, setPuedeSiguiente] = useState(false);
  const [indice, setIndice] = useState(0);
  const [total, setTotal] = useState(0);

  const sincronizar = useCallback(() => {
    if (!embla) return;
    setPuedeAnterior(embla.canScrollPrev());
    setPuedeSiguiente(embla.canScrollNext());
    setIndice(embla.selectedScrollSnap());
    setTotal(embla.scrollSnapList().length);
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    sincronizar();
    embla.on("select", sincronizar).on("reInit", sincronizar);
    return () => {
      embla.off("select", sincronizar).off("reInit", sincronizar);
    };
  }, [embla, sincronizar]);

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <p className="spec text-ink-3">
          {categorias.length} categorías · desliza para verlas todas
        </p>

        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => embla?.scrollPrev()}
            disabled={!puedeAnterior}
            aria-label="Categorías anteriores"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2 bg-canvas text-ink transition-colors hover:bg-paper disabled:opacity-35"
          >
            <Flecha direccion="izquierda" />
          </button>
          <button
            type="button"
            onClick={() => embla?.scrollNext()}
            disabled={!puedeSiguiente}
            aria-label="Categorías siguientes"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2 bg-canvas text-ink transition-colors hover:bg-paper disabled:opacity-35"
          >
            <Flecha direccion="derecha" />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden" ref={emblaRef}>
        <ul className="-ml-4 flex touch-pan-y">
          {categorias.map((categoria) => (
            <li
              key={categoria.id}
              className="min-w-0 shrink-0 grow-0 basis-[78%] pl-4 min-[520px]:basis-[46%] md:basis-[34%] lg:basis-[27%]"
            >
              <div className="h-full">
                <Link
                  href={`/catalogo/${categoria.slug}`}
                  className="card card-hover group flex h-full flex-col overflow-hidden"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper">
                    {categoria.imageUrl && (
                      <Image
                        src={categoria.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 520px) 78vw, (max-width: 768px) 46vw, (max-width: 1024px) 34vw, 300px"
                        className="object-contain p-7 transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.06]"
                      />
                    )}
                    <span className="spec absolute left-3 top-3 rounded-full bg-canvas/90 px-2.5 py-1 text-ink-2 shadow-sm backdrop-blur">
                      {categoria.productCount}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col border-t border-line p-5">
                    <h3 className="text-[19px] leading-snug text-ink transition-colors group-hover:text-accent-ink">
                      {categoria.name}
                    </h3>
                    {categoria.description && (
                      <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-ink-3">
                        {categoria.description}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent-ink">
                      Ver artículos
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Indicador de posición: en móvil sustituye a las flechas. */}
      {total > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              aria-label={`Ir al grupo ${i + 1} de ${total}`}
              aria-current={i === indice}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === indice ? "w-6 bg-accent" : "w-1.5 bg-line-2"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Flecha({ direccion }: { direccion: "izquierda" | "derecha" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direccion === "izquierda" ? (
        <path d="M12 4l-6 6 6 6" />
      ) : (
        <path d="M8 4l6 6-6 6" />
      )}
    </svg>
  );
}
