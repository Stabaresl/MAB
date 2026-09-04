import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel MAB" },
  robots: { index: false, follow: false },
};

/**
 * Contenedor del panel.
 *
 * No monta cabecera ni pie: cada pantalla decide su estructura. El acceso lo
 * decide el middleware antes de llegar aquí, y las políticas RLS lo confirman
 * en cada consulta.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-canvas">{children}</div>;
}
