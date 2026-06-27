---
id: masked-heritage-split
name: "Masked heritage split (a left dark-green serif narrative panel + a right full-bleed heritage-artwork panel that reveals by a vertical clip-path top->bottom on enter; a circular arrow swaps the captioned artwork)"
level: 2
kind: component
status: official
entry:
  call: "MaskedHeritageSplit.create(target, opts)  // target = .mhs-stage > .mhs-left ( .mhs-title + .mhs-body + .mhs-credit + .mhs-credit-by + .mhs-nav( .mhs-counter + .mhs-arrow ) ) + .mhs-right ( .mhs-slide[data-credit][data-credit-by] x N ). opts: { start, revealDur, swapDur, ease, clipFrom, scaleFrom, once, autoAdvance, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), play(), go(i), next(), prev(), destroy }"
meaning:
  what: "r1864's /history split — a LEFT dark-green serif NARRATIVE panel (giant ALL-CAPS title + small sans body + an artwork CREDIT caption + a 'NN / N' counter + a circular arrow) beside a RIGHT full-bleed HERITAGE-ARTWORK panel that REVEALS by a vertical clip-path (top->bottom) on enter; advancing the arrow swaps the artwork + its credit. The museum-grade 'the place has a past' chapter."
  when: "The 'history of the place' / heritage chapter of a premium project — where you tell the lineage of the site beside a series of archival paintings, engravings or old photographs. Use it when the location's PAST is part of the sell (a historic embankment, an old estate, a named architect). One side carries the narrative + the artwork credit; the other reveals the plate like a curtain dropping in a museum. Pairs naturally after a compass-rose-section-divider that announces the chapter."
  lands: "The chapter opens onto a calm forest-green page; on the right a heritage painting is unveiled top-to-bottom as if a curtain drops, while on the left a serif statement and a quiet paragraph settle in, with the artwork's credit ('Кремль при Иване III — А. Васнецов') and a small counter beneath. A circular arrow turns the page to the next plate, the credit changing with it. It reads as a museum wall text beside the work — the place has provenance."
  not_when: "There is no real history to tell (it wants genuine archival imagery + credits). A fast, modern, present-tense brand (the green + serif + engravings read heritage/classical). A single image with no narrative (use a plain split or oval-mask-reveal). When you can't supply proper artwork credits (the credit line is half the point)."
source:
  grammar: "r18644 /history: left forest-green panel — 'ИСТОРИЯ \"РЕЗИДЕНЦИИ 1864\" С XV ВЕКА' + a small body + the credit 'Кремль при Иване III / А. Васнецов' + a '1 / 4' counter + a circular -> arrow; the right side a full-bleed Vasnetsov painting revealed top->bottom. /location 'ОКРУЖЕНИЕ' reuses the same split."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 5 of the r1864 harvest; the /history heritage split)"
  registry_ref: ["r1864-masked-heritage-split"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [clip-path, transform, opacity]
trigger: "scroll-into-view reveal (once) + a manual captioned carousel (arrow / dots)"
timing_layer: [B-reveal, T-section-announce, C-carousel]
owns_pin: false
owns_scroll: false
page_beat: [heritage, history, provenance, section-announce, captioned-carousel]
combines_with: [compass-rose-section-divider, numeral-frame-expand-hero, collection-tier-announce, river-tinted-poi-map]
anti_combos: [pin, mix-blend-over-scroll]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a two-column split: a dark-green left narrative panel + a right full-bleed heritage-artwork panel (N stacked .mhs-slide plates)"
  - "on scroll-into-view the right plate un-curtains via clip-path inset (top->bottom, hidden 100%->0%) over 0..0.62 + a scale 1.06->1 settle"
  - "the left title fades + translateY 28->0 (0.20..0.55); body (0.40..0.70); credit + counter + circular arrow (0.60..1.0) staggered"
  - "the circular arrow (and dots) advance the captioned heritage carousel: the next plate drops from the top via clip-path, the credit cross-fades, the 'NN / N' counter updates, wraps"
  - "set(p 0..1) is a PURE scrub of the ENTER reveal; clip-path + transform + opacity only; NO mix-blend / NO WebGL; owns_pin false"
  - "reduced-motion or <=820px -> shown (split stacks to 1 column, first plate shown, no play); window.__LAB_OK__ on init"
  - "asset-substitution gate: heritage artwork (paintings/engravings/old photos) + proper credits + a forest-green serif narrative panel; the lab uses dense engraving-style inline SVG so it is asset-independent"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the split in: the right heritage plate un-curtains top->bottom while the left title/body/credit/counter stagger in. Click the circular arrow: the next plate drops from the top, the credit cross-fades, the counter NN/N updates, and it wraps. Verify the curtain direction, the left stagger order, the swap + credit/counter sync, + fps. It is a full-height split — scroll so the stage fills the frame to screenshot it."
note: |
  Brick 5 of the r1864 harvest — the /history 'the place has a past' split. A forest-green serif
  narrative panel + a heritage-artwork panel revealed by a vertical clip-path (a curtain dropping),
  with an artwork CREDIT + a 'NN / N' counter + a circular arrow that swaps the captioned plates.
  Distinct from base carousels: the green editorial panel + the artwork-credit caption + the
  clip-reveal are the signature; the carousel here is a MUSEUM plate-changer, not a media gallery.
  clip-path(inset) + transform + opacity = GPU-cheap. owns_pin false. The lab ships dense
  engraving-style inline-SVG heritage plates (authored via a 4-agent fan-out) per the F-14 density
  law (hand-authored art density IS part of 1:1) so it is asset-independent + headless-renderable;
  in production swap in real archival <img>/<picture>. Serif = Playfair Display (Didot/Bodoni
  class); ground = forest-green #27302a; cream type #e7e2d6.
---

# masked-heritage-split — a green serif narrative beside a heritage painting that drops in like a curtain

r1864's /history chapter: a LEFT dark-green serif narrative panel (giant title + body + an artwork
credit + a counter + a circular arrow) beside a RIGHT full-bleed heritage-artwork panel that reveals
by a vertical clip-path top->bottom on enter; the arrow swaps the captioned plates. The "the place
has a past" museum chapter.

