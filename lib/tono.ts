/**
 * Qué tono le toca a cada categoría.
 *
 * Sale del slug y no de la posición en la lista, y esa es la decisión que hace
 * que el color signifique algo: «Rejillas» es arena en la portada, en el
 * cinturón, en la rejilla del catálogo y en su propia página, y sigue siéndolo
 * después de que alguien reordene las categorías en el panel. Si dependiera del
 * índice, el color cambiaría al arrastrar una fila y dejaría de ser un dato
 * para volver a ser decoración.
 *
 * El precio es que con más de seis categorías hay repeticiones, y que dos que
 * repiten tono pueden caer juntas en la rejilla. Es un precio pequeño: el color
 * ayuda a reconocer, no a numerar, y el nombre siempre está escrito al lado.
 *
 * El hash es FNV-1a de 32 bits: cabe en tres líneas, reparte bien cadenas
 * cortas y da el mismo número en el servidor y en el navegador, que es lo único
 * que aquí no se puede negociar —un tono distinto en cada lado sería un error
 * de hidratación.
 */

export const TONOS = 6;

export function tonoDeCategoria(slug: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    // El desplazamiento es la multiplicación por 16777619 del FNV clásico,
    // escrita con sumas para no salirse de los 32 bits en JavaScript.
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    hash >>>= 0;
  }
  return (hash % TONOS) + 1;
}

/** La clase que hay que poner en el elemento para heredar las tres variables. */
export function claseTono(slug: string): string {
  return `tono tono-${tonoDeCategoria(slug)}`;
}
