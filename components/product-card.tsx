import Image from "next/image";
import Link from "next/link";

import { claseTono } from "@/lib/tono";
import { thumbUrl } from "@/lib/storage-url";
import type { ProductCard as ProductCardData } from "@/lib/catalog";

/**
 * Tarjeta de artículo.
 *
 * Toda la tarjeta es el enlace, no solo el título: en móvil nadie apunta a un
 * texto de 15px.
 *
 * El hueco de la foto NO lleva el color de la categoría, y esa es la corrección
 * importante. Las fotos que sube MAB no vienen recortadas sobre transparencia:
 * llegan de un estudio, cada una con su propio fondo gris muy claro. Puestas
 * sobre un pastel, ese fondo se veía como un recorte pegado encima de la
 * tarjeta —un rectángulo gris dentro de un marco azul—. Ahora el hueco imita
 * ese mismo gris de estudio y la foto va a sangre, sin relleno alrededor: una
 * foto cuadrada llena el hueco exacto y no hay costura que ver.
 *
 * El color de la categoría se va abajo, a la banda del texto. Sigue habiendo
 * rejilla de colores —que es lo que hacía falta para que el catálogo no se lea
 * como una hoja de cálculo— pero ninguna foto se apoya sobre un tinte.
 */
export function ProductCard({
  product,
  showCategory = false,
}: {
  product: ProductCardData;
  showCategory?: boolean;
}) {
  const image = thumbUrl(product.image_url) ?? product.image_url;

  return (
    <article
      className={`card card-hover group relative flex h-full flex-col overflow-hidden ${claseTono(
        product.category.slug,
      )}`}
    >
      <div className="pozo-foto relative aspect-square w-full">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1100px) 33vw, 300px"
            className="object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="spec text-ink-3">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 border-t border-[var(--tono-linea)] bg-[var(--tono-fondo)] p-4">
        {showCategory && (
          <span className="label text-[var(--tono-tinta)]">{product.category.name}</span>
        )}
        <h3 className="font-text text-[16px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-ink">
          <Link href={`/producto/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        {product.specs && <p className="spec mt-auto pt-1 text-ink-2">{product.specs}</p>}
      </div>
    </article>
  );
}
