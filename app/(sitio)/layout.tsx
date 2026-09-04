import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Envoltura del sitio público: cabecera y pie en todas las páginas salvo el
 * panel, que tiene su propia estructura en /admin.
 */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-ink-on-accent"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
