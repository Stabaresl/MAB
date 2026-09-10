import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogBrowser } from "@/components/catalog-browser";
import { getAllProducts, getCategories, getCategoryBySlug, getSettings } from "@/lib/catalog";
import { getCategorySlugs } from "@/lib/supabase/public";
import { claseTono } from "@/lib/tono";
import { site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

type Params = { params: Promise<{ categoria: string }> };

export async function generateStaticParams() {
  // Sin cookies: esto corre en compilación, fuera de cualquier petición.
  const slugs = await getCategorySlugs();
  return slugs.map((slug) => ({ categoria: slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categoria } = await params;
  const category = await getCategoryBySlug(categoria);

  if (!category) return { title: "Categoría no encontrada" };

  return {
    title: category.name,
    description:
      category.description ??
      `${category.name} — materiales de construcción y ferretería de ${site.name}.`,
  };
}

export default async function CategoriaPage({ params }: Params) {
  const { categoria } = await params;
  const category = await getCategoryBySlug(categoria);

  if (!category) notFound();

  // Se cargan todos los artículos, no solo los de esta categoría: el rail de al
  // lado necesita saber cuántos hay en cada una, y cambiar de categoría desde
  // ahí no tiene que esperar a otra consulta.
  const [categories, productos, settings] = await Promise.all([
    getCategories(),
    getAllProducts(),
    getSettings(),
  ]);

  const propios = productos.filter((p) => p.category.slug === category.slug);

  return (
    <>
      {/* La cabecera va del color de la categoría: al llegar desde el rail o
          desde el cinturón de la portada, el mismo tono confirma dónde se ha
          entrado antes de leer el titular. Y se disuelve en el lienzo en vez de
          cortarse con un filete, como el resto de cambios de fondo del sitio. */}
      <section
        className={`${claseTono(category.slug)} bg-[linear-gradient(180deg,var(--tono-fondo)_0%,var(--tono-fondo)_55%,var(--color-canvas)_100%)]`}
      >
        <div className="page py-10 md:py-14">
          <nav aria-label="Ruta" className="spec text-ink-3">
            <Link href="/catalogo" className="hover:text-ink">
              Catálogo
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span className="text-ink-2">{category.name}</span>
          </nav>

          <h1 className="mt-5 text-[clamp(2rem,5.5vw,3.25rem)] leading-tight text-ink">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-5 max-w-[62ch] text-ink-2">{category.description}</p>
          )}
          <p className="spec mt-5 text-[var(--tono-tinta)]">
            {propios.length} {propios.length === 1 ? "artículo" : "artículos"}
          </p>
        </div>
      </section>

      <section className="page py-10 md:py-14">
        {propios.length > 0 ? (
          <CatalogBrowser
            // La clave reinicia búsqueda y filtros al cambiar de categoría: sin
            // ella, un filtro de «ABS» puesto en Rejillas seguía puesto al
            // entrar en Eléctricos y la rejilla aparecía vacía sin explicación.
            key={category.slug}
            categorias={categories.map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              productCount: c.productCount,
            }))}
            productos={productos}
            categoriaActiva={category.slug}
          />
        ) : (
          <div className="card p-10 text-center">
            <p className="text-ink">Todavía no hay artículos publicados en esta categoría.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={whatsappLink(
                  settings.whatsapp_primary,
                  `Hola, quisiera consultar por productos de ${category.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Preguntar por WhatsApp
              </a>
              <Link href="/catalogo" className="btn btn-secondary">
                Ver todo el catálogo
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
