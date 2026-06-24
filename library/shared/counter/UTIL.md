---
id: counter
name: "Count-up number ticker"
level: u
kind: shared-util
status: wip
entry:
  call: "Counter.mount(el, opts)"
  module: iife
  returns: "controller | void"
meaning:
  what: "Animates a number from a start to a target as the section scrolls or enters; used for stats and step indices."
  when: "A stat/metric or step index that should tick up rather than appear static."
  lands: "supports the section's spine; never the headline move on its own."
  not_when: "as a section's primary pinned mechanic — promote to components/ first."
source:
  grammar: "cited by library/combos/* — extracted from Vide Infra-class builds"
  recording: null
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger"
webgl: false
motion_props: [opacity]
trigger: "rides a spine's scroll progress OR onEnter; never owns a pin"
timing_layer: [C-emphasis]
owns_pin: false
combines_with: [reveal, parallax-depth]
anti_combos: []
gated_by: [R_perf_limits, R_timing_layers]
files: [util.js, util.css]
acceptance:
  - "rides an existing progress / onEnter; never creates a second pin"
  - "opacity only; reduced-motion gives a static fallback"
verify: "n/a (shared-util stub — promote via /award-re:learn for a runnable lab)"
---

# Count-up number ticker — shared-util stub

> **kind: shared-util.** Cited by one or more `library/combos/*` `uses:` entries.
> This is a STUB so the dependency graph resolves (no dangling `uses:`). Real
> parameterized code is extracted into a full `components/counter/` later via
> `/award-re:learn --promote`. Until then this carries the meaning + the real
> call signature the spine expects.

## What it does
Animates a number from a start to a target as the section scrolls or enters; used for stats and step indices.

## When to reach for it
A stat/metric or step index that should tick up rather than appear static.

## Real call signature
```js
Counter.mount(el, opts)
```

## Composition note
Rides the section spine's single scroll progress (or fires `onEnter`). It NEVER
owns a pin — that belongs to the combo's `pin.owner`. Animated props: `opacity`.
