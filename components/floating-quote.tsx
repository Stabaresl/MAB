"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Botón de cotización que acompaña al visitante.
 *
 * El sitio no tiene carrito: todo lo que puede pasar aquí termina en una
 * conversación por WhatsApp o por correo. Hasta ahora esa puerta solo estaba en
 * la cabecera y al final de algunas secciones, así que a media ficha de
 * producto —justo donde alguien decide preguntar— había que volver arriba.
 *
 * No aparece de entrada. En la portada, el botón de cotizar está a la vista y
 * este solo taparía la foto; se asoma cuando el visitante ya ha bajado más de
 * media pantalla, que es cuando el de arriba dejó de estar.
 *
 * Abre las dos vías en vez de llevar directo a WhatsApp: en una compra de obra,
 * con referencias y cantidades, mucha gente prefiere el correo.
 *
 * Es lo único del sitio que lleva sombra, y va contra la regla del sistema de
 * diseño a sabiendas. La regla existe porque una sombra difusa sobre el lienzo
 * apila un relieve falso y ensucia la retícula; aquí no hay retícula debajo
 * sino lo que toque —una foto de producto, un bloque de arena, un párrafo—, y
 * un filete de un pixel sobre una foto no separa nada. Sin la sombra, el botón
 * se confunde con la imagen que tiene detrás.
 */

/** Cuánto hay que bajar para que aparezca: algo más de media pantalla. */
const APARECE_TRAS = 0.6;

export function FloatingQuote({ whatsapp, gmail }: { whatsapp: string; gmail: string }) {
  const [visible, setVisible] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mirar = () => {
      const pasado = window.scrollY > window.innerHeight * APARECE_TRAS;
      setVisible(pasado);
      // Si el visitante vuelve arriba con el menú abierto, se cierra: un menú
      // flotando sobre nada, sin botón que lo sostenga, se ve como un error.
      if (!pasado) setAbierto(false);
    };

    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    window.addEventListener("resize", mirar);
    return () => {
      window.removeEventListener("scroll", mirar);
      window.removeEventListener("resize", mirar);
    };
  }, []);

  useEffect(() => {
    if (!abierto) return;

    const fuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAbierto(false);
      boton.current?.focus();
    };

    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  if (!visible) return null;

  return (
    <div
      ref={contenedor}
      className="flotante fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3 md:bottom-7 md:right-7"
    >
      {abierto && (
        <div
          role="menu"
          className="entra w-64 overflow-hidden rounded-lg border border-line bg-canvas shadow-[0_10px_40px_-12px_rgba(16,34,47,0.28)]"
        >
          <Opcion href={whatsapp} etiqueta="Por WhatsApp" pie="Respuesta más rápida">
            <IconoWhatsapp />
          </Opcion>
          <Opcion href={gmail} etiqueta="Por correo" pie="Con la plantilla lista">
            <IconoCorreo />
          </Opcion>
        </div>
      )}

      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="btn flex min-h-14 items-center gap-2.5 rounded-full bg-accent px-5 text-on-accent shadow-[0_10px_30px_-10px_rgba(16,34,47,0.5)] hover:bg-accent-hover"
      >
        <span aria-hidden="true">{abierto ? <IconoCerrar /> : <IconoChat />}</span>
        {/* En pantalla estrecha el botón es solo el círculo: con la palabra al
            lado ocupaba un tercio del ancho y tapaba el contenido. */}
        <span className="hidden sm:inline">{abierto ? "Cerrar" : "Pedir cotización"}</span>
        <span className="sr-only sm:hidden">
          {abierto ? "Cerrar el menú de cotización" : "Pedir cotización"}
        </span>
      </button>
    </div>
  );
}

function Opcion({
  href,
  etiqueta,
  pie,
  children,
}: {
  href: string;
  etiqueta: string;
  pie: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      role="menuitem"
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-paper [&+&]:border-t [&+&]:border-line"
    >
      <span aria-hidden="true" className="text-accent">
        {children}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight text-ink">{etiqueta}</span>
        <span className="spec block text-ink-3">{pie}</span>
      </span>
    </a>
  );
}

function IconoChat() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 12c0 4.1-3.8 7.4-8.5 7.4-1 0-2-.15-2.9-.42L4 20.5l1.6-3.7A6.9 6.9 0 013.5 12c0-4.1 3.8-7.4 8.5-7.4s8.5 3.3 8.5 7.4z" />
      <path d="M8.8 12h6.4M8.8 9.2h4.6" />
    </svg>
  );
}

function IconoCerrar() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

function IconoWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0012.04 2zm0 18.15h-.01a8.23 8.23 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 015.83 2.42 8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

function IconoCorreo() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3 7.5l7.6 5.4a2.4 2.4 0 002.8 0L21 7.5" />
    </svg>
  );
}
