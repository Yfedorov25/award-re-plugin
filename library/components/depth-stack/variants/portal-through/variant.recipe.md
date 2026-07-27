---
extends: depth-stack
variant: portal-through
name: "depth-stack / portal-through"
status: official
source:
  grammar: "QUADRO cards-lab — depth-d3 (portal/through), owner-approved; the V4 scroll-direction fix"
  recording: "apps/quadro/public/cards-lab/depth-d3-portal-through.html"
  registry_ref: []
meaning:
  lands: "The camera flies THROUGH a tunnel of render-planes — each frame grows from deep haze to full-bleed focus, then you pass through it and it blooms past you. A depth takeover / scene-change."
overrides:
  engine: "translateZ tunnel — its own variant.js, imports the base ../../component.js, supplies applyFrame=applyTunnel"
  serif: "Fraunces, Georgia, serif  (owner-approved for depth — NOT the Georgia/Times of cards-swipe)"
  constants: "z=-min(d,3)·540/plane · scale 0.62..1 ahead, 1..1.9 behind · blur 7..0 ahead, 0..6 behind · haze 0.82..0 · brightness 0.5..1 ahead, 1..1.18 behind · behind op 1..0 z e·360 zi 200"
  micro_mechanics: "scale-through · cross-dissolve · depth-haze · parallax text-lag · ken-burns · headline split-reveal · forward-flying depth counter"
  theme: "single dark tunnel, accent #b07b3e, deep perspective 1200px @ 50% 47%, full-bleed render planes"
  layout: "frame text = lower-left column over the render; depth counter flies forward at the seam; rail handle = round bead"
  pace: "scrub 0.7, entry scrub 0.6, snap step 1/(N-1), pin budget endMult 1.0 (longer than deal-fan 0.95)"
when_pick_this: "A depth TAKEOVER / scene-change that should feel like flying through portals. Pick deal-fan for a tactile dealt-deck read."
files: [variant.recipe.md, variant.js, variant.css, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# depth-stack / portal-through — variant delta

> **variant-as-delta. Base `component.js` is UNTOUCHED.** This is the
> PORTAL/TUNNEL reading of the depth deck: the camera flies THROUGH a tunnel of
> render-planes along −z. Recorded 1:1 from owner-approved
> `depth-d3-portal-through.html`. Per CONTRACT §3 the engine is a NEW DOM motion
> model (a translateZ tunnel, not a yPercent conveyor), so it ships as a
> **base-importing `variant.js`**, NOT a `params.json`-only delta and NEVER a
> forked `component.js`.

## The portal / tunnel mental model (the delta)
The whole stack is a TUNNEL of planes along −z. `prog` (0..N-1, continuous) is the
camera's position; it grows as you scroll DOWN. For frame `i`, depth `d = i - prog`:

- **`d >= 0` — AHEAD in the tunnel.** `dd = min(d,3)`, `approach = airEase(clamp(0,1,
  1 - min(d,1)))`. `z = -dd·540`; `scale = interp(0.62,1,approach)` (held to
  `0.62..0.7` while `d>1`); `op = d>2.4 ? 0 : 1`; `blur = interp(7,0,approach)`;
  `hazeOp = interp(0.82,0,approach)`; `brightness = interp(0.5,1,approach)`;
  `zi = 100 - i`.
- **`d < 0` — BEHIND camera / flown THROUGH.** `t = min(-d,1)`, `e = airEase(t)`.
  `z = e·360` (toward/past camera); `scale = interp(1,1.9,e)`; `op = 1-e` (dissolve);
  `blur = e·6`; `hazeOp = 0`; `brightness = interp(1,1.18,e)` (bloom); `zi = 200`
  (the frame you pass through is nearest).

## The 7 layered micro-mechanics
1. **scale-through** — z + scale grow toward camera, overshoot past 1 on exit.
2. **cross-dissolve** — incoming fades in from deep haze; outgoing fades as it passes (`op`).
3. **depth-haze** — `.frame__haze` scrim `0.82→0` on approach.
4. **parallax** — text column on a nearer z-plane (`z:60`), lags the render:
   `near = clamp(0,1,1-|d|)`; `txtY = d>0 ? interp(46,0,airEase(near)) :
   interp(0,-34,airEase(min(-d,1)))`; `txtOp = d>=0 ? clamp(0,1,near·1.4) : 1-min(-d,1)`.
5. **ken-burns** — `settle = clamp(0,1,1-|d|)`; `scale 1.0→1.06`, `x ±1.8`, `y -1.3`.
6. **headline split-reveal** — `fromTo yPercent 118→0, dur .92, ease air, stagger .06`,
   fires once when a frame lands at the camera.
7. **forward-flying depth counter + rail bead** — `fly = sin(frac·π)`,
   `cscale = max(0.2, 1 + fly·0.5)`, `cOp = interp(0.06,0.015,fly)`; rail `fill`/`bead`
   `top = t·100%`.

## The scroll-direction law it satisfies (the V4 fix)
Scroll DOWN → `prog` increases → camera moves FORWARD. The next frame's depth `d`
shrinks +1 → 0, so it grows BIGGER and comes FORWARD toward you. Nothing ever
rises up against the wheel; every element travels toward the camera as you scroll
down. Forward = down-the-page.

## How it is recorded
`variant.js` is `window.DepthPortalThrough.init(opts)`: it builds the frames, owns
`applyTunnel` + the entry/reduced-motion painters + the forward-flying depth
counter, then calls `DepthStack.mount(stage, { applyFrame: applyTunnel, entryFrame,
updateChrome, revealHeadline, reducedFrame, endMult: 1.0, scrub: 0.7 })` — so the
pin / scrub / snap / signed-depth / reduced-motion scaffolding is the SHARED base
engine, untouched. `variant.lab.html` loads `../../component.js` + `variant.js`,
calls `DepthPortalThrough.init` with the 4 real QUADRO frames (honest Fedoriv
copy), and the `__LAB_OK__` probe confirms the tunnel booted (base + variant
present, 4 frames built, a pinned ScrollTrigger live) with zero console.error.
