---
id: circular-ui-language
name: "Circular UI vocabulary (rings, arrows, +→×, pin, wordmark→monogram)"
level: 1
kind: utility
status: official
entry:
  call: "CircularUI.init(opts)  // opts: { plus, brand, monoAt, onToggle }. Wires the '+' expanders (click -> .is-open -> ×) and the wordmark->monogram collapse on scroll. Also CircularUI.ring('prev'|'next'|'plus', {size,label}) builds a ring button. The shapes themselves are CSS classes (.cui-ring/.cui-arrows/.cui-plus/.cui-pin/.cui-poi/.cui-brand)."
  module: iife
  returns: "{ collapseBrand(on) }"
meaning:
  what: "The ONE circular UI vocabulary EVER + Springs share, made consistent: ring buttons, ← → outline arrows, a '+' expander that rotates to ×, a teardrop map pin, circular POI chips, and a centre wordmark that COLLAPSES to a circular monogram on first scroll. Everything is built from border-radius:50% + a 1px stroke + currentColor, so every control inherits the section ink (pairs with theme-tween) and the whole site's controls read as one family. The shapes are CSS classes; the JS wires the two interactive states (+ → × toggle, wordmark → monogram on scroll)."
  when: "Every site built from this library — it is the shared control skin. Use the arrows on a carousel/slider, the '+' on expanders/galleries, the pin/POI chips on a map, the ring buttons for scroll cues / call-to-actions, and the wordmark→monogram in the header. The cheap cohesion layer that makes disparate sections feel like one brand."
  lands: "Every interactive element — the carousel arrows, the gallery '+', the map pins, the header logo — is a member of one circular family in the section's ink: thin rings, a '+' that twists into an ×, a logo that quietly shrinks to a monogram as you scroll. The site feels art-directed and coherent, not assembled from mismatched widgets."
  not_when: "A brand whose UI language is explicitly NOT circular (sharp/rectilinear system) — then build that vocabulary instead. A one-off control that should stand apart. Don't force the monogram collapse if the brand has no monogram mark."
source:
  grammar: "EVER + Springs shared circular vocabulary (ring buttons, ← → arrows, '+' expanders, teardrop pins, wordmark→monogram on first scroll), live-read (P21)."
  recording: "ever-live-here.com + springs.estate (live) + apps/quadro/.award-re/teardowns/ (P21 in the master catalog)"
  registry_ref: ["T-circularui-vide"]
stack: "vanilla JS + CSS only (no libs). Shapes = border-radius + 1px stroke + currentColor."
webgl: false
motion_props: [transform, opacity]
trigger: "click ('+' -> ×) + scroll (wordmark -> monogram past monoAt). No pin, no scrub."
timing_layer: [A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [hero, chapter, material, proof, amenities]
combines_with: [theme-tween, portrait-carousel, persistent-index-menu, watercolor-svg-map, parallax-collage]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "all shapes built from border-radius:50% + a 1px stroke + currentColor (inherit the section ink -> recolor with theme-tween)"
  - "ring button (.cui-ring, hover opacity .6->1; --lg/--sm sizes); ← → arrow pair (.cui-arrows)"
  - "'+' expander (.cui-plus = 2 pseudo-bars) toggles .is-open -> rotate(45deg) = × on click (proven)"
  - "teardrop pin (.cui-pin, rotate -45 + inner un-rotate; --ghost outline) + circular POI chips (.cui-poi)"
  - "wordmark -> monogram (.cui-brand: .cui-brand__full + .cui-brand__mono stacked); .is-mono crossfades to the monogram on scroll past monoAt (proven: full op 0.07 / mono 0.92 after scroll)"
  - "transform (rotate) + opacity (crossfade/hover) only; NO mix-blend / NO backdrop; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR brand QUADRO -> Q monogram + the controls in our ink"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Click the '+' -> it rotates to ×. Scroll down -> QUADRO crossfades to the Q monogram in the header. All shapes (rings, arrows, pins, POI chips) render as a circular family in the cream ink. This is a UI-vocabulary utility, not a scroll mechanic — the gate is the state checks + eye-check (no blank/curtain gate)."
note: |
  Smaller brick 3 of 7. The shared control skin every other component leans on (the
  carousel/menu arrows, the map pins, expanders, the header monogram). A utility:
  CSS shapes + minimal JS for the two interactive states. Inherits currentColor so
  it recolors with theme-tween. portrait-carousel inlined its own arrow svgs before
  this existed; both are compatible (same border-radius+stroke language).
---

# circular-ui-language — the shared circular vocabulary

The one circular UI family EVER + Springs share: ring buttons, ← → arrows, a '+'
that twists to ×, a teardrop pin, POI chips, and a wordmark→monogram collapse — all
from border-radius + 1px stroke + currentColor, so everything inherits the section
ink and the controls read as one brand.

## Use
```html
<!-- header brand -->
<div class="cui-brand"><span class="cui-brand__full">QUADRO</span><span class="cui-brand__mono">Q</span></div>
<!-- controls -->
<button class="cui-ring cui-plus"></button>          <!-- + -> × -->
<div class="cui-arrows"><button class="cui-ring">‹</button><button class="cui-ring">›</button></div>
<span class="cui-pin"><span>Q</span></span>          <!-- map pin -->
<span class="cui-poi">П</span>                        <!-- POI chip -->
```
```js
CircularUI.init({ plus: '.cui-plus', brand: '.cui-brand', monoAt: 40 });
```

## Proven (the lab)
OUR QUADRO → 'Q' monogram on scroll (full op 0.07 / mono 0.92 past 40px); '+'
toggles to ×; 5 ring buttons + 2 teardrop pins + 3 POI chips render in cream ink.
Inherits currentColor → recolors with theme-tween.
