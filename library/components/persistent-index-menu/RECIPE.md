---
id: persistent-index-menu
name: "Persistent-index amenity menu (split + push-swap + constant glow)"
level: 2
kind: component
status: official
entry:
  call: "PersistentIndexMenu.init(target, opts)  // target = .pim-stage el/selector. Markup-first: .pim-item children carry data-label / data-media / data-copy; the engine builds the 2-layer media push stack, the index buttons, drives the copy. opts: { items, pushMs, copyDelayMs, activeOpacity, dimOpacity, onChange }."
  module: iife
  returns: "{ go(i), current(), items }"
meaning:
  what: "Springs' Wellness amenity menu (Spa/Yoga/Fitness/Café) — a list-index <-> (media + copy) binding. SPLIT layout: media LEFT (a hard rectangle window), a PERSISTENT serif INDEX + body copy RIGHT, over a constant gradient glow. The index is a FIXED stack of N words (active bright, rest dimmed ~0.35); it never moves, only the highlight changes. CLICK-DRIVEN (not scroll-jacked) — the label LEADS (lights instantly), then the media swaps by a VERTICAL PUSH (a 2-layer stack translateY's: old exits up, new enters from below, ~0.6s eased — not a crossfade) and the copy swaps (fade+rise) a beat after. One activeIndex drives all three in lockstep. The award-rhythm upgrade of media-step-switch."
  when: "An amenities / spaces / programs section with a handful of named options where each deserves its own held media + copy, and you want the buyer to JUMP between them (click), always seeing the full menu — Spa/Yoga/Fitness, Двір/Тераса/Паркінг/Кафе, building types, finish packages. The 'pick a space, see it' beat: a split with a persistent index and a clean push-swap, instead of a full-bleed stepper that hides the menu or a plain tab strip."
  lands: "A calm split: a clean rectangle of media on one side, a serif list always in view on the other with one item lit. Click a name — it lights first, the media pushes up to the new space, the copy resettles below — over a steady glow that ties the four states into one room. It reads like choosing rooms in a quiet showroom, not flipping a noisy carousel."
  not_when: "A single full-bleed cinematic that should hide its chrome (media-step-switch / section-pager). A long scrollable gallery (stacked-pairs / cards-swipe). Two or fewer options (just show them). When the section must be scroll-stepped rather than clicked (then a pinned stepper). Touch-small collapses to a stacked column (the split is lost — acceptable, but you gain little there)."
source:
  grammar: "springs.estate Wellness menu (Spa/Yoga/Fitness/Café), frame-by-frame: split media-left/index-right, fixed binary-opacity index, click-driven, vertical-push media swap (old up / new below, ~0.6s), bottom-anchored copy swap, constant teal->forest gradient glow."
  recording: "apps/quadro/.award-re/teardowns/D_springs_wellness_menu_clip.md"
  registry_ref: ["T-pim-springs"]
stack: "vanilla JS only (no libs). rAF push tween + click/keyboard drive."
webgl: false
motion_props: [transform, opacity]
trigger: "CLICK on an index word (or Arrow up/down) -> rAF vertical-push of the media + copy swap. NOT scroll-driven, NOT a pin/scrub."
timing_layer: [B-entrance, A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [material, proof, amenities]
combines_with: [theme-tween, bleeding-wordmark, section-pager, circular-UI-language]
anti_combos: [media-step-switch, cards-swipe]
gated_by: [R_perf_limits, R_anti_combos, R_reduced_motion_fallback]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "SPLIT layout: media LEFT (rectangle overflow:hidden window), persistent serif INDEX + bottom-anchored copy RIGHT, over a CONSTANT gradient glow that never changes between steps"
  - "the index is a FIXED stack (never moves); active word bright (~1.0), rest dimmed (~0.35); only the highlight changes (no carousel/focal-line)"
  - "CLICK-driven (not scroll-jacked); the LABEL LEADS — it lights instantly on click, THEN the media + copy follow; keyboard Arrow up/down also cycles"
  - "media swap = VERTICAL PUSH: a 2-layer stack translateY's (incoming 100%->0, outgoing 0->-100%, together) ~0.6s eased — old exits up, new from below; NOT a crossfade, no clip-path, no ghost"
  - "copy swaps (fade out -> swap -> fade+rise) a beat after the media, bottom-anchored (grows upward)"
  - "transform (push) + opacity (index dim, copy) only; GPU layers; the glow is a STATIC CSS gradient (never animated over a moving surface); NO mix-blend / NO backdrop over the moving media"
  - "reduced-motion -> hard swap (no push); window.__LAB_OK__ on init; asset-substitution gate: OUR amenities (Двір/Тераса/Паркінг/Кафе) + renders + Ukrainian copy"
gate:
  probe: "Open lab.html. __LAB_OK__ true (pim-ready). Click a list word and confirm: the label lights FIRST, the media does a vertical push (old up / new from below, mid-push shows one layer travelling — not a fade), the copy swaps below, the index stays fixed, the glow does not change. Smoothness gate in CURTAIN mode (CURTAIN=1, since the push shows two media layers during the swap): PASS = 0 blank, fps>=50, jank<8%."
note: |
  Critical brick #3 of the 4. The award-rhythm upgrade of media-step-switch (split +
  persistent index + vertical push + constant glow + click-pinned). A full Springs
  SECTION (not just a sub-mechanic). Pairs with theme-tween (per-section color) and
  bleeding-wordmark. Built per the catalog re-count; rotated-mosaic-hero is the last
  of the 4 critical.
---

# persistent-index-menu — amenity menu (split + push-swap + constant glow)

Springs' Wellness menu: a split with media left, a persistent serif index + copy
right over a steady glow. Click a name → it lights, the media pushes to the new
space, the copy resettles. The award-rhythm upgrade of media-step-switch.

## Markup + call
```html
<section class="pim-stage" id="menu" tabindex="0">
  <div class="pim-media"></div>
  <div class="pim-right">
    <div class="pim-eyebrow">…</div>
    <div class="pim-index"></div>
    <p class="pim-copy"></p>
  </div>
  <div class="pim-item" data-label="Двір"   data-media="a.webp" data-copy="…" hidden></div>
  <div class="pim-item" data-label="Тераса" data-media="b.webp" data-copy="…" hidden></div>
  …
</section>
```
```js
PersistentIndexMenu.init('#menu', { pushMs: 600 });
```
Style the right column with a STATIC gradient glow; bind the index/copy to your
palette (or var(--*) from theme-tween).

## Proven (the lab)
OUR amenities — Двір / Тераса / Паркінг / Кафе — on our renders + Ukrainian copy.
Click Тераса: label leads (Двір 0.43→dim, Тераса 0.91→lit mid-push), media push
(layerA −635 up, layerB 265 from below), copy → "Власна тераса над дахами", glow
constant. CURTAIN-mode gate applies.
