---
id: architecture--veil-detail
name: "Завіса деталі"
level: 2
kind: section-variant
status: base
section: architecture
meaning:
  what: "A calm architecture OVERVIEW render (day-front) carries three element triggers (glazing, pergola, terrace). Click one and a dark VEIL does COVER -> HOLD (swap content unseen) -> UNCOVER onto a calm two-tone DETAIL of that element: a framed macro render of the node/material on a lighter canvas, ONE one-line spec on an air-luxury rail, two meta cells (material plus a per-element dimension key), a section-silhouette locator chip (this element dark), a back. Each trigger is PROVEN by its render, the glazing macro shows the aluminium glass band, the pergola macro shows the timber slats on steel, the terrace macro shows the wood-deck roof, image and claim agree. The veil hides the swap so the drill-down reads as one considered gesture, not a hard cut. A fixed-overlay MODAL, no router, no scroll pin."
  when: "An architecture chapter that should sell the BUILDING by letting the visitor inspect the parts on demand, the facade glazing, the pergola timber, the roof terrace, without leaving the overview or scrolling a wall of text. The 'this is built, look closer' beat: a surgical drill-down where the overview stays the hero and detail is reached, held, and returned through one premium transition."
  lands: "You see the building calm and whole, three quiet plus-rings sit on it. You press one, a dark veil sweeps up, holds a beat, sweeps off, and you are inside a single material detail with one sentence of proof that the render literally shows, then you press back and the veil returns you to the image. It reads authored and expensive, an architect walking you to one detail at a time, not a gallery dump or a catalogue card."
  not_when: "A scroll-driven cinematic chapter where the section itself must pin and scrub (use the coupled-split slicer or a daynight seam). A full availability drill-down for apartments (that is visual-search proper). A page already under a pin in the same beat. Day/night mood is atmosphere, out of scope here, this sells geometry and material, not time of day."
source:
  grammar: "silver-pinewood.com architecture chapter (Vide Infra quiet luxury): a dark editorial section that drills into the building through a surgical typed/tabbed reveal, AIR is the luxury, one rich interaction per chapter, not effects everywhere (D_SilverPinewood_architecture.md §2 section-grammar, §4 surgical drill-down, §8 verdict 4/5). The veil page-transition + two-tone detail layout is EVER visual-search Level 3, re-aimed from a flat plan to an architectural node."
  recording: null
  registry_ref: []
uses:
  - { atom: veil-flat-detail-reveal, job: "the whole interaction: the fixed-overlay modal, the COVER -> HOLD -> UNCOVER veil that hides the per-element content swap, the two-tone rail+canvas, the perimeter draw-in of the framed plate, the back/Escape close. Driven unmodified; each architectural element is passed as a unit{} whose planSVG is an inline <image> of the macro render plus a framing perimeter path." }
pin:
  owner: 'none'
  count: 0
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "expectPins:0 and ScrollTrigger pin count is 0 (pure modal interaction, no scroll pin); __LAB_OK__ true on init; the overview render paints on [data-render-surface] at non-zero size"
  - "the affordance is obvious: three plus-ring triggers sit on the building, each with an ambient pulse, a hover ring-scale 1.18 + plus rotate-to-cross + label, and focus-visible state"
  - "click a trigger -> the veil COVER ~0.4s power2.inOut -> HOLD ~0.3s (content swapped unseen, NO spinner) -> UNCOVER ~0.45s expo.out, then the rail + framed macro plate fade-up and the locator chip + perimeter draw in last; verified the correct macro render swaps in per element (glazing/pergola/terrace) and the matching spec, two meta cells, caption, and active section-chip fill, the render contents back the claim (no false material)"
  - "close via back button OR Escape replays the veil and hides the overlay (no router, no history mutation); reversible to the overview"
  - "engine laws: transform + opacity (+ stroke-dashoffset for the plate perimeter draw) only; GPU layers (will-change) NOT held persistently, the variant pins the atom's will-change to auto and toggles it transiently in JS only during each one-shot reveal then clears it (clearProps willChange); NO mix-blend, NO backdrop-filter, NO WebGL, NO video.currentTime; reduced-motion -> instant swap, no pulse, no plate draw, still opens/closes"
  - "asset-substitution gate: built on OUR QUADRO renders (day-front overview + terrace-02 glazing / macro-pergola / terrace-04 details), each detail render literally shows the claimed element and material, plus Ukrainian Fedoriv-voice copy, zero em-dash / en-dash"
