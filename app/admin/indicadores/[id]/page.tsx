import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatForm } from "@/components/admin/stat-form";
import { getStat } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditarIndicadorPage({ params }: Params) {
  const { id } = await params;
  const indicador = await getStat(id);

  if (!indicador) notFound();

  return (
    <AdminShell
      title={indicador.label}
      description="Los cambios se ven en la portada al guardar."
    >
      <div className="max-w-[560px]">
        <StatForm indicador={indicador} />
      </div>
    </AdminShell>
  );
}
