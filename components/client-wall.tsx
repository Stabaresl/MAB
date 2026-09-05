import { site } from "@/lib/site";

/**
 * Muro de clientes.
 *
 * Sin logotipos, y a propósito. El portafolio de MAB no los trae —la página 23
 * es una lista de nombres— y bajarlos de internet daría marcas de terceros sin
 * permiso, en resoluciones dispares y a veces desactualizadas: trece imágenes
 * de distinta calidad puestas en fila se ven peor que trece nombres bien
 * compuestos. Cuando la empresa consiga los archivos, entran aquí sin tocar
 * nada más.
 *
 * Así que el peso lo lleva la tipografía. Los nombres van en la serifa de
 * display, a tamaño grande y en un párrafo continuo separado por rombos, como
 * el reparto de un cartel. Se lee como una sola frase —«estos son los que
 * confían»— en vez de como trece casillas iguales.
 */
export function ClientWall() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-7">
      {site.clients.map((cliente, i) => (
        <li key={cliente} className="flex items-center gap-5 sm:gap-7">
          <span className="font-display text-[clamp(1.15rem,2.6vw,1.9rem)] leading-tight text-ink-2">
            {cliente}
          </span>
          {i < site.clients.length - 1 && <Rombo />}
        </li>
      ))}
    </ul>
  );
}

/** Separador entre nombres. En SVG y no un carácter, para controlar el tamaño. */
function Rombo() {
  return (
    <svg
      viewBox="0 0 8 8"
      aria-hidden="true"
      className="h-1.5 w-1.5 shrink-0 text-accent"
      fill="currentColor"
    >
      <path d="M4 0l4 4-4 4-4-4z" />
    </svg>
  );
}
