# Location Patterns — composed sections + the MEDIUM-ROOT taxonomy

> Derived from the 10 GREEN location variants in `combos/location--*`. A **pattern**
> is a named atom-composition that either RECURS across variants or GENERALIZES into a
> reusable shape other sections can adopt. Each pattern fixes the one thing juniors get
> wrong: the **atom order**, the **pin-owner rule**, and the **POI-owner rule** (which
> layer reads the real dataset and projects the points — never an invented coord).
>
> The location lane has ONE governing law on top of the hero pin-owner law: **every new
> location variant must pick a DISTINCT MEDIUM-ROOT, not a reskin of the map engine.**
> The smarts etalon (`surveyed-route-map`) is the realism baseline; the other nine each
> answer "can I live my life from here?" through a *different sense* (typography, scale,
> area, raster photo, video, pen-sketch, photo-rail, arched-photo, illustrated-line).
> Picking a root that is already taken = a re-theme, which the acceptance gates reject.
>
> Source variants (id → medium → atoms, pin-owner):
> - `location--surveyed-route-map` — SURVEYED-VECTOR — locmap-engine(medium, owns_pin=FALSE) + theme-tween; pin: **harness**
> - `location--minutes-as-hero` — TYPOGRAPHIC-MINUTE — minutes-bloom(engine+pin) + numeral-odometer-roll(medium, pinless) + scroll-indicator; pin: **minutes-bloom**
> - `location--dive-to-the-gate` — SCALE-ZOOM — zoom-to-the-door(owns pin) + district-radiates(Act-2 grammar, pinless); pin: **zoom-to-the-door**
> - `location--ten-minute-reach` — ISOCHRONE-AREA — reach-ribbon(medium) + numeral-frame-expand-hero(grammar only); pin: **harness**
> - `location--concierge-radiate` — ILLUSTRATED-MAP — district-radiates(medium) + pin-story-text(owns pin) + numeral-frame-expand-hero(numeral treatment only); pin: **pin-story-text**
> - `location--raster-tile-bloom` — RASTER-PHOTOGRAPHIC — raster-tile-reveal(medium) + pin-story-text(owns pin) + coords-corner-frame; pin: **pin-story-text**
> - `location--day-in-the-area` — VIDEO-NO-MAP — scroll-scrub-video(medium+pin) + pin-story-text(pinless); pin: **scroll-scrub-video**
> - `location--architects-sketch` — PEN-SKETCH — line-art-location-map(medium, pinless) + coords-corner-frame; pin: **harness**
> - `location--nearby-in-photographs` — PHOTO-RAIL — map-dim-carousel-announce(owns pin) + poi-caption-carousel(pinless); pin: **map-dim-carousel-announce**
> - `location--arched-window-place` — ARCHED-PHOTO — oval-mask-reveal(medium) + numeral-odometer-roll(stat band); pin: **harness**

---

## A. The MEDIUM-ROOT taxonomy of the location lane

Ten roots. Each is a *different way of seeing the surroundings*. Future location work
**must declare its root first** and confirm no live variant already owns it. The roots
fall into three families by what they trust to carry the proof:

**Cartographic family (a real map is on screen)**
1. **SURVEYED-VECTOR** — the smarts etalon. Hand-built SVG of the *real* OSM street graph:
   road hierarchy by class (dual casing+stroke), 823 building footprints with lit windows,
   true-scale walking ring, Dijkstra routes drawn along actual streets. Register: "we
   surveyed it, here is the proof." Engine: `locmap-engine`. → `surveyed-route-map`.
2. **ISOCHRONE-AREA** — proof is COVERAGE not distance: a soft walking-reach SHAPE floods
   over an illustrated map; what's inside lights and is named, what's just outside stays
   faint with a `+N хв` note; a 5/10-min toggle grows the shape. Engine: `reach-ribbon`.
   → `ten-minute-reach`.
