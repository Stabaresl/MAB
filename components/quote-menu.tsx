"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Botón de cotización con las dos vías de contacto.
 *
 * Antes llevaba directo a WhatsApp, que deja fuera a quien prefiere escribir un
 * correo —y en una compra de obra, con referencias y cantidades, el correo es a
 * menudo lo que hace falta—. Ahora el botón abre las dos y quien pulsa elige.
 *
 * Es un menú, no un desplegable de formulario: se cierra al pulsar fuera, con
 * Escape y al elegir, y el foco vuelve al botón para que quien navega con
 * teclado no se quede al final del documento.
 */
export function QuoteMenu({
  whatsapp,
  gmail,
  className = "",
}: {
  whatsapp: string;
  gmail: string;
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

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

  return (
    <div ref={contenedor} className={`relative ${className}`}>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="btn btn-primary"
      >
        Pedir cotización
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className={`h-2.5 w-2.5 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 4.5l4 4 4-4" />
        </svg>
      </button>

      {abierto && (
        <div
          role="menu"
          className="entra absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-lg border border-line bg-canvas"
        >
          <Opcion href={whatsapp} etiqueta="Por WhatsApp" pie="Respuesta más rápida">
            <IconoWhatsapp />
          </Opcion>
          <Opcion href={gmail} etiqueta="Por correo" pie="Con la plantilla lista">
            <IconoCorreo />
          </Opcion>
        </div>
      )}
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
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper [&+&]:border-t [&+&]:border-line"
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
