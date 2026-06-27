---
id: river-tinted-poi-map
name: "River-tinted POI map (a hand-styled vector district map — warm-taupe field, a slate-blue river band, green park blobs, white landmark glyphs, terracotta POI pins, a copper project disc; reveals on scroll, NOT Mapbox)"
level: 2
kind: component
status: official
entry:
  call: "RiverTintedPoiMap.create(target, opts)  // target = .rtm-stage > svg.rtm-map([data-river] + .rtm-park/.rtm-road + [data-glyph]) + .rtm-pin[data-poi](.dot + .lbl) + .rtm-disc[data-disc]. opts: { draw, stagger, duration, ease, start, once, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), play(), destroy }"
meaning:
  what: "r1864's drawn location map — the third map dialect. A hand-styled vector district map on a warm-taupe / near-black field: a winding slate-blue river band, filled green park blobs, a thin road network, white landmark glyphs with labels, terracotta circular POI pins with icons, and a big copper project disc at the centre. On scroll-into-view the river draws, glyphs rise, pins ladder bottom-to-top, the disc scales in. NOT live Mapbox — inline SVG + DOM."
  when: "The location / neighbourhood beat for a premium, dark-themed site where the map should feel illustrated and branded — a warm tinted district with the river drawn in, a copper marker on the project, and a constellation of terracotta POI pins. Use it when a Google embed would break the mood and a flat line-art map (line-art-location-map) is too austere or a painterly one (watercolor-svg-map) too soft: this one is rich + dark + cartographic. The contacts page reuses it with one ОФИС ПРОДАЖ pill."
  lands: "You scroll to the location and a dark, warm map composes itself: the river snakes in as a slate-blue ribbon, parks settle as soft green shapes, little landmark icons name the Kremlin and the gallery, and a ring of copper pins marks the lifestyle around you — a restaurant, a concert hall, a park — with a glowing copper disc on the building itself. It reads as a drawn, branded map, not a widget."
  not_when: "When users need a real, pannable, accurate map (use Google/Mapbox). A light/airy palette (use watercolor-svg-map) or an austere line-only look (line-art-location-map). Too many POIs to place cleanly (~6-12). When there's no brand reason to hand-draw it."
