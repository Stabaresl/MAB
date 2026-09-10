"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { ImageField } from "@/components/admin/image-field";
import { createProduct, updateProduct } from "@/lib/actions/products";
import type { AdminProduct } from "@/lib/admin";

type Category = { id: string; name: string };

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: AdminProduct;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const editing = Boolean(product);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setOk(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        // El aviso está arriba del formulario: si el error llega tras rellenar
        // un formulario largo, hay que llevar al administrador hasta él.
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (editing) {
        setOk("Cambios guardados.");
        router.refresh();
      } else {
        router.push("/admin/articulos");
        router.refresh();
      }
    });
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-canvas p-10 text-center">
        <p className="text-ink">Antes de crear un artículo necesitas al menos una categoría.</p>
        <Link href="/admin/categorias" className="btn btn-primary mt-6">
          Crear una categoría
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[720px]" noValidate>
      <div className="flex flex-col gap-6">
        <FormFeedback error={error} success={ok} />

        <div>
          <label htmlFor="name" className="label block text-ink-3">
            Nombre del artículo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            defaultValue={product?.name ?? ""}
            aria-invalid={Boolean(fieldErrors.name)}
            className="field mt-2"
            placeholder="Lavadero de 60x60"
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label htmlFor="categoryId" className="label block text-ink-3">
            Categoría
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.category_id ?? ""}
            aria-invalid={Boolean(fieldErrors.categoryId)}
            className="field mt-2"
          >
            <option value="" disabled>
              Elige una categoría
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.categoryId} />
        </div>

        <div>
          <label htmlFor="specs" className="label block text-ink-3">
            Medidas y material <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            id="specs"
            name="specs"
            type="text"
            maxLength={200}
            defaultValue={product?.specs ?? ""}
            aria-invalid={Boolean(fieldErrors.specs)}
            className="field mt-2"
            placeholder="60x40 cm · ABS color gris"
          />
          <p className="mt-1.5 text-[13px] text-ink-3">
            Se muestra bajo el nombre, en la tarjeta y en la ficha.
          </p>
          <FieldError message={fieldErrors.specs} />
        </div>

        <div>
          <label htmlFor="description" className="label block text-ink-3">
            Descripción <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            maxLength={2000}
            defaultValue={product?.description ?? ""}
            aria-invalid={Boolean(fieldErrors.description)}
            className="field mt-2 resize-y"
            placeholder="Para qué sirve, en qué acabados está disponible, qué norma cumple…"
          />
          <FieldError message={fieldErrors.description} />
        </div>

        <ImageField currentUrl={product?.image_url} error={fieldErrors.image} />

        <div className="flex items-start gap-3 rounded-md border border-line bg-canvas p-4">
          <input
            id="isPublished"
            name="isPublished"
            type="checkbox"
            defaultChecked={product?.is_published ?? true}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
          <label htmlFor="isPublished" className="cursor-pointer">
            <span className="block text-ink">Publicado</span>
            <span className="mt-0.5 block text-[13px] text-ink-3">
              Si lo desmarcas, el artículo se guarda pero no aparece en el sitio.
            </span>
          </label>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-sun-line bg-sun-soft p-4">
          <input
            id="isFeatured"
            name="isFeatured"
            type="checkbox"
            defaultChecked={product?.is_featured ?? false}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
          <label htmlFor="isFeatured" className="cursor-pointer">
            <span className="block text-ink">Entre los más vendidos</span>
            <span className="mt-0.5 block text-[13px] text-ink-2">
              Sale en la vitrina que abre el catálogo, antes de entrar en ninguna categoría. Si el
              artículo no está publicado, no aparece ahí aunque esté marcado.
            </span>
          </label>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear artículo"}
        </button>
        <Link href="/admin/articulos" className="btn btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
