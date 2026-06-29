---
id: coords-corner-frame
name: "Coords corner frame (a surveyed-drawing metadata frame: four draughting tick-corners that draw via stroke-dashoffset + a lat/long coordinate readout + a scale bar + a north arrow, in small all-caps tracked type, revealing staggered over a full-bleed stage)"
level: 2
kind: component
status: candidate
entry:
  call: "CoordsCornerFrame.create(target, opts)  // target = ANY stage element (the atom injects its own .ccf-overlay). opts: { coords:'49.18N 28.33E', scale:'0 ... 500 m', north:true, labels:{tl,bl,br,rc}, ease:'air', stagger:0.08, dur:0.7, tick:0.55, size:34, inset:'4.2vmin' }."
  module: iife
  returns: "{ reveal(), set(p), hide(), destroy }"
meaning:
  what: "A SURVEYOR/draughting metadata frame over a full-bleed stage. Four draughting TICK-CORNERS (crosshair L-brackets) are drawn into place via stroke-dashoffset, then a small all-caps tracked readout reveals staggered: a COORDINATE readout (lat/long), a SCALE BAR (0 ... 500 m), a NORTH arrow, and up to four corner LABELS. The frame reads like a surveyor's plot or an architect's plate. reveal() runs the staggered intro once; set(p) is a PURE reversible scrub of the same state."
  when: "Framing a full-bleed image, map, or hero so it reads as a SURVEYED PLATE - a drawing with coordinates, a scale and a north arrow, not a photo. Strongest over a location/map field (the lat/long and scale bar are literally true), but reusable to give any hero / amenities / menu stage the air of a measured architectural drawing. The crosshair ticks + coords + scale + north are the surveyor's signature."
  lands: "The big field is bracketed by four thin crosshair ticks that draw into its corners, then small widely-tracked all-caps labels settle in around it: a coordinate readout glows at the foot with a single dot, a scale bar with survey ticks reads 0 ... 500 m at the bottom-left, a north needle points up at the top-right. It feels like a measured plot lifted from an architect's drawing set, precise and authored."
  not_when: "Saisei editorial corner CAPTIONS - eyebrow / location / type / year / index as pure labels (use corner-frame-meta; this is the surveyor's frame: crosshair ticks + coords + scale + north). A busy layout (the frame wants air). When there's no real coordinate / scale to show (an invented scale bar reads as decoration). A simple decorative border (this carries metadata, not ornament)."
source:
  grammar: "Surveyor/draughting frame: crosshair tick-corners + lat/long coordinate readout + scale bar + north arrow in small all-caps tracked type. The single highest-demand toBuild atom - 17 wanters across hero/menu/amenities/location section variants."
  recording: "toBuild register (coords-corner-frame): surveyed-drawing corner metadata frame, distinct from corner-frame-meta (Saisei editorial labels)."
  registry_ref: ["coords-corner-frame-survey"]
stack: "vanilla (GSAP 3.12.5 optional - CSS-transition fallback when absent)"
webgl: false
motion_props: [transform, opacity, stroke-dashoffset]
trigger: "triggered (reveal once) or scrubbed (set(p))"
timing_layer: [B-entrance]
owns_pin: false
owns_scroll: false
page_beat: [hero, location, amenities, menu]
combines_with: [line-art-location-map, river-tinted-poi-map, locmap-engine, watercolor-svg-map, compass-rose-section-divider, hero-video-render-rotator, corner-frame-meta]
anti_combos: [corner-frame-meta]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the atom INJECTS its own .ccf-overlay into any target stage (no bespoke markup); four .ccf-tick crosshair L-brackets sit at the corners (CSS), inset by --ccf-inset"
  - "reveal() runs ONCE: the four tick paths draw in via stroke-dashoffset (full -> 0), then the readout items (coords, scale bar, north arrow, labels) fade (opacity 0->1) + rise (translateY 8->0) staggered"
  - "set(p 0..1) is a PURE, reversible scrub of the SAME state: tick draw fraction across the first `tick` slice of p, readout opacity/rise across the rest; hide() resets"
  - "the coordinate readout shows opts.coords (lat/long) with an accent dot; the scale bar shows opts.scale (0 ... 500 m) with survey ticks; the north arrow draws when opts.north; corner labels from opts.labels {tl,bl,br,rc}"
  - "transform (translateY) + opacity + stroke-dashoffset only; NO width/height/top/left animation; NO mix-blend / NO backdrop / NO WebGL / NO canvas; will-change cleared after the one-shot"
  - "reduced-motion -> everything shown statically (.ccf-static); GSAP optional; window.__LAB_OK__ on init"
  - "asset-substitution gate: real lat/long + a real scale over a real OSM road sketch (Агрономічне) - true coordinates, not invented"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Over a dark map field (a faint road sketch built from REAL OSM of Агрономічне) the four crosshair tick-corners draw into the corners, then the lat/long coordinate readout, the 0 ... 500 m scale bar, the north arrow and the corner labels fade + rise in staggered. Triggered (not scroll) - the wheel gate doesn't apply. Drag the scrub: set(p) reverses the whole state smoothly. Verify the tick draw (stroke-dashoffset), the staggered readout reveal, and fps. Distinct from corner-frame-meta (that's editorial caption labels, a pure fade; this is the surveyor frame: ticks + coords + scale + north)."
