"""Genera hojas de contacto de assets/raw para revisar y mapear a categorias."""
import pathlib
import sys

from PIL import Image, ImageDraw

RAW = pathlib.Path("assets/raw")
OUT = pathlib.Path("assets/sheets")
CELL, COLS, PAD, LABEL = 260, 5, 12, 26


def cells():
    for page_dir in sorted(RAW.iterdir()):
        for f in sorted(page_dir.glob("*.png")):
            yield f


def main() -> int:
    files = list(cells())
    if not files:
        print("assets/raw vacio", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)

    per_sheet = COLS * 4
    for sheet_no, start in enumerate(range(0, len(files), per_sheet), start=1):
        chunk = files[start:start + per_sheet]
        rows = (len(chunk) + COLS - 1) // COLS
        w = COLS * (CELL + PAD) + PAD
        h = rows * (CELL + LABEL + PAD) + PAD
        sheet = Image.new("RGB", (w, h), "#f2f2f2")
        draw = ImageDraw.Draw(sheet)

        for i, f in enumerate(chunk):
            col, row = i % COLS, i // COLS
            x = PAD + col * (CELL + PAD)
            y = PAD + row * (CELL + LABEL + PAD)
            im = Image.open(f).convert("RGB")
            im.thumbnail((CELL, CELL), Image.LANCZOS)
            box = Image.new("RGB", (CELL, CELL), "white")
            box.paste(im, ((CELL - im.width) // 2, (CELL - im.height) // 2))
            sheet.paste(box, (x, y))
            tag = f"{f.parent.name.replace('pag-', 'p')}/{f.name.split('_')[0]}  #{start + i + 1}"
            draw.text((x + 3, y + CELL + 6), tag, fill="#111")

        dest = OUT / f"hoja-{sheet_no}.png"
        sheet.save(dest)
        print(f"{dest}  ({len(chunk)} imagenes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
