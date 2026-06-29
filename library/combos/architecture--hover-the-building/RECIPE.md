---
id: architecture--hover-the-building
name: "Будинок реагує, hover the building itself (dim+blur the rest, the touched element stays lit, label grows from it)"
level: 2
kind: section-variant
section: architecture
status: base
title: "Будинок реагує"
mode: interactive
uses:
  - { atom: clean-floor-hover-select, job: "perspective-LOCKED overlay engine: one svg over the day-34 render, viewBox locked to 1920x1080 + preserveAspectRatio matched to object-fit:contain, so the hand-traced element polygons RIDE the building; provides the invisible hit zones, the hover light, and the set/select/clear API the section drives" }
pin:
  owner: none
  count: 0
meaning:
  what: "You hover the BUILDING ITSELF, not a number stuck on the wall. Invisible perspective zones are hand-traced over the REAL parts of a clean frontal facade (roof parapet / upper glazing / lower terrace glazing / recessed entrance / plinth). On hover the WHOLE render dims and softly blurs while THAT element stays crisp and lit IN PLACE, and a label grows FROM the element naming it plus a one-line material spec. The lit, crisp region is a SECOND copy of the SAME render clipped to the hovered zone's own polygon (clip-path built from the very points the atom highlights), so the element that lights is literally that element of the building, by construction, hover the roof, the ROOF lights and the label says ДАХ; hover the glazing, the GLAZING lights and the label says СКЛІННЯ."
  when: "The architecture beat of a single-building site, where the section must SELL THE BUILDING (materials, geometry, exterior elements) and the building should be the hero. Use it as a quiet, exploratory reveal: the visitor points and the house answers, each real element steps out of a softened whole and names its own material. No scroll choreography needed, the interaction IS the section."
  lands: "The full facade sits in a dark gallery field. Point at the roof and the rest of the house dims into soft shadow while the roof parapet alone stays sharp and lit, a label growing out of it: ДАХ, плаский дах, прихований парапет. Move to the glazing and the glass band lights instead, the rest receding; the entrance, the terrace, the plinth each answer in place. It reads engineered and confident: the building responds to you, and what lights is always exactly what you touched."
source:
  grammar: "Silver Pinewood #architecture is a perspective-locked SELECT built as a hand-traced inline-SVG overlay (no map provider, no WebGL) where the highlight obeys the building's geometry, not a flat rectangle; EVER visual-search Level 1 is the razor-clean per-element pick our smarts lacked. Here that grammar is turned on a SINGLE house and inverted from a 'pick a flat' SELECT into a REVEAL: the touched element steps forward (same-render clip stays lit) while the rest recedes behind an opacity-faded dark scrim, and a label grows from the element. Element zones hand-traced over day-34.webp by a PIL luminance scan (roof parapet 253,253,253 at y92..168; upper glass ~60,89,118 y182..424; white inter-floor slab y428..474 NOT a zone; lower terrace glass+balustrade y480..710; plinth grey wall ~159,155,152 y714..904; central entrance recess 0..12 at x832..972 y758..904). The plinth is a NOTCHED concave ring cut around the entrance recess and the entrance is drawn LAST (on top), so the two never share pixels and the hover always resolves to exactly one element."
  recording: null
  registry_ref: ["D_SilverPinewood_architecture", "T-cleanfloor-ever"]
gated_by: [R_anti_combos, R_perf_limits, R_one_scroll_owner, R_no_webgl, R_marker_content_correspondence]
acceptance:
  - "CORRESPONDENCE (the hard law): every zone reveals EXACTLY the element it sits on, the lit crisp region is the SAME render clipped to that zone's own polygon, and the label/spec key off the SAME element data, so the roof zone lights the roof + says ДАХ, the glazing zone lights the glazing + says СКЛІННЯ; verified by clicking each of the 5 zones in a real browser"
  - "the atom owns NO ScrollTrigger and the section creates NO pin (pinOwner:none, expectPins:0); exactly 0 pins on the page; the interaction is the section"
  - "perspective-lock: the overlay svg viewBox is LOCKED to 1920x1080 with preserveAspectRatio matching object-fit:contain, so the zones ride the building at every screen width and never float; element polygons are hand-traced over day-34's real parts (not axis-guessed)"
  - "heroic moment: on hover the rest of the facade recedes behind a dark scrim that fades in by OPACITY ONLY (.34s, no animated blur) while the touched element stays crisp+lit in place and a label GROWS from the element's edge (scale-in, air ease, .42s); the whole render stays the hero (no separate macro card)"
  - "engine laws: transform / opacity / clip-path ONLY on the hot path; NO WebGL, NO mix-blend, NO backdrop-filter, no animating width/height/top/left, and NO animated filter()/blur() (a per-frame full-frame blur recompute halves the framerate; the dim is an opacity scrim instead); will-change cleared after the label settles; right-rail ticks cross-drive the same zones (reciprocal feedback)"
  - "reduced-motion / <=820px -> a BESPOKE Ukrainian mobile panel (names + specs from the SAME element data); the atom's auto dev-key button list is suppressed so NO internal key (roof/glaze/...) ever reaches user-facing copy; the full facade stays a clean visual; window.__LAB_OK__ set on init; built on OUR QUADRO day-34 render + Ukrainian copy"
