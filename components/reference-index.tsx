"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { thumbUrl } from "@/lib/storage-url";

/**
 * Índice de referencias con vista previa.
 *
 * Ni tarjetas ni carrusel. Las fotos del catálogo llegan recortadas sobre
 * transparencia, así que la tarjeta les sobraba: era un rectángulo pálido
 * puesto encima del lavado de color solo para sostener una pieza que ya venía
 * suelta. Aquí la pieza flota directamente sobre el fondo de la sección y el
 * texto se ordena como un índice: número, nombre y categoría, con un filete de
 * separación. Se lee como una lista de referencias, que es lo que es.
 *
 * La foto de la fila señalada aparece al lado, en un panel que acompaña el
 * desplazamiento. El puntero y el teclado la cambian igual: recorrer el índice
 * con el tabulador enseña las mismas fotos que recorrerlo con el ratón.
 *
 * En móvil no hay puntero al que responder, así que cada fila lleva su propia
 * miniatura y el panel no se dibuja.
 */
export function ReferenceIndex({ productos }: { productos: ProductCardData[] }) {
  const [activo, setActivo] = useState(0);

  if (productos.length === 0) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-16">
      <ol className="min-w-0">
        {productos.map((producto, i) => {
          const miniatura = thumbUrl(producto.image_url) ?? producto.image_url;
          return (
            <li key={producto.id} className="border-t border-line last:border-b">
              <Link
                href={`/producto/${producto.slug}`}
                onMouseEnter={() => setActivo(i)}
                onFocus={() => setActivo(i)}
                className="group flex items-center gap-4 py-4 sm:gap-6"
              >
                <span
                  aria-hidden="true"
                  className={`spec w-6 shrink-0 tabular-nums transition-colors ${
                    i === activo ? "text-accent" : "text-ink-3"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* La miniatura solo existe donde no hay puntero que consultar
                    el panel de al lado. */}
                <span className="relative h-12 w-12 shrink-0 lg:hidden">
                  {miniatura && (
                    <Image src={miniatura} alt="" fill sizes="48px" className="object-contain" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[19px] leading-snug text-ink transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-1 sm:text-[22px]">
                    {producto.name}
                  </span>
                  {producto.specs && (
                    <span className="spec mt-0.5 block truncate text-ink-3">{producto.specs}</span>
                  )}
                </span>

                <span className="label hidden shrink-0 text-ink-3 sm:block">
                  {producto.category.name}
                </span>

                <span
                  aria-hidden="true"
                  className="shrink-0 text-ink-3 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent"
                >
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Panel de vista previa. Decorativo: el nombre ya está en la fila, así
          que repetirlo aquí solo añadiría ruido al lector de pantalla. */}
      <div aria-hidden="true" className="hidden lg:block">
        <div className="sticky top-28">
          <div className="relative aspect-square w-full">
            {productos.map((producto, i) => {
              const foto = producto.image_url;
              if (!foto) return null;
              return (
                <Image
                  key={producto.id}
                  src={foto}
                  alt=""
                  fill
                  sizes="340px"
                  className={`object-contain transition-opacity duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                    i === activo ? "opacity-100" : "opacity-0"
                  }`}
                />
              );
            })}
          </div>

          <p className="label mt-2 text-center text-ink-3">
            {productos[activo]?.category.name}
          </p>
        </div>
      </div>
    </div>
  );
}
