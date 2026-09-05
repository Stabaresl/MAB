"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { site } from "@/lib/site";
import { useEsMovil } from "@/lib/use-es-movil";

/**
 * Carrusel de clientes.
 *
 * Cada ficha crece a medida que se acerca al centro de la pista y vuelve a su
 * tamaño al alejarse, así que la vista tiene un foco en vez de trece casillas
 * iguales. El puntero encima adelanta ese mismo aumento sin esperar a que la
 * ficha llegue al medio.
 *
 * La escala se calcula midiendo la distancia de cada ficha al centro en cada
 * fotograma, no con `scroll-snap` ni con puntos fijos: la cinta avanza sola y
 * se puede empujar a mano, así que la posición no cae en valores redondos casi
 * nunca. Trece medidas por fotograma no cuestan nada, y solo se escribe en el
 * elemento cuando el valor cambia lo suficiente como para verse.
 *
 * De los trece clientes del portafolio hay logotipo de seis: los demás no tienen
 * sitio alcanzable o no publican el archivo. Todas las fichas llevan el nombre
 * debajo, así que la que no tiene logotipo no se lee como un hueco.
 */

/** Clientes de los que hay archivo, por el nombre exacto de `lib/site.ts`. */
const LOGOTIPOS: Record<string, string> = {
  "Grupo Área": "grupoarea",
  Colpatria: "colpatria",
  "Infante Vives": "infantevives",
  Prodesa: "prodesa",
  "CFC Constructora": "cfc",
  "Gran Morada": "granmorada",
};

const VELOCIDAD = 26;          // píxeles por segundo del avance automático
const ESPERA_TRAS_TOCAR = 2200;
const UMBRAL_ARRASTRE = 6;

/**
 * Cuánto hay que avanzar para que la segunda copia caiga donde estaba la
 * primera.
 *
 * Se mide entre dos fichas equivalentes y no dividiendo el ancho total entre
 * dos: la pista lleva relleno a los lados para que los extremos puedan llegar
 * al centro, y ese relleno no forma parte de la vuelta. Dividiendo el ancho
 * salía un salto visible en cada pasada.
 */
function distanciaDeVuelta(pista: HTMLElement, porCopia: number): number {
  const primera = pista.children[0] as HTMLElement | undefined;
  const equivalente = pista.children[porCopia] as HTMLElement | undefined;
  if (!primera || !equivalente) return 0;
  return equivalente.offsetLeft - primera.offsetLeft;
}

