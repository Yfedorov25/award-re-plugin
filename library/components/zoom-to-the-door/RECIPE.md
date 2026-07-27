---
id: zoom-to-the-door
name: "Zoom to the door (a three-act scroll cinema that dives from the region to your front gate: three hand-illustrated frames МІСТО, РАЙОН, ДІЛЯНКА match-cut through a shared focal point as you scroll, the outgoing act scaling up and out while the incoming act settles in from small, each act warmer in palette, with a breadcrumb rail; the payoff is your hatched plot with its dimensions; mobile and reduced-motion fall back to the three acts as paired cards)"
level: 3
kind: section
status: official
since: base-92
tags: [map, location, scale, zoom, pinned, scroll-scrub, illustrated, editorial, real-estate, no-webgl]
entry:
  call: "ZoomToTheDoor.create(target, opts)  // target = .ztd (a .ztd-wrap > .ztd-frame holding a [data-ztd-rail] and a .ztd-acts of [data-card] cards, each card = a [data-act] svg + a [data-cap] caption). Each act SVG draws its illustration with [data-draw] strokes and authors its focal element at the SHARED viewBox focal point (e.g. 500,300). create() pins the section and, on scroll, match-cuts the acts through the focal point (outgoing scales up, incoming settles in), draws each act on arrival (re-armed on leave), and warms the palette per act; under 880px or reduced-motion it renders the acts as static paired cards. opts: { scrub, end }."
  module: iife
  returns: "{ root, set(actIndex [, local]), act(), destroy }"
meaning:
  what: "A three-act scroll cinema that answers the three questions a buyer asks, in order, at the right scale: where is this (the region), what is around it (the district), and what exactly is mine (the plot). As you scroll the pinned section, three hand-illustrated frames cross-dissolve while diving through a SHARED focal point (the village dot becomes the home becomes the parcel, all authored at the same viewBox centre): the act you are leaving scales up and past you, the act you are entering grows in from small and settles, so it reads as one continuous zoom rather than three separate fades. Each act warms in palette (cool grey-green region, neutral district, warm amber plot), a breadcrumb rail tracks and jumps the scale, and the final act resolves on your hatched parcel with its real dimensions and the nearest places tied to it. On mobile and for reduced-motion it becomes three paired cards, each illustration directly above its caption. Geometry comes from the same real-OSM bake as the smarts map, drawn light."
  when: "The location beat of a premium real-estate site where the buyer needs to understand the property at three scales in sequence (region, neighbourhood, plot) and you want a guided, cinematic descent rather than a single map. Use it as the establishing location moment, especially when the plot itself (its size, its frontage, its address) is part of the pitch and deserves a payoff frame. Pairs with a calmer proximity map elsewhere (district-radiates) and a time-first beat (minutes-bloom)."
  lands: "You scroll and the region holds: a quiet schematic, a city, a highway, your village as one warm dot twelve minutes out. Then the frame dives, the dot rushing toward you and unfolding into the living district, river and parks and the daily places around your door. Scroll on and it dives again, the district giving way to your own plot, dimension lines resolving, the words reading twenty-two and a half сотки, your address. You have descended from the map to the gate in three breaths, and the land is yours. On a phone the same three scales stack as clean cards."
  not_when: "When the user needs a browsable surveyed map with routes (use locmap-engine). When the property has no distinct plot to land on (the third act is the payoff). When a single overview map says enough (use district-radiates). When the page cannot host a long pinned scroll section. A dark theme (recolour the tokens). When you have only one scale of real geometry (the three-scale story needs region + district + plot data)."
source:
  grammar: "The editorial illustrated-map family (district-radiates, minutes-bloom, river-tinted-poi-map). zoom-to-the-door is the SCALE-storytelling device: three hand-drawn acts that match-cut through a shared focal point as a real dive, region -> district -> plot, per-act palette temperature, a breadcrumb rail, the plot as payoff. The original dense-OSM zoom idea (B4) was rebuilt in the light illustrated language after dark-OSM maps were rejected; the viewBox-tween jank risk is avoided by cross-dissolving separate light layers with opacity + scale."
  recording: "apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md (B4 zoom-stage-village-to-door, reborn as the illustrated dialect). Siblings: library/components/district-radiates, minutes-bloom."
  registry_ref: ["zoom-to-the-door", "three-act-scale-cinema", "match-cut-map-dive"]
