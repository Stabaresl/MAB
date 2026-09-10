import Image from "next/image";
import Link from "next/link";

import { thumbUrl } from "@/lib/storage-url";
import type { ProductCard as ProductCardData } from "@/lib/catalog";

/**
 * Tarjeta de artículo.
 *
 * Toda la tarjeta es el enlace, no solo el título: en móvil nadie apunta a un
 * texto de 15px.
 *
 * Dos decisiones de color, y las dos vienen de haber probado lo contrario:
 *
 * 1. El hueco de la foto no lleva color. Las fotos que sube MAB no vienen
 *    recortadas sobre transparencia: llegan de estudio, cada una con su propio
 *    fondo gris muy claro, y sobre un tinte ese fondo se veía como un recorte
 *    pegado encima de la tarjeta. El hueco imita el gris de estudio y la foto va
 *    a sangre: una foto cuadrada llena el hueco exacto y no hay costura.
 *
 * 2. La banda del texto es el mismo azul en todas. Estuvo un tiempo tomando el
 *    tono de su categoría —seis pasteles distintos— y el efecto en una rejilla
 *    de cuarenta y cinco tarjetas no era «cada categoría tiene su color», era
 *    «algunas azules están más subidas que otras». Seis tonos repartidos entre
 *    diez categorías no llegan a leerse como un código, solo como una
 *    irregularidad. El nombre de la categoría, que sí es el dato, está escrito
 *    justo encima.
 *
 * El color por categoría sigue vivo donde sí significa algo y hay una sola
 * categoría a la vista: la cabecera de su página y el punto del rail.
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
    <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
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

      <div className="flex flex-1 flex-col gap-1.5 border-t border-sky-line bg-sky-soft p-4">
        {showCategory && <span className="label text-sky-ink">{product.category.name}</span>}
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
