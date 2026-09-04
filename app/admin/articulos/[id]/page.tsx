import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductForm } from "@/components/admin/product-form";
import { getProduct, listCategories } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditarArticuloPage({ params }: Params) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), listCategories()]);

  if (!product) notFound();

  return (
    <AdminShell
      title={product.name}
      description={
        product.is_published
          ? "Publicado. Los cambios se ven en el sitio al guardar."
          : "Sin publicar. No aparece en el sitio hasta que marques la casilla."
      }
      action={
        product.is_published ? (
          <Link
            href={`/producto/${product.slug}`}
            target="_blank"
            className="btn btn-secondary"
          >
            Ver en el sitio ↗
          </Link>
        ) : undefined
      }
    >
      <ProductForm
        product={product}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />

      <section className="mt-16 max-w-[720px] border-t border-line pt-8">
        <h2 className="text-[19px] text-ink">Eliminar este artículo</h2>
        <p className="mt-2 text-ink-2">
          Se borra el artículo y su imagen. No se puede deshacer. Si solo quieres retirarlo del
          sitio, desmarca la casilla de publicado y guarda.
        </p>
        <div className="mt-5">
          <DeleteProductButton id={product.id} name={product.name} />
        </div>
      </section>
    </AdminShell>
  );
}
