---
version: 2
name: MAB-design-system
description: "Sistema de diseño de Distribuciones M.A.B, derivado de su logotipo. Lienzo claro — hueso, nunca blanco puro, con un gris papel y un panel de arena cálida — con tinta navy (#10222F) y un único acento azul pizarra (#2E5C7E) tomado del logo. La pieza de producto, recortada sobre transparencia, y las fotos de ambientes reales llevan el peso visual. Titulares en Fraunces, una serifa variable con los ejes SOFT y WONK subidos para quitarle solemnidad, con un remate en itálica como único énfasis; texto en Plus Jakarta Sans. Tarjetas planas de un filete, sin sombra, radios generosos y apariciones al hacer scroll que nunca son requisito para ver el contenido."
---

## Origen

Los colores están muestreados del logotipo que entregó la empresa
(`image/logo.png`), no inventados:

| Muestra | Valor | Dónde aparece en el logo |
|---|---|---|
| Navy principal | `#153144` | trazo del edificio y la palabra MAB (49% del logo) |
| Navy medio | `#315064` | volúmenes secundarios |
| Gris acero | `#738089` | barandas |
| Azul claro | `#8BB7D0` | ventanas |
| Naranja | `#F0A65A` | tejado y detalles |

El logo es navy sobre fondo claro: **sobre superficie oscura desaparece**. Eso
decide el sistema entero — el lienzo es claro, y el navy pasa a ser la tinta y
la superficie de contraste, no el fondo.

El acento es el **azul acero del propio logo**, `#2E5C7E`. Se llegó ahí por
descarte: primero un ámbar sacado del naranja del tejado, después una terracota,
y las dos leían como naranja. Al venir de la marca, la página queda en una sola
familia de color y el acento no compite con el navy: lo continúa. Rinde 6.65:1
sobre el lienzo y 7.12:1 con blanco encima, así que el mismo tono rellena el
botón y escribe.

**El lienzo no es blanco.** El blanco de pantalla es luz, no papel: cansa la
vista y hace que la foto de producto, recortada sobre transparencia, parezca
flotar en el vacío. El lienzo es un hueso muy pálido, `#F8F7F4`, y las secciones
alternas bajan a `#EEEDE8`. La tinta principal rinde 15.2:1 encima, así que no se
pierde legibilidad; se gana un sitio que no deslumbra.

El navy sigue siendo tinta y marca, no fondo de sección: los bloques oscuros con
el rótulo en color se cambiaron por el panel de arena `warm`, que además hace de
contrapunto cálido al acento frío.

## colors

```
canvas          #F8F7F4   fondo de página — hueso, nunca blanco puro
paper           #EEEDE8   secciones alternas, fondo de foto de producto
paper-2         #E4E2DB   estado activo, realce sutil
brand           #153144   tinta de marca, numeración, superficies oscuras
brand-2         #315064   hover de brand
line            #DFDDD6   borde de 1px por defecto
line-2          #C9C6BD   borde de control, separador fuerte

ink             #10222F   titulares y texto principal   — 15.2:1 sobre canvas
ink-2           #3A4C5A   texto secundario               — 8.3:1
ink-3           #5C6D7A   metadatos y pies               — 5.0:1
on-brand        #F4F8FB   texto sobre brand

accent          #2E5C7E   fondo de botón principal, filetes, indicadores
accent-hover    #26506E
accent-strong   #1D3F5C   acento como texto de display grande — 10.2:1
accent-ink      #24496A   acento como texto pequeño           — 8.8:1
accent-soft     #E6EEF4   fondo de realce
on-accent       #FFFFFF   texto sobre el acento               — 7.1:1

warm            #F2EBE1   panel de arena: sección o bloque de cierre
warm-2          #E9E0D2   el mismo panel sobre `paper`, para que se despegue
warm-line       #DDD0BD   borde del panel de arena

sky             #8BB7D0   realce frío, del azul del logo
sky-soft        #E9F0F5   lavado pastel frío

success         #17794A   publicado, guardado correcto
danger          #C0342C   error, acción destructiva
warning         #A86A10   sin publicar
```

