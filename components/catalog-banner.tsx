"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Banner del catálogo: las tres piezas gráficas de MAB, pasando solas.
 *
 * Es un fundido, no un desplazamiento. Con las tres imágenes apiladas y la
 * activa a opacidad 1, el navegador solo interpola opacidad —que va al
 * compositor— y no hay recolocación de nada. Un carrusel que mueve una pista
 * de 3×1376px obliga a repintar en cada fotograma para no ganar nada aquí: son
 * tres piezas independientes, no una cinta continua.
 *
 * Las tres están recortadas al mismo encuadre (1376×400) para que la sección no
 * cambie de alto al pasar de una a otra. Ese salto es el defecto clásico de un
 * carrusel con imágenes de proporciones distintas: el contenido de debajo pega
 * un brinco cada pocos segundos.
 *
 * En pantalla estrecha el recuadro se hace más alto y la imagen se ancla a la
 * derecha: el rótulo de las tres vive en esa mitad, y con el encuadre ancho a
 * 360px de ancho el texto quedaba a 40px de alto, ilegible.
 *
 * Con `prefers-reduced-motion` no pasa sola: se queda en la primera y los
 * puntos siguen sirviendo para verlas. Un fundido cada seis segundos en el
 * borde del ojo es exactamente lo que esa preferencia pide evitar.
 */

type Pieza = { archivo: string; alt: string };

const PIEZAS: Pieza[] = [
  {
    archivo: "/banners/banner-obra.webp",
    alt: "Sala de exhibición de Distribuciones M.A.B: 15 años de experiencia, todo para tu obra",
  },
  {
    archivo: "/banners/banner-acabados.webp",
    alt: "Materiales para acabados: cocinas, rejillas, lavaderos y más, con entrega directa en obra",
  },
  {
    archivo: "/banners/banner-plano.webp",
    alt: "Plano de un baño con los acabados señalados: grifería, lavabo, cimera y pavimento",
  },
];

/** Cuánto se queda cada una. Lo bastante para leer el rótulo sin esperar. */
const ESPERA = 6000;

export function CatalogBanner() {
  const [activa, setActiva] = useState(0);
  const [detenido, setDetenido] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const irA = useCallback((indice: number) => {
    setActiva(((indice % PIEZAS.length) + PIEZAS.length) % PIEZAS.length);
  }, []);

  useEffect(() => {
    if (detenido) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    temporizador.current = setTimeout(() => irA(activa + 1), ESPERA);
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [activa, detenido, irA]);

  return (
    <div
      // El paso automático se detiene mientras alguien mira o navega con
      // teclado: cambiar la imagen debajo del cursor es lo que hace que un
      // carrusel se sienta arrebatado.
      onMouseEnter={() => setDetenido(true)}
      onMouseLeave={() => setDetenido(false)}
      onFocusCapture={() => setDetenido(true)}
      onBlurCapture={() => setDetenido(false)}
      className="relative overflow-hidden rounded-xl border border-line"
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[2/1] md:aspect-[1376/400]">
        {PIEZAS.map((pieza, indice) => (
          <Image
            key={pieza.archivo}
            src={pieza.archivo}
            alt={indice === activa ? pieza.alt : ""}
            fill
            // La primera se carga con prioridad porque es lo primero que se ve
            // del catálogo; las otras dos pueden esperar su turno.
            priority={indice === 0}
            sizes="(max-width: 1240px) 100vw, 1240px"
            aria-hidden={indice !== activa}
            className={`object-cover object-right transition-opacity duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] md:object-center ${
              indice === activa ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Los puntos van sobre una pastilla clara: sobre las tres imágenes hay
          zonas blancas y zonas oscuras, y sin fondo desaparecían en unas y en
          otras no. */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-canvas/85 px-2.5 py-2 backdrop-blur md:bottom-5">
        {PIEZAS.map((pieza, indice) => (
          <button
            key={pieza.archivo}
            type="button"
            onClick={() => irA(indice)}
            aria-label={`Ver la imagen ${indice + 1} de ${PIEZAS.length}`}
            aria-current={indice === activa ? "true" : undefined}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span
              aria-hidden="true"
              className={`block rounded-full transition-all duration-300 ${
                indice === activa ? "h-2.5 w-6 bg-accent" : "h-2.5 w-2.5 bg-line-2"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