note: |
  The single highest-demand toBuild atom (17 wanters: hero / menu / amenities / location). A
  surveyor/draughting frame - crosshair tick-corners that DRAW via stroke-dashoffset, plus a
  lat/long coordinate readout, a scale bar (0 ... 500 m, survey ticks) and a north arrow, in
  small all-caps tracked mono. CONFIRMED DISTINCT from corner-frame-meta: that atom places
  Saisei editorial CAPTIONS (eyebrow / location / type+year / index) and pure-fades them; THIS
  one is the measured-drawing signature (ticks + coords + scale + north). The overlay is INJECTED
  by the JS so it drops onto ANY section without bespoke markup. owns_pin false (triggered or
  scrubbed, never pins). transform + opacity + stroke-dashoffset = GPU-cheap, zero layout.
  Proven over a faint road sketch baked from the REAL Агрономічне OSM (the same data the location
  maps use) with a TRUE lat/long and a 500 m scale - not invented. GSAP optional (CSS-transition
  fallback). Mono stand-in = IBM Plex Mono. Pair it over line-art-location-map / river-tinted-poi-map
  / a hero render; do NOT stack with corner-frame-meta (the two corner systems fight).
---

# coords-corner-frame - a surveyed-drawing metadata frame (tick-corners + coords + scale + north)

A SURVEYOR / draughting frame over a full-bleed stage. Four crosshair tick-corners draw into the
corners via stroke-dashoffset, then a small all-caps tracked readout reveals staggered: a lat/long
coordinate readout, a scale bar (0 ... 500 m), a north arrow, and up to four corner labels. The
overlay is injected by the JS, so it drops onto ANY section. reveal() runs once; set(p) is a pure,
reversible scrub. Not pinned.

Distinct from corner-frame-meta (Saisei editorial caption labels, a pure fade). This is the measured
drawing: crosshair ticks + coords + scale + north.

## Markup + call
```html
<!-- ANY full-bleed stage - the atom injects its own overlay -->
<section class="stage" id="stage"> ... map / render / field ... </section>
```
```js
CoordsCornerFrame.create('#stage', {
  coords: '49.18N 28.33E',
  scale:  '0 ... 500 м',
  north:  true,
  labels: { tl:'локація', bl:'агрономічне', br:'м 1:5000', rc:'index 01' },
  ease:   'air', stagger: 0.09, dur: 0.7, tick: 0.55
}).reveal();
```

## Proven (the lab)
Over a dark map field with a faint road sketch built from the REAL Агрономічне OSM (135 roads in the
window + the real projected site + 6 real POIs as faint dots), with a TRUE lat/long (49.18N 28.33E)
and a 500 m scale bar. reveal(): the four crosshair tick-corners draw in via stroke-dashoffset, then
the coordinate readout (accent dot), the survey-ticked scale bar, the north needle and the four corner
labels fade + rise in staggered. set(p) scrubbed back and forth reverses the whole state smoothly
(tick draw across the first 0.55 of p, readout across the rest). transform + opacity + stroke-dashoffset
only; will-change cleared on complete. Zero console errors; __LAB_OK__ true (wired AND field painted).
Mono stand-in = IBM Plex Mono.
