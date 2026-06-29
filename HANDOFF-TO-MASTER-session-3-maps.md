# HANDOFF → MASTER · Session 3 · MAP sections (illustrated language)

**From:** Worker Session 3 (KARTA / maps)
**Status:** ✅ COMPLETE — 4 map sections, all verified, owner-approved, base verify GREEN.
**For the master:** pull these 4 components, review, and merge. Nothing else of mine to do.

---

## 0. TL;DR

I was assigned 4 dark/day-night map sections built thin over the OSM `locmap-engine`. The owner
**rejected the first two** ("лендинг 2020 / дешева естетика — це не зум а каша над сірим OSM"), so we
**pivoted to a new editorial ILLUSTRATED map language** (warm cream paper, hand-drawn, light + premium
— the `river-tinted-poi-map` / `line-art-location-map` family) and built **4 distinct devices**, each
through the full 7-step pipe + a harsh adversarial-skeptic pass, each shown to the owner and approved.

The 4 (all `library/components/<id>/`, all `kind: section`, `level: 3`, `webgl: false`):

| id | device | owns_pin | lab |
|---|---|---|---|
| **district-radiates** | proximity as LINES (threads radiate from the home to named places) | false | `/district-radiates/lab.html` |
| **minutes-bloom** | TIME as hero (pinned; a giant minute counts up + an arc draws, one place per step) | **true** | `/minutes-bloom/lab.html` |
| **zoom-to-the-door** | SCALE cinema (pinned; місто→район→ділянка match-cut dive on a shared focal point) | **true** | `/zoom-to-the-door/lab.html` |
| **reach-ribbon** | COVERAGE / area (a lobed walking-reach isochrone; inside lights, outside faint; 5/10 toggle) | false | `/reach-ribbon/lab.html` |

**Base verify is GREEN** (`node scripts/library-index.mjs && node scripts/library-verify.mjs` →
`✓ verify GREEN`); all 4 pass headless `__LAB_OK__` + frontmatter + contract files.

---

## 1. KEY DECISION the master must know (architecture deviation)

These 4 are **STANDALONE illustrated SVG maps — they do NOT build on `locmap-engine`.** That is a
deliberate, owner-directed deviation from the original brief (which said build thin over the canon
map engine). Reason: the dense 823-building dark OSM read as cheap AND was a perf nightmare (any
animation over 823 paths re-rasterizes them → 13–48% jank; see §5). The owner explicitly chose the
illustrated language instead.

**Data is still real.** In production each map takes the SAME real-OSM bake as smarts Агрономічне
(Overpass → projector → viewBox px): real streets, real walk-minutes, real POI coords. The
illustration is that real geometry SIMPLIFIED and drawn light (a river + a few parks + key roads +
real POIs), not invented. `reach-ribbon`'s ribbon is a real isochrone from the walking-reach routing.
**Realism of the DATA is preserved; only the DRAWING changes** (premium, not grey OSM). The owner
asked and confirmed this explicitly.

So: the `locmap-engine` canon is **untouched** (I never modified it). These are a NEW dialect that
sits alongside `river-tinted-poi-map` / `line-art-location-map` in the illustrated-map family.

---

## 2. WHERE EVERYTHING IS

- Components: `library/components/{district-radiates,minutes-bloom,zoom-to-the-door,reach-ribbon}/`
  — each has the 6 files (`component.js`, `component.css`, `lab.html`, `RECIPE.md`, `tokens.json`,
  `renders` symlink → `…/apps/quadro/public/proto`).
- Lab server: `cd library/components && python3 -m http.server 8820`, then open each lab url above.
- Per-section results detail: `HANDOFF-RESULTS-SESSION-3.md` (in this repo root).
- My probe scripts + framed screenshots: `/tmp/award-worker-3/` (e.g. `dr-full.png`, `dr-hover.png`,
  `mb-laststep.png`, `mb-mobile.png`, `ztd-act1/2/3.png`, `ztd-mid.png`, `ztd-mobile.png`, `rr-10.png`,
  `rr-mobile.png`).

