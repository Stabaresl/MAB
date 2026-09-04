---
version: 1
name: MAB-design-system
description: "Sistema de diseño de Distribuciones M.A.B, derivado de su propia marca. Lienzo navy profundo (#0F1720) heredado del monograma corporativo, tinta clara y un único acento naranja (#E7622C) que aparece solo en llamadas a la acción, foco y datos de contacto. La pieza de producto — recortada sobre transparencia — es el elemento visual protagonista: porcelana blanca y cromo brillando sobre superficie oscura, igual que en el portafolio impreso. Tipografía display en Archivo, texto en Instrument Sans y las medidas técnicas en IBM Plex Mono, porque una medida es un dato, no una frase. Sin gradientes decorativos, sin sombras difusas, sin cristal esmerilado. La retícula es rígida y las líneas de separación son de un píxel."
---

## Origen

Todos los valores de este documento salen del material real de MAB, no de una
paleta inventada:

- El navy `#131C28` y el naranja `#E7622C` están muestreados del monograma
  corporativo (`PORTAFOLIO MAB 2026.pdf`, pág. 1).
- El lienzo `#0F1720` es ese navy bajado un paso, para que el monograma pueda
  apoyarse encima sin desaparecer.
- Las fotos de producto vienen recortadas sobre fondo plano en el portafolio;
  el sitio conserva ese tratamiento y las sirve con transparencia.

## colors

```
canvas            #0F1720   fondo de página
surface-1         #16202C   tarjeta de producto, panel
surface-2         #1D2937   tarjeta elevada, campo de formulario
surface-3         #26313F   estado hover de superficie
brand-navy        #131C28   navy del monograma, franjas de marca
hairline          #24303E   borde de 1px por defecto
hairline-strong   #33414F   borde de separación fuerte

ink               #F2F5F8   titulares y texto principal
ink-muted         #A7B3C0   texto secundario, descripciones
ink-subtle        #71808F   metadatos, etiquetas, pies
ink-on-accent     #0F1720   texto sobre naranja — nunca blanco

accent            #E7622C   CTA, foco, subrayado activo
accent-hover      #F4794A   hover del CTA
accent-text       #F08A52   naranja legible como texto pequeño sobre canvas
accent-quiet      #2A1C15   fondo de realce naranja al 10%

success           #2E9E5B   artículo publicado, guardado correcto
danger            #E5484D   error de formulario, acción destructiva
warning           #D9A03C   advertencia, artículo sin publicar

inverse-canvas    #F2F5F8   secciones claras puntuales
inverse-ink       #0F1720
```

Reglas de color:

- El naranja no decora. Aparece en el CTA principal, el anillo de foco, el
  indicador de sección activa y el enlace de WhatsApp. Nada más.
- Texto sobre naranja siempre `ink-on-accent`. Blanco sobre `#E7622C` da 3.6:1
  y no pasa AA.
- Naranja como texto pequeño sobre `canvas` usa `accent-text`, no `accent`.
- Nunca un valor de color en línea. Todo pasa por `var(--color-*)`.

## typography

Tres familias, según la disciplina 2+1: display, texto y monoespaciada para
datos técnicos.

```
--font-display   Archivo          700, 800
--font-text      Instrument Sans  400, 500, 600
--font-mono      IBM Plex Mono    400, 500
```

```
display-xl   Archivo  72px / 1.02 / -2.4px / 800
display-lg   Archivo  52px / 1.06 / -1.6px / 800
display-md   Archivo  38px / 1.10 / -1.0px / 700
headline     Archivo  28px / 1.18 / -0.6px / 700
title        Archivo  21px / 1.25 / -0.3px / 700
subhead      Instrument Sans  19px / 1.45 / -0.1px / 500
body-lg      Instrument Sans  17px / 1.60 /  0    / 400
body         Instrument Sans  15px / 1.60 /  0    / 400
body-sm      Instrument Sans  13.5px / 1.55 / 0   / 400
label        Archivo  12px / 1.20 / 1.4px / 700 · MAYÚSCULAS
spec         IBM Plex Mono  13px / 1.45 / 0 / 400
```

Reglas tipográficas:

- Los titulares son siempre romanos. `font-style: italic` en un encabezado está
  prohibido; el énfasis se lleva con peso, color acento o una regla dibujada.
