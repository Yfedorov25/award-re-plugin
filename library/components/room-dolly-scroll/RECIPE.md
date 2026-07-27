---
id: room-dolly-scroll
name: "Room dolly-scroll (a pinned multi-layer parallax that fakes a forward camera dolly into a scene; near layers grow + rush past, far barely move; a focal headline arrives — a NO-WebGL approximation of a 3D room walk)"
level: 2
kind: component
status: official
entry:
  call: "RoomDollyScroll.create(target, opts)  // target = .rds-stage > .rds-layer[data-depth] x N (far..near) + optional [data-arrive] focal block. opts: { dollyGain, driftY, arriveAt, pinFactor, ease, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), destroy }"
meaning:
  what: "gapsystudio's HOME camera-dolly, done WITHOUT WebGL — a pinned scroll-scrub drives a multi-layer parallax that fakes a forward dolly into a scene. Each layer carries a data-depth (0 far .. 1 near); on scroll the near layers GROW (scale) + rush past faster while far layers barely move, so the viewer reads as flying INTO the space. A focal 'wall' headline arrives as the camera gets there. set(p) is a PURE scrub."
  when: "An immersive intro / hero / chapter break where you want the sense of MOVING INTO a place — a lobby, a room, a landscape — without the cost or the ban of WebGL. Use it for a studio/agency feel or a dramatic 'arrive at the statement' hero. It's the no-WebGL stand-in for a 3D camera walk; for a real rendered fly-through, swap in pre-rendered frames via scroll-scrub-video (see note)."
  lands: "You scroll and the screen seems to push forward — the nearest things swell and sweep past the edges while the far wall holds steady, as if you're walking into the room. Just as you arrive, a big headline fades up on the wall ahead. It feels like a camera move into a 3D space, even though it's flat layers sliding and scaling at different speeds."
  not_when: "A real, explorable 3D scene (then you need WebGL / a model — out of scope). A flat content section (no depth wanted). When you have only one image (the illusion needs layered depth — at least a far + a near). More than once or twice per page (the dolly is a set-piece). Tiny viewports where the scale-up crops the subject badly (test the near-layer framing)."
source:
  grammar: "gapsy home: scroll dollies the camera through rooms (hero-wall 3D letters -> showreel-room -> portfolio-room -> ping-pong room); foreground geometry sweeps past as the camera advances and each wall's headline arrives in turn. (Live WebGL in the original.)"
  recording: "apps/quadro/.award-re/teardowns/D_gapsy_video.md (A home studio-tour; gapsystudio.com, basket B — fake-3D, honest approximation)"
  registry_ref: ["A-room-dolly-scroll-gapsy"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity]
trigger: "owns_pin scroll-scrub (pinned for innerHeight*pinFactor)"
timing_layer: [A-intro, B-reveal]
owns_pin: true
owns_scroll: false
page_beat: [hero, intro, chapter-break]
combines_with: [script-overline-display-pair, menu-tracked-stagger, floating-product-orbit, scroll-scrub-video]
anti_combos: [center-seam-split, second-pin, real-webgl-scene]
gated_by: [R_anti_combos, R_perf_limits, R_owns_pin]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "N full-bleed layers each with a data-depth (0 far .. 1 near); on a pinned scroll-scrub each scales 1 + p*dollyGain*depth and drifts translate3d Y = p*driftY*(depth-0.5)*2"
  - "the depth DIFFERENTIAL is the effect: near layers grow much more than far (e.g. near 2.4x vs far 1.16x at p=1) -> reads as a forward camera dolly"
  - "the nearest layers (depth>0.75) fade out as they pass the camera near the end (p>0.78)"
  - "a focal [data-arrive] block reveals (opacity + translateY 30->0 + scale 0.96->1) over [arriveAt..1], power3.out"
  - "transform: scale + translate3d + opacity only; NO mix-blend over the layers; NO WebGL; owns_pin (one pin)"
  - "reduced-motion or <=820px -> arrived state (focal shown), no pin; GSAP+ScrollTrigger required; window.__LAB_OK__ on init"
  - "HONESTY: this is an APPROXIMATION of a live-3D room walk (the gapsy original is WebGL); it's layered parallax, not a 3D scene — RECIPE/tokens say so + point to scroll-scrub-video for a true rendered dolly"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the pinned stage: the scene pushes forward (near layers swell + sweep past, far holds), and a focal headline arrives near the end. owns_pin scroll-scrub. Verify the per-layer scale spread (near >> far at the same p) + the arrive window + fps/jank. GATE-BLINDSPOT: a static screenshot reads as a plain zoom — check the far-vs-near scale differential to confirm the dolly. Drive the LAB's own pinned instance to screenshot."
