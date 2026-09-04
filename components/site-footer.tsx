import Image from "next/image";
import Link from "next/link";

import { SealbyteMark } from "@/components/sealbyte-mark";
import { getCategories, getSettings } from "@/lib/catalog";
import { formatPhone, site, whatsappLink } from "@/lib/site";

export async function SiteFooter() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-hairline bg-brand-navy">
      <div className="page grid gap-12 py-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] md:py-20">
        <div>
          <Image
            src="/marca/mab-completo.webp"
            alt={site.name}
            width={456}
            height={438}
            className="h-28 w-auto"
          />
          <p className="spec mt-6 text-ink-subtle">NIT {settings.nit}</p>
          <p className="mt-1 text-ink-muted">
            {settings.address}
            <br />
            {settings.city}, {site.contact.country}
          </p>
        </div>

        <div>
          <h2 className="label text-ink-subtle">Catálogo</h2>
          <ul className="mt-2 flex flex-col">
            {categories.slice(0, 7).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/catalogo/${category.slug}`}
                  className="-mx-2 block rounded-md px-2 py-2 text-ink-muted transition-colors hover:bg-surface-1 hover:text-ink"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/catalogo" className="-mx-2 block rounded-md px-2 py-2 text-accent-text transition-colors hover:bg-surface-1 hover:text-accent">
                Ver todo el catálogo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="label text-ink-subtle">Contacto</h2>
          <ul className="mt-2 flex flex-col">
            <li>
              <a
                href={whatsappLink(settings.whatsapp_primary, "Hola, quisiera una cotización.")}
                target="_blank"
                rel="noopener noreferrer"
                className="spec -mx-2 block rounded-md px-2 py-2 text-ink transition-colors hover:bg-surface-1 hover:text-accent-text"
              >
                {formatPhone(settings.whatsapp_primary)}
              </a>
            </li>
            {settings.whatsapp_secondary && (
              <li>
                <a
                  href={whatsappLink(settings.whatsapp_secondary, "Hola, quisiera una cotización.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spec -mx-2 block rounded-md px-2 py-2 text-ink transition-colors hover:bg-surface-1 hover:text-accent-text"
                >
                  {formatPhone(settings.whatsapp_secondary)}
                </a>
              </li>
            )}
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="-mx-2 block break-words rounded-md px-2 py-2 text-ink-muted transition-colors hover:bg-surface-1 hover:text-ink"
              >
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="page flex flex-col items-start justify-between gap-6 py-6 sm:flex-row sm:items-center">
          <p className="text-ink-subtle">
            © {year} {site.name}. Todos los derechos reservados.
          </p>

          <a
            href={site.developer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 text-ink-subtle transition-colors hover:text-ink"
          >
            <span className="label">Desarrollado por</span>
            <SealbyteMark className="h-9 w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}
