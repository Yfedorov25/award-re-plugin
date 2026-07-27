---
id: poi-caption-carousel
name: "POI caption-carousel (a standalone rail of place cards, each with its caption directly under, paging in a big step via round ‹ › arrows with edge-peek + active-page emphasis)"
level: 2
kind: component
status: official
entry:
  call: "PoiCaptionCarousel.create(target, opts)  // target = .pcc-stage > .pcc-rail-wrap( .pcc-rail > .pcc-card( .pcc-card-img + .pcc-card-cap ) x N ) + .pcc-nav( .pcc-prev + .pcc-counter + .pcc-next ). opts: { start, pageStep, ease, slideDur, loop, activeDim, cardStagger, once, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), play(), next(), prev(), go(i), destroy }"
meaning:
  what: "r1864's standalone POI card-rail — a horizontal row of place cards, EACH with its CAPTION directly UNDER the card (the caption travels WITH the card), advancing in a BIG STEP via round ‹ › arrows (page-by-page, not one card) with EDGE-PEEK of the next card and ACTIVE-PAGE emphasis (off-page cards dim). On enter the cards stagger up from below. Drag supported."
  when: "A 'what's nearby' / points-of-interest rail — landmarks, parks, amenities, neighbours — where each item is a photo with a short name under it and you want a clean, browsable rail that pages a whole screen-width at a time (not one nudged card). Use it as a standalone section (its own heading) when the map isn't the backdrop; if you want it OVER a dimmed map use map-dim-carousel-announce instead. Good for 6–12 places."
  lands: "A heading like 'what's nearby', then a row of photographs each labelled underneath — the embankment, the park, the gallery — with the next one peeking in at the edge. A single round arrow turns the whole page of cards at once; the off-screen cards sit dimmed until they're the active page. It reads as a tidy index of the surroundings, not a fussy one-at-a-time slider."
  not_when: "A swapping spec-row (title/sqft/rooms that changes per active card) — use horizontal-spec-carousel. The rail should sit over a dimmed map with an announce — use map-dim-carousel-announce. A single image or a full-bleed gallery (use fullscreen-media-carousel). When captions belong beside, not under, the image."
source:
  grammar: "r18641 /location POI rail: 5 place cards (НАБЕРЕЖНАЯ МОСКВЫ-РЕКИ / ПАРК «ЗАРЯДЬЕ» / ГУМ / РЕПИНСКИЙ СКВЕР / ТРЕТЬЯКОВСКАЯ ГАЛЕРЕЯ) each with a 2-line caption directly UNDER the photo, a round → arrow, edge-peek of the next card."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 9 of the r1864 harvest; the standalone POI rail)"
  registry_ref: ["r1864-poi-caption-carousel"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity]
trigger: "scroll-into-view stagger (once) + a manual big-step pager (arrows / drag / dots)"
timing_layer: [B-reveal, C-carousel]
owns_pin: false
owns_scroll: false
page_beat: [nearby, points-of-interest, card-rail, location]
combines_with: [river-tinted-poi-map, map-dim-carousel-announce, compass-rose-section-divider, masked-heritage-split]
anti_combos: [pin, mix-blend-over-scroll]
gated_by: [R_perf_limits]
variants: [horizontal-spec-carousel, map-dim-carousel-announce]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a horizontal rail of N place cards, each = .pcc-card-img + a .pcc-card-cap caption directly UNDER it"
  - "on scroll-into-view the cards stagger fade + translateY 44->0 (active-page cards to opacity 1, off-page to activeDim)"
  - "round ‹ › arrows (and dots / drag) PAGE the rail by a big step (pageStep cards; 0 = the visible-card count), eased; counter shows NN / N(pages); clamps unless loop"
  - "off-page (peeked / out-of-page) cards dim to activeDim; edge-peek shows the next page's first card past the active page"
  - "set(p 0..1) is a PURE scrub of the ENTER stagger; transform + opacity only; NO mix-blend / NO WebGL; owns_pin false"
  - "drag follows F-08 law (window listeners, settle always, step only past threshold); reduced-motion or <=820px -> shown (native overflow-x); window.__LAB_OK__ on init"
  - "asset-substitution gate: place photos + a short caption under each + a section heading (e.g. 'what's nearby')"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the rail in: the cards stagger up. Click ‹ ›: the rail pages by the visible-card count (a big step, not one card), with edge-peek + off-page cards dimmed, counter NN / N(pages), clamping at the ends; drag pages too. Verify the caption-under, the big-step paging, the active-emphasis dim, + fps. The rail is one band — scroll so it's centred to screenshot the cards + peek."
