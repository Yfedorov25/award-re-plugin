---
id: puzzle-text
name: "Word scatter ↔ assemble"
level: 1
kind: component
status: official
entry:
  call: "PuzzleText.mount({ stage, paragraph, assembleOpts?, pinVH? }) | PuzzleText.buildAssembly(el, tl, position, opts)"
  module: iife
  returns: "controller"
meaning:
  what: "Gray, displaced WORDS (always opaque) of one paragraph scattered across the viewport on BOTH axes (wide diagonal, some rotated/skewed, sized differently). On scroll they converge to the final readable paragraph on one expo-out ease, darkening gray→ink as each word seats (zero layout shift at rest). Scroll-scrubbed and reversible — scrolling back re-scatters."
  when: "A single statement line that should read as composed in front of you, settling into place as you scroll."
  lands: "Words drift home into a sentence = the thought assembling itself."
  not_when: "Body copy, lists, conversion CTAs, or any text that must be instantly legible."
source:
  grammar: "Vide Infra / editorial cover titles — word-level scatter↔assemble"
  recording: "rec5-puzzle-text"
  registry_ref: ["T-118"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase"
webgl: false
motion_props: [transform, color]
trigger: "scroll-scrub (pinned, reversible)"
timing_layer: [B-entrance, C-pinned]
owns_pin: true
page_beat: [proof, statement]
combines_with: [parallax-depth, reveal]
anti_combos: [letter-level-split]
gated_by: [R_anti_combos, R_perf_limits, R_timing_layers]
variants: [default]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "split is WORD-level only (never letters — D12 letters-ban)"
  - "words NEVER go invisible — opacity stays 1; assembly is color-only gray→ink"
  - "farther-from-home word = lighter gray + larger"
  - "scatter is wide diagonal on BOTH axes + slight rotate/skew"
  - "font is SANS grotesque (NOT serif)"
  - "scatter ↔ assemble ONLY — no card, no image, no finale, no next section"
  - "scrub mode re-scatters the words on reverse-scroll"
  - "reduced-motion gives the settled paragraph, no scatter, no pin"
verify: "lab.html#__LAB_OK__"
---

# puzzle-text — word scatter ↔ assemble

> Gray, **displaced words that are always opaque** sit scattered across the
> viewport (wide diagonal, both axes, some rotated/skewed, sized differently),
> then converge into the paragraph the browser already laid out (zero reflow),
> darkening **gray → ink** as each word seats. Word-level (never per-character).
> Scroll-scrubbed and reversible: scroll back and the words re-scatter.
> Source recording: `rec5-puzzle-text` (frames f_001..f_027).

## STRICT 1:1 — what the recording shows, and nothing else
The recording is **one paragraph of words doing scatter ↔ assemble**. There is
**no portrait card, no bottom-up card, no full-screen image finale, no "next
section" reveal.** A previous build invented those phases and failed
verification. They are **not part of this technique** and must not be added.

## The move (what the eye sees)
1. **Scattered** (f_001) — words sit displaced from their flow boxes on **both
   axes** (wide diagonal spread), some **rotated**, some **skewed/italic-drifted**,
   sized differently. They are **always opaque** (`opacity:1`, never 0) — only
   **gray** and offset. **Farther-from-home = lighter gray + larger.**
2. **Converge** (f_005 → f_013 → f_021) — every word slides home on **one** hard
   expo-out ease; color darkens **gray → ink** as it seats. **Zero layout shift.**
3. **Settled** (f_027) — clean ink paragraph, perfectly wrapped.
4. **Reverse** — scrubbing back up re-scatters the words. The section is **pinned**
   for the assemble duration; that is the whole timeline.

## Hard rules
- **Font is SANS grotesque** (Helvetica Neue / system-ui), **NOT serif.**
- **Words never go invisible.** `opacity` stays `1`; assembly is **color-only**
  (gray → ink) plus transform (x/y/scale/rotate/skew). There is **no `opacityFrom`.**
- **Farther-from-home = lighter + larger.** Tint and scale are a function of the
  word's normalized euclidean distance from home.
- **Scatter is wide diagonal on BOTH axes** + slight `rotate`/`skewX`.
- **Ease = hard expo-out `0.16,1,0.3,1`.** One ease everywhere (falls back to
  `power4.out`).
- Ukrainian Fedoriv copy (no em-dash, no people figures).
- **No WebGL.** transform / color only. `prefers-reduced-motion` = settled
  paragraph, no scatter, no pin.

## The key idea that makes it look expensive
**Never animate layout.** The paragraph is laid out normally; we only ever apply
`transform`/`color` relative to each word's resting box, so wrapping/kerning/line
breaks are pixel-perfect at the end → zero reflow. The scatter is a **seeded
PRNG** (mulberry32), stable across reloads and tweakable via `seed`. One ease +
reading-order stagger = the words read as **one gesture**, not confetti.

## Easing & timing
- Ease `CustomEase 'puzzleAir' = 0.16,1,0.3,1`; fallback `power4.out`.
- Per-word duration ~0.9s; stagger ~0.045s in DOM/reading order.
- **One pinned, scrubbed timeline** holds the whole move; the stagger is a
  **position param**, so the assemble maps onto scroll distance and reverses 1:1.
  `scrub:0.6`, pin length ~1.8vh.

## DOM structure
```
#stage (pinned)
  └ #stageInner
     └ <p class="puzzle-text" data-puzzle-text> …copy… </p>   → JS word-splits
```
Words become `<span class="pt-word">` + `<span class="pt-space">` so gaps never
collapse mid-translate. No-JS / SSR shows the finished readable paragraph.

## Core CSS / GSAP
```css
.pt-word{ display:inline-block; white-space:pre; }   /* opacity NEVER touched */
```
```js
// scatter (set) -> assemble: color-only gray→ink, opacity stays 1
// farther = lighter + larger; both axes + slight rotate/skew
words.forEach((w,i)=>{ gsap.set(w, fromVars[i]);     // {x,y,scale,rotation,skewX,color}
  tl.to(w,{x:0,y:0,scale:1,rotation:0,skewX:0,color:ink,ease}, i*stagger); });
```

## Entry points
- `PuzzleText.mount({ stage, paragraph, assembleOpts?, pinVH? })` — pins the stage
  and scrubs the reversible scatter↔assemble move; returns `{ timeline, destroy }`.
- `PuzzleText.buildAssembly(el, tl, position, opts)` — append just the gray→ink
  assembly onto your own pinned/scrubbed timeline.

## Gotchas
- **Measure resting boxes AFTER fonts load.** Init in `load` / after preloader and
  call `ScrollTrigger.refresh()`, or words snap to wrong slots on font swap.
- **Word-level only.** Per-character reads as a scramble and kills legibility (D12).
- **Never set opacity on words.** Gray displacement IS the scattered state.
- **Do not add a card / image / full-screen finale.** Not in the recording.
- Use `text-wrap:balance` (not `text-align:justify`) for nice breaks.

## Reusable params (init opts)
`maxX`, `maxY`, `rotate`, `skew`, `scaleNear`, `scaleFar`, `ghostNear`,
`ghostFar`, `inkColor`, `duration`, `stagger`, `ease`, `seed` (assembly) ·
`pinVH`, `assembleOpts` (mount).

## Usage
```html
<link rel="stylesheet" href="component.css">
<script src="gsap.min.js"></script><script src="ScrollTrigger.min.js"></script>
<script src="CustomEase.min.js"></script>
<script src="component.js"></script>

<section id="stage">
  <p class="puzzle-text">Ми будуємо не стіни. Ми будуємо ранок…</p>
</section>
<script>
  PuzzleText.mount({
    stage: document.querySelector('#stage'),
    paragraph: document.querySelector('.puzzle-text')
  });
</script>
```

## Files
- `lab.html` — self-contained 1:1 demo (scatter↔assemble only, reduced-motion
  fallback). Mirror of `NAHIRNA-METHOD/labs/puzzle-text.html`.
- `component.css` / `component.js` — drop-in canonical copies.