3. **RASTER-PHOTOGRAPHIC** — a pre-baked STATIC mosaic of real satellite tiles (plain
   `<img>`, decode-guarded, NO canvas / NO live tile server); POI dots drop onto real
   projected positions inside a surveyed-plate frame. Engine: `raster-tile-reveal`.
   → `raster-tile-bloom`.
4. **ILLUSTRATED-MAP** — a DRAWN cream-paper district whose language is LINES: leader-threads
   radiate from the door to each named place carrying its walk-minute. Editorial, premium,
   not literal. Engine: `district-radiates`. → `concierge-radiate`.
5. **PEN-SKETCH** — an architect's monochrome ~1px hand-drawing on a drafting field, NO
   fills/colour/tiles; streets DRAW via stroke-dashoffset, a survey crosshair marks the site,
   real Dijkstra routes draw on a drafting-table plate. Engine: `line-art-location-map`.
   → `architects-sketch`.

**Reductive family (the map is demoted or replaced)**
6. **SCALE-ZOOM** — there is no static map; the medium is a CHANGE OF SCALE. One shared
   focal point (the site) is match-cut-zoomed through three acts (city → district → plot),
   palette warming with the dive. Engine: `zoom-to-the-door`. → `dive-to-the-gate`.
7. **TYPOGRAPHIC-MINUTE** — the answer is a TIME, so a wall-tall serif minute number owns the
   screen and ROLLS per place; the map is a faded backdrop drawing one thin arc. Big-type
   editorial statement. Engine: `minutes-bloom` + `numeral-odometer-roll`. → `minutes-as-hero`.
8. **VIDEO-NO-MAP** — the ONE map-less map. A pinned scroll-scrub paints a real area clip
   (river/neighbourhood) frame-by-frame; location is sold as LIVED ATMOSPHERE, the minutes
   are the proof. Engine: `scroll-scrub-video`. → `day-in-the-area`.

**Photographic-of-place family (real photos, map as backdrop or absent)**
9. **PHOTO-RAIL** — the map DIMS (opacity-only) to a stage; a captioned rail of real photos
   of the actual surrounding places advances one card at a time, each POI caption travelling
   under its card. Engine: `map-dim-carousel-announce` + `poi-caption-carousel`.
   → `nearby-in-photographs`.
10. **ARCHED-PHOTO** — a ceremonial single-photo aperture: a classical arch opens onto ONE
    surroundings photograph, then hands to a counted stat band rolling the real minutes.
    Heritage/villa register, no map at all. Engine: `oval-mask-reveal` + `numeral-odometer-roll`.
    → `arched-window-place`.

**Root-selection rule.** Before building any location section, name its root from the ten
above. If the chosen root is already live, you are reskinning — pick another sense. The
acceptance gate of every variant explicitly asserts "MEDIUM is unmistakable in one
screenshot AND distinct from the other nine roots"; that distinctness is the family's
whole value.

---

## B. The patterns

### 1. `surveyed-route-tour` (the etalon)
**What:** A baked real-OSM vector district pins; scroll STEPS through the 6 real POIs one
at a time, and at each step the dataset's own Dijkstra route DRAWS along the actual streets
while a walking dot travels it and a live minute counter grows to the real walk-time.
`theme-tween` lerps the chrome toward dusk on the same scroll.

**Canonical atom order:** `locmap-engine` (builds the baked OSM map, `owns_pin=FALSE`) →
[harness pins] → per-step `map.select(id)` route-draw + walker + live counter →
`theme-tween` (dusk recolour, same progress).

**Pin-owner rule:** the **HARNESS** owns the single pinned ScrollTrigger; `locmap-engine`
is deliberately `owns_pin=FALSE` so it adds no second pin (verified pinned-trigger count
=== 1). Layer parallax is zeroed here as a perf budget — the extra scrub triggers were the
dominant per-frame cost under throttle.

**POI-owner rule:** `locmap-engine` is the single POI authority — it reads `osm.js` and
draws the dataset's own `route[]`. The 6 POIs, names, minutes and routes are verbatim from
the dataset; nothing invented. Coords shown = 49.18° N · 28.33° E.

