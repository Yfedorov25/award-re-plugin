---
id: appear
name: "Reveal-on-enter gate"
level: u
kind: shared-util
status: wip
entry:
  call: "Appear.mount(el, opts)"
  module: iife
  returns: "controller | void"
meaning:
  what: "Fades/translates an element in once when it enters the viewport (IntersectionObserver); the decode-gate intro variant adds a brief blur/clip settle."
  when: "Any element that should arrive on enter rather than on load (avoids the load-jump)."
  lands: "supports the section's spine; never the headline move on its own."
  not_when: "as a section's primary pinned mechanic — promote to components/ first."
source:
  grammar: "cited by library/combos/* — extracted from Vide Infra-class builds"
  recording: null
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger"
webgl: false
motion_props: [transform, opacity, filter]
trigger: "rides a spine's scroll progress OR onEnter; never owns a pin"
timing_layer: [B-entrance]
owns_pin: false
combines_with: [reveal, splitLines]
anti_combos: []
gated_by: [R_perf_limits, R_timing_layers]
files: [util.js, util.css]
acceptance:
  - "rides an existing progress / onEnter; never creates a second pin"
  - "transform, opacity, filter only; reduced-motion gives a static fallback"
verify: "n/a (shared-util stub — promote via /award-re:learn for a runnable lab)"
---

# Reveal-on-enter gate — shared-util stub

> **kind: shared-util.** Cited by one or more `library/combos/*` `uses:` entries.
> This is a STUB so the dependency graph resolves (no dangling `uses:`). Real
> parameterized code is extracted into a full `components/appear/` later via
> `/award-re:learn --promote`. Until then this carries the meaning + the real
> call signature the spine expects.

## What it does
Fades/translates an element in once when it enters the viewport (IntersectionObserver); the decode-gate intro variant adds a brief blur/clip settle.

## When to reach for it
Any element that should arrive on enter rather than on load (avoids the load-jump).

## Real call signature
```js
Appear.mount(el, opts)
```

## Composition note
Rides the section spine's single scroll progress (or fires `onEnter`). It NEVER
owns a pin — that belongs to the combo's `pin.owner`. Animated props: `transform, opacity, filter`.
