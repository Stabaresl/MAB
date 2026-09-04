import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import {
  getCategoryBySlug,
  getProductsByCategory,
  getSettings,
} from "@/lib/catalog";
import { getCategorySlugs } from "@/lib/supabase/public";
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

  const [products, settings] = await Promise.all([
    getProductsByCategory(category.id),
    getSettings(),
  ]);

  return (
    <div className="page py-14 md:py-20">
      <nav aria-label="Ruta" className="spec text-ink-subtle">
        <Link href="/catalogo" className="hover:text-ink">
          Catálogo
        </Link>
        <span aria-hidden="true" className="px-2">
          /
        </span>
        <span className="text-ink-muted">{category.name}</span>
      </nav>

      <header className="mt-6 border-b border-hairline pb-8">
        <h1 className="text-[clamp(2rem,5.5vw,3.25rem)] leading-tight text-ink">{category.name}</h1>
        {category.description && (
          <p className="mt-5 max-w-[62ch] text-ink-muted">{category.description}</p>
        )}
        <p className="spec mt-5 text-ink-subtle">
          {products.length} {products.length === 1 ? "artículo" : "artículos"}
        </p>
      </header>

      {products.length > 0 ? (
        <ul className="mt-10 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-lg border border-hairline bg-surface-1 p-10 text-center">
          <p className="text-ink">Todavía no hay artículos publicados en esta categoría.</p>
          <a
            href={whatsappLink(
              settings.whatsapp_primary,
              `Hola, quisiera consultar por productos de ${category.name}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-6"
          >
            Preguntar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