**Anti-combos:** Do not add a second pinned scrub. No tiles/canvas/WebGL/mix-blend/
backdrop-filter over the vector field (logged scroll-lag). Day≠different framing.

**Recurs in:** `surveyed-route-map`.
**When to use:** The most authentic-geography answer — real street graph, real walk drawn
and timed. The realism baseline the other nine differentiate against.

---

### 2. `pin-story-stepper` (the family's spine)
**What:** A section scroll-LOCKs and the WHERE-story arrives as sparse text blocks, ONE
legible at a time, sequenced as a pure function of the active step (never an imperative
prev→next crossfade). This is the recurring text-sequencing spine under most location
mediums; the medium atom paints behind it.

**Canonical atom order:** `pin-story-text` (owns pin, scroll-locks, sequences the blocks) →
[medium atom paints behind, pin-less] → optional chrome (`coords-corner-frame`).

**Pin-owner rule:** `pin-story-text` OWNS the one pin in the variants where it is present
(`concierge-radiate`, `raster-tile-bloom`); the medium atom is pin-less and consumes the
same progress. Exactly ONE pinned trigger.

**POI-owner rule:** the MEDIUM atom behind it owns POI projection (district-radiates draws
the threads, raster-tile-reveal drops the dots); `pin-story-text` owns only the prose. Keep
the projection authority and the text authority separate so neither invents a place.

**Legibility law (logged):** each transition KILLS + hard-zeroes every non-active block
(`gsap.killTweensOf`, no orphan can climb back to 1) and tweens ONLY the active block 0→1.
Verified exactly ONE block legible at 0/33/66/100 AND under fast scroll-reversal (the race
that previously stranded 5 blocks at opacity 1).

**Anti-combos:** Never drive legibility by an imperative crossfade (the stranding bug). Do
not let two medium atoms both claim the pin.

**Recurs in:** `concierge-radiate`, `raster-tile-bloom`; the same discipline appears under
`day-in-the-area` and `surveyed-route-map` (pin owned elsewhere, story rides along).
**When to use:** Any location medium that needs a calm, sequenced where-narrative riding on
top of a painted map/photo/video.

---

### 3. `scale-dive-matchcut`
**What:** ONE shared focal point (the real site) is zoomed through three acts that match-cut
on that point — city → district → plot — the outgoing act scaling up/out while the incoming
arrives from small on the same pivot, so three scales read as one camera fall to the gate.
Palette warms cool→warm with the dive.

**Canonical atom order:** `zoom-to-the-door` (owns pin + the three-act match-cut + palette
warm) → `district-radiates` as ACT-2 GRAMMAR ONLY (pin-less; bows minute-threads from the
home during the district act).

**Pin-owner rule:** `zoom-to-the-door` OWNS the single pin and the whole dive timeline; the
borrowed `district-radiates` runs pin-less inside act 2 only. One pin.

**POI-owner rule:** the focal point and the act-2 POI threads are projected from the real
dataset (site coord + 6 places); the final frame is the buyer's real parcel on вул. Перемоги.

**Anti-combos:** Do not introduce a second map medium between acts — the dive IS the medium;
each act is a re-scale of the SAME point, not a new map. No static full map competing with the
zoom.

