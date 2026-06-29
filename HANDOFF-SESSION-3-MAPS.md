# SESSION 3 — ENTRY PROMPT (paste this whole file as your first message)

You are **Worker Session 3** of a 3-hand parallel build of award-winning real-estate web SECTIONS for
the `award-re` plugin. There is a MASTER session (the human's main Claude) that owns the canon engines,
the base, final review, and the gallery. Two worker sessions (Session 2 = exterior day/night, you =
Session 3 = MAP sections) build in parallel. Your scope is NARROW and fixed. Do only what is below, then STOP.

## FIRST: read the master context 100%, in full, before touching anything
`/Users/yehorfedorov/Downloads/award-re-plugin/HANDOFF-SECTIONS-MASTER-CONTEXT.md`
It defines the repo layout, the lab server, Playwright, the NON-NEGOTIABLE LAWS, the EXACT canon-engine
APIs (`window.DayNight`, `window.LocMap`), the real assets, the 7-step PIPELINE (build thin → DOM-fact
check → smoothness probe @4× CPU → adversarial skeptic → RECIPE → record → STOP), the RECIPE schema, and
the lessons from the master's builds. Everything there applies to you. Do not deviate.

## YOUR THEME: MAP sections — "what is nearby", proximity, routes. NO day/night on the map.
(The master tested a day/night map and REJECTED it: without a real night dataset for every object it reads
unrealistic. So your maps are about PROXIMITY + ROUTES + TIME-TO-EVERYTHING, NOT a day→night overlay.)
Build on `window.LocMap` (the verified map engine). Real OSM demo data is `renders/locmap-demo.js`
(`window.LOCMAP_DEMO`: 136 roads, 823 buildings, 6 POIs each with a precomputed Dijkstra `route`, + an
`infra` block for dual-mode). Read each section's full spec (composition / navigation / interaction /
wow-beat / ASCII layout / recombines / no-webgl) in:
`/Users/yehorfedorov/Downloads/eruhomist/apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md`

### Build these, ONE AT A TIME, each through the full 7-step pipeline:

1. **`scrub-the-walk-home`** (B3, map). The smarts signature (route draws + live minute timer) put in the
   VISITOR'S hand: drag a walking dot along the real street route and the minutes count up in real time; on
   arrival a small "you're home" beat. Built on LocMap's route geometry (`getPointAtLength`) + a Draggable
   (GSAP Draggable, inertia/snap). NO day/night. The drag IS the control.

2. **`ten-minute-tide`** (B2, map). Concentric TIME-RINGS radiate from the home (5 / 10 / 15 min walk); each
   POI snaps to the ring it belongs to, so the visitor reads "everything within 10 minutes" at a glance. Built
   on LocMap (the property anchor + POIs + the walking-ring idea, scaled to multiple rings). Rings scale-reveal
   on scroll; hover a ring dims the others; a legend labels the minutes.

3. **`thread-and-needle-star`** (B5, map). The home at the centre; each POI is a THREAD (a thin line) that
   DRAWS on hover with its minutes, forming a star of connections. Built on LocMap geometry; on hover/focus a
   POI, its thread strokes in (`stroke-dashoffset`) with a minute label; multiple can light. A calm idle state.

4. **`zoom-stage-village-to-door`** (B4, map — difficulty L, the riskiest mechanic). Three zoom stages
   (city → district → plot) that transition by animating the SVG `viewBox` (or a transform-origin scale), with
   breadcrumbs. Built on LocMap for the district stage; the city + plot stages can be simpler SVG/raster. Since
   `viewBox` animation is the risky bit, prove it smooth (STEP 4) before adding polish. If a stage needs an asset
   you don't have (a city-scale map, a plot close-up), do NOT invent a path — build what you can and note the
   missing asset in your report.

(If you finish all 4 with time to spare, STOP anyway and report — do not pull work from other sessions.)

## WHERE TO PUT RESULTS
- Each section: `library/components/<id>/` (all 6 files + `renders` symlink). Use the ids above as folder names.
- Append one row PER SECTION to your results log (create it if missing):
  `/Users/yehorfedorov/Downloads/award-re-plugin/HANDOFF-RESULTS-SESSION-3.md`
  Each row: `### <id>` then: lab url (`http://localhost:8820/<id>/lab.html`), the DOM-fact verification
  (what you measured — route present, rings count, threads draw, viewBox animates, etc), the smoothness numbers
  (fps + jank @4×), the skeptic's findings + confirmation each CRITICAL/MAJOR is fixed, screenshot paths
  (in `/tmp/award-worker-3/`), and any missing-asset note.
- Run `node scripts/library-index.mjs && node scripts/library-verify.mjs` → must be GREEN before you log a section as done.

## HARD BOUNDARIES (do not cross)
- Do NOT modify the canon engines (`daynight-engine/`, `locmap-engine/`).
- Do NOT touch Session 2's or the master's component ids. You own ONLY the 4 ids above.
- Do NOT deploy, push, or edit production sites in `/Users/yehorfedorov/Downloads/eruhomist/apps/*`.
- Do NOT do anything outside this list. When the 4 are done + logged + verify GREEN, STOP and say so.
- Every section must pass: `__LAB_OK__` true, 0 console errors (incl. no "GSAP target not found"), DOM move
  verified, smoothness PASS, skeptic critical+major fixed, base verify GREEN, zero em-dash in visible copy.
- LocMap gotcha (from the master): LocMap spawns its OWN ScrollTriggers; to read YOUR section's progress use
  `ScrollTrigger.getAll().find(t => t.pin)` or filter by your trigger. If you pin over a LocMap, force-show it
  (the `top 58%` reveal won't fire under a `top top` pin).

Start by reading the master context file in full, then section 1 (`scrub-the-walk-home`). Work one section at a
time, fully verified, before the next. STOP when all four are logged.
