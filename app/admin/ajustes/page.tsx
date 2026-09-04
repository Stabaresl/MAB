import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ajustes" };

export default async function AjustesPage() {
  const settings = await getSettings();

  return (
    <AdminShell
      title="Ajustes"
      description="Datos de contacto del sitio. Al guardarlos cambian de inmediato en el pie de página, en la página de contacto y en el botón de WhatsApp de cada artículo."
    >
      <SettingsForm settings={settings} />
    </AdminShell>
  );
}
