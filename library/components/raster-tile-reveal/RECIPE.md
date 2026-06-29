---
id: raster-tile-reveal
name: "Raster tile reveal (a pre-baked static mosaic of raster map tiles — plain <img>, no canvas — that force-decode up front then fade + scale in with a diagonal stagger, after which real POI dots drop on real positions; the decode-guard is the whole point)"
level: 2
kind: component
status: candidate
entry:
  call: "RasterTileReveal.create(target, opts)  // target = .rtr-stage (the .rtr-mosaic + tiles + dots are injected). opts: { tiles:[{src,col,row}], cols, rows, pois:[{x,y,label}], stagger, scaleFrom, ease, dur, auto }."
  module: iife
  returns: "{ reveal(), set(p), trigger, decodeAll(), refresh(), destroy }"
meaning:
  what: "The first PHOTOGRAPHIC-map medium in the location family — a genuinely NEW medium root, not a reskin. Every other location atom is hand-drawn SVG or vector-baked OSM line-art; this one shows a REAL raster map: a pre-baked STATIC mosaic of map tiles (satellite-style imagery of the real coordinates) laid out as a grid of plain <img> tiles. NO live tile server / NO Leaflet / NO Mapbox / NO pan engine at runtime (stays no-WebGL, no second scroll owner). On reveal all tiles FORCE-DECODE (img.decode()) up front, THEN fade + scale in (scaleFrom -> 1) with a small per-tile diagonal stagger; then real POI dots DROP onto their real positions. The DECODE-GUARD is the whole point: an undecoded <img> paints a black flicker, so we never reveal a tile that has not decoded."
  when: "A location beat where the line-art / vector map has been earning its keep and you want ONE moment of real, photographic ground truth — 'this is the actual place, from above'. The raster mosaic reads heavier and truer than line-art, so use it as a punctuation, not the whole section: a single aerial reveal with the real POIs landing on it, then hand back to the lighter vector maps. Pairs well right before or after a vector OSM map so the eye gets the honest satellite read once, then the calm illustrated read for browsing."
  lands: "A dark frame holds, then a real aerial of the neighbourhood resolves tile by tile along a soft diagonal — never a black flash, the imagery just arrives already sharp — and the moment the ground is in, the real points of interest tick down onto their exact spots: the supermarket, the post office, the school. It feels like the map blinked into focus and then quietly labelled itself."
  not_when: "When the section needs to PAN/ZOOM a live map (this is frozen — no runtime map engine; would need WebGL/Leaflet, which is banned). When you want the lighter illustrated language (use district-radiates / minutes-bloom / the SVG OSM maps). When there are no baked raster tiles yet and a render slice would look fake at full bleed. As the whole location section (it is a punctuation beat, one real read)."
source:
  grammar: "NEW MEDIUM ROOT for the location family. The 12 existing location atoms are all hand-drawn SVG or vector-baked OSM (osm-agronomichne.js: 136 roads, 823 buildings, 6 real POIs). This adds the first raster/photographic map medium: a static, pre-baked tile mosaic with a decode-guarded staggered reveal — the no-WebGL way to show a real satellite map without a live tile server or pan engine."
  recording: "library/_assets/location/osm-agronomichne.js (real baked OSM of Агрономічне — site, roads, buildings, green, 6 real POIs with honest walk/drive minutes). Lab placeholder mosaic = renders/aerial.webp (QUADRO aerial, 1920x2560)."
  registry_ref: ["LOC-raster-tile-reveal-new-medium"]
