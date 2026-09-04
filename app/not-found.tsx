import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="label text-accent-ink">Error 404</p>
      <h1 className="mt-4 max-w-[16ch] text-[clamp(2rem,6vw,3.5rem)] leading-[1.06] text-ink">
        Esta página no existe
      </h1>
      <p className="mt-5 max-w-[52ch] text-ink-2">
        Puede que el artículo se haya retirado del catálogo o que la dirección esté mal escrita.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link href="/catalogo" className="btn btn-primary">
          Ir al catálogo
        </Link>
        <Link href="/" className="btn btn-secondary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
