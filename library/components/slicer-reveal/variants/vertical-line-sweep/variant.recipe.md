---
extends: slicer-reveal
variant: vertical-line-sweep
name: "slicer-reveal / vertical line-sweep"
status: official
source:
  grammar: "QUADRO slide-lab — owner-chosen slc-v3-topdown-line-sweep.html: the vertical top->bottom luminous scan-line that paints the contained render in its wake, on clean cream"
  recording: "apps/quadro/public/slide-lab/slc-v3-topdown-line-sweep.html"
  registry_ref: []
meaning:
  lands: "a luminous scan-line paints the render top-to-bottom on cream — the vertical cousin of the horizontal slice"
overrides:
  axis: "vertical top-to-bottom"
  reveal: "line-sweep"
  serif: "Fraunces"
when_pick_this: "a vertical scan-line reveal instead of the horizontal architectural slice"
files: [variant.recipe.md, variant.js, variant.css, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# slicer-reveal / vertical-line-sweep — variant delta

> **variant-as-delta. The base slicer-reveal slab engine is UNTOUCHED.** This is
> the VERTICAL reading of the SAISEI slicer family: instead of a hard horizontal
> cut travelling left→right, a **luminous warm scan-line descends top→bottom**
> and the contained render is **revealed in its wake** on a clean cream field,
> contained render + Fraunces serif. The vertical cousin of the horizontal
> architectural slice. Source: owner-chosen
> `apps/quadro/public/slide-lab/slc-v3-topdown-line-sweep.html`.

## What makes it "vertical-line-sweep" (the delta only)
- **Axis = vertical, top→bottom.** The reveal is a `clip-path` BOTTOM-inset that
  travels top→bottom (`inset(0 0 calc(--eff*100%) 0)`, `--sweep 1 → 0`), instead
  of the base's left→right side-inset.
- **Reveal = line-sweep paint.** A luminous warm `--line` scan-line is pinned to
  the leading bottom edge with a glow + a soft "develop" wash band trailing just
  below it; the render is **painted in the line's wake** as it descends, and the
  line fades out (`--lineOn`) exactly as it reaches the bottom. Eased on a
  dedicated `paint` CustomEase (`0.30,0.00,0.10,1.00`) — a scanner, not a cut.
- **Per-panel pinned arrival** (`pin:.pin`, `start 'top top'` / `end '+=len%'`,
  `scrub:0.85`) with an instant **`--active` gate** (set on `onToggle`) that
  forces every non-active render fully closed — **ZERO-OVERLAP** immune to scrub
  lag at the pin hand-off seams. The HERO is a one-time **autoplay** line-sweep
  on load (not pinned), so the slicer is the star from frame one.
- **Serif = Fraunces** (unchanged from the base — `.display` / `.serif` /
  `.feat__t`, Georgia fallback). Inter for meta/eyebrows.

Everything else is the **family invariant**, inherited from the base
slicer-reveal: cream-paper SAISEI restraint (≥55% cream the dominant ground),
the **NO-PLATE fix** (`.frame` backing IS `--cream` + eager-preload, so the slice
opens on a painted image — never a placeholder plate), **no video / no WebGL**,
`transform / opacity / clip-path` on scrub ONLY (no mix-blend / backdrop-filter
over the scrub), and **reduced-motion + narrow → static legible** (slices fully
open, no pin, no line). No base engine code is forked.

## How it is recorded
`variant.lab.html` loads the base `../../component.css` (the family cream-paper
palette + house ease `air` via `../../component.js` → `window.SlicerReveal`),
then `variant.css` (the line-sweep engine CSS) and `variant.js` (the line-sweep
engine, recorded 1:1 from slc-v3 as `SlicerLineSweep.init()`). It drives the
slc-v3-shaped DOM (5 `.panel` arrival windows + an `.outro` + a `.static`
fallback) byte-faithfully. The `__LAB_OK__` probe confirms the engine + its base
family booted, ≥5 `.frame__img` + ≥5 `.frame__line` are present, with zero
console.error. `params.json` carries the knob diff over the base.
