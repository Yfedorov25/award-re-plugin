---
id: our-house-at-dusk
name: "Our house at dusk (A7): a draggable vertical seam wipes the house from cold afternoon into warm evening, the seam reading as the evening front advancing across the facade, and the windows ignite one by one only as the seam clears them"
level: 2
kind: section
status: stable
since: base-83
tags: [daynight, exterior, seam, before-after, drag, windows, facade, real-estate, no-webgl, section]
entry:
  call: "OurHouseAtDusk.create(target, { dayMedia, nightMedia, windows, start, onUpdate }) -> { root, dn, set(t), get(), tweenTo(t), windows, destroy }. Builds the canon (window.DayNight, mode:'manual' reveal:'seam' seamAxis:'x' seamFrom:'right') for the day<->evening seam clip, then adds a draggable seam handle and per-window warm-glow overlays clipped to the swept evening side that ignite as the seam clears each window centre. set(t) is PURE (0 = all afternoon, 1 = all evening; the seam sits at x = t). REQUIRES the canon (../daynight-engine/component.js) loaded first."
  module: iife
  returns: "{ root, dn (the canon api), set(t), get(), tweenTo(t), windows, destroy }. set(t) PURE 0..1 = seam x; tweenTo eases the seam (buttons / click-to-x)."
meaning:
  what: "An exterior before/after SECTION: a wide elevation of the house presented as one surface split by a draggable vertical seam. The canon clips the evening still in as the seam sweeps (reveal:'seam'); the seam reads as the EVENING FRONT advancing across the facade, evening filling the region it has swept, its windows already warm in the night render. The seam is the storyteller, not a neutral A/B slider: drag it and you decide how much of the house has crossed into evening. (An optional per-window glow layer that ignites windows one-by-one as the seam clears them is opt-in via opts.glowWindows, for a facade with a true window grid; OFF by default because on a low cottage elevation the boxes mis-register and read as floating orbs, so the default leans on the canon night render's own lit windows, which align perfectly.)"
  when: "An exterior beat that must make ONE render argue, wordlessly, that an evening here has a life in it. Best as a single decisive before/after feature (not a browser) where you have a frame-matched day/evening exterior pair. The seam-passes-and-lights mechanic turns a tired before/after pattern into a sales punchline."
  lands: "A wide house elevation at blue hour, split by a round-gripped seam. Drag it: on one side the afternoon stays cold and the windows are dark, on the side the seam has swept the house warms into evening and its windows come on in sequence as the front passes them. Pull the seam fully across and the whole house is alive against the dusk; drag back and the evening lifts. It reads as a tactile, expensive comparison with a point to make."
  not_when: "A hero that turns to night on SCROLL (use daynight-scroll-scrub). A one-tap flip (use daynight-toggle). A radial time-of-day driver (use the-facade-clock). A cursor-follow interior curtain (use daynight-cursor-seam). When you have NO frame-matched pair (the seam exposes any geometry mismatch)."
  not_when_extra: "STREET scale with neighbours staying dark (the spec's full punchline) needs a composited street render; this builds the single-BUILDING version (we have the building pair). The neighbours-stay-dark asset is logged as missing."
source:
  grammar: "The canon's seam reveal at building scale, with the asymmetric payload: t = the seam's x position drives the canon's PURE set(t) (clip-path inset peeling the evening still in from the swept side), and the SAME t (a) clips a per-window warm-glow group to the evening side and (b) ramps each window's opacity as the seam clears its centre, so window ignition is bound to seam-x and exclusive to the evening region. seamFrom:'right' makes the evening grow behind the rightward-dragged front; the День/Вечір corner tags + lockup copy are placed to match (Вечір on the swept/left side)."
  recording: "apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md (PART A, A7 our-street-at-dusk; built as the single-building our-house-at-dusk per the worker brief). Reuses daynight-cursor-seam (seam mechanics) + daynight-engine (two stills) + daynight-masked-windows (per-window glow), composed with the mask bound to the SEAM's x."
  registry_ref: ["daynight-engine (canon, mode:manual reveal:seam seamFrom:right)", "daynight-masked-windows (per-window glow technique)", "A7-our-street-at-dusk"]