Reglas de color:

- El acento no decora. Aparece en el botón principal, en las etiquetas de
  sección, en los filetes de realce y en el foco. Nada más.
- El acento como texto: `accent-ink` en cuerpo, `accent-strong` en display
  grande. El `accent` puro solo escribe a partir de 19px o en negrita.
- **Nunca `#FFFFFF` como fondo.** El lienzo es `canvas`; lo que quiera destacar
  sube a `paper` o baja al panel de arena.
- No hay botón navy sólido. Con el acento en la misma familia que la marca eran
  dos tonos del mismo azul en la misma pantalla y parecían un descuido: la
  acción principal es siempre `.btn-primary`.
- Los colores de filete (`line`, `line-2`) no escriben nunca. Como texto se
  quedan por debajo de 2:1 — la barra de las migas de pan estuvo así y era una
  mancha, no un signo.
- Para separar una sección se usa `paper` o `warm`, nunca `brand`. El navy es
  tinta, botón sólido y numeración; en superficie grande obliga a reescribir
  todo el texto en otro color y a apoyar el rótulo en el acento, que es
  exactamente lo que se descartó.
- Nunca un valor de color en línea. Todo pasa por `var(--color-*)`.

## typography

Dos familias. La serifa es lo que evita que el sitio lea a plantilla.

```
--font-display   Fraunces (variable)  romana e itálica
--font-text      Plus Jakarta Sans    400, 500, 600, 700
```

```
display-xl   Fraunces  clamp(2.15rem, 5.6vw, 3.9rem) / 1.07 / -0.015em
display-lg   Fraunces  clamp(1.9rem, 4.6vw, 3rem)    / 1.10
display-md   Fraunces  clamp(1.5rem, 3.4vw, 2rem)    / 1.15
card-title   Jakarta    17-19px / 1.35 / 600
body-lg      Jakarta    17px / 1.6 / 400
body         Jakarta    16px / 1.6 / 400
body-sm      Jakarta    14px / 1.55 / 400
label        Jakarta    12px / 1.2 / 700 / 0.1em · MAYÚSCULAS
spec         Jakarta    13.5px / 1.5 / 500 · cifras tabulares
```

Reglas tipográficas:

- Los titulares llevan siempre `font-variation-settings: "SOFT" 60, "WONK" 1,
  "opsz" 72`. Ahí está lo que le quita la solemnidad a la página: `SOFT`
  redondea los remates, `WONK` deja que algunas letras se salgan de la norma y
  `opsz` engorda los trazos finos para que a tamaño grande no se afile como una
  serifa de periódico. Sin esos ejes, Fraunces se dibuja en su ajuste neutro y
  suena igual de seria que la Instrument Serif que sustituyó.
- La familia se pide sin `weight`, para que llegue la variable entera. Declarar
  pesos sueltos entrega estáticas y los ejes dejan de existir.
- La única itálica del sistema es `.remate`, y solo cierra un titular: «Elige por
  *tipo de material*». Es un remate de dos tiempos, no un énfasis suelto. Fuera
  de display, la itálica está prohibida.
- Las medidas van en `spec`, con cifras tabulares. Se descartó la monoespaciada:
  daba un aire técnico que peleaba con la calidez de la serifa.
- Los display largos llevan `overflow-wrap: anywhere; min-width: 0` para no
  desbordar en 320px.

## spacing

Escala de 4pt. Tokens: `4 8 12 16 20 24 32 40 48 64 80 96 128`.

```
sección     py-16 en móvil · py-24 en escritorio
bloque      py-10
tarjeta     p-5 / p-6
rejilla     gap-4 / gap-5
medida      62ch máximo de párrafo
contenedor  1240px
```

## radius

```
--radius-sm    6px    chips, etiquetas
--radius-md   10px    botones, campos
--radius-lg   16px    tarjetas
--radius-xl   24px    bloques de cierre
```

## elevation

