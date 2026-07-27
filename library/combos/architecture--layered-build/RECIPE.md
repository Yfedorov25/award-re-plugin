---
id: architecture--layered-build
name: "Дім по шарах"
level: 2
kind: section-variant
status: base
section: architecture
meaning:
  what: "Scroll THROUGH four Z-planes of ONE building read as an architect reads it: 01 ФОРМА the street volume, 02 МАТЕРІАЛ the timber pergola up close, 03 ВІНЕЦЬ the rooftop crown against the sky, 04 ЦІЛІСТЬ the same volume whole from the rear. Each plane grows far/hazy to full-bleed in focus then dissolves as the camera flies through it, frames snapping to slots, a named layer counter advancing with the depth."
  when: "The architecture section of a house or ЖК site where the building is the hero and the readING of its structure is the story, and you have four geometry-consistent renders of ONE building that form an honest sequence: form, then its material, then its crown, then the whole."
  lands: "A felt sense of being walked INTO the architecture, not scanning a flat gallery. The named cue (form, material, crown, totality) tells the visitor they are reading the house the way the architect built it, layer by layer, one continuous gesture."
source:
  grammar: "depth-stack / portal-through, the signed-depth tunnel recorded 1:1 from depth-d3-portal-through.html (camera flies forward along -z, d = i - prog, scale-through + cross-dissolve + depth-haze + parallax text-lag + ken-burns + headline split-reveal + forward-flying counter). Deepened from the sibling architecture--depth-portal by re-ordering the planes into an architect's reading and naming each layer in the chrome."
  recording: null
  registry_ref: []
uses:
  - { atom: depth-stack, job: "owns the single pinned scrub ScrollTrigger; paints the four-plane tunnel (engine variant portal-through), the depth-haze, the parallax text, the forward-flying numeric counter and the rail" }
pin: { owner: depth-stack, count: 1 }
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "exactly one pinned ScrollTrigger, owned by depth-stack via DepthStack.mount (the lab never calls SectionHarness.pin; the named-layer cue uses a NON-pinning ScrollTrigger so the pin budget stays 1). Verified: pins == 1, four .frame planes built."
  - "the four planes read as ONE building in depth, not a slideshow: frame 1 (day-front, the white two-storey volume from the street) and frame 4 (terrace-02, the same volume whole from the rear) are unmistakably the same house; the camera flies THROUGH each plane (scale up + dissolve), reversible on scroll-up."
  - "the named layer cue advances in lockstep with the engine depth counter and rail (01 ФОРМА, 02 МАТЕРІАЛ, 03 ВІНЕЦЬ, 04 ЦІЛІСТЬ); name and number never drift because both read the same progress*(N-1) mapping. Verified across the pin range."
  - "no backdrop-filter, no mix-blend, no animated blur radius: the atom's per-frame backdrop-filter pill and animated filter:blur are overridden OFF in the lab; motion is transform / opacity / static-filter only."
  - "every caption describes the pixels actually on screen (form copy over the street volume, material copy over the pergola macro, crown copy over the rooftop, totality copy over the whole rear), Ukrainian Fedoriv voice, sparse 2-3 word titles, ZERO em/en-dashes anywhere visible."
  - "reduced-motion falls back to the engine's flat per-plane jump (reducedFrame); window.__LAB_OK__ true with a decoded render on [data-render-surface] (#pad) and 0 real console errors."
  - "GATE B smooth under 4x CPU: layer de-promotion (will-change:auto) lifts the 30fps compositor cap; killing the animated filter-blur + both blurred shadows + the animated grain removes per-tick paint; a raster cull (visibility:hidden on planes the engine faded below 0.1 opacity) removes the hand-off raster spike. Verified 60fps, jank ~3.5% (spec 28ms-step, jank>25ms bar) and ~3-5% on a realistic fling, both well under the <6% bar."
webgl: false
ease: air
---

# architecture--layered-build, "Дім по шарах"

