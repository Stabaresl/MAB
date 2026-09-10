import type { Metadata } from "next";
import Link from "next/link";

import { CatalogBanner } from "@/components/catalog-banner";
import { CatalogBrowser } from "@/components/catalog-browser";
import {
  getAllProducts,
  getCategories,
  getFeaturedProducts,
  getSettings,
} from "@/lib/catalog";
import { site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Materiales de construcción y ferretería por categoría: zona húmeda, lavaplatos, duchas y monomando, rejillas, eléctricos, cajas de gas, baños, seguridad y cocina.",
};

/** Cuántos artículos entran en la vista de más vendidos. */
const EN_VITRINA = 12;

export default async function CatalogoPage() {
  const [categories, productos, destacados, settings] = await Promise.all([
    getCategories(),
    getAllProducts(),
    getFeaturedProducts(EN_VITRINA),
    getSettings(),
  ]);

  return (
    <>
      {/*
        El catálogo abre con producto, no con un titular.

        Aquí había un «Todo para tu proyecto» con su párrafo debajo, y entre el
        banner y ellos se comían la primera pantalla entera: había que bajar
        para ver el primer artículo, que es a lo que se entra. El titular sigue
        existiendo para el buscador y para quien navega con voz —una página sin
        `h1` no se entiende sin ver la pantalla—, pero no ocupa sitio.
      */}
      <h1 className="sr-only">Catálogo de {site.name}</h1>

      <section className="lavado lavado-sale">
        <div className="page pt-8 md:pt-10">
          <CatalogBanner />
        </div>

        <div className="page pb-10 pt-10 md:pb-14 md:pt-14">
          {/*
            La vitrina de más vendidos ya no es una sección aparte encima de la
            rejilla: es la vista con la que abre el navegador. Duplicar los
            mismos artículos arriba y abajo hacía la página el doble de larga
            para enseñar lo mismo dos veces.
          */}
          <CatalogBrowser
            categorias={categories.map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              productCount: c.productCount,
            }))}
            productos={productos}
            destacados={destacados}
          />
        </div>
      </section>

      <section className="lavado lavado-gris">
        <div className="page py-14 md:py-20">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="max-w-[24ch] text-[clamp(1.4rem,3vw,1.9rem)] leading-tight text-ink">
                ¿No encuentras una referencia?
              </h2>
              <p className="mt-3 max-w-[56ch] text-ink-2">
                Envíanos las especificaciones del proyecto y te cotizamos al mejor precio del
                mercado. Si ya tienes otra cotización, la mejoramos.
              </p>
            </div>
            <a
              href={whatsappLink(
                settings.whatsapp_primary,
                "Hola, busco una referencia que no vi en el catálogo.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary shrink-0"
            >
              Preguntar por WhatsApp
            </a>
          </div>

          <p className="mt-10 text-center text-[14px] text-ink-3">
            {site.claim}.{" "}
            <Link href="/contacto" className="font-semibold text-accent-ink hover:underline">
              Ver datos de contacto
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
