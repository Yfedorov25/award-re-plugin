---
id: theme-flip
name: "Section theme temperature flip"
level: u
kind: shared-util
status: wip
entry:
  call: "ThemeFlip.mount(root, opts)"
  module: iife
  returns: "controller | void"
meaning:
  what: "Cross-fades a section's skin (dark<->light, warm<->cool) tied to scroll progress; one temperature change, no pin of its own."
  when: "A bridge/manifesto beat that should change the page's temperature on scroll."
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
timing_layer: [A-ambient]
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

# Section theme temperature flip — shared-util stub

> **kind: shared-util.** Cited by one or more `library/combos/*` `uses:` entries.
> This is a STUB so the dependency graph resolves (no dangling `uses:`). Real
> parameterized code is extracted into a full `components/theme-flip/` later via
> `/award-re:learn --promote`. Until then this carries the meaning + the real
> call signature the spine expects.

## What it does
Cross-fades a section's skin (dark<->light, warm<->cool) tied to scroll progress; one temperature change, no pin of its own.

## When to reach for it
A bridge/manifesto beat that should change the page's temperature on scroll.

## Real call signature
```js
ThemeFlip.mount(root, opts)
```

## Composition note
Rides the section spine's single scroll progress (or fires `onEnter`). It NEVER
owns a pin — that belongs to the combo's `pin.owner`. Animated props: `opacity`.
