"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormFeedback } from "@/components/admin/form-feedback";
import { OrderButtons } from "@/components/admin/order-buttons";
import { clearClientLogo, deleteClientRow, reorderClients } from "@/lib/actions/clients";
import type { Client } from "@/lib/database.types";

/**
 * Los clientes del carrusel, en el orden en que salen.
 *
 * El orden se cambia con dos botones y no arrastrando. Arrastrar es más
 * agradable con ratón y bastante peor con dedo, que es como MAB abre el panel;
 * y una lista que solo se puede reordenar arrastrando no se puede reordenar con
 * teclado en absoluto.
 */
export function ClientList({ clientes }: { clientes: Client[] }) {
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
    if (destino < 0 || destino >= clientes.length) return;
    const ids = clientes.map((c) => c.id);
    // Intercambio con dos variables y no desestructurando: con
    // `noUncheckedIndexedAccess` el acceso por índice puede ser indefinido, y
    // la forma corta no le da a TypeScript ninguna manera de saber que aquí no
    // lo es.
    const aqui = ids[indice];
    const alla = ids[destino];
    if (!aqui || !alla) return;
    ids[indice] = alla;
    ids[destino] = aqui;
    ejecutar(() => reorderClients(ids), "Orden guardado.");
  }

  if (clientes.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-canvas p-10 text-center">
        <p className="text-ink">Todavía no hay clientes en el carrusel.</p>
        <p className="mt-2 text-ink-2">
          Añade el primero con el formulario de al lado. Si no hay ninguno, la sección de
          referencias no aparece en la portada.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FormFeedback error={error} success={ok} />

      <ul className="mt-4 overflow-hidden rounded-lg border border-line">
        {clientes.map((cliente, indice) => (
          <li key={cliente.id} className="border-b border-line bg-canvas last:border-b-0">
            <div className="flex flex-wrap items-center gap-4 p-4">
              <OrderButtons
                indice={indice}
                total={clientes.length}
                deshabilitado={pending}
                onMover={(salto) => mover(indice, salto)}
                que={cliente.name}
              />

              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-paper">
                {cliente.logo_url ? (
                  <Image
                    src={cliente.logo_url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[11px] text-ink-3">
                    Sin logo
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 basis-40">
                <Link href={`/admin/clientes/${cliente.id}`} className="text-ink hover:text-accent-ink">
                  {cliente.name}
                </Link>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {cliente.logo_url && (
                  <button
                    type="button"
                    onClick={() =>
                      ejecutar(() => clearClientLogo(cliente.id), "Logotipo retirado.")
                    }
                    disabled={pending}
                    className="btn btn-secondary h-11 px-4 text-[14px]"
                  >
                    Quitar logo
                  </button>
                )}
                <Link
                  href={`/admin/clientes/${cliente.id}`}
                  className="btn btn-secondary h-11 px-4 text-[14px]"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmando(confirmando === cliente.id ? null : cliente.id)}
                  aria-expanded={confirmando === cliente.id}
                  className="btn btn-secondary h-11 border-danger/40 px-4 text-[14px] text-danger hover:border-danger hover:bg-danger/10"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {confirmando === cliente.id && (
              <div className="flex flex-wrap items-center gap-3 border-t border-line bg-paper p-4">
                <span className="text-[14px] text-ink">
                  ¿Quitar «{cliente.name}» del carrusel?
                </span>
                <button
                  type="button"
                  onClick={() =>
                    ejecutar(
                      () => deleteClientRow(cliente.id),
                      `«${cliente.name}» ya no aparece en la portada.`,
                    )
                  }
                  disabled={pending}
                  className="btn h-11 bg-danger px-4 text-[14px] font-semibold text-white hover:opacity-90"
                >
                  {pending ? "Quitando…" : "Sí, quitar"}
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
