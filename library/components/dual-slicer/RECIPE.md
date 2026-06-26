---
id: dual-slicer
name: "Coupled-split slicer (Springs render-strip + per-line + inset on one scroll)"
level: 2
kind: component
status: official
entry:
  call: "DualSlicer.init(target, opts)  // target = the .ds-stage el/selector. Markup-first: .ds-render children in .ds-right are the vertical clip-path strip (>=2); .ds-line/.ds-line__i are the per-line heading wraps; .ds-inset the rising photo. opts: { lerp, pinFactor, headingLines, inset, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, render, refresh, destroy }  (or { static:true, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "Springs' signature 'Open the doors' COUPLED-SPLIT section, harvested from the frame-by-frame teardown of springs.estate. ONE pinned scroll range drives TWO independent systems in one column-pair at once: the RIGHT column is a vertical CLIP-PATH RENDER STRIP — a stack of >=2 renders where the incoming (lower) render is revealed UPWARD by shrinking its top inset (clip-path inset(100% 0 0 0)->inset(0)), scroll-scrubbed 1:1, reversible, a crisp full-width horizontal seam (lower covers upper, NOT a fade, NOT two opposite slides); the LEFT column SIMULTANEOUSLY reveals the heading per-line (each line rises from under a clip) and rises a small inset photo from below, both coupled to the SAME scroll, finishing with a sticky-media / scrolling-text read-through. Multiple things move in one scroll beat off one scroll position — the 'more custom than EVER' parallel."
  when: "A flagship chapter where one section should do MORE than one thing per scroll — a column of architectural renders handing off one to the next while the headline assembles line-by-line and a mood photo rises beside it. The 'this studio can choreograph' beat: a coupled split that reads richer and more authored than a single full-bleed or a single slider, the signature Vide-Infra / Springs move."
  lands: "As you scroll one section, the right images swap by a clean rising seam (render after render) while, in the same motion, the left headline builds line by line and a small photo lifts into place — several things gliding together off one scroll, then the media pins and the copy scrolls through. It reads engineered and expensive, not a single image or a plain carousel."
  not_when: "A single full-bleed cinematic frame (section-pager / media-step-switch). A simple one-axis reveal with nothing else moving (slice-clip — that IS this without the coupled left column). A page that must keep native scrolling, or a section already under another pin / scroll owner in the same beat (one scroll owner per page). Touch-small -> the static stacked fallback (you lose the coupling)."
