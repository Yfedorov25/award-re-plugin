---
id: vertical-curtain-wipe
name: "Vertical section-entry wipe (seam L→R to the column split + crop-zoom)"
level: 2
kind: component
status: official
entry:
  call: "VerticalCurtainWipe.init(target, opts)  // target = .vcw-stage el/selector. Markup: .vcw-stage > .vcw-out (img, the crop-zooming media) + .vcw-panel (the entering panel, clip-revealed L->R to park%). opts: { park, zoom, lerp, pinFactor, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, render, refresh, destroy }  (or { static:true, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "Springs' section ENTRY wipe — a panel enters as a hard VERTICAL seam wiping left->right and PARKING at the column split (~50%), while the outgoing full-bleed image CROP-ZOOMS (scale up + origin shift) to recompose into the shrinking column. A clip-path inset growing from the left does the seam (inset(0 100% 0 0) -> inset(0 (100-park)% 0 0)); scroll-scrubbed, reversible. It is the entry that hands off into the coupled-split / dual-slicer (Springs Building -> Open-doors)."
  when: "Arriving at a SPLIT section where a colour/text column should sweep in and lock to the column line while the previous full-bleed image recomposes into the other half — the Springs way to transition from a full-bleed beat into a two-column composition. The clean 'wipe in the text column, crop the photo to its new half' entry, especially as the lead-in to dual-slicer / a coupled split."
  lands: "A full-bleed photo, then a colour column sweeps in from the left and stops crisply at the centre line, the photo zooming to stay composed in the half it now owns. It reads as the layout decisively forming — a confident vertical wipe to the column split — not a fade or a soft dissolve. The natural opening for a two-column section."
  not_when: "A section that is not a split (no column line to park at). A soft/atmospheric entry (use a fade / brand-overlay-crossfade). A full-bleed beat that should stay full-bleed (section-pager). A page that can't own a pin here (one scroll owner)."
source:
  grammar: "springs.estate Building -> Open-doors SEAM-02 (f014->f017): a green panel wipes L->R parking at the 50% column split while the outgoing render crops at its left edge AND scales up to recompose in the shrinking column; the headline rises out of the panel bottom."
  recording: "apps/quadro/.award-re/teardowns/D_springs_dual_render_slicer_clip.md (SEAM-02) + D_springs_walkthrough_video.md"
  registry_ref: ["T-vwipe-springs"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis 1.1.13"
webgl: false
motion_props: [clip-path, transform]
trigger: "ONE pinned scroll-scrub ScrollTrigger (scrub:true, pin:true), Lenis-smoothed, reversible; pin length = innerHeight*pinFactor"
timing_layer: [B-entrance]
owns_pin: true
owns_scroll: false
page_beat: [chapter, material]
combines_with: [dual-slicer, bleeding-wordmark, theme-tween, section-pager, fluid-type-sizing]
anti_combos: [second-pin, section-pager]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_one_scroll_owner]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE pinned scroll wipes the panel in (owns_pin TRUE); render(prog) is a PURE fn of progress; reversible"
  - "the panel is revealed by a clip-path inset growing from the LEFT (inset(0 100% 0 0) -> inset(0 (100-park)% 0 0)) — a crisp vertical seam sweeping L->R and PARKING at park% (the column split)"
  - "the outgoing full-bleed image CROP-ZOOMS (scale 1 -> 1+zoom, origin shifted toward the kept side) as its visible column narrows, staying composed"
  - "proven: clip inset(0 100%) at top -> inset(0 72%) mid -> inset(0 50%) parked at end; img scale 1 -> 1.067 -> 1.12"
  - "clip-path + transform only; GPU layers; NO mix-blend / NO backdrop over the scrubbed surface; NO WebGL"
  - "reduced-motion / <=820px -> static (panel parked at park, image composed); window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR render + a green panel + Ukrainian heading"
gate:
  probe: "Open lab.html (Lenis from jsdelivr). __LAB_OK__ true (vcw-ready, NOT vcw-static). Scroll into the pinned section and confirm: a vertical seam sweeps the panel in from the left and STOPS at the 50% split, the photo crop-zooms in the right half, reversible on scroll-up. Smoothness gate (curtain mode; the panel covers the image): PASS = 0 blank, fps>=50, jank<8%."
note: |
  Smaller brick 5 of 7. The Springs section-entry that leads into dual-slicer /
  coupled-split. owns_pin -> one scroll owner per section. Composes with dual-slicer
  (the entry before it), bleeding-wordmark / fluid-type-sizing (the panel heading),
  theme-tween (the panel colour).
---

# vertical-curtain-wipe — section-entry wipe (seam L→R to the column split + crop-zoom)

Springs' section entry: a colour panel wipes in from the left and parks at the column
split while the previous full-bleed photo crop-zooms into its new half. The confident
'layout forming' entry that leads into a coupled split.

## Markup + call
```html
<section class="vcw-stage" id="wipe">
  <div class="vcw-out"><img src="…"></div>          <!-- crop-zooms in the right half -->
  <div class="vcw-panel">… eyebrow + heading …</div>  <!-- wipes L->R to 50% -->
</section>
```
```js
VerticalCurtainWipe.init('#wipe', { park: 50, zoom: 0.12, pinFactor: 0.9 });
```

## Proven (the lab)
OUR render full-bleed, a green panel wiping in to the 50% split (heading inside), the
render crop-zooming in the right half. Clip inset(0 100%) → inset(0 72%) → inset(0 50%)
parked; img scale 1 → 1.067 → 1.12. Curtain gate PASS: 0 blank, 0 seam, 59.9fps,
jank 1/687.
