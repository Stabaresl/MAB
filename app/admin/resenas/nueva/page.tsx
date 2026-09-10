import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewForm } from "@/components/admin/review-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Nueva reseña" };

export default function NuevaResenaPage() {
  return (
    <AdminShell
      title="Nueva reseña"
      description="A la derecha se ve la tarjeta tal como quedará en la portada, con lo que vayas escribiendo."
    >
      <ReviewForm />
    </AdminShell>
  );
}
