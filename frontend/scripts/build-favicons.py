"""Generate NARO's square O mark. Run with Python + Pillow.

Geometry follows the square O in the existing NARO wordmark.
Colors come from the shared design tokens.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[2]
colors = json.loads((root / "design-system/tokens.json").read_text())["color"]
canvas = colors["canvas"]["$value"]
brand = colors["brand"]["$value"]
output = root / "frontend/public"
output.mkdir(exist_ok=True)

(output / "favicon.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n'
    f'  <rect width="64" height="64" rx="12" fill="{canvas}"/>\n'
    f'  <path fill="{brand}" fill-rule="evenodd" d="M12 12h40v40H12zM22 22v20h20V22z"/>\n'
    '</svg>\n', encoding="utf-8"
)

def icon(size):
    image = Image.new("RGB", (size, size), canvas)
    draw = ImageDraw.Draw(image)
    def square(start, end, fill):
        lo, hi = round(size * start / 64), round(size * end / 64)
        draw.rectangle((lo, lo, hi - 1, hi - 1), fill=fill)
    square(12, 52, brand)
    square(22, 42, canvas)
    return image

icon(48).save(output / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
              append_images=[icon(16), icon(32)], bitmap_format="bmp")
icon(180).save(output / "apple-touch-icon.png")
print("Generated SVG favicon, ICO (16/32/48), Apple touch icon (180).")
