"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { ImageField } from "@/components/admin/image-field";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/database.types";

export function CategoryForm({
  category,
  onDone,
}: {
  category?: Category;
  onDone?: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const editing = Boolean(category);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setOk(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, formData)
        : await createCategory(formData);

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setOk(editing ? "Cambios guardados." : "Categoría creada.");
      if (!editing) formRef.current?.reset();
      router.refresh();
      onDone?.();
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormFeedback error={error} success={ok} />

      <div>
        <label htmlFor="name" className="label block text-ink-subtle">
          Nombre de la categoría
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={80}
          defaultValue={category?.name ?? ""}
          aria-invalid={Boolean(fieldErrors.name)}
          className="field mt-2"
          placeholder="Zona húmeda"
        />
        <FieldError message={fieldErrors.name} />
      </div>

      <div>
        <label htmlFor="description" className="label block text-ink-subtle">
          Descripción <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={600}
          defaultValue={category?.description ?? ""}
          aria-invalid={Boolean(fieldErrors.description)}
          className="field mt-2 resize-y"
          placeholder="Qué tipo de artículos agrupa esta categoría."
        />
        <FieldError message={fieldErrors.description} />
      </div>

      <ImageField
        currentUrl={category?.image_url}
        error={fieldErrors.image}
        label="Imagen de portada"
        hint="Se muestra junto al nombre en la página de inicio. JPG, PNG o WEBP, máximo 5 MB."
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear categoría"}
        </button>
        {editing && (
          <Link href="/admin/categorias" className="btn btn-secondary">
            Volver
          </Link>
        )}
      </div>
    </form>
  );
}
