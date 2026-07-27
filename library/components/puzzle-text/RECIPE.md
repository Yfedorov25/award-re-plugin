---
id: puzzle-text
name: "Word scatter ↔ assemble, paired with render"
level: 1
kind: component
status: official
entry:
  call: "PuzzleText.mount(opts)  // opts all optional — defaults drive the tx5 DOM ids; or pass { paragraph, renderSrc, renderSide, ... } / author the tx5 DOM and call with no args"
  module: iife
  returns: "{ timeline, words, destroy }  (or { static:true, words, destroy } in the reduced-motion / narrow branch)"
meaning:
  what: "A SAISEI-style paired beat. A big contained QUADRO render slab (~45vw) sits on one side; the confident statement lives in the facing CREAM AIR COLUMN. The statement's WORDS (always opaque) start GRAY and displaced on BOTH axes (wide diagonal, some rotated/skewed/larger), CONTAINED to the column so the gray debris never crosses onto the render slab. On a pinned, scrubbed (reversible) ScrollTrigger they CONVERGE to their natural flow positions on ONE air ease, darkening gray->ink as each word seats (zero layout shift). The render slab counter-drifts to rest exactly as the last word seats; a hairline rule + ordinal draw on."
  when: "A single statement that should read as composed in front of you, paired with one big quiet render — the photo breathes while the thought assembles itself beside it."
  lands: "The render is the steady companion; the words drift home into a sentence = the thought assembling itself, the pair choreographed together."
  not_when: "Body copy, lists, conversion CTAs, or any text that must be instantly legible. Also not when there is no paired render to compose against — use the converge-faithful variant for pure text."
source:
  grammar: "Vide Infra / Zera portfolio6 — word-level scatter↔assemble, paired Saisei composition"
  recording: "apps/quadro/public/slide-lab/tx5-paired-with-render.html"
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
variants: [paired-with-render, word-blocks-depth, converge-faithful]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "split is WORD-level only (never letters — D12 letters-ban)"
  - "words always opaque (zero layout shift) — opacity untouched; assembly is transform + color only"
  - "gray->ink as each word seats; farther-from-home = lighter gray + larger"
  - "smooth eased converge no jerk/pop — one air ease 0.25,0.74,0.22,0.99 everywhere"
  - "scrub-reversible (re-scatters on scroll back)"
  - "GPU transform/opacity/color only (no WebGL, no video.currentTime, no mix-blend/backdrop over the scrub)"
  - "paired with a big contained render (~45vw) on one side; scatter CONTAINED to the column (debris never crosses onto the slab)"
  - "display is Fraunces serif (statement); body/eyebrow is Inter"
  - "reduced-motion/narrow collapse to a static readable paragraph (render stacks above), no scatter, no pin"
verify: "lab.html#__LAB_OK__"
---

# puzzle-text — word scatter ↔ assemble, paired with render

> **BASE = tx5-paired-with-render** (owner-approved, 9/10). A SAISEI-style
> **paired** beat: a big contained QUADRO render slab (~45vw) on one side, the
> confident **statement** in the facing **cream air column**. The statement's
> **words are always opaque** and start scattered **gray** on **both axes** (wide
> diagonal, some rotated/skewed/larger), **contained to the column** so the gray
> debris never crosses onto the render slab. On a pinned, scrubbed (reversible)
> ScrollTrigger they **converge** to the paragraph the browser already laid out
> (zero reflow), darkening **gray → ink** as each word seats. The render slab
> **counter-drifts** to rest exactly as the last word seats; a hairline rule +
> ordinal draw on. Word-level (never per-character). Scroll back and the words
> re-scatter.
> Source recording: `apps/quadro/public/slide-lab/tx5-paired-with-render.html`.

## STRICT 1:1 — what tx5 shows, and nothing else
The base is **one statement converging from a contained gray scatter into ink,
paired with one big quiet render.** There is **no card stack, no portrait
take-over, no full-screen finale, no "next section" reveal.** Those are not part
of this technique and must not be added.

## The move (what the eye sees)
1. **Paired & scattered** — the render slab is fully painted on one side; the
   statement's words sit displaced from their flow boxes on **both axes** (wide
   diagonal), some **rotated**, some **skewed/italic-drifted**, sized larger. They
   are **always opaque** (`opacity:1`) — only **gray** and offset. **Farther-from-home
   = lighter gray + larger + more rotate/skew.** The horizontal spread is **biased
   inward** (toward the column interior) so debris never crosses onto the slab.
2. **Converge** — every word slides home on **one** air ease in reading order; color
   darkens **gray → ink** as it seats. **Zero layout shift.** The render slab
   **counter-drifts** (a tiny GPU translate+scale, ~14px) to rest as the last word
   seats — the photo "breathes" while the statement assembles.
3. **Settled** — clean ink paragraph beside the steady render; the hairline rule +
   ordinal draw on.
4. **Reverse** — scrubbing back up re-scatters the words. The section is **pinned**
   for the assemble duration; that is the whole timeline.

