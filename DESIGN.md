---
version: 2
name: MAB-design-system
description: "Sistema de diseño de Distribuciones M.A.B, derivado de su logotipo. Lienzo claro — blanco y un gris papel muy suave — con tinta navy (#10222F) y un único acento ámbar (#DB8324) que sale del naranja del logo. La pieza de producto, recortada sobre transparencia, y las fotos de ambientes reales llevan el peso visual. Titulares en Calistoga, una serifa de display redondeada que da calidez y aleja el resultado del grotesco geométrico con el que todo acaba pareciéndose; texto en Plus Jakarta Sans. Tarjetas con sombra baja tintada de navy, radios generosos y apariciones al hacer scroll que nunca son requisito para ver el contenido."
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

El ámbar `#DB8324` es el naranja del logo subido de tono para que aguante como
fondo de botón. La guía de marca de la empresa usa un dorado en el mismo rango,
así que ambas piezas conviven.

## colors

```
canvas          #FFFFFF   fondo de página
paper           #F5F7F9   secciones alternas, fondo de foto de producto
paper-2         #EAEFF3   estado activo, realce sutil
brand           #153144   franjas de marca, botón sólido, numeración
brand-2         #315064   hover de brand
line            #E3E8ED   borde de 1px por defecto
line-2          #CCD6DE   borde de control, separador fuerte

ink             #10222F   titulares y texto principal   — 15:1 sobre canvas
ink-2           #3A4C5A   texto secundario               — 8.5:1
ink-3           #5C6D7A   metadatos y pies               — 4.9:1
on-brand        #F4F8FB   texto sobre brand

accent          #DB8324   fondo de botón principal, indicadores
accent-hover    #C8721A
accent-strong   #B8651A   ámbar como texto de display grande
accent-ink      #7A4409   ámbar como texto pequeño       — 7.5:1
accent-soft     #FDF1E3   fondo de realce cálido
on-accent       #10222F   texto sobre ámbar — nunca blanco

sky             #8BB7D0   realce frío, del azul del logo
sky-soft        #EAF2F7   halo de fondo

success         #17794A   publicado, guardado correcto
danger          #C0342C   error, acción destructiva
warning         #A86A10   sin publicar
```

Reglas de color:

- El ámbar no decora. Aparece en el botón principal, en el indicador del
  carrusel, en las etiquetas de sección y en el foco. Nada más.
- Texto sobre ámbar siempre `on-accent`. Blanco sobre `#DB8324` no pasa AA.
- Ámbar como texto: `accent-ink` en cuerpo, `accent-strong` en display grande.
  El `accent` puro nunca es texto sobre claro.
- Nunca un valor de color en línea. Todo pasa por `var(--color-*)`.

## typography

Dos familias. La serifa es lo que evita que el sitio lea a plantilla.

```
--font-display   Calistoga         400
--font-text      Plus Jakarta Sans 400, 500, 600, 700
```

```
display-xl   Calistoga  clamp(2.15rem, 5.6vw, 3.9rem) / 1.07 / -0.015em
display-lg   Calistoga  clamp(1.9rem, 4.6vw, 3rem)    / 1.10
display-md   Calistoga  clamp(1.5rem, 3.4vw, 2rem)    / 1.15
card-title   Jakarta    17-19px / 1.35 / 600
body-lg      Jakarta    17px / 1.6 / 400
body         Jakarta    16px / 1.6 / 400
body-sm      Jakarta    14px / 1.55 / 400
label        Jakarta    12px / 1.2 / 700 / 0.1em · MAYÚSCULAS
spec         Jakarta    13.5px / 1.5 / 500 · cifras tabulares
```

Reglas tipográficas:

- Calistoga solo trae un peso. Los titulares no llevan `font-bold` ni
  `font-extrabold`: no existen y el navegador los fingiría deformando la letra.
- Los titulares son siempre romanos. `font-style: italic` en un encabezado está
  prohibido; el énfasis se lleva con color o con escala.
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

Sombras bajas y tintadas de navy, nunca de negro puro: el negro sobre un lienzo
claro ensucia.

```
--shadow-card  0 1px 2px rgb(21 49 68 / 0.04), 0 8px 24px -12px rgb(21 49 68 / 0.12)
--shadow-lift  0 2px 4px rgb(21 49 68 / 0.05), 0 18px 40px -16px rgb(21 49 68 / 0.22)
```

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

**Tarjeta.** `.card`: fondo canvas, borde `line`, radio `lg`, `--shadow-card`.
Con `.card-hover` sube 3px y pasa a `--shadow-lift`.

**Tarjeta de producto.** Foto cuadrada con `object-contain` sobre `paper` — el
producto flota, no se recorta. La foto crece un 6% en hover. Toda la tarjeta es
el enlace, no solo el título.

**Carrusel de categorías.** Es la puerta al catálogo: el visitante elige tipo de
material antes que artículo. Arrastre táctil, flechas que se apagan en los
extremos en vez de desaparecer, e indicador de posición que en móvil sustituye a
las flechas.

**Botones.** `.btn-primary` ámbar, `.btn-brand` navy sólido, `.btn-secondary`
contorno. Altura mínima 48px, `white-space: nowrap`, nunca dos líneas.

**Campo.** Altura 48px, foco con anillo ámbar suave. El error pinta el borde de
`danger` y añade texto debajo — el color nunca es el único portador.

## prohibido

- Chrome de navegador dibujado: barras de URL falsas, marcos de teléfono.
- Métricas inventadas. Los únicos números publicables son: 15 años de
  trayectoria, el NIT, los dos teléfonos, el número real de categorías y
  artículos, y la lista de 13 clientes del portafolio.
- Gradientes decorativos morados o rosas, cristal esmerilado, sombras de color.
- Emoji como iconografía. Los iconos son SVG dibujados a mano.
- Más de un acento cromático. El ámbar está solo; el azul del logo es apoyo.
- Texto de botón o de enlace de navegación en dos líneas a cualquier ancho.
- Contenido que dependa de JavaScript para ser visible.

## responsive

Verificado en 320 / 375 / 414 / 768 / 1280 px.

- `overflow-x: clip` en `html` y `body`, nunca `hidden`.
- Las pistas de rejilla con imagen usan `minmax(0, 1fr)`, nunca `1fr`.
- Catálogo: 1 columna a 320px, 2 a 480px, 3 a 768px, 4 a 1100px.
- Carrusel: 78% de ancho por tarjeta en móvil (deja ver que hay más), 46% a
  520px, 34% a 768px, 27% a 1024px.
- La navegación colapsa a un panel a pantalla completa por debajo de 768px.
- Ningún objetivo táctil por debajo de 44×44px en controles; los enlaces de
  lista, por encima de 24px con separación.
