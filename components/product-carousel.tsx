"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/product-card";
import type { ProductCard as ProductCardData } from "@/lib/catalog";

/**
 * Carrusel de artículos.
 *
 * Es una pista con desplazamiento de verdad, no una animación de `transform`.
 * Esa es la decisión que lo sostiene: el visitante puede empujarla con el dedo,
 * con la rueda, arrastrando con el ratón o con las flechas, y todo eso es la
 * misma propiedad —`scrollLeft`— en vez de tres mecanismos peleándose. Con una
 * animación, la cinta se vería mover pero sería intocable.
 *
 * No pasa sola, y ahí se separa del cinturón de categorías que hubo antes. Una
 * cinta que avanza por su cuenta funciona con diez etiquetas que se leen de un
 * vistazo; con ocho fotos de producto, no: quien se para a mirar una se la
 * encuentra desplazada a mitad de frase. Aquí el movimiento siempre lo pide
 * alguien.
 *
 * Las flechas aparecen solo si hay algo a lo que ir. En una pantalla ancha con
 * cinco artículos caben todos y dos flechas muertas serían dos botones que no
 * hacen nada; en móvil no aparecen nunca porque ahí se empuja con el dedo y
 * ocuparían el sitio del titular.
 */

/** Píxeles a partir de los cuales un movimiento deja de ser un clic tembloroso. */
const UMBRAL_ARRASTRE = 6;

export function ProductCarousel({
  productos,
  conCategoria = true,
}: {
  productos: ProductCardData[];
  conCategoria?: boolean;
}) {
  const pista = useRef<HTMLUListElement>(null);
  const arrastre = useRef<{ x: number; scroll: number } | null>(null);
  const huboArrastre = useRef(false);
  const [puede, setPuede] = useState({ atras: false, adelante: false });

  const medir = useCallback(() => {
    const nodo = pista.current;
    if (!nodo) return;
    const margen = 8; // tolerancia: el desplazamiento no cae en enteros exactos
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
    // fotos; `ResizeObserver` cubre los dos casos sin escuchar `load` de cada
    // imagen.
    const observador = new ResizeObserver(medir);
    observador.observe(nodo);

    return () => {
      nodo.removeEventListener("scroll", medir);
      observador.disconnect();
    };
  }, [medir]);

  const mover = (sentido: 1 | -1) => {
    const nodo = pista.current;
    if (!nodo) return;
    const tarjeta = nodo.querySelector("li");
    // Se avanza por tarjetas enteras, no por un porcentaje del ancho: con el
    // imán puesto, un paso a medias acaba encajando donde quiera el navegador.
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
  };

  useEffect(() => {
    const alMover = (e: PointerEvent) => {
      const inicio = arrastre.current;
      const nodo = pista.current;
      if (!inicio || !nodo) return;
      const recorrido = e.clientX - inicio.x;
      if (Math.abs(recorrido) > UMBRAL_ARRASTRE) huboArrastre.current = true;
      nodo.scrollLeft = inicio.scroll - recorrido;
    };
    const alSoltar = () => {
      arrastre.current = null;
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
          <Flecha sentido={-1} onClick={() => mover(-1)} disponible={puede.atras} />
          <Flecha sentido={1} onClick={() => mover(1)} disponible={puede.adelante} />
        </div>
      )}

      <ul
        ref={pista}
        onPointerDown={alPulsar}
        onClickCapture={alHacerClic}
        className="pista pista-sangrada gap-4"
      >
        {productos.map((producto) => (
          <li
            key={producto.id}
            className="w-[264px] shrink-0 sm:w-[288px]"
          >
            <ProductCard product={producto} showCategory={conCategoria} />
          </li>
        ))}
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
