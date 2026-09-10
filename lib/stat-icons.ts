/**
 * Iconos disponibles para los contadores de la portada.
 *
 * La lista vive aparte del componente que los dibuja porque también la
 * necesitan el esquema de validación y el desplegable del panel, y ninguno de
 * los dos debería arrastrar SVG solo para saber qué nombres son válidos.
 */
export const ICONOS_INDICADOR = [
  { valor: "trayectoria", etiqueta: "Trayectoria (calendario)" },
  { valor: "catalogo", etiqueta: "Catálogo (cajas)" },
  { valor: "categorias", etiqueta: "Categorías (rejilla)" },
  { valor: "clientes", etiqueta: "Clientes (personas)" },
  { valor: "cotizacion", etiqueta: "Cotizaciones (documento)" },
  { valor: "entrega", etiqueta: "Entregas (camión)" },
  { valor: "obra", etiqueta: "Obra (edificio)" },
  { valor: "estrella", etiqueta: "Valoración (estrella)" },
] as const;

export type IconoIndicador = (typeof ICONOS_INDICADOR)[number]["valor"];

export const NOMBRES_ICONO = ICONOS_INDICADOR.map((i) => i.valor) as unknown as [
  IconoIndicador,
  ...IconoIndicador[],
];
