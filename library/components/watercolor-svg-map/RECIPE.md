---
id: watercolor-svg-map
name: "Watercolor SVG district map (cream map rises + pins, branded pin + POI chips, dark-on-cream)"
level: 2
kind: component
status: official
entry:
  call: "WatercolorMap.init(target, opts)  // target = .wm-stage el/selector. Markup: .wm-stage > .wm-bg(dark leaf, z1) + .wm-panel(cream SVG map, z2); .wm-panel has <svg class='wm-map'> + .wm-head + [.wm-poi (.cui-pin / .cui-poi) placed by inline left/top]. opts: { rise, pinFactor, lerp, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, render, refresh, destroy }  (or { static:true, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "Springs' LOCATION beat — a cream watercolor-style district map (inline SVG: soft park blobs, a blue river, thin roads) rises from below over a dark leaf bg and PINS; a dark teardrop brand pin + circular POI chips settle on it, dark-on-cream — the site's one inverted-contrast, lightest beat. NO WebGL, NO Google Maps — the map is hand-authored inline SVG, the chips are positioned DOM. A pinned scroll runs the rise-over then staggers the pin/POI reveal; reversible."
  when: "The LOCATION / neighbourhood section of a real-estate site — show the district (river, park, roads, the development's spot) as an authored, on-brand artefact rather than a Google Maps embed. The dark-on-cream inversion makes it the lightest, calmest beat of a dark site; the branded teardrop pin places the building. Use once, as the location chapter."
  lands: "You scroll onto a dark, leafy frame and a soft cream map rises up over it and holds — a painted, watercolour district (blue river curving through, green park washes, faint roads) with a dark serif line over it and a warm branded pin dropped on the development, little circular chips naming the park, the river, the school. It reads as a bespoke illustrated map the studio drew for this address, not a Google embed; the one bright, calm, inverted beat of the site. Scroll back and it lowers away."
  not_when: "A section that needs a live, pannable, real-coordinate map (use a real map embed — this is an authored illustration, not interactive geo). A dark beat (this is the lightest, inverted one — don't stack two). A page that can't own a pin here (one scroll owner per section). When there is no real district story to tell (river/park/landmarks) — an empty cream rectangle buys nothing."
source:
  grammar: "Springs S12 LOCATION (f163->f185): a cream watercolor map (~75% width, right) rises from below over a macro green-leaf bg, then pins; dark round 'Springs' teardrop pin, blue river, green circular POI markers, dark serif headline top-left — the one dark-on-cream inverted-contrast section. SEAM-09: pin-release + cream rise-over (dark->light)."
  recording: "apps/quadro/.award-re/teardowns/D_springs_walkthrough_video.md (S12 f163-f185, SEAM-09, T-11)"
  registry_ref: ["T-11-watercolor-map-springs"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + guarded Lenis 1.1.13 (+ composes circular-ui-language CSS)"
webgl: false
motion_props: [transform, opacity]
trigger: "ONE pinned scroll-scrub ScrollTrigger (pin:true, pinSpacing:true, scrub:true, start 'top top', end '+=innerHeight*pinFactor'), Lenis-smoothed, reversible; pins the section full-screen, rises the cream map then staggers the pin/POI reveal"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
owns_scroll: false
page_beat: [chapter, proof]
combines_with: [circular-ui-language, theme-tween, persistent-index-menu, stat-odometer, fluid-type-sizing]
anti_combos: [section-pager, vertical-curtain-wipe, second-pin]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_one_scroll_owner]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE pinned scroll-scrub runs the map (owns_pin TRUE; pin full-screen, start 'top top', end '+=innerHeight*pinFactor'); render(prog) is a PURE fn of progress; reversible (scroll back lowers the map + hides pin/POI)"
  - "the cream map panel rises from below (translateY 100% -> 0) over the dark leaf bg in the first leg (rise), then the pin + POI chips fade/rise in, staggered, over the back leg"
  - "the map is a hand-authored inline <svg> (cream base, soft park blobs, a blue river, thin roads) — NO WebGL, NO Google Maps"
  - "a dark teardrop brand pin + circular POI chips sit on absolute positions, dark-on-cream (the one inverted-contrast beat); a dark serif headline reads over the cream"
  - "composes circular-ui-language: the pin is .cui-pin (teardrop) and the chips are .cui-poi (circular) — only sized/placed here, not re-styled"
  - "transform + opacity only; GPU layers; NO mix-blend / NO backdrop over the scrubbed surface; NO WebGL"
  - "reduced-motion / <=820px -> static pose (map settled, pin + POI shown); window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR district (river/park/neighbourhood) + Ukrainian copy"
