import type { Metadata } from "next";

import { getSettings } from "@/lib/catalog";
import { enquiryBody, formatPhone, gmailLink, site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos por WhatsApp o correo con las especificaciones de tu proyecto y te cotizamos. Distribuciones M.A.B, Manizales, con entrega en todo el país.",
};

export default async function ContactoPage() {
  const settings = await getSettings();

  const mensaje = "Hola, quisiera cotizar materiales para mi proyecto.";

  return (
    <div className="page py-14 md:py-20">
      <header className="border-b border-line pb-10">
        <p className="label text-accent-ink">Contacto</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2rem,6vw,3.75rem)] leading-[1.05] text-ink">
          Cuéntanos qué necesita tu obra
        </h1>
        <p className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-ink-2">
          Envíanos las especificaciones del proyecto — referencias, medidas y cantidades — y te
          cotizamos al mejor precio del mercado. El pedido llega directo a tu obra, en cualquier
          ciudad del país.
        </p>
      </header>

      <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-2">
        <section className="bg-canvas p-8 md:p-10">
          <h2 className="label text-ink-3">WhatsApp</h2>
          <p className="mt-4 text-ink-2">
            La vía más rápida. Escríbenos y respondemos con precio y disponibilidad.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <a
              href={whatsappLink(settings.whatsapp_primary, mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {formatPhone(settings.whatsapp_primary)}
            </a>
            {settings.whatsapp_secondary && (
              <a
                href={whatsappLink(settings.whatsapp_secondary, mensaje)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {formatPhone(settings.whatsapp_secondary)}
              </a>
            )}
          </div>
        </section>

        <section className="bg-canvas p-8 md:p-10">
          <h2 className="label text-ink-3">Correo y sede</h2>

          <dl className="mt-6 flex flex-col gap-6">
            <div>
              <dt className="spec text-ink-3">Correo electrónico</dt>
              <dd className="mt-1">
                <a
                  href={gmailLink(
                    settings.email,
                    "Solicitud de cotización",
                    enquiryBody(),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words text-[17px] text-ink transition-colors hover:text-accent-ink"
                >
                  {settings.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="spec text-ink-3">Dirección</dt>
              <dd className="mt-1 text-[17px] text-ink">
                {settings.address}
                <br />
                {settings.city}, {site.contact.country}
              </dd>
            </div>

            <div>
              <dt className="spec text-ink-3">NIT</dt>
              <dd className="spec mt-1 text-ink">{settings.nit}</dd>
            </div>

            <div>
              <dt className="spec text-ink-3">Cobertura</dt>
              <dd className="mt-1 text-[17px] text-ink">
                Todo el territorio nacional — ciudad, municipio o vereda
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