note: |
  Brick 9 of the r1864 harvest (a VARIATION) — the standalone 'what's nearby' POI rail. Place cards
  each with a caption directly UNDER, paging a whole screen-width at a time with edge-peek + active-
  page emphasis (off-page cards dim). Marked relatives (in `variants`): horizontal-spec-carousel
  (11tanjung — a SWAPPING spec-row + vertical-pill arrows, one-step) and map-dim-carousel-announce
  (this rail COMPOSED over a dimmed map + announce). This is the reusable STANDALONE rail with the
  caption travelling per-card and BIG-STEP paging. transform + opacity = GPU-cheap. owns_pin false.
  FIX logged: a CSS opacity transition on the card fought the enter-scrub (cards read ~0.07 mid-
  transition) — moved it behind a .pcc-paged class added only after the first page action, so the
  enter-scrub is crisp and the dim-swap still eases. Proven: cards stagger to 1 (off-page 0.5),
  big-step page 01/02 -> 02/02 (x -1062px), dim + clamp + drag; 1.78% jank @ 4x throttle; zero
  console errors. Photos = quadro renders (honest demo assets; engine takes any photos). Serif =
  Playfair Display (Didot/Bodoni class).
---

# poi-caption-carousel — a 'what's nearby' rail; captions under the cards, pages a screen at a time

r1864's standalone POI rail: place cards each with a caption directly under, paging in a big step
via round ‹ › arrows with edge-peek + active-page emphasis (off-page cards dim). Cards stagger up
on enter; drag supported.

## Markup + call
```html
<section class="pcc-stage" id="poi">
  <h2 class="pcc-head">Что рядом</h2>
  <div class="pcc-rail-wrap">
    <div class="pcc-rail">
      <div class="pcc-card"><div class="pcc-card-img"><img src="…"></div><div class="pcc-card-cap">Набережная<br>Москвы-реки</div></div>
      <!-- … N place cards … -->
    </div>
  </div>
  <div class="pcc-nav"><button class="pcc-prev">‹</button><span class="pcc-counter">01 / 02</span><button class="pcc-next">›</button></div>
</section>
```
```js
PoiCaptionCarousel.create('#poi', { pageStep:0, activeDim:0.5, cardStagger:0.6, manageLenis:false });
```

## Proven (the lab)
8 place cards ('ЧТО РЯДОМ': Набережная / Парк «Зарядье» / ГУМ / Репинский сквер / Третьяковская /
Храм Христа Спасителя / Болотная наб. / Дом музыки), each with a caption-under; 4 visible → 2
pages. ENTER curve (computed, p / card0 / card3-active / card7-offpage): 0 / 0 / 0 / 0 → 0.5 / 1 /
0.97 / 0.30 → 1 / 1 / 1 / 0.50. PAGE: ‹ › `01/02 → 02/02`, rail x `0 → -1062px`, last card brightens
`0.49 → 0.82`, first card dims to 0.5; CLAMP at 02/02; prev → 01/02. Drag pages. Zero console
errors. Smoothness (4× CPU throttle, scroll-enter + page + page): 337 frames, 1.78% long → PASS.
FIX: a CSS opacity transition on the card fought the enter-scrub — moved it behind a `.pcc-paged`
class added only after the first page action. Photos = quadro renders (honest demo assets; engine
takes any photos).
