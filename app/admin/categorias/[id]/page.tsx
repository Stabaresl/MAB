import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryForm } from "@/components/admin/category-form";
import { getCategory, listProducts } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditarCategoriaPage({ params }: Params) {
  const { id } = await params;
  const [category, products] = await Promise.all([getCategory(id), listProducts()]);

  if (!category) notFound();

  const enCategoria = products.filter((product) => product.category_id === category.id);

  return (
    <AdminShell
      title={category.name}
      description={`Dirección en el sitio: /catalogo/${category.slug}`}
      action={
        <Link href={`/catalogo/${category.slug}`} target="_blank" className="btn btn-secondary">
          Ver en el sitio ↗
        </Link>
      }
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:gap-16">
        <div>
          <CategoryForm category={category} />
        </div>

        <section>
          <h2 className="text-[19px] text-ink">
            {enCategoria.length} {enCategoria.length === 1 ? "artículo" : "artículos"} en esta
            categoría
          </h2>

          {enCategoria.length === 0 ? (
            <p className="mt-4 rounded-lg border border-hairline bg-surface-1 p-6 text-ink-muted">
              Esta categoría está vacía, así que se puede borrar.
            </p>
          ) : (
            <ul className="mt-4 overflow-hidden rounded-lg border border-hairline">
              {enCategoria.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-4 border-b border-hairline bg-surface-1 p-4 last:border-b-0"
                >
                  <Link
                    href={`/admin/articulos/${product.id}`}
                    className="min-w-0 truncate text-ink hover:text-accent-text"
                  >
                    {product.name}
                  </Link>
                  <span
                    className={`spec shrink-0 rounded-sm px-2 py-1 ${
                      product.is_published
                        ? "bg-success/15 text-success"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {product.is_published ? "Publicado" : "Borrador"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