note: |
  Brick 6 (final) of the gapsystudio harvest. The home's signature WebGL camera-dolly through
  a 3D studio, done as an HONEST no-WebGL approximation: a pinned multi-layer parallax where
  near layers grow + rush past and far barely move, faking a forward dolly, with a focal
  headline arriving. NOT a real 3D scene (the gapsy original is live WebGL, which the plugin
  forbids) — depth is authored per-layer (data-depth), not computed. transform + opacity only
  = GPU-cheap (0.1% jank with 4 full-bleed layers). owns_pin. HIGHER-FIDELITY PATH: feed a
  pre-rendered fly-through frame sequence into the sibling scroll-scrub-video brick for a true
  rendered dolly without runtime WebGL. Proven 1:1 on QUADRO layers: near scale 2.44x vs far
  1.16x at p=1, arrive headline after 0.55, 59.9fps. gapsy hero-wall = red extruded 3D letters
  (here a CSS red text-shadow stand-in).
---

# room-dolly-scroll — a multi-layer parallax fakes a forward camera dolly (NO-WebGL approximation)

gapsystudio's home is a live-WebGL walk through a 3D studio (scroll = camera deeper into the
room). This is the **honest no-WebGL approximation**: a pinned scroll-scrub drives a multi-layer
parallax — near layers grow + rush past, far barely move — so you read as flying into the scene,
with a focal headline arriving at the end. Not a real 3D scene; for a true rendered fly-through,
feed pre-rendered frames into the sibling `scroll-scrub-video` brick.

## Markup + call
```html
<section class="rds-stage" id="room">
  <div class="rds-layer" data-depth="0.1"><img src="far.webp"></div>
  <div class="rds-layer" data-depth="0.5"><img src="mid.webp"></div>
  <div class="rds-layer" data-depth="0.9"><img src="near.webp"></div>
  <div data-arrive class="arrive-in"><h1>HEADLINE</h1></div>
</section>
```
```js
RoomDollyScroll.create('#room', { dollyGain:1.6, driftY:120, arriveAt:0.55, pinFactor:1.8, manageLenis:false });
```

## Proven (the lab)
4 full-bleed QUADRO layers (day-front far d0.1 / terrace mid d0.5 / aerial floor d0.7 /
macro-pergola near d0.9) + a focal red 3D-text headline. Curve measured live
(p / far-scale / mid / near / arrive-op):
0 / 1.000 / 1.000 / 1.000 / 0 → 0.30 / 1.048 / 1.240 / 1.432 / 0 → 0.55 / 1.088 / 1.440 / 1.792 / 0 →
0.80 / 1.128 / 1.640 / 2.152 / 0.91 → 1 / 1.160 / 1.800 / 2.440 / 1. Near grows 2.44× vs far 1.16×
= the dolly differential; the arrive headline reveals after 0.55. Mid-dolly: the foreground
pergola layer (scale 1.6) sweeping past the camera; arrived: "FROM COOL IDEA INSANELY GREAT" red
extruded-style headline on the dollied-in scene (matches gapsy hero-wall arrival). Probe (4× CPU
throttle, 4 full-bleed layers scaling): 1/789 long frames (0.1%), 59.9fps → PASS. Zero console errors.
