---
id: location--dive-to-the-gate
name: "Падіння до воріт"
level: 2
kind: section-variant
section: location
status: base
map_style: "SCALE-ZOOM through REAL maps (region -> district -> parcel)"
webgl: false
ease: air
meaning:
  what: "The LOCATION beat at the surveyed-route-map level of cartographic REALISM (the SAME dense baked OSM district of с. Агрономічне: real road hierarchy by class, 823 building footprints, the site parcel at 746.3,324.9 inside a true-scale 10-minute walking ring, real Dijkstra routes drawn along the actual streets with a walking dot and a live minute counter), rendered ONCE by locmap-engine and DIVED through three scales as one continuous fall: beat 1 РАЙОН (the whole district visible), beat 2 (zoom toward the site, the ring + named streets dominant, the real route to the school drawing), beat 3 ДІЛЯНКА (tight on the parcel: 22,5 сотки on вул. Перемоги, the two nearest real places with real minutes). Same locmap-engine, same real data, same routes as the ideal; the DIFFERENT cartographic TREATMENT is a cool slate-blue DAY map that warms slightly per beat. The dive is a CSS transform (scale + origin on the site) on the engine's SVG group across the pinned scroll. The section pins; scroll steps the three beats; one clean caption block per beat, cross-faded so two are never legible at once."
  when: "When the LOCATION section wants to answer not 'here is a map' but 'this place nests inside the district and the district is five minutes from Вінниця', delivered as a single camera fall from the whole district down to the buyer's own parcel. The SCALE member of the map-style lane: the same dense real survey as the ideal, dived through three scales instead of stepped across POIs, distinct from the dark-dusk ideal and the mono/sepia treatments by being a cool slate-blue day map that warms as it descends."
  lands: "A cool daylight survey fills the frame: the whole street grid and hundreds of building footprints in slate on pale stock, the thick highway cutting the diagonal, the property parcel hatched in terracotta inside its dashed walking ring. As you scroll the camera FALLS toward the site: the district holds, then dives in until the ten-minute ring and the named streets dominate and a terracotta line draws itself to the school, then dives again until the plot fills the frame with its size and its frontage street and the two nearest places. Three scales, one focal point, one fall. It reads engineered and authored, a real surveyed map dived through, not a slider of three drawings."
source:
  grammar: "locmap-engine (the map CANON: dual casing+stroke road hierarchy, Dijkstra draw + getPointAtLength walker + growing live timer, the property parcel + true-scale walking ring, asymmetric layer parallax) re-themed via CSS variables + class overrides into a cool slate-blue DAY treatment (slate strokes over pale halo casing, light-slate footprints with NO lit windows, a terracotta accent for the active route + parcel) and DIVED through three scales by a CSS transform (scale + transform-origin on the site) on the engine's SVG group, driven by the single harness pin. The authored layer = the three labelled scale beats: harness pin -> beat index -> applyScale() + map.select() + one cross-faded caption per beat. Same medium and realism as surveyed-route-map; the variant's own contribution is the SCALE dive through ONE real map plus the slate day re-theme (the lane's map-style taxonomy treats this as a first-class variant, not a forbidden reskin). Reworked from an earlier hand-drawn three-act schematic into three views of one REAL map."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; reads the REAL baked OSM (osm.js -> osm-agronomichne.js) and bakes the dense district SVG into [data-lm-stage]; on map.select(id) draws the dataset's real Dijkstra route via stroke-dashoffset while a walker rides getPointAtLength and a live badge counts minutes up to the real walk-time. flicker.rate huge so NO windows light (a day map has no warm glow); parallax 0 because the scale DIVE owns the camera. Re-themed to cool slate-on-pale + a terracotta accent purely by the variant CSS, and its SVG group is scaled (transform-origin on the site) per beat by the variant script. Engine code untouched; its reveal trigger does NOT pin." }
