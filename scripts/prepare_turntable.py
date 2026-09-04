"""Prepara la secuencia de giro 360 del visor de producto.

Entrada: assets/turntable/turntable-png/, 36 PNG de 1800x1800 con transparencia
(10.5 MB en total). Sin tratar son inservibles en una pagina web.

El recorte usa el mismo encuadre para los 36 fotogramas — calculado sobre la
union de todos — porque recortar cada uno por separado haria que la pieza
"saltara" al girar.

Uso puntual:  python scripts/prepare_turntable.py
"""
from __future__ import annotations

import glob
import pathlib
import sys

import numpy as np
from PIL import Image

ENTRADA = pathlib.Path("assets/turntable/turntable-png")
SALIDA = pathlib.Path("public/360")

COLUMNAS = 6        # 6x6 = 36 fotogramas
CELDA = 400         # el visor se muestra a ~400px de ancho
CALIDAD = 76
MARGEN = 0.04


def bbox_comun(archivos: list[str]) -> tuple[int, int, int, int]:
    """Encuadre que contiene la pieza en los 36 fotogramas."""
    x0 = y0 = 10**9
    x1 = y1 = -1
    for archivo in archivos:
        alpha = np.asarray(Image.open(archivo).convert("RGBA"))[:, :, 3]
        filas, columnas = np.where(alpha > 8)
        if len(columnas) == 0:
            continue
        x0, x1 = min(x0, columnas.min()), max(x1, columnas.max())
        y0, y1 = min(y0, filas.min()), max(y1, filas.max())
    return int(x0), int(y0), int(x1) + 1, int(y1) + 1


def main() -> int:
    archivos = sorted(glob.glob(str(ENTRADA / "*.png")))
    if not archivos:
        print(f"No hay fotogramas en {ENTRADA}", file=sys.stderr)
        return 1

    x0, y0, x1, y1 = bbox_comun(archivos)
    ancho, alto = x1 - x0, y1 - y0
    lado_origen = max(ancho, alto)
    # Lienzo cuadrado centrado en la pieza, para que el giro no se descentre.
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    mitad = int(lado_origen * (1 + MARGEN * 2) / 2)
    caja = (cx - mitad, cy - mitad, cx + mitad, cy + mitad)

    SALIDA.mkdir(parents=True, exist_ok=True)

    # Una sola hoja en vez de 36 archivos: una peticion, una decodificacion y
    # cambiar de fotograma es mover background-position, sin cargar nada. En la
    # prueba, 392 KB frente a 1056 KB repartidos en 36 peticiones.
    filas = (len(archivos) + COLUMNAS - 1) // COLUMNAS
    hoja = Image.new("RGBA", (COLUMNAS * CELDA, filas * CELDA), (0, 0, 0, 0))

    for indice, archivo in enumerate(archivos):
        imagen = Image.open(archivo).convert("RGBA")
        recorte = imagen.crop(caja).resize((CELDA, CELDA), Image.LANCZOS)
        hoja.paste(recorte, ((indice % COLUMNAS) * CELDA, (indice // COLUMNAS) * CELDA))

    destino = SALIDA / "grifo-sprite.webp"
    hoja.save(destino, quality=CALIDAD, method=6)

    # Fotograma suelto para la vista previa: se muestra al instante mientras la
    # hoja completa aun no ha llegado.
    poster = Image.open(archivos[0]).convert("RGBA").crop(caja)
    poster = poster.resize((CELDA, CELDA), Image.LANCZOS)
    poster.save(SALIDA / "grifo-poster.webp", quality=82, method=6)

    print(f"encuadre comun : {caja}")
    print(f"hoja           : {hoja.width}x{hoja.height} ({COLUMNAS}x{filas} de {CELDA}px)")
    print(f"peso hoja      : {destino.stat().st_size / 1024:.0f} KB en 1 peticion")
    print(f"peso poster    : {(SALIDA / 'grifo-poster.webp').stat().st_size / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
