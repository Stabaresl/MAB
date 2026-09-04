/**
 * Convierte logo_sealbyte.svg en un componente React.
 *
 * El SVG original trae un viewBox de 1408x768 con el dibujo ocupando solo la
 * franja central, y el relleno fijado a negro. Aqui se recorta el viewBox al
 * contenido real y el relleno pasa a currentColor para que el logo herede el
 * color del pie de pagina.
 *
 * Uso puntual (Fase 0):  node scripts/build-sealbyte-mark.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "logo_sealbyte.svg";
const TARGET = "components/sealbyte-mark.tsx";
const VIEWBOX = "430 119 547 562"; // trazado real + 6 unidades de margen

const svg = readFileSync(SOURCE, "utf8");
const start = svg.indexOf("<g ");
const end = svg.lastIndexOf("</g>");

if (start < 0 || end < 0) {
  console.error(`No se encontro el grupo de trazados en ${SOURCE}`);
  process.exit(1);
}

const paths = svg
  .slice(start, end + 4)
  .replace(/fill="#000000"/g, 'fill="currentColor"')
  .replace(/\r/g, "")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => `      ${line}`)
  .join("\n");

const component = `/**
 * Marca de Sealbyte, el estudio que desarrolla este sitio.
 *
 * Generado por scripts/build-sealbyte-mark.mjs a partir de logo_sealbyte.svg.
 * El viewBox va recortado al dibujo y el relleno es currentColor, asi que el
 * logo toma el color del texto que lo rodea.
 */
export function SealbyteMark({
  className,
  title = "Sealbyte Technology",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="${VIEWBOX}"
      className={className}
      role="img"
      aria-label={title}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
${paths}
    </svg>
  );
}
`;

writeFileSync(TARGET, component, "utf8");
console.log(`${TARGET} escrito (${component.length} bytes, ${(svg.match(/<path/g) ?? []).length} trazados)`);
