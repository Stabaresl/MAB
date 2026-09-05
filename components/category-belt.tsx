"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type CategoriaCarrusel = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
};

/** Píxeles por segundo del avance automático. Un paseo, no un letrero. */
const VELOCIDAD = 38;
/** Tras tocar la cinta, el avance solo se reanuda pasado este tiempo. */
const ESPERA_TRAS_TOCAR = 2200;
/** Píxeles a partir de los cuales un movimiento deja de ser un clic tembloroso. */
const UMBRAL_ARRASTRE = 6;

/**
 * Cinturón de categorías.
 *
 * Es la puerta al catálogo: en vez de volcar 45 artículos sueltos, el visitante
 * ve pasar el tipo de material, que es como piensa quien está comprando para
 * una obra.
 *
 * La cinta es un contenedor con desplazamiento de verdad, no una animación de
 * CSS. Esa es la decisión que lo sostiene todo: con `scrollLeft` el visitante
 * puede empujarla con el dedo, con la rueda, arrastrando con el ratón o con las
 * flechas, y el avance automático es solo alguien más sumando píxeles a la
 * misma propiedad. Con una animación de `transform` el movimiento salía gratis,
 * pero la cinta era intocable: cualquier intento de moverla peleaba con el
 * fotograma siguiente.
 *
 * La vuelta sin fin sale de duplicar la lista: al pasar de la mitad se resta la
 * mitad, y como la segunda copia empieza exactamente igual que la primera, el
 * salto no se ve.
 */