**Recurs in:** `dive-to-the-gate`.
**When to use:** When the proof is nesting ("this plot sits inside the city, the city is 12 min
away") told as one continuous fall, each scale earning one sentence.

---

### 4. `area-flood-coverage`
**What:** A soft warm walking-reach isochrone (a SHAPE, not a line/number/tile/route/photo)
floods over a cream illustrated map; places INSIDE light warm and are named, those just
OUTSIDE stay faint with a `+N хв` note; a 5/10-min toggle GROWS the shape and a live count
says how much life fits inside.

**Canonical atom order:** [harness pins] → `reach-ribbon` (owns the AREA medium: paints the
isochrone, lights inside places, toggles the shape) → `numeral-frame-expand-hero` borrowed as
GRAMMAR ONLY (its resolving-numeral move for the live "how much fits" count).

**Pin-owner rule:** the **HARNESS** owns the one pin; `reach-ribbon` is the pin-less medium
consuming progress; the borrowed numeral atom contributes only its numeral treatment (no second
pin, no hero takeover). One pin.

**POI-owner rule:** `reach-ribbon` reads the dataset and decides inside/outside per real
walk-minute — the inside/outside classification must come from the real minutes, never a
hand-placed guess (here 4 of 6 places are ≤10 хв, which is what makes the boast honest).

**Anti-combos:** Do not draw distance LINES or routes (that's the vector/sketch root). Do not
let the borrowed numeral atom expand to hero scale — it is a counter, not the subject.

**Recurs in:** `ten-minute-reach`.
**When to use:** When the honest argument is AREA — how much daily life is reachable on foot —
and the real minutes are kind enough to make coverage a felt boast.

---

### 5. `radiating-thread-map`
**What:** A hand-illustrated cream-paper district whose LANGUAGE IS LINES: thin leader-threads
splay from YOUR DOOR to the 6 real named places, each thread carrying its real walk-minute.
On scroll the roads draw, the door blooms, the threads splay one by one as the minutes rise.

**Canonical atom order:** `pin-story-text` (owns pin; one sparse line per cluster) →
`district-radiates` (THE MEDIUM: draws the cream map + roads + door + radiating threads,
pin-less) → `numeral-frame-expand-hero` (its `set(p)` NUMERAL treatment only — the big
editorial running total, no pin, no aperture).

**Pin-owner rule:** `pin-story-text` owns the one pin (this is `pin-story-stepper` with the
illustrated-line medium slotted behind it). `district-radiates` and the numeral both pin-less.

**POI-owner rule:** `district-radiates` is the POI authority — it draws each thread from the
real door coord to the real place with the real minute; `numeral-frame-expand-hero` only counts.

**Anti-combos:** Do not also draw Dijkstra street-routes (that's the surveyed/sketch read — the
illustrated medium is the airborne thread, not the walked street). One numeral, one story line.

**Recurs in:** `concierge-radiate`.
**When to use:** When you want a DRAWN, editorial, premium proximity register (radiating thread
= the section's mark) rather than a literal survey or tile map.

---

### 6. `raster-plate-bloom`
**What:** A pre-baked STATIC mosaic of real satellite tiles force-decodes up front, then the
decoded tiles fade+scale in along a diagonal stagger; the 6 real POI dots DROP onto their real
projected positions and the home lights; a `coords-corner-frame` draughts a surveyed plate
(tick-corners, coords, 0…500 м scale bar, north arrow) around it.

**Canonical atom order:** `pin-story-text` (OWNS the pin; four where-words one block at a time)
→ `raster-tile-reveal` (THE MEDIUM: decode-guarded tile mosaic + projected POI drop, pin-less)
→ `coords-corner-frame` (the surveyed-plate chrome).

**Pin-owner rule:** `pin-story-text` owns the one pin; `raster-tile-reveal` pin-less. One pin.

**POI-owner rule:** `raster-tile-reveal` projects the 6 real POIs + the real site onto the real
tile coordinates — projection must match the tiles' real geography, not a decorative scatter.

**Decode law (logged):** every tile force-`decode()`s up front (guard against black flicker);
plain `<img>`, NO canvas, NO live tile server — a STATIC baked mosaic only.

**Anti-combos:** No live/Mapbox/Leaflet tile server, no canvas. Do not draw vector roads over
the photo (mixing roots). Pair the surveyed-plate chrome only with the photographic root, not
the illustrated one (clash of registers).

**Recurs in:** `raster-tile-bloom`.
**When to use:** When the real aerial of the real coordinates sells the surroundings better than
a stylised diagram and the developer can supply real satellite tiles for production.

---

### 7. `area-clip-scrub` (VIDEO-class, map-less)
**What:** The ONE map-less location section. A pinned scroll-scrub paints a 160-frame real area
clip (river/neighbourhood) to a canvas frame-by-frame; the where-story rides the SAME pin as
five sparse lines. Location is sold as LIVED ATMOSPHERE; the minutes are the proof.

**Canonical atom order:** `scroll-scrub-video` (OWNS the pin + scrub; paints frames) →
`pin-story-text` (pin-less; five where-blocks one at a time on the same progress).

**Pin-owner rule:** `scroll-scrub-video` OWNS the single pin and the scrub; `pin-story-text`
consumes the same progress pin-less. One pin.

**POI-owner rule:** there is NO projected map — POI live only as spoken minutes in the story
text. The frames are real on-site footage; the minutes remain dataset-true even with no plan.

**Frame law (logged):** `createImageBitmap` decode-once + `drawImage` to canvas — NEVER
`video.currentTime` scrubbing (the Apple/AirPods lag-free technique; the 13.8%→0.2% jank lesson).

**Anti-combos:** No map, no SVG plan, no tile anywhere (that's the whole point of the root). Do
not scrub a `<video>` element's currentTime. Do not add a second pinned surface.

**Recurs in:** `day-in-the-area`.
**When to use:** When the feeling of the place outweighs any plan — real footage of the area
montages the rhythm of a day better than geography.

---

### 8. `drafting-sheet-draw`
**What:** The location beat as an architect's hand-sketch: monochrome ~1px cream strokes on a
brown drafting field, NO fills/colour/tiles. The real OSM streets DRAW in via stroke-dashoffset,
a ringed survey crosshair marks the real site, the 6 real POIs ladder up on hairline leader-lines
with real minutes, and as it pins each POI's real Dijkstra route draws along the actual streets.

**Canonical atom order:** [harness pins] → `line-art-location-map` (`owns_pin=FALSE`; reads the
static `[data-draw]` OSM paths, draws strokes + crosshair + leader-lines + per-step Dijkstra
route) → `coords-corner-frame` (`owns_pin=FALSE`; the drafting plate: coords, scale bar, north
arrow, sheet labels).

**Pin-owner rule:** the **HARNESS** owns the one pin; both atoms are deliberately `owns_pin=FALSE`.
One pin.

**POI-owner rule:** `line-art-location-map` is the POI + route authority, drawing the dataset's
real streets and Dijkstra paths — same asset-truth as the surveyed etalon, rendered as pen.

**Anti-combos:** No fills, no colour photography, no Google/Mapbox/tiles — the austere monochrome
IS the medium. Do not add the dusk-recolour `theme-tween` (it's a colour engine; this root is
ink-only).

**Recurs in:** `architects-sketch`.
**When to use:** When the section should feel SURVEYED and AUTHORED — a studio's site plan,
quiet and austere — distinct from raster/illustrated/isochrone/photo.

---

### 9. `map-dim-photo-rail`
**What:** The map the visitor was reading DIMS (opacity 1→0.28, OPACITY-ONLY so the heavy SVG
never re-rasters) to a dark stage; an eyebrow + giant serif statement + uppercase sub rise as a
left masthead; a bottom rail of captioned PHOTOGRAPHS of the actual places advances by a single
round arrow, each real-POI caption travelling UNDER its card. Photography is the subject; the map
is only a backdrop.

**Canonical atom order:** `map-dim-carousel-announce` (OWNS the pin; dims the map, raises the
masthead) → `poi-caption-carousel` (pin-less rail in the lower third; advances real-POI photo
cards + travelling captions).

**Pin-owner rule:** `map-dim-carousel-announce` owns the one pin; the caption rail is pin-less.
One pin.

**POI-owner rule:** `poi-caption-carousel` is the POI authority — each card is a real surrounding
place with its real caption/minute. The dimmed map is decorative; the rail carries truth.

**Perf law:** the map fade is OPACITY-ONLY — never re-layout or re-raster the heavy SVG when
dimming it.

**Anti-combos:** Do not animate the map geometry while it's a backdrop (re-raster cost). This is a
photo rail, not a map engine — do not let the map re-take the foreground.

**Recurs in:** `nearby-in-photographs`.
**When to use:** After a map-first section, when the surroundings should become images the buyer
recognises — felt through the PLACES, not measured on a plan.

---

### 10. `arched-aperture-statband`
**What:** A ceremonial single-photo aperture: a classical centred arch opens from a thin vertical
slit into a full arched window onto ONE surroundings photograph, the image easing back to rest
inside it. The beat hands to a counted stat band: the minutes to the 6 real places roll up one at
a time in a one-row odometer, a place name rolling in step beneath, a gilt rule filling.

**Canonical atom order:** [harness pins/sequences] → `oval-mask-reveal` (THE MEDIUM: the arch
opens slit→full onto the photo) → `numeral-odometer-roll` (the counted stat band: real minutes +
rolling place name).

**Pin-owner rule:** the **HARNESS** owns the one pin / enter-sequence; the two atoms are load-in
mechanics consuming it. One pin (or a one-shot enter sequence — no second pinned scrub).

**POI-owner rule:** `numeral-odometer-roll` owns the POI readout — it rolls the real minutes to
the 6 real places. ONE photo, no map tiles, no road vectors; truth lives in the stat band.

**Anti-combos:** No map at all (the root is arched-photo). Do not pair a second reveal aperture
(one classical opening). No interactive map — the whole point is "expensive without another map".

**Recurs in:** `arched-window-place`.
**When to use:** Heritage/villa/premium register — standing at a window, told plainly and proudly
how close everything is. When a classical aperture + counted band reads more expensive than a map.

---

### 11. `typographic-minute-roll`
**What:** The location answer as TYPOGRAPHY: one wall-tall serif minute number owns the screen and
ROLLS per pinned step (9 → 18 → 15 → 10 → 10 → 9 хвилин) as you scroll the six real places. The
map is demoted to a faded aerial drawing ONE thin terracotta arc to the active place. Time is the
shout; the map is the whisper.

**Canonical atom order:** `minutes-bloom` (ENGINE + the one pin: scroll-locks, steps the 6 POIs,
draws the single arc + name on the faded backdrop) → `numeral-odometer-roll` (THE MEDIUM: the
wall-tall numeral riding the engine's scrub via pin-less `set(p)`) → `scroll-indicator` (ambient
descending tick).

**Pin-owner rule:** `minutes-bloom` OWNS the single pin and the step engine; `numeral-odometer-roll`
is pin-less (`set(p)` on the same scrub) — no second pin. One pin.

**POI-owner rule:** `minutes-bloom` reads the dataset (real site coord, six real POIs, verbatim
walk minutes) and owns the arc + name; the numeral only displays the active minute.

**Anti-combos:** Do not promote the map back to a full survey (it must stay a whisper). Do not give
the giant numeral its own pin/trigger — it rides the engine's scrub.

**Recurs in:** `minutes-as-hero`.
**When to use:** When the honest answer is a TIME and the studio wants a big-type editorial
statement rather than another OSM plan.

---

## C. Patterns / layers that GENERALIZE beyond location

These recur as a LAYER across location variants and lift cleanly into other sections.
Treat them as section-agnostic building blocks:

- **`coords-corner-frame` (surveyed-plate chrome layer).** Appears in `raster-tile-bloom` and
  `architects-sketch` as four draughted tick-corners + coords + scale bar + north arrow. A pure
  overlay independent of the medium beneath — drop it on any section that wants a "surveyed
  instrument" register (architecture site plans, unit floorplates). Rule: it draws/assembles as
  chrome, stays static, and is pin-less. Pair it with the photographic/sketch register, not the
  illustrated one (register clash).

- **`numeral-odometer-roll` (rolling-figure layer).** Used in `minutes-as-hero` (the wall-tall
  hero numeral) and `arched-window-place` (the stat-band counter). Generalizes to ANY section
  with a figure that should *roll* rather than fade — price ladders, unit counts, storeys, year.
  Rule: it is pin-less, `set(p)` on a host scrub — never give it its own pin; one odometer per
  beat.

- **`pin-story-text` (sequenced where/what narrative layer).** The spine of `concierge-radiate`,
  `raster-tile-bloom`, `day-in-the-area`. Generalizes to ANY pinned section that needs a calm,
  one-block-at-a-time prose sequence over a painted surface (story steppers, manifesto beats).
  Carries the logged legibility law: hard-zero + kill non-active blocks, tween only the active
  one — exactly one legible, even under fast scroll-reversal.

- **`numeral-frame-expand-hero` borrowed as numeral GRAMMAR.** In `ten-minute-reach` and
  `concierge-radiate` only its `set(p)` resolving-numeral move is borrowed (NOT the hero aperture).
  The lesson generalizes: a hero atom can be cited for ONE sub-move (its numeral treatment)
  without dragging in its pin or full medium — keep the borrow scoped and pin-less.

- **`theme-tween` (field-recolour layer).** Same as in the hero family: a section-field recolour
  off scroll progress (here, chrome warming to dusk in `surveyed-route-map`). Reusable in any
  section that should shift mood with scroll. Do NOT add it to ink-only roots (pen-sketch).

- **The real-OSM-data + POI-join convention (the asset-truth law).** This is the lane's most
  important reusable discipline, not a visual layer:
  - **Asset-truth source:** `library/_assets/location/osm-agronomichne.js` — the CANONICAL real
    dataset (projected OSM: `site`, `roads`, `buildings`, `green`, `water`; 136 roads, 823
    footprints, true-scale 10-min ring). Every location combo symlinks its local `osm.js` →
    this file (`import { OSM } from './osm.js'`). NEVER hand-type streets/footprints.
  - **POI-join convention:** the 6 POIs, their names, walk-minutes and Dijkstra `route[]` are the
    REAL ones, verbatim — Школа·садок 9хв, Нова Пошта 10хв, Супермаркет «Траш!» 9хв, Аптека
    «Подорожник» 10хв, «Грош Експрес» 15хв, Маркет «Аврора» 18хв. No invented streets / POIs /
    times. Each variant designates ONE atom as the POI authority (the medium engine), and the
    text layer never invents a place the projection doesn't carry.
  - **Coordinate law:** coords shown are 49.18° N · 28.33° E (Агрономічне near Вінниця) — never
    Kharkiv/Lviv. Any new location work for a different ЖК swaps the dataset wholesale (new
    `_assets/location/osm-<site>.js`) and re-joins real POIs; it does not edit points by hand.

## D. Cross-cutting pin-owner + medium-distinctness law

At most ONE pinned-scrub mechanic per location section (same as hero). The pin is owned by
exactly one of: the **harness** (`surveyed-route-map`, `ten-minute-reach`, `architects-sketch`,
`arched-window-place`), the **medium engine** (`minutes-bloom`, `zoom-to-the-door`,
`scroll-scrub-video`, `map-dim-carousel-announce`), or **`pin-story-text`** (`concierge-radiate`,
`raster-tile-bloom`). Every other atom must be `owns_pin=FALSE` and consume that same progress.
Two independent pins = desync + stolen scroll budget (logged).

On top of the pin law sits the **medium-distinctness law**: a new location variant must pick a
NEW root from the taxonomy in §A. The acceptance gate of each variant asserts the medium is
"unmistakable in one screenshot AND not the illustrated / surveyed-vector / typographic / scale /
isochrone / raster / video / sketch / photo-rail / arched root already taken." Reskinning a live
root fails the gate — the family's value is ten *different senses* of the same proof.