pin: { owner: harness, count: 1 }
pin_killed: [zoom-to-the-door]
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "MAP-STYLE is unmistakably SCALE-ZOOM through REAL maps in one screenshot: a cool slate-blue DAY survey (NO lit windows, terracotta accent) DIVED toward the site so the same real map reads at a clearly different scale than at the start. Realism is identical to the surveyed-route-map ideal (same dense real OSM: full street grid + 823 footprints + named streets + parcel + walking ring), distinct from the other map styles by TREATMENT + the scale dive, not by medium. Verified by screenshot."
  - "asset-truth: streets, footprints, green, walking routes, POI names and minutes are the REAL baked OSM of с. Агрономічне (osm.js -> osm-agronomichne.js): 136 roads, 823 footprints, site at 746.3,324.9, 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв), real Dijkstra route per POI. NO invented streets/POIs/times/geometry. Coords 49.18N 28.33E (Вінниця), never another city."
  - "SCALE DIVE through ONE real map: beat 1 РАЙОН shows the whole district (scale 1.0), beat 2 zooms toward the site (the 10-min ring + named streets dominant, the real route to Школа drawing), beat 3 ДІЛЯНКА is tight on the parcel (22,5 сотки + вул. Перемоги + the two nearest real places). The dive is a CSS transform (scale + transform-origin on the site) on the engine SVG group: transform/opacity only, NEVER width/height/top/left."
  - "ONE pin only (harness owns it; locmap-engine is owns_pin FALSE; the old zoom-to-the-door pin was killed). Scroll-LOCK with pinSpacing while the dive plays. pins === 1 in the probe."
  - "caption text SEQUENCED: exactly one beat caption legible (opacity >= 0.85) at any scroll position, cross-faded + visibility-gated; never two at once, never a full-screen wall. Verified across 5 scroll samples (zero overlapping text-bearing pairs)."
  - "decode-guard: the [data-render-surface] field is a painted CSS background (slate daylight field) at non-zero size from load; no undecoded <img>/tile flicker (the medium uses zero raster imagery)."
  - "motion ONLY stroke-dashoffset / transform / opacity / filter; NO WebGL, NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/margin. will-change cleared after one-shots."
  - "reduced-motion -> the full map + first route shown statically at beat 0, captions steppable, __LAB_OK__ true; mobile 390px -> no horizontal overflow, __LAB_OK__ true. Zero real console errors. Copy Ukrainian, Fedoriv voice, sparse, proof-not-promises; ZERO em-dash/en-dash anywhere in the file."
gate:
  probe: "Serve library/ and open combos/location--dive-to-the-gate/combo-lab.html. __LAB_OK__ true, ScrollTrigger pin count === 1. Scroll the pinned range: the dense slate-on-pale district reads as a real survey (full grid, 823 footprints, named streets, parcel, walking ring) and DIVES toward the site through three labelled beats (РАЙОН whole -> approach with the real route to Школа -> ДІЛЯНКА tight on the 22,5-сотки parcel on вул. Перемоги), the same real map at three scales, ONE caption block (place + real minutes) legible at a time, the page tint warming a notch per beat. Confirm the cool slate-blue DAY treatment + the scale dive by screenshot and that only real OSM data appears."
note: |
  Map-style variant of the location lane: the SAME medium as the surveyed-route-map ideal
  (dense real OSM via locmap-engine, real Dijkstra routes, live minute counter), re-rendered
  in a cool slate-blue DAY treatment and DIVED through three scales as one continuous fall.
  This is the lane taxonomy: ONE realistic medium, MANY cartographic styles (see
  PATTERNS/location-patterns.md MAP-STYLE section). REWORK: an earlier build dived through
  three HAND-DRAWN schematic acts (sparse lines + a few dots) via zoom-to-the-door; the owner
  rejected the schematics. This rebuild keeps the three-act SCALE idea but makes EACH beat a
  view of ONE real locmap-engine map at a different scale, so every scale is a real dense survey.
  The engine is re-themed purely by CSS variables + class overrides in the variant SKIN (engine
  code untouched): --lm-* re-pointed to slate-on-pale, road strokes set to slate over a pale halo
  casing, lit windows killed via flicker.rate, parallax set to 0 (the scale dive owns the camera),
  and a terracotta --lm-accent for the active route + parcel. The dive is a CSS transform (scale +
  transform-origin on the site) on the engine SVG group across the single harness pin (the
  zoom-to-the-door pin was killed). The map atom is pinless; the single harness pin is the only
  scroll owner; the one-caption-at-a-time read is hand-wired as a cross-fade. The page tint warms a
  notch per beat via a CSS filter (cool region down to a warmer plot), not a geometry recolour.
---

# location--dive-to-the-gate · "Падіння до воріт" (SCALE-zoom through one real map)

The LOCATION beat at the ideal's level of cartographic realism, dived through three scales: the
dense real OSM of с. Агрономічне in a cool slate-blue day treatment, rendered ONCE and zoomed from
the whole district down to the buyer's own parcel as a single continuous fall.

## The single scroll (harness pin)
- The dense district is baked from the REAL OSM by locmap-engine (re-themed cool slate via CSS).
- Scroll DIVES the same real map through three labelled beats. The dive is a CSS transform (scale +
  transform-origin on the site) on the engine SVG group. Beat 1 РАЙОН holds the whole district;
  beat 2 zooms toward the site and calls `map.select('school')` so the real Dijkstra route draws in
  terracotta with a walker + live minute badge; beat 3 ДІЛЯНКА is tight on the parcel (22,5 сотки,
  вул. Перемоги, the two nearest real places). ONE serif caption block (number + place + real
  minutes) is legible at a time, cross-faded so two are never readable at once.

## Map-style
Same engine, same real data, same routes as `surveyed-route-map`; the differences are the
cartographic TREATMENT (cool slate-blue day map, warming a notch per beat) and the SCALE dive
through ONE real map, both achieved entirely in the variant CSS + a transform on the engine SVG.
Pairs in the lane with the dark-dusk ideal, the hi-contrast mono treatment, the heritage sepia, and
the pen-sketch, each a different-looking REAL map.