**No hay sombras.** Se probaron —bajas y tintadas de navy— y sobre un lienzo
claro apilaban un relieve falso que ensuciaba la retícula. El relieve lo lleva un
filete de un pixel: `line` en reposo, `ink-3` al pasar por encima. Los tokens de
sombra se retiraron para que nadie los reintroduzca por inercia.

El foco es `outline: 2px solid var(--color-accent)` con `outline-offset: 2px`.

## motion

```
--ease-brand  cubic-bezier(0.22, 0.61, 0.36, 1)
hover         180ms
tarjeta       220ms
aparición     600ms
```

Solo se animan `opacity` y `transform`. Nunca `height`, `width` ni `box-shadow`
en bucle.

**Las apariciones al hacer scroll no pueden ocultar contenido.** El estado
oculto vive tras la clase `.js`, que pone un script en línea antes del primer
pintado; sin JavaScript no existe la regla y la página se lee entera. Un único
`IntersectionObserver` marca los bloques, y lo que ya está en la primera
pantalla se revela sin esperarlo. Todo se desactiva con
`prefers-reduced-motion`.

## componentes

**Tarjeta.** `.card`: fondo canvas, filete `line`, radio `md`, sin sombra. Con
`.card-hover` el filete pasa a `ink-3`; la tarjeta no se mueve ni se levanta.

**Tarjeta de producto.** Foto cuadrada con `object-contain` sobre `paper` — el
producto flota, no se recorta. La foto crece un 6% en hover. Toda la tarjeta es
el enlace, no solo el título.

**Cinturón de categorías.** Es la puerta al catálogo: el visitante elige tipo de
material antes que artículo. Va de borde a borde —la cabecera sí se alinea con el
contenedor, la cinta no— y avanza sola a 38 px/s.

Es un contenedor con desplazamiento real, no una animación. Esa es la decisión
que lo sostiene: con `scrollLeft` la cinta se empuja con el dedo, con la rueda,
arrastrando con el ratón o con las flechas, y el avance automático es solo
alguien más sumando a la misma propiedad. Con una animación de `transform` el
movimiento salía gratis pero la cinta era intocable.

Tres detalles que no son opcionales:

- La posición del avance se lleva en una variable en coma flotante, no en
  `scrollLeft`. Medio píxel por fotograma se pierde al redondear y la cinta se
  queda clavada en el sitio.
- El avance no puede escuchar el evento `scroll` para saber si alguien la tocó:
  se marcaría a sí misma y se pararía en el primer fotograma. Se escuchan los
  gestos —rueda, dedo, puntero—, que es lo que de verdad importa.
- Un arrastre no puede terminar abriendo una categoría. Al soltar, el navegador
  manda un `click` al enlace que quedó debajo; se corta en la fase de captura
  cuando el puntero recorrió más de 6px.

Se detiene al pasar el ratón, al recibir el foco de teclado y con un botón de
pausa visible, obligatorio porque el movimiento dura más de cinco segundos
(WCAG 2.2.2). Las piezas de la copia salen del recorrido de tabulación y del
árbol de accesibilidad. Con `prefers-reduced-motion` no se mueve: la copia
desaparece y la cinta se recorre a mano, con su barra.

**Portada.** Dos vídeos encadenados en bucle: el primero termina, el segundo ya
está rodando debajo y solo cambia cuál se ve. El relevo se pide antes del final,
no en `ended` — para cuando ese evento llega ya no hay imagen con la que fundir y
vuelve el corte. Debajo de los dos hay una foto fija, que es lo que se ve
mientras llega el vídeo, lo que queda con `prefers-reduced-motion` y lo que salva
el hueco si el archivo falla. El segundo clip no se descarga hasta que el primero
está en marcha: son 2.6 MB entre los dos y el segundo no hace falta hasta pasados
cinco segundos.

**Lavado pastel.** `.lavado-frio` / `.lavado-calido`: una sección que entra desde
el blanco, se tiñe por el centro y vuelve al blanco. Da color sin meter un bloque
plano —que obligaría a recalcular el contraste de todo el texto— y sin sumar un
acento nuevo: el tinte sale del azul y de la arena que ya tiene el sistema.

