"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/product-card";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { useEsMovil } from "@/lib/use-es-movil";

/**
 * Carrusel de artículos.
 *
 * Es una pista con desplazamiento de verdad, no una animación de `transform`.
 * Esa es la decisión que lo sostiene todo: el paseo automático es solo alguien
 * más sumando píxeles a `scrollLeft`, así que convive sin pelearse con el dedo,
 * la rueda, el arrastre y las flechas. Con una animación de `transform` el
 * movimiento salía gratis pero la cinta era intocable: cualquier intento de
 * moverla peleaba con el fotograma siguiente.
 *
 * La lista va duplicada y al pasar de la mitad se resta la mitad. Como la
 * segunda copia empieza exactamente igual que la primera, el salto no se ve y
 * la cinta no llega nunca a un extremo.
 *
 * En móvil no pasea. Una cinta que se mueve sola debajo del pulgar es
 * insufrible: se empuja para leer una tarjeta y sigue corriendo. Allí manda el
 * imán de desplazamiento, que planta cada tarjeta alineada con el margen del
 * texto.
 *
 * Las flechas aparecen solo en escritorio y solo si hay algo que recorrer.
 */

/** Píxeles por segundo del paseo. Un paseo, no un letrero de neón. */
const VELOCIDAD = 22;
/** Tras tocar la cinta, el paseo se reanuda pasado este tiempo. */
const ESPERA_TRAS_TOCAR = 2500;
/** Píxeles a partir de los cuales un movimiento deja de ser un clic tembloroso. */
const UMBRAL_ARRASTRE = 6;

/**
 * Cuánto hay que avanzar para que la segunda copia caiga donde estaba la
 * primera: la distancia entre dos tarjetas equivalentes. Se mide en lugar de
 * dividir el ancho total entre dos porque la pista lleva relleno lateral, y ese
 * relleno no forma parte de la vuelta.
 */
function distanciaDeVuelta(pista: HTMLElement, porCopia: number): number {
  const primera = pista.children[0] as HTMLElement | undefined;
  const equivalente = pista.children[porCopia] as HTMLElement | undefined;
  if (!primera || !equivalente) return 0;
  return equivalente.offsetLeft - primera.offsetLeft;
}

