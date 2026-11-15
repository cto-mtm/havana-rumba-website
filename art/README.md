# Art pipeline

Colour engravings in the style of the restaurant's printed drink menu
(`refs/drink-menu.webp`), generated on Vertex AI (`gemini-3-pro-image`) and
shipped as transparent WebP in `www/public/images/brand/art/`.

```bash
python art/generate.py sheet-dishes        # one asset (or a 2x2 sheet) → art/raw/
python art/finish.py                       # art/picks.json → site WebPs + www/app/utils/art.ts
```

- **Auth:** Application Default Credentials (`gcloud auth application-default login`); billed to `mtmcya-marketing` (`VERTEX_PROJECT` overrides).
- **Style:** every prompt sends the menu photo plus `refs/style-anchor.png` (the approved mojito), and a per-asset palette taken from the menu: palm green, hibiscus red, sepia Capitolio, charcoal '57 car.
- **Sheets:** small subjects are cheaper as one 4K 2×2 sheet (`"cells"` in `prompts.json`), which gets split into `raw/<id>-s<n>.png`. This uses a quarter of the calls and avoids the 429 rate limits.
- **Finish:** keys out the white background connected to the edges, so it works on both parchment and the charcoal panels. `"holes": true` also clears enclosed white gaps; use it only for leaves and scenes, never for glasses or plates. The parchment tile is procedural, because the model refuses plain textures.
- **Use:** `<MenuArt name="mojito" />` (decorative; pass `label` if the art carries meaning). `utils/art.ts` is generated, so don't edit it by hand.
- `raw/` is gitignored. Rejected picks so far: dishes sheet 1 (it drew divider lines), martini-2 (ghosted text), palm-b-1 (pasted the menu photo).
- **Not generated yet:** location storefronts (A7). They wait until each storefront photo is confirmed to belong to its location.
