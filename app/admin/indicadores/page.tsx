import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatForm } from "@/components/admin/stat-form";
import { StatList } from "@/components/admin/stat-list";
import { listStats } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Indicadores" };

export default async function IndicadoresPage() {
  const indicadores = await listStats();

  return (
    <AdminShell
      title="Indicadores"
      description="Las cifras que suben en la portada. Unas las escribes tú; otras las cuenta el sitio solo, así que nunca se quedan desfasadas."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-14">
        <div className="lg:order-1">
          <h2 className="text-[19px] text-ink">
            {indicadores.length} {indicadores.length === 1 ? "contador" : "contadores"}
          </h2>
          <StatList indicadores={indicadores} />

          <p className="mt-6 max-w-[62ch] rounded-lg border border-sun-line bg-sun-soft p-5 text-[14px] leading-relaxed text-ink-2">
            Publica solo cifras que puedas sostener. Un número inventado en la portada es de las
            pocas cosas que un cliente puede comprobar y que, si no cuadra, cuesta la confianza de
            toda la página.
          </p>
        </div>

        <aside className="lg:order-2">
          <div className="rounded-lg border border-line bg-canvas p-6 lg:sticky lg:top-6">
            <h2 className="text-[19px] text-ink">Nuevo contador</h2>
            <p className="mt-2 text-[14px] text-ink-2">
              Entra al final de la fila; puedes moverlo después.
            </p>
            <div className="mt-6">
              <StatForm />
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