export function ProductCarousel({
  productos,
  conCategoria = true,
}: {
  productos: ProductCardData[];
  conCategoria?: boolean;
}) {
  const pista = useRef<HTMLUListElement>(null);
  const quieto = useRef(false);
  const ultimoToque = useRef(0);
  const arrastre = useRef<{ x: number; scroll: number } | null>(null);
  const huboArrastre = useRef(false);
  const [puede, setPuede] = useState({ atras: false, adelante: false });
  const esMovil = useEsMovil();

  // Con pocas piezas la vuelta sería un tirón cada dos segundos; a partir de
  // cuatro hay recorrido suficiente para que el paseo se lea como un paseo.
  const pasea = !esMovil && productos.length >= 4;
  const piezas = pasea ? [...productos, ...productos] : productos;

  const anotarToque = () => {
    ultimoToque.current = performance.now();
  };

  const medir = useCallback(() => {
    const nodo = pista.current;
    if (!nodo) return;
    const margen = 8; // el desplazamiento no cae en enteros exactos
    setPuede({
      atras: nodo.scrollLeft > margen,
      adelante: nodo.scrollLeft + nodo.clientWidth < nodo.scrollWidth - margen,
    });
  }, []);

  useEffect(() => {
    const nodo = pista.current;
    if (!nodo) return;

    medir();
    nodo.addEventListener("scroll", medir, { passive: true });

    // El ancho de la pista cambia con la ventana y también cuando cargan las
    // fotos; `ResizeObserver` cubre los dos casos sin escuchar el `load` de
    // cada imagen.
    const observador = new ResizeObserver(medir);
    observador.observe(nodo);

    return () => {
      nodo.removeEventListener("scroll", medir);
      observador.disconnect();
    };
  }, [medir]);

  /** El paseo. */
  useEffect(() => {
    const nodo = pista.current;
    if (!nodo || !pasea) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let anterior = performance.now();
    let cuadro = 0;
    // La posición se lleva aparte en coma flotante: sumar medio píxel a
    // `scrollLeft` no avanza nada, porque el navegador redondea al escribir.
    let posicion = nodo.scrollLeft;

    const paso = (ahora: number) => {
      const delta = (ahora - anterior) / 1000;
      anterior = ahora;

      const tocadoHacePoco = ahora - ultimoToque.current < ESPERA_TRAS_TOCAR;
      if (quieto.current || arrastre.current || tocadoHacePoco) {
        posicion = nodo.scrollLeft;
      } else {
        // Si algo movió la pista por fuera, se recoge su posición antes de
        // seguir sumando; si no, el paseo daría un salto hacia atrás.
        if (Math.abs(posicion - nodo.scrollLeft) > 2) posicion = nodo.scrollLeft;
        posicion += VELOCIDAD * delta;
        const vuelta = distanciaDeVuelta(nodo, productos.length);
        if (vuelta > 0 && posicion >= vuelta) posicion -= vuelta;
        nodo.scrollLeft = posicion;
      }

      cuadro = requestAnimationFrame(paso);
    };

    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [pasea, productos.length]);

  const mover = (sentido: 1 | -1) => {
    const nodo = pista.current;
    if (!nodo) return;
    anotarToque();
    const tarjeta = nodo.querySelector("li");
    // Se avanza por tarjetas enteras: un paso a medias deja la siguiente
    // cortada por la mitad justo donde se para.
    const paso = tarjeta ? tarjeta.getBoundingClientRect().width : nodo.clientWidth * 0.8;
    const cuantas = Math.max(1, Math.floor((nodo.clientWidth / paso) * 0.8));
    nodo.scrollBy({ left: paso * cuantas * sentido, behavior: "smooth" });
  };

  const alPulsar = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.button !== 0) return;
    const nodo = pista.current;
    if (!nodo) return;
    arrastre.current = { x: e.clientX, scroll: nodo.scrollLeft };
    huboArrastre.current = false;
    anotarToque();
  };

  useEffect(() => {
    const alMover = (e: PointerEvent) => {
      const inicio = arrastre.current;
      const nodo = pista.current;
      if (!inicio || !nodo) return;
      const recorrido = e.clientX - inicio.x;
      if (Math.abs(recorrido) > UMBRAL_ARRASTRE) huboArrastre.current = true;
      nodo.scrollLeft = inicio.scroll - recorrido;
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
  }, []);

  /** Arrastrar sobre una tarjeta no debe acabar abriendo su ficha. */
  const alHacerClic = (e: React.MouseEvent<HTMLUListElement>) => {
    if (!huboArrastre.current) return;
    e.preventDefault();
    e.stopPropagation();
    huboArrastre.current = false;
  };

  if (productos.length === 0) return null;

  return (
    <div>
      {(puede.atras || puede.adelante) && (
        <div className="mb-4 hidden items-center justify-end gap-2 md:flex">
          <Flecha
            sentido={-1}
            onClick={() => mover(-1)}
            disponible={puede.atras || pasea}
          />
          <Flecha
            sentido={1}
            onClick={() => mover(1)}
            disponible={puede.adelante || pasea}
          />
        </div>
      )}

      <ul
        ref={pista}
        onPointerDown={alPulsar}
        onClickCapture={alHacerClic}
        onMouseEnter={() => (quieto.current = true)}
        onMouseLeave={() => (quieto.current = false)}
        onFocusCapture={() => (quieto.current = true)}
        onBlurCapture={() => (quieto.current = false)}
        // Nada de `onScroll` para anotar el toque: el paseo mueve `scrollLeft` y
        // eso dispara `scroll`, así que la cinta se marcaría a sí misma como
        // «tocada hace un momento» y se pararía en el primer fotograma. Se
        // escuchan los gestos de la persona, que es lo que importa.
        onWheel={anotarToque}
        onTouchStart={anotarToque}
        onTouchMove={anotarToque}
        className="pista pista-sangrada gap-4"
      >
        {piezas.map((producto, indice) => {
          // La segunda copia existe para que la vuelta sea continua, pero para
          // el lector de pantalla y para el teclado la lista tiene tantos
          // artículos como hay de verdad.
          const copia = indice >= productos.length;
          return (
            <li
              key={`${producto.id}-${indice}`}
              className="w-[264px] shrink-0 sm:w-[288px]"
              {...(copia ? { "aria-hidden": true } : {})}
            >
              <ProductCard product={producto} showCategory={conCategoria} inerte={copia} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Flecha({
  sentido,
  onClick,
  disponible,
}: {
  sentido: 1 | -1;
  onClick: () => void;
  disponible: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!disponible}
      aria-label={sentido === -1 ? "Artículos anteriores" : "Artículos siguientes"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2 bg-canvas text-ink transition-colors hover:border-ink-3 hover:bg-paper disabled:opacity-35 disabled:hover:border-line-2 disabled:hover:bg-canvas"
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