**REMOVED:** the two rejected dark-OSM sections (`scrub-the-walk-home`, `ten-minute-tide`) were
deleted. Session-2 dirs (`our-house-at-dusk`, `room-hour-walk`) were NOT touched.

---

## 3. THE SHARED ILLUSTRATED LANGUAGE (so all 4 read as ONE system)

- **Palette:** warm cream paper `#f4efe6 → #ece4d6`; ink `#2c2620`, soft `#5c5347`; soft slate river
  `#c2cdd1`, sage parks `#d2dac4`, hair-thin roads `#c8bca8`; terracotta home + accents `#b56a4a`,
  and `#8f4a30` for SMALL text (the AA-safe deeper terracotta — kicker, hot label, focus ring).
- **Type:** Fraunces serif (300 + an italic terracotta accent line; big numbers/headlines) + Inter sans
  (kicker, labels, lead, controls).
- **Geometry fidelity (reused across all 4):** POI dots/labels are DOM nodes positioned by mapping
  their viewBox coord through `svg.getScreenCTM()` → they render OUTSIDE the slice-clipped box, never
  cropped, and align to **0px** with their SVG anchor at every viewport. `preserveAspectRatio="slice"`
  keeps circles round (zoom uses `meet` because its viewBox aspect matches the frame).
- **Laws honored everywhere:** NO WebGL / canvas / tiles / Mapbox; NO `mix-blend-mode`, NO
  `backdrop-filter`; **zero em-dash** in visible copy; reduced-motion → a calm static state; a real
  mobile composition (`gsap.matchMedia` for the pinned ones); `destroy()` removes its listeners/nodes
  (no leak on recreate); WCAG AA on small text.

---

## 4. EVIDENCE (verified per section — DOM facts + smoothness @4× CPU)

Every section passed: `__LAB_OK__` true, 0 console errors / 0 pageerrors / 0 "GSAP target not found",
DOM move verified, reduced-motion + mobile checked, destroy clean, 0 em-dash, smoothness PASS
(≥50 fps, <8% jank @4× CPU throttle). The skeptic found a CRITICAL in every section; ALL fixed + re-verified.

- **district-radiates** — 0px pin↔thread align @ 1440/1280/1024/760, round circles, hover sync,
  **0% jank @ 60fps**. Skeptic: 2 CRITICAL (translate-on-column tore threads off pins → CTM dots;
  `pAR=none` ellipses → `slice`) + 2 MAJOR (balanced fan; tag off convergence) + contrast/a11y/listeners.
- **minutes-bloom** *(owns_pin)* — every active label + arc on-screen incl. the final step, rail lands
  on the matching number, **0% jank @ 60fps**, mobile + reduced-motion show a full readable list.
  Skeptic: 2 CRITICAL (POIs clipped by `slice` → DOM-via-CTM + safe band; no mobile → matchMedia static)
  + 4 MAJOR (RM hid 5/6 places → full list; rail mid-step → settled; destroy leak; 3px→24px hit).
- **zoom-to-the-door** *(owns_pin)* — real dive (outgoing 1→2.6, incoming 0.45→1 on a SHARED focal
  point), palette warms cool→warm, plot recomposed (leader ticks), draws re-arm on backward scroll,
  **0% jank @ 60fps**, mobile paired cards. Skeptic: 2 CRITICAL ("three fades not a zoom" → shared focal
  + dive scale; mobile captions divorced → paired cards) + 3 MAJOR (under-composed plot; invisible
  warming; one-shot draws) + contrast.
