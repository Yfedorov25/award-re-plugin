---
id: puzzle-image
name: "Scroll-assembled WIDE cover -> modest scale-up"
level: 1
kind: component
status: official
entry:
  call: "PuzzleImage(root, userConfig)"
  module: iife
  returns: "controller | null"
meaning:
  what: "BASE = pz1 center-out. Slices ONE WIDE LANDSCAPE (16:9) render into a 5×8 grid of CSS-sprite tiles that fly home from a blurred dark-field scatter on scroll CENTER-OUT (outer tiles fly from further via a radial reach bias, centre seats first), de-blurring under a photo+scrim that fades in to erase seams (zero two-photo overlap); THEN the WHOLE cover (photo + baked top wordmark + lower-left captions, one DOM unit) is scaled up MODESTLY (~1.34x) via transform:scale to full-bleed, cropping top/bottom via overflow. The LEFT headline stays VISIBLE throughout."
  when: "An opening cover (hero) with one strong WIDE render that should RESOLVE INTO BEING on the first scroll, then take over the whole screen before releasing."
  lands: "You recognize the place before it finishes assembling = ownership; the centre forms first and the field fills in around it; then the whole wide cover grows modestly as one unit (wordmark grows wider WITH the subject) and the building takes over the screen."
  not_when: "Sections with no single hero render, conversion gates, or any beat that must read instantly without motion."
