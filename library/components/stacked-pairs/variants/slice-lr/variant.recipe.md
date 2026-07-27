---
extends: stacked-pairs
variant: slice-lr
name: "stacked-pairs / slice-lr"
status: official
mode: pinned-slice
dir: lr
source:
  grammar: "QUADRO slide-lab — frs12 stacked pairs + SAISEI slice reveal (LEFT->RIGHT): the same frs7 text-left / render-right composition and the same ONE-Lenis engine as the base, but the reveal is a PINNED, scrubbed, SAISEI-timed clip-wipe instead of the base's non-pinned fade+rise"
  recording: "apps/quadro/public/slide-lab/frs12-stacked-slice-lr.html"
  registry_ref: []
meaning:
  lands: "Each pair arrives and HOLDS you (the section is pinned): the text seats first, then a clear quiet PAUSE with the text alone, then the big render on the right CLIP-WIPES open slowly from the LEFT edge rightward, then it holds settled before the pin releases to the next pair. A deliberate, controlled, graceful reveal whose pace does not depend on how fast you flick — the SAISEI read, not the base's quick in-view fade."
overrides:
  reveal: "PINNED + SCRUBBED slice (vs the base's NON-pinned fade+rise). Each .pair owns a pin (start 'top top', end '+=innerHeight*1.35', pin:true, pinSpacing:true, scrub:1) driving a PURE render(self.progress) + a render(0) at init. owns_pin becomes TRUE for the section."
  phases: "render(p) phase map — 0.00->0.20 TEXT reveals (bar + idx + title + sub, air stagger); ~0.26->0.46 PAUSE (text sits alone, render fully hidden); 0.46->0.96 RENDER clip-wipes open slowly (air-eased); 0.96->1.00 settled hold before the pin releases. A slow MONOTONIC ken-burns scales the img 1.05->1.12 across the whole p."
  clip: "LEFT->RIGHT — the render reveals via clipPath inset(0 R% 0 0) with R 100->0, so the visible region starts at the LEFT edge and grows RIGHTWARD. (slice-td instead clips the BOTTOM, inset(0 0 B% 0), top->down.)"
when_pick_this: "The same text-left / render-right pair composition, but you want each pair to PIN and reveal on a slow, controlled SAISEI beat (text -> pause -> render clip-wipes open) instead of the base's quick in-view fade+rise, and you want the render to wipe open LEFT->RIGHT. Pick the BASE (stacked-pairs) for the calm pin-LESS vertical magazine rhythm; pick slice-td for the same pinned slice revealed TOP->DOWN."
files: [variant.recipe.md, params.json, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# stacked-pairs / slice-lr — variant delta (pinned-slice mode)

> **variant-as-MODE. Base `component.js` (StackedPairs = the frs11 NON-pinned
> fade+rise reveal, `owns_pin:false`) is UNTOUCHED.**
> This variant keeps the SAME frs7 composition (TEXT on the LEFT ~38% + a BIG
> contained fixed-size RENDER on the RIGHT ~62%, 84vh, rounded-left frame, ~2cm
> gap, far-left bronze rule, index eyebrow + Fraunces italic-bronze heading +
> sub, tag bottom-right) and the SAME ONE-Lenis engine — but it swaps the reveal
> **motion model**: each `.pair` is **PINNED** and its reveal is **SCRUBBED** over
> a long pinned scroll (a controlled SAISEI beat), and the render is revealed by a
> **clip-path WIPE** that opens **LEFT->RIGHT**. Recorded 1:1 from owner-approved
> `frs12-stacked-slice-lr.html` (gate-clean).
> Because the delta is a NEW pin + a NEW clip phase (not a base data knob), per the
> plugin CONTRACT this ships as a variant with its **OWN self-contained
> `variant.lab.html`** carrying the pinned-slice engine (plus a `params.json` that
> documents `mode:pinned-slice` + `dir:lr`), NOT a `params.json`-only knob diff
> over the base and NEVER a forked `component.js`.

## The delta (what changes vs the base)
- **Pinned + scrubbed (vs non-pinned fade+rise).** The base reveals each pair as
  it rises into view (two `scrub:true` triggers, no pin). This variant **pins**
  each `.pair` (`start:'top top'`, `end:'+='+Math.round(innerHeight*1.35)`,
  `pin:true`, `pinSpacing:true`, `scrub:1`) and drives a **pure**
  `render(self.progress)` from `onUpdate` + a `render(0)` at init. The pin makes
  the timing **controlled** — the reveal takes the same long, graceful scroll no
  matter how fast the user flicks. `owns_pin` is **true** for the section.
- **A staged SAISEI phase map.** `render(p)`:
  - `0.00 -> 0.20` TEXT reveals — the bronze rule fades + grows (`scaleY 0.6->1`)
    and the three text bits (idx, title, sub) rise (`y 26->0`) + fade on a gentle
    **air** stagger (`(p - 0.02 - k*0.05) / 0.22`).
  - `~0.26 -> 0.46` **PAUSE** — the text sits alone; the render is still **fully
    hidden** (clip closed). The deliberate beat that makes it read as SAISEI.
  - `0.46 -> 0.96` **RENDER clip-wipes open**, slow + air-eased
    (`rev = air((p - 0.46) / 0.50)`).
  - `0.96 -> 1.00` settled hold before the pin releases to the next pair.
- **Clip axis LEFT->RIGHT.** The render reveal uses
  `clipPath: inset(0 R% 0 0)` with `R = (1-rev)*100` (100 -> 0), so the visible
  region **starts at the LEFT edge and grows RIGHTWARD** — a left-to-right wipe.
  (The sibling `slice-td` clips the BOTTOM instead.)
- **Monotonic ken-burns.** `img scale 1.05 -> 1.12` across the whole pinned `p`
  (`1.05 + 0.07*p`) — slow, continuous, never resets, image-only.

## What is SHARED with the base (same composition + same engine)
The frs7 composition verbatim (rail/text LEFT ~38%, big contained fixed-size
render RIGHT ~62% @ 84vh, ~2cm gap, far-left bronze rule, index eyebrow +
Fraunces serif heading with an italic-bronze `<em>` keyword + sub, tag
bottom-right, render always on the right); the ONE Lenis `lerp:0.1`
`smoothWheel` smoother -> `gsap.ticker` -> `ScrollTrigger.update`,
`lagSmoothing(0)`; the **pure** `render(prog)` driven from `onUpdate` + once at
init (NEVER `toggleActions`); **transform / opacity / clip-path only** (no WebGL,
no mask-composite, no mix-blend / backdrop over the scrubbed surface, no
`video.currentTime`); and the **reduced-motion / `<=820px` -> static legible
stack** fallback (no Lenis, no triggers; render stacks above the text on narrow).
The ONLY motion difference vs the base is the pin + the clip phase; the ONLY
difference vs `slice-td` is the clip axis.

## How it is recorded
`variant.lab.html` is self-contained and runnable: it authors the frs11/frs12
DOM (intro + `#pairs` + outro), builds the faithful QUADRO 6-render deck (honest
Fedoriv copy, zero em-dashes), wires the ONE Lenis smoother, and pins each
`.pair` with the scrubbed `render(self.progress)` slice engine described above
(clip axis `inset(0 R% 0 0)`, L->R). Renders resolve through the `renders`
symlink -> `quadro/public/proto`. It sets `window.__LAB_OK__ = true` once gsap +
ScrollTrigger + Lenis are present and the N pinned pair sections are built (or
the reduced-motion / narrow static branch is taken), with zero real
`console.error`.
