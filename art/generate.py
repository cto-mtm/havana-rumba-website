"""Generate Havana Rumba menu-style art on Vertex AI (Gemini image model).

Usage (from the repo root):
    python art/generate.py                 # every asset in prompts.json
    python art/generate.py mojito palm-a   # only these ids
    python art/generate.py --n 3 mojito    # 3 variants each (default 2)

An asset with "cells" (4 small subjects) is drawn as one 2x2 sheet at 4K and split
into art/raw/<cell-id>-s<n>.png, which is 4x cheaper and avoids rate limits.

Auth: Application Default Credentials (`gcloud auth application-default login`).
Billing project: mtmcya-marketing (override with VERTEX_PROJECT).
Raw outputs land in art/raw/<id>-<n>.png with a .json sidecar (prompt, model).
"""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
PROJECT = os.environ.get('VERTEX_PROJECT', 'mtmcya-marketing')
LOCATION = os.environ.get('VERTEX_LOCATION', 'global')
MODEL = os.environ.get('VERTEX_IMAGE_MODEL', 'gemini-3-pro-image')
URL = (f'https://aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}'
       f'/publishers/google/models/{MODEL}:generateContent')


def token() -> str:
    out = subprocess.run('gcloud auth application-default print-access-token',
                         shell=True, capture_output=True, text=True, check=True)
    return out.stdout.strip()


def part_for(path: str) -> dict:
    p = (REPO / path) if not Path(path).is_absolute() else Path(path)
    mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.webp': 'image/webp'}[p.suffix.lower()]
    return {'inlineData': {'mimeType': mime, 'data': base64.b64encode(p.read_bytes()).decode()}}


QUADS = ['top-left', 'top-right', 'bottom-left', 'bottom-right']


def expand_sheet(asset: dict, base_refs: int) -> dict:
    """A sheet entry ({"cells": [4 x {id, subject, palette, refs?}]}) becomes one 2x2 prompt."""
    refs, lines, palettes = [], [], []
    for quad, c in zip(QUADS, asset['cells']):
        line = f"{quad.upper()}: {c['subject']}"
        if c.get('refs'):
            refs.append(c['refs'][0])
            line += (f" (subject reference: attached image #{base_refs + len(refs)}; "
                     "redraw it in the illustration style, do not copy the photo)")
        lines.append(line)
        palettes.append(f"{quad}: {c['palette']}")
    subject = ('a SHEET of four separate, unrelated illustrations laid out in a strict 2x2 grid. '
               'Each one is centered in its own quadrant and is drawn at the same scale, with wide '
               'empty white gutters between quadrants; nothing crosses the middle lines, nothing '
               'touches another drawing or the image edges, no dividing lines are drawn.\n'
               + '\n'.join(lines))
    return {**asset, 'subject': subject, 'palette': '; '.join(palettes), 'refs': refs,
            'aspect': '1:1', 'size': '4K'}


def split_sheet(path: Path, cells: list[dict], i: int) -> None:
    im = Image.open(path)
    w, h = im.size
    for k, c in enumerate(cells):
        x, y = (k % 2) * w // 2, (k // 2) * h // 2
        out = path.parent / f"{c['id']}-s{i}.png"
        im.crop((x, y, x + w // 2, y + h // 2)).save(out)
        print(f'    -> {out.relative_to(REPO)}')


def generate(asset: dict, style: dict, n: int, tok: str) -> list[Path]:
    if 'cells' in asset:
        base = len(style[asset.get('style', 'engraved')].get('refs', []))
        asset = expand_sheet(asset, base)
    kind = style[asset.get('style', 'engraved')]
    prompt = (kind['template'].replace('[SUBJECT]', asset['subject'])
              .replace('[PALETTE]', asset.get('palette', '')))
    refs = list(kind.get('refs', [])) + list(asset.get('refs', []))
    parts = [part_for(r) for r in refs] + [{'text': prompt}]
    body = {
        'contents': [{'role': 'user', 'parts': parts}],
        'generationConfig': {
            'responseModalities': ['IMAGE'],
            'imageConfig': {'aspectRatio': asset.get('aspect', '1:1'), 'imageSize': asset.get('size', '2K')},
        },
    }
    saved = []
    for i in range(1, n + 1):
        out = ROOT / 'raw' / f"{asset['id']}-{i}.png"
        for attempt in range(4):
            req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={
                'Authorization': f'Bearer {tok}', 'Content-Type': 'application/json',
                'x-goog-user-project': PROJECT})
            try:
                with urllib.request.urlopen(req, timeout=300) as r:
                    data = json.load(r)
                break
            except urllib.error.HTTPError as e:
                msg = e.read().decode()[:300]
                if e.code in (429, 500, 503) and attempt < 3:
                    time.sleep(30 * (attempt + 1))
                    continue
                print(f"  ! {asset['id']}-{i}: HTTP {e.code} {msg}")
                data = None
                break
        if not data:
            continue
        img = next((p['inlineData']['data'] for c in data.get('candidates', [])
                    for p in c.get('content', {}).get('parts', []) if 'inlineData' in p), None)
        if not img:
            print(f"  ! {asset['id']}-{i}: no image ({json.dumps(data)[:300]})")
            continue
        out.write_bytes(base64.b64decode(img))
        out.with_suffix('.json').write_text(json.dumps(
            {'model': MODEL, 'prompt': prompt, 'refs': refs}, indent=2))
        saved.append(out)
        print(f'  + {out.relative_to(REPO)}')
        if 'cells' in asset:
            split_sheet(out, asset['cells'], i)
    return saved


def main() -> None:
    args = sys.argv[1:]
    n = 2
    if '--n' in args:
        i = args.index('--n')
        n = int(args[i + 1])
        del args[i:i + 2]
    spec = json.loads((ROOT / 'prompts.json').read_text(encoding='utf8'))
    assets = [a for a in spec['assets'] if not args or a['id'] in args]
    (ROOT / 'raw').mkdir(exist_ok=True)
    tok = token()
    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(lambda a: generate(a, spec['styles'], n, tok), assets))


if __name__ == '__main__':
    main()