source:
  grammar: "Harvested from the springs.estate 'Open the doors of Springs' section, frame-by-frame: right vertical clip-path render strip (seam travels up, scroll-scrubbed, reversible) coupled to a left per-line heading reveal + rising inset photo, two scroll systems on one scrub. Full per-frame seam curve in D_springs_dual_render_slicer_clip.md."
  recording: "apps/quadro/.award-re/teardowns/D_springs_dual_render_slicer_clip.md (120 frames @6fps)"
  registry_ref: ["T-dualslicer-springs"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis 1.1.13 (cdn jsdelivr)"
webgl: false
motion_props: [clip-path, transform, opacity]
trigger: "ONE pinned scroll-scrub ScrollTrigger (scrub:true, pin:true), Lenis-smoothed, reversible; pin length = innerHeight*pinFactor*max(1,handoffs)"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
owns_scroll: false
page_beat: [chapter, proof, material]
combines_with: [section-curtain-riseover, vertical-curtain-wipe, fluid-type-sizing, splitLines, sticky-media]
anti_combos: [second-pin, section-pager, media-step-switch, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_one_scroll_owner, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE pinned scroll drives BOTH columns (owns_pin TRUE; exactly one ScrollTrigger pins); render(prog) is a PURE fn of progress (onUpdate + render(0) at init); reversible"
  - "RIGHT strip: >=2 stacked renders; each incoming (lower) render revealed UPWARD by clip-path inset(100% 0 0 0)->inset(0); lower-covers-upper; crisp full-width seam; NOT a fade, NOT two opposite slides; handoffs spread across the pin"
  - "LEFT column coupled to the SAME scroll: heading reveals per-line (each .ds-line__i rises from under an overflow:hidden .ds-line clip, staggered) AND a .ds-inset photo rises from below — moving in the same scroll beat as the right seam"
  - "verified mid-scroll: a render's seam mid-sweep (e.g. ~54%) WHILE the heading lines are at different reveal stages and the inset is rising — two scroll systems off one position"
  - "engine laws: Lenis 1.1.13 lerp 0.1 -> gsap.ticker -> ScrollTrigger.update; lagSmoothing(0); clip-path + transform + opacity only; GPU layers (will-change); NO mix-blend / NO backdrop over the scrubbed surface; NO video.currentTime; NO WebGL"
  - "SLICER gate mode (= CURTAIN=1): overlap of two solid renders during the clip-reveal is the technique (coSolid/seam EXPECTED); blank/jank/fps stay hard. PASS = 0 blank, fps>=50, jank<8%"
  - "reduced-motion / <=820px -> static stacked (columns stack, all renders shown, no clip/transform); window.__LAB_OK__ set on init; asset-substitution gate: built on OUR QUADRO renders + Ukrainian copy"
gate:
  probe: "Open lab.html in a real browser (Lenis from jsdelivr). __LAB_OK__ true once ready (NOT ds-static). Scroll into the pinned range and confirm: the right renders hand off by a rising seam (lower covers upper, reversible on scroll-up), while the heading builds line-by-line and the inset rises in the SAME scroll. Run the smoothness gate in SLICER mode (CURTAIN=1): PASS = 0 blank, fps>=50, jank<8% (seam/coSolid are expected for a clip-reveal). Eye-check the coupled motion in a real browser."
note: |
  Fourth harvested engine per the 2026-06-26 council verdict (Springs engine #1 of 2).
  Relationship to slice-clip: slice-clip is the bare single-axis clip reveal; dual-slicer
  is that strip COUPLED to a left per-line heading + rising inset on one pinned scroll —
  the coupling is the Springs signature. The vertical green curtain ENTRY that Springs
  uses to arrive at this section is sequential and belongs to section-curtain-riseover /
  a vertical-wipe primitive, not owned here. Springs' custom scroll controller resisted
  live wheel-driving, so this was built from the per-frame teardown + live DOM facts;
  the seam curve and coupling are frame-cited in D_springs_dual_render_slicer_clip.md.
---

# dual-slicer — coupled-split slicer (Springs render-strip + per-line + inset)

Springs' "Open the doors" section: one pinned scroll drives a right vertical
clip-path render strip AND a left per-line heading reveal + rising inset photo at
once — two decoupled scroll systems on one scrub. That coupling is what reads
"more custom than EVER".

## The two systems (one scroll)
- RIGHT: `.ds-render` stack; incoming render revealed upward via
  `clip-path: inset(100% 0 0 0) -> inset(0)`, scroll-scrubbed, lower-covers-upper,
  crisp seam, reversible. (slice-clip is this alone.)
- LEFT: `.ds-line__i` rise from under `.ds-line` clips (staggered) + `.ds-inset`
  rises — same scroll beat.

## Markup + call
```html
<section class="ds-stage" id="slicer">
  <div class="ds-left">
    <div class="ds-eyebrow">…</div>
    <div class="ds-head">
      <span class="ds-line"><span class="ds-line__i">line one</span></span>
      <span class="ds-line"><span class="ds-line__i">line two</span></span>
    </div>
    <p class="ds-body">…</p>
    <div class="ds-inset"><img src="…"></div>
  </div>
  <div class="ds-right">
    <div class="ds-render"><img src="a.webp"></div>
    <div class="ds-render"><img src="b.webp"></div>
    <div class="ds-render"><img src="c.webp"></div>
  </div>
</section>
```
```js
DualSlicer.init('#slicer', { lerp: 0.1, pinFactor: 1.5 });
```

## Gate (SLICER mode)
Run the smoothness gate with `CURTAIN=1` — the overlap of two solid renders during
the clip-reveal IS the technique, so seam/coSolid are expected; blank/jank/fps stay
hard. Proven on OUR content: 3 QUADRO renders + Ukrainian heading -> 0 blank,
59.9fps, jank 2/842. Mid-scroll: render1 seam 54% while heading lines at 34/59/66px
and inset rising — the coupled two-system move confirmed.
