# Distribuciones M.A.B — catálogo web

Catálogo de implementos y acabados para construcción, administrable por la propia
empresa. Sin carrito: cada artículo lleva foto, descripción y contacto directo por
WhatsApp y correo, porque el negocio se cierra cotizando.

Desarrollado por [Sealbyte](https://sealbyte.co).

---

## Stack

| Pieza | Elección |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript estricto |
| Estilos | Tailwind CSS v4 con tokens en `app/globals.css` |
| Base de datos, autenticación y archivos | Supabase (Postgres + Auth + Storage) |
| Validación | Zod, compartida entre formulario y servidor |
| Imágenes | `sharp` en la subida, `next/image` al servir |
| Despliegue | Vercel + GitHub |

El sistema de diseño está en [`DESIGN.md`](DESIGN.md): colores, tipografía,
espaciado y las reglas de lo que no se hace. Sale de la marca real de MAB, no de
una paleta inventada.

---

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # rellena las claves de Supabase
npm run dev
```

El sitio arranca aunque no haya Supabase configurado: el catálogo se sirve vacío
y queda un aviso en la consola. Así se puede compilar y desplegar antes de tener
la base de datos lista.

### Base de datos en local

Necesita Docker.

```bash
npx supabase start                                    # levanta Postgres, Auth y Storage
npx supabase db reset                                 # aplica supabase/migrations/
node --env-file=.env.local scripts/seed.mjs \
  --admin correo@ejemplo.com --clave "una-clave-larga"
```

`supabase start` imprime la URL, la clave `anon` y la `service_role` para
`.env.local`.

### Base de datos en producción

1. Crear el proyecto en [supabase.com](https://supabase.com).
2. Aplicar las migraciones: `npx supabase link --project-ref <ref>` y
   `npx supabase db push`.
3. Sembrar el catálogo y crear el administrador con el mismo `scripts/seed.mjs`,
   apuntando `.env.local` al proyecto de producción.

Cuando se añade una migración a un proyecto que ya está en marcha basta con
`npx supabase db push`. Sin la CLI conectada, la alternativa es pegar el archivo
en el editor SQL de Supabase; conviene envolverlo en `begin;` … `commit;` para
que un fallo a mitad no deje el esquema aplicado por la mitad.

---

## Estructura

```
app/
  (sitio)/            sitio público — inicio, catálogo, ficha, nosotros, contacto
  admin/              panel — solo con sesión: artículos, categorías, reseñas,
                      clientes, indicadores y ajustes
components/
  admin/              formularios y listados del panel
lib/
  actions/            Server Actions: toda escritura pasa por aquí
  catalog.ts          consultas del sitio público
  admin.ts            consultas del panel (incluye lo no publicado)
  images.ts           validación y conversión de imágenes subidas
  storage.ts          subida y borrado en Supabase Storage
supabase/migrations/  esquema, índices, triggers, políticas RLS y la función
                      de borrado de una categoría con todo lo que tenga dentro
scripts/              preparación de assets y semilla (uso puntual)
data/manifest.json    catálogo inicial: categorías, artículos e imágenes de origen
public/catalogo/      fotos del catálogo inicial, ya procesadas a WebP
public/banners/       piezas gráficas de la empresa para la cabecera del catálogo
```

---

## Qué administra MAB sin tocar código

| Sección del panel | Qué cambia en el sitio |
|---|---|
| Artículos | El catálogo entero y las fichas de producto. La estrella de cada fila los pone entre «los más vendidos», la vitrina que abre el catálogo |
| Categorías | Los grupos del catálogo, su portada y su orden |
| Reseñas | El bloque de opiniones de la portada. Se suben con la captura del mensaje y el texto transcrito, porque las opiniones llegan por WhatsApp y por correo. El formulario enseña la tarjeta real mientras se escribe |
| Clientes | El carrusel de referencias, con su logotipo y su orden |
| Indicadores | Las cifras que suben en la portada |
| Ajustes | Teléfonos, correo, dirección y NIT |

Un indicador puede llevar el número escrito a mano o dejar que lo cuente el
servidor —artículos publicados, categorías, clientes—. Los automáticos se
resuelven al servir la página y no se guardan: si el número viviera en la fila
habría que acordarse de actualizarlo cada vez que se publica un artículo, y el
día que se olvidara la portada estaría mintiendo.

**Borrar una categoría se lleva sus artículos.** La clave foránea sigue siendo
`on delete restrict` —esa es la red que impide que un borrado accidental desde
cualquier otro sitio vacíe el catálogo—, y el panel pasa por una función de
Postgres que hace las dos cosas en una sola transacción. El botón dice cuántos
artículos se van a borrar antes de hacerlo.

## Cómo está protegido el panel

Tres barreras, en este orden:

1. **`middleware.ts`** — cierra `/admin/*` a quien no tenga sesión y la refresca
   en cada petición. Es lo que hace que se vea una pantalla de acceso en lugar de
   un error.
2. **Row Level Security en Postgres** — es la barrera real. El sitio público lee
   con la clave anónima, que solo tiene permiso de `SELECT`, y únicamente sobre
   productos publicados. Cualquier escritura sin sesión la rechaza la base de
   datos, no la aplicación.
3. **`requireAdmin()`** al principio de cada Server Action — devuelve un mensaje
   entendible cuando la sesión caduca con el formulario abierto.

La clave `service_role` solo la usa `scripts/seed.mjs`, que se ejecuta a mano
desde una terminal. No se importa desde ningún archivo de `app/`.

## Qué se hizo para que la subida de artículos no falle

- **Slugs.** Se transliteran las tildes y la eñe (`Baños` → `banos`). La unicidad
  la garantiza el constraint `UNIQUE`; ante una colisión se reintenta con sufijo.
- **Imágenes.** Se comprueban los bytes de cabecera, no el tipo que declara el
  navegador: un `.exe` renombrado a `.jpg` se rechaza. Después se reprocesa con
  `sharp`, lo que descarta archivos corruptos y borra los metadatos.
- **Nombres de archivo aleatorios.** `crypto.randomUUID()`, así que no hay
  colisiones ni recorrido de rutas.
- **Sin huérfanos.** Si la escritura en base de datos falla después de subir la
  imagen, la imagen se borra. Si se borra un artículo, se borra su imagen.
- **Categorías con artículos.** `ON DELETE RESTRICT` impide borrarlas; el panel
  traduce el error a «tiene N artículos, muévelos primero».
- **Sin fallos mudos.** Toda acción devuelve `{ ok }` o `{ error }`, y el
  formulario está obligado a mostrarlo.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint` | ESLint |
| `npm run db:types` | Regenera `lib/database.types.ts` desde el esquema |
| `npm run db:seed` | Siembra el catálogo inicial |

Los scripts de `scripts/` son de uso puntual: extrajeron las fotos del portafolio
en PDF, las recortaron sobre transparencia y generaron el componente del logo de
Sealbyte. No hacen falta para el día a día del sitio.

## Despliegue en Vercel

Dos variables de entorno, en **Settings → Environment Variables**, marcadas para
Production, Preview y Development:

| Variable | De dónde sale |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY` | la misma pantalla, clave `anon` |

Se leen también al compilar —el catálogo se prerenderiza—, así que **añadirlas
no basta: hay que volver a desplegar**.

Ninguna lleva el prefijo `NEXT_PUBLIC_`, y no es un descuido. Ese prefijo sirve
para incrustar el valor en el paquete que descarga el navegador, y aquí nada del
navegador habla con Supabase: el catálogo lo leen componentes de servidor, la
sesión la refresca el middleware y las escrituras pasan por Server Actions. Con
el prefijo, la URL y la clave viajaban a cada visitante sin que allí las usara
nadie —y Vercel, con razón, se niega a guardar como privado un valor marcado
como público—.

`SUPABASE_SERVICE_ROLE_KEY` **no va en Vercel**. Salta las políticas RLS por
completo, y la aplicación no la usa en ningún punto: solo la piden
`scripts/seed.mjs` y `scripts/verify-backend.mjs`, que corren desde una máquina
de desarrollo. Ponerla en el servidor sería dejar una llave maestra en un sitio
donde nada la necesita.

Si faltan, el sitio público se sirve igual con el catálogo vacío y el panel manda
a la pantalla de acceso, que lo explica. Antes reventaba con un
`MIDDLEWARE_INVOCATION_FAILED` en todas las rutas: el middleware corre en cada
petición, así que una variable ausente tumbaba también las páginas que no
necesitan sesión para nada.
