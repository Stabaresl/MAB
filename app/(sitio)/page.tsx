import Image from "next/image";
import Link from "next/link";

import { ClientWall } from "@/components/client-wall";
import { Counters } from "@/components/counters";
import { HeroMedia } from "@/components/hero-media";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProductCarousel } from "@/components/product-carousel";
import { ReviewCard } from "@/components/review-card";
import {
  getAllProducts,
  getClients,
  getFeaturedProducts,
  getReviews,
  getSettings,
  getStats,
} from "@/lib/catalog";
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

/** Cuántos artículos enseña la vitrina de la portada: dos filas de cuatro. */
const EN_VITRINA = 8;

/**
 * Una referencia por categoría, hasta llenar la rejilla.
 *
 * Es el relleno de la vitrina mientras MAB no haya marcado ningún artículo como
 * más vendido. Coger los ocho primeros de la lista daría ocho rejillas
 * seguidas, porque vienen ordenados por nombre. Repartiendo por categoría, la
 * portada enseña de qué va el catálogo: una ducha, un lavadero, un panel LED.
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
  const [settings, productos, masVendidos, indicadores, clientes, resenas] = await Promise.all([
    getSettings(),
    getAllProducts(),
    getFeaturedProducts(EN_VITRINA),
    getStats(),
    getClients(),
    getReviews(),
  ]);

  // Si MAB todavía no ha marcado ninguno, la vitrina no se queda vacía ni se
  // inventa un ranking: enseña una muestra repartida y lo dice en el rótulo.
  const hayMasVendidos = masVendidos.length > 0;
  const vitrina = hayMasVendidos
    ? masVendidos
    : repartirPorCategoria(productos, EN_VITRINA);

  return (
    <>
      {/* Portada ------------------------------------------------------------ */}
      <section className="lavado lavado-frio lavado-sale relative overflow-hidden">
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

      {/* Indicadores ---------------------------------------------------------
          Las cifras suben en vez de aparecer puestas: es lo que hace que se
          lean como una cantidad y no como cuatro números de adorno. Dos de las
          cuatro las cuenta el servidor —artículos y categorías—, así que no
          pueden quedarse viejas; las otras las escribe MAB desde el panel.

          Aquí abajo había una franja naranja con «¿Dudas o inquietudes?». Se
          quita: repetía el botón de cotizar que ya acompaña al visitante flotando
          en la esquina, y ese naranja a sangre entre dos secciones claras
          partía la portada en dos justo donde no hacía falta.

          Y ya no sube a solaparse con la portada: el margen negativo metía la
          fila de cifras por debajo del vídeo y en pantallas cortas la primera
          línea quedaba tapada. Ahora las dos secciones se tocan por el
          degradado, que es lo que hace la transición. */}
      {indicadores.length > 0 && (
        <section className="page pt-12 md:pt-16">
          <Reveal>
            <Counters indicadores={indicadores} />
          </Reveal>
        </section>
      )}

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

      {/* Los más vendidos ----------------------------------------------------
          Aquí estaba el cinturón de categorías: diez pastillas pasando solas
          con el nombre de cada grupo de material. Enseñaba la estantería, no lo
          que hay en ella, y quien entra a la portada todavía no sabe si «zona
          húmeda» es donde está lo que busca. Producto real, con su foto y su
          precio a un clic de distancia, responde antes.

          Cuáles son los más vendidos lo marca MAB en el panel. Si no hay
          ninguno marcado, la sección no miente: cambia el rótulo y enseña una
          muestra repartida por categoría. */}
      <section className="lavado lavado-arena">
        <div className="page py-16 md:py-24">
          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="label text-sun-ink">
                  {hayMasVendidos ? "Lo más pedido" : "Del catálogo"}
                </p>
                <h2 className="mt-3 max-w-[16ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-ink">
                  {hayMasVendidos ? (
                    <>
                      Los más <span className="remate">vendidos</span>
                    </>
                  ) : (
                    <>
                      Algunos de <span className="remate">nuestros artículos</span>
                    </>
                  )}
                </h2>
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

          {/* Carrusel y no rejilla: en una rejilla de dos filas, la segunda
              se lee como relleno. En una pista, las ocho piezas tienen el mismo
              peso y la que asoma por la derecha invita a seguir empujando. */}
          <Reveal className="mt-10">
            <ProductCarousel productos={vitrina} />
          </Reveal>
        </div>
      </section>

      {/* Reseñas -------------------------------------------------------------
          En este hueco estaba el índice de referencias, que repetía con otra
          maquetación lo que la sección de arriba ya enseña. Aquí va lo que dicen
          los clientes, que es lo que un visitante busca justo después de ver el
          producto y antes de escribir.

          La sección solo existe si hay reseñas publicadas. Un bloque «Lo que
          dicen nuestros clientes» con tres tarjetas de ejemplo es peor que no
          tener el bloque: quien lo ve entiende que no hay ninguna.

          Las sube MAB desde el panel, con la captura del mensaje y el texto
          transcrito, porque las opiniones llegan por WhatsApp y por correo. No
          hay formulario público a propósito: sería una puerta abierta a que
          cualquiera publique en la portada. */}
      {resenas.length > 0 && (
        // Sin lavado de color: el azul de aquí competía con las capturas, que
        // llegan con fondo blanco, y hacía que cada tarjeta se leyera como un
        // recorte. Sobre el lienzo limpio, la tarjeta blanca es lo único que
        // destaca, que es lo que tiene que destacar.
        <section>
          <div className="page py-16 md:py-24">
            <Reveal>
              <p className="label text-accent-ink">Reseñas</p>
              <h2 className="mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-ink">
                Lo que dicen <span className="remate">quienes ya compraron</span>
              </h2>
            </Reveal>

            <Stagger
              as="ul"
              className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              paso={0.08}
            >
              {resenas.map((resena) => (
                <StaggerItem as="li" key={resena.id} className="min-w-0">
                  <ReviewCard
                    resena={{
                      author: resena.author,
                      role: resena.role,
                      quote: resena.quote,
                      imageUrl: resena.image_url,
                      rating: resena.rating,
                    }}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

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
      <section className="lavado lavado-calido overflow-hidden">
        <div className="page grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          {/* El texto va segundo en escritorio y primero en el código: en
              móvil se lee antes el titular que la foto, que es el orden que
              tiene sentido cuando la columna es una sola. */}
          <Reveal direccion="derecha" className="flex flex-col justify-center lg:order-2">
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
          <Reveal direccion="izquierda" retraso={0.1} className="lg:order-1 lg:h-full">
            {/*
              La foto ya no se sale de la sección por arriba y por abajo.

              Con el fondo plano de antes, ese desbordamiento no se notaba: la
              foto salía del bloque de arena y entraba en otro bloque de arena.
              Ahora el fondo es un degradado que empieza y acaba en el lienzo,
              así que la foto cruzaba el degradado entero y dejaba dos cortes
              rectos —uno arriba y otro abajo— justo donde el color tenía que
              estar disolviéndose. Dentro de la sección, el degradado respira
              por los dos lados y la foto conserva su sangrado por la izquierda.
            */}
            <div className="funde-der sangra-izq relative aspect-[3/2] w-full overflow-hidden rounded-xl lg:aspect-auto lg:h-full lg:rounded-none">
              {/*
                El fotograma sale del mismo vídeo que la portada, y no del
                collage de ambientes que entregó la empresa: aquellos paneles
                miden 512px de ancho de verdad —el archivo de 1024 es ese mismo
                panel ampliado al doble, no hay original mayor— y a este tamaño
                se veían blandos. 1366px de píxeles reales se sostienen.
              */}
              <Image
                src="/ambientes/cocina-terminada.webp"
                alt="Cocina terminada con grifería y mesones instalados"
                fill
                sizes="(max-width: 1024px) 92vw, 55vw"
                className="object-cover"
              />
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

            {/* La misión y la visión viven en «Nosotros». Repetirlas aquí solo
                alargaba la portada y le quitaba sentido al enlace de abajo. */}
            <Link
              href="/nosotros"
              className="group mt-8 inline-flex items-center gap-2 font-semibold text-accent-ink"
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
      <section className="lavado lavado-gris">
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
