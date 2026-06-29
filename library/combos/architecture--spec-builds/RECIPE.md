---
id: architecture--spec-builds
name: "Аркуш фактів"
level: 2
kind: section-variant
status: base
section: architecture
mode: scroll
meaning:
  what: "A pinned full-bleed MEDIA STEPPER that turns the building's hard facts into visual facts. ONE real QUADRO exterior render is the WHOLE background; four typographic steps float over it, each a DIFFERENT text TYPE, never a uniform benefit 1-2-3 card: (01) a BIG STATEMENT about the FORM, (02) a NUMBER that COUNTS UP as it lands (площа під одним дахом, 0 to 240 м²) with a self-drawing SVG underline (stroke-dashoffset, the ERA / AIR visualizationLines move) settling under the figure, (03) a MATERIAL line that names the fasade surface, (04) a felt QUOTE about the form. Each beat: the TEXT settles FIRST, a clear PAUSE, THEN the media crossfades. Swap is an OPACITY crossfade of two stacked full-bleed GPU layers (outgoing underneath, fully opaque the whole beat; incoming on top, fades 0 to 1) so the media is never see-through, never a seam, never blank."
  when: "The architecture chapter of a ЖК / villa site, where you must sell the BUILDING itself: form, geometry, fasade materials, the count that proves the offer. Use it when the render is strong enough to carry a full screen and the section should read like a spec sheet that breathes, one heroic frame holding the whole sequence rather than a grid of small photos."
  lands: "As you scroll one pinned section, the headline states the form, then a single big number counts up while a bronze line draws itself underneath it, then the surface is named, then a quiet sentence closes the thought, and under each the render quietly crossfades to the matching view. It reads engineered and editorial, a fact sheet you feel rather than read, not a carousel and not a stack of cards."
source:
  grammar: "media-step-switch (BASE msw4a-film-quote, owner-approved) for the pinned full-bleed two-GPU-layer opacity-crossfade stepper. The COUNT-UP + self-drawing underline are stolen from era.estate and aircenter.space (Vide Infra / Tekta): ERA Architecture intro + Materials run self-draw visualizationLines while a figure resolves; AIR Format is a pinned counter-slideshow (js-format-counter, Three towers 14 to 34 floors) and AIR Status / Life count metrics as the media settles. Reproduced with NO WebGL: a real SVG path drawn by stroke-dashoffset and a tabular-num count, both PURE functions of scroll progress."
  recording: null
  registry_ref: ["msw4a-film-quote", "D_ERA_architecture", "D_AIR_architecture"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis 1.1.13 (cdnjs / jsdelivr). No build."
webgl: false
ease: air
motion_props: [opacity, transform, stroke-dashoffset]
uses:
  - { atom: media-step-switch, job: "OWNER. Builds (or, here, wires our pre-built) full-bleed stage; owns the single ScrollTrigger pin; manages Lenis; runs the PURE render(prog) that crossfades the two GPU layers, fades the four moments one at a time (text settles, pause, media swaps), and drives the chrome (counter, step ticks, side progress)." }
pin:
  owner: media-step-switch
  count: 1
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "ONE pin, owned by media-step-switch (owns_pin TRUE); the harness pins 0; the count-up + SVG underline ride a SECOND non-pinning ScrollTrigger so the pin budget stays exactly 1. window.__LAB_OK__ true on a fresh server."
  - "FOUR steps, FOUR distinct text TYPES (statement / number / material / quote), woven over the full-bleed render; pre-built DOM so the engine wires OUR Ukrainian architecture copy and skips its default water copy; NO video step (atmosphere is out of scope here)."
  - "Swap is an opacity crossfade of two stacked full-bleed GPU layers in the same rect: verified mid-scroll both layers co-composite briefly (no blank) and resolve to one (no diptych, no seam); ken-burns is a tiny monotonic transform only."
  - "The NUMBER counts 0 to 240 м² AND a real SVG path self-draws (stroke-dashoffset L to 0) exactly as step 02 settles, both PURE functions of scroll progress, reversible on scroll-up; verified at frac 0.30 (num 171, offset 120) and frac 0.60 (num 240, offset 0)."
  - "Motion only on opacity / transform / stroke-dashoffset; NO WebGL, NO mix-blend, NO backdrop-filter, NO clip-path on the full surface, NO video.currentTime; Lenis lerp 0.09; 0 real console errors."
  - "Copy is Ukrainian Fedoriv voice, proof not promises, ZERO em-dash and ZERO en-dash anywhere (title, body, aria, comments); reduced-motion / <=820px falls to the engine's static legible deck."
files: [combo-lab.html, RECIPE.md, renders]
---

# architecture--spec-builds — "Аркуш фактів"

The architecture section as a spec sheet that breathes. The media-step-switch
engine pins one full-bleed QUADRO render and runs its PURE `render(prog)`; over
it, four steps land one at a time, each a different text TYPE, so the eye never
settles into a 1-2-3 card rhythm. The render is the hero; the type lives on the
rails with generous air.

## The four beats (one pinned scroll, engine-owned)
- **01 BIG STATEMENT** about the form. Huge serif headline, lower-left, almost no
  body. The whole building fills the frame (`renders/day-front.webp`).
- **02 NUMBER / FACT** that counts up. One big figure resolves 0 to 240 with the
  unit `м²`, and a bronze SVG line **draws itself** under the figure
  (`stroke-dashoffset` from the path length to 0). The render crossfades to the
  roof-terrace context (`renders/terrace.webp`) so the number sits on its proof.
- **03 MATERIAL** line. A quiet centred italic line names the fasade surface
  (тиньк, термодерево, темний алюміній) over the wood-decking macro
  (`renders/macro-roof.webp`). A distinct TYPE: not a statement, not a number.
- **04 QUOTE**. A felt sentence between two thin bronze rules, back over the whole
  building (`renders/day-front.webp`) so the thought closes where the form began.

## Why this is one engine, not five layered effects
Every motion is owned by media-step-switch: the two-GPU-layer opacity crossfade,
the one-at-a-time moment fades (text settles FIRST, a PAUSE, then the media
swaps), and the chrome. The single addition is the count-up and the self-drawing
underline, and they are NOT a second pin: they ride a second NON-pinning
ScrollTrigger over the same range, mirroring the engine's beat math so they are a
PURE function of the same scroll. Pin budget stays exactly 1.

## The stolen grammar (NO WebGL)
ERA's Architecture and Materials runs draw `visualizationLines` while a figure
resolves; AIR's Format is a pinned counter-slideshow ("Three towers 14 to 34
floors") and AIR Life / Status count metrics as the media settles. Both are
WebGL-free here: a real SVG `path` drawn by `stroke-dashoffset` and a
`tabular-nums` count, each a pure function of progress, reversible on scroll-up.

## Render discipline (geometry-consistent, no jump)
All three renders are the SAME white modern house: the whole volume, then its
roof-terrace context, then the terrace decking macro, then a return to the whole.
The brick-villa renders (`dn-ext-day.webp`) were deliberately NOT mixed in, since
they are a different property and would read as a geometry jump in a crossfade.

## Gate (run on a fresh server)
`window.__LAB_OK__` true; exactly 1 pinning ScrollTrigger (engine-owned); the four
`.moment` blocks + two `.layer` surfaces present; `[data-render-surface]` (layerA,
the eager day-front render) painted. Mid-scroll: at frac 0.30 the number reads 171
with the underline at offset 120 and both layers co-compositing; at frac 0.60 the
number is 240 with the underline fully drawn (offset 0) and step 03 active. Proven
on OUR content: 4 Ukrainian steps, 0 console errors, pin count 1.
