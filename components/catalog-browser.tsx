"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { fold } from "@/lib/slug";
import { claseTono } from "@/lib/tono";

/**
 * El catálogo.
 *
 * Antes eran dos pantallas encadenadas: una rejilla de categorías y, dentro de
 * cada una, otra rejilla de artículos. Para comparar dos sifones de categorías
 * distintas había que volver atrás, y no existía forma de ver el catálogo
 * entero. Ahora es una sola vista con los artículos delante y las categorías al
 * lado, como una tienda: se entra viendo producto, no un índice.
 *
 * Todo el filtrado ocurre en el navegador sobre los artículos que ya vinieron
 * con la página. Son cuarenta y cinco fichas sin descripción —unos 6 kB—, así
 * que marcar un material responde al instante en vez de esperar un viaje al
 * servidor. Si el catálogo llegara a varios cientos, esto habría que moverlo a
 * la base de datos; hasta entonces sería complicar por adelantado.
 *
 * Las categorías del rail son enlaces de verdad a `/catalogo/<slug>` y no
 * botones que filtran: esas páginas existen, tienen su propio título y su
 * descripción, y son las que MAB comparte por WhatsApp. Convertirlas en estado
 * de un componente las habría borrado del mapa.
 */

export type CategoriaRail = {
  id: string;
  slug: string;
  name: string;
  productCount: number;
};

type Orden = "recomendado" | "az" | "za";

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "recomendado", etiqueta: "Recomendados" },
  { valor: "az", etiqueta: "Nombre (A–Z)" },
  { valor: "za", etiqueta: "Nombre (Z–A)" },
];

