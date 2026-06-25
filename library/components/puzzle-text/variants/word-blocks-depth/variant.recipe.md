---
extends: puzzle-text
variant: word-blocks-depth
name: "puzzle-text / word-blocks-depth"
status: official
source:
  grammar: "QUADRO slide-lab — tx3 word-blocks-depth, owner-approved (9/10); the 3D-feeling depth read of the Zera /portfolio6 text scatter↔assemble"
  recording: "apps/quadro/public/slide-lab/tx3-word-blocks-depth.html"
  registry_ref: ["T-118"]
meaning:
  lands: "Whole word-blocks fly home from real Z-depth (near large + blurred, far small) converging into the flat readable paragraph — a 3D-feeling cinematic text assemble. They de-blur and darken gray→ink as each seats, on one air ease, words always opaque so there is zero layout shift."
overrides:
  field: "dark cinematic near-black (radial 1A1612 → 0E0C0B → 080706), CSS perspective 1250px @ 50% 48% on the .stage so word-blocks fly home from real Z-depth; .statement transform-style:preserve-3d so words ride the depth via translateZ"
  assemble: "depth-converge — whole word-blocks WAIT scattered in CSS Z-depth (translateZ zFar -1080 .. zNear 520), depth-coupled blur 0.30..1.0×blurMax(18px) / warm-gray ramp / 3D card-tilt; each converges z→0 blur→0 gray→ink on the air ease with a reading-order cascade startAt = (i/N)·(assembleEnd·0.34); opacity NEVER touched (always opaque)"
  render: "quiet — ONE QUADRO aerial behind the type, opacity 0.16, desaturated, vignette+scrim so the type always wins contrast; never the star (vs the base's big contained paired slab)"
  accent: "an <em> group seats to the bronze accent ink (#B5895A) instead of the paper ink"
  cue: "thin filling progress line (scaleX 0→1), NOT a count-up"
when_pick_this: "A depth / 3D-feeling text assemble vs the paired-render base — the statement converges out of real Z-depth (a near-blurred DOF cloud of word-blocks snapping into focus on a dark cinematic field) rather than a contained in-plane scatter beside a big render. Pick the base for the calmer, paired Saisei composition."
files: [variant.recipe.md, params.json, variant.js, variant.css, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# puzzle-text / word-blocks-depth — variant delta

> **variant-as-delta. Base `component.js` (PuzzleText = tx5 paired
> contained-scatter converge) is UNTOUCHED.**
> This is the DEPTH / 3D-feeling reading of the SAME text scatter↔assemble beat.
> Whole **word-blocks** of one statement WAIT scattered in real **CSS Z-depth**
> (near words large + soft + dim, far words small + distant + lighter gray) then
> **fly home, converging** onto the flat readable Fraunces plane (z=0, blur 0),
> **de-blurring** and darkening **gray → ink** as each seats. A 3D-feeling
> cinematic text assemble on a dark cinematic field, a quiet QUADRO aerial render
> behind. Recorded 1:1 from owner-approved `tx3-word-blocks-depth.html`. Per
> CONTRACT §3 the ASSEMBLE is a NEW DOM motion model (a real perspective
> Z-converge, not the base's in-plane contained scatter), so it ships as a
> **base-importing `variant.js`**, NEVER a forked `component.js`.

## The depth / fly-in mental model (the delta)
Each word gets a deterministic depth start `depthStart(rand)` from a stable
mulberry32 seed (identical each load):

- **`zNorm` 0..1** splits near/far: `zNorm>0.5` → toward viewer (`z = Z_NEAR·(zNorm-0.5)·2`,
  large + blurred + dim); `zNorm<=0.5` → away (`z = Z_FAR·(0.5-zNorm)·2`, small + distant).
  `Z_NEAR 520`, `Z_FAR -1080`.
- **DOF blur** — `blur = BLUR_MAX·(0.30 + 0.70·(near? zNorm : nearness·0.7))`; near words
  are blurrier, capped `<=20px` (`BLUR_MAX 18`).
- **both-axis scatter offset** radiates with jitter: `x = cos(ang)·rad·innerWidth·spreadX`,
  `y = sin(ang)·rad·innerHeight·spreadY` (`rad 0.35..1.0`, `spreadX 0.42`, `spreadY 0.40`).
- **3D card tilt** — `rotation (rnd·2-1)·6` in-plane, `rotationX/rotationY (rnd·2-1)·9`.
- **reading-order cascade** — `startAt = (i/N)·(assembleEnd·0.34)`: a gentle top→bottom
  read so the statement assembles as ONE gesture.

All words then tween `z→0, x→0, y→0, rotation→0, rotationX→0, rotationY→0,
color→seatInk, filter:blur(0px)` on the ONE **air** ease — no pop, no jerk; reverse
scroll is the same tweens run backward (re-scatter into depth).

## What is SHARED with the base (base-importing, not a fork)
The `variant.js` loads alongside `../../component.js` and reuses the base's
contract for: the **word-level split** (word + space spans so gaps never collapse;
this variant adds `<em>` accent grouping on top of the base `PuzzleText.splitWords`
word contract), the **always-opaque words** (`opacity` NEVER touched → zero layout
shift), the **transform + color assembly** with the **browser-laid-out paragraph**
animated FROM an offset back to `transform:none` (pixel-perfect line breaks), the
**ONE air ease**, and the **reduced-motion / narrow → static readable statement**
fallback. Only transform(3d) / opacity-untouched / filter(blur) / color animate; no
clip-path, no WebGL, no mix-blend / backdrop over the scrubbed surface, no
`video.currentTime`.

## How it is recorded
`variant.js` is `window.PuzzleTextWordBlocksDepth.init(opts)`: it builds the depth
scatter, owns `depthStart` + the Z constants + the `gsap.matchMedia` full /
reduced-motion / narrow branches + the `<em>` accent seat-ink + the progress cue,
and cites the shared base (`window.PuzzleText` from `../../component.js`) for the
word-split + always-opaque + air-ease + static-fallback contract. `variant.lab.html`
loads `../../component.js` + `variant.js`, calls `PuzzleTextWordBlocksDepth.init`
with the real QUADRO `renders/aerial.webp` (honest Fedoriv copy, no em-dash), and
the `__LAB_OK__` probe confirms the variant booted (base + variant present, the
statement split into ≥6 opaque word spans, a pinned ScrollTrigger live or
reduced-motion / narrow static, no opacity tween on a word, no em-dash) with zero
real console.error.
