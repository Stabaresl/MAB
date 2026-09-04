import type { Metadata } from "next";

import { NewPasswordForm } from "@/components/admin/password-forms";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default function NuevaClavePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-[420px]">
        <h1 className="text-[clamp(1.6rem,5vw,2rem)] leading-tight text-ink">
          Elige una contraseña nueva
        </h1>
        <p className="mt-3 text-ink-muted">
          Llegaste desde el enlace del correo. Al guardar entrarás directamente al panel.
        </p>
        <div className="mt-8 rounded-lg border border-hairline bg-surface-1 p-6 md:p-8">
          <NewPasswordForm />
        </div>
      </div>
    </div>
  );
}