export function ClientWall() {
  const pista = useRef<HTMLUListElement>(null);
  const quieto = useRef(false);
  const ultimoToque = useRef(0);
  const arrastre = useRef<{ x: number; scroll: number } | null>(null);
  const huboArrastre = useRef(false);
  const [pausado, setPausado] = useState(false);
  const esMovil = useEsMovil();

  // Tres copias, no dos. Con dos, la vitrina empieza y acaba en un extremo de
  // la lista y se ve medio ancho de pista vacío hasta que el avance la llena.
  // Con tres se arranca en la copia del medio, que siempre tiene fichas a
  // izquierda y derecha, y la vuelta salta de una copia a la siguiente sin que
  // el ojo lo note.
  const COPIAS = 3;
  const piezas = Array.from({ length: COPIAS }, () => site.clients).flat();

  const anotarToque = () => {
    ultimoToque.current = performance.now();
  };

  /** Escala y opacidad de cada ficha según lo cerca que esté del centro. */
  const enfocar = useCallback(() => {
    const nodo = pista.current;
    if (!nodo) return;
    const centro = nodo.getBoundingClientRect().left + nodo.clientWidth / 2;
    // El alcance decide cuántas fichas notan el efecto: media pista a cada lado.
    const alcance = nodo.clientWidth / 2;

    for (const ficha of Array.from(nodo.children) as HTMLElement[]) {
      const caja = ficha.getBoundingClientRect();
      const distancia = Math.abs(caja.left + caja.width / 2 - centro);
      const cercania = Math.max(0, 1 - distancia / alcance);
      // Al cuadrado: el aumento se concentra en el centro en vez de repartirse
      // por igual y dejar toda la fila a medio crecer.
      const peso = cercania * cercania;
      ficha.style.setProperty("--cercania", peso.toFixed(3));
    }
  }, []);

  useEffect(() => {
    const nodo = pista.current;
    if (!nodo) return;

    // Se arranca en la copia del medio para tener fichas a los dos lados.
    const vueltaInicial = distanciaDeVuelta(nodo, site.clients.length);
    if (vueltaInicial > 0 && nodo.scrollLeft < 1) nodo.scrollLeft = vueltaInicial;

    let anterior = performance.now();
    let cuadro = 0;
    // La posición se lleva aparte en coma flotante: sumar medio píxel a
    // `scrollLeft` no avanza, porque el navegador redondea al escribir.
    let posicion = nodo.scrollLeft;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paso = (ahora: number) => {
      const delta = (ahora - anterior) / 1000;
      anterior = ahora;

      const tocadoHacePoco = ahora - ultimoToque.current < ESPERA_TRAS_TOCAR;
      if (reducido || pausado || quieto.current || arrastre.current || tocadoHacePoco) {
        posicion = nodo.scrollLeft;
      } else {
        if (Math.abs(posicion - nodo.scrollLeft) > 2) posicion = nodo.scrollLeft;
        posicion += VELOCIDAD * delta;
        // El recorrido vive entre una copia y la siguiente: al pasar de la
        // segunda se retrocede una, y así nunca se llega a los extremos.
        const vuelta = distanciaDeVuelta(nodo, site.clients.length);
        if (vuelta > 0 && posicion >= vuelta * 2) posicion -= vuelta;
        nodo.scrollLeft = posicion;
      }

      enfocar();
      cuadro = requestAnimationFrame(paso);
    };

    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [pausado, enfocar]);

  const mover = (sentido: 1 | -1) => {
    const nodo = pista.current;
    if (!nodo) return;
    anotarToque();
    const paso = nodo.clientWidth * 0.6;
    if (sentido === -1 && nodo.scrollLeft < paso) {
      nodo.scrollLeft += distanciaDeVuelta(nodo, site.clients.length);
    }
    nodo.scrollBy({ left: paso * sentido, behavior: "smooth" });
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

  /*
   * En móvil no hay carrusel: hay una rejilla.
   *
   * El aumento por cercanía necesita un centro y sitio a los lados para que se
   * note; en 360px de ancho no hay ni una cosa ni la otra, y lo que se veía era
   * una ficha a medias, otra entera y otra a medias, todas del mismo tamaño. En
   * dos columnas caben los trece clientes de un vistazo, que es justo lo que
   * esta sección quiere demostrar.
   */
  if (esMovil) {
    return (
      <ul className="grid grid-cols-2 gap-3">
        {site.clients.map((cliente) => (
          <li key={cliente}>
            <Ficha cliente={cliente} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2">
        <Flecha sentido={-1} onClick={() => mover(-1)} />
        <Flecha sentido={1} onClick={() => mover(1)} />
        <button
          type="button"
          onClick={() => setPausado((p) => !p)}
          aria-pressed={pausado}
          className="ml-1 inline-flex h-11 items-center rounded-full border border-line-2 bg-canvas px-4 text-[13.5px] font-semibold text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
        >
          {pausado ? "Reanudar" : "Pausar"}
        </button>
      </div>

      <ul
        ref={pista}
        onPointerDown={alPulsar}
        onMouseEnter={() => (quieto.current = true)}
        onMouseLeave={() => (quieto.current = false)}
        onFocusCapture={() => (quieto.current = true)}
        onBlurCapture={() => (quieto.current = false)}
        onWheel={anotarToque}
        onTouchStart={anotarToque}
        onTouchMove={anotarToque}
        className="vitrina mt-5"
      >
        {piezas.map((cliente, indice) => {
          // Solo la primera copia existe para el lector de pantalla: las otras
          // dos están ahí para que la vuelta sea continua.
          const copia = indice >= site.clients.length;
          return (
            <li
              key={`${cliente}-${indice}`}
              className="vitrina-ficha"
              {...(copia ? { "aria-hidden": true } : {})}
            >
              <Ficha cliente={cliente} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Una ficha de cliente: logotipo si lo hay, y el nombre siempre.
 *
 * El nombre no es un pie del logotipo, es el dato: de los trece clientes solo
 * seis publican un archivo utilizable, y con el nombre debajo de todas las
 * fichas la que no tiene logotipo se lee como una más y no como un hueco.
 */
function Ficha({ cliente }: { cliente: string }) {
  const archivo = LOGOTIPOS[cliente];

  return (
    <div className="card flex h-[132px] flex-col items-center justify-center gap-3 px-4 py-4">
      {archivo ? (
        <Image
          src={`/clientes/${archivo}.webp`}
          alt=""
          width={400}
          height={200}
          draggable={false}
          sizes="200px"
          className="max-h-9 w-auto max-w-[85%] rounded-md object-contain"
        />
      ) : (
        <span aria-hidden="true" className="flex h-8 items-center">
          <Rombo />
        </span>
      )}
      <span className="text-balance text-center font-display text-[15px] leading-tight text-ink-2">
        {cliente}
      </span>
    </div>
  );
}

/** Marca para las fichas sin logotipo, para que la altura no baile. */
function Rombo() {
  return (
    <svg viewBox="0 0 8 8" aria-hidden="true" className="h-2 w-2 text-accent" fill="currentColor">
      <path d="M4 0l4 4-4 4-4-4z" />
    </svg>
  );
}

function Flecha({ sentido, onClick }: { sentido: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={sentido === -1 ? "Clientes anteriores" : "Clientes siguientes"}
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
