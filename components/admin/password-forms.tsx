"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { requestPasswordReset, updatePassword } from "@/lib/actions/auth";

/** Pide el correo de recuperación. */
export function RequestResetForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        <FormFeedback success="Si ese correo tiene cuenta, le llegará un enlace para cambiar la contraseña. Revisa también la carpeta de correo no deseado." />
        <Link href="/admin/login" className="btn btn-secondary">
          Volver a entrar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormFeedback error={error} />

      <div>
        <label htmlFor="email" className="label block text-ink-3">
          Correo de la cuenta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          className="field mt-2"
        />
        <FieldError message={fieldErrors.email} />
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar el enlace"}
      </button>

      <Link href="/admin/login" className="text-center text-[14px] text-ink-3 hover:text-ink">
        Volver a entrar
      </Link>
    </form>
  );
}

/** Fija la contraseña nueva tras llegar desde el correo. */
export function NewPasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormFeedback error={error} />

      <div>
        <label htmlFor="password" className="label block text-ink-3">
          Contraseña nueva
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={Boolean(fieldErrors.password)}
          className="field mt-2"
        />
        <p className="mt-1.5 text-[13px] text-ink-3">Mínimo 8 caracteres.</p>
        <FieldError message={fieldErrors.password} />
      </div>

      <div>
        <label htmlFor="confirm" className="label block text-ink-3">
          Repite la contraseña
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(fieldErrors.confirm)}
          className="field mt-2"
        />
        <FieldError message={fieldErrors.confirm} />
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Guardando…" : "Guardar la contraseña"}
      </button>
    </form>
  );
}
