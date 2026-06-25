---
extends: puzzle-text
variant: converge-faithful
name: "puzzle-text / converge-faithful"
status: official
source:
  grammar: "QUADRO slide-lab — tx1 converge-faithful, owner-approved (9/10); the closest honest clone of the Zera /portfolio6 text scatter↔assemble"
  recording: "apps/quadro/public/slide-lab/tx1-converge-faithful.html"
  registry_ref: ["T-118"]
meaning:
  lands: "The faithful Zera read — gray words scattered wide on both axes converge to the readable paragraph on one air ease, gray→ink, no paired render, pure text. The converge is a measured reading-order cascade (top→bottom, left→right) so the paragraph reads itself into place; centre words barely move and seat first, edge words fly from far corners and seat last."
overrides:
  field: "LIGHT — a pale calm paper field (radial #f3f1ea → #eceae3) with a faint quiet structure grid (vs the base cream paired column / the depth variant's dark cinematic field)"
  render: "NONE paired — pure text-converge is the star; only an OPTIONAL quiet companion render whispers in the lower-right and resolves AFTER the statement seats (graceful-optional, hides if absent)"
  assemble: "pure text-converge — wide diagonal scatter on BOTH axes biased OUTWARD from the measured paragraph centre, converging home on ONE air ease, gray→ink, sequenced by a MEASURED reading-order cascade computed from each word's resting x/y after layout (not DOM index); opacity NEVER touched (always opaque)"
when_pick_this: "The pure faithful text-converge with no paired render — a calm, composed statement that reads itself into place on a light field. Pick the paired-render base when you want a big quiet render composed beside the text; pick word-blocks-depth for a 3D-feeling depth assemble."
files: [variant.recipe.md, params.json, variant.js, variant.css, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# puzzle-text / converge-faithful — variant delta

> **variant-as-delta. Base `component.js` (PuzzleText = tx5 paired
> contained-scatter converge) is UNTOUCHED.**
> This is the FAITHFUL Zera /portfolio6 read of the SAME text scatter↔assemble
> beat — the closest honest clone of the source. A confident **serif** statement
> whose **words** start scattered **gray** on **both axes** (wide diagonal, some
> rotated/skewed, sized larger) and **converge** into the readable paragraph on
> **one** air ease, darkening **gray → ink** as each word seats. Calm, composed,
> on a **light** field, with **no paired render** (just an optional quiet companion
> whisper). Pure text. Recorded 1:1 from owner-approved `tx1-converge-faithful.html`.
> Per CONTRACT §3 the converge adds a NEW DOM phase (a measured reading-order
> cascade + outward-from-centre scatter, computed from each word's resting box),
> so it ships as a **base-importing `variant.js`**, NEVER a forked `component.js`.

## The faithful read (the delta)
- **Light field.** A pale calm paper (radial `#f3f1ea → #eceae3`) with a faint
  quiet structure grid — the ref's paper read. No dark field, no big paired slab.
- **Outward-biased scatter.** Each word's resting centre is measured after layout;
  the scatter offset is biased **outward** from the paragraph centre:
  `bias = centreCalm(0.18) + (1-centreCalm)·outFrac`,
  `dx = (rndX·0.42 + ox·0.58)·maxX·bias` — **centre words barely move**, **edge
  words fly from far corners.** `maxX = stageWidth·0.46`, `maxY = stageHeight·0.40`.
- **Distance ramp** (the base law): `dist = hypot(dx/maxX, dy/maxY)/√2`,
  `scale = 1+(scaleFar(1.46)-1)·dist`, rotation/skew scale with `dist`, color
  `lerp ghost-near #b7b4ab → ghost-far #d6d4cc` by `dist`.
- **Measured reading-order cascade.** Words are sorted by row (`ry`, bucketed 14px)
  then column (`rx`); the cascade position is `at = (orderIndex/(N-1))·cascade(0.40)`
  so the paragraph **reads itself into place** top→bottom, left→right.
- **Optional companion render.** A small quiet desaturated plate in the lower-right
  eases in **only after** the statement seats (`at = cascade + duration·0.7`);
  graceful-optional — it hides on image error and the lab stays valid text-only.

All words tween `x→0, y→0, scale→1, rotation→0, skewX→0, color→#161614` on the ONE
**air** ease; reverse scroll runs the identical tween backward (re-scatter, no pop).

## What is SHARED with the base (base-importing, not a fork)
The `variant.js` loads alongside `../../component.js` and reuses the base's
contract for: the **word-level split** (word + space spans so gaps never collapse —
same as `PuzzleText.splitWords`), the **always-opaque words** (`opacity` NEVER
touched → zero layout shift), the **transform + color assembly** with the
browser-laid-out paragraph animated FROM an offset back to `transform:none`
(pixel-perfect line breaks), the **farther-from-home = lighter + larger** ramp, the
**ONE air ease**, the **pinned + scrubbed reversible** scroll, and the
**reduced-motion / narrow → static readable paragraph** fallback. Only transform /
color animate; no WebGL, no mix-blend / backdrop over the scrubbed surface, no
`video.currentTime`.

## How it is recorded
`variant.js` is `window.PuzzleTextConvergeFaithful.init(opts)`: it owns the
light-field measure-then-cascade phase + the outward scatter bias + the optional
companion fade + the `reduced/narrow → static` branch + the self-probe, and cites
the shared base (`window.PuzzleText` from `../../component.js`) for the word-split +
always-opaque + air-ease contract. `variant.lab.html` loads `../../component.js` +
`variant.js`, calls `PuzzleTextConvergeFaithful.init` (honest Fedoriv copy, no
em-dash; optional `renders/terrace-02.webp` companion), and the `__LAB_OK__` probe
confirms the variant booted (base + variant present, exactly one `.statement` split
into ≥6 opaque word spans, no opacity tween on a word, the reading-order cascade
applied or the reduced/narrow static branch, a pinned ScrollTrigger live or static,
no em-dash) with zero real console.error.