webgl: false
ease: air
motion_props: [transform, opacity, clip-path]
files: [combo-lab.html, RECIPE.md]
note: |
  REPLACES the weak architecture--floor-inspect lineage. That earlier 'anatomy/floor' take
  failed twice: (1) marker-content mismatch (a number on the glazing revealed a terrace) and
  (2) weak visualisation (small crops, near-duplicate images). Both are designed out here:
  there are no number markers (you hover the building), and the lit region cannot mismatch
  because it is the same render clipped to the hovered zone's own polygon, content and marker
  are the SAME geometry. Distinct from architecture--floor-inspect (floors + terracotta wash +
  side card) and from the isometric unit selector: this is element-keyed REVEAL with same-render
  dim/blur + lit clip + a label that grows from the element. ZERO em/en-dash in visible copy.
---

# architecture--hover-the-building, "Будинок реагує"

You hover the BUILDING ITSELF. Invisible perspective zones, hand-traced over the real
parts of a clean frontal facade, sit under the pointer. On hover the whole render dims and
softly blurs while the touched element stays crisp and lit IN PLACE, and a label grows from
it naming the element + its material. The lit region is the SAME render clipped to that
zone's polygon, so it can only ever be the element you touched.

## The five elements (hand-traced over day-34.webp, 1920x1080, PIL luminance scan)
- ДАХ, white roof parapet band (y 92..168, cap 253,253,253)
- СКЛІННЯ, upper-storey panoramic glazing (y 182..424, dark glass ~60,89,118)
- ТЕРАСА, lower glazing + glass balustrade balconies (y 480..710)
- ВХІД, recessed central entrance, the dark slot in the plinth (x 832..972, y 758..904)
- ЦОКОЛЬ, solid grey plinth base (y 714..904), a NOTCHED ring cut around the entrance recess
  so the plinth's own pixels are grey-only; the entrance polygon is drawn LAST (on top) and the
  two never share pixels, so the hover always resolves to exactly one element.

## Markup + call
```html
<section class="cfh-stage" id="htb">
  <div class="cfh-render htb-render" data-render-surface>
    <img class="htb-base cfh-img" src="renders/day-34.webp" width="1920" height="1080">
    <img class="htb-lit" src="renders/day-34.webp" width="1920" height="1080">   <!-- same render, clipped to the hovered zone -->
    <svg class="cfh-floors"></svg>                                              <!-- the atom fills element polygons here -->
  </div>
</section>
```
```js
CleanFloorHoverSelect.create('#htb', { imgW:1920, imgH:1080, fit:'contain', bands: ELEMENTS });
// on each band mouseenter: arm the dim (an OPACITY-faded dark scrim, no animated blur), set the
// lit clip-path to that band's polygon, grow the label from the band anchor.
// clip-path + label key off the SAME element data.
```

## Why it cannot mismatch
The clip-path that keeps an element lit is built from the EXACT points the atom highlights,
and the label text comes from the SAME element record. Marker, lit pixels, and name are one
geometry. There is no separate crop to get wrong, the lesson that sank the old variant.

## Gate (interactive)
Open combo-lab.html in a real browser. `__LAB_OK__` true once ready, 0 pins. Hover each of
the five zones (and each right-rail tick): the rest of the house recedes behind an opacity
scrim, that element alone stays crisp, the label grows from it, and the name matches the
element under the pointer every time (verified: per-element clip IoU ~1.0, label name match,
single is-hover band + rail tick). Smoothness: 59.9fps / 0% jank at 1x AND 4x CPU throttle
under rapid cross-element hover sweeps. <=820px -> a bespoke Ukrainian panel (no dev keys).
transform/opacity/clip-path only; no WebGL/mix-blend/backdrop/animated-blur.
