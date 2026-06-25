---
extends: slice-clip
variant: slice-top-down
name: "slice-clip / slice-top-down"
status: official
source:
  grammar: "QUADRO slide-lab — frs8 slice TOP→DOWN clip-reveal (the same frs3 spec-rail + contained-render composition + clip engine as the base, the wipe axis rotated to vertical, the bronze edge removed on purpose)"
  recording: "apps/quadro/public/slide-lab/frs8-slice-td-clip.html"
  registry_ref: []
meaning:
  lands: "Each render gives way to the next as the new photo WIPES DOWN over the old on one clean horizontal edge, the numbered rail tracking the beat — a deliberate top-to-bottom cut, never a muddy crossfade; the photo is always whole, no stray edge marker."
overrides:
  dir: "td — the clip inset opens TOP→DOWN: closed inset(100% 0 0 0) (incoming hidden above) -> open inset(0 0 0 0) (full). The new photo wipes DOWN over the old; one hard horizontal travelling edge (above = new, below = old)."
  edge: "REMOVED (edge:false). In the L→R base the bronze line rides the vertical seam correctly, but top→down it travelled OPPOSITE the actual clip seam (a stray horizontal line from the wrong side), so it was removed on purpose. Do NOT re-add it."
  css: "the base CSS already carries the horizontal edge skin keyed by media[data-dir='td'], but with edge:false it is never painted — no skin change needed."
when_pick_this: "The same indexed render-deck slice as the base, but you want the new photo to fall DOWN over the old (a top-to-bottom reveal) rather than sweep in from the left. Pick the base (lr) for the classic left→right sweep that keeps its bronze edge-line; pick slice-bottom-up for a rising reveal."
files: [variant.recipe.md, params.json, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# slice-clip / slice-top-down — variant delta (params-over-base)

> **variant-as-DATA. Base `component.js` (the frs7 LEFT→RIGHT clip-wipe engine,
> parameterized over `dir` + `edge`) is UNTOUCHED.**
> This variant is the SAME pinned frs3 composition and the SAME parity-locked
> two-`<img>` clip-wipe — only the inset axis is rotated so the wipe travels
> **TOP→DOWN** (`dir:'td'`) and the bronze edge-line is turned **off**
> (`edge:false`). Recorded 1:1 from owner-approved `frs8-slice-td-clip.html`.
> Because the only difference from the base is the `dir` axis and the `edge`
> toggle — **no new DOM layer, no new phase** — per CONTRACT §3 it ships as a
> **`params.json`** knob diff (the preferred path: data, zero code), NEVER a
> forked `component.js`.

## The delta (only this changes vs the base)
- **`dir: 'td'`** — the incoming layer's `clip-path` opens TOP→DOWN:
  `inset(100% 0 0 0)` (hidden above) → `inset(0 0 0 0)` (full). The new photo
  **wipes down** over the old; the two meet at ONE hard horizontal edge (above =
  new, below = old). The base `lr` instead opens `inset(0 100% 0 0)` →
  `inset(0 0 0 0)` left-to-right.
- **`edge: false`** — the bronze edge-line is removed. In the base it rides the
  vertical seam correctly; rotated to the horizontal seam it travelled the
  **opposite** way to the actual clip boundary (a stray line from the wrong side),
  so it was removed on purpose. **Do not re-add it.**

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
`SliceClip.init({ dir:'td', edge:false })` with the real QUADRO renders (honest
Fedoriv copy, zero em-dashes). The `__LAB_OK__` probe confirms gsap + ScrollTrigger
+ Lenis present, the spec-rail deck built, both `<img>` layers opaque (clip-only
swap), a pinned ScrollTrigger live (or the reduced-motion / narrow static branch),
no em-dash in visible copy, and zero real `console.error`. The bronze edge stays
hidden (`edge:false`), as designed.
