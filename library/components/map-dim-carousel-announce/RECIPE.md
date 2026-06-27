---
id: map-dim-carousel-announce
name: "Map-dim carousel-announce (a POI map dims to a dark backdrop as the section enters while a giant serif headline + sub rise over it and a rail of location cards staggers in; a circular arrow scrolls the rail)"
level: 3
kind: component
status: official
entry:
  call: "MapDimCarouselAnnounce.create(target, opts)  // target = .mdc-stage > .mdc-map (dimmable backdrop) + .mdc-overlay ( .mdc-headline + .mdc-sub + .mdc-rail-wrap( .mdc-rail > .mdc-card[.mdc-card-img + .mdc-card-cap] x N ) + .mdc-nav( .mdc-prev + .mdc-arrow ) ). opts: { start, dimTo, mapScaleTo, cardStagger, step, loop, pin, revealDur, slideDur, ease, once, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), play(), next(), prev(), go(i), destroy }"
meaning:
  what: "r1864's /location announce — a POI MAP that DIMS (opacity 1 -> ~0.3) + pushes back (scale 1 -> 1.04) to become a dark BACKDROP as the section enters, while a giant serif HEADLINE + sub rise over it and a RAIL of N location CARDS (photo + caption-under) STAGGERS in from below; a circular arrow scrolls the rail. On leave-back the carousel collapses and the map reclaims full opacity. The 'look where this sits' chapter, laid over a living map. Composes OVER river-tinted-poi-map (Brick 3)."
  when: "The location / neighbourhood beat of a premium project — when the SETTING is part of the sell and you want the map you already drew to keep working as the ground while you announce 'this is one of the best districts' and parade the nearby landmarks as cards. Use it right after (or layered onto) a POI map: the map dims to a backdrop, the statement rises, and a rail of points-of-interest cards staggers in. The dim is what makes the type readable AND keeps the map present."
  lands: "The map you were just reading dims and settles back like the lights going down, and over it a large serif statement rises — 'one of the most privileged districts of the capital' — with a quiet line beneath. A rail of place-cards slides up from the bottom (the embankment, the park, the gallery), each captioned, and a single round arrow nudges the rail along. The map never leaves; it becomes the stage. Scroll away and it brightens back to a live map."
  not_when: "There is no map (this is a map-backdrop announce; without one use a plain headline + card rail). The map must stay fully interactive during the announce (dimming + an overlay blocks it — keep them as separate beats). A short list that needs no rail (just show the cards). When mix-blend or backdrop-filter would be used over the map (banned here — it tanks scroll perf)."
