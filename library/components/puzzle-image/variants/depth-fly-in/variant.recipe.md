---
extends: puzzle-image
variant: depth-fly-in
name: "puzzle-image / depth-fly-in"
status: official
source:
  grammar: "QUADRO slide-lab — pz3 depth fly-in, owner-approved (9/10); the 3D-feeling read of the Zera /work cover assemble"
  recording: "apps/quadro/public/slide-lab/pz3-depth-fly-in.html"
  registry_ref: ["T-101", "T-201"]
meaning:
  lands: "Tiles fly home from real Z-depth — near tiles large + blurred, far small — converging into the flat cover, a 3D-feeling cinematic assemble; then the whole wide cover grows modestly to full-bleed."
overrides:
  field: "dark cinematic near-black (radial 1A1612 → 0E0C0B → 080706), CSS perspective 1300px @ 50% 47% on the .stage so tiles fly home from real Z-depth"
  assemble: "depth-converge — tiles WAIT scattered in CSS Z-depth (translateZ zFar -1180 .. zNear 260), depth-coupled scale 0.74..1.24 / blur 5..17px / brightness / 3D card-tilt; each converges z→0 blur→0 brightness→1 on the air ease with a per-tile depth-stagger (startAt = zNorm*0.16*assembleEnd, near tiles later)"
  grow: "SHARED with the base — ONE modest transform:scale (~1.35x) of the whole .coverWrap unit; wordmark + captions scale WITH it"
  serif: "Fraunces, Times New Roman, Georgia, serif (bronze accent #B5895A); ghost wordmark 13vw across the cover top"
  grid: "4×7 = 28 tiles (vs the base 5×8 = 40), depth grid with transform-style:preserve-3d"
  cue: "thin filling progress line (scaleX 0→1), NOT a count-up"
when_pick_this: "A depth / 3D-feeling assemble vs the flat center-out base — the cover converges out of real Z-depth (a near-blurred DOF cloud snapping into focus) rather than tiles sliding home in-plane. Pick the base center-out for a calmer, flat reveal."
files: [variant.recipe.md, params.json, variant.js, variant.css, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# puzzle-image / depth-fly-in — variant delta

> **variant-as-delta. Base `component.js` (PuzzleImage = center-out) is UNTOUCHED.**
> This is the DEPTH / 3D-feeling reading of the SAME single-wide-cover beat: ONE
> wide QUADRO render (day-front, 16:9) is pre-sliced into CSS-sprite tiles that
> WAIT scattered in real **CSS Z-depth** — near tiles large + soft + dim, far
> tiles small — then **fly home, converging** onto the flat assembled cover plane
> (z=0, blur 0). A ghost serif wordmark + left headline + small captions emerge.
> Then the WHOLE assembled cover grows MODESTLY (~1.35x, transform:scale) to
> full-bleed — the **shared** grow phase. Recorded 1:1 from owner-approved
> `pz3-depth-fly-in.html`. Per CONTRACT §3 the ASSEMBLE is a NEW DOM motion model
> (a real perspective Z-converge, not the base's in-plane center-out), so it ships
> as a **base-importing `variant.js`**, NEVER a forked `component.js`.

## The depth / fly-in mental model (the delta)
Each tile gets a deterministic depth start `depthStart(t)` from a stable per-tile
seed (no `Math.random`, identical each load):

- **`zNorm` 0..1** (far..near) drives everything: `z = Z_FAR + (Z_NEAR-Z_FAR)·zNorm`
  (`Z_FAR -1180 .. Z_NEAR 260`), `scale = 0.74 + zNorm·0.5` (0.74 far .. 1.24 near),
  `blur = 5 + zNorm·(BLUR_MAX-5)` (near = blurrier, a DOF read), `brightness =
  0.55 + (1-zNorm)·0.18` (a touch dimmer up close).
- **scatter offset** radiates outward from cover centre with a small angular jitter;
  `spread = 36 + zNorm·60` so the near tiles fly from further out.
- **3D card tilt** — `rotation (rnd-0.5)·7` in-plane, `rotationX (rnd2-0.5)·8`.
- **per-tile depth-stagger** — `startAt = (zNorm·0.16)·assembleEnd`: the near tiles
  begin a hair later, so the cloud reads as **converging from depth** into focus.

All tiles then tween `z→0, xPercent→0, yPercent→0, scale→1, rotation→0,
rotationX→0, opacity→1, filter:blur(0px) brightness(1)` on the ONE **air** ease —
no pop, no jerk; reverse scroll is the same tweens run backward.

## What is SHARED with the base (base-importing, not a fork)
The `variant.js` loads alongside `../../component.js` and reuses the base's
contract for: the **single-src sprite** invariant (every tile a fragment of the
SAME one wide render; the photo underneath is that same image — zero two-photo
overlap), the **photo + scrim fade-under at seat** (seams vanish), the **GROW**
phase (one modest `transform:scale` ~1.35x of the whole `.coverWrap`, wordmark +
captions scale WITH it), the **never-fade LEFT headline**, and the
**reduced-motion / narrow → static assembled cover** fallback. Only transform(3d)
/ opacity / filter animate; no clip-path, no WebGL, no mix-blend / backdrop over
the scrubbed surface.

## How it is recorded
`variant.js` is `window.PuzzleImageDepthFlyIn.init(opts)`: it builds the 28 sprite
tiles, owns `depthStart` + the Z constants + the `gsap.matchMedia` full /
reduced-motion branches + the progress cue, and cites the shared base
(`window.PuzzleImage` from `../../component.js`) for the single-src + modest-grow
contract. `variant.lab.html` loads `../../component.js` + `variant.js`, calls
`PuzzleImageDepthFlyIn.init` with the real QUADRO `renders/day-front.webp` (honest
Fedoriv copy, no em-dash), and the `__LAB_OK__` probe confirms the variant booted
(base + variant present, 28 tiles all slices of the SAME src, a pinned
ScrollTrigger live or reduced-motion static, growPeak ≤ 1.5, no clip-path on the
cover) with zero real console.error.
