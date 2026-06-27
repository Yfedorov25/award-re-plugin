---
id: dual-image-split-stat
name: "Dual-image split-stat carousel (each slide = an interior + a city-view photo side by side with a stat-row overlaid + a type title; round ‹ › arrows swap the whole pair)"
level: 2
kind: component
status: official
entry:
  call: "DualImageSplitStat.create(target, opts)  // target = .dss-stage > .dss-viewport( .dss-slide[data-title][data-stats] x N, each = .dss-split( .dss-img--l + .dss-img--r ) ) + .dss-meta( .dss-title + .dss-stats ) + .dss-nav( .dss-prev + .dss-counter + .dss-next ). opts: { start, revealDur, swapDur, ease, loop, once, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), play(), next(), prev(), go(i), destroy }"
meaning:
  what: "r1864's apartment-type gallery — a CAROUSEL where each slide is a DUAL-IMAGE SPLIT (left interior + right city-view, side by side) with a STAT-ROW OVERLAID across the bottom (площадь / спальни / высота) + a type TITLE overlaid at top; round ‹ › arrows (+ a counter) swap the WHOLE pair. On enter the active split clip-reveals from the centre seam outward + the stat-row rises. The 'compare the type — inside vs the view' chapter."
  when: "An apartment-type / floor-type gallery where each type is best sold as a PAIR of images — the interior AND the view it commands — with its key numbers (area, bedrooms, ceiling height) read right on the image. Use it when the comparison is the point and you want a compact carousel rather than a long stack: one split per type, the stats overlaid, a single pair of arrows to flip between types. Good after a collection ladder, as the 'now look inside each' beat."
  lands: "Two photographs sit side by side — a room and the view from it — and as the section arrives they open outward from the seam between them like curtains parting. A type name sits across the top, and a row of big numbers reads along the bottom: area, bedrooms, height. A single round arrow flips to the next type — the pair cross-fades, the numbers change. It reads as a considered comparison, inside against outside, type by type."
  not_when: "A single hero image or a one-slide gallery (use fullscreen-media-carousel). A pure seam-reveal with no carousel (use center-seam-split). A long browsable ladder of tiers (use collection-tier-announce). When the type has only one image (the dual split is the whole idea)."
