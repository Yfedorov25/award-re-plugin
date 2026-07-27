---
id: vertical-slide
name: "Vertical clean-slide (film advance)"
level: 1
kind: component
status: official
entry:
  call: "VerticalSlide.init({ stageSel:'#stage', trackSel:'#track', fillSel:'#progFill', slides:[{ img, alt, eye, title, sub, capSide:'left'|'right', brkNum, brkWord, climax?, origin, kb0, kb1, par, cap, brk }], move:0.80, scrub:0.8, pitchVh:2.00, endMult:1.55 })   # The REAL vs3 entry is an inline IIFE build(); recorded faithfully as a window-global init(opts). If slides[] is omitted it drives whatever vs3-shaped DOM (.track > .slide > .frame > .frame__img + .cap + .brk) already exists inside the stage — the SMALLER faithful change. The motion math (pitchPx / centerOffset / travelEndY, the single track.y timeline, ken-burns, climax HOLD, reduced-motion path) is byte-faithful to vs3 and is NOT rewritten to fit this signature."
  module: iife
  returns: "{ n, timeline, refresh, kill } | { reduced:true, n, refresh, kill } | null"
meaning:
  what: "A pinned vertical film-advance where big render+caption cels rise one per scroll-step on a single rigid track (one track.y translateY) through a void LARGER than the viewport, so the outgoing cel fully exits before the incoming reaches centre; per-slide three-plane parallax (frame/image/caption) gives depth and the final terrace cel is HELD as the climax."
  when: "A sequence of big hero images that should advance like vertical film cels with ZERO overlap and a held climax — the moody twilight 'arrival from above → down to the terrace' arc, one photo on stage at a time."
  lands: "Clean cinematic vertical advance — one photo on stage at a time, the void between cels reading as depth between film planes, the terrace climax opening biggest as chrome dissolves. Premium, never a slideshow-cut: every transition is a single reversible glide."
  not_when: "Horizontal catalogue reads (use cards-swipe), depth-takeover where planes push toward/through the viewer (use depth-stack), or anywhere a deck-fan fits. Also not for flat index/conversion sections where motion must drop."
