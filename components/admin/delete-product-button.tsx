"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormFeedback } from "@/components/admin/form-feedback";
import { deleteProduct } from "@/lib/actions/products";

/**
 * Borrado con confirmación en dos pasos.
 *
 * No hay `confirm()` del navegador: en móvil se ve como una alerta del sistema
 * y se acepta sin leer. Pedir que el botón cambie y haya que pulsarlo otra vez
 * obliga a un segundo gesto consciente.
 */
export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result.ok) {
        setError(result.error);
        setConfirming(false);
        return;
      }
      router.push("/admin/articulos");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <FormFeedback error={error} />

      {confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[14px] text-ink">¿Borrar «{name}» definitivamente?</span>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="btn h-11 bg-danger px-4 text-[14px] font-semibold text-ink hover:opacity-90"
          >
            {pending ? "Borrando…" : "Sí, borrar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="btn btn-secondary h-11 px-4 text-[14px]"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn btn-secondary w-fit border-danger/50 text-danger hover:border-danger hover:bg-danger/10"
        >
          Eliminar artículo
        </button>
      )}
    </div>
  );
}