stack: "vanilla SVG DOM + GSAP 3.12.5 + ScrollTrigger + ScrollToPlugin + gsap.matchMedia. No LocMap, no tiles, no Mapbox, no canvas, no three."
webgl: false
motion_props: [opacity, transform, stroke-dashoffset]
trigger: "pinned scroll-scrub (a ScrollTrigger pin at top top, scrubbed through the acts with a per-act dwell); rail click jumps via ScrollToPlugin; matchMedia gives mobile/reduced-motion a static paired-cards state"
timing_layer: [S-scrub, B-pin, D-content]
owns_pin: true
owns_scroll: false
page_beat: [location, where, scale]
combines_with: [district-radiates, minutes-bloom, numeral-frame-expand-hero]
anti_combos: [second-cover, locmap-engine, mix-blend-over-scroll]
gated_by: [R_no_webgl, R_perf_limits, R_pin_budget]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "the section pins at top top and scrubs through N acts with a per-act DWELL (each act holds at full opacity while pinned); the acts MATCH-CUT through a shared focal point: the outgoing act scales up (1 -> ~2.6) and the incoming act settles in from small (~0.45 -> 1), pivoting on transform-origin 50% 50% -> a continuous zoom, not three fades"
  - "each act's strokes (river/roads/parcel/threads) draw via stroke-dashoffset on arrival and are RE-ARMED when the act is left, so they re-draw on backward+forward re-entry (no one-shot)"
  - "the palette warms perceptibly per act (cool grey-green region -> neutral cream district -> warm amber plot) via data-ztd-act; the third act resolves the parcel CENTERED with dimension lines attached to its edges and the nearest places tied to it by leader ticks (arithmetic honest: 45x50 = 2250 m2 = 22,5 сотки)"
  - "preserveAspectRatio='meet' with a viewBox aspect matching .ztd-acts so circles stay round and there are no letterbox bands; a breadcrumb rail (buttons + aria) jumps to each act's dwell centre with :focus-visible"
  - "under 880px OR reduced-motion: gsap.matchMedia renders the acts as static PAIRED cards (each illustration directly above its own caption, never divorced); the rail is hidden"
  - "opacity + transform + stroke-dashoffset only; NO WebGL, NO canvas, NO tiles, NO Mapbox, NO mix-blend, NO backdrop-filter; destroy() kills the trigger + matchMedia + rail + listener (no leak on recreate)"
  - "all small text >= WCAG AA on cream (kicker uses a deeper terracotta); zero em-dash in visible copy; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll: ACT 1 МІСТО holds (a schematic city + highway + the village dot 12хв out); scroll on and the frame DIVES through the focal point into ACT 2 РАЙОН (river, parks, home + 4 places), then ACT 3 ДІЛЯНКА (the hatched 22,5-сотки parcel with 45x50 dims + nearest places on leader ticks, 'Ваша адреса'); the outgoing act scales up while the incoming settles in (a real zoom). The palette warms cool -> neutral -> warm. Click a rail dot -> it dives to that act. Scroll back then forward -> each act re-draws. Verify: every act holds at full opacity while pinned incl. the plot, circles round, smoothness over a full pinned scrub @4x CPU (fps>=50, jank<8%). Shrink to <=390px OR reduced-motion -> three paired cards (each illustration above its caption), rail hidden. destroy()+recreate -> 3 rail dots (no leak). Verified: dive scale 0.45->2.6 on a shared focal point, palette warms, plot recomposed + leader ticks, re-arm on backward scroll, 0% jank @60fps, mobile + reduced-motion paired cards, destroy clean, kicker AA, 0 console errors, 0 em-dash. The РАЙОН caption headline says ЧОТИРИ == 4 drawn POI dots == the body list (no number mismatch); at 1440x900 no SVG label or dot overlaps the bottom-left caption box on any act (the Вінниця cluster sits top-left of act 0, the Гніванське шосе frontage label sits bottom-right of act 2, so the caption's bottom-left zone is a keep-out)."
