---
id: depth-stack
name: "Depth stack (deal-fan / portal-through)"
level: 1
kind: component
status: official
entry:
  call: "DepthStack.mount(stage, { n, applyFrame, entryFrame?, updateChrome?, revealHeadline?, reducedFrame?, endMult, scrub })   # base owns ONLY the shared frame (pin+scrub+snap+signed-depth+reduced-motion). Each variant ships its OWN per-frame engine as variants/<name>/variant.js (it imports ../../component.js and supplies applyFrame). Call the variant entry — DepthDealFan.init / DepthPortalThrough.init — which internally mounts the base."
  module: iife
  returns: "{ kill, refresh, airEase, n } | null"
meaning:
  what: "A pinned scroll-scrub deck of layered planes painted from one continuous signed depth (d = i - prog) that move through Z — dealt forward-and-down into a fanned hand (deal-fan), or flown THROUGH as a tunnel of portal-planes (portal-through)."
  when: "A depth-takeover section that should feel like moving THROUGH space, not across it — render planes that recede/advance toward the viewer on scroll, where the cards-swipe horizontal read is wrong."
  lands: "The page gains real Z — you fall into the scene; planes pass YOU rather than slide by. The single felt motion is monotonic with the wheel: forward == down-the-page."
  not_when: "Flat catalogue/index sections, conversion gates (motion must drop there), anywhere the cards-swipe horizontal deck already fits. depth-stack is its OWN technique, never a cards-swipe variant, and must not run as a second pin in a section that already pins."
