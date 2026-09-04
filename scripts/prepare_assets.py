"""Normaliza las fotos de producto listadas en data/manifest.json.

Las fotos del portafolio vienen recortadas sobre fondo plano — unas sobre negro
puro y otras sobre blanco. Este script recorta ese fondo a transparencia,
encuadra la pieza y exporta WebP en dos tamanos.

Uso puntual (Fase 0):  python scripts/prepare_assets.py
"""
from __future__ import annotations

import json
import pathlib
import sys

import numpy as np
from PIL import Image, ImageDraw

MANIFEST = pathlib.Path("data/manifest.json")
OUT = pathlib.Path("public/catalogo")
BRAND_OUT = pathlib.Path("public/marca")

FULL_SIZE = 1200          # imagen de detalle
THUMB_SIZE = 480          # tarjeta de listado
PAD = 0.07                # margen alrededor de la pieza
MAGIC = (255, 0, 255)     # centinela del relleno por inundacion
FLOOD_TOLERANCE = 26      # aguanta el ruido de compresion del fondo
BORDER_UNIFORMITY = 18    # desviacion maxima admitida en el anillo de borde
HOLE_TOLERANCE = 16       # mas estricto: los huecos se buscan por color
MAX_HOLE = 0.25           # por encima de esto ya no es hueco, es la pieza
MIN_SUBJECT = 0.02        # si queda menos, el recorte se comio el producto


def border_ring(arr: np.ndarray, width: int = 3) -> np.ndarray:
    """Pixeles del marco exterior, como (n, 3)."""
    top, bottom = arr[:width], arr[-width:]
    left, right = arr[:, :width], arr[:, -width:]
    return np.concatenate([p.reshape(-1, 3) for p in (top, bottom, left, right)])


def flat_background(ring: np.ndarray) -> bool:
    """El borde es fondo plano si es uniforme y claramente claro u oscuro."""
    lum = ring @ np.array([0.299, 0.587, 0.114])
    return bool(lum.std() < BORDER_UNIFORMITY and (lum.mean() < 60 or lum.mean() > 200))


def cut_background(img: Image.Image) -> Image.Image:
    """Vuelve transparente el fondo plano. Devuelve RGBA.

    Dos pasadas. La primera inunda desde los bordes, que es lo correcto para el
    fondo abierto. La segunda recoge las bolsas que el borde no alcanza — el
    marco de un soporte, el aro de un toallero — buscandolas por color; si esas
    bolsas suman mas del 12% del lienzo no son fondo sino una pieza oscura sobre
    fondo oscuro, y se dejan intactas.
    """
    rgb = img.convert("RGB")
    arr = np.asarray(rgb)
    ring = border_ring(arr)
    if not flat_background(ring):
        return img.convert("RGBA")

    background = ring.mean(axis=0)
    w, h = rgb.size
    work = rgb.copy()
    for seed in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
                 (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)):
        if work.getpixel(seed) != MAGIC:
            ImageDraw.floodfill(work, seed, MAGIC, thresh=FLOOD_TOLERANCE)

    filled = (np.asarray(work) == np.array(MAGIC)).all(axis=2)
    holes = (np.abs(arr - background).max(axis=2) <= HOLE_TOLERANCE) & ~filled
    if holes.mean() <= MAX_HOLE:
        filled |= holes

    if (~filled).mean() < MIN_SUBJECT:      # el recorte se llevo el producto
        return img.convert("RGBA")

    out = img.convert("RGBA")
    alpha = np.asarray(out)[:, :, 3].copy()
    alpha[filled] = 0
    out.putalpha(Image.fromarray(alpha, mode="L"))
    return out


