import Image from "next/image";
import Link from "next/link";

import { claseTono } from "@/lib/tono";
import { thumbUrl } from "@/lib/storage-url";
import type { ProductCard as ProductCardData } from "@/lib/catalog";

/**
 * Tarjeta de artículo.
 *
 * Toda la tarjeta es el enlace, no solo el título: en móvil nadie apunta a un
 * texto de 15px. La foto va con `object-contain` sobre superficie clara porque
 * las piezas llegan recortadas sobre transparencia; recortarlas al cuadrado
 * les cortaría el grifo o el sifón.
 *
 * El color lo pone la categoría. El hueco de la foto se tiñe con el tono que le
 * toca —seis pastel sacados del logotipo— y la etiqueta de categoría se escribe
 * con la tinta de ese mismo tono. Eso resuelve el problema que tenía la rejilla:
 * cuarenta y cinco recuadros del mismo hueso pálido no se distinguían entre sí
 * y el catálogo entero se leía como una hoja de cálculo. Con el tono, una fila
 * de rejillas y una de eléctricos se ven distintas antes de leer una palabra.
 *
 * El tinte va solo en el hueco de la foto y no en la tarjeta entera: la pieza
 * necesita fondo plano para recortarse, y el texto necesita el lienzo de
 * siempre para no obligar a recalcular el contraste seis veces.
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
      <div className="relative aspect-square w-full border-b border-[var(--tono-linea)] bg-[var(--tono-fondo)]">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1100px) 33vw, 300px"
            className="object-contain p-6 transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="spec text-ink-3">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {showCategory && (
          <span className="label text-[var(--tono-tinta)]">{product.category.name}</span>
        )}
        <h3 className="font-text text-[16px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-ink">
          <Link href={`/producto/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        {product.specs && <p className="spec mt-auto pt-1 text-ink-3">{product.specs}</p>}
      </div>
    </article>
  );
}
