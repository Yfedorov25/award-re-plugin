# HANDOFF RESULTS — SESSION 3 (KARTA / map sections)

Worker Session 3 built the MAP sections. The first two attempts (dark-OSM, built thin over LocMap)
were REJECTED by the owner as "лендинг 2020 / дешева естетика". PIVOT: a new EDITORIAL ILLUSTRATED
map language (warm cream paper, hand-drawn, light + premium — the river-tinted / line-art family),
standalone illustrated SVG (NOT the dense 823-building OSM engine). Same real-data APPROACH as the
smarts location map (real OSM bake -> viewBox px), just rendered as a simplified hand-drawn
illustration. Four distinct devices, each through the full 7-step pipe + an adversarial skeptic pass,
each shown to the owner and approved.

Lab server: `cd library/components && python3 -m http.server 8820`
Scratchpad (screens + probes): `/tmp/award-worker-3/`
Base verify: `node scripts/library-index.mjs && node scripts/library-verify.mjs` -> **GREEN**
(94 components; all 4 of my sections pass headless __LAB_OK__ + frontmatter + files).

---

## THE 4 ILLUSTRATED MAP SECTIONS (all DONE, GREEN, owner-approved)

### 1. district-radiates  ✅  http://localhost:8820/district-radiates/lab.html
Editorial illustrated proximity map: thin leader-threads RADIATE from the home to ~6 named daily
places with walk-minutes; river+roads draw, the home blooms, threads stitch out; hover a row/pin to
light its thread. The overview device (lines).
- Skeptic: 2 CRITICAL (threads not touching pins -> CTM-positioned dots; preserveAspectRatio none
  squashed circles -> slice) + 2 MAJOR (balanced radial fan; home tag off the convergence) + contrast/
  a11y/listeners. ALL fixed.
- Verified: 0px pin-to-thread align at 1440/1280/1024/760, round circles, **0% jank @60fps**, hover sync,
  reduced-motion, destroy clean, 0 errors, 0 em-dash. Screens: dr-full.png, dr-hover.png.

### 2. minutes-bloom  ✅  http://localhost:8820/minutes-bloom/lab.html  (pinned — scroll into it)
Time-as-hero: a PINNED section steps through the places one at a time; a giant editorial minute number
counts up 0->N while a terracotta arc draws home->place on a quiet faded map; step rail. The time device
(counter). owns_pin.
- Skeptic: 2 CRITICAL (POIs clipped off-screen by slice -> DOM labels via CTM + safe central band;
  no mobile composition -> gsap.matchMedia static) + 4 MAJOR (reduced-motion hid 5/6 places -> full list;
  rail jumped mid-step -> settled point; destroy leaked rail+labels; rail hit area 3px -> 24px). ALL fixed.
- Verified: all labels+arc on-screen incl. final step, **0% jank @60fps**, mobile + reduced-motion full
  content, rail lands on matching number, destroy clean, 0 errors, 0 em-dash. Screens: mb-laststep.png,
  mb-step.png, mb-mobile.png.

### 3. zoom-to-the-door  ✅  http://localhost:8820/zoom-to-the-door/lab.html  (pinned — scroll)
Three-act scroll cinema МІСТО -> РАЙОН -> ДІЛЯНКА: three hand-illustrated frames MATCH-CUT through a
shared focal point (village dot -> home -> parcel), the outgoing act scaling up and out while the
incoming settles in from small (a real dive, not three fades); per-act palette warms; breadcrumb rail;
payoff = the hatched plot with dimensions. The scale device. owns_pin.
- Skeptic: 2 CRITICAL ("zoom isn't a zoom, three fades between unrelated drawings" -> shared focal point
  + dive scale 0.45->2.6; mobile captions divorced from maps -> paired cards) + 3 MAJOR (plot under-
  composed -> centered + leader ticks; palette warmed invisibly -> perceptible; draws one-shot -> re-arm
  on backward scroll) + contrast. ALL fixed.
- Verified: real dive on a shared focal, palette warms, plot recomposed, re-arm works, **0% jank @60fps**,
  mobile paired cards, reduced-motion, destroy clean, kicker AA, 0 errors, 0 em-dash. Screens:
  ztd-act1/act2/act3.png, ztd-mid.png, ztd-mobile.png.

### 4. reach-ribbon  ✅  http://localhost:8820/reach-ribbon/lab.html
Coverage, not distance: one soft LOBED walking-reach isochrone is drawn on the map; places INSIDE light
warm + named, the 2 just OUTSIDE stay faint with "+N хв"; a live count + a 5/10-min toggle grows the
ribbon. The coverage device (area). Honest point-in-polygon inside/outside.
- Skeptic: 4 CRITICAL (perfect oval -> lobed isochrone; non-monotonic minutes -> distance rises with
  minutes; outside labels failed AA -> darkened; mobile map below fold -> map first) + 6 MAJOR (edge
  labels clipped -> anchored inward; legend rows failed AA; toggle no aria -> role=group + aria-pressed;
  legend no roles -> role=list; count/copy hardwired to 10 -> reach-agnostic + aria-live; "+" convention
  broke on toggle -> live-driven) + minors. ALL fixed.
- Verified: inside sets 5/2, "+" convention live, monotonic placement, lobed shape (radial var 0.09),
  0px pins, edge labels on-stage, AA contrast (5.98 / 6.58), mobile in-fold, reduced-motion, destroy
  clean, **0.9% jank @59fps**, 0 errors, 0 em-dash. Screens: rr-10.png, rr-mobile.png.

---

## SHARED LANGUAGE (all 4)
Warm cream paper (#f4efe6/#ece4d6), warm near-black ink, soft slate river, sage parks, hair-thin roads,
terracotta home + accents (#b56a4a; #8f4a30 for small text AA), Fraunces serif (300 + italic accent) +
Inter sans. Standalone illustrated SVG, DOM pins via getScreenCTM (0px align), preserveAspectRatio slice
(round circles) except zoom (meet, framed). NO WebGL, NO mix-blend, NO backdrop-filter, nuln em-dash,
reduced-motion static, mobile composition, destroy clean. Each verified <8% jank @4x CPU.

## DATA NOTE (owner question)
In production every map takes the SAME real-OSM bake as smarts Агрономічне (Overpass -> projector ->
viewBox px): real streets, real walk-minutes, real POI coords. The illustrations are that real geometry
SIMPLIFIED and drawn light, not invented. reach-ribbon's ribbon is a real isochrone from the walking-
reach routing. Realism of the DATA is preserved; only the DRAWING changes (premium, not grey OSM).

## REMOVED
The two rejected dark-OSM sections (scrub-the-walk-home, ten-minute-tide) were deleted (Session-2 dirs
untouched).
