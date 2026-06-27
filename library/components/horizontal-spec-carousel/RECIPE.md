---
id: horizontal-spec-carousel
name: "Horizontal spec-carousel (landscape cards on a track that translateX one step at a time with edge-peek; a vertical-pill arrow in the gap; per-card CTA-pill; a spec-row title/sqft/rooms that swaps with the active card)"
level: 2
kind: component
status: official
entry:
  call: "HorizontalSpecCarousel.create(target, opts)  // target = .hsc-stage with .hsc-viewport > .hsc-track > .hsc-card[data-title][data-sqft][data-rooms] + .hsc-spec + .hsc-prev/.hsc-next + optional .hsc-dot list. opts: { peek, duration, ease, wheel, drag, loop, index }."
  module: iife
  returns: "{ go(i), next(), prev(), index(), count, destroy }"
meaning:
  what: "11tanjung's plans carousel — a row of landscape cards on a track that translateX one STEP at a time, with EDGE-PEEK (the next card's edge shows past the active one). A vertical-pill arrow sits in the gap (next / prev); each card carries its own CTA-pill; a spec-row (title / sqft / rooms) swaps SYNCHRONOUSLY with the active card. Driven by arrows, drag, wheel or keyboard. transform translateX + opacity only."
  when: "A plans / units / spec showcase where each card is an item with a few hard numbers (area, rooms, a CTA) and you want one in focus at a time with the next teased at the edge. Use it for floor plans, unit types, package tiers — anything where the IMAGE and a SMALL SPEC SET belong together and the user steps through them. The edge-peek + vertical arrows say 'there's more sideways' without a scrollbar; the synadvanced spec-row keeps the numbers glued to the picture."
  lands: "You see one wide card in focus with its name and a couple of figures beneath it, and the sliver of the next card peeking in from the side. You press the tall pill-arrow (or drag, or flick the wheel) and the row slides one step — a new image takes focus, its caption and area/rooms updating in the same beat, its 'view plan' button fading in. It reads like flipping through plates, each with its own spec, never losing the thread."
  not_when: "A gallery with no per-item data (use a plain slider). A long catalogue that needs scanning/filtering (use a grid). When all cards must be visible at once (use the facilities-hover-accordion). A single hero image (no carousel needed). Auto-rotating marketing banners (this is user-driven, intentionally)."
source:
  grammar: "11tanjung C5: translateX slides of landscape cards + a vertical-pill arrow in the gap + a per-card CTA-pill + a spec-row (title/sqft/rooms) that swaps synchronously + edge-peek of the next card. drag / arrow / scroll."
  recording: "apps/quadro/.award-re/teardowns/D_11tanjung_video.md (C5 horizontal-spec-carousel)"
  registry_ref: ["C5-horizontal-spec-carousel-11tanjung"]
stack: "vanilla (transform-driven; arrows / drag / wheel / keyboard)"
webgl: false
motion_props: [transform, opacity]
trigger: "triggered (arrows / drag / wheel / keyboard), not scroll"
timing_layer: [D-interaction]
owns_pin: false
owns_scroll: false
page_beat: [plans, units, spec-showcase]
combines_with: [panel-rise-over, facilities-hover-accordion, editorial-act-crossfade, coords-corner-frame]
anti_combos: [auto-rotate, carousel-over-scrubbed-surface]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the track translateX(-index * step) where step = card width + gap; each card is calc((100% - gap) * (1 - peek)) so the next card edge-peeks (~17% at peek 0.16)"
  - "a vertical-pill arrow sits in each gap (next / prev); arrows disable at the first/last card when loop is false"
  - "each card has a CTA-pill that fades + lifts in on the active card only; the active card is opacity 1, neighbours dimmed"
  - "a spec-row (title / sqft / rooms) crossfades to the active card's data-title/data-sqft/data-rooms SYNCHRONOUSLY with the slide"
  - "driven by arrows, drag/swipe (>40px = step), horizontal wheel intent, and Left/Right keys; the stage is focusable"
  - "transform: translateX + opacity only; NO mix-blend / NO backdrop over the cards; NO WebGL; reduced-motion -> instant index"
  - "asset-substitution gate: OUR QUADRO plan/unit renders + a serif italic spec title + warm palette; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The active landscape card is in focus with the next card peeking at the edge; a vertical-pill arrow in each gap; a CTA-pill on the active card; a spec-row (title/sqft/rooms) beneath. Press next/prev (or drag / wheel / arrow keys) -> the track slides one step, the spec-row + CTA + dots follow the active card, arrows disable at the ends. Triggered (NOT scroll) -> verify the translateX step + edge-peek + spec sync + end-disable, and run the TRIGGERED variant of the smoothness probe (arm the meter, click next/prev repeatedly)."
