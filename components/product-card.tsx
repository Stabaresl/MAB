import Image from "next/image";
import Link from "next/link";

import { thumbUrl } from "@/lib/storage-url";
import type { ProductCard as ProductCardData } from "@/lib/catalog";

/**
 * Tarjeta de artículo.
 *
 * Toda la tarjeta es el enlace, no solo el título: en móvil nadie apunta a un
 * texto de 15px. La foto va con `object-contain` sobre una superficie oscura
 * porque las piezas llegan recortadas sobre transparencia; recortarlas al
 * cuadrado les cortaría el grifo o el sifón.
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
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-hairline bg-surface-1 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-hairline-strong">
      <div className="relative aspect-square w-full bg-canvas/40 p-5">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1100px) 33vw, 300px"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="spec text-ink-subtle">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t border-hairline p-4">
        {showCategory && (
          <span className="label text-ink-subtle">{product.category.name}</span>
        )}
        <h3 className="text-[17px] leading-snug text-ink">
          <Link href={`/producto/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        {product.specs && <p className="spec mt-auto pt-1 text-ink-subtle">{product.specs}</p>}
      </div>
    </article>
  );
}
