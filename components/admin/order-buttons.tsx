"use client";

/**
 * Subir y bajar un elemento de una lista.
 *
 * Cada botón dice en su etiqueta a qué fila pertenece —«Subir Colpatria»— y no
 * solo «Subir». Con diez filas iguales, un lector de pantalla que anuncia
 * veinte botones llamados «Subir» y «Bajar» no permite saber cuál se está
 * pulsando; el nombre lo resuelve sin ocupar sitio en la pantalla.
 *
 * Los extremos se deshabilitan en vez de esconderse: si el botón desapareciera,
 * la fila cambiaría de ancho y las demás se moverían al reordenar.
 */
export function OrderButtons({
  indice,
  total,
  deshabilitado,
  onMover,
  que,
}: {
  indice: number;
  total: number;
  deshabilitado: boolean;
  onMover: (salto: -1 | 1) => void;
  que: string;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <Boton
        etiqueta={`Subir ${que}`}
        deshabilitado={deshabilitado || indice === 0}
        onClick={() => onMover(-1)}
        sentido="arriba"
      />
      <Boton
        etiqueta={`Bajar ${que}`}
        deshabilitado={deshabilitado || indice === total - 1}
        onClick={() => onMover(1)}
        sentido="abajo"
      />
    </div>
  );
}

function Boton({
  etiqueta,
  deshabilitado,
  onClick,
  sentido,
}: {
  etiqueta: string;
  deshabilitado: boolean;
  onClick: () => void;
  sentido: "arriba" | "abajo";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      aria-label={etiqueta}
      title={etiqueta}
      className="flex h-7 w-7 items-center justify-center rounded border border-line-2 bg-canvas text-ink-2 transition-colors hover:border-ink-3 hover:text-ink disabled:opacity-35 disabled:hover:border-line-2"
    >
      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className="h-2.5 w-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {sentido === "arriba" ? <path d="M2 7.5l4-4 4 4" /> : <path d="M2 4.5l4 4 4-4" />}
      </svg>
    </button>
  );
}
