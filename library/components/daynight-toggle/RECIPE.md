---
id: daynight-toggle
name: "Day/Night button toggle (a pill 'День / Ніч' with a sliding accent thumb that snaps the scene day<->night)"
level: 2
kind: variation
status: variation
since: base-30
driver: toggle
reveal: opacity
entry:
  call: "DayNightToggle.create(target, opts)  // target = element/selector. It (1) builds the canon engine on target with mode:'manual' reveal:'opacity' glow:true, (2) injects a pill (two buttons + an absolute accent thumb), (3) wires clicks/keys -> dn.set(0|1) + thumb translateX(0|100%) + .is-on. opts: { dayMedia, nightMedia, labels:[day,night], accent, glow, start:0|1 }."
  module: iife
  returns: "{ root, set(t), get(), toggle(), day(), night(), pill, destroy }. set(t) snaps to day(<0.5) or night(>=0.5); get() returns the canon's t; pill is the injected control."
meaning:
  what: "The cleanest, dependency-light day<->night control — the TOWNS dialect. A rounded pill labelled 'День / Ніч' with a sliding accent THUMB; tapping a side snaps the WHOLE scene between a day still and a night still via an opacity crossfade. The variation owns only the chrome (pill + thumb + .is-on + keyboard); the crossfade, the glow, and the single source-of-truth t live in the canon daynight-engine (driven here with mode:'manual', set(0|1))."
  when: "An IN-PAGE content SECTION (not a hero) where the user flips the same frame between noon and night with one deliberate tap, the way Nahirna and Quadro carry day/night inside a room/floor-plan/exterior block. The default day/night affordance for a plan-scene panel or an interior gallery card. Pairs with a room selector that swaps the day/night pair underneath while the toggle keeps its state. NOT for a hero: a hero should turn day->night on scroll (use daynight-scroll-scrub, the Nahirna hero dialect) so the move is owned by the page rhythm, not by a control the visitor must find and click."
  lands: "Inside a section, a small premium switch sits under the frame: the accent thumb glides under the labels (0.4s), the inactive label dims, the active sits dark on the accent, and the room goes from daylight to lit-windows-at-dusk in one tap. It reads as an intentional product control on a panel you are already studying (a plan, a room), not as a hero gimmick."
  not_when: "A HERO that should turn day->night as you scroll in (use daynight-scroll-scrub, the Nahirna dialect — that is the hero answer; this toggle is for in-page sections). When the reveal should follow the cursor along a seam (daynight-cursor-seam, the Smarts dialect) or breathe on a loop (daynight-engine mode:'autoloop'). When you need ONE control to flip MANY scenes at once (that is V16 — this brick is a single scene). When the two frames are not geometry-identical (the opacity crossfade jumps — fall back to a static frame per the engine frame-match law)."
source:
  grammar: "Harvested 1:1 from Towns. The pill markup, the data-mode flip, the thumb translateX(0|100%), the 0.4s transform slide and the calc(50% - pad) thumb width all come straight from the shipped plan section. The opacity crossfade (0.7s in Towns scene CSS) is delegated to the canon engine's opacity reveal."
  recording: "seed: apps/towns/src/js/sections/plan.js (setMode, L117-126, L161-164) + apps/towns/src/styles/app.css (.plan__daynight / .plan__dn-thumb, L261-266)"
  registry_ref: ["daynight-engine (canon)", "TOWNS toggle/opacity"]
stack: "vanilla IIFE; drives window.DayNight (the canon); GSAP optional (the canon uses it if present, the thumb is pure CSS transform)"
webgl: false
motion_props: [opacity, transform]
trigger: "user interaction (button click / Enter / Space / arrow keys) — NOT scroll-driven"
owns_pin: false
owns_scroll: false
page_beat: [interiors, gallery]
combines_with: [daynight-engine, room-selector, plan-scene-panel]
anti_combos: [daynight-cursor-seam, daynight-scrub]
gated_by: [R_no_webgl, R_perf_limits]
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target) builds the canon on target (mode:'manual', reveal:'opacity', glow:true) and injects the pill; destroy() removes the pill AND the canon stage"
  - "clicking 'Ніч' sets .is-on on the night button, slides the thumb translateX(100%), and dn.set(1); clicking 'День' reverses to translateX(0) + dn.set(0)"
  - "keyboard: the buttons are real <button>s (Enter/Space activate natively); ArrowRight/Down -> night, ArrowLeft/Up -> day; :focus-visible ring on the accent"
  - "opacity + transform only on the chrome; the crossfade is the canon's opacity reveal; NO mix-blend / NO backdrop / NO WebGL"
  - "prefers-reduced-motion -> the thumb transition is removed (instant snap); the canon statics the scene"
  - "asset-substitution gate: OUR exterior day/night pair (renders/dn-ext-day.webp + dn-ext-night.webp), frame-matched"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The house loads in daylight, the pill bottom-centre shows 'День' lit. After ~1.1s the demo taps 'Ніч' (thumb slides right, windows light up) and after ~4.2s returns to day. Tapping the pill cancels the demo and is fully interactive. Cover/scene present every frame; the crossfade is opacity-only (GPU), so a direct rAF probe over a day<->night flip = fps>=50, jank<8%."
