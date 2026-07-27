---
extends: depth-stack
variant: deal-fan
name: "depth-stack / deal-fan"
status: official
source:
  grammar: "QUADRO cards-lab — depth-d2 (deal/fan), owner-approved; the V4 scroll-direction fix"
  recording: "apps/quadro/public/cards-lab/depth-d2-deal-fan.html"
  registry_ref: []
meaning:
  lands: "A held hand of cards dealt forward-and-down onto a table at a low camera angle — each render is dealt into focus, then slides DOWN past the bottom toward the viewer as the next one lands. Tactile, monotonic with the wheel."
overrides:
  engine: "yPercent deal-conveyor (Role B) + 3D fanned back-stack (Role A) — its own variant.js, imports the base ../../component.js, supplies applyFrame=applyDeal"
  serif: "Fraunces, Georgia, serif  (owner-approved for depth — NOT the Georgia/Times of cards-swipe)"
  constants: "FAN_ROT 6.5 · FAN_X 12 · FAN_Y -34 · FAN_Z -150 · FAN_SCALE 0.055 · MAXD 3.2 · DEAL_OUT 104 · DEAL_IN0 -34 (= FAN_Y, continuous handoff)"
  theme: "alternating .card--cream / .card--dark, accent #b07b3e, felt-table stage (perspective 1850px @ 50% 40%)"
  layout: "asymmetric split 0.9fr / 1.3fr, .card--flip swaps render/text sides; corner card-pip; rail handle = tilted dealt-card chip"
  pace: "scrub 0.7, entry scrub 0.6, snap step 1/(N-1), pin budget endMult 0.95"
when_pick_this: "A sectioned deck that should feel DEALT — low-angle, tactile, hand-of-cards. Pick portal-through instead for a fly-THROUGH tunnel takeover."
files: [variant.recipe.md, variant.js, variant.css, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# depth-stack / deal-fan — variant delta

> **variant-as-delta. Base `component.js` is UNTOUCHED.** This is the DEAL/FAN
> reading of the depth deck: a held hand of cards dealt forward-and-down onto a
> low-angle table, alternating cream/dark themes, the gold accent, a felt-table
> stage. Recorded 1:1 from owner-approved `depth-d2-deal-fan.html`. Per CONTRACT
> §3 the engine is a NEW DOM motion model (a yPercent deal-conveyor + 3D fan),
> so it ships as a **base-importing `variant.js`**, NOT a `params.json`-only delta
> and NEVER a forked `component.js`.

## The deal / fan mental model (the delta)
The DECK sits at the top-right corner. Scrolling DOWN deals the next card FORWARD
and DOWN onto the table; the spent card is pushed further forward + down and off
the bottom. Signed stack position `p = i - prog` splits into **two cleanly
separated roles** so the felt motion is monotonic-DOWN by construction and never
fights CSS perspective:

- **ROLE A — parked deck / HAND** (`p >= 1`): the undealt deck, fanned UP-and-RIGHT
  with real 3D depth (`z`, `scale`, fan `rotationZ`). `d = min(p, MAXD)`;
  `xPercent = d·FAN_X`, `yPercent = d·FAN_Y`, `z = d·FAN_Z`, `rotationZ = d·FAN_ROT`,
  `scale = 1 - min(p,3)·FAN_SCALE`, brightness `1 - min(p,2.4)·0.17`,
  `zIndex = round(100 - i)`, opacity drops to 0 past `MAXD`.
- **ROLE B incoming** (`0 < p < 1`): the actual transition — a PURE VERTICAL
  conveyor. `e = airEase(1 - p)`; interpolates from the deck depth-1 slot
  (`FAN_X, DEAL_IN0, FAN_Z, FAN_ROT, 1-FAN_SCALE`) → centre (`0,0,0,0,1`). Because
  `DEAL_IN0 = FAN_Y`, the incoming start is exactly the deck p=1 transform — no
  jump at the handoff. `zIndex 112`.
- **ROLE B spent** (`p < 0`): continues DOWN past the bottom toward the viewer.
  `e = airEase(min(-p,1))`; `xPercent = e·-5`, `yPercent = e·DEAL_OUT` (down),
  `z = e·200` (toward viewer, never back), `rotationZ = e·-5` (unwinds the same
  rotational way), `scale 1→1.1`, opacity `1 - clamp(0,1,(-p)·1.25)`, `zIndex 118`.

Plus per-card **ken-burns** on the render (`settle = clamp(0,1,1-|p|)`,
`scale 1.0→1.07`, `x ±2.2`, `y -1.6`) and the per-word **headline split-reveal**
(`fromTo yPercent 115→0, dur .92, ease air, stagger .06`) fired once when a card
becomes active. DOM is painted **back→front** (card 0 last) so it sits on top at
`prog = 0`.

## The scroll-direction law it satisfies (the V4 fix)
Arrival and exit both travel the SAME way the wheel pushes — DOWN /
toward-the-viewer. As `prog` increases: the incoming card descends from
up-right-in-hand to centre (down), and the active card, on its way out, ALSO
travels down-and-toward-viewer. No moment reads as going up against the scroll.

## How it is recorded
`variant.js` is `window.DepthDealFan.init(opts)`: it builds the cards, owns
`applyDeal` + the FAN_* constants + the entry/reduced-motion painters + the rail
chrome, then calls `DepthStack.mount(stage, { applyFrame: applyDeal, entryFrame,
updateChrome, revealHeadline, reducedFrame, endMult: 0.95, scrub: 0.7 })` — so the
pin / scrub / snap / signed-depth / reduced-motion scaffolding is the SHARED base
engine, untouched. `variant.lab.html` loads `../../component.js` + `variant.js`,
calls `DepthDealFan.init` with the 4 real QUADRO cards (honest Fedoriv copy), and
the `__LAB_OK__` probe confirms the deck booted (base + variant present, 4 cards
built, a pinned ScrollTrigger live) with zero console.error.