## Markup + call
```html
<section class="mhs-stage" id="history">
  <div class="mhs-left">
    <h2 class="mhs-title">История «Резиденции 1864» с XV века</h2>
    <p class="mhs-body">Здесь, на месте комплекса, располагался Государев сад…</p>
    <div class="mhs-credit">Кремль при Иване III</div>
    <div class="mhs-credit-by">А. Васнецов</div>
    <div class="mhs-nav">
      <span class="mhs-counter">01 / 04</span>
      <button class="mhs-arrow" aria-label="next">→</button>
    </div>
  </div>
  <div class="mhs-right">
    <div class="mhs-slide" data-credit="Кремль при Иване III" data-credit-by="А. Васнецов"><svg>…plate…</svg></div>
    <div class="mhs-slide" data-credit="Москва XVI века"      data-credit-by="Старинная гравюра"><svg>…</svg></div>
    <!-- … N plates … -->
  </div>
</section>
```
```js
MaskedHeritageSplit.create('#history', { start:'top 70%', clipFrom:'top', swapDur:0.7, manageLenis:false });
```

## Proven (the lab)
A forest-green serif panel «ИСТОРИЯ "РЕЗИДЕНЦИИ 1864" С XV ВЕКА» + body + artwork credit +
`NN / 04` counter + a circular `→` arrow, beside a heritage-artwork panel. ENTER curve measured
live (p / artwork clip-inset-top / artScale / title / body / nav): 0 / 100% / 1.06 / 0 / 0 / 0 →
0.30 / 13.75% / 1.008 / 0.64 / 0 / 0 → 0.55 / 0.14% / 1.0 / 1 / 0.88 / 0 → 0.80 / 0% / 1 / 1 / 1 /
0.88 → 1 / 0% / 1 / 1 / 1 / 1. The plate un-curtains top→bottom + scale settles, then
title→body→nav stagger. ADVANCE: the arrow swaps `01/04→02/04`, credit "Кремль при Иване III"→
"Москва XVI века"; WRAP `04/04 → 01/04`. Zero console errors. Smoothness (4× CPU throttle,
scroll-enter + 3 advances): 389 frames, 0.26% long → PASS, even with the dense SVG plates.
4 engraving-style plates authored via a 4-agent fan-out (716 / 566 / 1073 / 328 shapes) per the
F-14 density law. NOTE: the lab plates read as clean flat illustration, not hatched painting
texture — the engine takes real archival `<img>` in production.
