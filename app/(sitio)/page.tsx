import Image from "next/image";
import Link from "next/link";

import { CategoryBelt } from "@/components/category-belt";
import { ClientWall } from "@/components/client-wall";
import { HeroMedia } from "@/components/hero-media";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Onda } from "@/components/onda";
import { ReferenceIndex } from "@/components/reference-index";
import { getAllProducts, getCategories, getSettings } from "@/lib/catalog";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
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

/** Cuántas referencias se enseñan en la portada: dos filas de cuatro. */
const DESTACADOS = 8;

/**
 * Una referencia por categoría, hasta llenar la rejilla.
 *
 * Coger las ocho primeras de la lista daría ocho rejillas seguidas, porque
 * vienen ordenadas por nombre. Repartiendo por categoría, la portada enseña de
 * qué va el catálogo: una ducha, un lavadero, un panel LED, una cámara.
 */
function repartirPorCategoria(productos: ProductCardData[], cuantos: number): ProductCardData[] {
  const porCategoria = new Map<string, ProductCardData[]>();
  for (const producto of productos) {
    const cola = porCategoria.get(producto.category.slug);
    if (cola) cola.push(producto);
    else porCategoria.set(producto.category.slug, [producto]);
  }

  const elegidos: ProductCardData[] = [];
  let vuelta = 0;
  // Se dan vueltas a las categorías hasta llenar; la condición de corte mira el
  // total disponible para no quedarse girando cuando ya no queda nada.
  while (elegidos.length < Math.min(cuantos, productos.length)) {
    let sumoAlguno = false;
    for (const cola of porCategoria.values()) {
      const producto = cola[vuelta];
      if (!producto) continue;
      sumoAlguno = true;
      elegidos.push(producto);
      if (elegidos.length === cuantos) return elegidos;
    }
    if (!sumoAlguno) break;
    vuelta += 1;
  }
  return elegidos;
}

export default async function HomePage() {
  const [categories, settings, productos] = await Promise.all([
    getCategories(),
    getSettings(),
    getAllProducts(),
  ]);

  const destacados = repartirPorCategoria(productos, DESTACADOS);
  const totalArticulos = categories.reduce((suma, c) => suma + c.productCount, 0);

  return (
    <>
      {/* Portada ------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-paper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-sky-soft blur-3xl"
        />
        <div className="page relative grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch lg:gap-16">
          {/* La columna de texto se centra sola dentro de su fila; el que
              manda la altura es el vídeo, que la llena entera. */}
          <Reveal direccion="izquierda" className="flex flex-col justify-center">
            <p className="label inline-flex w-fit rounded-full bg-accent-soft px-3.5 py-1.5 text-accent-ink">
              {site.yearsInMarket} años distribuyendo calidad
            </p>

            <h1 className="mt-6 max-w-[20ch] text-[clamp(2.15rem,5.4vw,3.8rem)] leading-[1.06] text-ink">
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
              <Link href="/catalogo" className="btn btn-primary">
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

          {/*
            Una sola pieza, no un mosaico. Las tres fotos pequeñas competían
            entre sí y ninguna se veía: salen de un collage de 1024px partido en
            seis, así que a tamaño de portada llegaban blandas. Esta es la única
            toma del material que aguanta el ancho — la obra, a 2400px.

            Cuando llegue el vídeo va exactamente aquí: mismo hueco, mismo
            fundido, mismo sangrado. Se cambia `<HeroMedia>` por dentro y no se
            toca nada más de la portada.
          */}
          <Reveal direccion="derecha" retraso={0.1} className="lg:h-full">
            <HeroMedia />
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

      {/* Categorías en cinturón ---------------------------------------------- */}
      <section className="bg-paper">
        <Onda posicion="arriba" className="text-canvas" />
        <div className="page pt-6 md:pt-10">
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
        </div>

        {/* La cinta va de borde a borde: encerrada en el contenedor parecería
            una fila cortada, y así se entiende que sigue más allá. */}
        <div className="mt-10">
          <CategoryBelt
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
        <Onda posicion="abajo" className="text-canvas" />
      </section>

      {/* Artículos del catálogo ----------------------------------------------
          Aquí estaba el visor de 360°, que enseñaba un grifo de demostración
          que MAB no vende: gastaba la mejor posición de la portada en algo que
          no llevaba a ninguna parte. Estas son referencias reales, con su foto
          y su enlace, y salen de la misma base que administra la empresa: al
          publicar un artículo nuevo, entra aquí solo. */}
      <section className="lavado-frio">
        <div className="page py-16 md:py-24">
          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="label text-accent-ink">Del catálogo</p>
                <h2 className="mt-3 max-w-[18ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-ink">
                  Algunas de las <span className="remate">referencias</span>
                </h2>
                <p className="mt-5 max-w-[54ch] text-ink-2">
                  {totalArticulos} artículos publicados en {categories.length} categorías.
                  Trabajamos con más referencias de las que caben aquí: si no ves la tuya,
                  pregúntanos.
                </p>
              </div>
              <Link
                href="/catalogo"
                className="group inline-flex shrink-0 items-center gap-2 font-semibold text-accent-ink"
              >
                Ver el catálogo completo
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </Reveal>

          <Reveal className="mt-10">
            <ReferenceIndex productos={destacados} />
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

      {/* Calidad — bloque partido con imagen --------------------------------
          Sobre arena y no sobre navy: el fondo oscuro obligaba a escribir el
          rótulo en color y dejaba el párrafo en un gris translúcido. Aquí la
          sección se separa igual, con la tinta de siempre. */}
      <section className="bg-warm">
        <Onda posicion="arriba" className="text-canvas" />
        <div className="page grid gap-12 py-10 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* El texto va segundo en escritorio y primero en el código: en
              móvil se lee antes el titular que la foto, que es el orden que
              tiene sentido cuando la columna es una sola. */}
          <Reveal direccion="derecha" className="lg:order-2">
            <p className="label text-accent-ink">Calidad</p>
            <h2 className="mt-3 max-w-[18ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-ink">
              Materiales que <span className="remate">cumplen la norma</span>
            </h2>
            <p className="mt-6 max-w-[54ch] leading-relaxed text-ink-2">
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
                    className="rounded-full border border-warm-line bg-canvas px-4 py-2 text-[14px] text-ink-2"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>

          {/* Una sola foto. Con tres, el fundido partía una por la mitad y
              leía como un defecto; y ninguna de las tres se veía bien a ese
              tamaño. */}
          <Reveal direccion="izquierda" retraso={0.1} className="lg:order-1">
            <div className="funde-der sangra-izq relative aspect-[3/2] w-full overflow-hidden rounded-xl lg:aspect-[4/3] lg:rounded-none">
              <Image
                src="/ambientes/ducha-lluvia.webp"
                alt="Ducha tipo lluvia instalada en una zona húmeda terminada"
                fill
                sizes="(max-width: 1024px) 92vw, 55vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
        <Onda posicion="abajo" className="text-canvas" />
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
      <section className="bg-paper">
        <Onda posicion="arriba" className="text-canvas" />
        <div className="page pb-16 pt-8 md:pb-24 md:pt-12">
          <Reveal>
            <p className="label text-accent-ink">Clientes</p>
            <h2 className="mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-ink">
              Algunos de nuestros clientes
            </h2>
            <p className="mt-5 max-w-[54ch] text-ink-2">
              Empresas que ya cuentan con nosotros para el suministro de sus proyectos.
            </p>
          </Reveal>

          <Reveal className="mt-10">
            <ClientWall />
          </Reveal>
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
