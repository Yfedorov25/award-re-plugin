---
id: layer-accordion-reveal
name: "Layer accordion reveal (N big renders as vertical slabs side by side, one open at a time; hover a strip -> it expands to a near-full render with its label+spec while the others compress to spines; ban-clean via clip-path inset + translateX, no width/flex tween)"
level: 2
kind: component
status: candidate
entry:
  call: "LayerAccordionReveal.create(target, opts)  // target = the .lar-rack element. Pass panels:[{img,label,spec,kicker,alt}] and the engine builds .lar-slab x N (.lar-shot img + .lar-spine + .lar-plate), or author the slabs and it reads them. opts: { panels, openFlex, defaultIndex, seam, ease, dur, uiDur }."
  module: iife
  returns: "{ open(i), rest(), index, slabs, refresh, destroy }  (or { static:true, ... } under reduced-motion / hover:none)"
meaning:
  what: "A building shown у розрізі as BIG renders side by side: N vertical slabs, one open at a time. At rest each slab is a narrow STRIP with a vertical spine label; HOVER (or focus / click) a slab and it EXPANDS to a near-full render of that component while the others compress to thin spines, its kicker + big serif label + material spec fading in; move to the NEXT slab and that one opens while the previous collapses, a smooth horizontal accordion flow. The owner's exact ask (big renders + hover the next one -> it opens), built BAN-CLEAN: every slab is the SAME fixed full-rack-width layer; the open is a clip-path inset growing + a translateX, NEVER a width / left / flex tween. Because the image is object-fit:cover, a strip shows a true vertical SLICE of the SAME render and the open slab shows the component near-full, so there is no image swap and no geometry jump - the slab you touch is the slab that opens."
  when: "An architecture / construction chapter where the building should be read part by part - its parts are PEER components (Вінець / Пергола / Фасад / Основа) and you want each to open to a big legible render with a one-line material spec, one at a time, without leaving the page or breaking the composition. The 'this is what the house is made of' beat as a tactile horizontal accordion, richer than a static grid and calmer than a slider."
  lands: "You see a row of tall renders, one already opened wide with its name and a line of material spec on it; the rest are quiet vertical strips with a single rotated label. As you move across, whichever you point at glides open to a near-full render while the previous one folds back to a strip - one always open, the row breathing horizontally as you move. It reads engineered and editorial, like flipping through the layers of the building with your cursor."
  not_when: "Items with a clear single hero (use a feature block). A long list to scan (use a grid). More than ~5 slabs (the strips get too thin to read). A surface that must keep native scroll-scrubbing under it (this is a hover/triggered primitive, fine beside a scroll engine but it owns no pin). Touch-primary where hover is unreliable -> it falls back to a static labelled list (you lose the accordion)."
source:
  grammar: "ERA (era.estate) /architecture carouselSync - two linked render carousels handing one architectural view to the next - and Springs (springs.estate) 'Open the doors' clip-path render strip (a seam that travels to reveal the next render), re-cast as a HOVER accordion: the seam that those scroll engines travel becomes a clip-path inset that opens on hover, one slab at a time, with the per-slab label + material spec ERA carries on each frame."
  recording: null
  registry_ref: ["D_ERA_architecture", "D_Springs_architecture"]
stack: "vanilla (CSS-driven states; JS computes the layout + toggles classes; no GSAP, no ScrollTrigger)"
webgl: false
motion_props: [transform, clip-path, opacity, filter]
trigger: "hover / focus / click (triggered primitive; one slab open at rest via defaultIndex)"
timing_layer: [D-interaction]
owns_pin: false
owns_scroll: false
page_beat: [architecture, materials, construction-detail]
combines_with: [fluid-type-sizing, blur-reveal-stagger-title, corner-frame-meta, editorial-act-crossfade]
anti_combos: [hover-over-scrubbed-surface, second-pin]
gated_by: [R_perf_limits, R_no_webgl]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "N big renders as vertical slabs in a .lar-rack, ONE open at a time: at rest defaultIndex is open (its --w ~= openFlex of the rack, its .lar-plate kicker+label+spec shown) and the rest are strips (~ (1-openFlex)/(N-1) each) with a vertical .lar-spine label; only one slab ever carries .is-open"
  - "hover / focus / click / Enter opens a slab and collapses the previously open one; mouseleave the rack restores defaultIndex; aria-expanded tracks the open slab; slabs are keyboard reachable (role=button, tabindex 0)"
  - "BAN-CLEAN open: every slab is a fixed width:100% layer; the open is animated ONLY via transform: translateX(--x) (position) + clip-path: inset(0 calc(100% - --w) 0 0) (visible width) + opacity/filter - NO width/height/top/left/margin/flex is animated; layout (px seam -> %) is computed in JS and re-run on ResizeObserver, never tweened"
  - "correspondence + no geometry jump: each slab's render IS that component and stays the SAME render open or collapsed (object-fit:cover slice -> near-full, no swap); the four are visually distinct (rooftop deck / timber soffit / frontal facade / aerial site)"
  - "engine laws: transform + clip-path + opacity + filter only; will-change: transform, clip-path on the slabs, dropped to auto in the static fallback; NO mix-blend / NO backdrop-filter / NO WebGL / NO video.currentTime; the house air ease cubic-bezier(.22,1,.36,1), open ~620ms / label ~340ms"
  - "reduced-motion / hover:none(touch) -> .lar-static: a labelled list (all slabs even, every label shown, no clip/transform transitions); window.__LAB_OK__ set on init; asset-substitution gate: built on OUR QUADRO renders + Ukrainian copy, zero em/en-dash"
