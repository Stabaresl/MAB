"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Pieza visual de la portada: dos vídeos encadenados en bucle.
 *
 * El encadenado se hace con dos elementos apilados y un cambio de opacidad, no
 * cortando de uno a otro. Mientras el primero termina, el segundo ya está
 * reproduciéndose debajo; lo único que cambia es cuál se ve. Un corte seco
 * delata el punto de unión y hace que dos planos parezcan un fallo de carga.
 *
 * El relevo se pide un poco antes del final, no en el evento `ended`: para
 * cuando `ended` llega ya no hay imagen con la que fundir y el corte vuelve.
 *
 * Peso: el segundo vídeo no se descarga hasta que el primero está en marcha.
 * Son 1.1 MB y 1.4 MB; pedirlos a la vez retrasaría lo primero que se ve del
 * sitio por un archivo que no hace falta hasta pasados cinco segundos.
 */

const CLIPS = ["/portada/portada-1.mp4", "/portada/portada-2.mp4"] as const;
/** Segundos de solape entre un clip y el siguiente. */
const FUNDIDO = 0.9;

export function HeroMedia() {
  const nodos = useRef<(HTMLVideoElement | null)[]>([]);
  const [activo, setActivo] = useState(0);
  const [conVideo, setConVideo] = useState(false);
  const relevando = useRef(false);

  // El vídeo solo entra si el navegador lo va a mover: con movimiento reducido
  // se queda la foto fija, y si el archivo falla no hay un hueco negro.
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

  // El segundo clip se pide cuando el primero ya está rodando.
  const alEmpezar = () => {
    const segundo = nodos.current[1];
    if (segundo && segundo.preload !== "auto") {
      segundo.preload = "auto";
      segundo.load();
    }
  };

  // En escritorio el vídeo manda la altura: se estira a la fila de la rejilla y
  // los márgenes negativos se comen el relleno vertical de la sección, así que
  // llega al filo de arriba y al de abajo sin dejar aire. Lo que sobra lo
  // recorta la sección, que lleva `overflow-hidden`.
  return (
    <div className="funde-izq sangra-der relative mx-auto aspect-[16/10] w-full max-w-[560px] overflow-hidden rounded-lg border border-line lg:-my-24 lg:aspect-auto lg:h-[calc(100%+12rem)] lg:max-w-none lg:rounded-none lg:border-0">
      {/* Debajo de todo, la foto: es lo que se ve mientras llega el vídeo, lo
          que queda con movimiento reducido y lo que salva el hueco si el
          archivo no carga. */}
      <Image
        src="/marca/obra.webp"
        alt="Edificio en construcción con grúa torre"
        fill
        priority
        sizes="(max-width: 1024px) 92vw, 60vw"
        className="object-cover"
      />

      {conVideo &&
        CLIPS.map((clip, indice) => (
          <video
            key={clip}
            ref={(nodo) => {
              nodos.current[indice] = nodo;
            }}
            src={clip}
            muted
            playsInline
            autoPlay={indice === 0}
            preload={indice === 0 ? "auto" : "none"}
            aria-hidden="true"
            onTimeUpdate={alAvanzar(indice)}
            onPlaying={indice === 0 ? alEmpezar : undefined}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
              indice === activo ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
    </div>
  );
}
