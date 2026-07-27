---
id: daynight-masked-windows
name: "Masked-window glow (V11: the building stays in day; only the windows turn to night, each lighting at its own staggered threshold, like a house switching its lamps on room by room at dusk)"
level: 2
kind: variation
status: variation
since: base-79
variation_of: daynight-engine
driver: manual
reveal: mask
tags: [daynight, composite, variation, mask, windows, glow, opacity, real-estate, no-webgl, exterior]
entry:
  call: "DayNightMaskedWindows.create(target, opts)  // builds the canon on target with mode:'manual', reveal:'opacity', pins the night layer at opacity 0, then drops one cropped night-render box per window over the day building. opts: { dayMedia, nightMedia, windows:[{x,y,w,h,t0}], band, glow }. set(t) lights each window across its own band (t0..t0+band), eased, with a warm lamp glow. REQUIRES the canon (../daynight-engine/component.js) loaded first."
  module: iife
  returns: "{ root, dn, set(t), get(), windows, destroy }. dn = the underlying canon api; set(t) is PURE (0=all dark/day .. 1=all windows lit); windows = the lit <i> nodes; get() recovers t from the first window."
meaning:
  what: "The day↔night canon as a per-window MASK: the building stays in its DAYTIME render the whole time, and only the WINDOWS turn to night, each lighting at its own staggered threshold. Mechanically it is the canon (window.DayNight) in mode:'manual' reveal:'opacity' with the full night layer PINNED at opacity 0, plus one absolutely-positioned crop of the night render per window (a {x,y,w,h} rect registered 1:1 over the day building) whose opacity fades 0->1 across its own band as t rises. Each lit window carries a warm amber lamp glow that rises with it. No mask-image blending, no canvas — just cropped backgrounds + opacity + a gradient glow."
  when: "A wide exterior hero or feature card where the move you want is the QUIET one: dusk falling on a house and the rooms switching their lamps on one by one, the most distinctive day/night cell. Best on a still where windows read clearly across the lower facade (a one-storey villa, a townhouse row). Drive it with a slider, a scroll scrub, or a slow autoloop. It says 'this is a home that comes alive in the evening' without ever flipping the whole frame."
  lands: "The house stays in daylight, but as dusk gathers its windows begin to glow one by one, the carport first, then the left rooms, then the centre, then the far end, each lamp warming on with a soft amber halo. The walls, the roof, the garden never change, only the windows fill with light, so the building reads as a home settling into the evening rather than a photo being swapped. It feels lived in, quiet, and expensive, the way a real house looks from the street at nightfall."
  not_when: "A full-frame flip from day to night (use daynight-toggle, the Towns dialect, or daynight-scroll-scrub). A hands-on before/after where the visitor wipes the evening across a seam (use daynight-cursor-seam). A reveal that blooms from a point (use daynight-portal-reveal). A pair whose night frame is not geometry-identical to the day frame (the window crops would land off-register, fall back to a static frame, the engine law). An interior single-room shot (the windows-lighting metaphor needs a facade with several windows)."
source:
  grammar: "The canon already carries the day/night layer plumbing and the PURE t; reveal:'mask' in the canon doc points HERE (composites handle per-window thresholds). This brick keeps the night layer at opacity 0 (host building stays in day) and instead reveals the night render ONLY inside window rectangles: for each {x,y,w,h} it drops an <i class='dnw__win'> whose background IS the night render sized to the whole stage (background-size:(10000/w)% (10000/h)%) and positioned by the standard CSS percentage-crop formula (background-position:(x/(100-w)*100)% (y/(100-h)*100)%), so the box shows exactly its matching night slice in 1:1 registration. set(t) fades each window's opacity 0->1 across band (default 0.18) starting at its t0, smoothstep-eased, so the lamps warm up in sequence. A ::after radial-gradient blur is the lamp glow, riding the window's own opacity."
  recording: "apps/quadro/.award-re/teardowns/DISCOVERY_daynight_maps.md (Part A, V11 — masked-window glow). The day/night signature distilled from Towns (toggle/opacity), Nahirna (scrub/opacity + glow), Smarts (cursor/seam); V11 is the composite that lights individual windows rather than the whole frame."
  registry_ref: ["daynight-engine (canon, mode:manual reveal:opacity + pinned night + per-window crops)", "DISCOVERY_daynight_maps V11"]
stack: "vanilla (drives window.DayNight) — GSAP used only by the lab demo tween; the composite itself is opacity/gradient and needs no GSAP at runtime"
webgl: false
motion_props: [opacity]
trigger: "external set(t) — slider / scroll scrub / autoloop write t; NOT self-driven"
timing_layer: [S-scrub, I-interaction]
owns_pin: false
owns_scroll: false
page_beat: [exterior, hero, feature-card]
combines_with: [daynight-engine, daynight-scroll-scrub, scroll-progress-rail]
anti_combos: [daynight-toggle, daynight-cursor-seam, mix-blend-over-scroll, backdrop-filter-over-scrub]
gated_by: [R_no_webgl, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target) builds the canon with mode:'manual', reveal:'opacity', pins .dn__night at opacity 0, and appends one .dnw__win per config window; destroy() removes the windows AND the canon stage"
  - "set(t) lights each window across t0..t0+band (smoothstep), in sequence (carport t0 0.00 -> far-right t0 0.62); the day building stays fully visible the whole time (dn held at 0)"
  - "each window shows the MATCHING night crop (background-size/position registered 1:1 over the day building) plus a warm amber lamp glow (::after) that rises with its opacity"
  - "opacity + gradient only; GPU; NO mix-blend / NO backdrop / NO WebGL / NO mask-image blending / NO canvas drawImage"
  - "prefers-reduced-motion -> windows static lit (set(1)), no driver armed"
  - "asset-substitution gate: OUR exterior day/night pair (renders/dn-ext-day.webp + renders/dn-ext-night.webp), frame-matched, 16:9 zero-crop; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The daytime house loads; a slider / autoplay drives t 0->1 and the windows light in sequence (carport first, far-right last), each with a warm glow, while the daytime building never changes beneath. PASS = the .dnw__win opacities ramp at their staggered t0s, the day layer stays visible, fps>=50, jank<8%. Verified: 5 .dnw__win present, opacity-only ramp, day building unchanged, 0 console errors."
