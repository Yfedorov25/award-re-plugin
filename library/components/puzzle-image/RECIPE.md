# puzzle-image — scroll-assembled photo

> One source image is sliced into an **R×C grid of CSS-sprite tiles**; on scroll
> each tile flies in from a scattered/offset position (blurred, small-scale,
> low-opacity, randomized) and seats into its **exact** final cell, so the picture
> self-assembles like a puzzle into one seamless full-bleed photo.
> Observed on Vide Infra / Saisei / Zera-class cover reveals.

Sibling of `puzzle-text` (which assembles WORDS). This assembles a PHOTO.

## What it is (one sentence)
A single decoded image is painted as N divs via **CSS sprite math** (zero extra
image requests); each tile animates **from** a seeded scatter offset **to**
`transform:none`, staggered by distance-from-center, so the photo locks together
brick-by-brick into a seamless full-bleed cover.

## The crux — CSS sprite slicing (one image, N painted slices)
Each tile sits at its STATIC home cell and paints only its own fragment:
```css
.puzzle__tile{
  background-image: var(--img);
  background-size: calc(var(--cols)*100%) calc(var(--rows)*100%);
  background-position:
    calc(var(--c) / max(var(--colsm1),1) * 100%)
    calc(var(--r) / max(var(--rowsm1),1) * 100%);
}
```
**Off-by-one:** position uses `c/(cols-1)`, NOT `c/cols`. `/cols` crops the last
row/col. Guard `cols=1` with `max(...,1)`. NO `<img>` per tile, NO canvas, NO WebGL.

## Phases (scrub progress 0→1)
0. **Setup** — pieces scattered, blurred, faint, small (~N chips on black).
1. **Drift** (0→25%) — tiles fade up, blur eases, begin translating home.
2. **Converge** (25→70%) — bulk of motion; staggered arrival; picture legible w/ gaps.
3. **Seat/snap** (70→90%) — last tiles close gaps; brief **seam-flash** (the "assembled" tell).
4. **Whole** (90→100%) — indistinguishable from one image; clean hold; release.

## Why it looks expensive
**Never animate layout.** Home cells (`left/top/width/height`) are STATIC; tiles
only `translate` from a scatter offset back to 0. Per-tile **stagger from center**
is what reads as *assembly* rather than a plain fade+zoom — you recognize the
picture BEFORE it's finished. The seam-flash is free: it falls out of per-tile
blur tails closing at slightly different progress.

## Easing & timing
- Ease: house `air = cubic-bezier(0.25,0.74,0.22,0.99)` (or `expo.out`
  `0.16,1,0.30,1`). Fast close of distance, long settle = "click into place".
- **Scrub mode (default):** ONE timeline whose `0→1` IS scroll progress. Each tile
  tween is added at `position = startP` with `duration = tileWindow`, so the EASE
  lives in the mapped sub-window, not a wall-clock duration. `scrub:true`,
  `pin:true`, `end:'+=120%'`. Per-tile window ≈0.45–0.6; stagger spread ≈0→0.45 by
  distance so first tiles start at p=0, last finish near p=0.9; final 0.1 = hold.
- **In-view mode:** paused timeline played `onEnter`; total ~1.8s, per-tile ~1.0s,
  `stagger:{from:'center', each:~0.5s/(N-1)}`.

## DOM structure
```html
<section class="puzzle">                 <!-- pinned (scrub) or just a section (inview) -->
  <div class="puzzle__stage">            <!-- final image frame: aspect-locked, overflow:hidden -->
    <div class="puzzle__grid"></div>     <!-- exact final W×H; tiles injected here -->
  </div>
  <span class="puzzle__eyebrow">…</span> <!-- chrome = SIBLINGS of the stage, not grid children -->
  <div class="puzzle__cap">…</div>
</section>
```

## Reusable params (CONFIG)
| param | default | notes |
|---|---|---|
| `src`, `alt` | — | image url; one decode, N slices |
| `rows`, `cols` | 4×4 | density (desktop) |
| `rowsMobile`, `colsMobile` | 3×3 | dropped density on small screens |
| `trigger` | `'scrub'` | `'scrub'` (scroll-locked) \| `'inview'` (one-shot) |
| `scatter` | 1.8 | offset in **tile-widths** (1–2.5 = puzzle; >3 = explosion) |
| `scatterPattern` | `'random'` | `'random'` \| `'edges-in'` \| `'ring'` \| `'rows'` |
| `staggerFrom` | `'center'` | `'center'` \| `'edges'` \| `'random'` \| `'rows'` |
| `staggerAmount` | 0.45 | spread of per-tile starts across 0→1 (scrub) |
| `tileWindow` | 0.55 | per-tile sub-window width |
| `scaleFrom` | 0.65 | keep ≥0.5 so picture is recognizable mid-assembly |
| `opacityFrom` | 0.0 | 0.0–0.25 |
| `blurFrom` | 18 | px; **cap ≤20** (blur is the FPS killer) |
| `ease` | `'air'` | `'air'` \| `'expo'` |
| `scrollDistance` | `'+=120%'` | pin length (≈1.0–1.3× viewport) |
| `pin` | true | scrub mode |
| `duration`, `totalStagger` | 1.0, 0.5 | inview mode (s) |
| `seed` | 7 | deterministic scatter (reproducible per build) |
| `seamFix` | 0.5 | px outset → seated state has no sub-pixel hairlines |
| `respectReducedMotion` | true | reduced-motion → instant seated, no blur |