source:
  grammar: "Vide Infra / Saisei / Zera-class cover reveal (Zera /work: scatter -> assembled WIDE cover near full width -> modest scale-up full-bleed landscape)"
  recording: "apps/quadro/public/slide-lab/pz1-center-out-faithful.html"
  registry_ref: ["T-101", "T-201"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase"
webgl: false
motion_props: [transform, opacity, filter]
trigger: "one pinned scroll-scrub timeline"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
page_beat: [hero]
combines_with: [puzzle-text, parallax-depth, splitLines, scroll-indicator]
anti_combos: [second-pin, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: [center-out, depth-fly-in]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "scattered blurred tiles fly home CENTER-OUT (outer tiles from further), de-blur, opacity up, seating into one assembled WIDE LANDSCAPE cover already near full viewport WIDTH"
  - "tiles are sprite slices of ONE wide render (zero two-photo overlap) — every tile a fragment of the SAME single src, and the photo layer underneath is that SAME image"
  - "the WHOLE cover unit (.coverWrap) scales up MODESTLY (~1.34x, modest grow <=1.5x — NOT over-zoom, NOT 6x) via transform:scale to full-bleed; wordmark + captions scale WITH it keeping relative composition"
  - "the cover is LANDSCAPE 16:9 (NOT a portrait box) and crops top/bottom via .stage overflow:hidden as it grows — NOT a clip-path reframe, NOT a narrow column"
  - "the LEFT serif headline stays VISIBLE throughout (z above the cover, NEVER faded to opacity 0)"
  - "smooth eased assemble (ONE air ease, one tween) — no jerk, no pop; reverse scroll is the same tween run backward"
  - "GPU transform/opacity/filter ONLY; no WebGL; no mix-blend/backdrop over the scrubbed surface"
  - "pin release is natural scroll-out; reduced-motion AND narrow collapse to a static assembled cover with no pin/flight/scale"
verify: "lab.html"
---

# puzzle-image — scroll-assembled WIDE cover -> modest scale-up

> **BASE = pz1 "center-out faithful"** (owner-approved, 9/10), re-extracted 1:1
> from `apps/quadro/public/slide-lab/pz1-center-out-faithful.html` — the closest
> honest clone of the Zera `/work` cover beat. One **WIDE LANDSCAPE (16:9)** cover
> that **fills the viewport width** is sliced into a **5×8 grid (40) of CSS-sprite
> tiles**, scattered + blurred + dim across a clean **DARK field** with a serif
> headline LEFT. On scroll the tiles **fly home CENTER-OUT** — the centre seats
> first, the **outer tiles fly from further** (a radial reach bias) and land last,
> de-blurring as a photo + scrim fade in **UNDER** them to erase any seams (it is
> literally **one image** — the tiles are slices of that SAME render). A ghost
> serif wordmark across the top + lower-left captions emerge with the seat. At
> assembly the cover is **already near full viewport width**. THEN the **whole
> cover scales up MODESTLY** (`transform:scale` ~1.34x on the single cover unit)
> to full-bleed — staying a **wide landscape cover**, cropping top/bottom via
> overflow — then the pin releases and the cover scrolls away as the next section
> rises. **The LEFT headline stays VISIBLE the whole time.**

Sibling of `puzzle-text` (which assembles WORDS). This assembles a PHOTO.

## Variants
- **center-out** (base, this folder) — the flat CENTER-OUT assemble: tiles fly
  home in-plane from a radial blurred scatter, centre-first, on a clean dark field.
- **depth-fly-in** (`variants/depth-fly-in/`) — a depth/3D-feeling assemble: the
  same single wide cover, but the tiles WAIT scattered in real **Z-depth** (near
  tiles large + soft + dim, far tiles small) then **converge home from depth** into
  the flat cover plane. Same modest grow (~1.35x). Source: `pz3-depth-fly-in.html`.

## What the frames ACTUALLY show (and ONLY this)
The assembled cover is **LANDSCAPE ~16:10 WIDE**, filling the full viewport width.
The wordmark ("ZERA" in the source) is a huge serif stretched across the ENTIRE
TOP of the wide cover. The subject sits center-right. Small captions sit lower-LEFT.
The big serif HEADLINE to the left of the section **STAYS VISIBLE throughout** (it
does NOT fade out).

## The three phases (and nothing else)
1. **ASSEMBLE** (prog `0 -> .55`) — scattered, blurred, near-invisible tiles fly
   home `staggerFrom:'center'`, blur eases to 0, opacity to 1, scale to 1. The
   seamless cover photo (+ a gentle top scrim) fades in UNDER them at seat; the
   baked top wordmark + lower-left captions emerge. **The LEFT headline + RIGHT
   body stay visible** (they are NOT receded). At assembly the cover is already
   near full viewport width (f_012).
2. **GROW** (prog `.55 -> 1.0`) — a single `transform:scale` tween on the whole
   cover unit (`.coverWrap`) grows it **MODESTLY** to `growPeak` (~1.35x) until
   full-bleed. Wordmark + captions are CHILDREN of the cover, so they scale
   TOGETHER and keep their relative composition. The cover stays **landscape** and
   the `.stage` `overflow:hidden` crops top/bottom as it grows past the viewport.
3. **RELEASE** (pin end) — natural unpin; the now-large cover scrolls up off the
   top and the next section rises. NOT a tween.

There is **no extra finale, no card, no full-screen reveal, no portrait box, no
clip-path reframe, no over-scale (no 6x)**.

## The crux #1 — CSS sprite slicing (one image, N painted slices)
Each tile sits at its STATIC home cell of the **cover** and paints only its own
fragment (zero extra image requests, no canvas, no WebGL):
```css
.tile{
  background-image: url(<cover>);
  background-size: calc(cols*100%) calc(rows*100%);
  background-position: calc(c/(cols-1)*100%) calc(r/(rows-1)*100%);
}
```
**Off-by-one:** position uses `c/(cols-1)`, NOT `c/cols`. `/cols` crops the last
row/col. Guard `cols=1`. The tiles only `translate`/`scale`/`blur` from a scatter
offset back to their static home — never `left/top/width`.

## The crux #2 — LANDSCAPE frame + UNIFORM transform:scale (NOT clip-path)
The cover is **one DOM unit** (`.coverWrap` > `.cover`) sized **width-driven near
full viewport width** with a **16:10 landscape aspect-ratio**. With
`object-fit:cover` the wide render is cropped wide (which is what we WANT — it
matches the source wide cover). The grow is a single `transform:scale` tween on
`.coverWrap`, so **everything inside scales together** keeping its relative
composition — "the whole cover grows as one, the wordmark widens WITH the subject"
(f_016 -> f_020). The `.stage` `overflow:hidden` crops top/bottom as the unit
exceeds the viewport.

> Two earlier builds were WRONG: (a) one forced a **portrait 3/4 box** — the
> source is **landscape**; (b) one **over-scaled to 6.4x** — the source grow is
> **modest** (already near full width at assembly, then a small push to full-bleed).
> (c) Do NOT fade the headline. (d) Do NOT composite into a narrow column.

## Baked typography (scales WITH the cover)
The wordmark (e.g. "НАГІРНА", sized to span ~90% of the WIDE cover width like
"ZERA") sits across the **entire top**; the lower-left captions are **children of
`.cover`**, sized in container/percent units against the cover height. Because they
are inside the scaled unit they grow uniformly with the photo and stay framed in
their relative positions. Keep them as DOM overlays (as the lab does) so they scale
WITH the cover, or bake them into the `src` image — either way they must scale WITH
the cover, not independently.

## The headline stays visible
The LEFT serif headline is `z-index:8` (ABOVE the cover at `z-index:4`) and is
**never** tweened to opacity 0. As the wide cover grows it slides behind/around the
headline but the headline keeps reading — exactly the source (f_016 still shows
"remem…" on the left).

## Why it looks expensive
- **Never animate layout.** Home cells are STATIC; tiles only `translate`/`scale`/
  `blur` back to 0.
- **Stagger from center** reads as *assembly* not a fade — you recognize the place
  before it finishes.
- **One GPU transform** drives the climax (a MODEST `scale` on a single element),
  so the grow is cheap and smooth — no over-scale blowing out the image.

## Easing & timing
- Ease: house `air` (`cubic-bezier(0.16,1,0.3,1)`, expo-out), the ONE project ease,
  drives BOTH the per-tile settle AND the grow.
- ONE timeline whose `0->1` IS scroll. Assembly fills `0 -> assembleEnd` (.55);
  the modest grow fills `assembleEnd -> 1`. `scrub`, `pin:true`, `end:'+=300%'`.

## DOM structure
```html
<section class="puzzle">              <!-- pinned; full viewport; overflow:hidden -->
  <div class="stage">                 <!-- crops the growing cover -->
    <h1 class="headline">…</h1>        <!-- LEFT serif headline (STAYS VISIBLE) -->
    <p  class="body">…</p>             <!-- RIGHT mono body -->
    <div class="coverWrap">           <!-- THE unit that scales (16:10, near full width) -->
      <div class="cover">
        <div class="cover__ground"></div>   <!-- fallback ground, never blank -->
        <div class="grid"></div>            <!-- sprite tiles injected here -->
        <img class="cover__photo" alt="">   <!-- seamless WIDE assembled photo -->
        <div class="cover__scrim"></div>    <!-- gentle top scrim for the wordmark -->
        <div class="cover__wordmark"></div> <!-- huge top wordmark, scales with cover -->
        <div class="cover__caption"></div>  <!-- lower-left captions, scale with cover -->
      </div>
    </div>
  </div>
</section>
```

## Reusable params (CONFIG)
| param | default | notes |
|---|---|---|
| `src` | — | image url OR array of path candidates (first that decodes wins); shown in a 16:9 frame, object-fit:cover |
| `rows`, `cols` | 5×8 | density (desktop) = 40 tiles, the pz1 read |
| `rowsMobile`, `colsMobile` | 4×4 | dropped density on small screens |
| `wordmark` | `''` | ghost baked top wordmark across the cover top |
| `captionLines` | `[]` | lower-left caption lines |
| `issueLine` | `''` | small issue line under the captions |
| `coverWidthVw` | 78 | assembled (rest) cover WIDTH — wide, near full viewport |
| `coverAspect` | 16/9 (1.778) | **LANDSCAPE** cover proportion (w/h); day-front is 16:9 |
| `scatter` | 0.42 | tile scatter as a fraction of the cover (radial; **outer tiles fly from further**) |
| `blurMax` | 16 | px; **cap ≤20** (blur is the FPS killer) |
| `restTileAlpha` | 0.14 | near-invisible rest chips |
| `restScale` | 0.84 | tile rest scale before seat |
| `assembleEnd` | 0.56 | timeline progress where the cover is assembled |
| `growPeak` | 1.34 | **MODEST** uniform scale at peak (full-bleed wide, capped ≤1.5). **Do NOT over-scale (no 6x).** |
| `scrub` | 0.7 | ScrollTrigger scrub |
| `pinLengthVh` | 300 | pin scroll distance |
| `ease` | `'air'` | the ONE project ease cubic-bezier(0.25,0.74,0.22,0.99) (falls back to power3.out) |

## Gotchas (encoded in component.js)
- **The cover is LANDSCAPE 16:10, width-driven near full viewport width.** NOT a
  portrait 3/4 box, NOT a narrow column. `object-fit:cover` gives the wanted wide crop.
- **The grow is MODEST (~1.34x, ≤1.5).** The cover is already near full width at
  assembly; the grow is a small push to full-bleed. **No 6x over-scale.**
- **The LEFT headline stays VISIBLE** — z-index ABOVE the cover, NEVER faded.
- **The grow is UNIFORM transform:scale, NOT clip-path.** Scale the whole unit.
- **The cover must be ONE unit.** Put wordmark + captions INSIDE `.cover` so they
  scale with it; do not tween them separately during the grow.
- **`.stage` needs `overflow:hidden`** so the wide cover crops top/bottom as it grows.
- **No mix-blend / backdrop-filter over the scrubbed surface (D2).**
- **BLUR is the expensive part.** Cap N (8–24), start blur ≤20px.
- **Sprite off-by-one** — `c/(cols-1)`, guard `cols=1`.
- **Center-out via radial reach + stagger from center** sells the assembly; a plain
  fade reads cheap. Outer tiles fly from further so the centre seats first.
- **Rest chips near-invisible** (`restTileAlpha` ~0.10–0.16).
- **transform/opacity/filter only** — never `left/top/width` (homes static). No WebGL.
- `ScrollTrigger.refresh()` after image decode / resize.
- **Mobile = NO pin** (C6/C7) and **reduced-motion** → assembled wide cover instantly.

## Source fidelity notes (STRICT 1:1 lab)
The verified lab (`lab.html`) reproduces ONLY what the owner-approved pz1
prototype shows:
- **Assembly** — scattered blurred 5×8 tiles fly home CENTER-OUT (outer from
  further), de-blur, seating into the assembled WIDE cover near full viewport
  width; the photo + scrim fade in UNDER the tiles so seams vanish (one image).
- **Modest scale-up**: the whole WIDE cover grows as one unit ~1.34x to
  full-bleed, top/bottom cropped; the LEFT headline stays visible.
- **Natural release**: the pin ends and the cover scrolls away as the next
  section rises — a plain scroll, NOT a tween.
- **Real render** — production QUADRO `renders/day-front.webp` (16:9, via the
  `renders -> apps/quadro/public/proto` symlink). Ukrainian Fedoriv copy, no
  em-dash, no people.
- **Nothing invented** — no card, no full-screen reveal, no portrait box, no 6x.

## Files
- `lab.html` — runnable standalone demo, byte-faithful to `pz1-center-out-faithful.html`.
- `component.css` — dark field + stage (overflow clip) + LANDSCAPE 16:9 cover unit + sprite grid.
- `component.js` — `PuzzleImage(root, config)` factory (center-out assemble + modest scale-up).
- `variants/depth-fly-in/` — the depth/3D-feeling assemble variant (from pz3).

## Drop-in
```html
<link rel="stylesheet" href="component.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js"></script>
<script src="component.js"></script>
<script>
  PuzzleImage(document.querySelector('.puzzle'), {
    src: 'renders/day-front.webp',
    rows:5, cols:8,
    wordmark:'QUADRO',
    captionLines:['Золота година.','Власне світло на власному березі.'],
    issueLine:'Серія · Дім над рікою',
    growPeak:1.34, coverAspect:16/9
  });
</script>
```