export function CatalogBrowser({
  categorias,
  productos,
  destacados = [],
  categoriaActiva,
}: {
  categorias: CategoriaRail[];
  productos: ProductCardData[];
  /** Los más vendidos. Son la vista con la que abre el catálogo. */
  destacados?: ProductCardData[];
  categoriaActiva?: string;
}) {
  const [consulta, setConsulta] = useState("");
  const [orden, setOrden] = useState<Orden>("recomendado");
  const [panelAbierto, setPanelAbierto] = useState(false);

  /*
   * Con qué se abre el catálogo.
   *
   * Con los más vendidos, no con los treinta y cuatro artículos. Quien entra
   * todavía no sabe cómo se llama lo que busca, y una rejilla completa ordenada
   * por nombre no responde nada: empieza por accesorios de baño porque empieza
   * por A. Un puñado de piezas que sí salen hacia obra dice de qué va esto en
   * dos segundos, y «Todo el catálogo» está justo al lado para quien quiera la
   * lista entera.
   */
  const hayDestacados = destacados.length > 0 && !categoriaActiva;
  const [vista, setVista] = useState<"destacados" | "todo">(
    hayDestacados ? "destacados" : "todo",
  );

  // Lo que hay antes de tocar ningún filtro: la vitrina, el catálogo entero, o
  // el de una categoría si se entró por su página.
  const base = useMemo(() => {
    if (categoriaActiva) return productos.filter((p) => p.category.slug === categoriaActiva);
    return hayDestacados && vista === "destacados" ? destacados : productos;
  }, [productos, destacados, categoriaActiva, hayDestacados, vista]);

  const resultados = useMemo(() => {
    const aguja = fold(consulta.trim());

    const filtrados = base.filter((producto) => {
      if (aguja) {
        const texto = fold(
          `${producto.name} ${producto.specs ?? ""} ${producto.category.name}`,
        );
        if (!texto.includes(aguja)) return false;
      }

      return true;
    });

    if (orden === "recomendado") return filtrados;
    const factor = orden === "az" ? 1 : -1;
    return [...filtrados].sort((a, b) => factor * a.name.localeCompare(b.name, "es"));
  }, [base, consulta, orden]);

  /*
   * Buscar o filtrar sale de la vitrina y pasa al catálogo entero.
   *
   * Si no, escribir «ducha» estando en los más vendidos buscaría entre ocho
   * artículos y devolvería «ningún artículo coincide» con el catálogo lleno de
   * duchas. Nadie entiende un buscador que solo busca en un trozo de lo que
   * está mirando.
   */
  const buscarEnTodo = () => setVista("todo");

  const hayFiltros = consulta.trim().length > 0;

  const limpiar = () => setConsulta("");

  const panel = (
    <div className="flex flex-col gap-8">
      <nav aria-label="Categorías del catálogo">
        <h2 className="label text-ink-3">Explorar por</h2>
        <ul className="mt-4 flex flex-col gap-0.5">
          {/* Las dos primeras cambian lo que se ve sin recargar; las
              categorías son enlaces de verdad porque sus páginas existen. */}
          {hayDestacados && (
            <li>
              <BotonRail
                activo={vista === "destacados"}
                destacado
                onClick={() => setVista("destacados")}
              >
                Los más vendidos
                <Cuantos n={destacados.length} />
              </BotonRail>
            </li>
          )}
          <li>
            {categoriaActiva ? (
              <EnlaceRail href="/catalogo" activo={false} tono={null}>
                Todo el catálogo
                <Cuantos n={productos.length} />
              </EnlaceRail>
            ) : (
              <BotonRail activo={vista === "todo"} onClick={() => setVista("todo")}>
                Todo el catálogo
                <Cuantos n={productos.length} />
              </BotonRail>
            )}
          </li>
          {categorias.map((categoria) => (
            <li key={categoria.id}>
              <EnlaceRail
                href={`/catalogo/${categoria.slug}`}
                activo={categoriaActiva === categoria.slug}
                tono={categoria.slug}
              >
                {categoria.name}
                <Cuantos n={categoria.productCount} />
              </EnlaceRail>
            </li>
          ))}
        </ul>
      </nav>

      {hayFiltros && (
        <button
          type="button"
          onClick={limpiar}
          className="self-start text-[14px] font-semibold text-accent-ink underline underline-offset-4 hover:text-accent"
        >
          Quitar los filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[228px_minmax(0,1fr)] lg:gap-12">
      {/*
        En escritorio el rail acompaña el desplazamiento; en móvil no cabe al
        lado y se pliega tras un botón.

        El panel se escribe una sola vez y lo que cambia es si se muestra. La
        alternativa —uno para móvil y otro para escritorio— dejaba dos juegos de
        enlaces en el documento: el lector de pantalla anunciaba las categorías
        dos veces y el tabulador pasaba por todas ellas dos veces.
      */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <button
          type="button"
          onClick={() => setPanelAbierto((a) => !a)}
          aria-expanded={panelAbierto}
          aria-controls="panel-catalogo"
          className="btn btn-secondary w-full justify-between lg:hidden"
        >
          Explorar el catálogo
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`transition-transform duration-200 ${panelAbierto ? "rotate-180" : ""}`}
            >
              <svg
                viewBox="0 0 12 12"
                className="h-2.5 w-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 4.5l4 4 4-4" />
              </svg>
            </span>
          </span>
        </button>

        <div
          id="panel-catalogo"
          className={`${panelAbierto ? "mt-5" : "hidden"} lg:mt-0 lg:block`}
        >
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[300px]">
            <label htmlFor="buscar-articulo" className="sr-only">
              Buscar un artículo
            </label>
            <input
              id="buscar-articulo"
              type="search"
              value={consulta}
              onChange={(e) => {
                setConsulta(e.target.value);
                if (e.target.value) buscarEnTodo();
              }}
              placeholder="Buscar: sifón, ducha, panel…"
              autoComplete="off"
              className="field pl-11"
            />
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M13.5 13.5L17 17" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-2.5">
            <label htmlFor="ordenar" className="spec shrink-0 text-ink-3">
              Ordenar por
            </label>
            <select
              id="ordenar"
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              className="field h-11 min-h-11 w-auto py-0 pr-8 text-[14px]"
            >
              {ORDENES.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p aria-live="polite" className="spec mt-5 text-ink-3">
          {resultados.length === 0
            ? "Ningún artículo coincide"
            : `${resultados.length} ${resultados.length === 1 ? "artículo" : "artículos"}`}
        </p>

        {resultados.length > 0 ? (
          <ul className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
            {resultados.map((producto) => (
              // La clave lleva la consulta: al filtrar, el nodo se remonta y
              // reproduce la entrada, que es lo que da la sensación de que la
              // rejilla se recompone en vez de parpadear.
              <li key={`${producto.id}-${consulta}`} className="entra min-w-0">
                <ProductCard product={producto} showCategory={!categoriaActiva} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card mt-5 p-10 text-center">
            <p className="text-ink">No encontramos ningún artículo con esos filtros.</p>
            <p className="mt-2 text-ink-2">
              Trabajamos con más referencias de las que están publicadas. Si buscas algo concreto,
              pregúntanos y te decimos si lo tenemos.
            </p>
            <button type="button" onClick={limpiar} className="btn btn-secondary mt-6">
              Quitar los filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Cómo se pinta una fila del rail, la pulse quien la pulse.
 *
 * La activa se marca con el fondo y con el peso de la letra, nunca solo con el
 * color: quien no distingue el pastel del lienzo sigue viendo cuál está
 * señalada.
 */
function claseFila(activo: boolean, destacado: boolean, tono: string | null): string {
  const base =
    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-[15px] transition-colors";
  const estado = activo
    ? destacado
      ? "bg-sun-soft font-semibold text-sun-ink"
      : "bg-paper font-semibold text-ink"
    : destacado
      ? "font-semibold text-sun-ink hover:bg-sun-soft"
      : "text-ink-2 hover:bg-paper hover:text-ink";
  return `${tono ? claseTono(tono) : ""} ${base} ${estado}`;
}

function Marca({ destacado, tono }: { destacado: boolean; tono: string | null }) {
  if (destacado) {
    return (
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 text-sun"
        fill="currentColor"
      >
        <path d="M10 1.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L2.2 7.5l5.4-.8z" />
      </svg>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
        tono ? "bg-[var(--tono-punto)]" : "bg-line-2"
      }`}
    />
  );
}

/** Categoría: es una página de verdad, así que es un enlace. */
function EnlaceRail({
  href,
  activo,
  tono,
  children,
}: {
  href: string;
  activo: boolean;
  tono: string | null;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={claseFila(activo, false, tono)}
    >
      <Marca destacado={false} tono={tono} />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">{children}</span>
    </Link>
  );
}

/**
 * Vitrina y catálogo completo: cambian lo que se ve en esta misma pantalla, sin
 * recargar, así que son botones. Un enlace que no lleva a ninguna parte y solo
 * cambia el estado de la página miente al teclado y al lector de pantalla.
 */
function BotonRail({
  activo,
  destacado = false,
  onClick,
  children,
}: {
  activo: boolean;
  destacado?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={claseFila(activo, destacado, null)}
    >
      <Marca destacado={destacado} tono={null} />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">{children}</span>
    </button>
  );
}

function Cuantos({ n }: { n: number }) {
  return <span className="spec shrink-0 text-ink-3">{n}</span>;
}
