---
id: exploded-stack-inspect
name: "Exploded axonometric layer-inspect"
level: 1
kind: component
status: candidate
entry:
  call: "ExplodedStackInspect.create(target, opts)  // target = the stage el/selector. opts.layers = [{ img, label, spec }] top->bottom (roof -> top volume -> facade -> base). The atom BUILDS its DOM (.esi__rig > .esi__layer > .esi__plane>img + .esi__tag; a side .esi__panel column) or adopts pre-seeded .esi__layer markup. opts: { gap, skewX, rotX, parallaxX, scaleStep, isolateLift, recede, dim, blurOthers, entry, entryDur, stagger, ease, accent }."
  module: iife
  returns: "{ set, isolate, destroy }  (set(0..1) = scroll-driven separation if a host pin wants it; isolate(i|null) = focus one layer; under reduced-motion / no-gsap => { set, isolate, destroy } no-ops over a static labelled stack)"
meaning:
  what: "An architect pulls a model apart. N building-component planes (roof / top volume / facade / base+terrace) sit collapsed in an axon-skewed stack; on entry they SEPARATE vertically with depth (translateY + a small parallax x + scaleStep, an exploded-axonometric feel), each plane labelled. Hover/click/focus a plane and it ISOLATES: the chosen layer lifts forward and brightens (filter brightness), the others recede (push back + down, scale down) and DIM + soften (filter blur), and a spec panel reveals that component's material + role. Release (or mouse-leave) re-assembles the deck. PURE transform/opacity/filter, no WebGL/canvas/mix-blend/backdrop."
  when: "An ARCHITECTURE section that should sell HOW the building is built, layer by layer (materials + construction detail) as a single readable diagram, not a carousel of full frames. The 'this studio understands the building' beat: a press-to-inspect exploded view that reads engineered and authored. A different realization of the same storyboard as collage-inspect / anatomy-pins."
  lands: "On entry the building visibly comes apart into stacked, labelled planes; hover a plane and it floats forward and brightens while the rest fall back and blur, and a small panel names its material and role (Вінець: фальцева покрівля). It reads like a model on a table being taken apart to explain the house."
source:
  grammar: "Original synthesis for the QUADRO architecture chapter, in the ERA/Ever architecture-section register (themed reveal + parallax + tab-synced spec swap + custom-cursor-grade hover states, restrained tooling, no-WebGL). Not lifted from one recording; built to the same grammar the teardowns describe (per-component reveal + material/role copy)."
  recording: null
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + (optional) CustomEase. No build step. No WebGL."
webgl: false
motion_props: [transform, opacity, filter]
trigger: "self-driven entry tween (one-shot separation, staggered) + pointer/keyboard isolate; NO scroll pin of its own. owns_pin:false. A host MAY scroll-drive separation by calling the returned set(0..1) from ITS pin."
timing_layer: [B-entrance, C-interaction]
owns_pin: false
owns_scroll: false
page_beat: [material, proof, chapter]
combines_with: [fluid-type-sizing, mask-up-title, section-rise-into-view, splitLines]
anti_combos: [second-pin]
gated_by: [R_perf_limits, R_no_webgl, R_timing_layers]
variants: []
params_ref: null
files: [component.js, component.css, lab.html]
acceptance:
  - "create() BUILDS .esi__rig with one .esi__layer per layer (plane img + tag) and a .esi__panel per layer; data-esi-ready=1 once mounted; window.__LAB_OK__ set by the lab only after the top render (roof) decodes (naturalWidth>0)"
  - "ENTRY: the deck separates once (collapsed -> exploded) via translateY + parallax x + scaleStep, staggered (default 0.09s), ease air; willChange cleared on complete"
  - "ISOLATE: hover/click/focus a layer => that layer lifts forward (isolateLift) + brightens (filter brightness 1.06), others recede (scale recede), dim (opacity dim) and blur (filter blur blurOthers); its .esi__panel.is-on reveals material+role; release/mouse-leave/Esc re-assembles"
  - "engine laws: motion ONLY transform/opacity/filter; NO WebGL, NO canvas, NO mix-blend, NO backdrop-filter; owns_pin FALSE (creates zero ScrollTrigger pins)"
  - "reduced-motion / no-gsap => static labelled exploded stack (no tween, first panel shown); set()/isolate() are safe no-ops; asset-truth: each layer's image is that component (roof=macro-roof, terrace=terrace shot)"
ease: air
note: |
  owns_pin:false by design — this is a press-to-inspect interaction, not a scroll
  engine. If a section wants a gentle scroll-driven separation, the HARNESS owns the
  one pin and feeds set(0..1); the atom never creates a pin. filter (blur/brightness)
  is the allowed depth cue here (transform/opacity/filter only — no mix-blend, no
  backdrop). Built candidate for the architecture--exploded-layers section variant.
---

# exploded-stack-inspect — interactive exploded axonometric

An architect pulls a model apart. Component planes (roof -> top volume -> facade ->
base/terrace) sit collapsed, then SEPARATE vertically with depth on entry. Hover or
click a plane: it isolates (lifts + brightens), the others recede + dim + blur, and a
spec panel names the material and role. Pure transform / opacity / filter.

## Markup + call
```html
<section id="stage"></section>
```
```js
ExplodedStackInspect.create('#stage', {
  layers: [
    { img:'renders/macro-roof.webp', label:'Вінець', spec:'Фальцева покрівля.' },
    { img:'renders/terrace-02.webp',  label:'Скління', spec:'Панорамна тераса.' },
    { img:'renders/day-front.webp',   label:'Фасад',   spec:'Тиньк і теплий камінь.' },
    { img:'renders/aerial.webp',      label:'Основа',  spec:'Цоколь і ділянка.' }
  ]
});
```
The atom builds `.esi__rig > .esi__layer (plane img + tag)` and a `.esi__panel` per
layer. It returns `{ set, isolate, destroy }`.

## Gate
Open lab.html in a real browser. `__LAB_OK__` true once the roof render decodes and the
rig is built. On entry the deck explodes; hover/click a layer to isolate it and reveal
its spec panel; mouse-leave re-assembles. Zero ScrollTrigger pins (owns_pin:false).
Reduced-motion => a static labelled exploded stack.
