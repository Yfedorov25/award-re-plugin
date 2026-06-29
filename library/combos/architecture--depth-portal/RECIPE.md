---
id: architecture--depth-portal
name: "Крізь шари дому"
level: 2
kind: section-variant
status: base
section: architecture
meaning: { what: "Scroll THROUGH layered planes of the building (facade, material macro, roofline, whole house) sitting at different Z-depths, one continuous signed-depth gesture, frames snapping to slots.", when: "Architecture section of a house/ЖК site where the building is the hero and the structure-in-layers reading itself is the story; you have 3 to 5 strong exterior/material renders.", lands: "A felt sense of going INTO the architecture: the visitor reads the house the way an architect does, layer by layer, instead of scanning a flat gallery." }
uses:
  - { atom: depth-stack, job: "render+seam/depth" }
pin: { owner: depth-stack, count: 1 }
webgl: false
ease: air
source:
  grammar: "depth-stack/portal-through: scroll through layered Z-planes of the building"
  recording: null
  registry_ref: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "one engine pin (depth-stack)"
  - "layered planes read as depth not a slideshow"
  - "no backdrop-filter (atom blur overridden in the lab)"
  - "fps>=50 jank<8% under 4x CPU"
---

# architecture--depth-portal, "Крізь шари дому"

A section-variant on the SectionHarness binder that cites the **depth-stack** atom through
its turnkey engine variant **portal-through**. depth-stack is a SHARED FRAME (base engine,
no per-frame math). The portal-through variant base-imports `component.js` and supplies the
tunnel painter `applyTunnel(prog)` plus the `DepthStack.mount(...)` call, so this lab reuses
that verified engine and its CSS **exactly**; only the media and the copy change.

## What it does

The building is dealt as a TUNNEL of planes along `-z` (CSS `perspective` + `preserve-3d`,
supplied by the portal-through variant CSS, no WebGL). `prog` (0..N-1, continuous) is the
camera's position in the deck; for plane `i` its signed depth is `d = i - prog`. Scroll DOWN
moves the camera FORWARD: the next plane grows from far/hazed to full-bleed-in-focus, then
blows up and dissolves as you fly THROUGH it. Four planes carry the architecture reading,
and they are all the SAME building (the white two-storey QUADRO volume), so the section is
one home read layer by layer, not a gallery of unrelated renders:

1. **Спершу фасад**, `day-front.webp`, the clean white two-storey volume you meet from the street.
2. **Потім матеріал**, `macro-pergola.webp`, that building's pergola timber up close, warm tactile grain.
3. **Вище дах**, `terrace-02.webp`, the SAME volume from the rear: full-height glazing crowned by
   the railed rooftop terrace against the sky (the roofline read).
4. **І цілість**, `terrace.webp`, the SAME house, whole, in daylight from the street, rooftop terrace on top.

The depth IS the architecture story: ONE structure read in layers, scrolled through as one gesture.
Each caption describes the pixels actually on screen (no roofline copy over a furniture render).

## Pin ownership (the load-bearing rule)

This is an **ENGINE** variant. `DepthStack.mount` (called via `DepthPortalThrough.init`) owns
the **single** pinned scrub ScrollTrigger (`scrub:0.7`, snap `1/(N-1)`, the `air` ease) plus a
non-pinned entry ScrollTrigger that hands frame 0 in over the hero. The lab therefore does
**not** call `SectionHarness.pin()`; it only `SectionHarness.declare({ pinOwner:'depth-stack',
expectPins:1, atomsCited:['depth-stack'] })`. `[data-render-surface]` sits on `#pad`, the tunnel
pad that holds the injected frame `<img>`s, so the honest probe asserts a decoded render there.

## Skin / motion

- Field, grade, hero, outro, rail and `.serif`=Fraunces come from depth-stack `component.css`.
- The tunnel geometry, full-bleed render plane, depth-haze scrim, lower-left text column and
  forward-flying depth counter come from `variants/portal-through/variant.css` (byte-faithful).
- Motion is transform / opacity only. Ease: **air**. Reduced-motion: the base falls
  back to a flat jump between planes via the engine's `reducedFrame`.
- Copy: Ukrainian, Fedoriv-voice, sparse, premium. Zero em/en-dashes. Sparse 2-3 word titles;
  the render is the hero with generous distance between text and image.

## Lab-level overrides (this variant's own `<style>`, never the atom)

The cited atom is read-only, so three fixes live in the lab's `<style>` (which loads after the
atom CSS and wins the cascade). They are skin/perf only and do not fork the engine:

1. **Ban fix.** `variant.css:95` puts `backdrop-filter:blur(7px)` on the per-frame `.frame__tag`
   pill (a registry ban AND a per-frame recompositing cost on a scaling 3D plane). The lab forces
   `backdrop-filter:none` and gives the pill a flat translucent tint instead.
2. **Smoothness fix.** The engine's `applyTunnel` writes an animated `filter:brightness() blur(Npx)`
   onto all four full-bleed planes every scrub tick; animating a blur RADIUS re-rasterizes each
   plane every frame and was the dominant jank source. The lab pins `.frame{ filter:none }`, narrows
   `will-change` to `transform,opacity` (no reserved filter layer), trims the atom's 120px-blur
   drop-shadow to a tight one, and reduces the inner-image ken-burns bleed from 114% to 106% (smaller
   backing texture per plane). The depth read is preserved by the engine's own `.frame__haze` opacity
   overlay + the inset edge. Result: 60fps / ~1% jank @4x CPU (was ~15fps / 71%). All motion stays
   transform/opacity, NO WebGL, one engine-owned pin.
3. **Legibility fix.** The atom only ships a text scrim at <=480px; the lab adds a soft lower-left
   `linear-gradient` scrim behind `.frame__text` at desktop too (opacity only, no blur) and lifts the
   desc colour from a muted tan to a near-cream, so the caption reads over the bright material macro.

## Author notes

Swap only `FRAMES` (media + copy) to re-skin for another building. Keep N between 3 and 5
(the engine snaps to `1/(N-1)` slots). Use 3 to 5 of the strongest exterior/material renders
**of ONE building** (frame 1 and the final frame must be unmistakably the same house, this
is the recorded a3/orrery failure mode: distinct subjects passed off as one). Order them as a
real architectural reading (form, then its material, then how it meets the sky, then the whole),
not as a random gallery. Every caption must describe the pixels actually on screen.
