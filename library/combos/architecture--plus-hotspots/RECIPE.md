---
id: architecture--plus-hotspots
name: "Розглянь зблизька — facade + plus-hotspots that zoom into the material"
section_role: architecture
section: architecture
status: base
title: "Розглянь зблизька"
kind: combo
level: 3
entry:
  call: "Markup-first. A frontal facade (renders/day-34.webp) carries FOUR .ph-spot '+' hotspots, each positioned over its real element. One veil-flat-detail-reveal modal (#detail) is created once; each hotspot calls detail.open({ planSVG:<macro-template-id> }) so the engine copies the matching macro into .vfd-plan (= [data-render-surface]) during the veil HOLD and uncovers onto it. No scroll pin."
  module: iife
  returns: "veil-flat-detail-reveal -> { open(unit), close(), current, isOpen, destroy }"
uses:
  - { atom: veil-flat-detail-reveal, job: "Own the calm detail reveal: dark COVER -> HOLD (swap the macro + rail copy unseen) -> UNCOVER onto a BIG full-bleed macro of the clicked element, with a back-to-facade close. One overlay node, content swapped per hotspot." }
pins:
  owner: none
  count: 0
meaning:
  what: "A frontal QUADRO facade with FOUR small '+' hotspots, each ANCHORED to a real exterior element (white roof parapet, upper full-height glazing, the timber soffit of the upper-storey overhang, the lower terrace behind the glass). Clicking a '+' fires the veil-flat-detail-reveal modal — a dark veil covers, the content swaps unseen, the veil uncovers onto a BIG full-bleed MACRO of THAT exact element plus a one-line material spec, then a close returns to the facade. From the building, into the material, and back."
  when: "The ARCHITECTURE chapter, when the building must be inspected as a thing made of materials, not described in prose. The facade stays the hero; the visitor chooses what to examine, and each choice pays off with the genuine material at full bleed. The 'this was actually built' beat."
  lands: "You see the whole facade, calm cream dots breathing on it. You press the dot on the roofline and a dark wipe lands you on the rooftop deck; press the dot on the glass and you land on the glazed volume; the timber soffit dot lands on the timber soffit; the terrace dot lands on the decking and furniture. Each '+' opens its own element, never a neighbour. It reads inspected and true, not a slideshow."
not_when: "A cinematic single full-bleed frame with nothing to inspect (use a section-pager / media-step-switch). A day-to-night mood beat (that is a different section — architecture sells the building, not the hour). A scroll-scrubbed reveal (this is click-driven; no pin). A floor-plan unit picker (that is visual-search). If the macros are not genuinely the clicked element, do NOT ship — correspondence is the contract."
source:
  grammar: "veil page-transition as a single-page modal (EVER visual-search Level 3, harvested in D_ever_visualsearch_video.md §4) re-pointed from an apartment detail to a MATERIAL detail: the rail carries a material narrative instead of price, and the canvas carries a full-bleed macro instead of a plan SVG. Hotspot-on-facade affordance + macro correspondence is the Silver Pinewood 'inspect the building' register (D_SilverPinewood_architecture.md: typed-plugin rich content over a calm document)."
  recording: null
  registry_ref: ["T-veil-flat-detail-reveal", "T-ever-visualsearch-L3"]
