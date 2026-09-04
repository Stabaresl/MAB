"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECCIONES = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/articulos", label: "Artículos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones del panel" className="border-b border-hairline bg-surface-1">
      <div className="page scroll-x -mx-5 px-5 md:mx-0 md:px-0">
        <ul className="flex w-max gap-1 md:w-auto">
          {SECCIONES.map((seccion) => {
            const active =
              seccion.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(seccion.href);

            return (
              <li key={seccion.href}>
                <Link
                  href={seccion.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-12 items-center whitespace-nowrap border-b-2 px-4 text-[15px] transition-colors ${
                    active
                      ? "border-accent text-ink"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  {seccion.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
