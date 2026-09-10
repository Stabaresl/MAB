import Image from "next/image";

/**
 * Tarjeta de reseña.
 *
 * El mismo componente lo usan la portada y la vista previa del panel. Eso no es
 * una comodidad: es la única forma de que «así se va a ver» sea verdad. Con dos
 * maquetaciones separadas, la del panel y la real, la primera se queda vieja a
 * la segunda corrección y el administrador acaba publicando a ciegas.
 *
 * Por eso no lleva `"use client"` ni importa nada de servidor: puede montarlo
 * un componente de servidor —la portada— y también uno de cliente —el
 * formulario, que le pasa lo que hay escrito en los campos ahora mismo—.
 *
 * La imagen es opcional y se dibuja con `object-contain`: lo que sube MAB suele
 * ser una captura de WhatsApp, que es alta y estrecha, y recortarla al ancho de
 * la tarjeta se comería justo el texto que se quiere enseñar.
 *
 * La tarjeta es blanca —la única del sitio— porque esas capturas vienen con
 * fondo blanco. Sobre el hueso del lienzo se recortaban como un rectángulo
 * pegado encima; en blanco, la captura no tiene borde que enseñar.
 */

export type Resena = {
  author: string;
  role: string | null;
  quote: string;
  imageUrl: string | null;
  rating: number | null;
};

export function ReviewCard({ resena }: { resena: Resena }) {
  const iniciales = resena.author
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  return (
    <figure className="card card-resena flex h-full flex-col overflow-hidden">
      {resena.imageUrl && (
        <div className="card-resena relative aspect-[4/3] w-full border-b border-line">
          <Image
            src={resena.imageUrl}
            alt={`Mensaje de ${resena.author}`}
            fill
            // La vista previa del panel enseña un blob local, que next/image no
            // puede procesar; en la portada la URL es de Storage y sí.
            unoptimized={resena.imageUrl.startsWith("blob:")}
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-contain p-3"
          />
        </div>
      )}

      <blockquote className="flex flex-1 flex-col p-6">
        {resena.rating !== null && <Estrellas cantidad={resena.rating} />}

        <p
          className={`text-[15px] leading-relaxed text-ink ${resena.rating !== null ? "mt-4" : ""}`}
        >
          <span aria-hidden="true" className="font-display text-[22px] leading-none text-sun">
            “
          </span>
          {resena.quote}
          <span aria-hidden="true" className="font-display text-[22px] leading-none text-sun">
            ”
          </span>
        </p>

        <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-bold text-accent-ink"
          >
            {iniciales || "·"}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-text text-[15px] font-semibold text-ink">
              {resena.author}
            </span>
            {resena.role && <span className="spec block truncate text-ink-3">{resena.role}</span>}
          </span>
        </figcaption>
      </blockquote>
    </figure>
  );
}

/**
 * Las estrellas son decoración: el número va escrito para quien no las ve. Una
 * fila de cinco iconos sin texto obliga al lector de pantalla a leer «imagen,
 * imagen, imagen…», que no dice nada.
 */
function Estrellas({ cantidad }: { cantidad: number }) {
  return (
    <p className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-4 w-4 ${n <= cantidad ? "text-sun" : "text-line-2"}`}
          fill="currentColor"
        >
          <path d="M10 1.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L2.2 7.5l5.4-.8z" />
        </svg>
      ))}
      <span className="sr-only">{cantidad} de 5 estrellas</span>
    </p>
  );
}
