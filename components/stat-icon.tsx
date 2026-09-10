/**
 * Iconografía de los contadores. SVG propio, trazado con el mismo grosor que
 * el resto del sitio. Nunca emoji.
 */
export function StatIcon({ nombre }: { nombre: string }) {
  const comun = {
    viewBox: "0 0 24 24",
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (nombre) {
    case "trayectoria":
      return (
        <svg {...comun}>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
          <path d="M8.5 14.5l2.2 2.2 4.3-4.5" />
        </svg>
      );

    case "catalogo":
      return (
        <svg {...comun}>
          <path d="M3.5 8.2L12 4l8.5 4.2v7.6L12 20l-8.5-4.2z" />
          <path d="M3.5 8.2L12 12.4l8.5-4.2M12 12.4V20" />
        </svg>
      );

    case "categorias":
      return (
        <svg {...comun}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
        </svg>
      );

    case "clientes":
      return (
        <svg {...comun}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
          <path d="M16 5.2a3.2 3.2 0 010 5.9M17.5 14.9c1.8.6 3 2.4 3 4.6" />
        </svg>
      );

    case "cotizacion":
      return (
        <svg {...comun}>
          <path d="M6 3.5h8.5L19 8v12.5H6z" />
          <path d="M14 3.5V8h5" />
          <path d="M9 12.5h6M9 16h4" />
        </svg>
      );

    case "entrega":
      return (
        <svg {...comun}>
          <path d="M2.5 7.5h10v9h-10z" />
          <path d="M12.5 11h4l3 3v2.5h-7z" />
          <circle cx="7" cy="18" r="1.8" />
          <circle cx="16.5" cy="18" r="1.8" />
        </svg>
      );

    case "estrella":
      return (
        <svg {...comun}>
          <path d="M12 3.8l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 10l5.9-.9z" />
        </svg>
      );

    default:
      return (
        <svg {...comun}>
          <path d="M4 20.5V9l6-4.5V9l6-4.5v16" />
          <path d="M4 20.5h16.5M8 20.5v-4h4v4" />
        </svg>
      );
  }
}
