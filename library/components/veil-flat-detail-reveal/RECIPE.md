---
id: veil-flat-detail-reveal
name: "Veil flat-detail reveal (a single-page fixed-overlay unit detail reached via a dark cover→hold→uncover veil; two-tone grey-blue spec rail + lighter plan canvas; clean plan fades-up + locator chips with this-unit/this-building filled dark; air-luxury rail, no text wall)"
level: 3
kind: component
status: official
entry:
  call: "VeilFlatDetailReveal.create(target, opts)  // target = .vfd-overlay (fixed hidden modal) > .vfd-veil + .vfd-page( .vfd-head + .vfd-crumbs + .vfd-rail(.vfd-type/.vfd-area/.vfd-price/.vfd-reserve/...) + .vfd-canvas( .vfd-plan + .vfd-locators(.vfd-floorchip+.vfd-compass+.vfd-sitechip) + .vfd-seed ) ). opts: { veilColor, coverDur, holdDur, uncoverDur, ease, drawPlan, fmtPrice, onReserve, onClose }."
  module: iife
  returns: "{ open(unit), close(), current, isOpen, destroy }"
meaning:
  what: "EVER visual-search LEVEL 3 — the calm single-unit detail, reached via a dark full-screen VEIL (close→hold→open) as a SINGLE-PAGE fixed-overlay MODAL (not a route). Two-tone: a grey-blue LEFT data rail (big type / area / spaced-thousands price / one dark Reserve pill / favourite+compare / Similar) beside a distinct LIGHTER plan canvas (the two-tone split IS the design). The plan = a clean inline SVG that fades-up (+ optional perimeter draw); locator chips (floor wireframe with THIS unit dark + compass + site map with THIS building dark) + a sculptural seed fade in last. AIR is the luxury — no text wall."
  when: "The apartment-detail view of a visual-search, on a single-page site — the calm 'here is the unit' screen after the user picks a number on the floorplate. Use it as a fixed overlay (open(unit) / close()) so it reads like real navigation without a router; the dark veil bridges the dark floor view to the light detail and hides the content swap. The fix for a cramped modal that dumps the plan image + a spec table + a room list. Pairs after numbered-floorplate-select (Level 2)."
  lands: "The screen goes dark for a beat — a clean cover, no spinner — and lifts to reveal a calm two-tone page: on the left, in generous air, the unit's name, size, price and a single dark Reserve; on the right, in its own frame of lighter light, the plan drawn cleanly with the rooms named. Small chips below show which apartment on the floor and which building on the site you're looking at, both filled dark. A single sculptural object sits on the seam. It reads as arriving somewhere considered, not opening a popup."
  not_when: "A site preloader (use preloader-band-collapse — that's once, on load). A simple opacity crossfade between sections (use brand-overlay-crossfade). When you must cram a spec table / feature list (this brick's whole point is air — put rich data in tabs elsewhere). A real multi-page route (this is the single-page overlay variant; for routes the same layout works but the veil + state-swap is the single-page deliverable). When there's no clean plan to show (the drawing is the hero)."
source:
  grammar: "EVER /flat/EV-5-5-282: a light flat page reached through a dark veil; left grey-blue rail (3E / 5 Housing 28 floor / 60.1 M² / 23 330 820 ₽ / Reserve / favourite+compare / Similar); right lighter canvas with a clean centered plan; bottom locator chips (floor wireframe + compass + site map, this unit/building dark) + a sculptural seed at the seam."
  recording: "apps/quadro/.award-re/teardowns/D_ever_visualsearch_video.md (§4; Brick C / Level 3 of the EVER visual-search harvest). Smarts retrofit: SMARTS_VS_UPGRADE_ever-model.md (FIX 2, modal)."
  registry_ref: ["ever-veil-flat-detail-reveal"]
