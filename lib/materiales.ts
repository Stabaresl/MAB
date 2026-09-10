import { fold } from "@/lib/slug";

/**
 * Filtro por material.
 *
 * El catálogo no tiene una columna «material»: MAB escribe la referencia en el
 * campo de medidas, que es donde tiene sentido teclearla —«60x40 cm · ABS color
 * gris»—. Pedirle que además rellene un desplegable por cada artículo sería
 * pedirle que escriba dos veces lo mismo, y el día que se le olvide el filtro
 * mentiría.
 *
 * Así que el material se deduce del texto que ya existe. Cada familia declara
 * las formas en que aparece escrita, y solo se ofrecen en el filtro las que de
 * verdad tienen artículos detrás: una lista con «Madera (0)» no es una
 * categoría vacía, es una promesa incumplida.
 *
 * La comparación va sobre texto sin tildes y en minúsculas, porque «acrílico» y
 * «acrilico» son la misma palabra para quien busca.
 */

type Familia = { etiqueta: string; patrones: string[] };

const FAMILIAS: Familia[] = [
  { etiqueta: "ABS", patrones: ["abs"] },
  { etiqueta: "Cromado", patrones: ["cromad", "cromo"] },
  { etiqueta: "Acero inoxidable", patrones: ["inoxidable", "inox", "acero"] },
  { etiqueta: "Acrílico", patrones: ["acrilic"] },
  { etiqueta: "PVC", patrones: ["pvc"] },
  { etiqueta: "Madera", patrones: ["madera", "mdf", " rh"] },
  { etiqueta: "LED", patrones: ["led"] },
  { etiqueta: "Cerámica", patrones: ["ceramic", "porcelan"] },
];

/** El texto de un artículo donde puede estar escrito el material. */
export function textoDeMaterial(articulo: {
  name: string;
  specs: string | null;
}): string {
  return fold(`${articulo.name} ${articulo.specs ?? ""}`);
}

/** Materiales que menciona un artículo. Puede ser ninguno, y no pasa nada. */
export function materialesDe(articulo: { name: string; specs: string | null }): string[] {
  const texto = textoDeMaterial(articulo);
  return FAMILIAS.filter((familia) =>
    familia.patrones.some((patron) => texto.includes(patron)),
  ).map((familia) => familia.etiqueta);
}

/**
 * Los materiales presentes en una lista de artículos, con cuántos hay de cada
 * uno, ordenados de más a menos frecuente.
 */
export function contarMateriales(
  articulos: { name: string; specs: string | null }[],
): { etiqueta: string; cuantos: number }[] {
  const cuenta = new Map<string, number>();

  for (const articulo of articulos) {
    for (const material of materialesDe(articulo)) {
      cuenta.set(material, (cuenta.get(material) ?? 0) + 1);
    }
  }

  return [...cuenta.entries()]
    .map(([etiqueta, cuantos]) => ({ etiqueta, cuantos }))
    .sort((a, b) => b.cuantos - a.cuantos || a.etiqueta.localeCompare(b.etiqueta, "es"));
}