gated_by: [R_anti_combos, R_perf_limits, R_one_scroll_owner, R_marker_content_correspondence, R_asset_truth]
webgl: false
ease: air
motion_props: [transform, opacity, clip-path]
acceptance:
  - "CORRESPONDENCE (the contract): each '+' reveals EXACTLY its own element. roof-parapet '+' -> macro-roof.webp (rooftop deck); upper-glazing '+' -> terrace-02.webp (glazed volume); timber-soffit '+' -> macro-pergola.webp (timber soffit + posts); lower-terrace '+' -> macro-table.webp (terrace decking + furniture). No '+' opens a neighbour's element."
  - "ASSET TRUTH: four BIG full-bleed macros, each genuinely the named element and visually DISTINCT from the others (top-down deck / 3-quarter glazed volume / soffit underside / decking close-up). No two near-identical shots, no cars-as-architecture."
  - "the veil-flat-detail-reveal atom owns the reveal: dark COVER (~0.42s power2.inOut) -> HOLD (~0.32s, macro + rail copy swapped unseen, no spinner/percent) -> UNCOVER (~0.48s expo.out) onto the macro; close replays the veil back to the facade. One overlay node, data swapped per hotspot."
  - "INTERACTIVE, no scroll pin: declare({pinOwner:'none', expectPins:0}); ScrollTrigger pin count is 0; the section paints a [data-render-surface] (the macro in .vfd-plan)."
  - "engine laws: transform / opacity / clip-path only; GPU layers; will-change cleared after the one-shot dot entrance and on close; NO WebGL, NO mix-blend, NO backdrop-filter; reduced-motion -> instant swap, dots static, still opens/closes."
  - "copy: Ukrainian, Fedoriv voice, proof-not-promises, ZERO em/en-dash; title 'Розглянь зблизька'; each detail has a one-line material spec (90-200 chars range honoured); the building is the hero."
gate:
  probe: "Open combo-lab.html on a fresh port in a real browser. __LAB_OK__ true once ready (atom ran, [data-render-surface] painted a decoded macro, 0 pins, 0 real console errors). Then click EACH '+' and confirm by eye that the macro that lands IS the element the dot sits on (roof->deck, glazing->glazed volume, soffit->timber soffit, terrace->decking). Confirm the veil cover/hold/uncover plays and close returns to the facade."
note: |
  Replaces a weak 'anatomy' architecture variant that failed marker-content correspondence
  (a number on the glazing revealed a terrace). Here correspondence is enforced by construction:
  each hotspot's data-spot key maps 1:1 to a macro template id, and the four macros are the four
  genuinely distinct, true elements. The atom is re-pointed from EVER's apartment detail to a
  material detail (rail = material narrative, canvas = full-bleed macro instead of a plan SVG).
---

# architecture--plus-hotspots — "Розглянь зблизька"

A frontal QUADRO facade carries four calm "+" hotspots, each on a real element. Click
one and the veil-flat-detail-reveal modal plays a dark cover -> hold -> uncover and lands
on a BIG full-bleed macro of THAT element, with a one-line material spec, then closes back
to the facade. The building is inspected, not described.

## Correspondence (the whole point)
| "+" sits on | reveals (macro) | what it is |
|---|---|---|
| white ROOF parapet (top band) | renders/macro-roof.webp | rooftop deck, top-down |
| upper GLAZING band (dark glass) | renders/terrace-02.webp | glazed volume, 3/4 exterior |
| timber SOFFIT of the overhang (left) | renders/macro-pergola.webp | timber soffit + metal posts |
| lower TERRACE behind the glass (left) | renders/macro-table.webp | terrace decking + furniture |

Each dot's `data-spot` maps 1:1 to a macro template id, so a "+" can never open a neighbour.

## Markup + call
```html
<div class="ph-frame">
  <img class="ph-facade" src="renders/day-34.webp">
  <span class="ph-spot" style="left:71%; top:13%;">
    <button class="ph-spot__hit" data-spot="roof">…+…</button>
  </span>
  <!-- glazing / soffit / balcony … -->
</div>
<div class="vfd-overlay" id="detail">…veil + rail + .vfd-plan[data-render-surface]…</div>
```
```js
var detail = VeilFlatDetailReveal.create('#detail', { drawPlan:false, ease:'expo.out' });
btn.addEventListener('click', () => detail.open({ planSVG: 'macro-roof' /* per spot */ }));
```

## Gate
`__LAB_OK__` true once the atom ran, the render surface painted a decoded macro, 0 pins,
0 real console errors. Then eye-verify: every "+" lands on its own material.