source:
  grammar: "r18641 /comfort + apartment types: a split with a stat-headline + body + a 'NN / N' counter + ‹ arrow beside a full interior, and side-by-side interior/view images with площадь / спальни / высота readouts."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 8 of the r1864 harvest; the apartment-type dual-split gallery)"
  registry_ref: ["r1864-dual-image-split-stat"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [clip-path, transform, opacity]
trigger: "scroll-into-view reveal (once) + a manual pair carousel (arrows / dots / drag)"
timing_layer: [B-reveal, C-carousel]
owns_pin: false
owns_scroll: false
page_beat: [apartment-types, gallery, stat-band, captioned-carousel]
combines_with: [collection-tier-announce, masked-heritage-split, compass-rose-section-divider, stat-odometer]
anti_combos: [pin, mix-blend-over-scroll]
gated_by: [R_perf_limits]
variants: [fullscreen-media-carousel]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a carousel of N slides, each = a two-up image split (.dss-img--l interior + .dss-img--r view) with an overlaid type title + a stat-row"
  - "on scroll-into-view the active split's images open from the CENTRE seam outward (left inset-right 100%->0, right inset-left 100%->0) over 0..0.6"
  - "the type title fades + translateY 24->0 (0.25..0.55); the stat-row stats stagger fade + translateY 20->0 (0.45..1.0)"
  - "‹ › arrows (and dots) swap the whole pair: cross-fade + scale 1.03->1, the title + stat-row re-render to the new type, the 'NN / N' counter updates, wraps when loop:true"
  - "set(p 0..1) is a PURE scrub of the ENTER; clip-path + transform + opacity only; NO mix-blend / NO WebGL; owns_pin false"
  - "reduced-motion or <=820px -> shown (first split shown, split stacks to rows, stats visible); window.__LAB_OK__ on init"
  - "asset-substitution gate: per-type interior + view image pairs + real per-type stats (area / bedrooms / height) overlaid"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the split in: the two images open from the centre seam outward + the type title + stat-row rise. Click ‹ ›: the whole pair swaps (cross-fade, title + stat-row re-render, counter NN/N updates, wraps). Verify the seam-out reveal, the title + stat stagger, the swap + counter sync, + fps. Full-height split — scroll so the stage fills the frame to screenshot it."
note: |
  Brick 8 of the r1864 harvest (a VARIATION) — the apartment-type dual-split gallery. Each slide is
  a two-up image split (interior + view) with the type stats overlaid; ‹ › swaps the whole pair, the
  images opening from the centre seam outward on enter. Marked relative: fullscreen-media-carousel
  (ONE full-bleed slide — listed in `variants`); also distinct from center-seam-split (a seam-reveal,
  not a carousel) and collection-tier-announce (a stacked ladder, not swappable). clip-path +
  transform + opacity = GPU-cheap; the overlaid title + stat-row read over a bottom scrim. owns_pin
  false. Proven: seam-out reveal (both imgs inset 100%->0), title + 3 stats stagger, ‹ › swap +
  re-render + loop wrap; 1.32% jank @ 4x throttle; zero console errors. data-stats is a
  'num|label ; ...' string the engine parses into the stat-row. Photos = quadro renders (honest demo
  assets; engine takes any photos). Serif = Playfair Display (Didot/Bodoni class).
---

# dual-image-split-stat — interior + view, side by side, with the numbers on the image; arrows flip the type

r1864's apartment-type gallery: each slide is a dual-image split (interior + city-view) with a
stat-row overlaid + a type title; the images open from the centre seam on enter, and round ‹ ›
arrows swap the whole pair.

## Markup + call
```html
<section class="dss-stage" id="apt-types">
  <div class="dss-viewport">
    <div class="dss-slide" data-title="Историческая коллекция"
         data-stats="105–165|Площадь, м² ; 1–2|Спальни ; 3,4–4|Высота сводов, м">
      <div class="dss-split"><div class="dss-img dss-img--l"><img src="…interior…"></div><div class="dss-img dss-img--r"><img src="…view…"></div></div>
    </div>
    <!-- … N type-slides … -->
  </div>
  <div class="dss-meta"><h2 class="dss-title">—</h2><div class="dss-stats"></div></div>
  <div class="dss-nav"><button class="dss-prev">‹</button><span class="dss-counter">01 / 04</span><button class="dss-next">›</button></div>
</section>
```
```js
DualImageSplitStat.create('#apt-types', { revealDur:1.0, swapDur:0.6, loop:true, manageLenis:false });
```

## Proven (the lab)
4 type-slides (Историческая / Частная / С террасами / Пентхаусы), each a dual-image split
(interior + view) with an overlaid type title + a 3-stat row (real r1864 numerals: 105-165 / 1-2 /
3,4-4 … 623-987 / 5-7 / 558-664). ENTER curve measured live (p / left-img-inset-right /
right-img-inset-left / title / stat1 / statN): 0 / 100% / 100% / 0 / 0 / 0 → 0.30 / 12.5% / 12.5% /
0.42 / 0 / 0 → 0.60 / 0% / 0% / 1 / 0.76 / 0 → 0.80 / 0% / 0% / 1 / 1 / 0.81 → 1 / 0% / 0% / 1 / 1 /
1. SWAP: ‹ › `01/04 → 02/04`, title "Историческая" → "Частная", stat-row re-renders; WRAP: prev
`02→01`, prev again → `04/04` (loop). Zero console errors. Smoothness (4× CPU throttle, scroll-enter
+ 2 swaps): 304 frames, 1.32% long → PASS. Photos = quadro renders (honest demo assets; engine
takes any photos).
