"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Enlace = { href: string; label: string };
type Categoria = { slug: string; name: string };

/**
 * Navegación móvil. Se abre a pantalla completa por debajo de 768px, donde una
 * barra horizontal obligaría a partir en dos líneas el texto de los enlaces.
 */
export function MobileNav({
  links,
  categories,
  whatsapp,
  gmail,
}: {
  links: Enlace[];
  categories: Categoria[];
  whatsapp: string;
  gmail: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  // Navegar cierra el panel: sin esto, el panel sigue abierto sobre la página
  // nueva y parece que el enlace no funcionó.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!abierto) return;

    const alPulsar = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAbierto(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alPulsar);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", alPulsar);
    };
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        className="flex h-12 w-12 items-center justify-center rounded-md border border-line-2 text-ink transition-colors hover:bg-paper md:hidden"
      >
        <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
        <svg
          viewBox="0 0 20 20"
          className="h-5 w-5"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          {abierto ? (
            <>
              <path d="M5 5l10 10" />
              <path d="M15 5L5 15" />
            </>
          ) : (
            <>
              <path d="M3 6h14" />
              <path d="M3 10h14" />
              <path d="M3 14h14" />
            </>
          )}
        </svg>
      </button>

      {/*
        El panel se queda montado y se oculta con `invisible`, que transiciona
        de forma discreta al final: así se puede animar la salida sin Motion, y
        cuando está cerrado no lo alcanza ni el tabulador ni el lector de
        pantalla.
      */}
      <div
        id="menu-movil"
        aria-hidden={!abierto}
        className={`fixed inset-x-0 bottom-0 top-18 z-50 overflow-y-auto border-t border-line bg-canvas transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] md:hidden ${
          abierto ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
        }`}
      >
        <nav aria-label="Principal (móvil)" className="page py-6">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  tabIndex={abierto ? undefined : -1}
                  className="block rounded-lg px-3 py-3.5 text-lg font-semibold text-ink transition-colors hover:bg-paper"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Las mismas dos vías que ofrece el menú de escritorio. Con solo
              WhatsApp, quien prefiere escribir un correo se quedaba sin salida
              en el móvil, que es donde se ve la mayor parte del sitio. */}
          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={abierto ? undefined : -1}
              className="btn btn-primary w-full"
            >
              Cotizar por WhatsApp
            </a>
            <a
              href={gmail}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={abierto ? undefined : -1}
              className="btn btn-secondary w-full"
            >
              Cotizar por Gmail
            </a>
          </div>

          {categories.length > 0 && (
            <>
              <p className="label mt-9 mb-2 px-3 text-ink-3">Categorías</p>
              <ul className="flex flex-col">
                {categories.map((categoria) => (
                  <li key={categoria.slug}>
                    <Link
                      href={`/catalogo/${categoria.slug}`}
                      tabIndex={abierto ? undefined : -1}
                      className="block rounded-lg px-3 py-3 text-ink-2 transition-colors hover:bg-paper hover:text-ink"
                    >
                      {categoria.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
