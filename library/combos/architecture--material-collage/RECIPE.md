---
id: architecture--material-collage
name: "Прості обриси, виразні матеріали"
level: 2
kind: section-variant
status: base
section: architecture
meaning: { what: "An EVER-class editorial collage: a giant fluid-fit word behind, MATERIAL and clean-form render tiles drifting at different depths as you scroll, with sparse premium meta copy. Every tile foregrounds a material (timber, glass, panel) or the building's form, never cars or a generic gallery.", when: "The architecture beat, when the building's materials and form are the argument and the section should read as a composed editorial spread, not a spec sheet.", lands: "The visitor feels the building is considered and expensive, materials first, calm and unhurried, the render is the hero." }
uses:
  - { atom: parallax-collage, job: "render+seam/depth" }
  - { atom: fluid-type-sizing, job: "size the behind-word to fill the field" }
pin: { owner: parallax-collage, count: 1 }
webgl: false
ease: air
source:
  grammar: "EVER architecture editorial collage: parallax material tiles behind a fluid-fit wordmark"
  recording: null
  registry_ref: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "one engine pin (parallax-collage)"
  - "material/exterior tiles drift at distinct parallax depths"
  - "fluid-fit behind-word fills the field"
  - "fps>=50 jank<8% under 4x CPU"
---

# architecture--material-collage

The EVER "Architecture" editorial collage, rebuilt on QUADRO renders. A giant
fluid-fit wordmark (`архітектура`) sits behind as a depth-plane, three MATERIAL /
clean-form tiles (a round timber detail, a tall facade rect, a smaller far material
rect) compose the field, and sparse Fedoriv meta copy (eyebrow, serif title, sub,
counter) frames the spread. The render is the hero; text keeps generous distance.

Materials-first is the whole point, so every tile foregrounds a material or the
building's form, never cars or a generic property gallery:
`macro-pergola` (timber slats + steel), `day-34` (a CLEAN rear elevation: glass +
dark panel + white slab, NO cars, the building is the centre of mass, the centre
rect uses `object-position: center 42%` to frame the facade band and trim sky +
foreground), `macro-roof` (timber-decking macro), `macro-table` (timber-deck detail,
the floating decor).

## How it is wired

The cited `parallax-collage` atom is a **mouse-parallax** engine, not a scroll
engine: it runs an rAF lerp on the floating decor and the wordmark from the pointer
position and creates **no ScrollTrigger of its own**. So this section uses the
MANUAL pin shape: `SectionHarness.pin('#combo', { end: '+=130%', scrub: 0.8 })`
owns the section's single pin, and its `onUpdate(p)` drives a **counter-parallax
breathe**: a `sin(p·π)` envelope opens the field at mid-scroll and re-closes it
toward both ends, so the composition reads composed at entry (`p=0`) and exit
(`p=1`) and stays balanced in between. Each `[data-tile]` carries `data-depth`
(deeper tiles travel further) and `data-dir` (`±1`, so neighbouring tiles separate
symmetrically about the centre, the field never shoves to one side leaving an
empty band). Base amplitude is a real, visible `96px·depth`. The wordmark and meta
spine slide OPPOSITE the tiles, revealing through the gutters (`y`/`opacity`/
`letterSpacing` only). On top of that, `ParallaxCollage.init('#collage', …)` adds
the native pointer-parallax of the decor + wordmark. `fluid-type-sizing` sizes the
behind-word to fill the field.

**Scroll-perf law (no persistent will-change):** the cited atom promotes its decor
and wordmark to compositor layers on mount and never clears them. The atom is not
modified; the lab clears those leftover `will-change` hints (`-> auto`) right after
init, and the variant `<style>` no longer hard-codes `will-change` on the spine.
The compositor re-promotes on demand during the rare pointer-parallax frames.

Because the engine owns zero pins, the contract is declared `pinOwner:'harness',
expectPins:1` (the front-matter `pin.owner` names the cited atom, but at runtime the
single pin is the harness pin, there is exactly one). `[data-render-surface]` sits
on `#collage`, the `.pc-stage` that holds the tile `<img>`s; the four chosen renders
are real, decoded QUADRO files (verified `naturalWidth > 0` in the lab gate).

## Motion law

`air` ease. Transform/opacity only on the tiles, wordmark and spine. NO WebGL, NO
mix-blend-mode, NO backdrop-filter, no width/height/top/left animation. Reduced
motion: the collage rests composed (the engine skips parallax; the pin's drift is
negligible at rest).

## Renders

`renders/macro-pergola.webp` (round timber detail), `renders/day-34.webp` (clean
facade rect, no cars), `renders/macro-roof.webp` (far material macro, timber
decking), `renders/macro-table.webp` (decor, timber-deck detail).
`renders/macro-roof.webp` / `renders/macro-table.webp` are interchangeable material
macros; `renders/day-34-portrait.webp` is an alternate facade crop.