source:
  grammar: "r18645 /location: warm-black/taupe field, a slate-blue Moskva river band, green park blobs, thin roads, white landmark line-glyphs (Кремль / Храм Христа Спасителя / Третьяковская галерея), terracotta circular pins with icons (Парк Зарядье / Филармония / Музеон / Дом музыки), a copper '1864 / СОФИЙСКАЯ НАБЕРЕЖНАЯ 36' disc."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 3 of the r1864 harvest; the drawn map)"
  registry_ref: ["r1864-river-tinted-poi-map"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [stroke-dashoffset, transform, opacity]
trigger: "scroll-into-view reveal (once; not pinned)"
timing_layer: [B-reveal, D-content]
owns_pin: false
owns_scroll: false
page_beat: [location, where, contacts]
combines_with: [numeral-frame-expand-hero, isometric-building-unit-selector, map-dim-carousel-announce, collection-tier-announce]
anti_combos: [embedded-map-widget, emoji-pin-icons]
gated_by: [R_perf_limits]
variants: ["themed-contact-map (this engine + a single ОФИС ПРОДАЖ pill)"]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a hand-styled inline SVG map: a slate-blue river band [data-river], filled green park blobs (.rtm-park), thin roads (.rtm-road), white landmark glyph groups [data-glyph] with labels — NOT Mapbox/Leaflet"
  - "the SVG is preserveAspectRatio='none' so the art fills the stage and the %-positioned DOM pins/disc align with it"
  - "on scroll-into-view: the river draws (stroke-dashoffset -> 0, 0..0.5); parks/roads fade (0..0.45); glyphs fade + rise (0.30..0.70, stagger); POI pins pop scale 0.5->1 bottom-to-top (0.45..1); the copper disc scales 0.7->1 + fades (0.55..0.85)"
  - "terracotta POI pins (.rtm-pin) use FONT-INDEPENDENT glyph icons (SVG/unicode marks, NOT emoji); hover -> .is-hot (dot scale + brighter + label opacity 1)"
  - "a copper project disc (.rtm-disc) with a number + a caption below it; set(p 0..1) is a PURE scrub"
  - "stroke-dashoffset + transform + opacity only; NO mix-blend; NO WebGL; owns_pin false; reduced-motion or <=820px -> shown"
  - "asset-substitution gate: a warm-dark field + a drawn river + terracotta pins + a copper project disc; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the section in: the river draws across the warm-dark field, park blobs + roads settle, landmark glyphs rise, terracotta POI pins ladder up, and the copper project disc scales in at the centre with its address caption; hover a pin lights it + its label. Verify preserveAspectRatio='none' (art fills + pins align), the river-draw + pin-ladder + disc-scale curve, font-independent pin glyphs (no emoji), + fps. Scroll-into-view reveal."
note: |
  Brick 3 of the r1864 harvest — the drawn district map, a THIRD map dialect. Distinct from
  line-art-location-map (monochrome line-art, leader-line POIs) and watercolor-svg-map
  (painterly cream blobs that rise+pin): this is a tinted-dark base + a river band + filled
  park/footprint shapes + terracotta pins with glyph icons + a copper project disc. Hand-styled
  SVG, NOT Mapbox. stroke-dashoffset + transform + opacity = GPU-cheap. owns_pin false. TWO
  fidelity lessons baked in: (1) the SVG must be preserveAspectRatio='none' so the hand-art
  fills the stage and the %-positioned DOM pins/disc align (slice-crop misaligns them); (2) pin
  icons must be font-INDEPENDENT (SVG/unicode marks) — emoji don't render without an emoji font.
  Proven on a Moskva-bend map: river draws by p=0.5, pins ladder bottom-to-top, disc scales in,
  0.2% jank @ 59.9fps, zero console errors. The contacts map = this engine + one ОФИС ПРОДАЖ
  pill (the themed-contact-map variant, Brick 12).
---

# river-tinted-poi-map — a hand-drawn district map: river band + park blobs + terracotta pins + a copper project disc

r1864's drawn location map (the third map dialect). A hand-styled vector district map on a
warm-taupe/near-black field: a slate-blue river band, green park blobs, thin roads, white
landmark glyphs, terracotta POI pins, and a copper project disc. On scroll-into-view the river
draws, glyphs rise, pins ladder bottom-to-top, the disc scales in. NOT Mapbox — inline SVG + DOM.

## Markup + call
```html
<section class="rtm-stage" id="map">
  <svg class="rtm-map" viewBox="0 0 1440 900" preserveAspectRatio="none">
    <path class="rtm-park" d="…"/> <path class="rtm-road" d="…"/>
    <path data-river d="…"/>
    <g data-glyph transform="translate(560 240)">…<text>Кремль</text></g>
  </svg>
  <div class="rtm-pin" data-poi style="left:53%;top:30%"><div class="dot">❀</div><div class="lbl">Парк Зарядье</div></div>
  <!-- … more pins (font-independent glyphs, NOT emoji) … -->
  <div class="rtm-disc" data-disc style="left:50%;top:42%"><div class="n">1864</div><div class="rtm-disc-cap">Софийская наб., 36</div></div>
</section>
```
```js
RiverTintedPoiMap.create('#map', { draw:true, stagger:0.06, duration:1.0, manageLenis:false });
```

## Proven (the lab)
A hand-authored Moskva-bend map (river band, 4 park blobs, 3 roads, 3 landmark glyphs, 8
terracotta pins, a copper "1864 / Софийская наб., 36" disc). Curve measured live (p /
river-dashoff / park-op / disc-op / pin-scales): 0 / 2653 / 0 / 0 / [.5,.5,.5] → 0.30 / 425 / 0.89 /
0 / [.5,.5,.5] → 0.55 / 0 / 1 / 0 / [.5,.5,.5] → 0.80 / 0 / 1 / 0.97 / [.79,.56,.93] (bottom-to-top
stagger) → 1 / 0 / 1 / 1 / [1,1,1]. Screenshot (disc centred): the copper "1864" disc + "Софийская
наб., 36" caption, terracotta pins (Парк Зарядье / Филармония / Музеон / Дом музыки) with glyph
icons, slate-blue river band + green parks (matches r1864 /location). Probe (4× CPU throttle):
1/564 long frames (0.2%), 59.9fps → PASS. Zero console errors.
