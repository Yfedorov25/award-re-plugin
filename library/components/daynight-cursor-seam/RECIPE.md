---
id: daynight-cursor-seam
name: "Cursor seam split (the Smarts dialect: the cursor wipes the evening in along a vertical seam, a round handle riding the split; touch drags it)"
level: 2
kind: variation
status: variation
since: base-79
variation_of: daynight-engine
driver: cursor
reveal: seam
tags: [daynight, variation, cursor, seam, clip-path, quickto, real-estate, no-webgl, smarts]
entry:
  call: "DayNightCursorSeam.create(target, opts)  // builds the canon on target with mode:'cursor', reveal:'seam', seamAxis:'x', seamFrom:'right', ease:0.5, rest:0.45, labels:['День','Вечір'], then adds the fading curtain hint. opts: { dayMedia, nightMedia, hint, rest, ease }. REQUIRES the canon (../daynight-engine/component.js) loaded first."
  module: iife
  returns: "{ root, dn, set(t), get(), hideHint(), resetHint(), destroy }. dn = the underlying canon api; set(t) is the canon's PURE passthrough; hideHint()/resetHint() control the curtain hint."
meaning:
  what: "The day↔night canon driven by the CURSOR over a SEAM — the Smarts dialect. Moving the pointer across the card slides a vertical splitline; to the day side is the daytime render, to the evening side the nighttime one, meeting at a round handle that rides the seam. On touch you drag the handle. It is the canon's cursor driver + seam reveal, dressed in the Smarts chrome (the grip, the День/Вечір tags, a curtain hint that fades after the first move)."
  when: "An interior or exterior card where a before/after comparison of the SAME frame in two lights should feel hands-on and exploratory — the visitor scrubs the evening in themselves. Best as a single feature card (a kitchen, a living room, a facade), not a full-bleed hero. Pair it with a room selector that swaps the day/night pair underneath."
  lands: "A still of the room that splits under your cursor: drag toward evening and the daylight peels away to reveal the same room at dusk, warm lights coming on across the seam; drag back and the day returns. A round handle sits on the line; a soft hint invites the first move and fades once you make it. It reads as a tactile, expensive before/after, not a button."
  not_when: "A hero that should turn to night on SCROLL (use daynight-scroll-scrub, the Nahirna dialect). A one-tap flip with no scrubbing (use daynight-toggle, the Towns dialect). A reveal that blooms from a point rather than wiping across a line (use daynight-portal-reveal). A pair whose night frame is not geometry-identical to day (the seam exposes the mismatch, fall back to a static frame, the engine law)."
source:
  grammar: "Smarts ran the day↔вечір reveal as a CURTAIN whose boundary follows the cursor: const sp={v:55}; gsap.quickTo(sp,'v',{duration:0.5,ease:'power3.out',onUpdate:apply}); moveSplit clamps ((clientX-left)/width)*100 to 6..94 and resets to 55 on mouseleave; CSS .night { clip-path: inset(0 0 0 var(--split)) } shows night to the right of the seam; .iv__splitline is a 2px line at var(--split) with a round 44px grip ::after; День bottom-left / Вечір bottom-right tags; a hint that fades 1.5s after the first move. The canon already carries the cursor+seam path; this brick supplies the Smarts dressing."
  recording: "apps/quadro/.award-re/teardowns/DISCOVERY_daynight_maps.md (Part A, V3). Seeds: apps/smarts/src/js/sections/interiors.js (the day↔вечір curtain), apps/smarts/src/styles/sections.css (.iv__main .night clip-path / .iv__splitline + grip / .iv__tag / .iv__hint)."
  registry_ref: ["daynight-engine (canon, mode:cursor reveal:seam)", "SMARTS-cursor-seam"]
stack: "vanilla (drives window.DayNight) — GSAP used by the canon for quickTo cursor smoothing if present, else the canon rAF lerp"
webgl: false
motion_props: [clip-path, transform]
trigger: "user interaction (mousemove / touchmove drag); NOT scroll-driven"
timing_layer: [I-interaction]
owns_pin: false
owns_scroll: false
page_beat: [interior, exterior, feature-card]
combines_with: [daynight-engine, room-selector]
anti_combos: [daynight-toggle, daynight-scroll-scrub, mix-blend-over-scroll]
gated_by: [R_no_webgl, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target) builds the canon with mode:'cursor', reveal:'seam', seamAxis:'x', seamFrom:'right', rest:0.45, labels:['День','Вечір']; destroy() removes the hint AND the canon stage"
  - "mousemove across the stage slides the seam (clip-path inset right value changes with cursor x, smoothed); a .dn__seamline with a round grip rides the seam; mouseleave relaxes to rest"
  - "touchmove drags the seam (passive); the curtain hint fades after the first move (hideHint)"
  - "clip-path + transform only; GPU; NO mix-blend / NO backdrop / NO WebGL"
  - "prefers-reduced-motion -> the hint is hidden and the canon statics the scene (no cursor tracking)"
  - "asset-substitution gate: OUR interior day/night pair (renders/dn-int-day.webp + renders/dn-int-night.webp), frame-matched; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The interior loads with the seam near 45%; a hint invites the move. Move the cursor to the evening edge so the seam slides and the room fills with the evening render (clip-path inset right approaches ~15%); move back so day returns; mouseleave relaxes to ~45%. The grip rides the seam; the hint fades after the first move. NOTE: interaction-driven (not wheel), verify with a direct probe over a cursor sweep: night layer present, clip-path animates, PASS = fps>=50, jank<8%. Verified: clip 15% at cursor-right, .dn__seamline present, 0 console errors."
