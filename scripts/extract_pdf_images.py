"""Extrae las fotos de producto embebidas en PORTAFOLIO MAB 2026.pdf.

Uso puntual (Fase 0). Agrupa por pagina — cada pagina del PDF corresponde a una
categoria del catalogo. Descarta logos y decoraciones repetidas por hash.
"""
import hashlib
import io
import pathlib
import sys

import pymupdf
from PIL import Image

PDF = pathlib.Path("PORTAFOLIO MAB 2026.pdf")
OUT = pathlib.Path("assets/raw")
MIN_SIDE = 500      # descarta iconos y viñetas
MIN_PIXELS = 400_000


def main() -> int:
    if not PDF.exists():
        print(f"No se encontro {PDF}", file=sys.stderr)
        return 1

    doc = pymupdf.open(PDF)
    seen: dict[str, str] = {}
    kept = skipped_small = skipped_dupe = 0

    for page_index, page in enumerate(doc, start=1):
        page_dir = OUT / f"pag-{page_index:02d}"
        for slot, info in enumerate(page.get_images(full=True), start=1):
            xref = info[0]
            try:
                raw = doc.extract_image(xref)
            except Exception as exc:                      # imagen corrupta en el PDF
                print(f"  pag {page_index} xref {xref}: no se pudo extraer ({exc})")
                continue

            width, height = raw["width"], raw["height"]
            if min(width, height) < MIN_SIDE or width * height < MIN_PIXELS:
                skipped_small += 1
                continue

            digest = hashlib.sha1(raw["image"]).hexdigest()
            if digest in seen:
                skipped_dupe += 1
                continue

            try:
                img = Image.open(io.BytesIO(raw["image"]))
                img.load()
            except Exception as exc:
                print(f"  pag {page_index} xref {xref}: PIL no pudo abrirla ({exc})")
                continue

            page_dir.mkdir(parents=True, exist_ok=True)
            dest = page_dir / f"{slot:02d}_{width}x{height}.png"
            img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB").save(dest)
            seen[digest] = str(dest)
            kept += 1

    print(f"guardadas   : {kept}")
    print(f"descartadas : {skipped_small} pequeñas, {skipped_dupe} repetidas")
    print(f"destino     : {OUT}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