gate:
  probe: "Open lab.html (composes ../circular-ui-language/component.css; Lenis from jsdelivr). __LAB_OK__ true (wm-ready, NOT wm-static). Scroll into the section: it PINS, the cream watercolor map rises from below and settles, then the branded teardrop pin + circular POI chips stagger in on the cream; dark-on-cream; scroll back lowers it. SMOOTHNESS-GATE BLINDSPOT: the gate's blank/pixel checks target <img>/.media; this brick's media is inline <svg> + DOM chips (no <img>), so the gate falsely reads 'blank 100%'. Verify with a DIRECT probe instead — the dark .wm-bg always covers the viewport (opacity 1) and the cream .wm-panel rises to full, so the screen is never empty; PASS = 0 empty frames, fps>=50, jank<8%."
note: |
  Smaller brick 7 of 7 — the LAST of the EVER+Springs harvest. The Springs LOCATION
  beat: a bespoke cream watercolor district map that rises over a dark leaf bg and
  pins, branded teardrop pin + POI chips dark-on-cream (the site's one inverted,
  lightest beat). NO WebGL, NO Google Maps — hand-authored inline SVG + positioned DOM.
  COMPOSES circular-ui-language (.cui-pin / .cui-poi already exist there — this brick
  only sizes/places them and brings the cream map + rise/pin engine). owns_pin TRUE ->
  it is the section's one scroll owner. GATE NOTE: an SVG/DOM map has no <img>, so the
  smoothness-gate reads 'blank 100%' falsely — verify with a direct bg/panel-coverage
  probe (same blindspot class as a <video> medium). With this brick the whole
  EVER+Springs catalogue (23 primitives) is harvested.
---

# watercolor-svg-map — cream watercolor district map (rises + pins, branded pin + POI)

Springs' LOCATION beat: a cream watercolor-style district map (inline SVG — soft park
blobs, a blue river, thin roads) rises from below over a dark leaf bg and pins; a dark
teardrop brand pin + circular POI chips settle on it, dark-on-cream — the site's one
inverted-contrast, lightest beat. NO WebGL, NO Google Maps. Composes circular-ui-language
(.cui-pin / .cui-poi).

## Markup + call
```html
<section class="wm-stage" id="map">
  <div class="wm-bg"></div>                          <!-- z1 dark leaf bg -->
  <div class="wm-panel">                              <!-- z2 cream map, rises + pins -->
    <svg class="wm-map" viewBox="0 0 800 760">…</svg>  <!-- hand-authored watercolor -->
    <h2 class="wm-head">Поряд із парком і водою…</h2>  <!-- dark-on-cream -->
    <div class="wm-poi wm-poi--pin" style="left:53%;top:60%"><span class="cui-pin">Q</span><span class="wm-poi__label">QUADRO</span></div>
    <div class="wm-poi wm-poi--chip" style="left:24%;top:26%"><span class="cui-poi">★</span><span class="wm-poi__label">Парк</span></div>
  </div>
</section>
```
```js
WatercolorMap.init('#map', { rise: 0.45, pinFactor: 1.0 });
```

## Proven (the lab)
OUR QUADRO district — the cream watercolor map rises from below (translateY 588 → 0)
over the dark leaf bg, pins, then the terracotta "QUADRO" teardrop pin + 4 POI chips
(Парк / Річка / Школа / Сквер) stagger in on the settled cream, dark serif headline
top-left (wm-ready, not wm-static). circular-ui .cui-pin / .cui-poi composed. Direct
smoothness probe (the gate is blind to SVG/DOM media): 0 empty frames, panel reaches
opacity 1, 59.9fps, jank 1/676.
