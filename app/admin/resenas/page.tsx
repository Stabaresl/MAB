import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewList } from "@/components/admin/review-list";
import { listReviews } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reseñas" };

export default async function ResenasPage() {
  const resenas = await listReviews();
  const publicadas = resenas.filter((r) => r.is_published).length;

  return (
    <AdminShell
      title="Reseñas"
      description="Lo que dicen los clientes. Como las opiniones llegan por WhatsApp y por correo, las subes tú: la captura del mensaje y el texto transcrito."
      action={
        <Link href="/admin/resenas/nueva" className="btn btn-primary">
          + Nueva reseña
        </Link>
      }
    >
      <h2 className="text-[19px] text-ink">
        {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}
        {resenas.length > 0 && (
          <span className="spec ml-3 text-ink-3">{publicadas} en la portada</span>
        )}
      </h2>
      <ReviewList resenas={resenas} />
    </AdminShell>
  );
}
