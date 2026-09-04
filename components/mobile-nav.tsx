"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
}: {
  links: Enlace[];
  categories: Categoria[];
  whatsapp: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  const quieto = useReducedMotion();

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

      <AnimatePresence>
        {abierto && (
          <motion.div
            id="menu-movil"
            initial={quieto ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={quieto ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: quieto ? 0.15 : 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 top-18 z-50 overflow-y-auto border-t border-line bg-canvas md:hidden"
          >
            <nav aria-label="Principal (móvil)" className="page py-6">
              <ul className="flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-lg px-3 py-3.5 text-lg font-semibold text-ink transition-colors hover:bg-paper"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-5 w-full"
              >
                Pedir cotización
              </a>

              {categories.length > 0 && (
                <>
                  <p className="label mt-9 mb-2 px-3 text-ink-3">Categorías</p>
                  <ul className="flex flex-col">
                    {categories.map((categoria) => (
                      <li key={categoria.slug}>
                        <Link
                          href={`/catalogo/${categoria.slug}`}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
