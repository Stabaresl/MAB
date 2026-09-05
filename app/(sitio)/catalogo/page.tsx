import type { Metadata } from "next";
import Link from "next/link";

import { CategoryBelt } from "@/components/category-belt";
import { CategoryGrid } from "@/components/category-grid";
import { Reveal } from "@/components/motion/reveal";
import { getCategories, getSettings } from "@/lib/catalog";
import { site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Materiales de construcción y ferretería por categoría: zona húmeda, lavaplatos, duchas y monomando, rejillas, eléctricos, cajas de gas, baños, seguridad y cocina.",
};

export default async function CatalogoPage() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  const totalArticulos = categories.reduce((suma, c) => suma + c.productCount, 0);

  return (
    <>
      <section className="border-b border-line bg-paper">
        <div className="page py-14 md:py-20">
          <Reveal>
            <p className="label text-accent-ink">Catálogo</p>
            <h1 className="mt-3 max-w-[14ch] text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.06] text-ink">
              Todo para tu proyecto
            </h1>
            <p className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-ink-2">
              {categories.length} categorías y {totalArticulos} artículos publicados. Trabajamos
              con más referencias de las que aparecen aquí: si no ves lo que buscas, escríbenos y
              te decimos si la tenemos.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Cinturón: la vista rápida, para recorrer las categorías de un vistazo */}
      <section className="py-14 md:py-16">
        <div className="page">
          <Reveal>
            <h2 className="text-[clamp(1.5rem,3.4vw,2rem)] leading-tight text-ink">
              Recorre las categorías
            </h2>
          </Reveal>
        </div>
        <div className="mt-8">
          <CategoryBelt
            categorias={categories.map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              description: c.description,
              imageUrl: c.image_url,
              productCount: c.productCount,
            }))}
          />
        </div>
      </section>

      {/* Rejilla con buscador: la vista completa, para ir directo a una */}
      <section className="border-t border-line bg-paper">
        <div className="page py-14 md:py-20">
          <Reveal>
            <h2 className="text-[clamp(1.5rem,3.4vw,2rem)] leading-tight text-ink">
              O busca la que necesitas
            </h2>
          </Reveal>
          <div className="mt-8">
            <CategoryGrid
              categorias={categories.map((c) => ({
                id: c.id,
                slug: c.slug,
                name: c.name,
                description: c.description,
                imageUrl: c.image_url,
                productCount: c.productCount,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="page py-16 md:py-20">
        <div className="card flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
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
