---
id: hero--tilted-mosaic-world
name: "Світ, зібраний в один настрій"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "A HERO that is not one stock photo but a WHOLE WORLD: 12 varied frame-of-life renders (exteriors, garden, aerial, terrace, material macro, interior, dusk) laid out as a CSS grid and rotated + scaled as ONE rigid tilted plane (angle -8.5deg, scale 1.42), bound by a single deep brand-green multiply wash that fuses the disparate photos into one calm field. On scroll the entire plane drifts up as one body (rotated rows travel different screen-Y = free depth, no per-tile speed, NO pin). A giant Fraunces serif title rises line-by-line from under baseline masks; theme-tween sets the green-cream-copper mood; a descending scroll-tick baits continuation from the dead first screen."
  when: "The opening hero of an atmosphere-led residential project where the strongest first signal is the WHOLE LIFE of the place, not one literal building shot. Use it when you have 9 or more varied, gradeable frames (this is the lowest asset-truth risk: it sells atmosphere, so no single subject must be perfect) and you want a hero that reads visibly different from the usual big-title-over-full-bleed pattern."
  lands: "The first screen is a tilted field of a dozen photographs unified under one green veil, a giant serif headline printing up from the baseline, a quiet copper eyebrow and a single descending scroll-tick. As you scroll, the entire mosaic glides up as one rigid plane (top rows and bottom rows shift at different screen speeds = effortless depth) while the page colour settles into the project's mood. It reads as an authored WORLD, expensive and composed, not a single stock frame."
source:
  grammar: "Springs' signature S1 hero (springs.estate), harvested frame-by-frame: ~9-12 photo tiles in a CSS grid, the whole grid rotated rigidly counter-clockwise and scaled so its corners over-cover the viewport, a dark colour multiply wash baked over the mosaic unifying the photos, the whole rotated plane drifting up as one on scroll (tiles do NOT counter-rotate). Depth is free, from the rotation. Title + eyebrow ride over it. Saisei's baseline mask-up title reveal (D_saisei S5) layered as the load-in; EVER / Springs per-section colour engine (theme-tween) sets the mood; to-place.co.jp's descending scroll-tick (D_toplace §2) baits the dead first screen."
  recording: null
  registry_ref: ["T-rotatedmosaic-springs", "T-maskuptitle-saisei", "T-themetween-ever", "T-scrollhint-toplace"]
uses:
  - { atom: rotated-mosaic-hero,          job: "OWNER (by job, owner-first): lays out the 12-tile 4x3 grid, rotates+scales the rigid tilted plane, and creates its OWN non-pinning ScrollTrigger that drifts the whole plane up on scroll. The mechanic root. mix-blend wash is baked into this one rigid plane (documented-safe, P18)." }
  - { atom: mask-up-title,                job: "B-entrance load-in: the giant Fraunces title rises line-by-line from under baseline masks (expo.out, stagger 0.14s), played once on load (non-pinned hero => load-in timeline, not a scrub)." }
  - { atom: theme-tween,                  job: "Mood colour: lerps the root --bg/--ink/--accent toward the hero's green/cream/copper palette so the chrome (and any modal reading the vars) settles into the project's mood across the seam." }
  - { atom: scroll-hint-descending-tick,  job: "A-ambient scroll bait: a serif label over a faint track with a bright tick autoplaying DOWN at rest, gated to the hero, swapping to audio-bars once scrolled. Convinces a stationary user the page scrolls." }
