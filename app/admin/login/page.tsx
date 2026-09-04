import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { site } from "@/lib/site";
import { getAdminUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ siguiente?: string }>;
}) {
  // Quien ya tiene sesión no necesita ver esta pantalla. La comprobación va aquí
  // y no en el middleware para que el `redirect()` sea el que entiende el router.
  if (await getAdminUser()) redirect("/admin");

  const { siguiente } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="inline-flex" aria-label={`${site.name} — inicio`}>
          <Image
            src="/marca/mab-logo.webp"
            alt={site.name}
            width={417}
            height={327}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <h1 className="mt-10 text-[clamp(1.75rem,5vw,2.25rem)] leading-tight text-ink">
          Panel de administración
        </h1>
        <p className="mt-3 text-ink-muted">
          Entra para gestionar el catálogo. Solo el administrador tiene acceso.
        </p>

        <div className="mt-8 rounded-lg border border-hairline bg-surface-1 p-6 md:p-8">
          <LoginForm siguiente={siguiente} />
        </div>

        <p className="mt-8 text-[14px] text-ink-subtle">
          <Link href="/" className="hover:text-ink">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}
