"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { StatIcon } from "@/components/stat-icon";
import { createStat, updateStat } from "@/lib/actions/stats";
import type { Stat, StatSource } from "@/lib/database.types";
import { ICONOS_INDICADOR } from "@/lib/stat-icons";

/**
 * Alta y edición de un contador de la portada.
 *
 * El campo del número se apaga cuando la fuente no es manual, y dice por qué.
 * Dejarlo activo con un valor que el sitio va a ignorar es la clase de detalle
 * que hace que alguien escriba 45, recargue, vea 46 y piense que el panel está
 * roto.
 */

const FUENTES: { valor: StatSource; etiqueta: string; explicacion: string }[] = [
  {
    valor: "manual",
    etiqueta: "Lo escribo yo",
    explicacion: "El número es el que teclees aquí y no cambia solo.",
  },
  {
    valor: "productos",
    etiqueta: "Artículos publicados",
    explicacion: "Lo cuenta el sitio. Sube solo al publicar un artículo nuevo.",
  },
  {
    valor: "categorias",
    etiqueta: "Categorías del catálogo",
    explicacion: "Lo cuenta el sitio a partir de las categorías que existan.",
  },
  {
    valor: "clientes",
    etiqueta: "Clientes del carrusel",
    explicacion: "Lo cuenta el sitio a partir de la lista de referencias.",
  },
];

export function StatForm({ indicador }: { indicador?: Stat }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [fuente, setFuente] = useState<StatSource>(indicador?.source ?? "manual");
  const [icono, setIcono] = useState(indicador?.icon ?? "obra");

  const editando = Boolean(indicador);
  const automatico = fuente !== "manual";
  const explicacion = FUENTES.find((f) => f.valor === fuente)?.explicacion ?? "";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setOk(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = indicador
        ? await updateStat(indicador.id, formData)
        : await createStat(formData);

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setOk(editando ? "Cambios guardados." : "Contador añadido.");
      if (!editando) {
        formRef.current?.reset();
        setFuente("manual");
        setIcono("obra");
      }
      router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormFeedback error={error} success={ok} />

      <div>
        <label htmlFor="label" className="label block text-ink-3">
          Qué se cuenta
        </label>
        <input
          id="label"
          name="label"
          type="text"
          required
          maxLength={60}
          defaultValue={indicador?.label ?? ""}
          aria-invalid={Boolean(fieldErrors.label)}
          className="field mt-2"
          placeholder="Cotizaciones que terminaron en venta"
        />
        <FieldError message={fieldErrors.label} />
      </div>

      <div>
        <label htmlFor="source" className="label block text-ink-3">
          De dónde sale el número
        </label>
        <select
          id="source"
          name="source"
          value={fuente}
          onChange={(e) => setFuente(e.target.value as StatSource)}
          className="field mt-2"
        >
          {FUENTES.map((f) => (
            <option key={f.valor} value={f.valor}>
              {f.etiqueta}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[13px] text-ink-3">{explicacion}</p>
        <FieldError message={fieldErrors.source} />
      </div>

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_120px]">
        <div>
          <label htmlFor="value" className="label block text-ink-3">
            Número
          </label>
          <input
            id="value"
            name="value"
            type="text"
            inputMode="numeric"
            required
            defaultValue={indicador ? String(indicador.value) : "0"}
            disabled={automatico}
            aria-invalid={Boolean(fieldErrors.value)}
            className="field spec mt-2 disabled:cursor-not-allowed disabled:opacity-55"
            placeholder="1781"
          />
          <p className="mt-1.5 text-[13px] text-ink-3">
            {automatico
              ? "Lo pone el sitio; este campo no se usa."
              : "Puedes escribirlo con puntos de millar: 1.781."}
          </p>
          <FieldError message={fieldErrors.value} />
        </div>

        <div>
          <label htmlFor="suffix" className="label block text-ink-3">
            Signo
          </label>
          <input
            id="suffix"
            name="suffix"
            type="text"
            maxLength={4}
            defaultValue={indicador?.suffix ?? ""}
            aria-invalid={Boolean(fieldErrors.suffix)}
            className="field spec mt-2"
            placeholder="+"
          />
          <p className="mt-1.5 text-[13px] text-ink-3">Va detrás: +, %, m².</p>
          <FieldError message={fieldErrors.suffix} />
        </div>
      </div>

      {/*
        El campo deshabilitado no se envía, así que en modo automático el valor
        viajaría vacío y el esquema lo rechazaría. Se manda a la sombra el que
        ya estaba guardado: si algún día se cambia la fuente a manual, aparece
        el último número tecleado en lugar de un cero.
      */}
      {automatico && <input type="hidden" name="value" value={indicador?.value ?? 0} />}

      <div>
        <label htmlFor="icon" className="label block text-ink-3">
          Icono
        </label>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sun-soft text-sun-ink">
            <StatIcon nombre={icono} />
          </span>
          <select
            id="icon"
            name="icon"
            value={icono}
            onChange={(e) => setIcono(e.target.value)}
            className="field"
          >
            {ICONOS_INDICADOR.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <FieldError message={fieldErrors.icon} />
      </div>

      <label className="flex items-center gap-3 rounded-md border border-line bg-canvas p-4">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={indicador?.is_published ?? true}
          className="h-4 w-4 accent-[var(--color-accent)]"
        />
        <span className="text-[15px] text-ink">
          Visible en la portada
          <span className="block text-[13px] text-ink-3">
            Sin marcar se guarda pero no se muestra.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Guardando…" : editando ? "Guardar cambios" : "Añadir contador"}
        </button>
        {editando && (
          <Link href="/admin/indicadores" className="btn btn-secondary">
            Volver
          </Link>
        )}
      </div>
    </form>
  );
}