note: |
  V11 of the day↔night family — the MASKED-WINDOW GLOW composite. NOT a new engine: it is the
  canon (window.DayNight) in mode:'manual' reveal:'opacity' with the full night layer pinned at
  opacity 0 (the daytime building stays lit), plus one cropped night-render box per window that
  fades in across its own band as t rises, so the rooms switch their lamps on one by one at dusk.
  Each window carries a warm amber lamp glow (::after radial blur) riding its own opacity.
  Exterior 16:9 pair (the warm windows in the night ref form a band across the lower-middle, the
  default rects sit on them). LAWS: opacity + gradient only, NO mix-blend / NO backdrop / NO WebGL /
  NO mask-image blending / NO canvas, frame-matched pair only (crops must land 1:1). reduced-motion
  statics the windows lit. Verified clean: windows light in sequence, day layer unchanged, 0 errors.
---

# daynight-masked-windows (V11) — Masked-window glow, the house lights its windows one by one

## What it is

The building stays in its **daytime** render the whole time; only the **windows** turn to night,
each lighting at its own staggered threshold. A house at dusk switching its lamps on **room by
room**. It is the most distinctive cell in the day/night family: not a flip of the whole frame,
but the quiet one, evening arriving window by window.

It is a **composite**, not a new engine: it loads the canon (`window.DayNight`), builds it in
`mode:'manual' reveal:'opacity'`, **pins the full night layer at opacity 0** so the day building
stays visible, then drops one cropped slice of the night render over each window and fades them in
on staggered thresholds.

## The mechanism (NO WebGL, NO mask blending, NO canvas)

For each window `{x, y, w, h, t0}` (in % of the stage) the composite appends an
`<i class="dnw__win">` whose `background-image` **is the night render**, sized to the WHOLE stage
and positioned so the box shows exactly **its** night slice, registered 1:1 over the day building:

```js
wel.style.backgroundSize     = (10000 / w) + '% ' + (10000 / h) + '%';
wel.style.backgroundPosition = (x / (100 - w) * 100) + '% ' + (y / (100 - h) * 100) + '%';
```

`set(t)` then fades each window's opacity `0 -> 1` across its own band (`t0 .. t0 + band`,
default band `0.18`), smoothstep-eased. So as `t` rises the carport lights first, then the left
group, the centre, the right, the far-right last. The full night layer never shows; only the
windows light up over the unchanged daytime building.

```js
DayNightMaskedWindows.create('#frame', {
  dayMedia:  'renders/dn-ext-day.webp',
  nightMedia:'renders/dn-ext-night.webp'
  // windows / band / glow use the tuned defaults for this exterior render
});
// -> internally: DayNight.create(frame, { mode:'manual', reveal:'opacity' });
//    night layer pinned at opacity 0; one .dnw__win per window; set(t) lights them in sequence.
```

`set(t)` / `get()` stay **PURE** (0 = all dark / day, 1 = all windows lit). Drive it from a
slider, a `ScrollTrigger` scrub (`onUpdate: st => mw.set(st.progress)`), or a slow autoloop.

## The warm lamp glow

Each `.dnw__win::after` is a blurred amber radial-gradient pooled around the window. Because the
glow is a **child** of the window box, it shares the same opacity ramp, so the glow warms up
exactly as the lamp comes on. transform / opacity / gradient only, no mix-blend.

## The window layout (config-driven)

The default rects sit on the warm band in the exterior night render (`renders/dn-ext-night.webp`):

| window       | x   | y   | w   | h   | t0   |
|--------------|-----|-----|-----|-----|------|
| carport glow | 9%  | 60% | 10% | 14% | 0.00 |
| left group   | 31% | 58% | 13% | 18% | 0.12 |
| centre group | 46% | 57% | 13% | 20% | 0.28 |
| right group  | 62% | 58% | 15% | 18% | 0.46 |
| far-right    | 79% | 60% | 8%  | 14% | 0.62 |

Swap the pair and pass your own `windows` array for a different facade.

## Engine laws (inherited from the canon)

- opacity / clip-path / transform / CSS-gradient only. GPU-compositable.
- **NO WebGL, NO canvas drawImage, NO mix-blend, NO backdrop-filter, NO mask-image blending.**
- **Frame-match rule:** day and night must be geometry-identical (lighting-only change), or the
  window crops land off-register, fall back to a static frame.
- Night render eager-decoded by the canon layer; the window crops reuse the same URL (no second
  decode).
- `prefers-reduced-motion` -> windows static lit (`set(1)`), no driver armed.

## Lab

`lab.html` loads, in order: the canon CSS -> this composite's CSS -> GSAP -> the **canon JS**
(`../daynight-engine/component.js`) -> this brick. It autoplays a gentle demo (t eases 0 -> 1 -> 0
so the windows light then dim) and offers a "Показати ще раз" replay, while staying fully
interactive via the slider. The frame's `aspect-ratio` matches the 16:9 render proportion (G7,
zero crop). `window.__LAB_OK__` on init.
