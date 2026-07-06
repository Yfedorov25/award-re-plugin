---
id: daynight-engine
name: "Day↔Night canon (one engine, two pluggable axes: driver × reveal — two frame-matched stills of the same scene, one progress t takes it day to night)"
level: 2
kind: component
status: official
since: base-79
tags: [daynight, signature, crossfade, clip-path, scroll-scrub, cursor, real-estate, no-webgl]
entry:
  call: "DayNight.create(target, opts)  // target = element/selector. Injects .dn (stage) > .dn__day + .dn__night (+ optional glow/scrim/tags/seamline) into target, stacks the two media, and drives the night layer from one progress t. opts: { dayMedia, nightMedia, mode, reveal, seamAxis, seamFrom, portalOrigin, ease, rest, loop, scrub, scrim, glow, labels, onUpdate }. Aliased window.daynightEngine."
  module: iife
  returns: "{ root, set(t), get(), toggle(), play(), pause(), setMode(m), destroy }. set(t) is PURE (t: 0=day .. 1=night) — drive from any external scrub. toggle() flips with smoothing. setMode() re-arms the driver. get() = current t."
meaning:
  what: "The user's SIGNATURE real-estate move, reduced to one engine: two frame-matched media of the SAME scene (a daytime render + a nighttime render) stacked in one box, with a single normalized progress t (0=day, 1=night) driving the reveal. 'The same house, the same window, now it's evening.' The insight that makes it ONE engine: the visual is always two stacked layers + one t; everything else is two independent choices — a DRIVER (what writes t: toggle/scrub/cursor/hover/autoloop/manual) and a REVEAL (how the night layer appears for a given t: opacity / seam clip-path / portal circle). driver × reveal is a matrix; the variation bricks are its high-value cells. Distilled from three shipped sites that each did one cell of it."
  when: "Any place a real-estate scene should change from day to night without the geometry moving — a hero, an interior card, an exterior block, a before/after. Use this canon directly when you want full control (drive set(t) yourself from a custom scrub), or use a variation brick for a ready driver+chrome (daynight-toggle, daynight-scroll-scrub, daynight-cursor-seam, daynight-center-seam, daynight-masked-windows, daynight-portal-reveal). The asset rule is the gate: you must have a frame-matched day/night pair (lighting-only change)."
  lands: "The same frame, the same furniture, the same trees — but the light changes. The sky deepens, the windows warm, and what was noon becomes dusk. Depending on the reveal it either crossfades in place, wipes across a moving seam, or blooms outward from a point. It reads as one deliberate, expensive transformation of a single photographed moment, not two separate pictures swapped."
  not_when: "When the two frames are NOT geometry-identical (an outpainted or differently-shot night frame jumps mid-transition — fall back to a static frame; this is a hard engine law learned on the Smarts hero). When you want a whole-page colour theme flip rather than one scene's media (use theme-tween). When there is only one render (nothing to transition to). When the surface needs WebGL-grade lighting (out of scope — this is opacity/clip-path only, on purpose)."
source:
  grammar: "Three shipped sites each implemented ONE cell of the matrix: Towns = toggle driver + opacity reveal (a pill with a sliding thumb, data-mode flip, 0.7s opacity crossfade). Nahirna = scrub driver + opacity reveal (a pinned ScrollTrigger over +=110% scrubs night.opacity + a warm glow + a legibility scrim off one t, with a one-time text intro and a reduced-motion static fallback). Smarts = cursor driver + seam reveal (clip-path inset(0 0 0 var(--split)) following the cursor via gsap.quickTo, with a touch-drag twin and a fading curtain hint). The canon is the union: one create() with driver and reveal as orthogonal axes."
  recording: "apps/quadro/.award-re/teardowns/DISCOVERY_daynight_maps.md (Part A — the canon + the 20-variation catalog). Seeds: apps/nahirna/components/sections/00-Hero.tsx, apps/towns/src/js/sections/plan.js + src/styles/app.css, apps/smarts/src/js/sections/interiors.js + src/styles/sections.css."
  registry_ref: ["daynight-canon", "TOWNS-toggle-opacity", "NAHIRNA-scrub-opacity", "SMARTS-cursor-seam"]
stack: "vanilla IIFE (GSAP optional — gsap.quickTo used for cursor smoothing + scrub if present; a built-in rAF lerp is the fallback; ScrollTrigger required only for mode:'scrub')"
webgl: false
motion_props: [opacity, clip-path, transform]
trigger: "depends on the driver: toggle/hover/cursor = interaction; scrub = pinned ScrollTrigger; autoloop = rAF; manual = external set(t)"
timing_layer: [B-entrance, S-scrub, T-transition]
owns_pin: false
owns_scroll: false
page_beat: [hero, interior, exterior, gallery, chapter]
combines_with: [daynight-toggle, daynight-scroll-scrub, daynight-cursor-seam, mask-up-title, theme-tween]
anti_combos: [scrub-video-currenttime, mix-blend-over-scroll, second-cover]
gated_by: [R_no_webgl, R_perf_limits]
variants: [daynight-toggle, daynight-scroll-scrub, daynight-cursor-seam, daynight-center-seam, daynight-masked-windows, daynight-portal-reveal]
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target, {dayMedia, nightMedia}) stacks two media in a .dn stage and exposes set(t); set(0)=pure day, set(1)=pure night; destroy() removes the stage"
  - "reveal:'opacity' -> night.opacity = t; reveal:'seam' -> night clip-path inset peels from seamFrom edge (seamAxis x/y); reveal:'portal' -> night clip-path circle(t*145% at portalOrigin)"
  - "driver 'cursor' follows the pointer via gsap.quickTo (clamped, resets to rest on mouseleave) and shows a .dn__seamline; 'scrub' builds a pinned ScrollTrigger writing t from progress; 'autoloop' ping-pongs t on a period; 'toggle'/'manual' leave t to external set()/toggle()"
  - "optional glow (warm radial gradient rising with t) and scrim (legibility gradient rising with t*scrim) ride the same t at offset 0"
  - "opacity / clip-path / transform / CSS-gradient ONLY; GPU-compositable; NO canvas drawImage (iOS), NO mix-blend, NO backdrop-filter, NO WebGL"
  - "frame-match law: night media eager-loaded; if night is not geometry-identical to day, do not crossfade (fall back to a static frame)"
  - "prefers-reduced-motion -> static end state, drivers disarmed; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Both stills load. Drag the manual slider 0→1 and watch the same house go noon→dusk (windows warm, sky deepens). Switch the reveal seg (opacity / seam→ / sky↓ / portal) and confirm the SAME engine renders each: opacity at t=1 -> night.opacity 1; seam-x at t=0.5 -> inset(0 0 0 50%); portal at t=0.7 -> circle(~101% at origin). NOTE: in manual mode the move is a direct property write (not wheel-driven), so verify with a direct probe over a 0→1 ramp: night layer present every frame, the reveal prop animates, PASS = fps>=50, jank<8%. Verified: opacity 0/1 exact, seam 50%, portal blooms, 0 console errors."
