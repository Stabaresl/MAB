"""Recorta el personaje 3D contra el damero de transparencia del original.

El archivo que entrego la empresa es una captura de pantalla en JPG: lleva la
barra oscura de la aplicacion arriba y, en vez de un canal alfa, el damero gris
y blanco dibujado pixel a pixel. Este script devuelve la figura sola sobre
transparencia.

La parte delicada es que el damero comparte color con partes del personaje — el
papel del portapapeles es blanco, y sus casillas grises rondan el mismo tono que
algunos brillos. Por eso no basta con borrar "todo lo que sea claro": se toma
solo la region clara que toca el borde de la imagen, que es fondo por
definicion. Lo que quede encerrado dentro de la silueta se conserva.

Uso puntual:  python scripts/prepare_character.py
"""
from __future__ import annotations

import pathlib
import sys

import numpy as np
from PIL import Image, ImageFilter

ENTRADA = pathlib.Path("image/imagen_character.jpg")
SALIDA = pathlib.Path("public/marca/personaje.webp")

RECORTE_SUPERIOR = 85      # alto de la barra de la aplicacion
RECORTE_INFERIOR = 12      # la barra de abajo, mas fina
TOLERANCIA = 26            # margen sobre los dos tonos del damero
CASILLA = 31               # lado de la casilla del damero, medido en el archivo
ANCHO_FINAL = 900


def region_de_fondo(claro: np.ndarray) -> np.ndarray:
    """Parte de `claro` conectada con el borde, por crecimiento de region.

    Es un relleno por inundacion escrito con dilataciones de numpy: cada vuelta
    extiende la marca un pixel en las cuatro direcciones y la recorta contra los
    pixeles claros. Converge cuando deja de crecer, asi que no hace falta una
    pila de semillas ni recursion.
    """
    marca = np.zeros_like(claro)
    marca[0, :] = claro[0, :]
    marca[-1, :] = claro[-1, :]
    marca[:, 0] = claro[:, 0]
    marca[:, -1] = claro[:, -1]

    while True:
        crecida = marca.copy()
        crecida[1:, :] |= marca[:-1, :]
        crecida[:-1, :] |= marca[1:, :]
        crecida[:, 1:] |= marca[:, :-1]
        crecida[:, :-1] |= marca[:, 1:]
        crecida &= claro
        if crecida.sum() == marca.sum():
            return marca
        marca = crecida


def _bolsas_de_damero(arr: np.ndarray, damero: np.ndarray) -> np.ndarray:
    """Zonas donde los dos tonos del damero conviven a distancia de casilla."""
    exacto = [np.abs(arr - tono).max(axis=2) <= 10 for tono in damero]
    if len(exacto) < 2:
        return np.zeros(arr.shape[:2], dtype=bool)

    def hay_cerca(mascara: np.ndarray) -> np.ndarray:
        imagen = Image.fromarray(np.where(mascara, 255, 0).astype(np.uint8), mode="L")
        # Un maximo local del tamano de una casilla y media: alcanza a la
        # casilla vecina sin cruzar media figura.
        radio = CASILLA + CASILLA // 2
        ampliada = imagen.filter(ImageFilter.MaxFilter(radio if radio % 2 else radio + 1))
        return np.asarray(ampliada) > 127

    return (exacto[0] | exacto[1]) & hay_cerca(exacto[0]) & hay_cerca(exacto[1])


def main() -> int:
    if not ENTRADA.exists():
        print(f"Falta {ENTRADA}", file=sys.stderr)
        return 1

    original = Image.open(ENTRADA).convert("RGB")
    original = original.crop(
        (0, RECORTE_SUPERIOR, original.width, original.height - RECORTE_INFERIOR)
    )
    arr = np.asarray(original).astype(int)

    # Los dos tonos del damero, leidos del propio archivo en una franja de fondo.
    franja = arr[100:200, 0:40].reshape(-1, 3)
    tonos, cuentas = np.unique(franja, axis=0, return_counts=True)
    damero = tonos[np.argsort(-cuentas)[:2]]

    gris = np.abs(arr - arr.mean(axis=2, keepdims=True)).max(axis=2) < 12
    cerca = np.zeros(arr.shape[:2], dtype=bool)
    for tono in damero:
        cerca |= np.abs(arr - tono).max(axis=2) <= TOLERANCIA
    fondo = region_de_fondo(cerca & gris)

    # Quedan bolsas de damero encerradas por la silueta —entre el brazo y el
    # torso, por ejemplo— a las que el crecimiento desde el borde no llega.
    # Se cazan por el patron, no por el color: el damero es el unico sitio donde
    # conviven sus dos tonos a la distancia de una casilla. El papel del
    # portapapeles es blanco uniforme, asi que no cumple y se conserva.
    fondo |= _bolsas_de_damero(arr, damero)

    alfa = np.where(fondo, 0, 255).astype(np.uint8)
    mascara = Image.fromarray(alfa, mode="L")
    # El borde del JPG mezcla figura y damero; un pixel de contraccion se lleva
    # esa orla y un desenfoque corto devuelve un canto limpio.
    mascara = mascara.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))

    figura = original.convert("RGBA")
    figura.putalpha(mascara)
    figura = figura.crop(figura.getbbox())

    alto = round(figura.height * ANCHO_FINAL / figura.width)
    figura = figura.resize((ANCHO_FINAL, alto), Image.LANCZOS)

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    figura.save(SALIDA, quality=88, method=6)

    opaco = (np.asarray(figura)[:, :, 3] > 8).mean()
    print(f"salida        : {SALIDA} {figura.width}x{figura.height}")
    print(f"peso          : {SALIDA.stat().st_size / 1024:.0f} KB")
    print(f"figura visible: {opaco * 100:.0f}% del lienzo")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
