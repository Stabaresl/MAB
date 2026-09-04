import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { getDashboardCounts, listProducts } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [counts, products] = await Promise.all([getDashboardCounts(), listProducts()]);
  const recientes = products.slice(0, 5);

  const tarjetas = [
    { label: "Artículos publicados", value: counts.published, href: "/admin/articulos" },
    { label: "Sin publicar", value: counts.drafts, href: "/admin/articulos" },
    { label: "Categorías", value: counts.categories, href: "/admin/categorias" },
    { label: "Categorías vacías", value: counts.emptyCategories, href: "/admin/categorias" },
  ];

  return (
    <AdminShell
      title="Resumen"
      description="Estado del catálogo y accesos rápidos."
      action={
        <Link href="/admin/articulos/nuevo" className="btn btn-primary">
          + Nuevo artículo
        </Link>
      }
    >
      <dl className="grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((tarjeta) => (
          <Link key={tarjeta.label} href={tarjeta.href} className="bg-surface-1 p-6 hover:bg-surface-2">
            <dt className="label text-ink-subtle">{tarjeta.label}</dt>
            <dd className="mt-3 font-display text-4xl font-extrabold text-ink">{tarjeta.value}</dd>
          </Link>
        ))}
      </dl>

      {counts.drafts > 0 && (
        <p className="mt-6 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-[14px] text-ink">
          Tienes {counts.drafts} {counts.drafts === 1 ? "artículo" : "artículos"} sin publicar. No
          {counts.drafts === 1 ? " aparece" : " aparecen"} en el sitio hasta que lo marques como
          publicado.
        </p>
      )}

      <section className="mt-12">
        <div className="flex items-end justify-between border-b border-hairline pb-4">
          <h2 className="text-[21px] text-ink">Últimos artículos</h2>
          <Link href="/admin/articulos" className="text-[14px] text-accent-text hover:text-accent">
            Ver todos →
          </Link>
        </div>

        {recientes.length === 0 ? (
          <div className="mt-6 rounded-lg border border-hairline bg-surface-1 p-10 text-center">
            <p className="text-ink">Todavía no hay artículos.</p>
            <p className="mt-2 text-ink-muted">
              Crea primero una categoría y después añade el primer artículo.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/admin/categorias" className="btn btn-secondary">
                Crear una categoría
              </Link>
              <Link href="/admin/articulos/nuevo" className="btn btn-primary">
                + Nuevo artículo
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-2">
            {recientes.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 border-b border-hairline py-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/articulos/${product.id}`}
                    className="text-ink hover:text-accent-text"
                  >
                    {product.name}
                  </Link>
                  <p className="spec mt-1 text-ink-subtle">
                    {product.category?.name ?? "Sin categoría"}
                  </p>
                </div>
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
    </AdminShell>
  );
}
