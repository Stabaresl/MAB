import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ClientForm } from "@/components/admin/client-form";
import { getClientRow } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditarClientePage({ params }: Params) {
  const { id } = await params;
  const cliente = await getClientRow(id);

  if (!cliente) notFound();

  return (
    <AdminShell
      title={cliente.name}
      description="Cambia el nombre o sustituye el logotipo. El carrusel de la portada se actualiza al guardar."
    >
      <div className="max-w-[520px]">
        <ClientForm cliente={cliente} />
      </div>
    </AdminShell>
  );
}
