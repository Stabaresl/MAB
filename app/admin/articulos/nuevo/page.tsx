import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Nuevo artículo" };

export default async function NuevoArticuloPage() {
  const categories = await listCategories();

  return (
    <AdminShell
      title="Nuevo artículo"
      description="Se publica en el sitio en cuanto lo guardes, salvo que desmarques la casilla de publicado."
    >
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </AdminShell>
  );
}
