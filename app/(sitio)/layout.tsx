import { FloatingQuote } from "@/components/floating-quote";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/catalog";
import { enquiryBody, gmailLink, site, whatsappLink } from "@/lib/site";

/**
 * Envoltura del sitio público: cabecera, pie y el botón de cotización flotante
 * en todas las páginas salvo el panel, que tiene su propia estructura.
 *
 * Los datos de contacto se leen aquí y no dentro del botón porque el botón es
 * un componente de cliente: si consultara él la base de datos, la clave y la
 * URL de Supabase tendrían que viajar al navegador. Así el layout —que corre en
 * el servidor— le pasa dos cadenas ya montadas y el cliente no sabe de dónde
 * salieron.
 */
export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <FloatingQuote
        whatsapp={whatsappLink(
          settings.whatsapp_primary,
          `Hola, quisiera cotizar materiales para mi proyecto con ${site.shortName}.`,
        )}
        gmail={gmailLink(settings.email, "Solicitud de cotización", enquiryBody())}
      />
    </div>
  );
}
