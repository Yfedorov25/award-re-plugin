# MASTER CONTEXT — award-re day/night + map SECTIONS (read this 100% before doing anything)

You are a **worker session** in a 3-hand parallel build. A master session (the human's main
Claude) holds the canon engines, the base, final review, and the gallery. Your job is NARROW:
build the SECTIONS assigned in your entry prompt, EXACTLY by the pipeline below, with full
verification + an adversarial skeptic pass, write the results to the right files, then **STOP**.
Do not start any other task. Do not deploy. Do not touch other sessions' component ids.

This file is the single source of truth. If anything here conflicts with your instinct, this wins.

---

## 0. THE REPO + WHERE THINGS LIVE

- Plugin repo: `/Users/yehorfedorov/Downloads/award-re-plugin` (GitHub Yfedorov25/award-re-plugin, branch `main`).
- Components: `library/components/<id>/` — each brick is a folder with EXACTLY these files:
  `component.js`, `component.css`, `lab.html`, `RECIPE.md`, `tokens.json`, and a `renders` symlink.
- The canon engines you BUILD ON (do NOT modify, do NOT fork):
  - `library/components/daynight-engine/` — the day↔night engine (`window.DayNight`).
  - `library/components/locmap-engine/` — the location-map engine (`window.LocMap`).
- Shared real assets live at `/Users/yehorfedorov/Downloads/eruhomist/apps/quadro/public/proto/`
  and every component reaches them via its `renders` symlink → that folder. To create the symlink:
  `ln -sfn /Users/yehorfedorov/Downloads/eruhomist/apps/quadro/public/proto library/components/<id>/renders`
- The award-winning ideas catalog (your section specs, with ASCII layouts + wow beats):
  `/Users/yehorfedorov/Downloads/eruhomist/apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md`
- Scratchpad for screenshots/temp scripts: use `/tmp/award-worker-<N>/` (make it; never write temp into the repo).

## THE LAB SERVER (how you see your work)
A static server serves the components folder on port 8820:
```
cd /Users/yehorfedorov/Downloads/award-re-plugin/library/components && python3 -m http.server 8820
```
If it is not already running, start it (background). Your lab opens at
`http://localhost:8820/<id>/lab.html`.

## PLAYWRIGHT (how you verify headless — it is already installed here)
`/Users/yehorfedorov/Downloads/eruhomist/apps/towns/node_modules/playwright`
Drive it from node, e.g.:
```js
const pw = require('/Users/yehorfedorov/Downloads/eruhomist/apps/towns/node_modules/playwright');
```

---

## 1. THE NON-NEGOTIABLE LAWS (break any of these and the work is rejected)

1. **NO WebGL. NO canvas drawImage.** Only SVG / DOM / CSS: `opacity`, `transform`, `clip-path`,
   `mask`, `stroke-dashoffset`, CSS custom properties, CSS gradients. No `<canvas>`, no `getContext`,
   no three.js, no Mapbox/Leaflet/Deck, no map tiles.
2. **NO `mix-blend-mode` and NO `backdrop-filter`** anywhere (perf + house law). If you think you need
   `mix-blend`, you don't — find an opacity/gradient way.
3. **THIN ORCHESTRATOR.** Your section must BUILD ON the canon engine, never re-implement it. For
   day/night you call `window.DayNight.create()` and drive `set(t)`. For maps you call
   `window.LocMap.create()`. You may add chrome (rails, dials, captions, overlays) and orchestration
   (which room is visible, what time it is) — but the crossfade/seam/portal/route logic lives in the
   engine. If you catch yourself writing a clip-path crossfade by hand, STOP and use the engine.
4. **Frame-matched pairs ONLY.** A day render and its night render must be the SAME shot, geometry
   identical, lighting-only change. A mismatched pair JUMPS on transition. Verify visually before using.
5. **ZERO em-dash (—) and en-dash (–) in any VISIBLE copy.** Ukrainian, Fedoriv voice: live,
   conversational, no clichés, no "—". Use a period or a comma. (Comments/prose in RECIPE may keep them
   but prefer not.) This is a hard rule with a hook that rejects violations.
