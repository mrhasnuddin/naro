"""Build editable, self-contained SVG share cards from NARO's existing assets.

Export each SVG at its intrinsic size to PNG after fonts load in a browser.
"""
import base64
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
assets = root / "design-system/assets"
colors = json.loads((root / "design-system/tokens.json").read_text())["color"]
c = {key: value["$value"] for key, value in colors.items()}
logo = base64.b64encode((assets / "naro-logo.png").read_bytes()).decode()
font = base64.b64encode((assets / "noto-sans-sc-latin.woff2").read_bytes()).decode()
output = root / "frontend/public/social"
output.mkdir(parents=True, exist_ok=True)

def card(square):
    height = 1200 if square else 630
    logo_width = 280 if square else 240
    title_y, title_size = (332, 86) if square else (284, 66)
    second_y = title_y + (108 if square else 84)
    description_y = second_y + (64 if square else 62)
    x, y, size = (520, 570, 470) if square else (798, 158, 280)
    inset = size / 4
    footer = height - 72
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{height}" viewBox="0 0 1200 {height}">
  <title>NARO | BNB Testnet</title>
  <desc>Your NARO, in one place. Wallet, rewards and community. BNB Testnet.</desc>
  <defs><style>@font-face{{font-family:Naro;src:url(data:font/woff2;base64,{font}) format('woff2');font-weight:100 900}}text{{font-family:Naro,sans-serif}}</style></defs>
  <rect width="1200" height="{height}" fill="{c['canvas']}"/>
  <path d="M0 0H1200" stroke="{c['brand']}" stroke-width="8"/>
  <image x="80" y="72" width="{logo_width}" height="{logo_width*120/472}" href="data:image/png;base64,{logo}"/>
  <text x="80" y="{224 if square else 194}" font-size="18" letter-spacing="3" font-weight="600" fill="{c['brand']}">BNB TESTNET</text>
  <text x="80" y="{title_y}" font-size="{title_size}" font-weight="600" letter-spacing="-3" fill="{c['strong']}">Your NARO,</text>
  <text x="80" y="{second_y}" font-size="{title_size}" font-weight="600" letter-spacing="-3" fill="{c['strong']}">in one place.</text>
  <text x="80" y="{description_y}" font-size="{28 if square else 24}" fill="{c['secondary']}">Your wallet, rewards and community.</text>
  <rect x="{x-28}" y="{y-28}" width="{size+56}" height="{size+56}" fill="none" stroke="{c['border-subtle']}"/>
  <path d="M{x} {y}h{size}v{size}h-{size}zM{x+inset} {y+inset}v{size/2}h{size/2}v-{size/2}z" fill="{c['brand']}" fill-rule="evenodd"/>
  <path d="M80 {footer-34}H1120" stroke="{c['border-control']}"/>
  <text x="80" y="{footer}" font-size="18" fill="{c['secondary']}">BNB Smart Chain</text>
  <text x="1120" y="{footer}" text-anchor="end" font-size="18" fill="{c['brand']}">NARO</text>
</svg>'''
    name = "naro-square" if square else "naro-landscape"
    (output / f"{name}.svg").write_text(svg, encoding="utf-8")
    print(f"Generated {name}.svg: 1200 × {height}")

card(False)
card(True)
