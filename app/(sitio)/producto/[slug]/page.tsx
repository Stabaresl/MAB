import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { getProductBySlug, getRelatedProducts, getSettings } from "@/lib/catalog";
import { siteUrl } from "@/lib/env";
import { getProductSlugs } from "@/lib/supabase/public";
import { formatPhone, productEnquiry, site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Las fichas son lo más visitado: se prerenderizan todas y se revalidan por
  // tiempo. Un artículo creado después se sirve en la primera visita y queda
  // cacheado a partir de ahí.
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Artículo no encontrado" };

  const description =
    product.description ??
    `${product.name}${product.specs ? ` — ${product.specs}` : ""}. Disponible en ${site.name}, con entrega en cualquier ciudad de Colombia.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.category.id, product.id),
    getSettings(),
  ]);

  const url = `${siteUrl()}/producto/${product.slug}`;
  const enquiry = productEnquiry(product.name, url);

  return (
    <>
      {/* Franja de ruta a todo el ancho: sitúa la pieza dentro del catálogo
          antes de que empiece la ficha. */}
      <nav aria-label="Ruta" className="border-b border-line bg-paper">
        <div className="page flex items-center gap-2 py-3.5">
          <Link href="/catalogo" className="label text-ink-3 transition-colors hover:text-ink">
            Catálogo
          </Link>
          <span aria-hidden="true" className="text-line-2">
            /
          </span>
          <Link
            href={`/catalogo/${product.category.slug}`}
            className="label text-ink-3 transition-colors hover:text-ink"
          >
            {product.category.name}
          </Link>
          <span aria-hidden="true" className="text-line-2">
            /
          </span>
          <span className="label truncate text-ink">{product.name}</span>
        </div>
      </nav>

      <div className="page py-10 md:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <figure className="card relative aspect-square overflow-hidden bg-paper">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-contain p-8"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="spec text-ink-3">Sin imagen</span>
            </div>
          )}
        </figure>

        <div className="flex flex-col">
          <Link
            href={`/catalogo/${product.category.slug}`}
            className="label w-fit text-accent-ink transition-colors hover:text-accent-strong"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-4 text-[clamp(2rem,5.2vw,3.2rem)] leading-[1.06] text-ink">
            {product.name}
          </h1>

          {product.specs && (
            <p className="spec mt-3 text-ink-3">{product.specs}</p>
          )}

          {product.description && (
            <div className="mt-6 max-w-[62ch] whitespace-pre-line text-[17px] leading-relaxed text-ink-2">
              {product.description}
            </div>
          )}

          {/* Ficha de datos: filas con filete, como una ficha técnica impresa.
              Solo se listan los datos que existen; lo que hay que confirmar se
              marca con una raya en vez de inventarse una cifra. */}
          <dl className="mt-8 border-t border-line">
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-3">
              <dt className="text-[15px] text-ink-2">Categoría</dt>
              <dd className="spec text-ink">{product.category.name}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-3">
              <dt className="text-[15px] text-ink-2">Medidas y material</dt>
              <dd className="spec text-right text-ink">{product.specs ?? "—"}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-3">
              <dt className="text-[15px] text-ink-2">Referencia</dt>
              <dd className="spec text-ink">Consultar</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-3">
              <dt className="text-[15px] text-ink-2">Entrega</dt>
              <dd className="spec text-right text-ink">Todo el territorio nacional</dd>
            </div>
          </dl>

          <div className="card mt-9 bg-paper p-6">
            <h2 className="label text-ink-3">Pedir precio</h2>
            <p className="mt-3 text-ink-2">
              Escríbenos con las cantidades que necesitas y te cotizamos. Si ya tienes otra
              cotización, la mejoramos.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink(settings.whatsapp_primary, enquiry)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex-1"
              >
                Consultar por WhatsApp
              </a>
              <a
                href={`mailto:${settings.email}?subject=${encodeURIComponent(
                  `Consulta: ${product.name}`,
                )}&body=${encodeURIComponent(enquiry)}`}
                className="btn btn-secondary flex-1"
              >
                Escribir un correo
              </a>
            </div>

            <ul className="mt-6 flex flex-col gap-2 border-t border-line pt-5">
              <li className="spec text-ink-3">
                WhatsApp {formatPhone(settings.whatsapp_primary)}
                {settings.whatsapp_secondary && ` · ${formatPhone(settings.whatsapp_secondary)}`}
              </li>
              <li className="spec break-words text-ink-3">{settings.email}</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] leading-tight text-ink">
            Más de {product.category.name}
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id} className="min-w-0">
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
      </div>
    </>
  );
}