export function CategoryBelt({ categorias }: { categorias: CategoriaCarrusel[] }) {
  const pista = useRef<HTMLUListElement>(null);
  const [pausado, setPausado] = useState(false);

  // Estas tres no pintan nada, así que van en refs: guardarlas en el estado
  // repintaría la lista entera en cada movimiento del ratón.
  const quieto = useRef(false);
  const ultimoToque = useRef(0);
  const arrastre = useRef<{ x: number; scroll: number } | null>(null);
  /** Se alza cuando el puntero recorrió lo bastante como para ser un arrastre. */
  const huboArrastre = useRef(false);

  // Una cinta con dos o tres piezas se ve vacía al duplicarla; a partir de esa
  // cantidad ya hay material para que la vuelta parezca continua.
  const repetir = categorias.length >= 4;
  const piezas = repetir ? [...categorias, ...categorias] : categorias;

  /** Devuelve el desplazamiento al primer tramo cuando se pasa de la mitad. */
  const normalizar = useCallback(() => {
    const nodo = pista.current;
    if (!nodo || !repetir) return;
    const mitad = nodo.scrollWidth / 2;
    if (mitad <= 0) return;
    if (nodo.scrollLeft >= mitad) nodo.scrollLeft -= mitad;
  }, [repetir]);

  // --- Avance automático ---------------------------------------------------
  useEffect(() => {
    const nodo = pista.current;
    if (!nodo || !repetir) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let anterior = performance.now();
    let cuadro = 0;
    /*
     * La posición se lleva aparte, en coma flotante.
     *
     * A 38 px/s cada fotograma avanza medio píxel, y `scrollLeft += 0.6` no
     * llega a ninguna parte: el navegador redondea al escribir, así que la
     * lectura siguiente devuelve el mismo entero y la cinta se queda clavada.
     * Acumulando aquí y escribiendo el total, el avance sí progresa.
     */
    let posicion = nodo.scrollLeft;

    const paso = (ahora: number) => {
      const delta = (ahora - anterior) / 1000;
      anterior = ahora;

      const tocadoHacePoco = ahora - ultimoToque.current < ESPERA_TRAS_TOCAR;
      if (pausado || quieto.current || arrastre.current || tocadoHacePoco) {
        // Mientras manda la persona, el contador la sigue en vez de pelearse.
        posicion = nodo.scrollLeft;
      } else {
        // Si algo movió la cinta por fuera, se retoma desde donde quedó.
        if (Math.abs(posicion - nodo.scrollLeft) > 2) posicion = nodo.scrollLeft;

        posicion += VELOCIDAD * delta;
        const mitad = nodo.scrollWidth / 2;
        if (mitad > 0 && posicion >= mitad) posicion -= mitad;
        nodo.scrollLeft = posicion;
      }

      cuadro = requestAnimationFrame(paso);
    };

    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [pausado, repetir]);

  // --- Empujón manual ------------------------------------------------------
  const anotarToque = () => {
    ultimoToque.current = performance.now();
  };

  const mover = (sentido: 1 | -1) => {
    const nodo = pista.current;
    if (!nodo) return;
    anotarToque();

    const paso = nodo.clientWidth * 0.8;
    // Al llegar al principio no hay hacia dónde seguir a la izquierda: se salta
    // al mismo punto de la segunda copia, que se ve idéntico, y desde ahí sí
    // queda recorrido. Sin esto la flecha izquierda se quedaba muerta.
    if (sentido === -1 && repetir && nodo.scrollLeft < paso) {
      nodo.scrollLeft += nodo.scrollWidth / 2;
    }
    nodo.scrollBy({ left: paso * sentido, behavior: "smooth" });
  };

  /**
   * Arrastre con el ratón.
   *
   * En un contenedor con desplazamiento, el dedo y la rueda funcionan solos,
   * pero el ratón no: arrastrar no hace nada. Como la cinta se mueve sola,
   * agarrarla es el gesto que pide, así que se implementa a mano.
   */
  const alPulsar = (e: React.PointerEvent<HTMLUListElement>) => {
    // Solo el botón principal, y nunca sobre un enlace que se está pulsando
    // para abrir: el arrastre se distingue del clic por la distancia recorrida.
    if (e.button !== 0) return;
    const nodo = pista.current;
    if (!nodo) return;
    arrastre.current = { x: e.clientX, scroll: nodo.scrollLeft };
    huboArrastre.current = false;
    anotarToque();
  };

  /**
   * Un arrastre no puede terminar abriendo una categoría.
   *
   * Al soltar, el navegador manda un `click` al enlace que quedó debajo del
   * cursor, así que empujar la cinta te sacaba de la página. Se corta aquí, en
   * la fase de captura, antes de que el enlace lo reciba; y solo cuando el
   * puntero recorrió más que el temblor de un clic normal, para no anular los
   * clics de verdad.
   */
  const alHacerClic = (e: React.MouseEvent) => {
    if (!huboArrastre.current) return;
    e.preventDefault();
    e.stopPropagation();
    huboArrastre.current = false;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const alMover = (e: PointerEvent) => {
      const inicio = arrastre.current;
      const nodo = pista.current;
      if (!inicio || !nodo) return;
      const recorrido = e.clientX - inicio.x;
      if (Math.abs(recorrido) > UMBRAL_ARRASTRE) huboArrastre.current = true;
      nodo.scrollLeft = inicio.scroll - recorrido;
      normalizar();
      anotarToque();
    };

    const alSoltar = () => {
      if (!arrastre.current) return;
      arrastre.current = null;
      anotarToque();
    };

    window.addEventListener("pointermove", alMover);
    window.addEventListener("pointerup", alSoltar);
    window.addEventListener("pointercancel", alSoltar);
    return () => {
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerup", alSoltar);
      window.removeEventListener("pointercancel", alSoltar);
    };
  }, [normalizar]);

  return (
    <div>
      {/* La cabecera se alinea con el resto de la página; la cinta no, porque
          va de borde a borde. */}
      <div className="page flex flex-wrap items-center justify-between gap-4">
        <p className="spec text-ink-3">{categorias.length} categorías en el catálogo</p>

        <div className="flex items-center gap-2">
          <Flecha sentido={-1} onClick={() => mover(-1)} />
          <Flecha sentido={1} onClick={() => mover(1)} />

          <button
            type="button"
            onClick={() => setPausado((p) => !p)}
            aria-pressed={pausado}
            className="ml-1 inline-flex h-11 items-center gap-2.5 rounded-full border border-line-2 bg-canvas pl-3.5 pr-4 text-[13.5px] font-semibold text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
          >
            <span aria-hidden="true" className="text-accent">
              {pausado ? <IconoReanudar /> : <IconoPausa />}
            </span>
            {pausado ? "Reanudar" : "Pausar"}
          </button>
        </div>
      </div>

      <ul
        ref={pista}
        onPointerDown={alPulsar}
        onClickCapture={alHacerClic}
        onMouseEnter={() => (quieto.current = true)}
        onMouseLeave={() => (quieto.current = false)}
        onFocusCapture={() => (quieto.current = true)}
        onBlurCapture={() => (quieto.current = false)}
        // Nada de `onScroll`: el avance automático mueve `scrollLeft` y eso
        // dispara `scroll`, así que la cinta se marcaba a sí misma como «tocada
        // hace un momento» y se paraba sola en el primer fotograma. Se escuchan
        // los gestos de la persona, que es lo que importa: rueda, dedo y ratón.
        onWheel={anotarToque}
        onTouchStart={anotarToque}
        onTouchMove={anotarToque}
        className="cinturon mt-5"
      >
        {piezas.map((categoria, indice) => {
          const copia = indice >= categorias.length;
          return (
            <li
              key={`${categoria.id}-${indice}`}
              className={`w-[264px] shrink-0 pr-4 sm:w-[292px] ${copia ? "cinturon-copia" : ""}`}
              {...(copia ? { "aria-hidden": true } : {})}
            >
              <Pieza categoria={categoria} inerte={copia} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Una pieza de la cinta.
 *
 * Las de la segunda copia salen del árbol de accesibilidad y del recorrido de
 * tabulación: se ven, pero para el lector de pantalla y para el teclado la
 * lista sigue teniendo tantas categorías como hay de verdad.
 */
function Pieza({ categoria, inerte }: { categoria: CategoriaCarrusel; inerte: boolean }) {
  return (
    <Link
      href={`/catalogo/${categoria.slug}`}
      tabIndex={inerte ? -1 : undefined}
      // Sin esto, arrastrar sobre una tarjeta arranca el arrastre nativo de la
      // imagen y el del enlace, y la cinta se queda quieta con un fantasma
      // pegado al cursor.
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className="card card-hover group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper">
        {categoria.imageUrl && (
          <Image
            src={categoria.imageUrl}
            alt=""
            fill
            draggable={false}
            sizes="292px"
            className="object-contain p-7 transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.06]"
          />
        )}
        <span className="spec absolute left-3 top-3 rounded-full bg-canvas/90 px-2.5 py-1 text-ink-2 backdrop-blur">
          {categoria.productCount}
        </span>
      </div>

      <div className="flex flex-1 flex-col border-t border-line p-5">
        <h3 className="text-[19px] leading-snug text-ink transition-colors group-hover:text-accent-ink">
          {categoria.name}
        </h3>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent-ink">
          Ver artículos
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function Flecha({ sentido, onClick }: { sentido: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={sentido === -1 ? "Categorías anteriores" : "Categorías siguientes"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2 bg-canvas text-ink transition-colors hover:border-ink-3 hover:bg-paper"
    >
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {sentido === -1 ? <path d="M12 4l-6 6 6 6" /> : <path d="M8 4l6 6-6 6" />}
      </svg>
    </button>
  );
}

function IconoPausa() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="2" width="3.2" height="10" rx="1" />
      <rect x="8.3" y="2" width="3.2" height="10" rx="1" />
    </svg>
  );
}

function IconoReanudar() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M3.5 2.3a1 1 0 011.5-.87l6.4 4.7a1 1 0 010 1.74l-6.4 4.7a1 1 0 01-1.5-.87V2.3z" />
    </svg>
  );
}
