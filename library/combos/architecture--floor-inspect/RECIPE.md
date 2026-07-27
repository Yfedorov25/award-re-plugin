---
id: architecture--floor-inspect
name: "Поверхи"
level: 2
kind: section-variant
status: candidate
section: architecture
meaning:
  what: "An INTERACTIVE architecture section on ONE building render. A single <svg> is locked to the render's intrinsic pixels (viewBox 0 0 1920 1080, preserveAspectRatio matching the img fit) and over the facade sit THREE hand-traced perspective quads, one per storey (roof / living level / entrance). Hover or focus a storey and a terracotta band lights along it, riding the building's slight 3/4 slope, with a darker top-edge stroke, while ONE left-anchored tooltip card tweens its y to that storey and names it. A left rail of three ticks mirrors and drives the same bands. No scroll pin: the interaction IS the section."
  when: "The architecture beat of a single-house ЖК (a townhouse, a villa), where the job is not 'pick a flat to buy' but 'read how this house is built, storey by storey'. Use it when there is one clean near-elevation render whose levels are legible (a roofline, a glazed storey, a ground entrance) and you want the visitor to EXPLORE the vertical organisation by pointing at it, instead of reading a bullet list of specs."
  lands: "The render is the hero and looks like a still photograph until you move the pointer. Then a single storey lights terracotta exactly along the facade, a small warm card slides to that level and names it (Дах / Житловий / Вхід), and a thin index on the left lights in step. It reads like an architect walking you up the building, precise and quiet, not a gimmick."
source:
  grammar: "Silver Pinewood #architecture, a hand-built inline-SVG SELECT whose highlight is gravity / perspective-locked to the building geometry (no map provider, no WebGL, the quiet-luxury restraint of ONE interactive moment done exactly). Crossed with EVER visual-search Level 1, the per-floor pick with the razor-clean band our smarts lacked. Turned here on a SINGLE house: storeys, not flats."
  recording: null
  registry_ref: ["T-cleanfloor-ever", "D_SilverPinewood_architecture"]
uses:
  - { atom: clean-floor-hover-select, job: "Owner. Paints the day-front render, locks the SVG viewBox to the render pixels with preserveAspectRatio matching the contain fit, builds the hand-traced perspective storey polygons from bands[], runs the hover/focus terracotta light + dark top-edge stroke, and tweens the ONE tooltip card y to the hovered storey anchor. Creates NO ScrollTrigger." }
pin:
  owner: none
  count: 0
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "expectPins:0 and ScrollTrigger.getAll().filter(pin).length === 0, the section owns NO scroll pin; the affordance is pure pointer/focus interaction"
  - "the SVG viewBox is locked to the render's intrinsic 1920x1080 and preserveAspectRatio matches the img fit (contain/meet), so SVG user-units == image pixels at every viewport; verified by eye that each band RIDES the real facade (no float, no cover-crop)"
  - "the three storey polygons are PIXEL-traced to THIS render (Дах along the flat-roof parapet crown, Житловий over the glazed upper storey, Вхід over the recessed ground entrance), each a TRUE perspective parallelogram: the white front face is bounded by a vertical near corner at x=518 and a vertical right corner at x=1582, and the roof parapet descends right (518,269 to 1582,385, slope ~0.108) with every storey line parallel-ish to it, so no band is an axis-aligned slab and no band floats over sky, trees, road or the neighbour house"
  - "hover/focus lights a terracotta band (fill-opacity .42) + dark top-edge stroke and the ONE tooltip card tweens its y (.18s, power3.out) to the storey's anchor; the left rail tick lights in step (reciprocal feedback)"
  - "motion is fill-opacity / stroke-opacity / transform / opacity ONLY; no width/height/top/left; no WebGL, no mix-blend, no backdrop-filter; the affordance pulse and the card clear their will-change after settling"
  - "reduced-motion / <=820px -> the atom's own floor-button list (render stays a visual, the rail + hint hide); window.__LAB_OK__ true on real QUADRO render (day-front.webp) + Ukrainian copy, 0 console errors"
webgl: false
ease: air
---

# architecture--floor-inspect, "Поверхи"

The architecture section that reads the BUILDING storey by storey, by letting the
visitor point at it. The render is the hero; the only interactive moment in the
section is the storey light, done exactly.

## The single move (one render, one svg, three quads)
- One `<img class="cfh-img">` paints `renders/day-front.webp` (the clean near-elevation
  of the QUADRO townhouse), `object-fit: contain` so the WHOLE facade is always visible
  and is never cover-cropped (the building is the sell).
- One `<svg class="cfh-floors">` sits exactly over it, `viewBox="0 0 1920 1080"` LOCKED
  to the render's intrinsic pixels with `preserveAspectRatio` matching the img fit. That
  is the anti-crooked guarantee: SVG user-units equal image pixels at every screen size,
  so a polygon traced over the facade rides it at any viewport.
- Three storey polygons, PIXEL-traced ONCE over the real render (PIL luminance scan, never
  guessed): `Дах` along the flat-roof parapet crown, `Житловий` over the glazed upper
  storey, `Вхід` over the recessed ground entrance. Each is a TRUE perspective parallelogram
  riding the box: the white front face has a vertical near corner at x=518 and a vertical
  right corner at x=1582, the roof parapet descends right (518,269 to 1582,385) and every
  storey line runs parallel-ish to it, so the bands never float over sky, trees or road.

## The interaction
- Hover or focus a storey: a terracotta band lights along it (fill-opacity .42, CSS
  transition .16s) with a darker top-edge stroke, and the ONE left-anchored tooltip card
  tweens its y (GSAP, .18s, power3.out) to that storey's anchor and names it.
- A left RAIL of three ticks mirrors the bands and drives them back: hovering a tick calls
  the atom's `set(floor)` and lights the same band + card, so the index and the building
  speak to each other (reciprocal feedback).
- A one-time, reduced-motion-gated pulse on the living band after paint makes the
  affordance discoverable on a still screen, then clears with no residual state.

## Pin shape
NONE. `clean-floor-hover-select` is a pointer/GSAP engine and creates no ScrollTrigger;
the section needs no scroll choreography. `declare({ pinOwner:'none', expectPins:0 })`.

## Engine laws
SVG fill/stroke + DOM transform/opacity + GSAP only; GPU; will-change on the card cleared
after it settles. NO WebGL, NO mix-blend, NO backdrop-filter, NO animating width/height/
top/left. Verified: `__LAB_OK__` true, 0 pins, 0 console errors, and by eye each band rides
the real facade across the three storeys (Дах / Житловий / Вхід) on day-front.webp.

## Copy (Fedoriv voice, zero em/en-dash)
- eyebrow: `QUADRO · Архітектура`
- title: `Поверхи`
- hint: `Наведіть на рівень будинку, щоб роздивитися, як він влаштований.`
- storeys: `Дах` / `Житловий` / `Вхід`, each with one sparse spec line.
