"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Visor 360 de producto.
 *
 * Los 36 fotogramas viven en una sola hoja de sprites de 6x6. Eso decide casi
 * todo el diseño: hay una petición y una decodificación, y girar es mover
 * `background-position`, sin cargar ni descodificar nada más. Con 36 archivos
 * sueltos serían 36 peticiones, 1 MB en vez de 407 KB y un parpadeo en cada
 * cambio de fotograma.
 *
 * La hoja no se pide hasta que el visor entra en pantalla. Antes se ve el
 * fotograma de portada, que pesa 18 KB.
 *
 * La regla de marcas hace de control deslizante: es un `role="slider"` real,
 * con teclado e incrementos, en vez de un `input[type=range]` disfrazado.
 */

const COLUMNAS = 6;
const FILAS = 6;
const TOTAL = COLUMNAS * FILAS;
const GRADOS_POR_PASO = 360 / TOTAL;
/** Píxeles de arrastre que equivalen a una vuelta completa sobre la imagen. */
const RECORRIDO = 520;

type Props = {
  sprite: string;
  poster: string;
  nombre: string;
  acabado?: string;
  className?: string;
};

export function TurntableViewer({ sprite, poster, nombre, acabado, className }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const regla = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [cargado, setCargado] = useState(false);
  const [fotograma, setFotograma] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [tocado, setTocado] = useState(false);

  const arrastre = useRef({ x: 0, inicio: 0 });
  const giroAuto = useRef<number | null>(null);

  // --- Carga diferida ------------------------------------------------------
  useEffect(() => {
    const nodo = contenedor.current;
    if (!nodo) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const imagen = new Image();
    imagen.onload = () => setCargado(true);
    // Un fallo de red no puede dejar el visor en un cargador eterno: se marca
    // como cargado y se queda con la portada.
    imagen.onerror = () => setCargado(true);
    imagen.src = sprite;
  }, [visible, sprite]);

  // --- Giro automático mientras nadie toca ---------------------------------
  useEffect(() => {
    if (!cargado || tocado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ultimo = performance.now();
    let acumulado = 0;

    const paso = (ahora: number) => {
      acumulado += ahora - ultimo;
      ultimo = ahora;
      // Una vuelta cada ~7 s: se nota que gira sin llegar a distraer.
      if (acumulado > 190) {
        acumulado = 0;
        setFotograma((f) => (f + 1) % TOTAL);
      }
      giroAuto.current = requestAnimationFrame(paso);
    };

    giroAuto.current = requestAnimationFrame(paso);
    return () => {
      if (giroAuto.current !== null) cancelAnimationFrame(giroAuto.current);
    };
  }, [cargado, tocado]);

  // --- Arrastre sobre la imagen -------------------------------------------
  const mover = useCallback((x: number) => {
    const recorrido = x - arrastre.current.x;
    const avance = Math.round((recorrido / RECORRIDO) * TOTAL);
    // El módulo de JavaScript devuelve negativos: se normaliza para que girar
    // hacia la izquierda dé la vuelta en vez de salirse del rango.
    setFotograma((((arrastre.current.inicio - avance) % TOTAL) + TOTAL) % TOTAL);
  }, []);

  useEffect(() => {
    if (!arrastrando) return;
    const alMover = (e: PointerEvent) => mover(e.clientX);
    const alSoltar = () => setArrastrando(false);
    window.addEventListener("pointermove", alMover);
    window.addEventListener("pointerup", alSoltar);
    window.addEventListener("pointercancel", alSoltar);
    return () => {
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerup", alSoltar);
      window.removeEventListener("pointercancel", alSoltar);
    };
  }, [arrastrando, mover]);

  // --- Regla de marcas -----------------------------------------------------
  const desdeRegla = useCallback((clientX: number) => {
    const caja = regla.current?.getBoundingClientRect();
    if (!caja) return;
    const proporcion = Math.min(Math.max((clientX - caja.left) / caja.width, 0), 1);
    setFotograma(Math.round(proporcion * (TOTAL - 1)));
  }, []);

  const [arrastrandoRegla, setArrastrandoRegla] = useState(false);

  useEffect(() => {
    if (!arrastrandoRegla) return;
    const alMover = (e: PointerEvent) => desdeRegla(e.clientX);
    const alSoltar = () => setArrastrandoRegla(false);
    window.addEventListener("pointermove", alMover);
    window.addEventListener("pointerup", alSoltar);
    return () => {
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerup", alSoltar);
    };
  }, [arrastrandoRegla, desdeRegla]);

  const girar = (pasos: number) => {
    setTocado(true);
    setFotograma((f) => (((f + pasos) % TOTAL) + TOTAL) % TOTAL);
  };

  const conTeclado = (e: React.KeyboardEvent) => {
    const acciones: Record<string, () => void> = {
      ArrowRight: () => girar(1),
      ArrowUp: () => girar(1),
      ArrowLeft: () => girar(-1),
      ArrowDown: () => girar(-1),
      PageUp: () => girar(3),
      PageDown: () => girar(-3),
      Home: () => {
        setTocado(true);
        setFotograma(0);
      },
      End: () => {
        setTocado(true);
        setFotograma(TOTAL - 1);
      },
    };
    const accion = acciones[e.key];
    if (!accion) return;
    e.preventDefault();
    accion();
  };

  const columna = fotograma % COLUMNAS;
  const fila = Math.floor(fotograma / COLUMNAS);
  const grados = Math.round(fotograma * GRADOS_POR_PASO);
  const gradosTexto = String(grados).padStart(3, "0");

  const fondo = cargado
    ? {
        backgroundImage: `url(${sprite})`,
        backgroundSize: `${COLUMNAS * 100}% ${FILAS * 100}%`,
        backgroundPosition: `${(columna / (COLUMNAS - 1)) * 100}% ${(fila / (FILAS - 1)) * 100}%`,
      }
    : { backgroundImage: `url(${poster})`, backgroundSize: "100% 100%" };

  return (
    <div ref={contenedor} className={className}>
      <figure className="border border-line bg-paper">
        {/* Cabecera del visor: qué se está viendo y en qué ángulo. */}
        <div className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3">
          <span className="label text-ink-3">
            Vista 360{acabado ? ` · ${acabado}` : ""}
          </span>
          <span className="font-display text-[17px] leading-none text-ink-2 tabular-nums">
            {gradosTexto}°
          </span>
        </div>

        <div
          onPointerDown={(e) => {
            e.preventDefault();
            setArrastrando(true);
            setTocado(true);
            arrastre.current = { x: e.clientX, inicio: fotograma };
          }}
          style={fondo}
          className={`relative aspect-square w-full touch-pan-y select-none bg-center bg-no-repeat ${
            arrastrando ? "cursor-grabbing" : "cursor-grab"
          }`}
          role="presentation"
        >
          {!cargado && (
            <span className="spec absolute inset-x-0 bottom-4 text-center text-ink-3">
              Cargando vista 360…
            </span>
          )}
        </div>

        {/* Regla de marcas: control real, no decoración. */}
        <div className="border-t border-line px-4 pb-4 pt-4">
          <div
            ref={regla}
            role="slider"
            tabIndex={0}
            aria-label={`Girar ${nombre}`}
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuenow={grados}
            aria-valuetext={`${grados} grados`}
            onKeyDown={conTeclado}
            onPointerDown={(e) => {
              e.preventDefault();
              setTocado(true);
              setArrastrandoRegla(true);
              desdeRegla(e.clientX);
            }}
            className="flex h-9 cursor-ew-resize touch-none items-center justify-between gap-px"
          >
            {Array.from({ length: TOTAL }).map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`w-px shrink-0 rounded-full transition-[height,background-color] duration-200 ${
                  i === fotograma
                    ? "h-6 bg-ink"
                    : i % 3 === 0
                      ? "h-3.5 bg-line-2"
                      : "h-2.5 bg-line"
                }`}
              />
            ))}
          </div>

          <div className="mt-2 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => girar(-1)}
              aria-label="Girar a la izquierda"
              className="flex h-8 w-8 items-center justify-center text-ink-3 transition-colors hover:text-ink"
            >
              <Chevron direccion="izquierda" />
            </button>
            <span className="label text-ink-3">
              {tocado ? `${TOTAL} pasos · ${GRADOS_POR_PASO}°` : "Arrastre para girar"}
            </span>
            <button
              type="button"
              onClick={() => girar(1)}
              aria-label="Girar a la derecha"
              className="flex h-8 w-8 items-center justify-center text-ink-3 transition-colors hover:text-ink"
            >
              <Chevron direccion="derecha" />
            </button>
          </div>
        </div>
      </figure>
    </div>
  );
}

/**
 * Tira con doce de los treinta y seis pasos.
 *
 * Sale de la misma hoja de sprites que el visor, así que no cuesta ni una
 * petición más: son doce `div` con distinto `background-position`.
 */
export function TurntableStrip({ sprite, className }: { sprite: string; className?: string }) {
  const pasos = Array.from({ length: 12 }, (_, i) => i * 3);

  return (
    <ul className={`grid grid-cols-6 gap-px sm:grid-cols-12 ${className ?? ""}`} aria-hidden="true">
      {pasos.map((indice) => (
        <li
          key={indice}
          className="aspect-square bg-paper"
          style={{
            backgroundImage: `url(${sprite})`,
            backgroundSize: `${COLUMNAS * 100}% ${FILAS * 100}%`,
            backgroundPosition: `${((indice % COLUMNAS) / (COLUMNAS - 1)) * 100}% ${
              (Math.floor(indice / COLUMNAS) / (FILAS - 1)) * 100
            }%`,
          }}
        />
      ))}
    </ul>
  );
}

function Chevron({ direccion }: { direccion: "izquierda" | "derecha" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direccion === "izquierda" ? <path d="M12 4l-6 6 6 6" /> : <path d="M8 4l6 6-6 6" />}
    </svg>
  );
}