note: |
  The scale-storytelling map: a three-act scroll cinema that DIVES region -> district -> plot through
  a shared focal point. The editorial-illustrated sibling to district-radiates + minutes-bloom (this
  one owns SCALE). FIVE skeptic lessons baked in: (1) it must be a real ZOOM, not three fades -- every
  act authors its focal element at the SAME viewBox point and the outgoing act scales up hard while the
  incoming settles in from small, so a continuous focal point match-cuts the seam (the first build was a
  muddy dissolve between unrelated drawings); (2) mobile/reduced-motion must keep act+caption PAIRED as
  cards (the first build stacked all maps then all captions, divorcing them); (3) the payoff plot act must
  be composed -- centered parcel, dims attached to edges, nearest places tied by leader ticks (was
  floating in a void); (4) the palette must warm PERCEPTIBLY per act (act1->act2 was an invisible delta);
  (5) the act draws must RE-ARM on backward scroll so the reveal is not a one-shot in a scrub section.
  Perf: separate light SVG layers cross-dissolved by opacity + scale (GPU) -- NOT a viewBox tween over a
  dense map (the B4 jank risk). Verified: dive 0.45->2.6 on a shared focal, palette warms, plot recomposed,
  re-arm works, 0% jank @ 60fps, mobile + reduced-motion paired cards, destroy clean, kicker AA, zero
  console errors, zero em-dash.
---

# zoom-to-the-door — a three-act scroll cinema that dives from region to your front gate

The location beat as scale-storytelling: three hand-illustrated acts (МІСТО -> РАЙОН -> ДІЛЯНКА) that
MATCH-CUT through a shared focal point as you scroll, the outgoing act scaling up and out while the
incoming settles in from small, each warmer than the last, ending on your hatched plot with its
dimensions. Mobile + reduced-motion fall back to three paired cards. NO WebGL. The editorial illustrated
sibling to district-radiates + minutes-bloom (this one owns scale).

## Markup + call
```html
<section class="ztd" data-ztd-act="0"><div class="ztd-wrap"><div class="ztd-frame">
  <nav class="ztd-rail" data-ztd-rail></nav>
  <div class="ztd-acts">
    <div class="ztd-card" data-card="0">
      <div class="ztd-act" data-act="0"><svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        <path data-draw class="ztd-line ztd-line--strong" d="…"/>
        <circle class="ztd-warm" cx="500" cy="300" r="7"/>  <!-- focal point shared across acts -->
      </svg></div>
      <div class="ztd-cap" data-cap="0"><p class="k">/ Масштаб 01 · Місто</p><h3>За дванадцять хвилин <em>до міста.</em></h3><p>…</p></div>
    </div>
    <!-- … act 2 (район, home at 500,300) … act 3 (ділянка, parcel centered on 500,300) … -->
  </div>
</div></div></section>
```
```js
ZoomToTheDoor.create('.ztd', { scrub: 0.7 });
```

## Proven (the lab)
Three hand-authored acts (region: city + highway + village dot 12хв; district: river/parks/home + 4
places; plot: a 22,5-сотки hatched parcel, 45x50 dims, Школа·9хв / Парк·6хв on leader ticks). The dive
scales the outgoing act 1->2.6 and the incoming 0.45->1 on a shared focal point (a real zoom). Palette
warms cool grey-green -> neutral cream -> warm amber. Each act re-draws on backward scroll. Rail jumps to
each dwell centre. Smoothness @4x CPU over a full pinned scrub: 0% jank, 60fps. <880px / reduced-motion:
three paired cards (act over caption). destroy()+recreate: 3 rail dots. Kicker AA (#8f4a30). The РАЙОН
headline says ЧОТИРИ == 4 POI dots == body list. At 1440x900 no SVG label/dot overlaps the bottom-left
caption box on any act (Вінниця cluster moved top-left of act 0, Гніванське шосе frontage label moved
bottom-right of act 2, so the caption's bottom-left zone is a keep-out). Zero console errors, zero em-dash.
