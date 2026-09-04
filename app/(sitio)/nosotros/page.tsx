import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getSettings } from "@/lib/catalog";
import { site, whatsappLink } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Distribuciones M.A.B lleva más de 15 años distribuyendo materiales de construcción y ferretería a constructoras en todo el territorio nacional.",
};

export default async function NosotrosPage() {
  const settings = await getSettings();

  return (
    <div className="page py-14 md:py-20">
      <header className="border-b border-line pb-10">
        <p className="label text-accent-ink">Quiénes somos</p>
        <h1 className="mt-3 max-w-[16ch] text-[clamp(2rem,6vw,3.75rem)] leading-[1.05] text-ink">
          {site.yearsInMarket} años de excelencia
        </h1>
        <p className="mt-6 max-w-[62ch] text-[17px] leading-relaxed text-ink-2">
          Desde nuestra fundación, Distribuciones M.A.B ha sido un referente en la distribución
          de materiales de construcción y ferretería en todo el territorio nacional. Ofrecemos
          soluciones integrales que garantizan la precisión técnica y la calidad en cada
          proyecto.
        </p>
      </header>

      <section className="grid gap-px overflow-hidden rounded-lg border border-line bg-line mt-12 md:grid-cols-2">
        <div className="bg-canvas p-8">
          <h2 className="label text-accent-ink">Misión</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{site.mission}</p>
        </div>
        <div className="bg-canvas p-8">
          <h2 className="label text-accent-ink">Visión</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{site.vision}</p>
        </div>
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <p className="label text-accent-ink">Calidad certificada</p>
          <h2 className="mt-3 text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">
            Piezas que cumplen la norma
          </h2>
          <p className="mt-6 max-w-[58ch] text-ink-2">
            La calidad de los plásticos ABS y de los cromados que usamos en rejillas,
            extractores, válvulas, tapas de registro y tragantes cumple con todas las normas
            exigidas. Nuestros diseños para el área de ventilación de gas cumplen las
            especificaciones y medidas que exige la empresa de Gas Natural en todo el país.
          </p>
        </div>

        <figure className="overflow-hidden rounded-lg border border-line">
          <Image
            src="/ambientes/ducha-lluvia.webp"
            alt="Ducha tipo lluvia instalada en una zona húmeda terminada"
            width={1024}
            height={512}
            className="h-full w-full object-cover"
          />
        </figure>
      </section>

      <section className="mt-20 border-t border-line pt-12">
        <p className="label text-accent-ink">Logística y entrega</p>
        <h2 className="mt-3 max-w-[22ch] text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">
          Llevamos el material hasta la obra
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <p className="max-w-[62ch] text-ink-2">
            Entregamos tus materiales directamente en la obra, en el tiempo acordado y en
            cualquier parte de Colombia, sea ciudad, municipio o vereda. Con una red logística
            confiable garantizamos que lleguen en perfectas condiciones para tu proyecto.
          </p>
          <figure className="overflow-hidden rounded-lg border border-line">
            <Image
              src="/marca/obra.webp"
              alt="Edificio en construcción con grúa torre"
              width={1400}
              height={940}
              className="h-full w-full object-cover"
            />
          </figure>
        </div>
      </section>

      <section className="mt-20 border-t border-line pt-12">
        <p className="label text-accent-ink">Referencias</p>
        <h2 className="mt-3 text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">
          Algunos de nuestros clientes
        </h2>

        <ul className="mt-8 grid gap-x-8 gap-y-px border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {site.clients.map((client) => (
            <li
              key={client}
              className="flex items-center gap-4 border-b border-line py-4 text-ink-2"
            >
              <span aria-hidden="true" className="h-4 w-px shrink-0 bg-accent" />
              {client}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20">
        <div className="rounded-lg border border-line bg-brand p-8 md:p-12">
          <h2 className="max-w-[20ch] text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">
            Te mejoramos el precio de cualquier cotización
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
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
            <Link href="/catalogo" className="btn btn-secondary">
              Ver el catálogo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
