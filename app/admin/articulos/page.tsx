import Link from "next/link";
import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProductTable } from "@/components/admin/product-table";
import { listCategories, listProducts } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Artículos" };

export default async function ArticulosPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);

  return (
    <AdminShell
      title="Artículos"
      description={`${products.length} en total. Desde aquí puedes publicarlos, retirarlos o editarlos.`}
      action={
        <Link href="/admin/articulos/nuevo" className="btn btn-primary">
          + Nuevo artículo
        </Link>
      }
    >
      <ProductTable
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          specs: product.specs,
          imageUrl: product.image_url,
          isPublished: product.is_published,
          isFeatured: product.is_featured,
          categoryName: product.category?.name ?? "Sin categoría",
          categorySlug: product.category?.slug ?? "",
        }))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </AdminShell>
  );
}
