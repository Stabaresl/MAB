"use client";

import { useEffect, useState } from "react";

/** Mismo corte que `md:` en Tailwind. */
const MOVIL = "(max-width: 767px)";

/**
 * ¿Estamos en una pantalla de móvil?
 *
 * Devuelve `false` en el primer render —el servidor no sabe el ancho— y el
 * valor real tras montar. Eso es a propósito: el marcado que se envía es el de
 * escritorio, así que la hidratación no encuentra diferencias, y el ajuste a
 * móvil ocurre en el mismo fotograma en el que el navegador ya puede medir.
 *
 * Se usa para lo que no se puede resolver con una media query en CSS: apagar un
 * bucle de animación o dejar de duplicar nodos en el DOM. Todo lo que sea
 * cuestión de estilo debe seguir viviendo en CSS.
 */
export function useEsMovil(): boolean {
  const [esMovil, setEsMovil] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia(MOVIL);
    const sincronizar = () => setEsMovil(consulta.matches);

    sincronizar();
    consulta.addEventListener("change", sincronizar);
    return () => consulta.removeEventListener("change", sincronizar);
  }, []);

  return esMovil;
}
