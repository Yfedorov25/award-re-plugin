---
id: parallax-collage
name: "Editorial collage with mouse-parallax decor (EVER Architecture engine)"
level: 2
kind: component
status: official
entry:
  call: "ParallaxCollage.init(target, opts)  // target = the .pc-stage el/selector. The collage (tiles, masks, copy, decor) lives in MARKUP; the engine drives the pointer-parallax of [data-deco] elements (+ optional wordmark plane). opts: { decoSelector, maxShiftPx, ease, wordmark, wordmarkDepth }. Each [data-deco] carries data-depth (0..1 amplitude), data-axis (y vs x), data-base-x/y (resting offset)."
  module: iife
  returns: "{ destroy }  (or { static:true, destroy } under reduced-motion)"
meaning:
  what: "The EVER 'Architecture' editorial-collage ENGINE, harvested from the live site. A composition of THREE things: (1) a STATIC editorial GRID of media tiles with DIFFERENT masks (EVER: a round 420x345 tile + a tall 420x730 rectangle, gap 40); (2) a giant WORDMARK sitting BEHIND the tiles as a depth plane, showing through the gutters; (3) floating DECOR objects that MOUSE-PARALLAX — each drifts toward/away from the pointer at its OWN amplitude (depth) via a single rAF lerp loop, so nearer decor moves more than deeper decor and the word least of all. Pointer-parallax, NOT scroll. The specific photos / sphere art / tile rects / copy are COMPOSITION (markup+CSS); the engine drives only the depth-ordered pointer-parallax. Composes with fluid-type-sizing (the behind-word) and section-pager (the section)."
  when: "A rich EDITORIAL chapter section where a few framed media tiles (mixed masks — a round one, a tall one) sit over a giant section word, with a couple of tactile floating objects giving the frame life as the cursor moves. The 'this is a designed magazine spread, not a stock hero' beat — EVER/Springs-grade. Use when a section earns more than one full-bleed image and you want layered depth + a premium idle-life micro-interaction."
  lands: "A composed editorial spread: distinct framed tiles (one circular, one tall) over a giant word that bleeds through the gutters, a counter and a '+' promising more, and — as the cursor drifts — the foreground objects glide a touch more than the deeper ones, giving real parallax depth without scroll. It reads authored and expensive, alive on hover, never a flat photo grid."
  not_when: "A single full-bleed cinematic frame (use section-pager panes / media-step-switch). A plain gallery the eye walks down (stacked-pairs / cards-swipe). Touch-only contexts where there is no pointer to parallax (the engine falls back to a static composed collage — fine, but you gain nothing from this over a plain grid there). When you have no decor / depth layers to move (then it is just a static grid, not this engine)."
source:
  grammar: "Harvested from the LIVE EVER 'Architecture' section (ever-live-here.com), measured @1440x900: 2-tile mixed-mask grid (round + tall rect, gap 40), wordmark-behind at 108px, title group 40px @67%, '+' button, counter, and 2 textured-sphere decor PNGs mouse-parallaxing at different amplitudes (sphere1 ~±4px, sphere2 ~±2px)."
  recording: "ever-live-here.com Architecture section (live measured); spec in apps/quadro/.award-re/teardowns/EVER-MOTION-SPEC-live.md"
  registry_ref: ["T-collage-ever"]