gate:
  probe: "Open lab.html. __LAB_OK__ true (NOT lar-static on a hover-capable desktop). At rest ONE slab is open (~openFlex wide, plate shown) and the rest are vertical strips with spine labels. Hover/focus each strip in turn -> it opens to a near-full render while the previously open one collapses (only one .is-open at a time); confirm the opened render IS the named component (Вінець=macro-roof rooftop, Пергола=macro-pergola timber soffit, Фасад=day-34 frontal facade, Основа=aerial site) - CORRESPONDENCE check. Leaving restores the default. Run the HOVER variant of the smoothness probe (arm the rAF meter, cycle hovers across all slabs), NOT the wheel-scroll variant."
note: |
  NEW atom, owner-approved, built for architecture--section-accordion (a REDO of the
  exploded-layers / anatomy variants that failed on (1) marker-content correspondence
  - a number on the glazing revealed a terrace - and (2) weak visualisation - small
  duplicate crops). This atom fixes both by construction: the render NEVER swaps, so
  the slab you touch is the slab that opens (correspondence is structural, not wired),
  and the open slab is a near-FULL big render (not a crop), each of the four a visually
  distinct component. The ban on animating width/left/flex is honoured by the core
  trick: identical fixed-width layers, opened by clip-path inset + translateX (GPU only),
  the layout math done in JS but never tweened. Distinct from facilities-hover-accordion,
  which is an older CSS FLEX accordion (animates flex-grow - a layout property); this is
  the ban-clean transform+clip-path re-build, with a vertical spine identity on the
  collapsed strips and a big serif plate (label + material spec) on the open slab.
---

# layer-accordion-reveal - N big renders as vertical slabs, one open at a time

A building у розрізі: `Вінець / Пергола / Фасад / Основа` as BIG renders side by side.
At rest one slab is open and the rest are narrow strips with a vertical spine label.
Hover (or focus / click) a strip and it glides open to a near-full render with its
kicker + big serif label + material spec, while the previously open slab folds back to
a strip. One open at a time, a smooth horizontal accordion.

## The ban-clean move (no width / left / flex tween)

Every slab is the SAME fixed `width: 100%` layer stacked at the same origin. JS computes
a layout (the open slab takes `openFlex` of the rack, the rest split the remainder as
equal strips minus a px seam) and writes two CSS vars per slab:

- `--x` - the slab's left edge, in % of the rack -> `transform: translateX(var(--x))`
- `--w` - the slab's VISIBLE width, in % of the rack -> `clip-path: inset(0 calc(100% - var(--w)) 0 0)`

CSS transitions ONLY `transform` + `clip-path` (+ `opacity`/`filter` for the labels).
The image is `object-fit: cover`, so a strip shows a true vertical SLICE of the SAME
render and the open slab shows the component near-full - no image swap, no geometry jump.

## Markup + call
```html
<div class="lar-rack" id="rack"></div>
```
```js
LayerAccordionReveal.create('#rack', {
  openFlex: 0.62, defaultIndex: 0,
  panels: [
    { img: 'renders/macro-roof.webp',    label: 'Вінець',  kicker: '01 · покрівля', spec: '…' },
    { img: 'renders/macro-pergola.webp', label: 'Пергола', kicker: '02 · тінь',     spec: '…' },
    { img: 'renders/day-34.webp',        label: 'Фасад',   kicker: '03 · оболонка', spec: '…' },
    { img: 'renders/aerial.webp',        label: 'Основа',  kicker: '04 · ділянка',  spec: '…' }
  ]
});
```

## Gate (HOVER mode)
Hover/focus each strip in turn: it opens while the previous collapses (one `.is-open` at
a time), and the opened render IS the named component (correspondence). Run the HOVER
variant of the smoothness probe (arm the meter, cycle hovers), not the wheel-scroll one.
Proven on OUR QUADRO renders: rest = slab 0 open ~62% + plate, three strips ~12.7%;
hovering slab 3 opens Основа/aerial while slab 0 collapses; transform+clip-path only;
reduced-motion/touch -> static labelled list; window.__LAB_OK__ true, zero console errors.
