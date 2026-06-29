---
id: portrait-carousel
name: "Arrow portrait carousel (vertical push-slice + copy-lag + ken-burns)"
level: 2
kind: component
status: official
entry:
  call: "PortraitCarousel.init(target, opts)  // target = .pc-stage el/selector. Markup-first: .pc-slide children carry data-image / data-copy; the engine builds the 2-layer push frame, wires .pc-prev / .pc-next, drives the copy. opts: { slides, pushMs, copyLagMs, loop, kenBurns, onChange }."
  module: iife
  returns: "{ go(dir), current(), slides }"
meaning:
  what: "Springs' terrace CAROUSEL — an arrow-driven portrait carousel where slides change by a VERTICAL SLICE/PUSH inside a fixed portrait frame (NEXT: the incoming image slides UP from the bottom and the outgoing rides off the top; PREV: the incoming enters from the top — a vertical push, NOT a crossfade / horizontal / clip wipe), the right-column copy crossfading a beat AFTER the image (the picture lands first, the words confirm second), and each slide slowly Ken-Burns drifting. Two outline circular ← → controls. Config-driven: any slides, push speed, loop, ken-burns on/off."
  when: "A gallery of a few framed views that the visitor pages through one at a time — terraces, amenities, room views, location shots — where each deserves a held portrait frame + a caption and you want elegant arrow navigation, not a scroll-stepper or a thumbnail strip. The 'flip through the beautiful views' beat, the Springs terrace carousel."
  lands: "A portrait window of a view with a caption beside it; click an arrow and the image slides vertically to the next view while the caption resettles a beat later, the picture gently breathing the whole time. It reads like turning the pages of a lookbook — calm, framed, deliberate — not a noisy slider or a flat thumbnail grid."
  not_when: "A single media (oval-mask / a plain frame). A named-options menu where you JUMP non-linearly (persistent-index-menu). A full-bleed cinematic (section-pager / media-step-switch). Many items to scan at once (a grid / cards-swipe). When the section must be scroll-driven rather than clicked."
source:
  grammar: "springs.estate terrace carousel (CLIP B), frame-by-frame: fixed portrait frame, NEXT incoming-from-below / PREV incoming-from-top vertical push (~0.7-0.85s), copy crossfade lagging the image by ~1 frame, ken-burns per slide, circular arrow controls."
  recording: "apps/quadro/.award-re/teardowns/D_springs_nature_and_carousel_clips.md (CLIP B)"
  registry_ref: ["T-carousel-springs"]
stack: "vanilla JS only (no libs). rAF push tween + CSS ken-burns keyframes."
webgl: false
motion_props: [transform, opacity]
trigger: "click on .pc-prev / .pc-next (or Arrow left/right) -> rAF vertical-push of the image + lagged copy crossfade. NOT scroll-driven."
timing_layer: [B-entrance, A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [material, proof, amenities]
combines_with: [circular-ui-language, bleeding-wordmark, theme-tween, section-pager]
anti_combos: [cards-swipe, media-step-switch]
gated_by: [R_perf_limits, R_reduced_motion_fallback]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a FIXED portrait frame (overflow:hidden, ~0.66-1.0 ratio) with a 2-layer image stack inside"
  - "slide change = VERTICAL PUSH: NEXT incoming from BELOW (translateY 100%->0) / PREV incoming from ABOVE (-100%->0), outgoing rides off the opposite edge — NOT a crossfade, NOT horizontal, NOT clip-X (proven mid-push: one layer travelling, one entering)"
  - "the right-column COPY crossfades (fade out -> swap -> fade+rise) a beat AFTER the image (copyLag); picture leads, words confirm"
  - "each slide image Ken-Burns drifts (slow scale/translate loop), off under reduced-motion"
  - "two outline circular <- -> controls (hover-brighten); click + Arrow keys drive it; loops past the ends"
  - "transform (push + ken-burns) + opacity (copy) only; GPU layers; NO mix-blend / NO backdrop over the moving image"
  - "reduced-motion -> hard swap, no ken-burns; window.__LAB_OK__ on init; asset-substitution gate: OUR terrace renders + Ukrainian captions + circular controls"
gate:
  probe: "Open lab.html. __LAB_OK__ true (pc-ready). Click -> : the image slides up to the next (mid-push shows one layer travelling, not a fade), the copy swaps a beat after; click <- : it reverses (incoming from top). Smoothness gate in CURTAIN mode (CURTAIN=1; the push shows two image layers during the swap): PASS = 0 blank, fps>=50, jank<8%."
note: |
  Smaller brick 2 of 7. Shares the 2-layer vertical-push with persistent-index-menu
  but is arrow/sequential (loops, PREV reverses) in a portrait ken-burns frame.
  Pairs with circular-ui-language (the arrow buttons) — that brick is still to come;
  for now the lab inlines simple circular arrow svgs.
---

# portrait-carousel — arrow portrait carousel (vertical push + copy-lag + ken-burns)

Springs' terrace carousel: a portrait frame you page through with arrows, slides
changing by a vertical push (NEXT from below, PREV from top), copy lagging a beat,
each view gently Ken-Burns breathing.

## Markup + call
```html
<section class="pc-stage" id="carousel" tabindex="0">
  <div class="pc-frame"></div>
  <div class="pc-right">
    <p class="pc-copy"></p>
    <div class="pc-controls">
      <button class="pc-btn pc-prev">‹</button>
      <button class="pc-btn pc-next">›</button>
    </div>
  </div>
  <div class="pc-slide" data-image="a.webp" data-copy="…" hidden></div>
  <div class="pc-slide" data-image="b.webp" data-copy="…" hidden></div>
</section>
```
```js
PortraitCarousel.init('#carousel', { pushMs: 780, loop: true, kenBurns: true });
```

## Proven (the lab)
OUR terrace renders in a 0.66 portrait frame + Ukrainian captions + circular controls
on a deep-green plate. NEXT: layerA −458 up, layerB 160 from below = vertical push;
copy "Тераса..." → "Затишна перлога..." a beat after; ken-burns on. CURTAIN gate
PASS: 0 blank, 59.9fps, jank 0/354.