note: |
  Brick 8 of the 11tanjung harvest — the plans carousel. translateX a track of landscape
  cards one step at a time with edge-peek; a vertical-pill arrow in the gap; a per-card
  CTA-pill; a spec-row (title/sqft/rooms) that swaps in lockstep with the active card.
  Multi-input (arrows / drag / wheel / keyboard), user-driven (no auto-rotate). A triggered
  primitive (owns_pin false) — probe via the triggered variant, not the wheel-scroll one.
  translateX + opacity = GPU-cheap. The edge-peek falls out of the card width = vpW*(1-peek).
  Proven 1:1 on QUADRO renders: step = cardW + gap, ~17.6% edge-peek, spec-row tracks the
  active card, arrows disable at the ends, 0.5% jank @ 59.9fps across cycled steps, zero
  console errors. The spec title is serif italic (Canela / PP Editorial class; Playfair
  Display italic is the free stand-in).
---

# horizontal-spec-carousel — landscape cards translateX with edge-peek, vertical-pill arrows, a synced spec-row

11tanjung's plans carousel: landscape cards on a track that `translateX` one step at a time
with edge-peek (the next card's edge shows past the active one). A vertical-pill arrow sits in
the gap; each card has its own CTA-pill; and a spec-row (title / sqft / rooms) swaps in lockstep
with the active card. Driven by arrows, drag, wheel or keyboard.

## Markup + call
```html
<section class="hsc-stage" id="plans">
  <button class="hsc-prev">‹</button>
  <button class="hsc-next">›</button>
  <div class="hsc-viewport">
    <div class="hsc-track">
      <article class="hsc-card" data-title="Unit A" data-sqft="82 m²" data-rooms="3">
        <img src="a.webp"><span class="hsc-cta">View plan →</span>
      </article>
      <!-- … more cards … -->
    </div>
  </div>
  <div class="hsc-spec">
    <div class="hsc-spec-title">Unit A</div>
    <dl><div class="cell"><span class="k">Area</span><span class="v hsc-spec-sqft">82 m²</span></div>
        <div class="cell"><span class="k">Layout</span><span class="v hsc-spec-rooms">3</span></div></dl>
  </div>
  <div class="hsc-dots"><button class="hsc-dot"></button>…</div>
</section>
```
```js
HorizontalSpecCarousel.create('#plans', { peek:0.16, duration:520, ease:'cubic-bezier(.22,1,.36,1)', wheel:true, drag:true });
```

## Proven (the lab)
4 plan cards on OUR QUADRO renders (terrace-02 / day-front / terrace-04 / aerial). Measured
live: idx0 tx=0 spec="Таунхаус A / 82 м²" (prev disabled); next → idx1 tx=-1044 spec="Таунхаус
B / 94 м²"; last → idx3 tx=-3132 spec="Пентхаус-рівень / 126 м²" (next disabled); prev → idx2
spec="Кутова секція / 108 м²"; dot→0 returns. step = 1044px = cardW 1020 + gap 24; cardW 1020 in
vpW 1238 ⇒ ~17.6% edge-peek (matches peek 0.16). Active card opacity 1, neighbours dimmed.
Triggered probe (4× CPU throttle, cycling next/prev ×4): 2/439 long frames (0.5%), 59.9fps →
PASS. Zero console errors. Screenshot (idx1): the building render active + a peeking interior
card on the right + vertical-pill arrows + "Дивитись план" CTA + spec-row "Таунхаус B / 94 м² /
4 + двір" (matches 11tanjung C5).