note: |
  V3 of the day↔night family — the SMARTS dialect. NOT a new engine: it is the canon
  (window.DayNight) in mode:'cursor' reveal:'seam' (seamAxis x, seamFrom right, ease 0.5,
  rest 0.45 close to Smarts' 55% resting split), plus the Smarts chrome — the round grip on
  the seam (styled by daynight-engine/component.css .dn__seamline::after), the День/Вечір
  corner tags (via labels), and a curtain hint that fades after the first move. Interior 4:3
  pair (the seed is an interior). LAWS: clip-path + transform only, NO mix-blend / NO WebGL,
  frame-matched pair only. reduced-motion hides the hint and statics the scene. Verified
  clean: seam tracks the cursor, grip present, 0 errors.
---

# daynight-cursor-seam (V3) — Cursor seam split, the Smarts dialect

## What it is

Move the mouse across the card and a vertical **splitline** wipes the evening in from the
right; a round **⇆ handle** rides the seam. On touch, drag the handle. Cursor at the left =
day; cursor at the right = evening. This is the **Smarts dialect** of the day↔night signature,
harvested 1:1 from the interiors section's «ШТОРА день↔вечір».

It is a **variation**, not a new engine: it loads the canon (`window.DayNight`) and drives
its `cursor` driver + `seam` reveal, then adds the Smarts chrome (the ⇆ grip styling, the
День/Вечір corner tags, and a curtain hint that fades after the first move).

## The driver

`cursor` + `reveal:"seam"`. The canon maps the cursor's horizontal position across the stage
to `t` (0..1) and smooths it with `gsap.quickTo({ duration:0.5, ease:"power3.out" })` — the
exact tween from the seed. The night layer is revealed by `clip-path: inset(0 0 0 <gone>)`,
so the evening grows in from the **right** of the seam. On `mouseleave` it relaxes to `rest`.

```js
// the variation call — all it does is drive the canon + add the hint
DayNightCursorSeam.create('#frame', {
  dayMedia:  'renders/dn-int-day.webp',
  nightMedia:'renders/dn-int-night.webp',
  hint: 'Проведіть, щоб настав вечір'
});
// → internally: DayNight.create(frame, {
//     mode:'cursor', reveal:'seam', seamAxis:'x', seamFrom:'right',
//     ease:0.5, rest:0.45, labels:['День','Вечір'] })
```

`set(t)` / `get()` are forwarded straight from the canon and stay **PURE** (0 = day, 1 = evening).

## What it adds over the canon

- the **fading curtain hint** («Проведіть, щоб настав вечір») — fades out ~1.2s after the
  first real move (the seed faded its `.iv__hint` after the first move with a 1.5s delay);
- **Smarts seam polish** — the ⇆ grip nudges on a fine pointer, and grows to a clearly
  draggable 50px thumb on touch;
- nothing else: the seam line, the ⇆ grip, the День/Вечір tags, the quickTo follow, the
  clamp, and the reset-on-leave all come from the canon.

## The 55 → 0.45 mapping (faithful to the seed)

The seed rests its split at **55%** and clamps to **6..94%**. In the canon, cursor-at-left =
day (t 0), cursor-at-right = evening (t 1), clamped 0.06..0.94. `rest:0.45` settles the seam a
touch past centre on leave — the same "resting at ~55% from the left, evening filling the
right" feel as Smarts.

## The seed it harvests

`apps/smarts/src/js/sections/interiors.js`:

```js
const sp = { v: 55 };
const apply = () => main.style.setProperty("--split", sp.v + "%");
const vTo = gsap.quickTo(sp, "v", { duration: 0.5, ease: "power3.out", onUpdate: apply });
const moveSplit = (clientX) => {
  const r = main.getBoundingClientRect();
  vTo(Math.max(6, Math.min(94, ((clientX - r.left) / r.width) * 100)));
};
main.addEventListener("mousemove", (e) => moveSplit(e.clientX));
main.addEventListener("touchmove", (e) => moveSplit(e.touches[0].clientX), { passive: true });
main.addEventListener("mouseleave", () => vTo(55));
// CSS: .night { clip-path: inset(0 0 0 var(--split, 55%)); }   // evening shown RIGHT of the seam
//      .splitline { left: var(--split); width:2px; background:#f3f1ec; ::after = round 44px ⇆ }
//      tags "День" bottom-left, "Вечір" bottom-right; hint fades after first move.
```

The lab uses the **interior 4:3 pair** (`renders/dn-int-day.webp` + `dn-int-night.webp`) —
the seed is an interior — and the frame's `aspect-ratio` matches the render proportion (G7,
zero crop).

## Engine laws (inherited from the canon)

- opacity / clip-path / transform / CSS-gradient only. GPU-compositable.
- **NO WebGL, NO canvas drawImage, NO mix-blend, NO backdrop-filter.**
- **Frame-match rule:** day and night must be geometry-identical (lighting-only change),
  or the seam "jumps" — fall back to a static frame.
- Night layer eager-loads (lazy decode under a fast cursor → stutter).
- `prefers-reduced-motion` → static state, the cursor driver disarmed, the hint hidden.

## Lab

`lab.html` loads, in order: the canon CSS → this variation's CSS → GSAP → the **canon JS**
(`../daynight-engine/component.js`) → this brick. It autoplays a gentle demo (seam sweeps to
~92% then settles at the ~55% resting split) and offers a "Показати ще раз" replay, while
staying fully interactive (move the cursor / drag the grip). `window.__LAB_OK__` on init.
