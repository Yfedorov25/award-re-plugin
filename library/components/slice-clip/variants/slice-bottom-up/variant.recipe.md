---
extends: slice-clip
variant: slice-bottom-up
name: "slice-clip / slice-bottom-up"
status: official
source:
  grammar: "QUADRO slide-lab — frs10 slice BOTTOM→UP clip-reveal (the same frs3 spec-rail + contained-render composition + clip engine as the base, the wipe axis rising bottom→up, the bronze edge removed on purpose)"
  recording: "apps/quadro/public/slide-lab/frs10-slice-td-relay.html"
  registry_ref: []
meaning:
  lands: "Each render gives way to the next as the new photo RISES from below on one clean horizontal edge that travels upward, the numbered rail tracking the beat — a deliberate bottom-to-top reveal, never a muddy crossfade; the photo is always whole, no stray edge marker."
overrides:
  dir: "bu — the clip inset opens BOTTOM→UP: closed inset(0 0 100% 0) (incoming hidden below) -> open inset(0 0 0 0) (full). The new photo rises; the seam travels bottom→up (below = new, above = old)."
  edge: "REMOVED (edge:false). In the L→R base the bronze line rides the vertical seam correctly, but here it read as a stray horizontal line moving from the opposite side of the wipe, so it was removed on purpose. Do NOT re-add it."
  css: "the base CSS already carries the horizontal edge skin keyed by media[data-dir='bu'], but with edge:false it is never painted — no skin change needed."
when_pick_this: "The same indexed render-deck slice as the base, but you want the new photo to RISE from below (a bottom-to-top reveal) rather than sweep in from the left or fall from the top. Pick the base (lr) for the classic left→right sweep that keeps its bronze edge-line; pick slice-top-down for a falling reveal."
files: [variant.recipe.md, params.json, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# slice-clip / slice-bottom-up — variant delta (params-over-base)

> **variant-as-DATA. Base `component.js` (the frs7 LEFT→RIGHT clip-wipe engine,
> parameterized over `dir` + `edge`) is UNTOUCHED.**
> This variant is the SAME pinned frs3 composition and the SAME parity-locked
> two-`<img>` clip-wipe — only the inset axis is rotated so the wipe travels
> **BOTTOM→UP** (`dir:'bu'`) and the bronze edge-line is turned **off**
> (`edge:false`). Recorded 1:1 from owner-approved `frs10-slice-td-relay.html`
> (its filename says "relay" for historical reasons but it is now a clip-reveal,
> bottom→up). Because the only difference from the base is the `dir` axis and the
> `edge` toggle — **no new DOM layer, no new phase** — per CONTRACT §3 it ships as
> a **`params.json`** knob diff (the preferred path: data, zero code), NEVER a
> forked `component.js`.

## The delta (only this changes vs the base)
- **`dir: 'bu'`** — the incoming layer's `clip-path` opens BOTTOM→UP:
  `inset(0 0 100% 0)` (hidden below) → `inset(0 0 0 0)` (full). The new photo
  **rises**; the two meet at ONE hard horizontal edge that travels upward
  (below = new, above = old). The base `lr` instead opens `inset(0 100% 0 0)` →
  `inset(0 0 0 0)` left-to-right.
- **`edge: false`** — the bronze edge-line is removed. In the base it rides the
  vertical seam correctly; here it read as a **stray horizontal line moving from
  the opposite side** of the wipe, so it was removed on purpose. **Do not re-add it.**

## What is SHARED with the base (params-over-base, not a fork)
Everything else is the base engine verbatim: the frs3 composition (numbered
spec-rail LEFT 38%, big contained fixed-size render RIGHT 62%, ~2cm gap, bronze
accent), the ONE Lenis `lerp:0.1` smoother → `gsap.ticker` → `ScrollTrigger.update`
(`lagSmoothing(0)`), the **pure** `render(prog)` from `onUpdate` + once at init,
`pin/pinSpacing/scrub:true`, parity-locked layer A=even / B=odd, the `hold 0.78`
then glide-eased wipe, the `air` rail-marker glide, `dwell 0.86`, `pinFactor 1.4`,
**transform / opacity / clip-path only** (no WebGL, no mask-composite, no mix-blend
/ backdrop over the scrub, no `video.currentTime`), and the reduced-motion / `<=820px`
static-stack fallback.

## How it is recorded
`variant.lab.html` is self-contained and runnable: it authors the frs7 DOM, loads
the shared `../../component.css` + `../../component.js`, and calls
`SliceClip.init({ dir:'bu', edge:false })` with the real QUADRO renders (honest
Fedoriv copy, zero em-dashes). The `__LAB_OK__` probe confirms gsap + ScrollTrigger
+ Lenis present, the spec-rail deck built, both `<img>` layers opaque (clip-only
swap), a pinned ScrollTrigger live (or the reduced-motion / narrow static branch),
no em-dash in visible copy, and zero real `console.error`. The bronze edge stays
hidden (`edge:false`), as designed.