source:
  grammar: "r18641 /location: the river-tinted POI map dims to a dark taupe backdrop; over it a giant serif 'ОДИН ИЗ САМЫХ ПРИВИЛЕГИРОВАННЫХ РАЙОНОВ СТОЛИЦЫ' + a 3-line sub, and a bottom rail of 5 cards (photo + caption-under: НАБЕРЕЖНАЯ МОСКВЫ-РЕКИ / ПАРК «ЗАРЯДЬЕ» / ГУМ / РЕПИНСКИЙ СКВЕР / ТРЕТЬЯКОВСКАЯ ГАЛЕРЕЯ) + a circular -> arrow."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 6 of the r1864 harvest; the /location dim-map carousel announce)"
  registry_ref: ["r1864-map-dim-carousel-announce"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [opacity, transform]
trigger: "scroll-into-view announce (optionally pinned) + a finite card rail (arrow / dots)"
timing_layer: [B-reveal, T-section-announce, C-carousel, D-backdrop]
owns_pin: optional
owns_scroll: false
page_beat: [location, neighbourhood, section-announce, card-rail, map-backdrop]
combines_with: [river-tinted-poi-map, compass-rose-section-divider, masked-heritage-split, poi-caption-carousel]
anti_combos: [mix-blend-over-scroll, backdrop-filter-over-scroll]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a full-height stage: a dimmable .mdc-map backdrop (SVG/img) + an .mdc-overlay (headline + sub + a card rail + nav)"
  - "on scroll-into-view the map dims opacity 1 -> dimTo(0.3) + scale 1 -> mapScaleTo(1.04) over 0..0.5"
  - "the headline fades + translateY 30->0 (0.15..0.5); the sub (0.30..0.6); the N cards stagger fade + translateY 40->0 (~0.45..1.0); the nav fades 0.7..1.0"
  - "the circular arrow (and .mdc-prev / dots) translateX the rail by one card-step, clamped at [0, maxIndex] (no runaway) unless loop:true"
  - "set(p 0..1) is a PURE scrub of the ENTER; opacity + transform only; NO mix-blend / NO backdrop-filter over the map; NO WebGL"
  - "reduced-motion or <=820px -> shown (map dimmed, cards visible, rail scrolls native overflow-x); window.__LAB_OK__ on init"
  - "asset-substitution gate: a POI map backdrop (ideally river-tinted-poi-map) + a giant serif statement + a rail of captioned place-cards"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the section in: the map DIMS to a backdrop + pushes back, the serif headline + sub rise, and the cards stagger in from below. Click the circular arrow: the rail scrolls one card-step and CLAMPS at the end (no runaway); prev returns. Verify the dim, the headline->sub->cards stagger order, the rail clamp, + fps. Full-height section — scroll so the stage fills the frame; a mid-scrub frame shows the still-legible map."
note: |
  Brick 6 of the r1864 harvest — the /location 'look where this sits' announce, laid OVER the
  POI map. The map dims to a backdrop (the dim is what makes the type read AND keeps the map
  present), a giant serif statement + sub rise, and a rail of captioned place-cards staggers in;
  a circular arrow scrolls the finite rail. Level 3 because it COMPOSES over river-tinted-poi-map
  (Brick 3) — the lab embeds that map SVG (141 elements) as the dimmable backdrop, both to be
  asset-independent and to prove the compose. opacity + transform only; NO mix-blend / NO
  backdrop-filter over the map (the perf law — they tank scroll over a busy surface). owns_pin
  OPTIONAL. Proven: map dims 1->0.3, headline/sub/cards stagger, rail advances + clamps at
  maxIndex, prev returns; 0.69% jank @ 4x throttle even with the 141-element map SVG; zero
  console errors. Card photos are quadro renders (honest demo assets; engine takes any photos).
  Serif = Playfair Display (Didot/Bodoni class); ground = #2c2724.
---

# map-dim-carousel-announce — the map dims to a stage; a serif statement + a rail of place-cards announce the district

r1864's /location announce: a POI map dims to a dark backdrop as the section enters, a giant serif
headline + sub rise over it, and a rail of captioned location cards staggers in from below; a
circular arrow scrolls the rail. Composes over river-tinted-poi-map.

## Markup + call
```html
<section class="mdc-stage" id="location">
  <div class="mdc-map"><!-- river-tinted-poi-map SVG, or <img> --></div>
  <div class="mdc-overlay">
    <h2 class="mdc-headline">Один из самых привилегированных районов столицы</h2>
    <p class="mdc-sub">Золотой остров расположен в самом центре…</p>
    <div class="mdc-rail-wrap">
      <div class="mdc-rail">
        <div class="mdc-card"><div class="mdc-card-img"><img src="…"></div><div class="mdc-card-cap">Набережная<br>Москвы-реки</div></div>
        <!-- … N cards … -->
      </div>
    </div>
    <div class="mdc-nav"><button class="mdc-prev">←</button><button class="mdc-arrow">→</button></div>
  </div>
</section>
```
```js
MapDimCarouselAnnounce.create('#location', { dimTo:0.3, cardStagger:0.5, step:1, manageLenis:false });
```

## Proven (the lab)
The river-tinted POI map (parks/roads/POI glyphs + street-name italics) dims to a backdrop while
«ОДИН ИЗ САМЫХ ПРИВИЛЕГИРОВАННЫХ РАЙОНОВ СТОЛИЦЫ» + sub rise and 6 location cards (photo +
caption-under) stagger in; a circular ← / → nav scrolls the rail. ENTER curve measured live
(p / map-op / headline / sub / card1 / lastCard / nav): 0 / 1.00 / 0 / 0 / 0 / 0 / 0 →
0.30 / 0.34 / 0.81 / 0 / 0 / 0 / 0 → 0.50 / 0.30 / 1 / 0.96 / 0.33 / 0 / 0 →
0.75 / 0.30 / 1 / 1 / 0.98 / 0.53 / 0.42 → 1 / 0.30 / 1 / 1 / 1 / 1 / 1. ADVANCE: rail x `0 →
-265px` (one card-step); CLAMP: hammering the arrow stops at maxIndex (no runaway); prev returns
to 0. Zero console errors. Smoothness (4× CPU throttle, scroll-enter + advance + prev): 290 frames,
0.69% long → PASS, even with the 141-element embedded map SVG. NO mix-blend over the map (perf
law). Card photos = quadro renders (honest demo assets; engine takes any photos).
