"use client";

import { useEffect, useRef, useState } from "react";

import { StatIcon } from "@/components/stat-icon";
import type { StatCard } from "@/lib/catalog";

/**
 * Contadores que suben.
 *
 * El número no aparece de golpe: arranca en cero y sube frenando, cada vez más
 * despacio conforme se acerca a su valor. Esa frenada es el motivo de la
 * animación —si subiera a velocidad constante el ojo solo vería un borrón y el
 * último dígito clavándose— y la que hace que se lea el cambio.
 *
 * Tres decisiones que no son de adorno:
 *
 *  1. El HTML que sale del servidor ya lleva el número final. Sin JavaScript,
 *     con un lector de pantalla o en el resultado de un buscador, lo que se ve
 *     es el dato, no un cero. La cuenta la monta el navegador encima.
 *  2. Solo empieza cuando el bloque entra en pantalla. Animar algo que está a
 *     tres pantallas de distancia significa que, cuando el visitante llega, ya
 *     terminó y no vio nada.
 *  3. `aria-hidden` sobre la cifra en movimiento y el valor final en un texto
 *     solo para lectores: quien navega con voz no necesita oír «uno, cuatro,
 *     once, veintitrés…» sesenta veces.
 */

/** Cuánto dura la subida. Lo bastante para verla, poco para no estorbar. */
const DURACION = 1800;

/**
 * Frenada.
 *
 * `1 - (1-t)⁴` recorre el 68% del camino en el primer cuarto del tiempo y
 * dedica el último cuarto a los últimos 4 números. Con una cúbica la frenada se
 * notaba poco; con una quinta el final se hacía largo y parecía atascado.
 */
function frenar(t: number): number {
  const resto = 1 - t;
  return 1 - resto * resto * resto * resto;
}

export function Counters({ indicadores }: { indicadores: StatCard[] }) {
  if (indicadores.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
      {indicadores.map((indicador) => (
        <li key={indicador.id} className="bg-canvas p-6 md:p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sun-soft text-sun-ink">
            <StatIcon nombre={indicador.icon} />
          </span>
          <p className="mt-5">
            <Cifra valor={indicador.value} sufijo={indicador.suffix} />
          </p>
          <p className="mt-1.5 text-[14px] leading-snug text-ink-2">{indicador.label}</p>
        </li>
      ))}
    </ul>
  );
}

function Cifra({ valor, sufijo }: { valor: number; sufijo: string | null }) {
  const [mostrado, setMostrado] = useState(valor);
  const nodo = useRef<HTMLSpanElement>(null);
  const arrancado = useRef(false);

  useEffect(() => {
    const elemento = nodo.current;
    if (!elemento) return;

    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido || valor === 0) return;

    // Se baja a cero antes de que el bloque llegue a pantalla. Si estuviera ya
    // visible al cargar, el salto dura un fotograma; en el caso normal —los
    // contadores viven a media página de la portada— nadie lo ve.
    setMostrado(0);

    let cuadro = 0;
    const observador = new IntersectionObserver(
      (entradas) => {
        const dentro = entradas.some((e) => e.isIntersecting);
        if (!dentro || arrancado.current) return;
        arrancado.current = true;
        observador.disconnect();

        const inicio = performance.now();
        const paso = (ahora: number) => {
          const avance = Math.min(1, (ahora - inicio) / DURACION);
          setMostrado(Math.round(valor * frenar(avance)));
          if (avance < 1) cuadro = requestAnimationFrame(paso);
        };
        cuadro = requestAnimationFrame(paso);
      },
      // Un poco antes del borde: así el número ya está subiendo cuando el
      // bloque acaba de entrar, y no arranca con el visitante mirándolo fijo.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.2 },
    );

    observador.observe(elemento);
    return () => {
      observador.disconnect();
      cancelAnimationFrame(cuadro);
    };
  }, [valor]);

  const formateado = new Intl.NumberFormat("es-CO").format(mostrado);
  const final = new Intl.NumberFormat("es-CO").format(valor);

  return (
    <span ref={nodo} className="block">
      <span aria-hidden="true" className="cifra text-[clamp(2rem,5vw,2.9rem)] text-ink">
        {formateado}
        {sufijo && <span className="text-sun-ink">{sufijo}</span>}
      </span>
      <span className="sr-only">
        {final}
        {sufijo}
      </span>
    </span>
  );
}