stack: "vanilla JS only (no libs). Single rAF lerp loop for pointer-parallax. Composes with fluid-type-sizing for the behind-word."
webgl: false
motion_props: [transform]
trigger: "pointer (mousemove on the stage) -> a single rAF lerp loop drives each [data-deco] by its data-depth. NOT scroll-driven, NOT a pin. Reduced-motion / no-pointer -> static."
timing_layer: [A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [chapter, material, proof]
combines_with: [fluid-type-sizing, bleeding-wordmark, section-pager, section-curtain-riseover, theme-tween]
anti_combos: [scroll-scrub-pin]
gated_by: [R_perf_limits, R_anti_combos, R_reduced_motion_fallback]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a STATIC editorial tile grid with MIXED masks (at least a round/oval tile + a rectangle), tiles laid out in markup/CSS (the composition), media object-fit:cover"
  - "a giant WORDMARK sits BEHIND the tiles (lower z) and shows through the gutters — the depth plane (pairs with fluid-type-sizing to fill the field)"
  - "floating DECOR ([data-deco]) MOUSE-parallaxes via a single rAF lerp loop; each element drifts by its data-depth amplitude so nearer decor moves MORE than deeper decor (proven: depth 1.0 ~38px vs depth 0.55 ~21px vs wordmark depth 0.10 ~4px across the stage)"
  - "transform-only on the moving decor, each its own GPU layer (will-change:transform; backface-visibility:hidden); NO mix-blend / NO backdrop-filter over moving decor"
  - "lerp damping (ease) makes the drift buttery and frame-rate-safe; returns to rest on mouseleave"
  - "the engine drives ONLY the parallax — tiles, masks, photos, copy, counter, '+' are config (markup); it composes with fluid-type-sizing (word) + section-pager (section)"
  - "prefers-reduced-motion / no pointer -> static composed collage (no parallax); window.__LAB_OK__ set once mounted"
  - "asset-substitution gate: the lab rebuilds the engine on OUR QUADRO renders + Ukrainian word/copy + geometric decor stand-ins, not EVER's photos/spheres"
gate:
  probe: "Open lab.html in a real browser (served from library/components/ so the fluid-type-sizing sibling resolves). __LAB_OK__ true once mounted. Move the pointer across the stage and confirm: the foreground decor drifts MORE than the deeper decor and the wordmark least (depth-ordered), the drift lerps smoothly and returns to rest on leave, the wordmark reads behind the tiles through the gutters. Not a scroll/curtain gate — a pointer-parallax + composition eye-check; a depth-ratio check (deco1 shift > deco2 shift > word shift) is the objective gate."
note: |
  Third harvested engine per the 2026-06-26 council verdict. The key correction the
  live read gave: EVER's Architecture is NOT a full-bleed image (my first copy was) —
  it is an editorial collage whose only MOTION is pointer-parallax of floating decor
  at layered depths, over a static mixed-mask tile grid with the giant word behind.
  The textured spheres and exact photos are art direction (config); the engine is the
  depth-ordered mouse-parallax + the tile-grid/wordmark-behind scaffold. Composes with
  fluid-type-sizing (proven together in the lab) and section-pager.
---

# parallax-collage — editorial collage with mouse-parallax decor (EVER Architecture engine)

EVER's "Architecture" section is not a hero image — it is an editorial spread:
mixed-mask media tiles over a giant section word, with floating decor that
mouse-parallaxes at layered depths. This component is that engine.

## What the live read corrected
The first EVER copy made this a simplified full-bleed render. The live site is a
**static mixed-mask tile grid** (a round tile + a tall rectangle, gap 40) with the
giant wordmark **behind** showing through the gutters, plus 2 textured-sphere decor
objects whose ONLY motion is a **pointer-parallax** at different amplitudes (depth).
No scroll-parallax, no pin — just depth-ordered mouse drift.

## The engine (measured live)
- tiles: round 420x345 + rect 420x730, gap 40, left edge 50 (composition — markup).
- wordmark behind at 108px (use fluid-type-sizing to fill the field).
- decor: `[data-deco]` with `data-depth` (0..1). A single rAF lerp loop drifts each
  toward/away from the pointer by `maxShiftPx * depth`; `data-axis` trims the y
  amplitude; `data-base-x/y` preserves a resting offset. Deeper = less drift.
- proven depth order: depth 1.0 ~38px, depth 0.55 ~21px, wordmark depth 0.10 ~4px.

## Markup + call
```html
<div class="pc-stage" id="collage">
  <div class="pc-word" data-fluid-fit>архітектура</div>          <!-- behind, z1 -->
  <div class="pc-tile pc-tile--round"><img src="…"></div>        <!-- z2 -->
  <div class="pc-tile pc-tile--rect"><img src="…"></div>
  <div class="deco" data-deco data-depth="1.0"></div>            <!-- z3, parallax -->
  <div class="deco" data-deco data-depth="0.55"></div>
  <div class="pc-meta pc-meta--title">…</div>                     <!-- z4 -->
</div>
```
```js
FluidType.fit(document.querySelector('.pc-word'), { container: collage, gutter:0 });
ParallaxCollage.init('#collage', { wordmark:'.pc-word', maxShiftPx:26, ease:0.09 });
```

## Asset-substitution gate (the lab)
Rebuilds the engine on OUR content — QUADRO renders in the tiles, "архітектура"
behind (fluid-type-sized), geometric decor at depths 1.0 / 0.55. Proves the engine
is config-driven, not a trace of EVER's photos/spheres. Composes live with
fluid-type-sizing (the behind-word) — two harvested engines working together.
