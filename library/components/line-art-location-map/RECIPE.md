---
id: line-art-location-map
name: "Line-art location-map (a hand-authored monochrome line-art district map — thin cream strokes on brown, NO Google/Mapbox; roads draw in, a target-marker marks the project, POIs on leader-lines ladder up bottom-to-top on reveal)"
level: 2
kind: component
status: official
entry:
  call: "LineArtLocationMap.create(target, opts)  // target = .lam-stage holding inline <svg class='lam-map'> ([data-draw] paths + OUTER <g translate> > INNER <g data-target>) + .lam-poi[data-poi] (each: .lam-leader + .lam-dot + .lam-label) positioned by left/top. opts: { draw, stagger, duration, ease, start, once, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, set(p), play(), refresh(), destroy }"
meaning:
  what: "11tanjung's WHERE beat — a hand-authored, MONOCHROME line-art district map: thin (~1px) cream strokes on a brown field (NO Google / NO Mapbox, NO fills, NO colour). Inline SVG roads draw in (stroke-dashoffset), a target-marker (ringed dot / crosshair) marks the project, and POI labels connected by LEADER-LINES fade + rise in with a bottom-to-top STAGGER on scroll-into-view. set(p) is a PURE scrub."
  when: "The location / neighbourhood beat, when you want the map to read as PART OF THE BRAND, not an embedded utility. Use it instead of a Google/Mapbox iframe when the palette and restraint matter — a quiet line drawing of the district with the project marked and a few POIs (school, park, waterfront, centre) laddering in. Best as a calm, late-page 'where' section; the draw-in + leader-line ladder give it a sense of being authored by hand."
  lands: "You scroll to the location section and a few thin pale lines draw themselves across the brown — roads sketched, not photographed. A ringed crosshair settles where the project is, and one by one, from the bottom of the screen upward, small labelled markers rise on hairline leader-lines: the waterfront, the school, the park. It reads like an architect's site sketch coming to life, not a map widget dropped in."
  not_when: "When users need a real, pannable, accurate map (use Google/Mapbox). When the district has too many POIs to letter cleanly (line-art wants ~3-6). A data-dense wayfinding tool. When there's no brand reason to hand-draw the map (the embed is fine). Over a busy photographic background (the thin strokes need a calm field)."