## Gotchas (encoded in component.js)
- **BLUR is the expensive part.** Cap N (8–24, not 60), start blur ≤20px, set
  `filter:'none'` + drop `will-change` on seated tiles (done `onComplete`).
- **Seam gaps** → permanent black hairlines. `seamFix` scales each seated tile to
  `1 + 2*seamFix_px/tileSizePx` (~1.003) so edges overdraw. Verify the SEATED state
  is seamless — that's the whole point.
- **Sprite off-by-one** — `c/(cols-1)`, guard `cols=1`.
- **Scatter too wild** = "explosion" not "puzzle". Bound ~1–2.5 tile-widths;
  `scaleFrom ≥0.5`.
- **No stagger** = plain fade+zoom. `staggerFrom:'center'` sells the assembly.
- **Decode before build** — `await img.decode()` or tiles flash empty.
- **transform/opacity/filter only** — never `left/top/width` (homes are static).
- Mobile/reduced-motion → seated instantly + lower N.

## Known gaps vs the reference (verify score 82/100, matches1to1: **false**)
This component nails the **mechanic** (sprite slicing, per-tile staggered seat,
seam-flash) but the lab as-shipped is NOT a pixel match of the source cover.
Flag these when you adapt it for a real build:

1. **No full-bleed climax.** The reference cover grows from a framed box to
   **edge-to-edge full-bleed** on continued scroll (Phase 4 parallax/pin-out).
   The lab's stage is a fixed `78vmin` centered box that completes assembly and
   **just holds** — the signature "cover takes over the screen, then releases"
   beat is missing. To restore it: after assembly completes (progress ~0.9), add a
   second scrub segment that animates `--pz-stage-max → 100vw` and
   `--pz-stage-aspect → viewport ratio` (or scale the stage to full-bleed), then
   release the pin. Keep it on `transform`/size of the stage container, not the tiles.
2. **Centered card, not a full-width cover.** Because of #1 the `78vmin` box reads
   as a smaller centered card vs the reference's near-full-width portrait cover.
   Raise `--pz-stage-max` / change `--pz-stage-aspect` for portrait covers.
3. **Placeholder image, not the real cover.** Ships a self-contained SVG villa +
   "NAHIRNA" text so the lab runs standalone. Swap `CONFIG.src` for the real render
   to get the true "recognize the picture before it's done" read. The wordmark and
   caption should be **baked INTO the photo** (so they assemble WITH the tiles) —
   in the reference the ZERA wordmark + "GOLDEN HOUR / TIMELESS BEAUTY" are part of
   the image, not DOM overlays.
4. **Caption is a DOM overlay, not assembled.** The lab's `.puzzle__cap`
   ("Плитка за плиткою") is a static pinned sibling — it does not assemble with the
   tiles. For 1:1, bake the caption into `CONFIG.src`.
5. **Coarser grid.** Lab default is 4×4 (16 tiles); the reference reads ~6×4
   (~24 tiles) — denser, finer assembly. Within spec range; bump `rows`/`cols` for
   a closer match (watch the blur/FPS budget — see Gotchas).

`works: true` — the technique runs and reads correctly; treat the above as the
to-do list when promoting it from lab to a production section.

## Files
- `lab.html` — runnable standalone demo, **byte-identical to the verified lab**
  (self-contained SVG placeholder image so it runs by just opening; swap
  `CONFIG.src` for a real render).
- `component.css` — the slicing + stage skeleton.
- `component.js` — `PuzzleImage(root, config)` factory (scrub + inview). The
  `'edges-in'`/`'ring'` scatter-pattern off-by-one (referencing `cols/rows` instead
  of the responsive `COLS/ROWS`) noted during verify is **already fixed here** —
  the factory uses the responsive `COLS/ROWS` everywhere.

## Drop-in
```html
<link rel="stylesheet" href="component.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js"></script>
<script src="component.js"></script>
<script>
  PuzzleImage(document.querySelector('.puzzle'), {
    src: '/renders/cover.webp', rows:4, cols:4,
    trigger:'scrub', scatter:1.8, staggerFrom:'center'
  });
</script>
```