note: |
  THE CANON of the day↔night family — the user's signature feature, which existed in three
  shipped sites in three shapes and reduces to ONE engine with two orthogonal axes:
  driver (what writes t) × reveal (how night appears for that t). Variation bricks are the
  high-value cells: daynight-toggle (V1, Towns), daynight-scroll-scrub (V2, Nahirna),
  daynight-cursor-seam (V3, Smarts), daynight-center-seam (V5), daynight-masked-windows
  (V11), daynight-portal-reveal (V9). Full 20-cell catalog in DISCOVERY_daynight_maps.md.
  LAWS: opacity/clip-path/gradient only, NO canvas drawImage (Nahirna rejected it for iOS),
  frame-matched pairs only (else it jumps — Smarts hero lesson), night eager-loaded (else
  mid-scrub decode stutter), reduced-motion -> static. set(t) is PURE — drive it from
  anything. The engine ships its own stage/seam/tag CSS (component.css); variations add
  only chrome. Verified clean: all four reveals correct, 0 errors, slider+reveal-switch live.
---

## What it is

The user's **signature real-estate move**: two frame-matched media of the *same* scene — a
daytime render and a nighttime render — stacked in one box, with a single normalized
progress `t` (0 = day, 1 = night) driving the reveal. "The same house, the same window —
now it's evening." It existed in three shipped sites in three different shapes; this is the
ONE engine they all reduce to.

## The insight (why one engine covers all of it)

The *visual* effect is always the same primitive — two stacked layers + one `t`. Everything
else is two independent choices:

- **driver** — what writes `t`: `toggle` · `scrub` · `cursor` · `hover` · `autoloop` · `manual`
- **reveal** — how the night layer appears for a given `t`:
  - `opacity` → `night.opacity = t`  (Towns, Nahirna)
  - `seam` → `clip-path: inset(...)` peels from an edge  (Smarts; `seamAxis` x/y, `seamFrom`)
  - `portal` → `clip-path: circle(t*145% at origin)` blooms outward

`driver × reveal` is a matrix; the variation bricks are its high-value cells.

## API

```js
DayNight.create(target, {
  dayMedia, nightMedia,          // selector | element | url — frame-matched, identical composition
  mode: "scrub",                 // driver
  reveal: "opacity",             // "opacity" | "seam" | "portal"
  seamAxis: "x", seamFrom: "right",
  portalOrigin: "50% 50%",
  ease: 0.5, rest: 0,            // cursor/hover smoothing + relax target
  loop: { period: 8 },           // autoloop
  scrub: { trigger, start, end, pin }, // scrub
  scrim: 0, glow: false, labels: null, onUpdate: null,
});
// → { root, set(t), get(), toggle(), play(), pause(), setMode(m), destroy }
```

`set(t)` is **PURE** — drive `t` from any external scrub and the whole thing follows.

## Engine laws (battle-tested)

- opacity / clip-path / transform / CSS-gradient ONLY. GPU-compositable. **NO WebGL, NO
  canvas drawImage** (Nahirna rejected drawImage for iOS), NO mix-blend, NO backdrop-filter.
- **Frame-match rule:** if night ≠ geometry-identical to day, do NOT crossfade — it "jumps"
  (Smarts hero learned this with an outpainted night). Fall back to a static frame.
- Night layer eager-loads (lazy decodes mid-scrub → stutter — Nahirna note).
- `prefers-reduced-motion` → static end state, drivers disarmed.

## Assets

Frame-matched pairs of the SAME scene, **lighting-only** change (sky darkens, windows glow).
Naming: `{scope}-{location}-{day|night}.{ext}`. Responsive `<picture>` desktop 16:9 / mobile 9:16.
Lab uses `renders/dn-ext-day.webp` + `dn-ext-night.webp` (real Higgsfield exterior pair from nahirna).

## Variations built on this canon

`daynight-toggle` (V1) · `daynight-scroll-scrub` (V2) · `daynight-cursor-seam` (V3) ·
`daynight-center-seam` (V5) · `daynight-masked-windows` (V11) · `daynight-portal-reveal` (V9).
Full catalog of 20: `apps/quadro/.award-re/teardowns/DISCOVERY_daynight_maps.md`.
