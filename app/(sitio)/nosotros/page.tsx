import type { Metadata } from "next";
import Image from "next/image";

import { ClientWall } from "@/components/client-wall";
import { Reveal } from "@/components/motion/reveal";
import { getClients } from "@/lib/catalog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Distribuciones M.A.B lleva más de 15 años distribuyendo materiales de construcción y ferretería a clientes en todo el territorio nacional.",
};

/**
 * Quiénes somos.
 *
 * La página era un solo contenedor con filetes rectos separando los bloques.
 * Ahora cada bloque es una sección con su lavado, igual que la portada: el
 * color entra y sale por el lienzo, así que se pasa de un tono al siguiente sin
 * ninguna costura. Los filetes de separación sobran cuando el propio fondo
 * marca dónde acaba una cosa y empieza otra.
 */
export default async function NosotrosPage() {
  const clientes = await getClients();

  return (
    <>
      <section className="lavado lavado-frio lavado-sale">
        <div className="page py-14 md:py-20">
          <Reveal>
            <p className="label text-accent-ink">Quiénes somos</p>
            <h1 className="mt-3 max-w-[16ch] text-[clamp(2rem,6vw,3.75rem)] leading-[1.05] text-ink">
              {site.yearsInMarket} años de excelencia
            </h1>
            <p className="mt-6 max-w-[62ch] text-[17px] leading-relaxed text-ink-2">
              Desde nuestra fundación, Distribuciones M.A.B ha sido un referente en la
              distribución de materiales de construcción y ferretería en todo el territorio
              nacional. Ofrecemos soluciones integrales que garantizan la precisión técnica y la
              calidad en cada proyecto.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="page pb-16 md:pb-20">
        <Reveal>
          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
            <div className="bg-sky-soft p-8">
              <h2 className="label text-sky-ink">Misión</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{site.mission}</p>
            </div>
            <div className="bg-sun-soft p-8">
              <h2 className="label text-sun-ink">Visión</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{site.vision}</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="lavado lavado-arena overflow-hidden">
        <div className="page grid gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:gap-16">
          <Reveal direccion="izquierda" className="flex flex-col justify-center">
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
          </Reveal>

          <Reveal direccion="derecha" retraso={0.1} className="lg:h-full">
            <figure className="funde-izq sangra-der aspect-[2/1] h-full overflow-hidden rounded-lg border border-line lg:aspect-auto lg:rounded-none lg:border-0">
              {/* Fotograma del vídeo de portada: 1366px reales. El panel del
                  collage que había antes tiene 512px de ancho de origen —el
                  archivo de 1024 es una ampliación al doble— y a este tamaño se
                  veía blando. Aquí, además, se ven las piezas de las que habla
                  el texto: lavamanos, grifería y sanitario ya instalados. */}
              <Image
                src="/ambientes/piezas-instaladas.webp"
                alt="Lavamanos, grifería y sanitario instalados en una vivienda terminada"
                width={1366}
                height={768}
                sizes="(max-width: 1024px) 92vw, 560px"
                className="h-full w-full object-cover"
              />
            </figure>
          </Reveal>
        </div>
      </section>

      {/* El titular entra en la rejilla, en la misma columna que su párrafo.
          Fuera de ella se quedaba arriba a la izquierda mientras la foto pasaba
          a ese lado, y el bloque se leía partido en dos mitades ajenas. */}
      <section className="lavado lavado-gris overflow-hidden">
        <div className="page grid gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:gap-16">
          <Reveal direccion="derecha" className="flex flex-col justify-center lg:order-2">
            <p className="label text-accent-ink">Logística y entrega</p>
            <h2 className="mt-3 max-w-[22ch] text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">
              Llevamos el material hasta la obra
            </h2>
            <p className="mt-6 max-w-[62ch] text-ink-2">
              Entregamos tus materiales directamente en la obra, en el tiempo acordado y en
              cualquier parte de Colombia, sea ciudad, municipio o vereda. Con una red logística
              confiable garantizamos que lleguen en perfectas condiciones para tu proyecto.
            </p>
          </Reveal>

          <Reveal direccion="izquierda" retraso={0.1} className="lg:order-1 lg:h-full">
            <figure className="funde-der sangra-izq aspect-[3/2] h-full overflow-hidden rounded-lg border border-line lg:aspect-auto lg:rounded-none lg:border-0">
              <Image
                src="/marca/obra.webp"
                alt="Edificio en construcción con grúa torre"
                width={1400}
                height={940}
                sizes="(max-width: 1024px) 92vw, 560px"
                className="h-full w-full object-cover"
              />
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="lavado lavado-frio">
        <div className="page py-16 md:py-24">
          <Reveal>
            <p className="label text-accent-ink">Clientes</p>
            <h2 className="mt-3 text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">
              Algunos de nuestros clientes
            </h2>
          </Reveal>

          <Reveal className="mt-10">
            <ClientWall
              clientes={clientes.map((c) => ({
                id: c.id,
                name: c.name,
                logoUrl: c.logo_url,
              }))}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