- **reach-ribbon** — honest point-in-polygon inside/outside (5 inside @10min, 2 @5min), lobed isochrone
  (radial var 0.09, not an oval), monotonic place placement, "+N хв" driven live, AA contrast, mobile
  in-fold, **0.9% jank @ 59fps**. Skeptic: 4 CRITICAL (perfect oval; non-monotonic minutes; outside
  labels failed AA; mobile map below fold) + 6 MAJOR (edge-label clip; legend AA; toggle aria; legend
  roles; copy hardwired to 10; "+" broke on toggle).

Total across the 4: **12 CRITICAL + 15 MAJOR skeptic findings fixed and re-verified.**

---

## 5. PERF LESSONS for the master + the plugin (FAILURES-LOG candidates)

The single biggest lesson, learned the hard way on the rejected `ten-minute-tide`:

> **Animating ANY large element (fill, clip-path, scale, or even a CSS opacity TRANSITION on a big
> disc) OVER the 823-building OSM layer re-rasterizes those paths every frame → 13–48% jank.**
> I tried clip-path circle (12%), growing SVG fill (16%), a scaling radial-gradient flood div (48%),
> and a CSS opacity transition on big discs (28%) — ALL failed @4× CPU.

What works (and why the illustrated maps are 0%):
- The illustrated maps have a LIGHT base (~5 shapes, not 823), so even a fill fade is cheap.
- Keep per-frame work tiny: animate small elements (a walker, a short arc), and **gate heavy panel
  writes** to fire only when an integer changes (minutes-bloom's per-minute gate took it 8%→1.6%).
- For "warm flood outward," use **staggered opacity snaps** on already-sized elements, not a scaling
  overlay over the map.
- A **viewBox/transform tween over a dense map re-rasterizes strokes** — avoid; if you must reframe,
  set viewBox ONCE behind a brief opacity veil, or (cleaner) don't put POIs in the clipped box at all
  (DOM via CTM).
- **GSAP Draggable writes `transform: matrix()` and clobbers an SVG element's `translate` attribute** —
  for SVG drag, use native pointer events (the rejected B3 lesson).

These belong in the plugin's FAILURES-LOG / perf grammar if the master maintains one.

---

## 6. HOW TO VERIFY (master's review checklist)

```bash
cd /Users/yehorfedorov/Downloads/award-re-plugin/library/components && python3 -m http.server 8820 &
# open each lab, scroll/interact:
#   /district-radiates/lab.html  → threads radiate, hover a row lights its thread
#   /minutes-bloom/lab.html       → scroll: the minute counts up + the arc draws, per place
#   /zoom-to-the-door/lab.html    → scroll: dives місто→район→ділянка through a shared focal point
#   /reach-ribbon/lab.html        → the warm zone draws; toggle 5/10 grows it; inside lights
cd /Users/yehorfedorov/Downloads/award-re-plugin
node scripts/library-index.mjs && node scripts/library-verify.mjs    # → ✓ verify GREEN
```
Playwright (for headless re-checks) resolves from `apps/smarts/node_modules/playwright`. My probe
scripts are in `/tmp/award-worker-3/` (probe-*.mjs, *-verify.mjs) if you want to re-run any measurement.

---

## 7. WHAT'S LEFT / SUGGESTIONS (for the master, not blocking)

- **Gallery:** add the 4 to the plugin's component gallery/stand if you keep one.
- **Production wiring:** when a real ЖК uses these, feed the real OSM bake (region/highway/district/
  parcel/POI coords + walk-minutes + the isochrone polygon) into each lab's hand-authored geometry slots
  (same pipeline as smarts location). The component code is data-agnostic; only the lab.html geometry +
  POI `data-*` need the real values.
- **Combos:** these compose well as a location SUITE on one page (district-radiates overview →
  minutes-bloom per-place → zoom-to-the-door scale → reach-ribbon coverage). A combo-lab could be worth it.
- **Constitution/grammar:** the perf lessons in §5 and the CTM-pin + slice-round-circles fidelity move
  are reusable — fold into the plugin grammar if desired.

— end of Session 3 handoff —