6. **`window.__LAB_OK__ = true`** must be set on init in BOTH component.js and at the end of lab.html.
7. **reduced-motion** must be respected: `matchMedia('(prefers-reduced-motion: reduce)')` → a calm static
   end state, drivers disarmed, no scrub/pin.
8. **`node scripts/library-index.mjs && node scripts/library-verify.mjs` must be GREEN** after your work.
9. **RECIPE.md frontmatter must match the schema EXACTLY** (see §5). The verify is strict.

---

## 2. THE CANON ENGINES — EXACT API (build on these, do not change them)

### `window.DayNight` (library/components/daynight-engine/component.js)
The signature day↔night primitive: two frame-matched media stacked, one progress `t` (0=day, 1=night).
```js
DayNight.create(target, {
  dayMedia, nightMedia,        // url | selector | element — frame-matched, identical composition
  mode: "manual"|"toggle"|"scrub"|"cursor"|"hover"|"autoloop",  // DRIVER (use "manual" when YOU drive set(t))
  reveal: "opacity"|"seam"|"portal",                            // HOW night appears
  seamAxis:"x"|"y", seamFrom:"left"|"right"|"top"|"bottom",     // seam sits AT t; night to one side
  portalOrigin:"50% 50%",      // portal: clip-path circle(t*145% at origin)
  ease:0.5, rest:0, loop:{period:8},
  scrub:{ trigger, start, end, pin },   // mode:"scrub" only (requires ScrollTrigger)
  scrim:0, glow:false|cssGradientString, labels:["День","Ніч"], onUpdate:(t)=>{}
})
// returns { root, set(t), get(), toggle(), play(), pause(), setMode(m), destroy }
// set(t) is PURE — t 0..1. The engine injects .dn > .dn__day + .dn__night (+ optional glow/scrim/seamline/tags).
```
Load order in a lab that uses it:
```
<link rel="stylesheet" href="../daynight-engine/component.css">   (canon CSS FIRST)
<link rel="stylesheet" href="component.css">                       (your section CSS)
GSAP 3.12.5 cdn (+ ScrollTrigger cdn if you scroll-drive)
<script src="../daynight-engine/component.js"></script>           (canon JS BEFORE yours)
<script src="component.js"></script>
```

### `window.LocMap` (library/components/locmap-engine/component.js)
Real OSM district map: roads/buildings/green, the property, numbered POIs synced to a side list,
a Dijkstra route that draws with a walking dot + live minute counter, walking ring, 9-gate reveal,
parallax, dual loc|infra mode.
```js
LocMap.create(target, {     // target must contain [data-lm-stage] (+ optional [data-lm-list])
  data, site, mScale, walkMin, modes:["loc","infra"], route:true, reveal:{start,once}, onSelect:(id)=>{}
})
// returns { root, svg, select(id), clearSel(), setMode(m), setCat(cat), reveal(), destroy }
```
GOTCHA (cost the master a critical bug): LocMap's reveal fires at `start:'top 58%'`; if YOU pin the
section at `top top` the reveal never fires and the map stays invisible. If you pin over a LocMap,
force-show it (set every `[data-lm=*]` group opacity 1, draw the big roads, add `is-born`) and kill
LocMap's own scrolltriggers that target your host. Also LocMap spawns its OWN ScrollTriggers — to read
YOUR section's progress use `ScrollTrigger.getAll().find(t => t.pin)` (or filter by your trigger).
Real OSM demo data for any map lab: `renders/locmap-demo.js` sets `window.LOCMAP_DEMO`
(136 roads, 823 buildings, 6 POIs with Dijkstra routes, + an `infra` block for dual-mode).

---

## 3. REAL ASSETS available in proto/ (via the `renders` symlink)

