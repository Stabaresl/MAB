"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { ImageField } from "@/components/admin/image-field";
import { createClientRow, updateClientRow } from "@/lib/actions/clients";
import type { Client } from "@/lib/database.types";

/**
 * Alta y edición de un cliente del carrusel de referencias.
 *
 * El logotipo es opcional y se dice en el propio formulario, porque es la duda
 * que aparece siempre: sin archivo la ficha se publica igual, con el nombre
 * escrito, que es como salen ya siete de los trece clientes del portafolio.
 */
export function ClientForm({ cliente }: { cliente?: Client }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const editando = Boolean(cliente);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setOk(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = cliente
        ? await updateClientRow(cliente.id, formData)
        : await createClientRow(formData);

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setOk(editando ? "Cambios guardados." : `«${result.data.name}» añadido al carrusel.`);
      if (!editando) formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormFeedback error={error} success={ok} />

      <div>
        <label htmlFor="name" className="label block text-ink-3">
          Nombre de la empresa
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={80}
          defaultValue={cliente?.name ?? ""}
          aria-invalid={Boolean(fieldErrors.name)}
          className="field mt-2"
          placeholder="Constructora Los Andes"
        />
        <FieldError message={fieldErrors.name} />
      </div>

      <ImageField
        currentUrl={cliente?.logo_url}
        error={fieldErrors.image}
        label="Logotipo (opcional)"
        hint="Se ve mejor un PNG con fondo transparente. JPG, PNG o WEBP, máximo 5 MB. Sin logotipo, la ficha se publica con el nombre escrito."
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Guardando…" : editando ? "Guardar cambios" : "Añadir cliente"}
        </button>
        {editando && (
          <Link href="/admin/clientes" className="btn btn-secondary">
            Volver
          </Link>
        )}
      </div>
    </form>
  );
}
