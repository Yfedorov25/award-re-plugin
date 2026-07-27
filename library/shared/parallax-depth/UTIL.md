---
id: parallax-depth
name: "Inline scroll-keyframe depth"
level: u
kind: shared-util
status: wip
entry:
  call: "ParallaxDepth.mount(el, opts)"
  module: iife
  returns: "controller | void"
meaning:
  what: "Drives translateY/translateX of layers from scroll progress (inline scroll-keyframe, no pin) to give a flat section depth."
  when: "Any non-pinned section that should carry length with DEPTH instead of a pin."
  lands: "supports the section's spine; never the headline move on its own."
  not_when: "as a section's primary pinned mechanic — promote to components/ first."
source:
  grammar: "cited by library/combos/* — extracted from Vide Infra-class builds"
  recording: null
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger"
webgl: false
motion_props: [transform]
trigger: "rides a spine's scroll progress OR onEnter; never owns a pin"
timing_layer: [A-ambient]
owns_pin: false
combines_with: [any spine]
anti_combos: []
gated_by: [R_perf_limits, R_timing_layers]
files: [util.js, util.css]
acceptance:
  - "rides an existing progress / onEnter; never creates a second pin"
  - "transform only; reduced-motion gives a static fallback"
verify: "n/a (shared-util stub — promote via /award-re:learn for a runnable lab)"
---

# Inline scroll-keyframe depth — shared-util stub

> **kind: shared-util.** Cited by one or more `library/combos/*` `uses:` entries.
> This is a STUB so the dependency graph resolves (no dangling `uses:`). Real
> parameterized code is extracted into a full `components/parallax-depth/` later via
> `/award-re:learn --promote`. Until then this carries the meaning + the real
> call signature the spine expects.

## What it does
Drives translateY/translateX of layers from scroll progress (inline scroll-keyframe, no pin) to give a flat section depth.

## When to reach for it
Any non-pinned section that should carry length with DEPTH instead of a pin.

## Real call signature
```js
ParallaxDepth.mount(el, opts)
```

## Composition note
Rides the section spine's single scroll progress (or fires `onEnter`). It NEVER
owns a pin — that belongs to the combo's `pin.owner`. Animated props: `transform`.
