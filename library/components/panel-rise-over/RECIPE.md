---
id: panel-rise-over
name: "Panel rise-over (the next section is a coloured panel with a big rounded top that rises from below over the previous section + a theme-flip; content fades in during the rise)"
level: 2
kind: component
status: official
entry:
  call: "PanelRiseOver.create(target, opts)  // target = .pro-stage wrapping .pro-prev (outgoing section) + .pro-panel (rising coloured panel, content marked .pro-rise). opts: { radius, pinFactor, contentFrom, prevParallax, ease, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, set(p), refresh(), destroy }"
meaning:
  what: "11tanjung's section hand-off — the NEXT section is a coloured PANEL with a big rounded top edge (border-radius ~40-60px) that RISES from below (translateY 100% -> 0) and slides OVER the previous section, flipping the theme (brown <-> cream — the panel carries its own colour). The panel's content fades + lifts in DURING the rise, readable by ~70% of the travel. ONE pinned scroll-scrub (~2.1s). set(p) is a PURE scrub."
  when: "A section-to-section transition where the NEW section should feel like it covers and replaces the old one with weight — and where a theme change (dark->light, brown->cream) is part of the story. Use it as the seam between two full-bleed beats (e.g. atmosphere -> plans) when a plain scroll or crossfade is too flat. The rounded leading edge + the panel's own colour make the new section read as a physical card lifting into place over the last one."
  lands: "You scroll and the bottom of the screen lifts — a pale, soft-cornered panel slides up over the photo you were just looking at, like a drawer closing upward, its rounded top edge catching a faint shadow. As it nears the top the words on it fade and rise into place, settled before it fully seats. The page has changed colour and chapter in one move, and it felt like one object moving, not two screens swapping."
  not_when: "A reveal of content already on the page (use scroll-clip-rise). A page-to-page or curtain transition from a centre line (use center-seam-split). When there's no theme/colour change worth the ceremony. Stacking two of these back to back (the rise rhythm flattens). Over a video that itself moves under the panel."
source:
  grammar: "11tanjung C4: the next section rises from below with a big rounded top (~40-60px arc) translateY up OVER the previous section + a theme-flip (brown<->cream, the panel is itself coloured); the content appears DURING the rise (~70% of the height = text already readable); scroll-linked ~2.1s."
  recording: "apps/quadro/.award-re/teardowns/D_11tanjung_video.md (C4 panel-rise-over; cousin of Saisei center-seam-split but single-axis Y + rounded)"
  registry_ref: ["C4-panel-rise-over-11tanjung"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity]
trigger: "owns_pin scroll-scrub (pinned for innerHeight*pinFactor; ~2.1s rise)"
timing_layer: [T-transition, C-content]
owns_pin: true
owns_scroll: false
page_beat: [section-handoff, theme-flip]
combines_with: [editorial-act-crossfade, venn-ring-portal-reveal, blur-reveal-stagger-title, coords-corner-frame]
anti_combos: [center-seam-split, scroll-clip-rise, second-pin, video-under-panel]
gated_by: [R_anti_combos, R_perf_limits, R_owns_pin]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the rising panel (.pro-panel) carries its own colour (theme-flip vs .pro-prev) and a STATIC big rounded top (border-top radius = `radius`, 40-60px)"
  - "on scroll the panel translateY animates 100% -> 0 (power3.out — fast rise, settling tail), sliding OVER the previous section (z above .pro-prev)"
  - "the panel content (.pro-rise) reveals over [contentFrom .. 1]: opacity 0 -> 1 + translateY 28px -> 0, readable by ~p>=0.7 (text up before the panel fully seats)"
  - "the outgoing section behind holds (optional small prevParallax up as it's covered); set(p 0..1) is a PURE scrub"
  - "transform: translateY + opacity + static border-radius only; NO mix-blend / NO backdrop over the panel; NO WebGL; owns_pin (one pin, span = innerHeight*pinFactor)"
  - "reduced-motion or <=820px -> panel seated (covering), no pin; GSAP+ScrollTrigger required for scroll; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO render in the outgoing (brown) section + a cream rounded panel rising over + warm palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true, panel radius = `radius`px. Scroll the pinned stage: a cream rounded-top panel rises (translateY 100%->0, power3.out) OVER the brown QUADRO section, flipping the theme; its content fades + lifts in during the rise (readable ~70%). owns_pin scroll-scrub. Verify the panel translateY curve + the static rounded top + the content reveal window + fps/jank. To screenshot a true mid-rise, binary-search the scroll for the target translateY% (the pin offset != raw page scroll). Do NOT create() a second instance — two pins on one element conflict."
note: |
  Brick 6 of the 11tanjung harvest — the section hand-off. A REAL coloured panel with a
  big rounded top translates up OVER the outgoing section, flipping the theme, content
  landing during the rise. Cousin of Saisei center-seam-split but a DIFFERENT engine:
  center-seam-split is a clip-path COVER peeling from a centre line (no colour change, no
  rounded edge); panel-rise-over is a translateY of a coloured panel with a rounded leading
  edge and a theme-flip. Also not scroll-clip-rise (that reveals on-page elements from a
  bottom mask; this moves a whole section over another). owns_pin. translateY + opacity =
  GPU-cheap. Proven 1:1 on the QUADRO aerial render: rise 100%->0 power3.out, radius 52px,
  content readable by p=0.7, 0.2% jank @ 59.9fps, zero console errors. Theme palette =
  warm-black/warm-white + brown/cream (11tanjung).
---

# panel-rise-over — a coloured rounded panel rises from below over the previous section + theme-flip

11tanjung's section hand-off: the next section is a coloured panel with a big rounded top
(border-radius 40-60px) that rises from below (`translateY 100% → 0`) and slides over the
previous section, flipping the theme (brown ↔ cream — the panel carries its own colour). The
content fades + lifts in during the rise, readable by ~70% of the travel. One pinned scroll, ~2.1s.

## Markup + call
```html
<section class="pro-stage" id="rise">
  <div class="pro-prev"><!-- outgoing (e.g. brown) section: render + caption --></div>
  <div class="pro-panel"><!-- rising (e.g. cream) panel -->
    <div class="panel-inner">
      <div class="pro-rise top">/ 04 — The Plans</div>
      <h2 class="pro-rise">…</h2>
      <p class="pro-rise">…</p>
    </div>
  </div>
</section>
```
```js
PanelRiseOver.create('#rise', { radius:52, pinFactor:1.2, contentFrom:0.45, prevParallax:40, ease:'power3.out', manageLenis:false });
```

## Proven (the lab)
OUR QUADRO aerial render (brown section) → a cream panel rises over it. Curve measured live
(p / panel-translateY / content-opacity):
0 / 100% / 0 → 0.20 / 51.2% / 0 → 0.45 / 16.6% / 0 → 0.60 / 6.4% / 0.61 → 0.70 / 2.7% / 0.84 →
0.85 / 0.34% / 0.98 → 1 / 0% / 1. Rounded top radius = 52px (static). Content readable by p=0.7
(op 0.84) exactly as C4. Mid-rise frame (panel translateY 42%): the cream rounded panel half-up
over the brown aerial render, the big top-corner arc + lip-shadow visible, theme flipped
brown→cream (matches 11tanjung C4). Probe (4× CPU throttle): 1/627 long frames (0.2%), 59.9fps →
PASS. Zero console errors.