webgl: false
ease: air
---

# architecture--veil-detail — "Завіса деталі"

A calm architecture overview that lets the visitor walk to one detail at a time. The
building sits whole and graded in the dark; three quiet plus-rings mark the glazing, the
pergola, the terrace. Press one and a dark veil sweeps up, holds a beat while the content
swaps unseen, then sweeps off onto a single material detail: a framed macro render of that
node on a lighter canvas, one sentence of proof on an air rail, two meta cells, a locator
chip with this element dark on a house section. The veil hiding the swap is the whole point,
the drill-down reads as one authored gesture, not a hard cut to a new screen. Each detail
render literally shows the claimed element, the glazing macro is the aluminium glass band,
the pergola macro is timber slats on steel, the terrace macro is the wood-deck roof, so the
proof never contradicts the caption.

## The one engine (no pin)

- `veil-flat-detail-reveal` does everything: the fixed-overlay modal, the COVER -> HOLD ->
  UNCOVER veil, the two-tone rail/canvas, the perimeter draw-in, the back/Escape close. It is
  driven unmodified. Each architectural element is one `unit{}`; its `planSVG` is an inline
  `<image>` of the macro render plus a `path.vfd-plan__peri` framing rule that draws in via
  `stroke-dashoffset` (the atom's signature reveal, kept intact). The architecture-only slots
  (the one-line spec, the two meta cells, the plate caption) are set alongside `open()` and
  ride the rail fade-up.
- No scroll pin. This is a modal interaction, so the section declares `expectPins:0`. The
  base overview render carries `[data-render-surface]`; the probe asserts it painted.

## Markup + call

```html
<section id="combo" class="combo-stage av-stage">
  <div class="av-surface" data-render-surface><img src="renders/day-front.webp"></div>
  <button class="av-hot av-hot--pergola" data-el="pergola">…ring + pulse + plus + label…</button>
  …roof, terrace…
</section>
<div class="vfd-overlay" id="detail"> …veil + page(rail + canvas/plate + locators)… </div>
```
```js
var vfd = VeilFlatDetailReveal.create('#detail', { veilColor:'#16130f', ease:'expo', drawPlan:true });
hotspot.onclick = () => { vfd.open(ELS[key]); /* + set spec/meta/caption */ };
```

## Timing (block 4)

- Veil COVER 0.4s power2.inOut, HOLD 0.3s, UNCOVER 0.45s expo.out (0.16,1,0.3,1); content
  reveal: rail + plate 0.45s air with 0.05s stagger, locators 0.4s air at +0.18s, perimeter
  draw 0.6s power1.inOut. The on-load section copy rises 1.0s air, the triggers stagger in at
  0.12s, the ambient pulse loops 2.4s expo. UI hovers 0.3-0.35s. Not everything one duration.

## Gate

Open `combo-lab.html`, confirm `__LAB_OK__` true with 0 pins and the overview render painted.
Click each trigger: the veil sweeps cover -> hold -> uncover onto the matching macro detail with
its spec line, two meta cells, caption, and active section-chip; Escape / back returns to the
overview. Proven on OUR content: day-front overview + terrace-02 (glazing) / macro-pergola /
terrace-04 (terrace), each render literally shows the claimed element and material so no caption is
contradicted, Ukrainian copy, 0 console errors, 0 pins, the correct render swaps per element and the
modal opens and closes cleanly. will-change is held only during each reveal then cleared (no
persistent GPU layer). reduced-motion -> instant swap, no pulse, no draw.