stack: "vanilla + GSAP 3.12.5 (no ScrollTrigger)"
webgl: false
motion_props: [transform, opacity, stroke-dashoffset]
trigger: "open(unit) / close() — a fixed-overlay modal with a veil transition (no scroll, no router)"
timing_layer: [M-modal, P-page-transition]
owns_pin: false
owns_scroll: false
page_beat: [flat-detail, unit-page, visual-search]
combines_with: [numbered-floorplate-select, clean-floor-hover-select, bleeding-wordmark]
anti_combos: [spinner-in-veil, spec-table-in-rail, center-plan-on-page, dom-subtree-per-unit]
gated_by: [R_no_webgl, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a SINGLE fixed-overlay node (.vfd-overlay), hidden at rest; open(unit) swaps its data, close() hides it — never a DOM subtree per unit; no router"
  - "the veil (.vfd-veil) runs COVER (~400ms power2.inOut) -> HOLD (~300ms dark, content swaps unseen, NO spinner/percent/logo) -> UNCOVER (~450ms expo.out)"
  - "after uncover: rail + plan fade-up (opacity 0->1 + y 12->0 + scale 0.985->1); locator chips + seed stagger in last; optional plan perimeter stroke-dashoffset draw-in"
  - "TWO-TONE layout: a real grid (rail-w 1fr) with the canvas a LIGHTER bg than the rail ground (structural, not centered-on-page)"
  - "locator chips reuse the SAME path coords as the floor/site geometry; the active unit/building gets a solid dark fill by data-attr"
  - "air-luxury rail: big type + area + price + ONE dark Reserve + a couple of quiet icons + Similar — NO spec table / room list; sold -> 'Продано' + disabled Reserve"
  - "transform + opacity (+ stroke-dashoffset) only; NO mix-blend / NO WebGL; reduced-motion -> instant swap (no veil anim); Esc closes; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Click a unit button: the dark veil covers (no spinner), holds, uncovers to a TWO-TONE flat page (grey-blue rail + lighter plan canvas); the rail shows type/area/price + one Reserve; the plan SVG is centered; the floor + site locator chips have this-unit/this-building filled dark; a sold unit shows 'Продано' + disabled Reserve; 'back'/Esc replays the veil and hides it. Verify the veil cycle (no spinner), the two-tone split, the data fill, the active locator fills, the air rail (no text wall), + fps. Grab a frame ~400ms in for the veil."
note: |
  Brick C of the EVER visual-search harvest (Level 3) — the second half of complaint #2: smarts opens
  a cramped modal (raw plan + spec table + room list = text wall); EVER opens a calm two-tone flat page
  through a dark veil. THE TECHNIQUE: a SINGLE fixed-overlay node (data swapped per unit, no router —
  the single-page deliverable), a dark veil that COVERS -> HOLDS (swap unseen, NO spinner) -> UNCOVERS
  (the dark hold IS the premium feel + hides layout shift; a soft fade reads cheap), a structural
  TWO-TONE split (grey-blue rail + lighter plan canvas — 'the drawing in its own frame of light'), an
  AIR-luxury rail (big type + ONE Reserve, no spec table), and locator chips reusing the real
  floor/site path coords with this-unit/this-building filled dark. NEW territory (no true relative):
  preloader-band-collapse is a site preloader (once, on load); brand-overlay-crossfade is an opacity
  crossfade. Proven: veil cycle, two-tone (rail rgb174,184,189 vs canvas rgb215,221,226), data fill,
  floor active 294 + site active 2, sold -> Продано + disabled Reserve, close; 0.95% jank; zero console
  errors. The fix for smarts FIX 2 modal (drop .vs-modal__rooms; the clean plan + air rail carry it).
  Veil/Reserve #2c343a; canvas #d7dde2; rail #aeb8bd; walls #20272c. Serif = Playfair Display. COMPLETES
  the 3-brick EVER visual-search drill-down (clean-floor-hover-select -> numbered-floorplate-select ->
  veil-flat-detail-reveal) -> ready to retrofit smarts Агрономічне on user OK.
---

# veil-flat-detail-reveal — a dark veil opens onto a calm two-tone unit detail (kills the modal text-wall)

EVER visual-search Level 3: the single-unit detail as a single-page fixed-overlay modal reached via a
dark cover→hold→uncover veil; two-tone grey-blue spec rail + lighter plan canvas; clean plan fades-up +
locator chips with this-unit/this-building filled dark; air-luxury rail, no text wall.

## Markup + call
```html
<div class="vfd-overlay" id="flat">
  <div class="vfd-veil"></div>
  <div class="vfd-page">
    <div class="vfd-head"><button class="vfd-back">← back to the floor</button><span class="vfd-word">ever</span><span></span></div>
    <div class="vfd-crumbs"></div>
    <div class="vfd-rail"><div class="vfd-type"></div><div class="vfd-sub"></div><div class="vfd-area"></div><div class="vfd-price"></div><button class="vfd-reserve">Reserve</button>…</div>
    <div class="vfd-canvas"><div class="vfd-plan"></div><div class="vfd-locators"><div class="vfd-floorchip"></div><div class="vfd-compass">…</div><div class="vfd-sitechip"></div></div><div class="vfd-seed">…</div></div>
  </div>
</div>
```
```js
const flat = VeilFlatDetailReveal.create('#flat', { onReserve: u => lead(u) });
flat.open({ type:'3E', sub:'5 Housing / 28 floor', areaM2:60.1, price:23330820, status:'sale',
  crumbs:'Visual selection › Building 5 › Floor 28 › №282', floorNr:294, siteBlock:2,
  planSVG:'<svg>…clean plan, .vfd-plan__peri for the draw-in…</svg>', floorChipSVG:'…', siteChipSVG:'…' });
```
ONE overlay node; swap data per unit. Locator chips reuse the real floor/site path coords (active by data-attr).

## Proven (the lab)
A launcher (3 unit buttons stand in for the floorplate '+') + the ONE overlay node with a clean inline
apartment plan (rooms labelled), floor + site locator chips, a sculptural seed. REST: overlay hidden.
OPEN 282: visible, isOpen true; rail filled (3E / 60.1 M² / 23 330 820 ₽); plan SVG injected; floor
locator active 294 + site active block 2 (filled dark from data); TWO-TONE confirmed (rail
rgb(174,184,189) vs canvas rgb(215,221,226)); rail + plan revealed. SOLD 291: price 'Продано', Reserve
disabled. CLOSE: hidden. Zero console errors. Smoothness (4× CPU throttle, full open cycle): 105 frames,
0.95% long → PASS. Screenshots: settled = two-tone flat detail (air rail + clean plan + locator chips
with active fills + seed at the seam); mid-transition = the veil/two-tone page mid-reveal.
