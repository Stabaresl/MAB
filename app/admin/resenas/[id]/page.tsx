import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewForm } from "@/components/admin/review-form";
import { getReview } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditarResenaPage({ params }: Params) {
  const { id } = await params;
  const resena = await getReview(id);

  if (!resena) notFound();

  return (
    <AdminShell
      title={`Reseña de ${resena.author}`}
      description={
        resena.is_published
          ? "Está publicada: los cambios se ven en la portada al guardar."
          : "Está guardada sin publicar, así que todavía no aparece en la portada."
      }
    >
      <ReviewForm resena={resena} />
    </AdminShell>
  );
}
