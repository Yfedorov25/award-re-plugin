---
id: daynight-center-seam
name: "Center seam split (the Saisei dialect: both halves part from the centre, the evening render born in the widening centre gap and growing outward to both edges)"
level: 2
kind: variation
status: variation
since: base-79
variation_of: daynight-engine
driver: manual
reveal: seam
tags: [daynight, variation, center-seam, saisei, clip-path, symmetric, real-estate, no-webgl, exterior]
entry:
  call: "DayNightCenterSeam.create(target, opts)  // builds the canon on target with mode:'manual', reveal:'opacity' (the canon stacks day+night and gives .dn__night), then OVERRIDES the night clip-path on each t with a centre-parting inset: inset(0 (1-t)*50% 0 (1-t)*50%), plus a 2px centre seam that fades as the gap opens. opts: { dayMedia, nightMedia, labels, onUpdate }. REQUIRES the canon (../daynight-engine/component.js) loaded first."
  module: iife
  returns: "{ root, dn, set(t), get(), destroy }. dn = the underlying canon api; set(t) is the composite's PURE centre-parting reveal (0=day, centre closed .. 1=evening, fully revealed); get() returns current t."
meaning:
  what: "The day↔night canon parted from the CENTRE — the Saisei dialect. Unlike V3 (one seam follows the cursor), here BOTH halves part outward from a vertical centre line and the EVENING render is revealed in the widening centre gap, growing to both edges. It is the canon (window.DayNight) in mode:'manual' reveal:'opacity' (so the canon stacks day + night for us), with the composite writing a SYMMETRIC double-clip — inset(0 (1-t)*50% 0 (1-t)*50%) — on the night layer per t, plus a 2px centre seam that fades as the gap opens. The canon's single-edge seam cannot do the symmetric part, so the composite supplies its own reveal."
  when: "A facade or hero card where the day→evening change should feel ceremonial and centred — the dusk light born from the middle of the building and spreading outward, a seam ритуал rather than a corner wipe. Best driven by a scroll-scrub on a feature beat or autoplayed on enter, with a slider/scroll to scrub. Pair it with a quiet headline that the parting reveals around."
  lands: "A still of the facade with a faint hairline down the centre. As progress rises, the line parts and the SAME facade at dusk grows out of the gap to both edges, warm windows coming on symmetrically, the seam fading as the evening fills the frame. It reads as light being born from the centre of the house, not a button and not a corner peel."
  not_when: "A reveal driven by the CURSOR along a single moving seam (use daynight-cursor-seam, the Smarts dialect). A simple full-frame fade on scroll (use daynight-scroll-scrub, the Nahirna dialect). A one-tap flip (use daynight-toggle, the Towns dialect). A bloom from a single point rather than a centre line (use daynight-portal-reveal). A pair whose night frame is not geometry-identical to day (the parting exposes the mismatch at the centre, fall back to a static frame, the engine law)."
source:
  grammar: "The Saisei centre-seam split — both halves part from the centre, content revealed in the widening gap — applied to the day/night pair. The reveal the canon does not carry: a SYMMETRIC double-clip night.clipPath = 'inset(0 ' + (1-t)*50 + '% 0 ' + (1-t)*50 + '%)' (t=0 -> hairline at centre, inset 50% 50%; t=1 -> full, inset 0), with a fixed 2px centre seam whose opacity = (1-t) (solid when closed, gone when open). The canon (mode:'manual', reveal:'opacity') only stacks day + night, forces night opacity 1, and provides the День/Ніч corner tags; the centre parting is the composite's."
  recording: "apps/quadro/.award-re/teardowns/DISCOVERY_daynight_maps.md (Part A, V5). Saisei centre-seam dialect; day/night pair from the day↔night signature. Exterior 16:9 pair (the facade is the seed scene)."
  registry_ref: ["daynight-engine (canon, mode:manual reveal:opacity + composite centre-clip)", "SAISEI-center-seam"]
stack: "vanilla (drives window.DayNight) — GSAP used only by the lab demo tween and by the canon if present; the composite reveal is plain clip-path"
webgl: false
motion_props: [clip-path, opacity]
trigger: "manual / external set(t) — a scroll-scrub or an autoplay+slider drive t; NOT cursor-tracked"
timing_layer: [I-interaction]
owns_pin: false
owns_scroll: false
page_beat: [exterior, hero, feature-card]
combines_with: [daynight-engine, scroll-scrub, room-selector]
anti_combos: [daynight-cursor-seam, daynight-toggle, mix-blend-over-scroll]
gated_by: [R_no_webgl, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target) builds the canon with mode:'manual', reveal:'opacity', labels:['Вдень','Ввечері']; the night opacity is forced to 1 and a .dncenter__seam line is added; destroy() removes the seam AND the canon stage"
  - "set(t) writes the SYMMETRIC centre-parting clip-path on .dn__night: inset(0 (1-t)*50% 0 (1-t)*50%) — t=0 is a hairline at the centre, t=1 is full; the 2px centre seam opacity = (1-t)"
  - "set(t) is PURE and forwarded as the composite reveal (0=day .. 1=evening); get() returns current t"
  - "clip-path + opacity only; GPU; NO mix-blend / NO backdrop / NO WebGL / NO canvas drawImage"
  - "prefers-reduced-motion -> static end state (evening fully revealed, no seam, no demo tween)"
  - "asset-substitution gate: OUR exterior day/night pair (renders/dn-ext-day.webp + renders/dn-ext-night.webp), frame-matched, 16:9 frame; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The facade loads closed (a faint centre hairline, pure day). The demo parts the centre open once: the night clip-path inset shrinks from 50% toward 0 on both sides and the evening grows out of the centre to both edges; the seam fades as it opens. Scrub the slider back to 0 to close it; 'Показати ще раз' replays. PASS = night layer present, clip-path animates symmetrically, fps>=50, jank<8%. Verified: at t=1 clipPath inset(0 0 0 0), at t=0 inset(0 50% 0 50%), .dncenter__seam present, 0 console errors."