stack: "vanilla IIFE (window.OurHouseAtDusk) driving window.DayNight; GSAP used for the tweenTo seam glide + the lab autoplay (optional — drag/keyboard work without it)"
webgl: false
motion_props: [clip-path, opacity, transform]
trigger: "user interaction (drag the seam handle / click-to-x / arrow keys); NOT scroll-driven"
timing_layer: [I-interaction]
owns_pin: false
owns_scroll: false
page_beat: [exterior, feature]
combines_with: [daynight-engine, script-overline-display-pair, vertical-awards-rail]
anti_combos: [daynight-scroll-scrub, daynight-toggle, mix-blend-over-scroll]
gated_by: [R_no_webgl, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target) builds the canon (mode:manual reveal:seam seamAxis:x seamFrom:right) for the day<->evening clip; set(t) is PURE 0..1 = the seam x; destroy() removes the handle, any glow layer and the canon stage"
  - "the canon owns the seam clip: .dn__night clip-path animates inset(0 100% 0 0) at t=0 -> inset(0 0% 0 0) at t=1 (night fills the swept region, its windows already lit in the render); the section does NOT hand-roll the crossfade"
  - "ONE seam grip: the section hides the canon's .dn__seamline grip + line and shows only its own brass grip + line (no double image)"
  - "the corner tags fade with t so they never lie (Вечір fades in as evening sweeps, День fades out); true at every t, not only mid-split"
  - "the per-window glow layer is OPT-IN (opts.glowWindows); when on it clips to the evening side and ignites each window after the seam clears it; OFF by default (default leans on the canon night render's own lit windows)"
  - "END state correct: t=1 = full evening, t=0 = full day; the draggable handle tracks the seam and is grabbable; click-to-x and arrow keys move it"
  - "clip-path / opacity / transform / gradient only; GPU-compositable; NO mix-blend / NO backdrop-filter / NO WebGL / NO canvas"
  - "a11y: the handle is role=slider with aria-valuemin/max + live aria-valuenow/valuetext; ArrowLeft/Right/Up/Down nudge, Home/End glide to the ends; the autoplay demo never fights a user gesture"
  - "prefers-reduced-motion -> the seam parks mid-frame as TWO static halves (evening | day, contrast visible), the drag disarmed, and the lockup copy reframed from an instruction to a description; window.__LAB_OK__ on init"
  - "asset gate: OUR frame-matched exterior pair (renders/dn-ext-day.webp + dn-ext-night.webp), 16:9 zero-crop surface; a scrim plate keeps the white lockup legible over the bright day side"
gate:
  probe: "Open lab.html. __LAB_OK__ true, 0 console errors, both stills loaded. Drag the round seam handle: the canon clips the evening still in as the seam sweeps; the windows ignite one by one just after the seam clears them, lit only on the evening side; the День/Вечір tags sit on the matching sides. set(0)=full day, set(1)=full evening. Verified headless: .dn__night clip inset(0 100%)->inset(0 0%), glow group clip tracks the seam, central window opacity 0 AT its centre and 1 just past (ignition trails the front), labels Вечір-left/День-right, aria-valuenow/valuetext set, demo does not fight a grab, reduced-motion parks at t=0.5 (static split) with reframed copy, zero em-dash. Smoothness @4x CPU: 60fps, 0% jank (PASS). Skeptic found NO critical; both MAJORs (reduced-motion showed only evening; drag/copy direction mismatch) + the targeted MINORs fixed + re-verified."