stack: "vanilla + guarded GSAP 3.12.5 / ScrollTrigger (reveal itself is CSS-transition; ScrollTrigger only fires the one-shot on scroll-into-view)"
webgl: false
motion_props: [transform, opacity, filter]
trigger: "scroll-into-view one-shot (auto) OR pure set(p) scrub (auto:false)"
timing_layer: [B-reveal]
owns_pin: false
owns_scroll: false
page_beat: [location, map, neighbourhood, feature]
combines_with: [district-radiates, minutes-bloom, zoom-to-the-door, reach-ribbon, line-art-location-map, compass-rose-section-divider]
anti_combos: [pin, full-bleed-hero, live-map-pan-zoom]
gated_by: [R_perf_limits, R_decode_guard, R_no_webgl]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a grid of .rtr-tile cells (one plain <img> each — NO canvas) is laid out in .rtr-mosaic (grid-template repeat(cols/rows)); the mosaic box never animates (no pan/zoom engine at runtime)"
  - "DECODE-GUARD: decodeAll() forces img.decode() on EVERY tile before reveal/swap; cells start opacity:0 so hidden imgs decode without painting; an undecoded tile NEVER paints (no black flicker)"
  - "reveal() fades each cell opacity 0->1 + scales each img scaleFrom->1, staggered by diagonal order (row+col)*stagger; then real POI dots drop (opacity 0->1, scale .4->1, translateY 10px->0) once tiles are mostly in"
  - "real POI dots are positioned by left/top (set ONCE, not animated) from real x,y (% of the mosaic); use REAL OSM coordinates, never invented streets/POIs"
  - "set(p 0..1) is a PURE reversible map of the whole timeline (tiles finish by p~0.62, dots land by p=1) for a scrub; will-change armed for the one-shot, cleared after"
  - "transform (scale/translateY) + opacity + filter only; NO width/height/top/left, NO mix-blend, NO backdrop, NO WebGL, NO canvas, NO video scrub; owns_pin false, owns_scroll false (the mosaic is frozen)"
  - "reduced-motion -> static (all tiles + dots shown after decode, no motion); window.__LAB_OK__ on init"
  - "PRODUCTION SWAP: the lab placeholder mosaic (one render sliced into a CSS grid via object-position) is replaced by REAL baked satellite tiles of the OSM coordinates — same tiles[] contract, same decode-guard"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Throttle the network (DevTools) and scroll the mosaic into view: the aerial resolves tile by tile along a diagonal with NO black flicker (decode-guard), then the 6 real Агрономічне POI dots drop on their spots. set(p) is reversible (p=0 hidden, p=1 fully shown). Verify: plain <img> tiles (no canvas), decode-before-paint, staggered reveal, dot drop, fps. Distinct from every SVG/vector location atom — this is a REAL raster map."
note: |
  NEW MEDIUM ROOT for the location family — the first PHOTOGRAPHIC map. All 12 existing location
  atoms are hand-drawn SVG or vector-baked OSM line-art; this shows a real raster (satellite-style)
  map as a pre-baked STATIC tile mosaic with a decode-guarded staggered reveal. NO live tile server,
  NO Leaflet/Mapbox, NO pan/zoom engine at runtime -> stays no-WebGL and owns no second scroll.
  Plain <img> tiles (NOT canvas — canvas drawImage is banned). The DECODE-GUARD is the whole point:
  every tile is force-decoded (img.decode()) before anything paints, so a slow/undecoded tile never
  flashes black; cells sit at opacity:0 (hidden imgs decode fine via the up-front decodeAll). transform
  scale + opacity + filter only = GPU-cheap. will-change armed for the one-shot, cleared after.
  owns_pin false, owns_scroll false. status: candidate until promoted by an audit. Lab proves the
  MECHANIC on a placeholder mosaic (renders/aerial.webp sliced into a 3x4 grid) with 6 REAL OSM POIs;
  PRODUCTION swaps in real baked satellite tiles of the OSM coordinates via the same tiles[] contract.
---

# raster-tile-reveal — a real raster map mosaic that decodes, staggers in, then drops its POIs

The first photographic-map medium in the location family. A pre-baked STATIC mosaic of raster
map tiles (plain `<img>`, no canvas) laid out as a grid; on reveal every tile is force-decoded
up front, then the decoded tiles fade + settle in (scale ~1.04 → 1) along a diagonal stagger,
after which real POI dots drop on their real positions. No live tile server, no Leaflet/Mapbox,
no pan engine at runtime — it stays no-WebGL and owns no second scroll. The decode-guard is the
whole point: an undecoded tile would flash black, so nothing paints until it has decoded.

## Markup + call
```html
<section class="rtr-stage" id="map">
  <!-- .rtr-mosaic + tiles + dots are injected by create() -->
</section>
```
```js
RasterTileReveal.create('#map', {
  cols: 3, rows: 4,
  tiles: [ /* { src, col, row } for each tile of the mosaic */ ],
  pois:  [ { x: 44, y: 64, label: 'Нова Пошта' }, /* … real OSM coords (% of box) */ ],
  stagger: 0.04, scaleFrom: 1.04, ease: 'air'
});
```

## Proven (the lab)
Placeholder mosaic = `renders/aerial.webp` (QUADRO aerial, 1920×2560) sliced into a 3×4 CSS grid
of `<img>` tiles (each tile shows its slice via `object-position`), with the 6 REAL Агрономічне
POIs from `osm-agronomichne.js` (Траш!, Аврора, Грош Експрес, Нова Пошта, Подорожник, Школа·садок)
projected onto the mosaic. Measured: `decodeAll()` resolves before `reveal()` paints anything (no
black flicker); tiles fade + scale in along the diagonal stagger; dots drop after the tiles are in.
`set(p)` is reversible. `window.__LAB_OK__` true, zero console errors.

## Production note
The lab mosaic is a believable PLACEHOLDER — one render sliced into a CSS grid — only to prove the
MECHANIC (decode-guarded staggered tile reveal + POI dots). In production, swap in REAL baked
satellite tiles of the OSM coordinates through the same `tiles[]` contract; the decode-guard and
the reveal are unchanged. Never bake invented streets/POIs — use `osm-agronomichne.js` ground truth.
