"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { signIn } from "@/lib/actions/auth";

export function LoginForm({ siguiente }: { siguiente?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      // Si las credenciales son correctas la acción redirige desde el servidor
      // y esta promesa no llega a resolver. Solo se vuelve aquí en caso de error.
      const result = await signIn(formData);

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {siguiente && <input type="hidden" name="siguiente" value={siguiente} />}

      <FormFeedback error={error} />

      <div>
        <label htmlFor="email" className="label block text-ink-3">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          className="field mt-2"
          placeholder="correo@ejemplo.com"
        />
        <FieldError message={fieldErrors.email} />
      </div>

      <div>
        <label htmlFor="password" className="label block text-ink-3">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(fieldErrors.password)}
          className="field mt-2"
        />
        <FieldError message={fieldErrors.password} />
      </div>

      <button type="submit" className="btn btn-primary mt-1 w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>

      <Link
        href="/admin/recuperar"
        className="text-center text-[14px] text-ink-3 hover:text-ink"
      >
        Olvidé mi contraseña
      </Link>
    </form>
  );
}