- `label` en mayúsculas con tracking amplio es la firma del monograma
  ("DISTRIBUCIONES"). Se usa para etiquetas de categoría y encabezados de
  sección, nunca para frases largas.
- Toda medida, referencia o material va en `spec` (monoespaciada). "60×40 cm ·
  ABS color gris" es un dato, y se ve como un dato.
- Los display largos llevan `overflow-wrap: anywhere; min-width: 0` para no
  desbordar en 320px.

## spacing

Escala de 4pt. Tokens: `4 8 12 16 20 24 32 40 48 64 80 96 128`.

```
--space-section-y   96px escritorio · 64px móvil
--space-block-y     48px
--space-card-p      20px
--gap-grid          16px
--measure           68ch  ancho máximo de párrafo
--container         1240px
```

## radius

```
--radius-sm    4px    chips, etiquetas
--radius-md    8px    botones, campos
--radius-lg    12px   tarjetas
--radius-full  999px  solo indicadores circulares
```

Nada supera los 12px salvo los indicadores. Las esquinas muy redondeadas
suavizan un producto que es industrial.

## elevation

Este sistema no usa sombras difusas. La separación se consigue con
`1px solid var(--color-hairline)` y cambio de superficie.

```
--ring-focus   0 0 0 2px var(--color-canvas), 0 0 0 4px var(--color-accent)
--lift-hover   translateY(-2px) + borde a hairline-strong
```

Una única sombra permitida, para menús y diálogos sobrepuestos:
`--shadow-overlay: 0 16px 40px -12px rgb(0 0 0 / 0.6)`.

## motion

```
--ease     cubic-bezier(0.22, 0.61, 0.36, 1)
--fast     140ms
--base     220ms
```

Solo se animan `opacity`, `transform` y `border-color`. Nunca `height`,
`width` ni `box-shadow`. Todo respeta `prefers-reduced-motion: reduce`.

## componentes

**Tarjeta de producto.** `surface-1`, borde hairline, radio `lg`. La foto ocupa
un cuadrado con `object-fit: contain` y `padding` interno — el producto flota,
no se recorta. Nombre en `title`, medidas en `spec`, categoría en `label` sobre
`ink-subtle`. En hover: `--lift-hover`. Toda la tarjeta es un enlace, no solo el
título.

**Botón primario.** Fondo `accent`, texto `ink-on-accent`, radio `md`, altura
44px mínima. Nunca envuelve a dos líneas: `white-space: nowrap` y el texto se
mantiene corto.

**Botón WhatsApp.** Variante del primario. Lleva el nombre del artículo en el
mensaje pre-llenado. Es la acción principal de toda ficha de producto.

**Campo de formulario.** `surface-2`, borde hairline, radio `md`, altura 44px.
El foco usa `--ring-focus`. El error pinta el borde de `danger` y añade texto
debajo — el color nunca es el único portador del mensaje.

**Etiqueta de categoría.** `label` en `accent-text` sobre `accent-quiet`, radio
`sm`, padding `4px 8px`.

**Franja de marca.** `brand-navy` a sangre completa con la regla vertical blanca
del monograma como elemento gráfico. Se usa una sola vez por página.

## prohibido

- Chrome de navegador dibujado: barras de URL falsas, puntos de semáforo, marcos
  de teléfono. Las fotos van en un `<figure>` con borde hairline o sin nada.
- Métricas inventadas. Los únicos números publicables son: 15 años de
  trayectoria, el NIT, los dos teléfonos y la lista real de 13 clientes.
- Gradientes decorativos, cristal esmerilado, sombras de colores, brillos.
- Emoji como iconografía.
- Más de un acento cromático. El naranja está solo.
- Texto de botón o de enlace de navegación en dos líneas a cualquier ancho.

## responsive

Verificado en 320 / 375 / 414 / 768 / 1280 px.

- `overflow-x: clip` en `html` y `body`, nunca `hidden`.
- Las pistas de rejilla que contienen imagen usan `minmax(0, 1fr)`, nunca `1fr`.
- Catálogo: 1 columna a 320px, 2 a 480px, 3 a 768px, 4 a 1100px.
- La navegación colapsa a un panel a pantalla completa por debajo de 768px.
- Ningún objetivo táctil por debajo de 44×44px.
