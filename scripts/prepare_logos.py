"""Normaliza los logotipos de los clientes para el muro de referencias.

Los archivos vienen de los sitios de cada empresa, asi que llegan con tamanos y
proporciones que no tienen nada que ver entre si: uno cuadrado de 104px, otro
apaisado de 1018. Aqui solo se hacen dos cosas — recortar el aire sobrante y
llevarlos a un alto comun — y se conserva el color de cada marca.

Se probo repintarlos todos en la tinta del sitio, que es el tratamiento habitual
de un muro de clientes, y se descarto: el color es parte de la marca y quien
reconoce a un cliente lo reconoce por el.

El recorte al contenido importa mas de lo que parece. Con un lienzo comun, un
logotipo apaisado llegaba con la mitad del alto en aire y en pantalla se veia
diminuto al lado de uno cuadrado; recortado, el tamano lo deciden el alto y el
ancho maximos del CSS, que es donde se puede ajustar viendolo.

Uso puntual:  python scripts/prepare_logos.py
"""
from __future__ import annotations

import pathlib
import sys

from PIL import Image

ENTRADA = pathlib.Path("assets/logos")
SALIDA = pathlib.Path("public/clientes")

ALTO = 200                # alto de exportacion; el ancho sale de la proporcion
ANCHO_MAXIMO = 800        # tope para los logotipos muy apaisados


def main() -> int:
    archivos = sorted(ENTRADA.glob("*.png"))
    if not archivos:
        print(f"No hay logotipos en {ENTRADA}", file=sys.stderr)
        return 1

    SALIDA.mkdir(parents=True, exist_ok=True)
    for archivo in archivos:
        imagen = Image.open(archivo).convert("RGBA")
        caja = imagen.getbbox()
        if caja:
            imagen = imagen.crop(caja)
        imagen.thumbnail((ANCHO_MAXIMO, ALTO), Image.LANCZOS)

        salida = SALIDA / f"{archivo.stem}.webp"
        imagen.save(salida, quality=92, method=6)
        print(f"  {salida.name:22} {imagen.width}x{imagen.height}  {salida.stat().st_size / 1024:.0f} KB")

    print(f"{len(archivos)} logotipos en {SALIDA}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