def frame(img: Image.Image, size: int) -> Image.Image:
    """Recorta al contenido, deja margen y centra en un lienzo cuadrado."""
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    inner = int(size * (1 - 2 * PAD))
    img = img.copy()
    img.thumbnail((inner, inner), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(img, ((size - img.width) // 2, (size - img.height) // 2), img)
    return canvas


def prepare_brand(manifest: dict) -> None:
    """Prepara el logotipo de la empresa a partir de image/logo.png.

    El fondo blanco se recorta a transparencia y se exportan tres piezas: el
    lockup completo, una version pequena y el simbolo suelto para el favicon.
    Antes se usaba el monograma naranja incrustado en el portafolio; se
    descarto porque la marca vigente es esta.
    """
    BRAND_OUT.mkdir(parents=True, exist_ok=True)
    fuente = Image.open(manifest["brand"]["logo"]).convert("RGBA")
    arr = np.asarray(fuente).astype(int)
    blanco = arr[:, :, :3].min(axis=2) > 238
    alpha = np.where(blanco, 0, 255).astype(np.uint8)
    fuente.putalpha(Image.fromarray(alpha, mode="L"))

    bbox = fuente.getbbox()
    if bbox:
        fuente = fuente.crop(bbox)

    for ancho, nombre in ((1200, "mab-logo-color"), (400, "mab-logo-color-sm")):
        pieza = fuente.copy()
        pieza.thumbnail((ancho, ancho), Image.LANCZOS)
        pieza.save(BRAND_OUT / f"{nombre}.webp", quality=92, method=6)
        print(f"  {nombre}.webp  {pieza.width}x{pieza.height}")

    # El simbolo sin la palabra MAB: la parte superior del trazado.
    simbolo = fuente.crop((0, 0, fuente.width, int(fuente.height * 0.62)))
    simbolo = simbolo.crop(simbolo.getbbox())
    simbolo.thumbnail((600, 600), Image.LANCZOS)
    simbolo.save(BRAND_OUT / "mab-simbolo.webp", quality=92, method=6)
    print(f"  mab-simbolo.webp  {simbolo.width}x{simbolo.height}")


AMBIENTES_OUT = pathlib.Path("public/ambientes")


def prepare_ambientes(manifest: dict) -> None:
    """Separa los paneles del collage de ambientes que entrego la empresa.

    Son tomas de producto ya instalado — bano terminado, ducha en obra, griferia
    montada — y sirven de fondo para las secciones. Vienen pegados en una sola
    imagen de 1024x1024 sin separadores, asi que las coordenadas de cada panel
    van declaradas en el manifiesto.
    """
    ambientes = manifest.get("ambientes")
    if not ambientes:
        return

    AMBIENTES_OUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(ambientes["source"]).convert("RGB")

    for name, box in ambientes["panels"].items():
        panel = source.crop(tuple(box))
        # Se duplica el tamano para que no se vea blanda a ancho completo; el
        # original es pequeno y no hay una version mayor.
        panel = panel.resize((panel.width * 2, panel.height * 2), Image.LANCZOS)
        panel.save(AMBIENTES_OUT / f"{name}.webp", quality=82, method=6)
        print(f"  ambientes/{name}.webp  {panel.width}x{panel.height}")


def main() -> int:
    if not MANIFEST.exists():
        print(f"Falta {MANIFEST}", file=sys.stderr)
        return 1

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    if "--solo-marca" in sys.argv:
        prepare_brand(manifest)
        prepare_ambientes(manifest)
        return 0

    done = failed = 0

    for category in manifest["categories"]:
        folder = OUT / category["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        for product in category["products"]:
            try:
                original = Image.open(product["src"])
                original.load()
                cut = cut_background(original)
                frame(cut, FULL_SIZE).save(folder / f"{product['slug']}.webp",
                                           quality=88, method=6)
                frame(cut, THUMB_SIZE).save(folder / f"{product['slug']}-thumb.webp",
                                            quality=82, method=6)
                done += 1
            except Exception as exc:
                print(f"  ERROR {product['slug']}: {exc}", file=sys.stderr)
                failed += 1

    prepare_brand(manifest)
    prepare_ambientes(manifest)

    # Fotografias de contexto: conservan su fondo, solo se reescalan.
    for name in ("obra", "texture"):
        photo = Image.open(manifest["brand"][name]).convert("RGB")
        photo.thumbnail((2400, 2400), Image.LANCZOS)
        photo.save(BRAND_OUT / f"{name}.webp", quality=84, method=6)

    print(f"productos procesados : {done}")
    print(f"fallidos             : {failed}")
    print(f"destino              : {OUT}/ y {BRAND_OUT}/")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
