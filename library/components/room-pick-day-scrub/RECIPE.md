---
id: room-pick-day-scrub
name: "Room-pick day scrub (a grid of rooms where you click one and it expands full-screen, and there you drag a time slider to live that room's OWN full day from morning to night; back closes it and you can pick another room, so each room gets its complete day by choice, one at a time)"
level: 3
kind: section
status: official
since: base-87
tags: [daynight, interior, grid, picker, slider, flip, real-estate, no-webgl, section]
entry:
  call: "RoomPickDayScrub.create(target, opts)  // target = the section (needs [data-rpd-grid] tiles, a [data-rpd-overlay] with [data-rpd-stage], a [data-rpd-slider], a [data-rpd-close]). Clicking a tile FLIPs it open into a full-screen daynight-engine instance; the slider drives set(t) over that room's day. opts: { rooms:[{day,night,name,area}], hours:[7,23], onState }. REQUIRES daynight-engine (GSAP optional for the FLIP) loaded first."
  module: iife
  returns: "{ root, open(i), close(), set(t), get(), openIndex(), destroy }. set(t) is PURE (0..1) = the open room's time of day. onState(openIdx, t, hour) feeds the clock/title."
meaning:
  what: "MODEL C of the day/night interior question: a grid of rooms; click one and it expands full-screen (FLIP), and THERE you scrub its OWN full day 07:00 -> 23:00 with a draggable time slider (or wheel). Back closes it; pick another room. Each room gets its complete day, by deliberate choice, one at a time. The desync that broke the auto-reel cannot happen: only one room scrubs at a time and the slider position IS its lighting (clock equals light, directly). A thin orchestrator over daynight-engine: the opened room is one instance, the slider drives set(t)."
  when: "The interior beat where you want the visitor in CONTROL: let them choose the room they care about and play its light from morning to night themselves. Best when each room rewards exploration (a kitchen at dawn vs at dinner). Pick this over the synchronized grid when the experience should be hands-on and self-directed rather than a single scroll narrative. 3-6 frame-matched room pairs."
  lands: "A calm grid of rooms invites a click. Pick one and it opens to full-screen; a sun-to-moon slider sits at the bottom, and as you drag it the room moves from morning light to evening lamps under your hand, the clock counting with you. Close it and choose another room to live its own day. It feels like a control you are given, not a movie you watch."
  not_when: "You want the WHOLE apartment to change together (use apartment-day-grid, Model A). You want an automatic scroll narrative (a pinned reel). A single hero room (use daynight-scroll-scrub). When rooms are not frame-matched. When you only have day renders."
source:
  grammar: "Reinvents the smarts/nahirna/towns interior sections (whose flaw is day/night resetting on room change) by making day/night a deliberate, per-room, hands-on control: pick a room, scrub its own day. Built on daynight-engine (the opened room is one DayNight, mode:'manual' reveal:'opacity' glow; the slider drives set(t)). A FLIP grows the clicked tile into the full-screen stage (transform-only). The slider track is tinted as a day arc (cool dawn -> amber -> ink) so time reads as colour."
  recording: "apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md (the day/night SECTION models; Model C). Built on daynight-engine. Seeds: apps/smarts/src/js/sections/interiors.js, apps/nahirna/components/sections/04-Floorplan.tsx, apps/towns/src/js/sections/plan.js."
  registry_ref: ["A1c-room-pick-day-scrub", "daynight-engine"]
stack: "vanilla (drives window.DayNight); GSAP optional for the FLIP open/close (instant fallback without it)"
webgl: false
motion_props: [opacity, transform]
trigger: "click a tile to FLIP-open; a draggable range slider (or wheel) scrubs the open room's day; not scroll-driven, no pin"
timing_layer: [I-interaction]
owns_pin: false
owns_scroll: false
page_beat: [interior, apartment, picker]
combines_with: [daynight-engine, mask-up-title, theme-tween]
anti_combos: [second-cover, mix-blend-over-scroll]
gated_by: [R_no_webgl, R_perf_limits]
variants: [apartment-day-grid]
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target,{rooms}) wires a grid of tiles; clicking a tile FLIP-opens a full-screen daynight-engine for that room; close() / Escape / the close button return to the grid; destroy() cleans up"
  - "the time slider drives the open room's set(t): the slider position IS the lighting (clock == light), so morning..night maps directly with no desync"
  - "the wheel over the open stage also scrubs time; the slider track is a day-arc gradient (cool -> amber -> ink)"
  - "only one room is open/driven at a time; the open room's glow layer is promoted (will-change+translateZ) so the full-viewport opacity ramp stays GPU-only; the night layer is NOT promoted (stacked-layer lesson)"
  - "opacity / transform only; NO canvas, NO WebGL, NO mix-blend; frame-matched pairs only"
  - "keyboard: tiles open on Enter/Space, Escape closes, focus rings on tiles/close/slider; prefers-reduced-motion -> instant open (no FLIP), slider still works; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. A grid of rooms shows; click one -> it FLIPs to full-screen with a bottom time slider. Drag the slider 0->1 and the room moves morning->night, the clock counting; the slider position equals the lighting (no desync). Close returns to the grid; pick another. NOTE: the slider scrub is the motion to profile (not scroll). Smoothness PASS fps>=50, jank<8% over a full slider sweep (the full-viewport glow must be GPU-promoted or it janks ~20%). Verified: 4 tiles, open mounts a DayNight, scrub 0.1->08:36/night0.1 and 0.95->22:12/night0.95 (clock==light), close returns to grid, 60fps/0% jank @4x after promoting the glow, 0 console errors."
  note: |
    SECTION A1c / MODEL C — pick a room, live its day. The thesis: hand the day/night control to the
    visitor per-room (a time slider) instead of an automatic scroll; only one room scrubs at a time so
    clock == light directly and desync is impossible. The SELECTED alternative to apartment-day-grid
    (Model A, synchronized grid) for the day/night-interior question (Model B, the fixed-hour walk, was
    dropped). Built thin on daynight-engine (opened room is one instance, slider drives set(t)); a FLIP
    grows the tile to full-screen. PERF lesson: the full-viewport warm-glow layer repaints every frame
    on the opacity ramp (~20% jank) -> promote it to its own compositor layer (will-change+translateZ);
    the night layer stays un-promoted. Real Higgsfield room pairs. Verified: open/scrub/close clean,
    clock==light, 60fps/0% jank, 0 errors.
---

# room-pick-day-scrub — Model C (pick a room, scrub its day)

A grid of rooms; click one and drag a time slider to live its day from morning to night. See the
frontmatter for the full contract. Built on `daynight-engine` (the opened room is one instance, the
slider drives set(t)). The selected hands-on alternative to `apartment-day-grid` (Model A).
