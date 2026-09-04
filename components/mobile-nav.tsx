"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Link = { href: string; label: string };
type Category = { slug: string; name: string };

/**
 * Navegación móvil. Se abre a pantalla completa por debajo de 768px, donde una
 * barra horizontal obligaría a partir en dos líneas el texto de los enlaces.
 */
export function MobileNav({ links, categories }: { links: Link[]; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Navegar cierra el panel: sin esto, el panel sigue abierto sobre la página
  // nueva y parece que el enlace no funcionó.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="menu-movil"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-hairline-strong text-ink md:hidden"
      >
        <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          {open ? (
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

      <div
        id="menu-movil"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto border-t border-hairline bg-canvas md:hidden"
      >
        <nav aria-label="Principal (móvil)" className="page py-6">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-3 py-3 text-lg font-semibold text-ink hover:bg-surface-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {categories.length > 0 && (
            <>
              <p className="label mt-8 mb-3 px-3 text-ink-subtle">Categorías</p>
              <ul className="flex flex-col">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/catalogo/${category.slug}`}
                      className="block rounded-md px-3 py-3 text-ink-muted hover:bg-surface-2 hover:text-ink"
                    >
                      {category.name}
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
