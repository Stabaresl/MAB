/**
 * Separador en onda entre secciones.
 *
 * Sustituye al filete recto donde cambia el color de fondo. La pieza se dibuja
 * DENTRO de la sección que empieza, pero pintada del color de la que termina:
 * así el color anterior invade unos píxeles la nueva sección con un borde
 * curvo, que es lo que hace la transición. El color entra por `currentColor`,
 * de modo que se elige con una clase de texto del sistema (`text-canvas`,
 * `text-paper`…) y nunca con un valor suelto.
 *
 * `preserveAspectRatio="none"` deja que la onda se estire a lo ancho: importa
 * que la curva cruce toda la pantalla, no que conserve su proporción. Y la
 * altura es menor en móvil, donde una onda alta se comería la pantalla.
 *
 * Es decorativa: va con `aria-hidden` y no lleva texto.
 */
export function Onda({
  posicion,
  className = "",
}: {
  /** `arriba` cierra la sección anterior; `abajo` anuncia la siguiente. */
  posicion: "arriba" | "abajo";
  className?: string;
}) {
  // Tres valles de distinta amplitud: una onda de amplitud constante se lee
  // como un adorno de plantilla; esta parece trazada.
  const camino =
    posicion === "arriba"
      ? "M0 0h1440v22c-210 34-330-16-528-4S612 62 396 46 138 6 0 30Z"
      : "M0 60h1440V38c-210-34-330 16-528 4S612-2 396 14 138 54 0 30Z";

  return (
    <svg
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={`block h-6 w-full md:h-10 ${className}`}
    >
      <path d={camino} fill="currentColor" />
    </svg>
  );
}