## Hard rules
- **Display = Fraunces serif**, big; **body/eyebrow = Inter.**
- **Words never go invisible.** `opacity` stays `1`; assembly is **transform + color
  only** (gray → ink). There is **no `opacityFrom`** → **zero layout shift.**
- **Farther-from-home = lighter + larger + more rotate/skew** (a function of each
  word's normalized euclidean distance from home).
- **Scatter is wide diagonal on BOTH axes, CONTAINED to the column** (the `xBias`
  push keeps the gray debris off the render slab; mirror it for `renderSide:'right'`).
- **ONE air ease everywhere:** `cubic-bezier(0.25,0.74,0.22,0.99)` (registered as a
  CustomEase `air`; falls back to `power4.out`).
- Ukrainian Fedoriv copy (no em-dash, no people figures).
- **No WebGL.** transform / color only. No `video.currentTime`, no mix-blend /
  backdrop-filter over the scrubbed surface. `prefers-reduced-motion` OR narrow =
  static readable paragraph (render stacks above), no scatter, no pin.

## The key idea that makes it look expensive
**Never animate layout.** The paragraph is laid out normally; we only ever apply
`transform`/`color` relative to each word's resting box, so wrapping/kerning/line
breaks are pixel-perfect at the end → zero reflow. The scatter is a **seeded PRNG**
(mulberry32), stable across reloads and tweakable via `seed`. One air ease +
reading-order stagger = the words read as **one gesture**, not confetti. Pairing
the render as a **steady companion that counter-drifts to rest as the words seat**
makes the two halves feel **choreographed together** — the text is the star, the
render the quiet anchor.

## Easing & timing
- Ease `CustomEase 'air' = 0.25,0.74,0.22,0.99`; fallback `power4.out`.
- Per-word duration ~0.85s; stagger ~0.04s in reading order.
- **One pinned, scrubbed timeline** (`end:'+=190%'`, `scrub:0.6`, `pin:true`) holds
  the whole move; the stagger is a **position param**, so the assemble maps onto
  scroll distance and reverses 1:1.

## DOM structure (tx5)
```
.stage (pinned)            grid-template-columns: 45vw 1fr
  ├ .slab #slab            the contained render slab (~45vw), counter-drifts
  │  ├ .slab__img #slabImg the painted render (JS sets the url)
  │  └ .slab__cap          "візуалізація"
  └ .col                   the cream air column
     ├ .col__eyebrow #eyebrow   draws in as the words finish
     ├ .statement #statement    → JS word-splits into <span class="w"> + <span class="sp">
     ├ .col__rule #rule         hairline rule, draws on
     └ .col__ord  #ord          ordinal, fades in
```
Words become `<span class="w">` + `<span class="sp">` so gaps never collapse
mid-translate. No-JS / SSR shows the finished readable paragraph beside the render.

## Entry point (the truth on disk)
- `PuzzleText.mount(opts)` — pins the stage and scrubs the reversible
  scatter↔assemble move of the whole paired scene; returns `{ timeline, words,
  destroy }` (or `{ static:true, words, destroy }` in the reduced-motion / narrow
  branch). `opts` are **all optional**: with no args it drives the existing tx5 DOM
  ids (`#stage #statement #slab #slabImg #eyebrow #rule #ord`); pass
  `{ paragraph, renderSrc, renderSide, ghostNear, ghostFar, inkColor, maxX, maxY,
  rotate, skew, scaleFar, xBias, xSpread, duration, stagger, seed, scrub, pinPct,
  ease }` to override.

## Gotchas
- **Measure resting boxes AFTER fonts load.** Init in `load` / after preloader and
  call `ScrollTrigger.refresh()`, or words snap to wrong slots on font swap.
- **Word-level only.** Per-character reads as a scramble and kills legibility (D12).
- **Never set opacity on words.** Gray displacement IS the scattered state.
- **Keep the scatter contained** (the `xBias`) so the gray debris stays off the
  render slab — the two halves must read as a legible pair.
- **Do not add a card / portrait / full-screen finale.** Not in the recording.

## Variants
- **paired-with-render (base)** — this file. The tx5 Saisei paired beat: contained
  render slab + cream column, contained gray scatter, render counter-drift.
- **word-blocks-depth** (`variants/word-blocks-depth/`) — from tx3. Whole word-blocks
  fly home from **real Z-depth** (near large + blurred, far small) converging into the
  flat readable paragraph — a 3D-feeling cinematic text assemble on a dark cinematic
  field, a quiet render behind. Ships as a base-importing `variant.js`.
- **converge-faithful** (`variants/converge-faithful/`) — from tx1. The faithful Zera
  read: gray words scattered wide on **both axes** converge to the readable paragraph
  on one air ease, gray→ink, on a **light** field, **no paired render** — pure text.
  Ships as a base-importing `variant.js`.

## Files
- `lab.html` — self-contained tx5 demo (paired render + contained scatter↔assemble,
  reduced-motion / narrow fallback, `__LAB_OK__` probe).
- `component.css` / `component.js` — drop-in canonical copies.
- `tokens.json` — the knob contract.