**Onda.** El separador entre secciones de distinto fondo. Se dibuja dentro de la
sección que empieza pero pintada del color de la que termina, así que el color
anterior invade unos píxeles con un borde curvo. Va donde cambia el fondo, no
entre cada bloque: una onda cada dos palmos es ruido. Los filetes rectos siguen
donde separan piezas dentro de una misma superficie.

**Índice de referencias.** Ni tarjetas ni carrusel. Las fotos del catálogo
llegan recortadas sobre transparencia, así que la tarjeta les sobraba: era un
rectángulo pálido puesto sobre el lavado de color solo para sostener una pieza
que ya venía suelta, y ese choque de fondos era lo que se veía mal. La pieza
flota directamente sobre la sección y el texto se ordena como un índice —número,
nombre, categoría— con la foto de la fila señalada en un panel que acompaña el
desplazamiento. El puntero y el tabulador la cambian igual.

**Vitrina de clientes.** Cada ficha crece según lo cerca que esté del centro de
la pista y vuelve a su tamaño al alejarse, así que la fila tiene un foco en vez
de trece casillas iguales; el puntero encima adelanta ese mismo aumento. El
componente escribe `--cercania` (0 en los extremos, 1 en el medio) en cada
fotograma y el CSS lo traduce a escala y opacidad: la interpolación la lleva el
compositor y la transformación no toca la maquetación.

Tres copias de la lista, no dos. Con dos, la vitrina empieza y acaba en un
extremo y se ve medio ancho de pista vacío hasta que el avance la llena; con
tres se arranca en la del medio, que siempre tiene fichas a los dos lados. Y la
vuelta se mide entre dos fichas equivalentes, no dividiendo el ancho total:
la pista lleva relleno lateral para que los extremos puedan llegar al centro, y
ese relleno no forma parte de la vuelta.

Los logotipos van **en su color**. Se probó repintarlos en la tinta del sitio,
que es el tratamiento habitual de un muro de clientes, y se descartó: el color es
parte de la marca y es por lo que se reconoce a un cliente. De los trece hay
archivo de cinco —los demás no tienen sitio alcanzable o no lo publican—, así
que todas las fichas llevan el nombre debajo y la que no tiene logotipo no se
lee como un hueco.

**Personaje de la portada del pie.** Va detrás de la tarjeta de cierre, con el
filo superior cruzándole a la altura del codo: de ahí para abajo lo tapa la
tarjeta, así que el brazo descansa sobre el canto en vez de quedar en el aire.
La altura no es un número redondo por casualidad —el codo está al 65% de la
figura contando desde los pies, medido sobre el archivo— y va volteado para que
el brazo doblado caiga del lado de la tarjeta.

**Botón de cotización.** Abre las dos vías, WhatsApp y correo, en vez de llevar
directo a una. En una compra de obra, con referencias y cantidades, el correo es
a menudo lo que hace falta. Es un menú de verdad: se cierra al pulsar fuera, con
Escape y al elegir, y el foco vuelve al botón.

**Entrada al panel.** Un enlace discreto en la barra inferior del pie. El
administrador es una sola persona, pero tener la puerta a mano evita depender de
recordar una dirección escrita a mano. No se esconde: la seguridad la ponen la
sesión y las políticas de la base, no el que nadie encuentre el enlace.

**Foto que se funde con la página.** `.funde-izq` / `.funde-der`: la foto que
acompaña a un texto se disuelve por el lado del texto y se ha unido con el fondo
antes de llegar al centro de la sección. Es una máscara, no un degradado encima:
la foto se vuelve transparente de verdad y sirve igual sobre blanco, sobre papel
o sobre el panel de arena. Solo a partir de 1024px —por debajo la foto va encima
del texto, no al lado— y el filete se retira en ese tramo, porque un borde que se
desvanece por un costado y se corta por el otro delata el truco.

Pide **una** foto frente al texto. Sobre una rejilla de varias con esquinas
redondeadas parte una tarjeta por la mitad y lee como un defecto; se probó en la
sección de calidad de la portada y se descartó por eso.

