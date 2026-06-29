---
id: architecture--collage-inspect
name: "Колаж, що відкривається"
level: 2
kind: section-variant
status: base
section: architecture
meaning:
  what: "The EVER editorial material-collage — round + tall-rect + far-rect tiles drifting at parallax depth behind a giant fluid-fit word 'архітектура', sparse Fedoriv meta, an '01' counter — DEEPENED with an interactive INSPECT layer. Each material tile carries a small '+' affordance; on hover, focus or click the tile reveals a closer view of THAT SAME element under a clip-path circle that grows from the '+', while a one-line spec rises ('термодерево перголи' / 'архітектурний тиньк' / 'терасний настил'). Every spec names a material the building actually wears: white architectural plaster, dark thermo-wood pergola, warm terrace decking. The round and far tiles inspect their OWN material at a closer scale (no render swap, so no geometry jump); the centre hero tile cross-reveals a PAIRED VIEW of the SAME white villa pulled CLOSER (day-front establishing crop to day-02 frontal crop of the identical facade, same plaster planes, same dark glazing, same flat roofline). Three motion layers, ONE pin: scroll counter-parallax (the field breathes open at mid-scroll, re-closes at both ends), the engine's mouse-parallax decor, and the pointer-driven inspect clip."
  when: "The architecture chapter when a single editorial frame is not enough — you want the reader to STOP and read the materials themselves: архітектурний тиньк, термодерево, скло. A passive collage that rewards curiosity with a closer look, the 'this building is made of real things' beat without leaving the page or breaking the composition."
  lands: "A composed editorial collage with a giant word behind it. A small '+' on each tile invites a touch; on hover or click the tile opens a lens onto the material up close and names it in one line, then closes. As you scroll, the whole field eases open and re-settles around its centre. It reads authored and curious, not a static gallery and not a noisy slider."
source:
  grammar: "EVER (ever-live-here.com) Architecture section — measured live: round + tall-rect tiles, a wordmark depth-plane behind showing through the gutters, a top-right meta group, a '+' button and a counter, plus floating decor that mouse-parallaxes at per-element depth. The INSPECT grammar is stolen from Ever's sync-carousel PAIRED VIEWS (the centre tile cross-revealing the same building from a second angle) and Silver Pinewood's HOTSPOT INSPECT (a '+' that opens a lens onto a detail in place)."
  recording: null
  registry_ref: []
uses:
  - { atom: parallax-collage, job: "owns the editorial collage: the tile grid (mixed masks), the wordmark depth-plane behind, and the mouse-parallax of the floating decor. Engine is pointer-driven (rAF + mousemove), creates no ScrollTrigger of its own." }
  - { atom: fluid-type-sizing, job: "sizes the behind-word 'архітектура' to FILL the collage field width (container:#collage, gutter:0, fill:1) at any viewport, no overflow, no layout shift." }
pin:
  owner: parallax-collage
  count: 1
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "Exactly ONE pinned ScrollTrigger (the harness pin). parallax-collage adds no pin (mouse-parallax engine); fluid-type-sizing only sizes type. pins === 1, expectPins:1."
  - "INSPECT lands and is obvious: each material tile shows a 44px '+' hotspot; on hover / focus / click a clip-path circle grows from the '+' (circle(0%) to circle(142%)) revealing the macro while a one-line spec rises (translateY 108% to 0). Click TOGGLES a sticky open; Esc closes; Enter/Space activate the focused tile."
  - "NO geometry jump, NO material lie: round + far tiles inspect their OWN render at a closer scale; the centre tile cross-reveals a geometry-consistent PAIRED VIEW of the SAME white villa pulled closer (day-front to day-02, identical facade); every spec names a material the building visibly wears (тиньк / термодерево / настил), never a material it does not have."
  - "Scroll counter-parallax breathes: tiles travel AMP*depth*dir on sin(p*PI) so the field is COMPOSED at p=0 and p=1 and BALANCED in between (opposite-dir tiles separate symmetrically about the centre, never a one-sided empty band); the wordmark + meta spine slide opposite through the gutters."
  - "Engine laws: transform / opacity / clip-path / filter ONLY; NO WebGL, NO mix-blend, NO backdrop-filter, NO video.currentTime; will-change cleared after the resting composition is set and re-armed only on inspect-enter; prefers-reduced-motion kills the inspect transitions but keeps everything composed and readable."
  - "Built on OUR QUADRO renders (day-front / day-02 / macro-pergola / macro-roof / macro-table) with Ukrainian Fedoriv copy, zero em/en-dash; window.__LAB_OK__ true with 0 real console errors."
