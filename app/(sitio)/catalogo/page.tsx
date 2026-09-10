import type { Metadata } from "next";
import Link from "next/link";

import { CatalogBrowser } from "@/components/catalog-browser";
import { Reveal } from "@/components/motion/reveal";
import { getAllProducts, getCategories, getSettings } from "@/lib/catalog";
import { site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Materiales de construcción y ferretería por categoría: zona húmeda, lavaplatos, duchas y monomando, rejillas, eléctricos, cajas de gas, baños, seguridad y cocina.",
};

export default async function CatalogoPage() {
  const [categories, productos, settings] = await Promise.all([
    getCategories(),
    getAllProducts(),
    getSettings(),
  ]);

  return (
    <>
      <section className="border-b border-line bg-paper">
        <div className="page py-12 md:py-16">
          <Reveal>
            <p className="label text-accent-ink">Catálogo</p>
            <h1 className="mt-3 max-w-[14ch] text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.06] text-ink">
              Todo para tu proyecto
            </h1>
            <p className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-ink-2">
              {productos.length} artículos publicados en {categories.length} categorías.
              Trabajamos con más referencias de las que aparecen aquí: si no ves lo que buscas,
              escríbenos y te decimos si la tenemos.
            </p>
          </Reveal>
        </div>
      </section>

      {/*
        Aquí había dos pasos antes de ver un artículo: un cinturón de categorías
        y, debajo, una rejilla de categorías con buscador. Las dos llevaban al
        mismo sitio y ninguna enseñaba producto, así que el catálogo se abría
        sin catálogo. Ahora los artículos están delante y las categorías al
        lado, donde sirven para acotar.
      */}
      <section className="page py-10 md:py-14">
        <CatalogBrowser
          categorias={categories.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            productCount: c.productCount,
          }))}
          productos={productos}
        />
      </section>

      <section className="page pb-16 md:pb-20">
        <div className="flex flex-col items-start gap-6 rounded-xl border border-sun-line bg-sun-soft p-8 md:flex-row md:items-center md:justify-between md:p-10">
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

        <p className="mt-8 text-center text-[14px] text-ink-3">
          {site.claim}.{" "}
          <Link href="/contacto" className="font-semibold text-accent-ink hover:underline">
            Ver datos de contacto
          </Link>
        </p>
      </section>
    </>
  );
}