**Botones.** `.btn-primary` en el acento con texto blanco y `.btn-secondary` de
contorno. Altura mínima 48px, `white-space: nowrap`, nunca dos líneas.

**Correo.** Los enlaces de correo no son `mailto:`, van a la ventana de
redacción de Gmail con destinatario, asunto y cuerpo escritos. Un `mailto:` se lo
queda el programa que el sistema tenga por defecto —en Windows, Outlook aunque
quien escribe use Gmail— y el correo no sale. El cuerpo lleva los huecos que MAB
necesita para cotizar: referencias, cantidades, ciudad de entrega y fecha. El
precio es que quien no use Gmail ve una pantalla de acceso.

**Campo.** Altura 48px, foco con anillo del acento. El error pinta el borde de
`danger` y añade texto debajo — el color nunca es el único portador.

## prohibido

- Chrome de navegador dibujado: barras de URL falsas, marcos de teléfono.
- Métricas inventadas. Los únicos números publicables son: 15 años de
  trayectoria, el NIT, los dos teléfonos, el número real de categorías y
  artículos, y la lista de 13 clientes del portafolio.
- Gradientes decorativos morados o rosas, cristal esmerilado, sombras de color.
- Emoji como iconografía. Los iconos son SVG dibujados a mano.
- Más de un acento cromático. El azul pizarra está solo; el navy es tinta,
  y los lavados pastel son fondo, no acento.
- Utilidades propias en la capa `components`. Van en `utilities`: en capas de CSS
  manda el orden de capa sobre la especificidad, así que desde `components`
  cualquier utilidad de Tailwind las pisa por muy pesado que sea el selector.
- Piezas de escaparate que no llevan a ningún sitio. En la portada estuvo un
  visor 360° de un grifo de demostración que la empresa no vende; se cambió por
  referencias reales del catálogo, que salen de la misma base que administra MAB.
- Bloques de fondo oscuro con el rótulo en color de acento. Se probaron y se
  descartaron: para separar una sección está el panel de arena.
- Texto de botón o de enlace de navegación en dos líneas a cualquier ancho.
- Contenido que dependa de JavaScript para ser visible.

## responsive

Verificado en 320 / 375 / 414 / 768 / 1280 px.

- `overflow-x: clip` en `html` y `body`, nunca `hidden`.
- Las pistas de rejilla con imagen usan `minmax(0, 1fr)`, nunca `1fr`.
- Catálogo: 1 columna a 320px, 2 a 480px, 3 a 768px, 4 a 1100px.
- Cinturón: pieza de 264px hasta 640px y de 292px por encima, con el relleno
  incluido en el ancho para que la vuelta cuadre al milímetro. Va de borde a
  borde y se desvanece en los extremos con una máscara.
- El fundido de foto (`.funde-izq` / `.funde-der`) y el sangrado a pantalla
  (`.sangra-der` / `.sangra-izq`) solo existen a partir de 1024px. Por debajo la
  foto va encima del texto, no al lado.
- El lado alterna. Portada y «calidad certificada» llevan la foto a la derecha;
  «materiales que cumplen» y «logística» la llevan a la izquierda. El texto va
  siempre primero en el código —en móvil se lee antes el titular que la foto— y
  el orden visual se cambia con `lg:order-*`.
- En la portada el vídeo manda la altura: se estira a la fila y sus márgenes
  negativos se comen el relleno vertical de la sección, así que llega de filo a
  filo. Lo que sobra lo recorta el `overflow-hidden` de la sección.
- `.sangra-der` ensancha con `width: calc(100% + …)`, no solo con margen
  negativo: con un ancho explícito puesto por una utilidad, el margen negativo
  corre lo que viene detrás pero deja la caja igual de estrecha.
- La navegación colapsa a un panel a pantalla completa por debajo de 768px.
- Ningún objetivo táctil por debajo de 44×44px en controles; los enlaces de
  lista, por encima de 24px con separación.
