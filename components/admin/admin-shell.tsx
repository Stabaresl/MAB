import Image from "next/image";
import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { signOut } from "@/lib/actions/auth";
import { site } from "@/lib/site";

/**
 * Estructura común de las pantallas del panel: marca, navegación, salida y el
 * enlace de vuelta al sitio público.
 */
export function AdminShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-hairline bg-brand-navy">
        <div className="page flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-3" aria-label="Panel de MAB">
            <Image
              src="/marca/mab-monograma.webp"
              alt=""
              width={196}
              height={262}
              className="h-8 w-auto"
            />
            <span className="label hidden text-ink-subtle sm:inline">Panel</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden rounded-md px-3 py-2 text-[14px] text-ink-muted hover:bg-surface-2 hover:text-ink sm:inline-block"
            >
              Ver el sitio ↗
            </Link>
            <form action={signOut}>
              <button type="submit" className="btn btn-secondary h-11 px-4 text-[14px]">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <AdminNav />

      <main className="page flex-1 py-10">
        <div className="flex flex-col gap-4 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[clamp(1.6rem,4vw,2.25rem)] leading-tight text-ink">{title}</h1>
            {description && <p className="mt-2 max-w-[62ch] text-ink-muted">{description}</p>}
          </div>
          {action}
        </div>

        <div className="mt-8">{children}</div>
      </main>

      <footer className="border-t border-hairline py-6">
        <p className="page spec text-ink-subtle">
          {site.name} · Panel de administración
        </p>
      </footer>
    </div>
  );
}
