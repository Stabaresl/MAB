import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getAllProducts, getCategories, getSettings } from "@/lib/catalog";
import { formatPhone, site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

const PASOS = [
  {
    numero: "01",
    titulo: "Envías las especificaciones",
    texto:
      "Nos dices qué necesita tu obra: referencias, medidas y cantidades. Si no tienes la referencia exacta, la buscamos nosotros.",
  },
  {
    numero: "02",
    titulo: "Te cotizamos",
    texto:
      "Te devolvemos el precio con las marcas disponibles. Si ya tienes otra cotización en mano, la mejoramos.",
  },
  {
    numero: "03",
    titulo: "Llega directo a la obra",
    texto:
      "El pedido sale hacia tu proyecto en el tiempo acordado, sea ciudad, municipio o vereda, en cualquier parte de Colombia.",
  },
];

export default async function HomePage() {
  const [categories, products, settings] = await Promise.all([
    getCategories(),
    getAllProducts(),
    getSettings(),
  ]);

  const destacados = products.slice(0, 8);

  return (
    <>
      {/* Portada ------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="absolute inset-0">
          <Image
            src="/ambientes/hero.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-[0.55]"
          />
          {/*
            Dos capas: una vertical que asienta el texto sobre el fondo y otra
            horizontal que deja respirar la foto a la derecha. Sin ellas el
            titular pierde contraste sobre las zonas claras del azulejo.
          */}
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/90 to-canvas/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-canvas/70 via-transparent to-canvas" />
        </div>

        <div className="page relative grid gap-10 py-20 md:py-28 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
          <div>
            <p className="label text-accent-text">
              {site.yearsInMarket} años distribuyendo calidad
            </p>
            <h1 className="mt-5 text-[clamp(2.25rem,7vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
              Materiales y acabados
              <br />
              para tu obra, entregados
              <br />
              donde estés.
            </h1>
            <p className="mt-7 max-w-[46ch] text-[clamp(1rem,2.4vw,1.19rem)] leading-relaxed text-ink-muted">
              Soluciones integrales en materiales de construcción y ferretería, con entrega
              directa en cualquier ciudad de Colombia. Desde acabados de zona húmeda hasta
              eléctricos, seguridad y baños.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/catalogo" className="btn btn-primary">
                Ver el catálogo
              </Link>
              <a
                href={whatsappLink(
                  settings.whatsapp_primary,
                  "Hola, quisiera cotizar materiales para mi proyecto.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Pedir cotización
              </a>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline lg:mb-2">
            <div className="bg-surface-1 p-5">
              <dt className="label text-ink-subtle">Años en el mercado</dt>
              <dd className="mt-2 font-display text-4xl font-extrabold text-ink">
                {site.yearsInMarket}
              </dd>
            </div>
            <div className="bg-surface-1 p-5">
              <dt className="label text-ink-subtle">Categorías</dt>
              <dd className="mt-2 font-display text-4xl font-extrabold text-ink">
                {categories.length}
              </dd>
            </div>
            <div className="bg-surface-1 p-5">
              <dt className="label text-ink-subtle">Cobertura</dt>
              <dd className="mt-2 font-display text-xl font-bold leading-tight text-ink">
                Todo el territorio nacional
              </dd>
            </div>
            <div className="bg-surface-1 p-5">
              <dt className="label text-ink-subtle">Sede</dt>
              <dd className="mt-2 font-display text-xl font-bold leading-tight text-ink">
                {settings.city}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Franja de marca ---------------------------------------------------- */}
      <section className="border-b border-hairline bg-brand-navy">
        <div className="page flex items-center gap-5 py-7">
          <span aria-hidden="true" className="h-10 w-px shrink-0 bg-ink" />
          <p className="label text-[clamp(0.75rem,2.6vw,1.05rem)] text-ink">
            Te mejoramos el precio de cualquier cotización
          </p>
        </div>
      </section>

      {/* Categorías --------------------------------------------------------- */}
      <section className="page py-20 md:py-24">
        <div className="flex flex-col gap-4 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label text-accent-text">Catálogo</p>
            <h2 className="mt-3 text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight text-ink">
              Todo lo que entra en un proyecto
            </h2>
          </div>
          <Link href="/catalogo" className="text-accent-text hover:text-accent">
            Ver el catálogo completo →
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/catalogo/${category.slug}`}
                className="group flex h-full items-start gap-5 rounded-lg border border-hairline bg-surface-1 p-5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-hairline-strong"
              >
                <div className="relative h-20 w-20 shrink-0 rounded-md bg-canvas/40">
                  {category.image_url && (
                    <Image
                      src={category.image_url}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[19px] leading-snug text-ink">{category.name}</h3>
                  <p className="spec mt-1 text-ink-subtle">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "artículo" : "artículos"}
                  </p>
                  {category.description && (
                    <p className="mt-2 line-clamp-2 text-[14px] text-ink-muted">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Cómo trabajamos ---------------------------------------------------- */}
      <section className="border-y border-hairline bg-surface-1/40">
        <div className="page py-20 md:py-24">
          <p className="label text-accent-text">Cómo trabajamos</p>
          <h2 className="mt-3 max-w-[20ch] text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight text-ink">
            Tres pasos entre tu obra y el material
          </h2>

          <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline md:grid-cols-3">
            {PASOS.map((paso) => (
              <li key={paso.numero} className="bg-canvas p-7">
                <span className="spec text-accent-text">{paso.numero}</span>
                <h3 className="mt-4 text-[21px] leading-snug text-ink">{paso.titulo}</h3>
                <p className="mt-3 text-ink-muted">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Destacados --------------------------------------------------------- */}
      {destacados.length > 0 && (
        <section className="page py-20 md:py-24">
          <div className="flex flex-col gap-4 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight text-ink">
              Del catálogo
            </h2>
            <Link href="/catalogo" className="text-accent-text hover:text-accent">
              Ver todos los artículos →
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {destacados.map((product) => (
              <li key={product.id} className="min-w-0">
                <ProductCard product={product} showCategory />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Quiénes somos ------------------------------------------------------ */}
      <section className="border-t border-hairline">
        <div className="page grid gap-12 py-20 md:py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="label text-accent-text">Quiénes somos</p>
            <h2 className="mt-3 text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight text-ink">
              {site.yearsInMarket} años de excelencia
            </h2>
            <p className="mt-6 max-w-[52ch] text-ink-muted">
              Distribuciones M.A.B pone a su disposición una gama de productos para la
              construcción de marcas exclusivas y de alta resistencia. Somos distribuidores a
              nivel nacional, con una amplia cartera de clientes y variedad de marcas
              certificadas.
            </p>
            <Link href="/nosotros" className="mt-7 inline-flex text-accent-text hover:text-accent">
              Conocer la empresa →
            </Link>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2">
            <div className="bg-surface-1 p-6">
              <dt className="label text-ink-subtle">Misión</dt>
              <dd className="mt-3 text-ink-muted">{site.mission}</dd>
            </div>
            <div className="bg-surface-1 p-6">
              <dt className="label text-ink-subtle">Visión</dt>
              <dd className="mt-3 text-ink-muted">{site.vision}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Clientes ----------------------------------------------------------- */}
      <section className="border-t border-hairline bg-surface-1/40">
        <div className="page py-20 md:py-24">
          <p className="label text-accent-text">Referencias</p>
          <h2 className="mt-3 text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight text-ink">
            Constructoras que ya nos compran
          </h2>

          <ul className="mt-10 grid gap-x-8 gap-y-px border-t border-hairline sm:grid-cols-2 lg:grid-cols-3">
            {site.clients.map((client) => (
              <li
                key={client}
                className="flex items-center gap-4 border-b border-hairline py-4 text-ink-muted"
              >
                <span aria-hidden="true" className="h-4 w-px shrink-0 bg-accent" />
                {client}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contacto ----------------------------------------------------------- */}
      <section className="page py-20 md:py-24">
        <div className="rounded-lg border border-hairline bg-brand-navy p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="max-w-[18ch] text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight text-ink">
                ¿Tienes las especificaciones del proyecto?
              </h2>
              <p className="mt-5 max-w-[52ch] text-ink-muted">
                Envíanoslas y te cotizamos al mejor precio del mercado. Si ya tienes otra
                cotización, la mejoramos.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={whatsappLink(
                  settings.whatsapp_primary,
                  "Hola, quisiera cotizar materiales para mi proyecto.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Escribir por WhatsApp
              </a>
              <a href={`mailto:${settings.email}`} className="btn btn-secondary">
                Enviar un correo
              </a>
              <p className="spec mt-1 text-center text-ink-subtle">
                {formatPhone(settings.whatsapp_primary)}
                {settings.whatsapp_secondary && ` · ${formatPhone(settings.whatsapp_secondary)}`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
