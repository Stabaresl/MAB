import type { Metadata } from "next";

import { RequestResetForm } from "@/components/admin/password-forms";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-[420px]">
        <h1 className="text-[clamp(1.6rem,5vw,2rem)] leading-tight text-ink">
          Recuperar la contraseña
        </h1>
        <p className="mt-3 text-ink-2">
          Escribe el correo de la cuenta y te enviamos un enlace para ponerle una contraseña
          nueva.
        </p>
        <div className="mt-8 rounded-lg border border-line bg-canvas p-6 md:p-8">
          <RequestResetForm />
        </div>
      </div>
    </div>
  );
}
