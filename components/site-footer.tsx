import Image from "next/image";
import Link from "next/link";

import { Onda } from "@/components/onda";
import { SealbyteMark } from "@/components/sealbyte-mark";
import { getCategories, getSettings } from "@/lib/catalog";
import { enquiryBody, formatPhone, gmailLink, site, whatsappLink } from "@/lib/site";

export async function SiteFooter() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-paper">
      {/* El pie entra con la misma onda que el resto de cambios de fondo. Con un
          filete recto era la única costura recta de la página y se notaba. */}
      <Onda posicion="arriba" className="text-canvas" />

      {/* Cierre comercial antes de los datos: es lo último que se lee. */}
      <div className="page pb-16 pt-10 md:pb-20 md:pt-24">
        {/*
          El envoltorio no recorta, para que el personaje pueda sobresalir por
          arriba: ese desborde es justo lo que hace que se lea como alguien
          apoyado en la tarjeta y no como un recorte pegado dentro.
        */}
        <div className="relative">
          <div className="relative z-10 rounded-xl border border-warm-line bg-warm-2 px-7 py-10 md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="label text-accent-ink">
                Distribuimos calidad, construimos confianza
              </p>
              <h2 className="mt-4 max-w-[20ch] text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.15] text-ink">
                Te mejoramos el precio de cualquier cotización
              </h2>
            </div>
            {/* Las dos vías por las que MAB cierra una venta, una al lado de
                la otra. Los datos de contacto ya están dos filas más abajo, así
                que ese tercer botón solo restaba sitio. */}
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
                <IconoWhatsapp />
                Escribir por WhatsApp
              </a>
              <a
                href={gmailLink(settings.email, "Solicitud de cotización", enquiryBody())}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <IconoGmail />
                Escribir por Gmail
              </a>
            </div>
          </div>
          </div>

          {/*
            El personaje se apoya en la tarjeta de verdad: va DETRÁS de ella, y
            el filo superior le cruza a la altura del codo. De ahí para abajo lo
            tapa la tarjeta, así que el codo descansa sobre el canto en vez de
            quedar en el aire — que era lo que pasaba cuando estaba delante y de
            pie sobre el filo inferior: nada sostenía el brazo.

            Va volteado para que el brazo doblado, el de la mano en la cadera,
            sea el que cae del lado de la tarjeta.

            El 154% de alto no es un número redondo por casualidad: el codo está
            al 65% de la figura contando desde los pies —medido sobre el propio
            archivo, no a ojo—, así que con los pies en el filo inferior hace
            falta esa altura justa para que el codo caiga en el filo superior.
            Con la estimación anterior el brazo quedaba medio palmo por encima,
            sin nada debajo.

            Es decoración, así que no recibe el puntero ni entra en el árbol de
            accesibilidad, y solo aparece a partir de 1024px: por debajo la
            tarjeta no tiene ancho de sobra y se comería el texto.
          */}
          <Image
            src="/marca/personaje.webp"
            alt=""
            aria-hidden="true"
            width={900}
            height={2239}
            sizes="260px"
            className="pointer-events-none absolute bottom-0 right-6 z-0 hidden w-auto origin-bottom -scale-x-100 lg:block lg:h-[154%] xl:right-16"
          />
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
              className="-my-1.5 inline-flex items-center gap-1.5 rounded-md py-1.5 text-[14px] text-ink-3 transition-colors hover:text-accent-ink"
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

/**
 * Marcas de WhatsApp y Gmail.
 *
 * Son las dos únicas marcas ajenas del sitio y van dibujadas a un solo trazo,
 * en el color del botón que las lleva, para que no metan un tercer y un cuarto
 * color en la paleta. Decorativas: el texto del botón ya dice a dónde lleva.
 */
function IconoWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0012.04 2zm0 18.15h-.01a8.23 8.23 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 015.83 2.42 8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

function IconoGmail() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3 7.5l7.6 5.4a2.4 2.4 0 002.8 0L21 7.5" />
    </svg>
  );
}
