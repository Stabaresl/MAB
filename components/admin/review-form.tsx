"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { ImageField } from "@/components/admin/image-field";
import { ReviewCard } from "@/components/review-card";
import { createReview, updateReview } from "@/lib/actions/reviews";
import type { Review } from "@/lib/database.types";

/**
 * Alta y edición de una reseña, con la tarjeta real al lado.
 *
 * La vista previa no es una maqueta parecida: es el mismo componente que dibuja
 * la portada, alimentado con lo que hay escrito en los campos en este momento.
 * Esa es la única forma de que «así se va a ver» siga siendo verdad dentro de
 * seis meses; con una copia aparte, la del panel se queda vieja a la primera
 * corrección del diseño y el administrador acaba publicando a ciegas.
 *
 * Por eso los campos son controlados y no van sueltos con `defaultValue`: la
 * tarjeta tiene que repintarse con cada tecla.
 */
export function ReviewForm({ resena }: { resena?: Review }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [author, setAuthor] = useState(resena?.author ?? "");
  const [role, setRole] = useState(resena?.role ?? "");
  const [quote, setQuote] = useState(resena?.quote ?? "");
  const [rating, setRating] = useState(resena?.rating ? String(resena.rating) : "");
  const [imagen, setImagen] = useState<string | null>(resena?.image_url ?? null);

  const editando = Boolean(resena);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setOk(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = resena
        ? await updateReview(resena.id, formData)
        : await createReview(formData);

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setOk(editando ? "Cambios guardados." : "Reseña publicada.");
      if (!editando) {
        formRef.current?.reset();
        setAuthor("");
        setRole("");
        setQuote("");
        setRating("");
        setImagen(null);
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-12">
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <FormFeedback error={error} success={ok} />

        <div>
          <label htmlFor="author" className="label block text-ink-3">
            Quién lo dijo
          </label>
          <input
            id="author"
            name="author"
            type="text"
            required
            maxLength={80}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            aria-invalid={Boolean(fieldErrors.author)}
            className="field mt-2"
            placeholder="Carlos Restrepo"
          />
          <FieldError message={fieldErrors.author} />
        </div>

        <div>
          <label htmlFor="role" className="label block text-ink-3">
            Cargo o empresa <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            id="role"
            name="role"
            type="text"
            maxLength={120}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-invalid={Boolean(fieldErrors.role)}
            className="field mt-2"
            placeholder="Jefe de compras · Constructora Los Andes"
          />
          <p className="mt-1.5 text-[13px] text-ink-3">
            Déjalo vacío si el cliente prefiere que no se publique dónde trabaja.
          </p>
          <FieldError message={fieldErrors.role} />
        </div>

        <div>
          <label htmlFor="quote" className="label block text-ink-3">
            Lo que dijo
          </label>
          <textarea
            id="quote"
            name="quote"
            rows={5}
            required
            maxLength={600}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            aria-invalid={Boolean(fieldErrors.quote)}
            className="field mt-2 resize-y"
            placeholder="Transcribe el mensaje tal como llegó, sin comillas: se ponen solas."
          />
          <p className="mt-1.5 text-[13px] text-ink-3">
            {quote.length} de 600 caracteres.
          </p>
          <FieldError message={fieldErrors.quote} />
        </div>

        <div>
          <label htmlFor="rating" className="label block text-ink-3">
            Valoración <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <select
            id="rating"
            name="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            aria-invalid={Boolean(fieldErrors.rating)}
            className="field mt-2"
          >
            <option value="">Sin valoración</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "estrella" : "estrellas"}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.rating} />
        </div>

        <ImageField
          currentUrl={resena?.image_url}
          error={fieldErrors.image}
          onPreview={(url) => setImagen(url ?? resena?.image_url ?? null)}
          label="Captura o foto (opcional)"
          hint="La captura del mensaje de WhatsApp o la foto de quien opina. Se muestra entera, sin recortar. JPG, PNG o WEBP, máximo 5 MB."
        />

        <label className="flex items-center gap-3 rounded-md border border-line bg-canvas p-4">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={resena?.is_published ?? true}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          <span className="text-[15px] text-ink">
            Publicada
            <span className="block text-[13px] text-ink-3">
              Sin marcar se guarda pero no sale en la portada.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Guardando…" : editando ? "Guardar cambios" : "Publicar reseña"}
          </button>
          {editando && (
            <Link href="/admin/resenas" className="btn btn-secondary">
              Volver
            </Link>
          )}
        </div>
      </form>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <p className="label text-ink-3">Así se verá en la portada</p>
        <div className="mt-4 rounded-xl border border-line bg-paper p-5">
          {author.trim() || quote.trim() ? (
            <ReviewCard
              resena={{
                author: author.trim() || "Nombre del cliente",
                role: role.trim() || null,
                quote: quote.trim() || "Aquí irá el mensaje que dejó el cliente.",
                imageUrl: imagen,
                rating: rating ? Number(rating) : null,
              }}
            />
          ) : (
            <p className="py-10 text-center text-[14px] text-ink-3">
              Escribe el nombre y el mensaje y la tarjeta aparece aquí.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