note: |
  V5 of the day↔night family — the SAISEI dialect. NOT a new engine: it is the canon
  (window.DayNight) in mode:'manual' reveal:'opacity' (which stacks day + night and hands us
  .dn__night), with the composite supplying the reveal the canon does not carry — a SYMMETRIC
  double-clip that parts the night from the CENTRE: inset(0 (1-t)*50% 0 (1-t)*50%), born as a
  hairline at the middle (t=0) and growing to full (t=1). A fixed 2px centre seam fades from
  solid to gone as the gap opens. Exterior 16:9 pair (the facade is the seed). LAWS: clip-path
  + opacity only, NO mix-blend / NO WebGL / NO canvas, frame-matched pair only. reduced-motion
  statics the scene to the fully-revealed evening with no seam. Verified clean: centre parts
  symmetrically, seam fades, 0 errors.
---

# daynight-center-seam (V5) — Center seam split, the Saisei dialect

## What it is

A faint hairline sits down the **centre** of the facade. As progress rises, the line **parts**
and the SAME facade **at dusk** is born in the widening centre gap, growing outward to both
edges, warm windows coming on symmetrically. The seam fades as it opens. This is the **Saisei
centre-seam split**, applied to the day↔night signature.

It is a **variation**, not a new engine: it loads the canon (`window.DayNight`), uses it to
stack the day + night layers, then supplies the one reveal the canon does **not** carry — a
SYMMETRIC double-clip from the centre.

## Why the composite supplies its own reveal

The canon's `reveal:"seam"` peels the night from **one edge** (the Smarts curtain). A centre
part needs the clip to open from **both sides at once** — a symmetric inset. So V5 builds the
canon in `mode:"manual"`, `reveal:"opacity"` (which stacks day + night and hands back
`.dn__night`), forces the night opacity to 1, and writes the centre-parting clip-path itself:

```js
// the composite's reveal — the SYMMETRIC double-clip the canon does not do
night.style.clipPath = 'inset(0 ' + ((1 - t) * 50) + '% 0 ' + ((1 - t) * 50) + '%)';
// t = 0  -> inset(0 50% 0 50%)  = a hairline at the centre (pure day)
// t = 1  -> inset(0  0% 0  0%)  = full evening, edge to edge
```

A fixed 2px centre seam (`.dncenter__seam`) rides the parting; its opacity is `1 - t`, so it
is solid when closed and gone when fully open.

```js
// the variation call — all the app provides is the pair + labels
DayNightCenterSeam.create('#frame', {
  dayMedia:  'renders/dn-ext-day.webp',
  nightMedia:'renders/dn-ext-night.webp',
  labels: ['Вдень', 'Ввечері']
});
// -> internally: DayNight.create(frame, { mode:'manual', reveal:'opacity',
//      labels:['Вдень','Ввечері'] }); night.opacity = 1; clip-path written per t.
```

`set(t)` / `get()` are the composite's, and stay **PURE** (0 = day, centre closed; 1 = evening,
fully revealed).

## The driver

`manual`. The lab drives `set(t)` two ways and stays fully interactive:

- an **autoplay** demo parts the centre open once on enter (a `gsap` tween 0→1→0, `sine.inOut`),
  so a screen-record shows the move;
- a **slider** scrubs the parting by hand, and **«Показати ще раз»** replays the demo.

In production drive `set(t)` from a scroll-scrub on a feature beat, or from any external scrub.

## The frame

The lab uses the **exterior 16:9 pair** (`renders/dn-ext-day.webp` + `dn-ext-night.webp`) —
the facade is the seed scene — and the frame's `aspect-ratio: 16/9` matches the render
proportion (G7, zero crop).

## Engine laws (inherited from the canon)

- opacity / clip-path / transform / CSS-gradient only. GPU-compositable.
- **NO WebGL, NO canvas drawImage, NO mix-blend, NO backdrop-filter.**
- **Frame-match rule:** day and night must be geometry-identical (lighting-only change),
  or the parting exposes the mismatch at the centre — fall back to a static frame.
- Night layer eager-loads (lazy decode under a fast scrub → stutter).
- `prefers-reduced-motion` → static state: the evening fully revealed, the seam hidden,
  no demo tween.

## Lab

`lab.html` loads, in order: the canon CSS → this variation's CSS → GSAP → the **canon JS**
(`../daynight-engine/component.js`) → this brick. It autoplays the centre part-open once,
offers a «Показати ще раз» replay, and a slider scrubs the parting by hand. The caption reads
«Вдень фасад. Ввечері дім.» / «Світло народжується з середини.». `window.__LAB_OK__` on init.