source:
  grammar: "QUADRO slide-lab — owner-approved vs3 parallax-depth vertical-slide (rated 9/10, OVERLAP:NONE); the cln5 clean-advance track + the multi-plane depth layer"
  recording: "apps/quadro/public/slide-lab/vs3-parallax-depth-layers.html"
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase"
webgl: false
motion_props: [transform, opacity]
trigger: "one pinned scroll-scrub translating a single rigid track on Y"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
page_beat: [material, lifestyle-climax]
combines_with: [reveal, scroll-indicator]
anti_combos: [second-pin, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: [parallax-depth]
params_ref: tokens.json
files: [RECIPE.md, component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ZERO image overlap: PITCH > frameH so the void gap exceeds one viewport; outgoing cel fully exits before incoming reaches centre (PITCH 200vh - frameH 76vh = 124vh > 100vh; JS pitchPx() = innerHeight*2.00 equals CSS --pitch)"
  - "ONE rigid track, ONE moving surface: the whole advance is a single linear tween on track.y (translateY) at constant velocity, smoothing scrub only, NO snap — reverse is the exact inverse"
  - "caption atomic inside its slide: .cap lives inside .frame so render + caption are one rigid block that rises together"
  - "per-slide three-plane parallax-depth: frame (master, rides track exactly) / image (deep, --par lag ≤2.4vh) / caption (near, --capPar lead ≤1.6vh) ride slightly different vertical rates; all bounded inner transforms that never move WHICH frame is centred"
  - "climax HOLD: the timeline holds the column on the terrace cel while --peak ramps 0→1, growing the frame to ≤94vh — gated to the stationary HOLD so it never grows while the previous cel is still leaving (worst case 96.4vh < 124vh void budget)"
  - "transform/opacity only on scrub, no clip-reveal-over-stack: no clip-path / mix-blend / backdrop-filter as the swap, no video.currentTime; .stage overflow:hidden clips the spent cel away"
  - "reduced-motion / narrow collapse to a static big-image legible stack (no pin, no motion)"
verify: "lab.html#__LAB_OK__"
---

# vertical-slide — Vertical clean-slide (film advance)

> **status: official.** Recorded 1:1 from the owner-approved QUADRO prototype
> `apps/quadro/public/slide-lab/vs3-parallax-depth-layers.html` (rated **9/10,
> OVERLAP:NONE**). This is a VERTICAL film-advance: big render+caption cels rise
> one per scroll-step on a single rigid track, through a void larger than the
> viewport, so **no two photos are ever on stage at once** — by construction, not
> by easing. The technique is its OWN component (NOT a cards-swipe or depth-stack
> variant): cards-swipe reads HORIZONTALLY across a flat track; depth-stack pushes
> planes through **Z** toward the viewer; vertical-slide advances cels **up the
> page on Y** with a held climax and a guaranteed clear void between every cel.

## The engine (what `component.js` owns)
One rigid `.track` (a flex column of `.slide`s, each = a `.frame` render + an
atomic `.cap` caption + a `.brk` void ordinal) is translated by **a single
`track.y`** (translateY) and nothing else. The whole advance is **one linear
tween** on `track.y` at constant velocity, mapped to a pinned ScrollTrigger with
`scrub:0.8` — **smoothing only, no snap**. Because the motion is one constant-
velocity tween on one property, **reverse is the exact inverse**.

- `pitchPx() = innerHeight * pitchVh` (default `2.00`) — PITCH in pixels, kept
  equal to the CSS `--pitch:200vh` so JS travel and DOM layout agree exactly.
- `centerOffset() = innerHeight/2 - pitchPx()/2` — places the FIRST cel's centre
  on screen at rest.
- `travelEndY() = centerOffset() - (N-1)*pitchPx()` — the track climbs exactly
  `(N-1)` pitches so each cel lands centred in turn.
- Timeline shape (total = 1.0): **MOVE** (`0..move`, default `0.80`) is the
  constant-velocity track climb; **HOLD** (`move..1`) parks the track on the
  terrace and ramps `--peak 0→1` for the climax breath.
- Pin budget: `end = (N-1) * innerHeight * endMult` (default `endMult:1.55`),
  `pin:true`, `pinSpacing:true`, `invalidateOnRefresh:true`.

The `CustomEase "air" = cubic-bezier(0.25,0.74,0.22,0.99)` is registered if
absent (kept for parity with the family even though the core advance is `ease:none`).

## THE ZERO-OVERLAP GEOMETRY (the real proof — preserved EXACTLY from vs3)
This is the heart of the technique and it is **geometry, not animation**:

```
PITCH  (centre-to-centre travel per step)  = 200vh     [CSS --pitch, JS innerHeight*2.00]
frameH (the photo's height, centred)       =  76vh     [CSS --frameH]
clear void GAP between one cel's BOTTOM and the next cel's TOP
       = PITCH - frameH = 200 - 76         = 124vh   >  one viewport (100vh)
```

Because the clear gap (124vh) **exceeds one viewport (100vh) by 24vh per side**,
the outgoing cel fully exits the TOP edge (clipped by `.stage overflow:hidden` —
the spent render is GONE) **before** the incoming cel's top reaches the BOTTOM
edge. At the mid-step the viewport is a solid graded **VOID** — the only thing on
screen is the thin `.brk` hairline + ordinal. At **no** scroll position are two
render photos partially visible at once. This is the single felt promise of the
component: **one photo on stage at a time.**

**Why the parallax + climax growth do NOT break it.** The three-plane offsets are
BOUNDED and live INSIDE `.frame` (`overflow:hidden`): `--par` (image lag) ≤ 2.4vh,
`--capPar` (caption lead) ≤ 1.6vh — inner transforms that never change WHICH cel
is centred. At the climax the frame grows to ≤ 94vh; with the ≤ 2.4vh image lag
the worst-case reach is **96.4vh < 124vh** void budget → still **> 100vh clear at
peak**. Growth is gated to the stationary HOLD, so a cel never grows while the
previous one is still leaving. **Do NOT change `pitchVh`/`frameH` without
re-proving the gap stays > 100vh.**

## The parallax-depth layering (the recorded variant trait)
Each cel is read as **three planes** riding slightly different vertical rates
within their own slide, so every cel has dimensionality as it rises:

- **`.frame` — the MASTER plane.** Rides the track exactly; nothing translates it
  except `track.y`, so it OWNS the zero-overlap math. A bounded per-leg
  scale-settle (`--settle`: `0 → 1` at centre, `→ 0.55` at exit) lets it "land".
- **`.frame__img` — the DEEP plane.** `--par` lags the photo SLOWER than the
  frame, easing `+par → 0 (centre) → -par`, like a distant background drifting
  slower; a per-leg ken-burns `--kb` (`kb0 → kb1`) settles the photo on top.
- **`.cap` — the NEAR plane.** `--capPar` LEADS the frame slightly (closer to the
  lens), the mirror (opposite sign) of the image. The caption is atomic inside
  `.frame`, so render + caption are ONE rigid block.
- **`.brk` — the void.** The chapter ordinal parallaxes OPPOSITE the rise
  (`--brkPar`), so the gap between cels reads as **depth between film planes**.

All four are bounded inner transforms; none of them move which cel is centred, so
none can cause overlap. The per-slide rates live in the `MODEL` rows (recorded
verbatim) and are also exposed per-slide in the `slides[]` data.

## The climax (lifestyle-climax beat)
The final terrace cel is `.is-climax`. During the HOLD the timeline keeps the
track stationary while `--peak` ramps `0 → 1`: the frame opens biggest (≤ 94vh),
its parallax push goes deepest, the chrome (progress rail + hint + scrim) dissolves
toward the photo. The single moody-twilight arc — *arrival from above → day façade
→ dusk pergola → material detail → golden terrace → **the terrace at sunset*** —
resolves on one held image.

## Reduced-motion / narrow path
`prefers-reduced-motion: reduce` OR `max-width:760px` collapses the whole engine:
the pinned `.stage` is hidden and a **BIG legible static stack** (`.static__shot`
cels already in the DOM, capped `max-height:124vh`) carries the same six images
with their captions. No pin, no motion, no track. The probe still passes via the
static branch (`>=3 static shots`).

## Motion contract (perf)
`motion_props: [transform, opacity]` only. The swap is **transform/opacity on
scrub** — never `clip-path`, `mix-blend`, or `backdrop-filter` as the transition,
never `video.currentTime`. The spent cel is removed purely by `.stage
overflow:hidden`. One moving surface (`track.y`) + bounded inner offsets + the
single `--peak` climax ramp. No WebGL.

## How it is recorded (reproduction shape)
The 5-artifact `official` set: `component.js` (the byte-faithful engine, real
`entry.call`, no magic numbers inline — `pitchVh`/`move`/`scrub`/`endMult` and the
per-slide `MODEL` are the knobs), `component.css` (the recorded track/slide/frame/
caption/void CSS carrying `--pitch`/`--frameH`), `tokens.json` (the knob contract
with the zero-overlap math as the load-bearing `pitchVh`/`frameH` pair), `lab.html`
(loads `component.js`+`component.css`, calls `init` with the real QUADRO twilight
slides pointing at `renders/`, sets `window.__LAB_OK__` after asserting gsap +
ScrollTrigger + exactly one pinned `.track` + ≥3 cels), and green
`scripts/library-verify.mjs`.

## variants: parallax-depth
The recorded vs3 IS the `parallax-depth` reading (the three-plane depth layer over
the base cln5 clean-advance track). A future params-over-base delta could express
a flatter "clean-advance only" cut (zero `par`/`capPar`/`brk`, no climax growth)
without forking `component.js` — but the recorded, owner-approved technique is the
full parallax-depth version, so it is the base here.
