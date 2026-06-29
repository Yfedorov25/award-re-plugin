---
id: daynight-portal-reveal
name: "Portal reveal (the evening blooms outward in a growing circle from the point the visitor taps — a lit window, a hotspot — using the canon's clip-path circle reveal)"
level: 2
kind: variation
status: variation
since: base-79
variation_of: daynight-engine
driver: manual
reveal: portal
tags: [daynight, variation, portal, click, tap, clip-path, circle, real-estate, no-webgl, hotspot]
entry:
  call: "DayNightPortalReveal.create(target, opts)  // builds the canon on target with mode:'manual', reveal:'portal', portalOrigin from opts.origin (default '60% 62%', over a lit window), labels:['День','Вечір'], then adds a pulsing hotspot. On tap it re-centres the portal at the tapped point and blooms the OPPOSITE state in. opts: { dayMedia, nightMedia, origin, duration, hotspot, labels }. REQUIRES the canon (../daynight-engine/component.js) loaded first."
  module: iife
  returns: "{ root, dn, bloomAt(xPct,yPct), reset(), get(), destroy }. dn = the underlying canon api (re-created per bloom); bloomAt(x,y) re-centres the portal and blooms the opposite light in; reset() blooms the day back from the default origin; get() returns the live t (0=day .. 1=night)."
meaning:
  what: "The day↔night canon revealed as a PORTAL — the evening blooms outward in a growing circle from a point the visitor TAPS (a lit window, a 'turn on the evening' hotspot). It is the canon's manual driver + portal reveal (night clip-path = circle(t*145% at portalOrigin)), dressed with a pulsing hotspot that invites the first touch and fades after use. Tap anywhere and the circle re-centres there; tap again and the day blooms back."
  when: "An exterior or interior hero/feature where the day→evening change should feel like the visitor LIT the house themselves — a single dramatic gesture, not a slider or a scroll. Best full-bleed on a frame whose lit windows read as obvious touch points. The bloom from a window sells 'this is the same house, now it's evening, and you turned the lights on.'"
  lands: "A daytime still with a soft pulsing dot over a window. Touch it (or anywhere) and a circle of evening grows outward from that exact point, warm windows coming on as the night fills the frame. Tap again and the day blooms back from there. It reads as a tactile, expensive moment of control, not a button."
  not_when: "A hero that should turn to night on SCROLL (use daynight-scroll-scrub, the Nahirna dialect). A one-tap whole-frame flip with no bloom (use daynight-toggle, the Towns dialect). A wipe across a line that follows the cursor (use daynight-cursor-seam, the Smarts dialect). Per-window thresholds where windows light one by one (use daynight-masked-windows). A pair whose night frame is not geometry-identical to day (the growing circle exposes the mismatch, fall back to a static frame, the engine law)."
source:
  grammar: "The canon already carries reveal:'portal' 1:1 — at progress t the night layer gets clip-path: circle(t*145% at portalOrigin), so the evening grows as a circle from a CSS position; 145% guarantees full coverage at t=1 from any corner. The canon reads opt.portalOrigin at apply() time and exposes no origin setter, so this brick retargets per tap by re-creating the canon at the new origin (destroy+create is cheap — one frame-matched <img> pair) carrying the live t across via dn.set(t) so there is no jump, then tweens t to the opposite state (gsap.to power2.inOut, else a built-in rAF lerp). A pulsing hotspot dot marks the default origin and fades after the first use."
  recording: "apps/quadro/.award-re/teardowns/DISCOVERY_daynight_maps.md (Part A, V9 — portal reveal: night blooms from a clicked point). Built on the canon's verified reveal:'portal' (daynight-engine). Exterior pair is the seed frame (a lit window reads best as the bloom origin)."
  registry_ref: ["daynight-engine (canon, mode:manual reveal:portal)", "PORTAL-reveal-V9"]
stack: "vanilla (drives window.DayNight) — GSAP used for the bloom tween if present, else a built-in rAF lerp"
webgl: false
motion_props: [clip-path, transform, opacity]
trigger: "user interaction (click / tap on the stage); NOT scroll-driven"
timing_layer: [I-interaction]
owns_pin: false
owns_scroll: false
page_beat: [exterior, interior, hero, feature-card]
combines_with: [daynight-engine, room-selector]
anti_combos: [daynight-scroll-scrub, daynight-cursor-seam, mix-blend-over-scroll]
gated_by: [R_no_webgl, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target) builds the canon with mode:'manual', reveal:'portal', portalOrigin from opts.origin (default '60% 62%'), labels:['День','Вечір']; destroy() removes the hotspot AND the canon stage"
  - "click/tap anywhere on the stage re-centres the portal at the tapped point and blooms the OPPOSITE state in (night clip-path = circle(...) at the tapped %); tapping again blooms the other way; bloomAt(x,y) does this programmatically"
  - "a pulsing hotspot dot sits at the default origin inviting the first touch and fades (is-gone) after the first bloom"
  - "clip-path + transform + opacity only; GPU; NO mix-blend / NO backdrop / NO WebGL / NO canvas drawImage"
  - "prefers-reduced-motion -> hotspot hidden, no bloom, the canon statics the scene to night (no tap tracking)"
  - "asset-substitution gate: OUR exterior day/night pair (renders/dn-ext-day.webp + renders/dn-ext-night.webp), frame-matched; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The exterior loads in day with a pulsing dot over a window; after ~1.1s the evening blooms outward in a circle from that window (night clip-path = circle(t*145% at ~60% 62%) growing to full). Click anywhere else: the circle re-centres there and blooms the opposite light in; the hotspot is gone. NOTE: interaction-driven (not wheel), verify with a direct probe over a tap: night layer present, clip-path circle radius grows from the tapped origin, PASS = fps>=50, jank<8%. Verified: clip-path circle present, radius animates from tapped origin, 0 console errors."
