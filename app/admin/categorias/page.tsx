import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryList } from "@/components/admin/category-list";
import { listCategories } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriasPage() {
  const categories = await listCategories();

  return (
    <AdminShell
      title="Categorías"
      description="Los artículos se agrupan en categorías. Al borrar una categoría se borran también los artículos que tenga dentro, así que el panel avisa de cuántos son antes de hacerlo."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-14">
        <div className="lg:order-1">
          <h2 className="text-[19px] text-ink">
            {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
          </h2>
          <CategoryList
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              imageUrl: category.image_url,
              productCount: category.productCount,
            }))}
          />
        </div>

        <aside className="lg:order-2">
          <div className="rounded-lg border border-line bg-canvas p-6 lg:sticky lg:top-6">
            <h2 className="text-[19px] text-ink">Nueva categoría</h2>
            <p className="mt-2 text-[14px] text-ink-2">
              Aparece en el catálogo en cuanto la crees.
            </p>
            <div className="mt-6">
              <CategoryForm />
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