webgl: false
ease: air
---

# architecture--collage-inspect — Колаж, що відкривається

DEEPENS variant 4 (material-collage). Keep the EVER editorial collage: round +
tall-rect + far-rect material tiles drifting at parallax depth behind a giant
fluid-fit word `архітектура`, sparse Fedoriv meta, an `01` counter. ADD an
interactive INSPECT layer so the passive collage becomes an exploration.

## The three motion layers (ONE pin)

1. SCROLL counter-parallax (harness pin). Each `[data-tile]` travels
   `AMP * depth * dir` on `breathe = sin(p * PI)` — 0 at both ends, 1 at the
   middle. The field is COMPOSED at entry (`p=0`), opens BALANCED at mid-scroll
   (opposite-`data-dir` tiles separate symmetrically about the centre, never a
   one-sided empty band), and re-settles at exit (`p=1`). The wordmark + meta spine
   slide OPPOSITE through the gutters. transform / opacity only.
2. MOUSE-parallax decor (the cited engine). `ParallaxCollage.init('#collage', …)`
   drifts the floating `[data-deco]` tile toward / away from the pointer at its own
   depth amplitude (rAF + mousemove). It owns NO ScrollTrigger — that is why the
   harness owns the single pin.
3. INSPECT (pointer-driven, authored inline). Each material tile holds a
   `.tile-face` (resting render), a `.tile-macro` (clipped to `circle(0% at + )`),
   a 44px `.tile-plus` hotspot, and a `.tile-spec` caption hidden under a clip. On
   hover / focus / click the clip grows to `circle(142%)`, the face scales 1.04 and
   desaturates a touch, the `+` rotates 45deg to an `x`, and the spec rises from
   `translateY(108%)` to `0`. Click TOGGLES a sticky `[data-open]` (touch + keep);
   Esc closes; Enter/Space activate the focused tile.

## Why the pin stays 1

`parallax-collage` is a pointer-parallax engine (it creates no pin) and
`fluid-type-sizing` only sizes type. The section needs scroll motion, so the
HARNESS owns the single pin: `SectionHarness.pin('#combo', …)` with
`pinOwner:'harness', expectPins:1`. The front-matter records `pin.owner:
parallax-collage` as the collage is the beat the pin serves; mechanically the
harness holds the one ScrollTrigger, count stays 1.

## No geometry jump

The inspect must never cut to a mismatched frame, and never name a material the
building does not wear. Round + far tiles inspect their OWN render at a closer
scale (`--macro-scale` 1.46–1.5, same image, no swap): `macro-pergola` reads as
`термодерево перголи`, `macro-roof` (the rooftop terrace deck from above) reads as
`терасний настил`. The centre hero tile cross-reveals a PAIRED VIEW of the SAME
white villa pulled CLOSER (`day-front` establishing crop to `day-02` frontal crop
of the identical facade: same plaster planes, same dark vertical glazing, same
flat roofline), captioned `архітектурний тиньк` — the dominant material actually
on screen. One heroic inspect that earns the Ever sync-carousel paired-views
lineage with zero geometry jump and zero material contradiction.

## Engine laws

transform / opacity / clip-path / filter only. NO WebGL, NO mix-blend, NO
backdrop-filter over a moving surface, NO `video.currentTime`. `will-change` is
cleared after the resting composition is set and re-armed only on inspect-enter
(then released on `transitionend` when the tile is not hovered / focused / open).
`prefers-reduced-motion` kills the inspect transitions but keeps the macro,
captions and collage composed and readable. Named eases: `air`
cubic-bezier(0.22,1,0.36,1) for the parallax and face scale; expo.out
cubic-bezier(0.16,1,0.3,1) for the inspect clip + spec rise. UI feedback .34s,
the inspect reveal .72s — meaningful durations, not everything one value.
