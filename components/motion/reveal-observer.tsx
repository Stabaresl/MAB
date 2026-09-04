"use client";

import { useEffect } from "react";

/**
 * Motor de las apariciones al hacer scroll.
 *
 * Un solo IntersectionObserver para toda la página, en vez de uno por bloque.
 * Observa también los nodos que aparezcan después —cambios de ruta, listas que
 * se filtran— mediante un MutationObserver.
 *
 * Si el navegador no trae IntersectionObserver, se marca todo como visible de
 * inmediato: el sitio pierde la animación, nunca el contenido.
 */
export function RevealObserver() {
  useEffect(() => {
    const seleccion = "[data-reveal], [data-stagger]";

    const revelar = (elemento: Element) => {
      elemento.setAttribute("data-visto", "");
      // Los hijos escalonados reciben su retraso por índice, no por CSS
      // `nth-child`, que no sabría contar los que se filtran fuera.
      if (elemento.hasAttribute("data-stagger")) {
        const hijos = elemento.querySelectorAll<HTMLElement>("[data-stagger-item]");
        hijos.forEach((hijo, i) => {
          hijo.style.transitionDelay = `${Math.min(i * 0.055, 0.4)}s`;
        });
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(seleccion).forEach(revelar);
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          revelar(entrada.target);
          observador.unobserve(entrada.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    const registrar = (raiz: ParentNode) => {
      raiz.querySelectorAll(seleccion).forEach((el) => {
        if (el.hasAttribute("data-visto")) return;
        // Lo que ya está en pantalla al cargar no espera al observador: se
        // revela en el acto para que la primera pantalla no parpadee.
        const caja = el.getBoundingClientRect();
        if (caja.top < window.innerHeight * 0.92) {
          revelar(el);
          return;
        }
        observador.observe(el);
      });
    };

    registrar(document);

    const mutaciones = new MutationObserver((cambios) => {
      for (const cambio of cambios) {
        cambio.addedNodes.forEach((nodo) => {
          if (nodo instanceof Element) registrar(nodo.parentNode ?? document);
        });
      }
    });
    mutaciones.observe(document.body, { childList: true, subtree: true });

    return () => {
      observador.disconnect();
      mutaciones.disconnect();
    };
  }, []);

  return null;
}
