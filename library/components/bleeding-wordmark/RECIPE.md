---
id: bleeding-wordmark
name: "Oversized bleeding section wordmark (fill + clip-reveal + outline/solid)"
level: 2
kind: component
status: official
entry:
  call: "BleedingWordmark.init(target, opts)  // target = .bwm wrap el/selector(s). Markup: <div class='bwm' data-bleeding-wordmark data-fill='outline'><span class='bwm__i'>WORD</span></div>. opts: { fill, strokePx, gutter, fillRatio, reveal, parallax, container }. Composes FluidType (sibling) for the fill."
  module: iife
  returns: "{ words, refit }"
meaning:
  what: "The oversized SECTION WORD that bleeds off the panel/viewport edge — the EVER 'ARCHITECTURE / INTERIOR / TERRITORY', Springs 'Wellness / Nature / Place' signature. Three things make it VI-grade rather than a big <h2>: (1) it FILLS the line — the word spans (container width - gutters) at a giant scale via the fluid-type-sizing engine (composed in; any word, any length); (2) CLIPPED REVEAL from the bottom edge — the word sits in an overflow:hidden wrap and rises (translateY 110%->0) into place, clipped by the panel edge so it bleeds; (3) MIRROR-LAW fill — outline (-webkit-text-stroke, transparent fill) for one section, SOLID cream for the next (data-fill). Plus an optional slow parallax (~0.5x the bg) on scroll. Degrades gracefully: with GSAP+ScrollTrigger it scroll-reveals + parallaxes, else reveals on load, else static."
  when: "Any section that wants the VI signature giant word anchored to its bottom edge, bleeding, building as you arrive — chapter titles, section labels, a hero brand word. The thing that makes EVER/Springs sections feel authored: one oversized word per chapter, filled edge-to-edge, outline or solid by the mirror law, clipped by the fold."
  lands: "A giant section word spans the line gutter-to-gutter and rises into place clipped by the bottom edge — outline for one chapter, solid for the next — so adjacent sections read distinct from one mechanic. It bleeds off the edge like a magazine masthead, not a centered heading at a guessed size."
  not_when: "Body copy or any multi-line/legible-size text. A word that must sit at an exact authored size (not filled). When there is no oversized-word beat in the design (don't force a giant word where the section doesn't call for one). A true vector brand LOGO -> use fluid-type-sizing mode 'vector' directly."
source:
  grammar: "EVER section wordmarks (108px / vector logo filled to width, letter-spacing -2.16, clipped reveal, outline ARCHITECTURE vs solid INTERIOR/TERRITORY) + Springs (Wellness/Nature/Place). Live-measured + teardown."
  recording: "ever-live-here.com sections (live) + apps/quadro/.award-re/teardowns/EVER-MOTION-SPEC-live.md"
  registry_ref: ["T-bleedingwm-ever"]
stack: "vanilla JS; composes fluid-type-sizing; optional GSAP 3.12.5 + ScrollTrigger + Lenis for reveal/parallax"
webgl: false
motion_props: [transform]
trigger: "ScrollTrigger reveal (once, translateY rise) + optional scrub parallax (yPercent); or reveal-on-load without ScrollTrigger; or static under reduced-motion"
timing_layer: [B-entrance, A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [hero, chapter, material]
combines_with: [fluid-type-sizing, section-pager, section-curtain-riseover, dual-slicer, parallax-collage, theme-tween]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the word FILLS the line: it spans (container width - gutters)*fillRatio via fluid-type-sizing (different words/lengths each reach the same width at their own font-size)"
  - "CLIPPED REVEAL: the word sits in an overflow:hidden wrap and rises translateY(110%->0) into place (clipped by the bottom edge = bleeds); reveal = overflow clip + translateY, NOT clip-path on text"
  - "MIRROR-LAW fill: data-fill='outline' -> -webkit-text-stroke + transparent fill; data-fill='solid' -> cream fill; adjacent sections flip (proven: архітектура outline / тераса solid)"
  - "optional slow parallax (~0.5x) on scroll when GSAP+ScrollTrigger present; degrades to reveal-on-load without them; static under reduced-motion"
  - "transform-only, GPU layer (will-change:transform); NO mix-blend / NO backdrop"
  - "composes fluid-type-sizing (the fill) — proven working together in the lab"
  - "asset-substitution gate: OUR words (архітектура/тераса) over OUR renders; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html (served from library/components/ so the fluid-type-sizing sibling resolves). __LAB_OK__ true. Confirm: each word fills the line gutter-to-gutter at its own size; outline vs solid per data-fill; scroll reveals the word rising clipped from the bottom edge; (optional) it parallaxes slightly slower than the bg. Normal smoothness gate (no two-render overlap): 0 blank, fps>=50, jank<8%."
note: |
  A critical brick the first 5 engines referenced as 'combines_with' but did not
  build standalone. It is the visible half of the EVER/Springs section identity (the
  other half is theme-tween). Composes fluid-type-sizing (fill) + a clip wrap; the
  section-pager/dual-slicer host it. Built per the catalog re-count: 23 primitives
  total, this is one of the 4 critical remaining (with theme-tween, persistent-index-
  menu, rotated-mosaic-hero).
---

# bleeding-wordmark — oversized bleeding section wordmark

The VI signature giant section word anchored to the bottom edge, bleeding, building
as you arrive. Three things make it grade: fill-to-line (fluid-type-sizing), clipped
reveal from the bottom edge, and the mirror-law outline↔solid fill.

## Markup + call
```html
<div class="bwm" data-bleeding-wordmark data-fill="outline">
  <span class="bwm__i">архітектура</span>
</div>
```
```js
BleedingWordmark.init('[data-bleeding-wordmark]', { gutter:0, fillRatio:1, parallax:0.4 });
```
Load fluid-type-sizing/component.js first for the fill; GSAP+ScrollTrigger+Lenis
optional for the scroll reveal + parallax.

## Proven (the lab)
OUR words over OUR renders: архітектура (outline, 1.6px cream stroke, fs 261px) +
тераса (solid cream, fs 445px), each filled to 1336px (width − gutters), each
clip-revealing on scroll, mirror-law flip confirmed. Composes live with
fluid-type-sizing.