A section-variant on the SectionHarness binder that cites the **depth-stack** atom through
its turnkey engine variant **portal-through**. depth-stack is a SHARED FRAME (base engine,
no per-frame math); the portal-through variant base-imports `component.js` and supplies the
tunnel painter `applyTunnel(prog)` plus the `DepthStack.mount(...)` call, so this lab reuses
that verified engine and its CSS **exactly**. This is the DEEPENED sibling of
architecture--depth-portal: same engine, same byte-faithful CSS, but the four planes are
re-ordered into an honest architect's reading of the building and the chrome names each layer.

## What it does

The building is dealt as a TUNNEL of planes along `-z` (CSS `perspective` + `preserve-3d`,
supplied by the portal-through variant CSS, no WebGL). `prog` (0..N-1, continuous) is the
camera's position in the deck; for plane `i` its signed depth is `d = i - prog`. Scroll DOWN
moves the camera FORWARD: the next plane grows from far/hazed to full-bleed-in-focus, then
blows up and dissolves as you fly THROUGH it. The four planes are all the SAME white
two-storey QUADRO volume, ordered as a real reading of architecture, not a random gallery:

1. **Спершу форма**, `day-front.webp`, the clean white two-storey volume met from the street, the FORM.
2. **Потім матеріал**, `macro-pergola.webp`, that building's dark timber pergola in extreme close-up, the warm tactile MATERIAL.
3. **Вище вінець**, `macro-roof.webp`, the rooftop terrace from above (decking, soft furniture, the white parapet volume, the pool edge), the CROWN where the house meets the sky.
4. **І цілість**, `terrace-02.webp`, the SAME volume whole from the rear, full-height glazing in two storeys, the TOTALITY.

Form, then its material, then how it crowns the sky, then the whole: the depth IS the
architecture story, one structure read in layers as one gesture. Each caption describes the
pixels actually on screen.

## The deepening (what changed over architecture--depth-portal)

The sibling swapped only media and copy. This variant goes one step further, **only inside
the lab `<style>` + the wiring, never the engine**:

- **An architect's order.** The planes are sequenced form -> material -> crown -> totality
  (not facade -> material -> roof -> whole-from-front). Frame 3 is the rooftop crown
  (`macro-roof.webp`), so the reading climbs the building before pulling back to the whole.
- **A NAMED layer counter.** The engine ships a numeric forward-flying counter; this variant
  adds a top-left cue that names each layer (`01 / 04  Форма`, then `Матеріал`, `Вінець`,
  `Цілість`). The serif italic name re-types in (`yPercent 36 -> 0`, opacity 0 -> 1, 0.66s,
  ease **air**) at each hand-off and the whole cue lifts/dims a hair at the seam on the same
  forward-fly `sin(frac*PI)` curve as the engine counter. It is driven by a **NON-pinning**
  ScrollTrigger over the same stage (same `+= innerHeight*N` budget, `scrub:0.7`), so the
  number and name never drift from the engine, and the pin budget stays exactly 1. The
  engine's own plain numeric hint is parked on a `display:none` node so it stays harmless.

## Pin ownership (the load-bearing rule)

This is an **ENGINE** variant. `DepthStack.mount` (called via `DepthPortalThrough.init`) owns
the **single** pinned scrub ScrollTrigger (`scrub:0.7`, snap `1/(N-1)`, the `air` ease) plus a
non-pinning entry ScrollTrigger that hands frame 0 in over the hero. The lab therefore does
**not** call `SectionHarness.pin()`; it only `SectionHarness.declare({ pinOwner:'depth-stack',
expectPins:1, atomsCited:['depth-stack'] })`. The named-layer cue is a second ScrollTrigger
but it does **not** pin, so `ScrollTrigger.getAll().filter(t=>t.pin).length === 1`.
`[data-render-surface]` sits on `#pad`, the tunnel pad holding the injected frame `<img>`s, so
the honest probe asserts a decoded render there.

## Skin / motion

- Field, grade, hero, outro, rail and `.serif`=Fraunces come from depth-stack `component.css`.
- The tunnel geometry, full-bleed render plane, depth-haze scrim, lower-left text column and
  forward-flying numeric counter come from `variants/portal-through/variant.css` (byte-faithful).
- The named layer cue is the only new chrome (lab `<style>`): Inter tabular index + accent rule
  + Fraunces italic name, transform/opacity only.