source:
  grammar: "11tanjung D2: a vector line-art map (thin ~1px cream stroke on brown, NOT Google/Mapbox): inline-SVG roads + a target-marker of the project + POIs with leader-lines, appearing with a bottom-to-top stagger on reveal. GSAP stagger opacity/y on ScrollTrigger."
  recording: "apps/quadro/.award-re/teardowns/D_11tanjung_video.md (D2 line-art-location-map; cousin of Springs watercolor-svg-map but line-art monochrome + leader-lines)"
  registry_ref: ["D2-line-art-location-map-11tanjung", "F5-line-art-street-map-finest (variant)"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [stroke-dashoffset, transform, opacity]
trigger: "scroll-into-view reveal (triggered timeline; not a pin)"
timing_layer: [B-reveal, D-content]
owns_pin: false
owns_scroll: false
page_beat: [location, where, neighbourhood]
combines_with: [panel-rise-over, horizontal-spec-carousel, coords-corner-frame, editorial-act-crossfade]
anti_combos: [embedded-map-widget, map-over-photo-bg]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the map is hand-authored inline SVG — thin (~1px) cream strokes on a brown field, NO fills, NO colour, NO Google/Mapbox; vector-effect: non-scaling-stroke keeps the 1px"
  - "road paths [data-draw] draw via stroke-dashoffset (full length -> 0) over the first ~55% of the reveal, power2.out"
  - "a target-marker (OUTER <g translate> positions, INNER [data-target] scales/fades) reveals AT its map position over ~0.30..0.62 — the SVG translate must survive (a CSS transform on the positioned group would wipe it)"
  - "POIs [data-poi] (each = .lam-leader + .lam-dot + .lam-label) ladder BOTTOM-to-TOP: each in its own window over 0.45..1, opacity 0->1 + translateY 14px->0, the leader-line growing scaleY 0->1 from its anchored bottom"
  - "set(p 0..1) is a PURE scrub of the whole reveal; stroke-dashoffset + transform + opacity only; NO mix-blend / NO backdrop; NO WebGL; owns_pin false"
  - "reduced-motion or <=820px -> shown (map fully revealed, no play); GSAP+ScrollTrigger required for scroll; window.__LAB_OK__ on init"
  - "asset-substitution gate: a brown field + cream line-art + a serif italic POI label + warm palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the section in: the thin cream roads draw across the brown, a ringed crosshair settles AT THE PROJECT POSITION (centre, not the corner), and the POIs ladder up bottom-to-top on hairline leader-lines. Scroll-into-view reveal (not a pin). GATE-BLINDSPOT: SVG/stroke media -> a naive blank% probe under-reads; verify the dashoffset + opacity curve + target position + fps/jank. Smoothness via the scroll-into-view path."
note: |
  Brick 9 of the 11tanjung harvest — the WHERE beat, the last of the core sections. A
  hand-authored monochrome line-art map: thin cream strokes on brown (no Google/Mapbox, no
  fills), roads drawing via stroke-dashoffset, a target ⊙ at the project, POIs laddering up
  bottom-to-top on leader-lines. Cousin of Springs watercolor-svg-map but a DIFFERENT engine:
  Springs is a CREAM colour-blob map that RISES then pins; this is FLAT monochrome line-art
  that DRAWS + ladders, no rise-over, no fills. owns_pin false. stroke-dashoffset + transform
  + opacity = GPU-cheap. KEY FIX (F-09): the target's SVG translate must live on an OUTER <g>
  and JS scale only an INNER <g> — a CSS transform on the positioned group wipes the translate
  and dumps the marker at 0,0. Proven 1:1: roads draw by p=0.55, target fades in AT CENTRE
  (676,418 in 1280x800 = map middle), POIs ladder bottom-to-top, 0.3% jank @ 59.9fps, zero
  console errors. POI labels serif italic (Canela / PP Editorial class; Playfair Display
  italic is the free stand-in).
---

# line-art-location-map — a monochrome line-art district map; roads draw, a target marks the project, POIs ladder up on leader-lines

11tanjung's WHERE beat: a hand-authored, monochrome line-art district map — thin (~1px) cream
strokes on a brown field (no Google/Mapbox, no fills). Inline-SVG roads draw in via
stroke-dashoffset, a target-marker ⊙ marks the project, and POI labels on hairline leader-lines
fade + rise in with a bottom-to-top stagger on scroll-into-view.

## Markup + call
```html
<section class="lam-stage" id="map">
  <svg class="lam-map" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
    <path class="lam-road" data-draw d="…"/>            <!-- roads draw in -->
    <g transform="translate(760 470)">                  <!-- OUTER g positions -->
      <g data-target><circle class="ring" r="22"/>…</g> <!-- INNER g scales/fades -->
    </g>
  </svg>
  <div class="lam-poi" data-poi style="left:21%;top:80%">
    <span class="lam-leader"></span><span class="lam-dot"></span>
    <span class="lam-label"><b>Waterfront</b><span class="dist">7 min</span></span>
  </div>
  <!-- … more POIs … -->
</section>
```
```js
LineArtLocationMap.create('#map', { draw:true, stagger:0.09, duration:0.7, ease:'power2.out', start:'top 78%', once:true, manageLenis:false });
```

## Proven (the lab)
A hand-authored brown line-art district map (3 main + 3 minor roads, a centre target ⊙, 4 POIs).
Curve measured live (p / road0-dashoffset / target-opacity / POI-opacities bottom-to-top):
0 / 1513 / 0 / [0,0,0,0] → 0.30 / 313 / 0 / [0,0,0,0] → 0.55 / 0 / 0.95 / [0.70,0,0,0] →
0.70 / 0 / 1 / [1,0.81,0,0] → 0.85 / 0 / 1 / [1,1,0.90,0.21] → 1 / 0 / 1 / [1,1,1,0.96].
Leader-line scaleY 0 → 0.70 → 1. Roads draw by p=0.55, the target fades in over 0.30..0.62 AT
CENTRE (676,418 in a 1280×800 viewport = the map middle, NOT the corner — the outer translate
survives), the POIs ladder bottom-to-top. Probe (4× CPU throttle, scrolled into view): 1/353
long frames (0.3%), 59.9fps → PASS. Zero console errors.

## Variant — .lam--street (finest street-map look)
The same engine, a light theme: add class `.lam--street` for thin SAGE strokes on warm PAPER, optional vineyard HATCHING fills (an svg `<pattern>`) + `.lam-park`/`.lam-water` area fills, a LABEL-PILL project marker (`.lam-pin` with a `.pill` + `.stem`, e.g. "finest") instead of the SVG crosshair, and named POI pins with icon glyphs (`.lam-ico`). The JS reveals `.lam-pin` on the same window as `[data-target]`. Proven (finest F5): paper bg #f1efe9 + sage stroke #b8bda8, pill marker reveals (op 0→1, keeps translate(-50%,-50%)), POIs ladder, 0.2% jank @ 59.9fps. Confirmed the SAME class as the 11tanjung default (a richer light variant), NOT a separate brick — kept as one engine to avoid a near-twin in the base.
