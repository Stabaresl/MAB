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
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
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
          <a
            href={whatsappLink(settings.whatsapp_primary, "Hola, quisiera una cotización.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary hidden md:inline-flex"
          >
            Pedir cotización
          </a>
          <MobileNav
            links={links}
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            whatsapp={whatsappLink(settings.whatsapp_primary, "Hola, quisiera una cotización.")}
          />
        </div>
      </div>
    </header>
  );
}
