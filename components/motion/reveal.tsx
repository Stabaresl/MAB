import type { ReactNode } from "react";

/**
 * Apariciones al hacer scroll.
 *
 * El contenido se marca con atributos y lo anima el CSS, no React. Eso importa
 * por una razón concreta: si el estado inicial "invisible" lo pusiera el
 * componente, cualquier fallo del observador —o simplemente JavaScript
 * desactivado— dejaría media página en blanco para siempre. Aquí el estado
 * oculto solo existe cuando la clase `js` está en <html>, que la pone un script
 * en línea antes del primer pintado, y un único IntersectionObserver va
 * marcando los bloques como vistos.
 *
 * Con `prefers-reduced-motion` el CSS desactiva el desplazamiento y deja solo
 * un cambio de opacidad muy corto.
 */

type Direccion = "arriba" | "izquierda" | "derecha" | "escala";

export function Reveal({
  children,
  direccion = "arriba",
  retraso = 0,
  className,
}: {
  children: ReactNode;
  direccion?: Direccion;
  retraso?: number;
  className?: string;
}) {
  return (
    <div
      data-reveal={direccion}
      style={retraso ? { transitionDelay: `${retraso}s` } : undefined}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * Lista cuyos hijos entran escalonados, para poder leer la rejilla en vez de
 * recibirla de golpe. El retraso se calcula en CSS a partir del índice.
 */
export function Stagger({
  children,
  className,
  as: Componente = "div",
}: {
  children: ReactNode;
  className?: string;
  paso?: number;
  as?: "div" | "ul" | "ol";
}) {
  return (
    <Componente data-stagger="" className={className}>
      {children}
    </Componente>
  );
}

export function StaggerItem({
  children,
  className,
  as: Componente = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  return (
    <Componente data-stagger-item="" className={className}>
      {children}
    </Componente>
  );
}