Day/night INTERIOR pairs (frame-matched Higgsfield room renders):
`a1-r1-day.webp`/`a1-r1-night.webp` (living room), `a1-r2-*` (kitchen-TV), `a1-r3-*` (general space),
`a1-r4-*` (kitchen/dinner). Also `dn-int-day/night.webp`, `dn-int2-day/night.webp`.
Day/night EXTERIOR pair: `dn-ext-day.webp` / `dn-ext-night.webp` (the house, 16:9, 1920x1071) +
mobile `dn-ext-day-m/-night-m.webp` (9:16). The night render's lit windows sit in a warm band across
the lower-middle of the facade (useful for window-mask sections).
Map data: `locmap-demo.js` (window.LOCMAP_DEMO).
If a section needs an asset that does not exist (e.g. a golden-hour mid frame, or window hotspot coords),
do NOT invent a path. Either (a) use the day/night pair you have (the engine lerps opacity day↔night),
or (b) note in your report exactly what asset is missing so the master can generate it. NEVER reference a
file that is not on disk — check with `ls` first.

---

## 4. THE PIPELINE — run this for EVERY section, in order. This is how we get 10/10, not "криво".

The #1 reason agents ship broken code: they write an engine from memory, duplicate logic, and break what
works. You avoid that by building thin on the canon + verifying every step. Per section:

**STEP 1 — READ THE SPEC.** Open IDEAS_daynight_map_sections.md, find your section by name, read its
composition / navigation / interaction / wow-beat / ASCII layout / recombines / no-webgl notes. Also read
the canon engine you will build on (its RECIPE.md `meaning` + the create() options).

**STEP 2 — BUILD THIN.** Create the folder + `renders` symlink. Write component.js (vanilla IIFE,
`window.<Name>`, sets `__LAB_OK__`), component.css (chrome only), lab.html (correct load order, real assets,
a gentle autoplay demo + a replay control, fully interactive, Fedoriv UA copy, zero em-dash). The section
calls the canon engine and orchestrates; it does not re-implement transitions.

**STEP 3 — HEADLESS DOM-FACT CHECK (Playwright).** Do NOT trust screenshots alone (they hide bugs — a map
looked fine in a screenshot while the property/route were at opacity 0). Drive the lab and MEASURE:
- `window.__LAB_OK__ === true`, zero console errors AND zero pageerrors AND zero "GSAP target not found".
- the assets actually loaded (`img.complete && naturalWidth>0`).
- the MOVE actually works: drive the driver/scroll/click and assert the DOM changes as specified
  (opacity/clip-path/transform values, room index, time, route present, etc). Assert the END state is
  correct (e.g. last room fully lit, not faded to black; night reaches t≈1).
- if you pin: the pinned element stays put across its range; read the PINNED ScrollTrigger for progress.

**STEP 4 — SMOOTHNESS PROBE (4× CPU throttle).** This is mandatory. Throttle CPU 4× and rAF-measure a full
run of the section's motion. PASS = fps ≥ 50 AND jank (frames > 20ms) < 8%. If it fails, FIND the cause and
fix it (do not ship a janky section). Known killers we already hit: `will-change` left on stacked layers
(promotes too many compositor layers — clear it on layers you drive rarely); CSS-custom-property changes
that cascade to hundreds of SVG elements per frame (drive per-phase, not per-frame); per-element CSS
animations (flicker) running during a scrub (turn them off during scrub); `mix-blend` over a scroll surface.
```js
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
// then rAF-loop while programmatically scrolling/driving, collect frame deltas, compute fps + %>20ms
```

**STEP 5 — ADVERSARIAL SKEPTIC.** Spawn a subagent (general-purpose) as a HARSH Awwwards juror + senior FE
reviewer. Tell it to find every reason the section is NOT 10/10: correctness/bugs, award quality (is it
genuinely beautiful + the concept intact, or washed-out/abrupt/junior), thinness (did you fork the engine?),
no-webgl + perf, accessibility (keyboard, aria, reduced-motion, contrast of text over bright media). Give it
the file paths + the live lab url + Playwright path. It must cite file:line and propose concrete fixes.
**FIX EVERY CRITICAL AND MAJOR finding it reports**, then re-verify (re-run STEP 3+4). The skeptic has caught
a CRITICAL bug in EVERY section so far — it is not optional.

