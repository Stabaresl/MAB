import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { ClientForm } from "@/components/admin/client-form";
import { ClientList } from "@/components/admin/client-list";
import { listClients } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientesPage() {
  const clientes = await listClients();

  return (
    <AdminShell
      title="Clientes"
      description="Las empresas del carrusel de referencias de la portada. Puedes añadir, quitar, reordenar y subir el logotipo de cada una."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-14">
        <div className="lg:order-1">
          <h2 className="text-[19px] text-ink">
            {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
          </h2>
          <ClientList clientes={clientes} />
        </div>

        <aside className="lg:order-2">
          <div className="rounded-lg border border-line bg-canvas p-6 lg:sticky lg:top-6">
            <h2 className="text-[19px] text-ink">Nuevo cliente</h2>
            <p className="mt-2 text-[14px] text-ink-2">
              Aparece en la portada en cuanto lo añadas.
            </p>
            <div className="mt-6">
              <ClientForm />
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