source:
  grammar: "QUADRO cards-lab — owner-approved depth-d2 (deal/fan) + depth-d3 (portal/through); the V4 scroll-direction fix"
  recording: ["apps/quadro/public/cards-lab/depth-d2-deal-fan.html", "apps/quadro/public/cards-lab/depth-d3-portal-through.html"]
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase (no WebGL — CSS 3D transforms / perspective only)"
webgl: false
motion_props: [transform, opacity, filter]
trigger: "one pinned scroll-scrub timeline (scrub:0.7) per section, with honest snap to the n-1 frame slots; a second scrub:0.6 entry trigger hands frame 0 in over the hero"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
page_beat: [material, lifestyle-climax]
combines_with: [parallax-depth, reveal, scroll-indicator]
anti_combos: [second-pin, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: [deal-fan, portal-through]
params_ref: tokens.json
files: [RECIPE.md, component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE pinned scroll-scrub ScrollTrigger drives the deck: prog = self.progress*(n-1), continuous; the base mounts it, no per-frame math in the base"
  - "signed depth d = i - prog drives every frame's transform — ahead (d>0) is deep/parked, d=0 is the active plane, behind (d<0) has been passed"
  - "SCROLL-DIRECTION LAW (the V4 fix): depth advances the SAME direction as scroll — incoming AND outgoing both travel down-the-page/forward; nothing rises against the wheel"
  - "honest snap to n-1 slots (step 1/(n-1), ease air, inertia:false) + a scrub:0.6 entry trigger handing frame 0 in over the hero"
  - "reduced-motion collapses to a flat jump between frames (scrub:false, snap 1/(n-1)) — no deal/fly-through drama"
  - "depth is CSS 3D transform/perspective only — zero WebGL; per-variant engine lives in variants/<name>/variant.js importing ../../component.js"
verify: "lab.html#__LAB_OK__   (variants: variants/deal-fan/variant.lab.html#__LAB_OK__, variants/portal-through/variant.lab.html#__LAB_OK__)"
---

# depth-stack — depth-takeover primitive (deal-fan / portal-through)

> **status: official.** Owner-approved as its OWN technique (NOT a cards-swipe
> variant). cards-swipe reads HORIZONTALLY across a flat track; depth-stack moves
> through **Z-depth** — planes push toward/away from the viewer in a real CSS 3D
> context (`perspective` + `transform-style:preserve-3d`). Per CONTRACT §3, a move
> that needs a different DOM model is a NEW technique, not a params-over-base
> variant. Recorded 1:1 from the two owner-approved QUADRO cards-lab prototypes —
> `depth-d2-deal-fan.html` + `depth-d3-portal-through.html`.

## The SHARED frame (what the base `component.js` owns)
Both engines are the SAME frame with a different per-frame painter. The base
`DepthStack.mount(stage, opts)` owns ONLY the engine-agnostic scaffolding —
**no per-frame transform math lives in the base**:

- **ONE pinned scroll-scrub ScrollTrigger** (`scrub:0.7`) over the `.stage`,
  inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.
- **Continuous signed depth.** `onUpdate` computes `prog = self.progress*(n-1)`
  (0..n-1, grows as you scroll DOWN) and hands it to the variant's
  `applyFrame(prog)`. For frame `i` the variant reads its own depth `d = i - prog`.
- **Honest snap** to the `n-1` slots: `snapTo` rounds to the nearest `k/(n-1)`,
  `duration {min:0.18,max:0.5}`, `ease:"air"`, `inertia:false`.
- **The pin budget carries the scroll-direction law.** `end = innerHeight*n*endMult`
  (deal-fan `0.95`, portal-through `1.0`). Because depth is a pure function of
  `prog` and `prog` grows monotonically with downward scroll, the deck advance
  always reads in the SAME direction as the wheel.
- **Entry trigger.** A second `scrub:0.6` ScrollTrigger (`start:"top bottom"`,
  `end:"top top"`) feeds eased progress to the variant's `entryFrame`, handing
  frame 0 in over the hero so the first beat already teaches the forward read.
- **Reduced-motion branch.** `matchMedia("(prefers-reduced-motion: reduce)")`
  pins with `scrub:false`, `snap:1/(n-1)`, and flat-jumps between frames via the
  variant's `reducedFrame(active)` — no deal/fly-through drama.
- **`air` ease.** `CustomEase "air" = cubic-bezier(0.25,0.74,0.22,0.99)`,
  registered by the base if absent.

The base CSS owns the shared chrome (dark grade, hero, outro, progress rail,
scroll hint, `.serif` = **Fraunces** Georgia-fallback display face, the
`.word > span` split-reveal primitive). It deliberately does NOT set
`perspective`/`preserve-3d` on a deck container — the **3D context is the
variant's to own**, because the felt+fan and the tunnel shape depth differently.

## The SCROLL-DIRECTION LAW (the V4 fix — both variants satisfy it)
The felt motion is **monotonic with scroll**. As `prog` increases (scroll down):
the incoming plane and the outgoing plane BOTH travel the SAME way the wheel
pushes — **down-and-toward-the-viewer** (deal-fan) / **forward through the
camera** (portal-through). There is no moment where the deck advance reads as
going up against the scroll. Felt direction == wheel direction, end to end.

## The two recorded variants (each ships its own engine)
Under §3, these are NOT params-over-base of each other — the difference is a new
DOM motion model, which §3 says cannot be a `params.json`-only delta. The
contract's escape hatch is the **base-importing `variant.js`**: each variant
folder carries its OWN engine as a `variant.js` that imports `../../component.js`
and supplies its per-frame `applyFrame` — never a forked `component.js`.

- **deal-fan** (`variants/deal-fan/`) — a held hand of cards dealt forward-and-down
  onto a table at a low camera angle. A `yPercent` deal-conveyor (Role B) plus a
  3D fanned back-stack (Role A); the spent card continues DOWN past the bottom
  toward the viewer. Source: `depth-d2-deal-fan.html`.
- **portal-through** (`variants/portal-through/`) — the camera flies THROUGH a
  tunnel of render-planes along −z; each frame grows from deep haze to full-bleed
  focus, then you pass through it and it blooms past you. `translateZ` tunnel with
  7 layered micro-mechanics. Source: `depth-d3-portal-through.html`.

## Excluded
A third prototype, **forward-stack** (`depth-d1-forward-stack.html`, a straight
push-in stack), was considered for this family and **EXCLUDED by the owner**. It
is NOT recorded — only deal-fan and portal-through are owner-approved. Do not
re-introduce a forward-stack variant.

## How it is recorded (reproduction shape)
The base is the 5-artifact `official` set (`component.js` + `component.css` +
`lab.html` + `tokens.json` + green verify) for the SHARED frame. Each variant is
a §3 delta: `variant.recipe.md` (`extends: depth-stack`) + a base-importing
`variant.js` (its engine) + `params.json` (its knob diff) + `variant.lab.html`
(loads the base + variant engine, real QUADRO renders, sets `window.__LAB_OK__`).
`library-verify` opens `lab.html` and each `variant.lab.html` and asserts
`__LAB_OK__` (webgl:false → headless step runs, not skipped).
