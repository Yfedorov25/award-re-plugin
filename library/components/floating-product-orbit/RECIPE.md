---
id: floating-product-orbit
name: "Floating product-orbit (an object floats above a red pedestal: idle float + pointer-tilt parallax in a CSS perspective scene; a NO-WebGL approximation of an orbiting 3D product)"
level: 2
kind: component
status: official
entry:
  call: "FloatingProductOrbit.create(target, opts)  // target = .fpo-stage (perspective) > .fpo-scene (preserve-3d) > .fpo-object(img) + .fpo-pedestal + [.fpo-ring]. opts: { maxTilt, depth, float, lerp, idle }."
  module: iife
  returns: "{ set(px,py), start(), stop(), destroy }"
meaning:
  what: "gapsystudio's services 'product on a pedestal' — a staged object floating above a red plinth that IDLES with a slow float + tiny rotate and TILTS toward the pointer (rotateX/rotateY parallax in a CSS perspective scene), the pedestal + a chrome ring reacting at a shallower depth. A NO-WebGL approximation of an orbiting 3D product (CSS 3D transforms on a flat object image + a CSS-built pedestal), NOT a real 3D mesh."
  when: "A services / feature / product beat where you want a hero OBJECT that feels alive and three-dimensional next to the copy — without paying the WebGL cost (which the plugin forbids). Pair it with script-overline-display-pair (the object on one side, the type on the other). Use it when a flat product shot feels dead but a real 3D scene is overkill / off-limits; the idle float + pointer-tilt give 'it's a thing on a stage' for cheap."
  lands: "Beside the headline sits an object on a little red pedestal, gently bobbing as if weightless. As you move your cursor across it, it leans toward you — turning a few degrees — and the pedestal and a thin chrome ring shift a little less, so it reads as floating in front of its base. It feels like a 3D product you could pick up, though it's just a picture tilting in a CSS scene."
  not_when: "A real configurable 3D product (then you genuinely need WebGL / a model — out of scope here). A flat editorial image (no pedestal drama needed). Touch-primary surfaces where there's no pointer to tilt toward (it falls back to idle-only). When the object image has no clean cutout (the float/tilt exposes a hard rectangle edge — use a transparent PNG / a framed card)."
source:
  grammar: "gapsy /services: a red stacked pedestal with a glass card + red shapes + small icons (magnifier for UX Audit, brain+gears 'AI' for Visual Identity) on top, slowly orbiting / parallaxing as you move the pointer."
  recording: "apps/quadro/.award-re/teardowns/D_gapsy_video.md (D /services; gapsystudio.com, NO-WebGL basket A — honest approximation of live-3D)"
  registry_ref: ["D-floating-product-orbit-gapsy"]
stack: "vanilla (CSS 3D transforms; rAF idle; IntersectionObserver-gated; no GSAP, NO WebGL)"
webgl: false
motion_props: [transform]
trigger: "hover + always-on idle (triggered primitive; not scroll)"
timing_layer: [D-interaction]
owns_pin: false
owns_scroll: false
page_beat: [services, feature, product-stage]
combines_with: [script-overline-display-pair, menu-tracked-stagger, coords-corner-frame]
anti_combos: [object-over-scrubbed-surface]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a CSS perspective scene (.fpo-stage perspective, .fpo-scene preserve-3d) with a floating object (.fpo-object img) above a CSS-built red pedestal (.fpo-pedestal) + optional chrome ring (.fpo-ring)"
  - "idle: the object floats translateY = sin(t)*float + a tiny rotate, always-on, gated by an IntersectionObserver (pauses off-screen)"
  - "pointer: object rotateY = pointerX(-1..1)*maxTilt, rotateX = -pointerY*maxTilt, eased (lerp); the pedestal tilts at maxTilt*depth and the ring at maxTilt*(depth+0.2) — shallower parallax"
  - "set(px,py 0..1) manually drives the tilt (PURE, for previews); reduced-motion -> static"
  - "transform: perspective rotateX/rotateY/translateY only; NO mix-blend over the object; NO WebGL"
  - "HONESTY: this is an APPROXIMATION of a live-3D product (the gapsy original is WebGL); it is a flat image tilting in a CSS scene, not a 3D mesh — RECIPE/tokens state this plainly"
  - "asset-substitution gate: OUR QUADRO render as the object + a red pedestal + warm palette; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The object bobs gently above the red pedestal (idle); move the pointer across the scene -> it leans toward the cursor, the pedestal + ring lean less (parallax). Triggered hover + idle (NOT scroll) -> verify the idle float changes over time + set(1,0.5)/set(0,0.5) tilt sign + the pedestal's shallower depth + fps. A static screenshot can't show motion — read the transform values."
note: |
  Brick 5 of the gapsystudio harvest (NO-WebGL basket A). The 'product on a pedestal' beat,
  done as an HONEST no-WebGL approximation: a flat object image floating + tilting in a CSS
  perspective scene over a CSS-built red plinth + chrome ring, with idle float and
  pointer-parallax (pedestal/ring shallower). NOT a real 3D mesh — the gapsy original is live
  WebGL, which the plugin forbids; this trades fidelity for the no-WebGL law (precedent: the
  quadro pre-rendered 3D-viewer). transform-only = GPU-cheap; rAF gated by IntersectionObserver.
  owns_pin false. Proven on a QUADRO macro render: idle float 7->9.7px, pointer-tilt +17deg
  object / +6.7deg pedestal (depth 0.42), sign flips L/R; 0.0% jank @ 59.9fps, zero console
  errors. For higher fidelity later: feed a pre-rendered turntable frame-sequence as the object.
  gapsy palette = studio near-white + red #f0473e pedestal.
---

# floating-product-orbit — an object floats + tilts above a red pedestal (NO-WebGL approximation)

gapsystudio's services product-stage: an object floats above a red plinth, bobbing gently (idle)
and tilting toward the pointer (rotateX/rotateY parallax in a CSS perspective scene), with the
pedestal + a chrome ring leaning at a shallower depth. An **honest no-WebGL approximation** of an
orbiting 3D product — a flat image tilting in a CSS scene, not a 3D mesh.

## Markup + call
```html
<div class="fpo-stage" id="orbit">
  <div class="fpo-scene">
    <div class="fpo-pedestal"></div>
    <div class="fpo-ring"></div>
    <div class="fpo-object"><img src="object.webp"></div>
  </div>
</div>
```
```js
FloatingProductOrbit.create('#orbit', { maxTilt:16, depth:0.42, float:10, lerp:0.08, idle:true });
```

## Proven (the lab)
OUR QUADRO macro render as the object on a CSS red pedestal + chrome ring. Measured live: idle
float translateY 7.09px → 9.73px over 0.5s (always-on); set(1,0.5) → object rotateY +17.16°,
pedestal rotateY +6.72° (=16×0.42 depth, shallower); set(0,0.5) → object rotateY −14.81° (sign
flips). Screenshot (tilt 0.85,0.3): the object card angled in 3D above the red plinth with the
chrome ring, paired with a script-overline + "UX-аудит" display (matches gapsy /services feel).
Probe (4× CPU throttle, pointer gliding the scene): 0/544 long frames (0.0%), 59.9fps → PASS.
Zero console errors.
