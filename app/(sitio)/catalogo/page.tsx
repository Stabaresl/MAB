import type { Metadata } from "next";

import { CatalogBrowser } from "@/components/catalog-browser";
import { getAllProducts, getCategories } from "@/lib/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Materiales de construcción y ferretería: zona húmeda, lavaplatos, duchas y monomando, rejillas, eléctricos, cajas de gas, baños, seguridad y cocina.",
};

export default async function CatalogoPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);

  return (
    <div className="page py-14 md:py-20">
      <header className="border-b border-hairline pb-8">
        <p className="label text-accent-text">Catálogo</p>
        <h1 className="mt-3 text-[clamp(2rem,5.5vw,3.25rem)] leading-tight text-ink">
          Todo el catálogo
        </h1>
        <p className="mt-5 max-w-[58ch] text-ink-muted">
          {products.length} {products.length === 1 ? "artículo publicado" : "artículos publicados"} en{" "}
          {categories.length} categorías. Trabajamos con más referencias de las que aparecen aquí:
          si no ves lo que buscas, escríbenos y te decimos si la tenemos.
        </p>
      </header>

      <div className="mt-10">
        <CatalogBrowser
          products={products}
          categories={categories.map((category) => ({
            id: category.id,
            slug: category.slug,
            name: category.name,
            productCount: category.productCount,
          }))}
        />
      </div>
    </div>
  );
}