note: |
  V9 of the day↔night family — the PORTAL dialect. NOT a new engine: it is the canon
  (window.DayNight) in mode:'manual' reveal:'portal', plus a pulsing hotspot and a tap
  handler. The canon paints the night layer as clip-path: circle(t*145% at portalOrigin),
  so the evening grows as a circle from a point; this brick retargets that point to wherever
  the visitor taps by re-creating the canon at the new origin (cheap destroy+create, carrying
  the live t across with dn.set(t) so there is no jump) then tweening t to the opposite state.
  Exterior 16:9 pair (a lit window reads best as the bloom origin). LAWS: clip-path + transform
  + opacity only, NO mix-blend / NO backdrop / NO WebGL / NO canvas drawImage, frame-matched
  pair only. reduced-motion hides the hotspot, skips the bloom and statics the scene to night.
  Verified clean: the circle blooms from the tapped origin, 0 errors.
---

# daynight-portal-reveal (V9) — Portal reveal, the evening blooms from a touch

## What it is

A daytime still of the house with a soft **pulsing dot** over a lit window. Touch it (or
anywhere on the frame) and a **circle of evening grows outward** from that exact point,
warm windows coming on as the night fills the frame. Tap again and the day blooms back.
The visitor feels like they **turned the lights on**.

It is a **variation**, not a new engine: it loads the canon (`window.DayNight`) and drives
its `reveal:"portal"` path, then adds the hotspot and the tap-to-bloom behaviour.

## The driver

`manual` + `reveal:"portal"`. The canon paints the night layer with
`clip-path: circle(t*145% at portalOrigin)`, so at `t=0` the circle is empty (pure day) and
at `t=1` it covers the whole frame (pure night). The `145%` guarantees full coverage at
`t=1` no matter which corner the origin sits in.

```js
// the variation call — drives the canon + adds the hotspot + tap-to-bloom
DayNightPortalReveal.create('#frame', {
  dayMedia:  'renders/dn-ext-day.webp',
  nightMedia:'renders/dn-ext-night.webp',
  origin: '60% 62%',     // the lit window the hotspot sits on
  duration: 1.6
});
// → internally: DayNight.create(frame, {
//     mode:'manual', reveal:'portal', portalOrigin:'60% 62%', labels:['День','Вечір'] })
```

`get()` returns the live `t` (0 = day, 1 = night). `bloomAt(x,y)` / `reset()` drive it.

## How the composite drives the reveal

The canon reads `opt.portalOrigin` at `apply()` time and exposes **no origin setter**. So to
bloom from wherever the visitor tapped, the brick **re-creates the canon at the new origin**:

1. on tap, map `clientX/clientY` to `(x%, y%)` of the stage rect (clamped 0..100);
2. `dn.destroy()` then `dn = DayNight.create(host, { ...portalOrigin: newOrigin })`;
3. `dn.set(t)` to **carry the current `t` across** so the frame does not jump;
4. tween `t` to the **opposite** state (`gsap.to(..., power2.inOut)` if GSAP is present,
   else a built-in rAF lerp), so the circle blooms from the tapped point.

Destroy + create is cheap here — one frame-matched `<img>` pair, no scroll trigger — so
retargeting the circle origin per tap is the clean path the brief calls for.

## What it adds over the canon

- the **pulsing hotspot dot** at the default origin (a CSS `box-shadow`/ring pulse), which
  fades (`is-gone`) after the first bloom — it invites the first touch and then gets out of
  the way;
- the **tap-to-bloom** handler (re-centre the portal + bloom the opposite light in);
- `bloomAt(x,y)` / `reset()` so a page (or the lab autoplay) can drive a bloom programmatically;
- nothing else: the circle reveal, the День/Вечір tags and the eager night layer all come
  from the canon.

## The asset

The lab uses the **exterior 16:9 pair** (`renders/dn-ext-day.webp` +
`renders/dn-ext-night.webp`) — a lit window reads best as the bloom origin — and the frame's
`aspect-ratio` matches the render proportion (G7, zero crop).

## Engine laws (inherited from the canon)

- **clip-path / transform / opacity / CSS-gradient only.** GPU-compositable.
- **NO WebGL, NO canvas drawImage, NO mix-blend, NO backdrop-filter.**
- **Frame-match rule:** day and night must be geometry-identical (lighting-only change),
  or the growing circle exposes the mismatch — fall back to a static frame.
- Night layer eager-loads (lazy decode under a fast bloom → stutter).
- `prefers-reduced-motion` → the hotspot is hidden, the bloom is skipped, the canon statics
  the scene to night.

## Lab

`lab.html` loads, in order: the canon CSS → this variation's CSS → GSAP → the **canon JS**
(`../daynight-engine/component.js`) → this brick. It autoplays one gentle bloom from the
hotspot window (~1.1s after load), then lets the visitor tap anywhere to bloom from there,
with a "Показати ще раз" replay. `window.__LAB_OK__` on init.
