import Image from "next/image";
import Link from "next/link";

import { MobileNav } from "@/components/mobile-nav";
import { getCategories, getSettings } from "@/lib/catalog";
import { formatPhone, site, whatsappLink } from "@/lib/site";

export async function SiteHeader() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  const links = [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/contacto", label: "Contacto" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur">
      <div className="page flex h-16 items-center justify-between gap-4 md:h-20">
        {/*
          El lockup completo trae "DISTRIBUCIONES" incrustado en el trazado, y a
          la altura de una cabecera esa línea queda en cuatro píxeles ilegibles.
          Aquí se usa solo el monograma y el nombre va en texto real: se lee a
          cualquier tamaño y lo puede leer un lector de pantalla.
        */}
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${site.name} — inicio`}>
          <Image
            src="/marca/mab-monograma.webp"
            alt=""
            width={196}
            height={262}
            priority
            className="h-8 w-auto md:h-10"
          />
          <span className="label hidden leading-tight text-ink min-[420px]:block">
            Distribuciones
            <span className="block text-accent-text">M.A.B</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink(settings.whatsapp_primary, "Hola, quisiera una cotización.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary hidden sm:inline-flex"
          >
            Cotizar por WhatsApp
          </a>
          <a
            href={`tel:+57${settings.whatsapp_primary}`}
            className="spec flex h-11 items-center rounded-md px-2 text-accent-text hover:bg-surface-2 hover:text-accent sm:hidden"
          >
            {formatPhone(settings.whatsapp_primary)}
          </a>
          <MobileNav links={links} categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
        </div>
      </div>
    </header>
  );
}