- Ease: **air** (`cubic-bezier(0.22,1,0.36,1)` in the scaffold; the engine's own snap uses its
  internal `air` `0.25,0.74,0.22,0.99`). Reduced-motion: the base falls back to a flat jump
  between planes via the engine's `reducedFrame`.
- Copy: Ukrainian, Fedoriv-voice, sparse, premium, proof not promises. Zero em/en-dashes.
  Sparse 2-word titles; the render is the hero with generous distance between text and image.

## Lab-level overrides (this variant's own `<style>`, never the atom)

The cited atom is read-only, so three fixes live in the lab `<style>` (which loads after the
atom CSS and wins the cascade). Skin/perf only, no engine fork:

1. **Ban fix.** `variant.css:95` puts `backdrop-filter:blur(7px)` on the per-frame `.frame__tag`
   pill (a registry ban AND a per-frame recompositing cost on a scaling 3D plane). The lab forces
   `backdrop-filter:none` and gives the pill a flat translucent tint.
2. **Smoothness fix (GATE B).** A 4x-CPU timeline trace proved the cost is `RasterTask` + image
   decode, not script (~0.4s of script over a ~5s sweep). Four levers, all in the lab `<style>` / its
   own JS, no engine fork:
   - **De-promotion.** The atom forces `will-change:transform,opacity,filter` on `.frame` (+ on
     `.frame__img` and `.word>span`): up to ~16 permanent GPU layers in ONE preserve-3d context. Under
     4x throttle the compositor saturated and locked to a clean 30fps wall (median 33.3ms). Setting
     `will-change:auto` on every frame layer lets the browser promote ONLY the 1-2 planes actually
     transforming each tick. Measured: median 33.3ms -> 17.0ms, fps 30 -> ~58.
   - **Kill the per-tick paints.** `filter:none !important` stops the engine's animated `brightness()
     blur(Npx)` radius from re-rasterizing each plane; `box-shadow:none` removes the blurred drop-shadow
     that re-rastered as the plane scaled 0.62 -> 1.9; the atom's `.frame::after` 170px-blur inset shadow
     is replaced by a flat composited `linear-gradient` floor-shade + a crisp 1px inset ring.
   - **Static grain.** The base grade animates a fullscreen noise layer (`steps(5)` infinite); the lab
     stops the animation (`animation:none`) so it no longer recomposites a viewport-sized layer during
     the scrub. The film-grain texture stays; only the imperceptible 4% nudge is dropped.
   - **Raster cull.** A light rAF loop (the lab's own `plane-cull` job) reads each plane's INLINE
     `style.opacity` (string read, NO `getComputedStyle`, NO forced layout) and toggles
     `visibility:hidden` below 0.1. A plane the engine has faded to near-zero is invisible behind the
     haze but was STILL rastering its full-bleed image at the 1.9x fly-through scale; dropping it from
     the raster path removes the hand-off spike. Measured (4x CPU, fling): p90 33ms -> 18.5ms,
     jank>25ms ~13% -> ~3.5%, 60fps.
   The ken-burns bleed is also trimmed 114% -> 106%, idle images get `translateZ(0)` (GPU texture, no
   re-raster on scale). Depth still reads via the engine `.frame__haze` overlay + the inset ring + the
   floor-shade. All motion stays transform/opacity, no WebGL, one engine-owned pin.
3. **Legibility fix.** The atom only ships a text scrim at <=480px; the lab adds a soft lower-left
   `linear-gradient` scrim behind `.frame__text` at desktop too (opacity only, no blur) and lifts the
   desc colour from a muted tan to a near-cream, so the caption reads over the bright material macro.

## Author notes

Swap only `FRAMES` (media + copy) and `LAYERS` (the named cue) to re-skin for another building;
keep the two arrays in the same order so the cue never drifts. Keep N between 3 and 5 (the engine
snaps to `1/(N-1)` slots). Use 3 to 5 of the strongest geometry-consistent renders **of ONE
building** (frame 1 and the final frame must be unmistakably the same house, this is the recorded
a3/orrery failure mode: distinct subjects passed off as one). Order them as a real architectural
reading (form, then its material, then how it crowns the sky, then the whole), not a random gallery.
Every caption must describe the pixels actually on screen.
