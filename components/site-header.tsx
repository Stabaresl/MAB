import Image from "next/image";
import Link from "next/link";

import { MobileNav } from "@/components/mobile-nav";
import { QuoteMenu } from "@/components/quote-menu";
import { getCategories, getSettings } from "@/lib/catalog";
import { enquiryBody, formatPhone, gmailLink, site, whatsappLink } from "@/lib/site";

export async function SiteHeader() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  const links = [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/contacto", label: "Contacto" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line">
      {/*
        El velo translúcido va en su propia capa y no en el <header>.

        No es un capricho: `backdrop-filter` convierte al elemento que lo lleva
        en el bloque contenedor de sus descendientes posicionados con `fixed`.
        Con el desenfoque en el <header>, el panel del menú móvil —que es
        `fixed inset-x-0 top-18 bottom-0`— se resolvía contra los 72px de alto
        de la cabecera en vez de contra la pantalla, y salía de 1px de alto: el
        menú se abría y no se veía nada. Aquí el velo es hermano del panel, no
        su ancestro, así que el `fixed` vuelve a medir contra la ventana.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-canvas/85 backdrop-blur-md"
      />
      <div className="page flex h-18 items-center justify-between gap-4 py-3 md:h-22">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${site.name} — inicio`}
        >
          <Image
            src="/marca/mab-logo-color.webp"
            alt={site.name}
            width={433}
            height={470}
            priority
            sizes="60px"
            className="h-11 w-auto md:h-14"
          />
          <span className="sr-only">{site.name}</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-md px-3.5 py-2 font-medium text-ink-2 transition-colors hover:bg-paper hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:+57${settings.whatsapp_primary}`}
            className="spec hidden h-11 items-center rounded-md px-2 text-ink-2 transition-colors hover:bg-paper hover:text-ink min-[420px]:flex md:hidden"
          >
            {formatPhone(settings.whatsapp_primary)}
          </a>
          <QuoteMenu
            className="hidden md:block"
            whatsapp={whatsappLink(settings.whatsapp_primary, "Hola, quisiera una cotización.")}
            gmail={gmailLink(settings.email, "Solicitud de cotización", enquiryBody())}
          />
          <MobileNav
            links={links}
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            whatsapp={whatsappLink(settings.whatsapp_primary, "Hola, quisiera una cotización.")}
            gmail={gmailLink(settings.email, "Solicitud de cotización", enquiryBody())}
          />
        </div>
      </div>
    </header>
  );
}
