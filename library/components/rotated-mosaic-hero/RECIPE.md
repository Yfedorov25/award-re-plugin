---
id: rotated-mosaic-hero
name: "Rotated photo-tile mosaic hero (tilted plane + wash + plane parallax)"
level: 2
kind: component
status: official
entry:
  call: "RotatedMosaicHero.init(target, opts)  // target = .rmh-stage el/selector. Markup: .rmh-stage > .rmh-bg + .rmh-plane(.rmh-grid + .rmh-wash) + .rmh-content. opts: { tiles, cols, rows, angle, scale, wash, parallax, gutter }. The engine lays out the grid, rotates+scales the plane, sets the wash, and scroll-drifts the plane."
  module: iife
  returns: "{ tiles, refresh }"
meaning:
  what: "Springs' signature HERO — a grid of ~9-12 photo tiles rotated as ONE rigid plane (~-8 to -10deg) and scaled so its corners cover the viewport, bound by a colour MULTIPLY WASH (~55-65%) that unifies the disparate photos into one calm field, drifting as one plane on scroll. The tiles do NOT counter-rotate; depth comes from the rotation itself (top-row vs bottom-row tiles travel different screen-Y as the plane moves up) — a free depth feel without per-tile speed. A giant serif title + eyebrow sit over the plane. CONFIG-DRIVEN: any tiles, grid shape, angle, scale, wash, parallax."
  when: "A hero / chapter cover that wants a RICH, atmospheric collage of many images bound into one mood — a wellness/lifestyle field, a 'this is a whole world' opener — rather than a single full-bleed render. When you have many varied photos (nature, detail, building, life) and want them to read as one calm tilted plane with a giant title over it. The Springs/Vide-Infra mosaic-hero signature."
  lands: "A tilted field of photographs — many moments (a yard, a terrace, a macro detail, a garden) — all pulled into one calm colour by a wash, drifting gently as you scroll, with a giant serif word resting over it. It reads like the opening spread of an expensive brochure, atmospheric and composed, not a single stock hero."
  not_when: "A single hero render is the message (section-pager hero / a full-bleed). A literal, inventory-accurate grid (this is atmosphere, not a clickable gallery — use cards-swipe / a plan grid). When you have only 2-3 photos (not enough to read as a mosaic). When the brand is minimalist and a busy tilted collage would feel wrong."
source:
  grammar: "springs.estate hero (S1), frame-by-frame: ~9-12 tile CSS grid rotated rigidly ~-8/-10deg + scaled to cover, a ~55-65% multiply wash unifying the photos, the whole plane drifting up on scroll; giant serif 'Splendor of Renewal' over it."
  recording: "apps/quadro/.award-re/teardowns/D_springs_walkthrough_video.md (S1)"
  registry_ref: ["T-mosaichero-springs"]
stack: "vanilla JS; optional GSAP 3.12.5 + ScrollTrigger + Lenis for the plane parallax"
webgl: false
motion_props: [transform]
trigger: "ScrollTrigger scrub drifts the whole plane (yPercent) keeping its rotation+scale; static under reduced-motion / no GSAP"
timing_layer: [A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [hero, chapter]
combines_with: [bleeding-wordmark, theme-tween, section-pager, fluid-type-sizing, section-curtain-riseover]
anti_combos: [scroll-scrub-pin]
gated_by: [R_perf_limits, R_reduced_motion_fallback]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a grid of N (~9-12) photo tiles rotated as ONE rigid plane (angle ~-9deg) and scaled (~1.35-1.4) so corners cover the viewport after rotation; tiles do NOT counter-rotate (proven: plane matrix encodes the rotation)"
  - "a unifying colour WASH over the mosaic (mix-blend:multiply, ~0.55-0.65) INSIDE the plane (transforms with it) — the one allowed mix-blend spot (baked into a static plane, not recomputed over a scrubbed surface)"
  - "on scroll the WHOLE plane drifts up as one (yPercent) keeping its rotation+scale (proven: plane Y 0 -> -121 on scroll); depth comes from the rotation, no per-tile speed"
  - "a giant serif title + eyebrow sit over the plane (z above)"
  - "transform-only on the plane, GPU layer (will-change:transform); tiles are real <img> object-fit:cover"
  - "reduced-motion / no GSAP -> static rotated mosaic (no parallax); window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR 12 QUADRO tiles + green wash + Ukrainian title; CURTAIN gate mode (a mosaic inherently shows many tiles = seam 100%, not a bug)"
gate:
  probe: "Open lab.html (Lenis from jsdelivr). __LAB_OK__ true (rmh-ready). Confirm the mosaic is visibly TILTED as one plane, the wash unifies the photos into one mood, and scrolling drifts the whole plane up keeping its tilt. Smoothness gate in CURTAIN mode (CURTAIN=1; a mosaic always shows many tile-renders so seam is inherent): PASS = 0 blank, fps>=50, jank<8%. Eye-check the tilt + wash + drift."
note: |
  Critical brick #4 of the 4 — completes the critical set (with bleeding-wordmark,
  theme-tween, persistent-index-menu). The one allowed mix-blend spot in the library:
  the wash is baked into the static rotated plane and transforms with it (not over a
  separately-scrubbed surface), per the catalog P18 note. Pairs with bleeding-wordmark
  / fluid-type-sizing for the title and theme-tween for the field colour. After this,
  the smaller remaining bricks: de-bleed, vertical-wipe, oval-mask, brand-overlay,
  carousel, circular-UI, watercolor-map.
---

# rotated-mosaic-hero — tilted photo-tile mosaic hero

Springs' signature hero: a grid of photo tiles rotated as one rigid plane, bound by
a colour multiply wash into one calm field, drifting as one plane on scroll, with a
giant serif title over it.

## Markup + call
```html
<section class="rmh-stage" id="hero">
  <div class="rmh-bg"></div>
  <div class="rmh-plane">
    <div class="rmh-grid"></div>   <!-- engine fills tiles -->
    <div class="rmh-wash"></div>   <!-- multiply wash, style its color -->
  </div>
  <div class="rmh-content">… eyebrow + giant title …</div>
</section>
```
```js
RotatedMosaicHero.init('#hero', {
  tiles: ['a.webp','b.webp', …12], cols:4, rows:3,
  angle:-9, scale:1.4, wash:0.55, parallax:16, gutter:8
});
```

## Proven (the lab)
12 QUADRO tiles, angle -9 (plane matrix 1.38/-0.219 = rotate -9, scale 1.4), green
multiply wash 0.55, giant serif "Власний спокій". Parallax proven: plane Y 0 -> -121
on scroll, drifting up keeping its rotation. CURTAIN-mode gate PASS (a mosaic shows
many tiles = seam inherent): 0 blank, 59.9fps, jank 1/685.
