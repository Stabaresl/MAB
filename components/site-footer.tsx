import Image from "next/image";
import Link from "next/link";

import { SealbyteMark } from "@/components/sealbyte-mark";
import { getCategories, getSettings } from "@/lib/catalog";
import { enquiryBody, formatPhone, gmailLink, site, whatsappLink } from "@/lib/site";

export async function SiteFooter() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-28 border-t border-line bg-paper">
      {/* Cierre comercial antes de los datos: es lo último que se lee. */}
      <div className="page py-16 md:py-20">
        <div className="rounded-xl border border-warm-line bg-warm-2 px-7 py-10 md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="label text-accent-ink">
                Distribuimos calidad, construimos confianza
              </p>
              <h2 className="mt-4 max-w-[20ch] text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.15] text-ink">
                Te mejoramos el precio de cualquier cotización
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href={whatsappLink(
                  settings.whatsapp_primary,
                  "Hola, quisiera cotizar materiales para mi proyecto.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Escribir por WhatsApp
              </a>
              <Link href="/contacto" className="btn btn-secondary">
                Ver datos de contacto
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page grid gap-12 border-t border-line py-14 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Image
            src="/marca/mab-logo-color.webp"
            alt={site.name}
            width={433}
            height={470}
            sizes="80px"
            className="h-16 w-auto"
          />
          <p className="mt-5 max-w-[34ch] text-ink-3">{site.tagline}.</p>
          <p className="spec mt-5 text-ink-3">NIT {settings.nit}</p>
          <p className="mt-1 text-ink-2">
            {settings.address}
            <br />
            {settings.city}, {site.contact.country}
          </p>
        </div>

        <div>
          <h2 className="label text-ink-3">Catálogo</h2>
          <ul className="mt-2 flex flex-col">
            {categories.slice(0, 7).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/catalogo/${category.slug}`}
                  className="-mx-2 block rounded-md px-2 py-2 text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/catalogo"
                className="-mx-2 block rounded-md px-2 py-2 font-semibold text-accent-ink transition-colors hover:bg-canvas"
              >
                Ver todo el catálogo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="label text-ink-3">Contacto</h2>
          <ul className="mt-2 flex flex-col">
            <li>
              <a
                href={whatsappLink(settings.whatsapp_primary, "Hola, quisiera una cotización.")}
                target="_blank"
                rel="noopener noreferrer"
                className="spec -mx-2 block rounded-md px-2 py-2 text-ink transition-colors hover:bg-canvas hover:text-accent-ink"
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
                  className="spec -mx-2 block rounded-md px-2 py-2 text-ink transition-colors hover:bg-canvas hover:text-accent-ink"
                >
                  {formatPhone(settings.whatsapp_secondary)}
                </a>
              </li>
            )}
            <li>
              <a
                href={gmailLink(settings.email, "Solicitud de cotización", enquiryBody())}
                target="_blank"
                rel="noopener noreferrer"
                className="-mx-2 block break-words rounded-md px-2 py-2 text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
              >
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="page flex flex-col items-start justify-between gap-5 py-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="text-[14px] text-ink-3">
              © {year} {site.name}. Todos los derechos reservados.
            </p>

            {/*
              Entrada al panel. Va aquí, discreta, porque el administrador es
              una sola persona y los visitantes no tienen nada que hacer dentro;
              pero tenerla a mano evita que MAB dependa de recordar una dirección
              escrita a mano. Esconderla no da seguridad —esa la ponen la sesión
              y las políticas de la base—, así que tampoco se disfraza.
            */}
            <Link
              href="/admin"
              rel="nofollow"
              className="inline-flex items-center gap-1.5 text-[14px] text-ink-3 transition-colors hover:text-accent-ink"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="7" width="10" height="6.5" rx="1.5" />
                <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
              </svg>
              Entrar al panel
            </Link>
          </div>

          <a
            href={site.developer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md px-2 py-1 text-ink-3 transition-colors hover:text-brand"
          >
            <span className="label">Desarrollado por</span>
            <SealbyteMark className="h-9 w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}
