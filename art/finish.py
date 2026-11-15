"""Turn picked raw generations into site assets.

Usage (from the repo root):  python art/finish.py
Reads art/picks.json  {"<out-name>": {"src": "art/raw/x-1.png", "kind": "art"|"tile", "max": 1200, "holes": true}}
Writes www/public/images/brand/art/<out-name>.webp

art  → the white background connected to the image edges becomes transparent
       (interior whites such as ice and glass stay opaque; "holes": true also clears
       enclosed white pockets, for leaves and scenes, never for glasses or plates), edge
       pixels get soft alpha and are un-premultiplied so there is no white halo
       on dark panels; cropped and saved as WebP with alpha.
tile  → 4-way mirror into a seamless 1024px WebP tile.
paper → procedural seamless parchment grain (no src).
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
OUT = REPO / 'www' / 'public' / 'images' / 'brand' / 'art'


def art(src: Path, name: str, max_side: int = 1200, holes: bool = False) -> Path:
    rgb = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    minc = rgb.min(axis=2)
    whiteish = minc > 232
    labels, _ = ndimage.label(whiteish)
    edge_ids = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    bg = np.isin(labels, edge_ids[edge_ids > 0])
    # enclosed pockets of background (between leaves/petals): near-pure white and not tiny
    pockets, n = ndimage.label((minc > 244) & ~bg) if holes else (None, 0)
    if n:
        sizes = ndimage.sum(np.ones_like(minc), pockets, index=np.arange(1, n + 1))
        bg |= np.isin(pockets, np.flatnonzero(sizes > 250) + 1)
    # soft alpha in a 3px band around the background, from how far each pixel is from white
    band = ndimage.binary_dilation(bg, iterations=3) & ~bg
    alpha = np.where(bg, 0.0, 1.0)
    alpha[band] = np.clip((255 - minc[band]) / 60.0, 0, 1)
    a = np.clip(alpha, 1e-3, 1)[..., None]
    rgb = np.clip((rgb - 255 * (1 - a)) / a, 0, 255)
    rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    bbox = Image.fromarray((alpha > 0.1).astype(np.uint8) * 255).getbbox()
    im = im.crop((max(bbox[0] - 4, 0), max(bbox[1] - 4, 0),
                  min(bbox[2] + 4, im.width), min(bbox[3] + 4, im.height)))
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    out = OUT / f'{name}.webp'
    im.save(out, 'WEBP', quality=84, method=6)
    return out


def tile(src: Path, name: str, max_side: int = 1024) -> Path:
    im = Image.open(src).convert('RGB')
    s = min(im.size)
    im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width + s) // 2, (im.height + s) // 2))
    h = max_side // 2
    q = im.resize((h, h), Image.LANCZOS)
    t = Image.new('RGB', (max_side, max_side))
    t.paste(q, (0, 0))
    t.paste(ImageOps.mirror(q), (h, 0))
    t.paste(ImageOps.flip(q), (0, h))
    t.paste(ImageOps.flip(ImageOps.mirror(q)), (h, h))
    out = OUT / f'{name}.webp'
    t.save(out, 'WEBP', quality=72, method=6)
    return out


def paper(src: Path, name: str, max_side: int = 512) -> Path:
    """Procedural parchment (the model refuses plain textures): periodic grain + faint
    horizontal fibres, wrapped filters so it tiles seamlessly. Base = parchment-200."""
    rng = np.random.default_rng(1954)
    s = max_side
    grain = ndimage.gaussian_filter(rng.standard_normal((s, s)), 0.8, mode='wrap')
    mottle = ndimage.gaussian_filter(rng.standard_normal((s, s)), 24, mode='wrap')
    fibres = ndimage.gaussian_filter(rng.standard_normal((s, s)), (0.6, 9), mode='wrap')
    norm = lambda x: x / (np.abs(x).max() + 1e-9)
    v = 2.4 * norm(grain) + 2.2 * norm(mottle) + 2.0 * norm(fibres)
    base = np.array([0xF2, 0xE8, 0xD3], dtype=np.float32)
    rgb = np.clip(base + v[..., None] * np.array([1.0, 0.95, 0.85]), 0, 255).astype(np.uint8)
    out = OUT / f'{name}.webp'
    Image.fromarray(rgb, 'RGB').save(out, 'WEBP', quality=80, method=6)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    picks = json.loads((ROOT / 'picks.json').read_text())
    for name, p in picks.items():
        fn = {'art': art, 'tile': tile, 'paper': paper}[p['kind']]
        opts = {'max_side': p['max']} if 'max' in p else {}
        if p.get('holes'):
            opts['holes'] = True
        out = fn(REPO / p.get('src', ''), name, **opts)
        w, h = Image.open(out).size
        print(f'{out.relative_to(REPO)}  {w}x{h}  {out.stat().st_size // 1024} KB')
    write_registry()


def write_registry() -> None:
    """www/app/utils/art.ts — generated, lists every finished art file with its size."""
    rows = []
    for f in sorted(OUT.glob('*.webp')):
        if f.stem == 'parchment':  # CSS background, not an illustration
            continue
        w, h = Image.open(f).size
        key = f.stem if '-' not in f.stem else f"'{f.stem}'"
        rows.append(f"  {key}: {{ src: '/images/brand/art/{f.name}', w: {w}, h: {h} }}")
    ts = ('// GENERATED by art/finish.py — do not edit by hand.\n'
          '// Colour engravings in the drink menu\'s style (decorative; see MenuArt.vue).\n\n'
          'export const ART = {\n' + ',\n'.join(rows) + '\n} as const\n\n'
          'export type ArtId = keyof typeof ART\n')
    (REPO / 'www' / 'app' / 'utils' / 'art.ts').write_text(ts, encoding='utf8')


if __name__ == '__main__':
    main()
