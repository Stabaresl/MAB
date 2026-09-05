"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Pieza visual de la portada: tres vídeos encadenados en bucle.
 *
 * El encadenado se hace con los elementos apilados y un cambio de opacidad, no
 * cortando de uno a otro. Mientras uno termina, el siguiente ya está
 * reproduciéndose debajo; lo único que cambia es cuál se ve. Un corte seco
 * delata el punto de unión y hace que dos planos parezcan un fallo de carga.
 *
 * El relevo se pide un poco antes del final, no en el evento `ended`: para
 * cuando `ended` llega ya no hay imagen con la que fundir y el corte vuelve.
 *
 * Cada vídeo lleva SU PROPIO primer fotograma como póster. Antes había debajo
 * una foto de una obra, y era lo que se veía el instante previo a arrancar: un
 * edificio que no tenía nada que ver con el plano que venía después. Los
 * pósters salen de los mismos archivos —ver el comentario de abajo—, así que lo
 * que se ve antes de reproducir es exactamente el primer fotograma.
 *
 * Peso: solo el primer clip se descarga de entrada. Cada uno pide el siguiente
 * cuando ya está rodando, así que los 4 MB de vídeo no compiten por el ancho de
 * banda con lo primero que se ve del sitio.
 */

/**
 * Los clips, en orden de reproducción. El póster de cada uno se generó con el
 * navegador: cargar el vídeo, saltar a 0.08 s —el fotograma 0 de algunos sale
 * negro— y capturar el elemento.
 */
const CLIPS = ["portada-1", "portada-2", "portada-3"] as const;

/** Segundos de solape entre un clip y el siguiente. */
const FUNDIDO = 0.9;

export function HeroMedia() {
  const nodos = useRef<(HTMLVideoElement | null)[]>([]);
  const [activo, setActivo] = useState(0);
  const [conVideo, setConVideo] = useState(false);
  const relevando = useRef(false);

  // El vídeo solo entra si el navegador lo va a mover: con movimiento reducido
  // se queda el primer fotograma fijo.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setConVideo(true);
  }, []);

  const relevar = useCallback(() => {
    if (relevando.current) return;
    relevando.current = true;

    const siguiente = (activo + 1) % CLIPS.length;
    const entrante = nodos.current[siguiente];
    const saliente = nodos.current[activo];

    if (entrante) {
      entrante.currentTime = 0;
      void entrante.play().catch(() => {});
    }
    setActivo(siguiente);

    // El que sale se rebobina cuando ya no se ve, para que en su próximo turno
    // arranque desde el primer fotograma sin que se note el rebobinado.
    window.setTimeout(() => {
      if (saliente) {
        saliente.pause();
        saliente.currentTime = 0;
      }
      relevando.current = false;
    }, FUNDIDO * 1000);
  }, [activo]);

  const alAvanzar = (indice: number) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (indice !== activo) return;
    const video = e.currentTarget;
    if (!video.duration || Number.isNaN(video.duration)) return;
    if (video.duration - video.currentTime <= FUNDIDO) relevar();
  };

  /** Cada clip pide el siguiente en cuanto él mismo está rodando. */
  const alEmpezar = (indice: number) => () => {
    const siguiente = nodos.current[(indice + 1) % CLIPS.length];
    if (siguiente && siguiente.preload !== "auto") {
      siguiente.preload = "auto";
      siguiente.load();
    }
  };

  // En escritorio el vídeo manda la altura: se estira a la fila de la rejilla y
  // los márgenes negativos se comen el relleno vertical de la sección, así que
  // llega al filo de arriba y al de abajo sin dejar aire. Lo que sobra lo
  // recorta la sección, que lleva `overflow-hidden`.
  return (
    <div className="funde-izq sangra-der relative mx-auto aspect-[16/10] w-full max-w-[560px] overflow-hidden rounded-lg border border-line lg:-my-24 lg:aspect-auto lg:h-[calc(100%+12rem)] lg:max-w-none lg:rounded-none lg:border-0">
      {/* Con movimiento reducido no hay vídeo: queda el primer fotograma del
          primer clip, que es la misma imagen con la que arrancaría. */}
      {!conVideo && (
        <Image
          src={`/portada/${CLIPS[0]}.webp`}
          alt="Plano de una vivienda levantándose en tres dimensiones"
          fill
          priority
          sizes="(max-width: 1024px) 92vw, 60vw"
          className="object-cover"
        />
      )}

      {conVideo &&
        CLIPS.map((clip, indice) => (
          <video
            key={clip}
            ref={(nodo) => {
              nodos.current[indice] = nodo;
            }}
            src={`/portada/${clip}.mp4`}
            poster={`/portada/${clip}.webp`}
            muted
            playsInline
            autoPlay={indice === 0}
            preload={indice === 0 ? "auto" : "none"}
            aria-hidden="true"
            onTimeUpdate={alAvanzar(indice)}
            onPlaying={alEmpezar(indice)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
              indice === activo ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
    </div>
  );
}
