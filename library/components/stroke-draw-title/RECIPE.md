---
id: stroke-draw-title
name: "Stroke-draw title (the big serif word draws itself as outline strokes, then fills in)"
level: 2
kind: component
status: official
entry:
  call: "StrokeDrawTitle.create(target, opts)  // target = a container. opts: { text, font, weight, stroke, fill, strokeWidth, drawDur, drawEase, fontSize, tracking }."
  module: iife
  returns: "{ svg, play(o), set(p), reset(), destroy }"
meaning:
  what: "Saisei's homepage title reveal — the big serif word is drawn as OUTLINE STROKES that trace the letter contours (SVG stroke-dashoffset full->0), then the FILL fades in, so the title writes itself onto the dark hero before becoming solid. The glyphs do not move — they draw in place. set(p) is a PURE scrub. Different from mask-up-title (which RISES a project title from a baseline); this DRAWS the homepage title."
  when: "The homepage / brand title moment — the word that should feel hand-drawn, written onto the hero as the page settles. Saisei's homepage SAISEI. Where a title should arrive with the most deliberate, crafted entrance (an outline that traces then fills) rather than a rise or a fade — the brand's signature title beat."
  lands: "The big word appears first as thin outline strokes — just the contours of the letters traced onto the dark render, like a pen drawing them — and then the letterforms quietly fill in to solid, settling into the hero. It reads as the title being written, authored, before it becomes the headline; the most crafted of the title entrances."
  not_when: "A project/section title that should rise from a baseline (use mask-up-title). Small text (the trace is for display sizes). When the word is long (the trace gets slow/messy — keep it to a short title). A title that must read instantly (the draw delays legibility)."
source:
  grammar: "Saisei homepage: SAISEI appears as outline strokes (o_028 ~5% drawn) tracing to ~55% (o_034), full outline + dark fill by o_036; the fill then lightens with the background fade."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S5b / TITLE BUILD; o_028-o_044)"
  registry_ref: ["S5b-stroke-draw-title-saisei"]
stack: "vanilla (GSAP optional — built-in rAF power2 fallback) + inline SVG <text>"
webgl: false
motion_props: [stroke-dashoffset, opacity]
trigger: "triggered (play) or scrubbed (set(p))"
timing_layer: [B-entrance]
owns_pin: false
owns_scroll: false
page_beat: [hero, preloader]
combines_with: [center-seam-split, render-slice-reveal, content-stage-cascade, theme-tween]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "an <svg><text> outline (stroke, no fill) traces on via stroke-dashoffset (length -> 0); a fill <text> fades in over the back half (p>0.5)"
  - "the glyphs do NOT move — they draw in place; play() runs it, set(p 0..1) is a PURE scrub, reset() returns to un-drawn"
  - "SVG stroke-dashoffset + opacity only; GPU; NO mix-blend / NO backdrop / NO WebGL"
  - "GSAP used if present, else a built-in rAF tween; reduced-motion -> shown filled; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR title (QUADRO) in the Saisei serif drawing onto the hero"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The QUADRO title traces in as outline strokes (dashoffset len->0) then fills in over the back half. Triggered SVG text (no <img>, not scroll) — the wheel gate doesn't apply; verify the trace + fill + smoothness (fps>=50, jank<8%)."
note: |
  Brick S5b of the Saisei harvest — the HOMEPAGE title entrance (the second title mode,
  alongside mask-up-title's project-title rise). The word draws itself as outline strokes
  (stroke-dashoffset) then fills — crafted, written-on. Pairs after a center-seam-split /
  render-slice-reveal open. NOTE: stroke-dasharray on SVG <text> traces the glyph contour
  as one path (a clean "writing-on" read, not per-stroke calligraphy) — good enough and
  no-WebGL. Proven on QUADRO: outline traces dashoffset 1573->0, fill fades over the back
  half, 0% jank.
---

# stroke-draw-title — the big serif word draws itself, then fills in

Saisei's homepage title: the big serif word draws as outline strokes that trace the
letter contours (SVG stroke-dashoffset), then the fill fades in — the title writes itself
onto the hero before becoming solid. The glyphs don't move; they draw in place.

## Markup + call
```html
<div class="sdt-stage" id="stage"></div>
```
```js
var t = StrokeDrawTitle.create('#stage', { text: 'QUADRO', font: "'Fraunces',serif",
  stroke: '#f1ebd6', fill: '#f1ebd6', drawDur: 1.0, fontSize: 'clamp(3rem,13vw,10rem)' });
t.play();              // or t.set(progress) to scrub
```

## Proven (the lab)
OUR QUADRO title: the outline strokes trace the letter contours (dashoffset 1573 → 0) and
the fill fades in over the back half (p0.5=0, p0.7=0.4, p1=1). At set(0.55) the word reads
as thin outline strokes with the fill barely up (matches Saisei o_030-o_034: outline-only
letters on the dark hero). Probe (4× CPU throttle): 0/120 long frames (0.0%), 59.9fps.