note: |
  Variation V1 of the day/night harvest — the SIMPLEST driver, the Towns dialect.
  It adds NO new motion engine: the canon daynight-engine does the crossfade (mode:'manual',
  reveal:'opacity', glow:true) and this brick supplies only the pill chrome and the wiring
  (click/keys -> dn.set(0|1) + thumb translateX + .is-on). The canon's built-in 'toggle'
  driver is a no-op (armToggle binds nothing) on purpose — the UI is the variation's job, so
  we use mode:'manual' and snap to 0/1 ourselves. Thumb = calc(50% - 0.28rem), 0.4s transform
  slide, accent fill — copied from app.css L261-266. Reduced-motion removes the thumb
  transition. Single scene only (multi-scene sync is V16).
---

# daynight-toggle — a 'День / Ніч' pill that snaps the scene day<->night (Towns dialect)

The cleanest day/night: a rounded pill with two buttons and a sliding accent THUMB. Tap a
side and the same frame snaps between a day still and a night still. This is the Towns
dialect, harvested 1:1 — the variation owns only the chrome; the crossfade is the canon.

## The driver
`toggle` — but the canon's built-in toggle driver binds nothing (it expects the UI to live
in the variation). So this brick builds the canon with `mode:'manual'` and the pill calls
`dn.set(0)` (day) / `dn.set(1)` (night). `set(t)` on the canon is PURE; we only ever ask for
0 or 1, and the opacity crossfade timing lives inside the engine.

## What it adds over the canon
- the **pill UI**: two `<button data-mode>` + an absolute `.dnt__thumb` accent pill;
- the **slide**: `thumb.style.transform = translateX(0|100%)`, `transition: transform 0.4s`;
- the **state**: `.is-on` flips between the two buttons + `aria-pressed`;
- **keyboard**: native Enter/Space on the buttons, plus Arrow keys to flip; `:focus-visible` ring;
- **reduced-motion**: the thumb transition is removed (instant snap).

## Markup + call
```js
var dn = DayNightToggle.create('#frame', {
  dayMedia:   'renders/dn-ext-day.webp',
  nightMedia: 'renders/dn-ext-night.webp',
  labels: ['День', 'Ніч'],
  accent: '#c8a86b',
  glow: true,     // warm window-glow rises with t (canon layer)
  start: 0        // 0 = day on load
});
// dn.night();  dn.day();  dn.toggle();  dn.set(0|1);  dn.get();  dn.destroy();
```
Injected control:
```html
<div class="dnt__pill" role="group" aria-label="День або ніч">
  <button class="dnt__btn is-on" data-mode="day">День</button>
  <button class="dnt__btn" data-mode="night">Ніч</button>
  <span class="dnt__thumb" aria-hidden="true"></span>
</div>
```

## The seed it harvests
`apps/towns/src/js/sections/plan.js` `setMode` (L117-126, L161-164) and
`apps/towns/src/styles/app.css` `.plan__daynight` / `.plan__dn-thumb` (L261-266):
the pill is an inline-flex 999px track, padding `0.28rem`; the thumb is the absolute accent
pill, `width: calc(50% - 0.28rem)`, `transition: transform 0.4s var(--ease)`, sliding
`translateX(0|100%)`. Reproduced faithfully, retargeted from the Towns CSS vars to the
brick's own `--dnt-*` tokens.

## Engine laws (inherited)
opacity / transform / gradient only. NO WebGL, NO mix-blend, NO backdrop-filter. Frame-match
rule: only crossfade geometry-identical day/night pairs. Requires the canon
(`../daynight-engine/component.js`) loaded BEFORE this brick. Sets `window.__LAB_OK__`.
