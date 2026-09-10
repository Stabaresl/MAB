"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormFeedback } from "@/components/admin/form-feedback";
import { OrderButtons } from "@/components/admin/order-buttons";
import { StatIcon } from "@/components/stat-icon";
import { deleteStat, reorderStats } from "@/lib/actions/stats";
import type { Stat } from "@/lib/database.types";

const FUENTE: Record<string, string> = {
  manual: "escrito a mano",
  productos: "cuenta los artículos",
  categorias: "cuenta las categorías",
  clientes: "cuenta los clientes",
};

export function StatList({ indicadores }: { indicadores: Stat[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function ejecutar(accion: () => Promise<{ ok: boolean; error?: string }>, exito: string) {
    setError(null);
    setOk(null);
    startTransition(async () => {
      const result = await accion();
      setConfirmando(null);
      if (!result.ok) {
        setError(result.error ?? "No se pudo completar la operación.");
        return;
      }
      setOk(exito);
      router.refresh();
    });
  }

  function mover(indice: number, salto: -1 | 1) {
    const destino = indice + salto;
    if (destino < 0 || destino >= indicadores.length) return;
    const ids = indicadores.map((s) => s.id);
    // Intercambio con dos variables y no desestructurando: con
    // `noUncheckedIndexedAccess` el acceso por índice puede ser indefinido, y
    // la forma corta no le da a TypeScript ninguna manera de saber que aquí no
    // lo es.
    const aqui = ids[indice];
    const alla = ids[destino];
    if (!aqui || !alla) return;
    ids[indice] = alla;
    ids[destino] = aqui;
    ejecutar(() => reorderStats(ids), "Orden guardado.");
  }

  if (indicadores.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-canvas p-10 text-center">
        <p className="text-ink">No hay contadores.</p>
        <p className="mt-2 text-ink-2">
          Sin ninguno, la franja de cifras no aparece en la portada.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FormFeedback error={error} success={ok} />

      <ul className="mt-4 overflow-hidden rounded-lg border border-line">
        {indicadores.map((indicador, indice) => (
          <li key={indicador.id} className="border-b border-line bg-canvas last:border-b-0">
            <div className="flex flex-wrap items-center gap-4 p-4">
              <OrderButtons
                indice={indice}
                total={indicadores.length}
                deshabilitado={pending}
                onMover={(salto) => mover(indice, salto)}
                que={indicador.label}
              />

              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sun-soft text-sun-ink">
                <StatIcon nombre={indicador.icon} />
              </span>

              <div className="min-w-0 flex-1 basis-48">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/indicadores/${indicador.id}`}
                    className="text-ink hover:text-accent-ink"
                  >
                    {indicador.label}
                  </Link>
                  {!indicador.is_published && (
                    <span className="spec rounded-full bg-warning/15 px-2.5 py-0.5 text-warning">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="spec mt-1 text-ink-3">
                  {indicador.source === "manual"
                    ? `${new Intl.NumberFormat("es-CO").format(indicador.value)}${indicador.suffix ?? ""}`
                    : "—"}{" "}
                  · {FUENTE[indicador.source] ?? indicador.source}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/admin/indicadores/${indicador.id}`}
                  className="btn btn-secondary h-11 px-4 text-[14px]"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmando(confirmando === indicador.id ? null : indicador.id)
                  }
                  aria-expanded={confirmando === indicador.id}
                  className="btn btn-secondary h-11 border-danger/40 px-4 text-[14px] text-danger hover:border-danger hover:bg-danger/10"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {confirmando === indicador.id && (
              <div className="flex flex-wrap items-center gap-3 border-t border-line bg-paper p-4">
                <span className="text-[14px] text-ink">
                  ¿Quitar «{indicador.label}» de la portada?
                </span>
                <button
                  type="button"
                  onClick={() => ejecutar(() => deleteStat(indicador.id), "Contador eliminado.")}
                  disabled={pending}
                  className="btn h-11 bg-danger px-4 text-[14px] font-semibold text-white hover:opacity-90"
                >
                  {pending ? "Borrando…" : "Sí, quitar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(null)}
                  className="btn btn-secondary h-11 px-4 text-[14px]"
                >
                  Cancelar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