note: |
  A7 of the day/night family — the EXTERIOR before/after seam with an asymmetric payload. A thin
  orchestrator: the seam day<->evening clip lives in the canon (window.DayNight, reveal:'seam'); this
  section drives its PURE set(t) from the seam's x and layers (a) a draggable round handle, (b) a
  per-window warm-glow group cropped from the evening render and CLIPPED to the swept evening side,
  with each window igniting just after the seam clears its centre. The seam reads as the evening front
  advancing across the facade; the lit/evening side is where it has been, so the comparison carries a
  point. LAWS: clip-path / opacity / transform / gradient only; NO mix-blend / NO backdrop / NO WebGL /
  NO canvas; frame-matched pair only; reduced-motion -> two static halves. ASSET NOTE: the A7 spec's
  full punchline is at STREET scale (only our house lights, neighbours stay dark); we have the single
  BUILDING pair, so this is the building version (the seam-passes-and-lights mechanic in full). A
  composited street render (hero house lit + duller dark-windowed neighbours, labeled "візуалізація")
  would unlock the neighbours-stay-dark payoff — logged for the master to optionally generate.
---

# our-house-at-dusk (A7) — the seam that lights the house as it passes

## What it is

A wide elevation of the house at blue hour, one before/after surface split by a draggable vertical
seam. Drag it and the **canon** (`window.DayNight`, `reveal:'seam'`) clips the evening still in as the
seam sweeps. The seam reads as the **evening front advancing across the facade**: behind it the house
is in warm evening, ahead it is still cold afternoon. **THE TWIST:** the windows ignite one by one
**only as the seam clears them**, and the warm glow is masked to the evening side, so the life in the
windows is exclusive to the part of the day you have swept into evening.

It is a **section**, not a new engine: it loads the canon and drives its PURE `set(t)`, then adds the
handle and the seam-bound window ignition.

## The driver

A **drag**. `t` = the seam's x position (0..1). One `set(t)` drives:

- the **canon seam clip** — `dn.set(t)` peels the evening still in (`clip-path: inset`)
- the **glow group clip** — `inset(0 (1-t)% 0 0)` so warmth appears only on the swept evening side
- **each window's ignition** — `smooth((t - windowCentre) / 0.05)`, so a window lights just AFTER the
  seam clears its centre, never before (the light trails the front)
- the **handle** position + aria value

```js
OurHouseAtDusk.create('#ohd', {
  dayMedia:  'renders/dn-ext-day.webp',
  nightMedia:'renders/dn-ext-night.webp',
  start: 0.42
});
// → internally: DayNight.create(host, { mode:'manual', reveal:'seam', seamAxis:'x', seamFrom:'right' })
```

## What it adds over the canon

- the **draggable round seam handle** (the canon also draws `.dn__seamline`; this adds the grabbable
  grip + a brass seam line + keyboard + click-to-x + a "Повний вечір" glide)
- the **per-window warm-glow group** cropped from the evening render, **clipped to the swept side**,
  igniting in seam order (the daynight-masked-windows technique, mask bound to the SEAM's x)
- a **scrim plate** so the white lockup stays legible over the bright day side
- **a11y + reduced-motion**: role=slider with live value text; reduced-motion parks a static split

The day<->evening clip itself is the canon — not re-implemented.

## Concept honesty

The A7 spec's full punchline ("the same street, only our house lights, neighbours stay dark") needs a
composited STREET render. We have the single-BUILDING frame-matched pair, so this is the building
version: the seam-passes-and-lights mechanic in full, framed as one house living a day and an evening.
The eyebrow reads "Один дім, два різні життя" (not "вулиця") to avoid promising a street the render
does not show. The missing street asset is logged in the RECIPE for the master.

## Engine laws (inherited)

- clip-path / opacity / transform / gradient only. GPU-compositable.
- **NO WebGL, NO canvas, NO mix-blend, NO backdrop-filter.**
- **Frame-match rule:** day and night geometry-identical (the seam exposes any mismatch).
- `prefers-reduced-motion` -> two static halves (evening | day), the drag disarmed, copy reframed.

## Lab

`lab.html` loads, in order: canon CSS -> this CSS -> GSAP -> the **canon JS** -> this section. It
autoplays a gentle seam sweep so a screen-record shows the windows igniting as the front passes, offers
"Повний вечір" / "Знову день", and stays fully interactive (drag the grip, click-to-x, arrow keys). The
demo yields the instant the user touches the seam. `window.__LAB_OK__` on init; instance at `window.__ohd`.