pin:
  owner: 'none'
  count: 0
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "PIN BUDGET = 0: no atom and not the harness creates a pinned ScrollTrigger. rotated-mosaic-hero's parallax is a NON-pinning ScrollTrigger (start top top / end bottom top, scrub). The title is a load-in timeline. Declared expectPins:0; ST.getAll().filter(t=>t.pin).length === 0."
  - "THE WORLD reads: 9-12 (here 12) varied cars-free frame-of-life tiles, no near-dup adjacency, rotated + scaled as ONE rigid plane under ONE multiply wash; on scroll the whole plane drifts up as a single body (no per-tile counter-motion). The tilt is unmistakable in a static screenshot."
  - "DECODE-GUARD: the rigid plane is held at opacity 0 until every tile img.decode() resolves, then fades in as one body (1.1s power2.out). No undecoded img is ever shown (no black flicker); a 1.6s safety net reveals even if a decode hangs."
  - "TITLE law: the H1 rises line-by-line from under overflow:hidden baseline masks (translateY 118% -> 0, expo.out, stagger 0.14s), played ONCE on load; NOT a fade, NOT scroll-scrubbed; eyebrow + body ride the same load-in on transform/opacity only, will-change cleared after."
  - "ENGINE laws: transform / opacity / clip-path / filter only; the single mix-blend (rmh-wash) is BAKED into the rigid plane and never recomputed over a separately-scrubbed surface (P18 allowed spot); NO backdrop-filter, NO WebGL, NO canvas, NO video.currentTime; will-change cleared after one-shots."
  - "reduced-motion / narrow: rotated-mosaic-hero rests static (no parallax), the title shows instantly (set(1)), the scroll-tick does one slow pulse; copy is shown without transform. window.__LAB_OK__ true; built on OUR QUADRO renders + Ukrainian Fedoriv-voice copy, zero em/en-dash."
webgl: false
ease: air
class: "scroll (parallax plane drift, no pin)"
note: |
  DISTINCTNESS: hero variants cluster around big-title-over-full-bleed. This one is welded to
  its OWN motion root — a tilted rigid MOSAIC of a dozen photos drifting as one field — so it is
  visibly different from the other nine heroes in a screenshot, not just in code. It is also the
  lowest asset-truth risk in the hero family: it sells the project's atmosphere, so no single
  subject has to be the literal hero, and the green multiply wash forgives a mixed grade across
  12 frames. The mix-blend wash is the ONE allowed spot (catalog P18): it is baked into a single
  rigid plane that transforms as one body, never recomputed over a scrubbed surface.
---

# hero--tilted-mosaic-world — Світ, зібраний в один настрій

A HERO that opens on a whole WORLD instead of one stock photo: twelve varied frames of the
project's life (exteriors, garden, aerial, terrace, material macro, interior, dusk) laid out as a
grid and rotated as ONE rigid tilted plane under a single deep-green multiply wash. The plane
drifts up as one body on scroll (free depth from the rotation, no pin), a giant Fraunces title
rises line-by-line from under baseline masks, theme-tween sets the green-cream mood, and a
descending scroll-tick baits the first screen.

## The mechanic root (what makes it distinct)
A tilted MOSAIC of a dozen photographs unified under one wash, drifting as a single rigid field.
Nothing like a single full-bleed hero in a screenshot — it reads as an authored world.

## Atoms (owner-first by job)
- `rotated-mosaic-hero` — OWNER: builds the 4x3 grid, rotates/scales the rigid plane, runs the
  non-pinning parallax. The wash multiply is baked into this one plane (P18 allowed spot).
- `mask-up-title` — B-entrance load-in: the title rises line-by-line, played once.
- `theme-tween` — mood colour on :root (green / cream / copper).
- `scroll-hint-descending-tick` — A-ambient scroll bait, autoplays at rest, gated to the hero.

## Pin budget
owner: none, count: 0. The only scroll-linked motion is the plane parallax (non-pinning). The
title is a load-in timeline. expectPins: 0.

## Lab
`combo-lab.html` — built on OUR QUADRO renders (`renders/` -> quadro/public/proto), Ukrainian
Fedoriv-voice copy, zero em/en-dash. `window.__LAB_OK__` set by the scaffold probe once: 0 pins,
all four cited atoms ran without throwing, the `[data-render-surface]` grid painted a decoded
image, zero real console errors.