**STEP 6 — WRITE RECIPE.md + tokens.json** (RECIPE to the exact schema, §5) and run
`node scripts/library-index.mjs && node scripts/library-verify.mjs` until GREEN.

**STEP 7 — RECORD + STOP.** Append one row to your results log (see your entry prompt for the path) per
section: id, the localhost lab url, the verified facts (DOM measurements), the smoothness numbers, the
skeptic's findings + that they're fixed, and any missing-asset note. Save 1-2 framed screenshots to your
scratchpad and reference their paths. Then STOP — do not move on to anything not in your list.

---

## 5. RECIPE.md FRONTMATTER SCHEMA (exact — verify is strict)

Copy the field set + nesting from `library/components/daynight-cursor-seam/RECIPE.md`. Required top-level keys:
```
id, name, level, kind, status, since, tags,
entry: { call, module, returns }
meaning: { what, when, lands, not_when }
source: { grammar, recording, registry_ref }
stack, webgl(false), motion_props[], trigger, timing_layer[],
owns_pin(bool), owns_scroll(bool), page_beat[],
combines_with[], anti_combos[], gated_by:[R_no_webgl, R_perf_limits],
variants[], params_ref(tokens.json), files[],
acceptance[ ... ], gate:{ probe }, note: |
```
`kind: section` for a full section composition. `level: 3` for rich (pin + interaction). `recording` cites
`apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md`. All four `meaning.*` non-empty.
`gated_by` non-empty (`[R_no_webgl, R_perf_limits]`, add `R_pin_budget` if you pin).

---

## 6. LESSONS FROM THE MASTER'S BUILDS (do not repeat these)

- **will-change jank:** daynight-engine promotes each night layer with `will-change:opacity`. Stacking N of
  them under a scroll churns the compositor (9% → 0.6% jank when cleared). If you stack multiple engines,
  clear `will-change` on the layers you only drive occasionally, and `visibility:hidden` fully-hidden cells.
- **reveal-under-pin:** a LocMap pinned at `top top` never fires its `top 58%` reveal → invisible map. Force
  the born state yourself when you pin over it.
- **snap to seams:** if you snap a multi-item scrub, snap to item CENTERS, not band edges (edges are the
  cross-dissolve seams → off-by-one navigation + the snap fights the scrub).
- **time≠lighting desync (the bug that killed the first room-reel):** if a clock is tied to global scroll
  progress but you show rooms one-at-a-time and let each room go full day→night within its own band, you get
  "11am but the room looks like midnight". Time and lighting MUST stay consistent. Decide the model up front
  (all rooms change together on one synchronized clock; OR each room sits at its own fixed natural hour; OR
  pick-a-room-then-scrub-its-own-day) and keep clock == lighting everywhere.
- **day must read as DAY:** a light-wash that bleaches the image is fog, not a daytime view. Make day a real
  light state (legible). Don't claim a feature the user cannot see (no dead `*0` gradients).
- **caption over bright media:** white text over a bright morning render needs a real scrim plate, not just a
  blur text-shadow.
- **screenshots lie on smooth-scroll pages:** verify with DOM facts + a direct rAF probe, and capture frames
  by driving the PINNED trigger to specific progresses (not by scrollHeight fraction, which overshoots a pin).

---

## 7. WHAT "DONE" LOOKS LIKE (your deliverable per section)
A folder `library/components/<id>/` with all 6 files; lab GREEN at `http://localhost:8820/<id>/lab.html`;
`__LAB_OK__` true, 0 console errors; the move verified by DOM facts; smoothness PASS (≥50fps, <8% jank @4×);
skeptic's critical+major findings all fixed; base verify GREEN; one row in your results log; screenshots
saved. Then STOP. The master pulls your results and reviews before anything is merged or shipped.

Do NOT: deploy, push, modify the canon engines, touch other sessions' ids, edit production sites in
/Users/yehorfedorov/Downloads/eruhomist/apps/*, or start work outside your assigned list.
