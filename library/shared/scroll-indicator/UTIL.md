---
id: scroll-indicator
name: "Scroll hint + progress"
level: u
kind: shared-util
status: wip
entry:
  call: "ScrollIndicator.mount(el, opts)"
  module: iife
  returns: "controller | void"
meaning:
  what: "A scroll-cue line/dot that hints downward motion and flips to is-finished when its section is consumed."
  when: "Hero/section ends that should bait the next scroll and report completion."
  lands: "supports the section's spine; never the headline move on its own."
  not_when: "as a section's primary pinned mechanic — promote to components/ first."
source:
  grammar: "cited by library/combos/* — extracted from Vide Infra-class builds"
  recording: null
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger"
webgl: false
motion_props: [transform, opacity]
trigger: "rides a spine's scroll progress OR onEnter; never owns a pin"
timing_layer: [A-ambient]
owns_pin: false
combines_with: [puzzle-image, slide-out-img-text]
anti_combos: []
gated_by: [R_perf_limits, R_timing_layers]
files: [util.js, util.css]
acceptance:
  - "rides an existing progress / onEnter; never creates a second pin"
  - "transform, opacity only; reduced-motion gives a static fallback"
verify: "n/a (shared-util stub — promote via /award-re:learn for a runnable lab)"
---

# Scroll hint + progress — shared-util stub

> **kind: shared-util.** Cited by one or more `library/combos/*` `uses:` entries.
> This is a STUB so the dependency graph resolves (no dangling `uses:`). Real
> parameterized code is extracted into a full `components/scroll-indicator/` later via
> `/award-re:learn --promote`. Until then this carries the meaning + the real
> call signature the spine expects.

## What it does
A scroll-cue line/dot that hints downward motion and flips to is-finished when its section is consumed.

## When to reach for it
Hero/section ends that should bait the next scroll and report completion.

## Real call signature
```js
ScrollIndicator.mount(el, opts)
```

## Composition note
Rides the section spine's single scroll progress (or fires `onEnter`). It NEVER
owns a pin — that belongs to the combo's `pin.owner`. Animated props: `transform, opacity`.
