import Image from "next/image";
import Link from "next/link";

import { CategoryCarousel } from "@/components/category-carousel";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TurntableStrip, TurntableViewer } from "@/components/turntable-viewer";
import { getCategories, getSettings } from "@/lib/catalog";
import { formatPhone, site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

const PILARES = [
  {
    titulo: "Calidad garantizada",
    texto: "Marcas establecidas en el mercado nacional e internacional, con respaldo.",
    icono: "escudo",
  },
  {
    titulo: "Productos certificados",
    texto: "Cumplen las normas y medidas que exige la empresa de Gas Natural en todo el país.",
    icono: "sello",
  },
  {
    titulo: "Servicio confiable",
    texto: "Más de 15 años cotizando y entregando a clientes de todo el territorio nacional.",
    icono: "apreton",
  },
] as const;

const PASOS = [
  {
    numero: "01",
    titulo: "Envías las especificaciones",
    texto:
      "Nos dices qué necesita tu obra: referencias, medidas y cantidades. Si no tienes la referencia exacta, la buscamos nosotros.",
  },
  {
    numero: "02",
    titulo: "Te cotizamos",
    texto:
      "Te devolvemos el precio con las marcas disponibles. Si ya tienes otra cotización en mano, la mejoramos.",
  },
  {
    numero: "03",
    titulo: "Llega directo a la obra",
    texto:
      "El pedido sale hacia tu proyecto en el tiempo acordado, sea ciudad, municipio o vereda, en cualquier parte de Colombia.",
  },
] as const;

const VALORES = ["Calidad", "Responsabilidad", "Honestidad", "Compromiso", "Servicio"] as const;

export default async function HomePage() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  return (
    <>
      {/* Portada ------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-paper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-sky-soft blur-3xl"
        />
        <div className="page relative grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
          <Reveal direccion="izquierda">
            <p className="label inline-flex rounded-full bg-accent-soft px-3.5 py-1.5 text-accent-ink">
              {site.yearsInMarket} años distribuyendo calidad
            </p>

            <h1 className="mt-6 max-w-[16ch] text-[clamp(2.3rem,6vw,4.2rem)] leading-[1.05] text-ink">
              Soluciones de calidad
              <br />
              para <span className="remate">cada proyecto</span>
            </h1>

            <p className="mt-6 max-w-[50ch] text-[clamp(1.02rem,2.2vw,1.19rem)] leading-relaxed text-ink-2">
              Distribuimos implementos y acabados para ferretería y construcción, con entrega
              directa en tu obra en cualquier ciudad de Colombia. Desde zona húmeda hasta
              eléctricos, seguridad y baños.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/catalogo" className="btn btn-brand">
                Ver el catálogo
              </Link>
              <a
                href={whatsappLink(
                  settings.whatsapp_primary,
                  "Hola, quisiera cotizar materiales para mi proyecto.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Pedir cotización
              </a>
            </div>

            <p className="spec mt-6 text-ink-3">
              O llámanos al {formatPhone(settings.whatsapp_primary)}
            </p>
          </Reveal>

          {/* Composición de fotos: dos ambientes reales, desalineados a
              propósito para que no lea como una rejilla de plantilla. */}
          <Reveal direccion="derecha" retraso={0.1}>
            <div className="relative mx-auto max-w-[520px] lg:max-w-none">
              <div className="overflow-hidden border border-line">
                <Image
                  src="/ambientes/hero.webp"
                  alt="Baño terminado con sanitario, lavamanos y ducha instalados"
                  width={1024}
                  height={512}
                  priority
                  sizes="(max-width: 1024px) 92vw, 560px"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="overflow-hidden border border-line">
                  <Image
                    src="/ambientes/griferia-negra.webp"
                    alt="Grifería negra montada sobre lavamanos"
                    width={1024}
                    height={512}
                    sizes="(max-width: 1024px) 46vw, 272px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden border border-line">
                  <Image
                    src="/ambientes/cocina-agua.webp"
                    alt="Lavaplatos de acero inoxidable con grifería en uso"
                    width={1024}
                    height={512}
                    sizes="(max-width: 1024px) 46vw, 272px"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pilares ------------------------------------------------------------ */}
      <section className="page py-16 md:py-20">
        <Stagger as="ul" className="grid gap-5 md:grid-cols-3">
          {PILARES.map((pilar) => (
            <StaggerItem as="li" key={pilar.titulo}>
              <div className="card h-full p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                  <Icono nombre={pilar.icono} />
                </span>
                <h3 className="mt-5 font-text text-[18px] font-semibold text-ink">
                  {pilar.titulo}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{pilar.texto}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Categorías en carrusel --------------------------------------------- */}
      <section className="border-y border-line bg-paper">
        <div className="page py-16 md:py-24">
          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="label text-accent-ink">Todo para tu proyecto</p>
                <h2 className="mt-3 max-w-[16ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-ink">
                  Elige por <span className="remate">tipo de material</span>
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="group inline-flex items-center gap-2 font-semibold text-accent-ink"
              >
                Ver todas las categorías
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </Reveal>

          <div className="mt-10">
            <CategoryCarousel
              categorias={categories.map((c) => ({
                id: c.id,
                slug: c.slug,
                name: c.name,
                description: c.description,
                imageUrl: c.image_url,
                productCount: c.productCount,
              }))}
            />
          </div>
        </div>
      </section>

      {/* Vista 360 ----------------------------------------------------------- */}
      <section className="border-y border-line bg-canvas">
        <div className="page py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-20">
            <Reveal direccion="izquierda">
              <p className="label text-accent-ink">Vista 360°</p>
              <h2 className="mt-4 max-w-[15ch] text-[clamp(2rem,4.8vw,3.2rem)] leading-[1.08] text-ink">
                Gírala y ve el detalle
                <br />
                <span className="remate">que la foto esconde</span>
              </h2>
              <p className="mt-6 max-w-[54ch] leading-relaxed text-ink-2">
                Estamos montando el visor de 360° para las referencias del catálogo. Abajo hay una
                muestra: una vuelta completa en 36 pasos, para revisar la curva del cuello, el
                remate de la manija y la base antes de pedir el precio.
              </p>

              <dl className="mt-10 grid gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-3">
                {[
                  ["36 pasos", "Un fotograma cada 10°, para que la vuelta se vea continua."],
                  ["Sin instalar nada", "Corre en el navegador. No hay complemento que bajar."],
                  ["Arrastre o teclado", "Se gira con el dedo, con el ratón o con las flechas."],
                ].map(([titulo, texto]) => (
                  <div key={titulo}>
                    <dt className="font-text text-[15px] font-semibold text-ink">{titulo}</dt>
                    <dd className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{texto}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal direccion="derecha" retraso={0.1}>
              <div className="mx-auto max-w-[460px] lg:max-w-none">
                <TurntableViewer
                  sprite="/360/grifo-sprite.webp"
                  poster="/360/grifo-poster.webp"
                  nombre="grifo monomando"
                  acabado="muestra de visualización"
                />
                <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
                  Modelo de demostración del visor. Las referencias que vendemos están en el{" "}
                  <Link href="/catalogo" className="font-semibold text-accent-ink hover:underline">
                    catálogo
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
          </div>

          {/* Doce de los treinta y seis pasos, del mismo sprite. */}
          <Reveal className="mt-16">
            <div className="border-t border-line pt-8">
              <TurntableStrip sprite="/360/grifo-sprite.webp" />
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <p className="text-[14px] italic text-ink-3">
                  Doce de los treinta y seis pasos con que se levanta la vuelta.
                </p>
                <span className="label text-ink-3">000° — 360°</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cómo trabajamos ---------------------------------------------------- */}
      <section className="page py-16 md:py-24">
        <Reveal>
          <p className="label text-accent-ink">Cómo trabajamos</p>
          <h2 className="mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-ink">
            Tres pasos entre tu obra <span className="remate">y el material</span>
          </h2>
        </Reveal>

        <Stagger as="ol" className="mt-12 grid gap-6 md:grid-cols-3" paso={0.1}>
          {PASOS.map((paso, i) => (
            <StaggerItem as="li" key={paso.numero} className="relative">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand font-display text-[19px] text-on-brand">
                    {paso.numero}
                  </span>
                  {/* Línea de continuidad entre pasos, solo en escritorio */}
                  {i < PASOS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-line-2 md:block"
                    />
                  )}
                </div>
                <h3 className="mt-6 font-text text-[19px] font-semibold text-ink">
                  {paso.titulo}
                </h3>
                <p className="mt-3 text-ink-2">{paso.texto}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Calidad — bloque partido con imagen -------------------------------- */}
      <section className="border-y border-line bg-brand">
        <div className="page grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal direccion="izquierda">
            <p className="label text-accent">Calidad</p>
            <h2 className="mt-3 max-w-[18ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-on-brand">
              Materiales que <span className="remate">cumplen la norma</span>
            </h2>
            <p className="mt-6 max-w-[54ch] leading-relaxed text-on-brand/75">
              Nuestros productos están fabricados con materiales de alta calidad que cumplen con
              todas las normas exigidas, garantizando resistencia, durabilidad y seguridad.
              Contamos con diseños funcionales y certificados que aseguran el cumplimiento de las
              especificaciones requeridas por las empresas de servicios en todo el país.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {["Materiales de alta calidad", "Normas y certificaciones", "Seguridad y confianza"].map(
                (item) => (
                  <li
                    key={item}
                    className="rounded-full border border-on-brand/20 px-4 py-2 text-[14px] text-on-brand/85"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>

          <Reveal direccion="derecha" retraso={0.1}>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-xl">
                <Image
                  src="/ambientes/ducha-lluvia.webp"
                  alt="Ducha tipo lluvia instalada en zona húmeda"
                  width={1024}
                  height={512}
                  sizes="(max-width: 1024px) 46vw, 300px"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-xl">
                <Image
                  src="/ambientes/camara-concreto.webp"
                  alt="Cámara de seguridad instalada en fachada"
                  width={1024}
                  height={512}
                  sizes="(max-width: 1024px) 46vw, 300px"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="col-span-2 overflow-hidden rounded-xl">
                <Image
                  src="/marca/obra.webp"
                  alt="Edificio en construcción con grúa torre"
                  width={1400}
                  height={940}
                  sizes="(max-width: 1024px) 92vw, 600px"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quiénes somos + valores -------------------------------------------- */}
      <section className="page py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-20">
          <Reveal>
            <p className="label text-accent-ink">Quiénes somos</p>
            <h2 className="mt-3 max-w-[16ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-ink">
              {site.yearsInMarket} años <span className="remate">de excelencia</span>
            </h2>
            <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-ink-2">
              Somos una empresa distribuidora de implementos para ferreterías y construcciones,
              con más de {site.yearsInMarket} años de experiencia en el mercado. Ofrecemos
              productos de alta calidad de marcas exclusivas y certificadas, con el compromiso de
              brindar las mejores soluciones para su negocio y construcción.
            </p>

            <dl className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="border-l-2 border-accent pl-5">
                <dt className="label text-ink-3">Misión</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-ink-2">{site.mission}</dd>
              </div>
              <div className="border-l-2 border-sky pl-5">
                <dt className="label text-ink-3">Visión</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-ink-2">{site.vision}</dd>
              </div>
            </dl>

            <Link
              href="/nosotros"
              className="group mt-9 inline-flex items-center gap-2 font-semibold text-accent-ink"
            >
              Conocer la empresa
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </Reveal>

          <Reveal direccion="derecha" retraso={0.1}>
            <div className="card p-7">
              <p className="label text-ink-3">Nuestros valores</p>
              <ul className="mt-5 flex flex-col">
                {VALORES.map((valor, i) => (
                  <li
                    key={valor}
                    className={`flex items-center gap-4 py-3.5 ${
                      i < VALORES.length - 1 ? "border-b border-line" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-bold text-accent-ink">
                      {i + 1}
                    </span>
                    <span className="font-medium text-ink">{valor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Clientes ----------------------------------------------------------- */}
      <section className="border-t border-line bg-paper">
        <div className="page py-16 md:py-24">
          <Reveal>
            <p className="label text-accent-ink">Clientes</p>
            <h2 className="mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-ink">
              Algunos de nuestros clientes
            </h2>
            <p className="mt-5 max-w-[54ch] text-ink-2">
              Empresas que ya cuentan con nosotros para el suministro de sus proyectos.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" paso={0.04}>
            {site.clients.map((client) => (
              <StaggerItem as="li" key={client}>
                <div className="flex h-full items-center gap-3.5 rounded-lg border border-line bg-canvas px-5 py-4">
                  <span aria-hidden="true" className="h-8 w-1 shrink-0 rounded-full bg-accent" />
                  <span className="font-medium text-ink-2">{client}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}

/** Iconografía propia en SVG. Nunca emoji. */
function Icono({ nombre }: { nombre: "escudo" | "sello" | "apreton" }) {
  const comun = {
    viewBox: "0 0 24 24",
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (nombre === "escudo") {
    return (
      <svg {...comun}>
        <path d="M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9.5-4.1-1.9-7-5.3-7-9.5V6l7-3z" />
        <path d="M9.2 11.8l2 2 3.6-3.8" />
      </svg>
    );
  }

  if (nombre === "sello") {
    return (
      <svg {...comun}>
        <circle cx="12" cy="9.5" r="5.5" />
        <path d="M9.2 9.4l1.9 1.9 3.6-3.7" />
        <path d="M8.4 14.6L7 21l5-2.2L17 21l-1.4-6.4" />
      </svg>
    );
  }

  return (
    <svg {...comun}>
      <path d="M3 11.5l3-3 4 3.4 2-1.6 2 1.6 4-3.4 3 3" />
      <path d="M6.5 14.5l3.2 3.1a2 2 0 002.8 0l4.9-4.7" />
    </svg>
  );
}
