"use client";

/**
 * Avisos de formulario.
 *
 * Todo error llega a la pantalla: no hay ninguna ruta en el panel en la que una
 * acción falle en silencio. El aviso lleva `role="alert"` para que un lector de
 * pantalla lo anuncie en cuanto aparece.
 */
export function FormFeedback({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (!error && !success) return null;

  const isError = Boolean(error);

  return (
    <p
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-md border px-4 py-3 text-[14px] ${
        isError
          ? "border-danger/40 bg-danger/10 text-ink"
          : "border-success/40 bg-success/10 text-ink"
      }`}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0">
        {isError ? "!" : "✓"}
      </span>
      <span>{error ?? success}</span>
    </p>
  );
}

/** Error bajo un campo concreto. El color nunca es el único indicador. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[13px] text-danger">{message}</p>;
}
