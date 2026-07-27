---
id: daynight-scroll-scrub
name: "Day→night scroll-scrub hero (the NAHIRNA dialect: day dissolves to night across a pinned ~110% scrub, warm glow rising + legibility scrim deepening)"
level: 2
kind: component
status: variation
since: base-30
seeds:
  - "apps/nahirna/components/sections/00-Hero.tsx  (the real pinned scrub: night.opacity 0→1, glow 0→1 power1.in, day-scrim 1→0.35, intro reveals once)"
tags: [daynight, scroll-scrub, pin, hero, opacity, glow, scrim, real-estate, nahirna, no-webgl]
entry:
  call: "DayNightScrub.create(target, opts)  // wraps window.DayNight in mode:'scrub' reveal:'opacity' + Nahirna caption layering. REQUIRES the canon (../daynight-engine/component.js) AND GSAP + ScrollTrigger loaded first."
  module: iife
  returns: "{ dn, root, set(t), get(), replay(), destroy }. dn = the underlying canon api. set(t) is the canon's PURE passthrough (drive from any external scrub). replay() re-runs ONLY the one-time text intro, never the scrub."
meaning:
  what: "The day↔night canon driven by scroll. A pinned hero holds while you scroll ~110% of viewport-height, and across that distance the daytime render dissolves into the nighttime render. Two cinematic layers ride the SAME progress t: a warm window-glow that rises as the lights come on, and a legibility scrim that deepens so the caption survives the darkening frame. The 'expensive' tell is that the move is one continuous, scroll-owned dissolve — the same house, the same window, evening arriving under your thumb — not a fade triggered by a button."
  when: "A hero (or any pinned chapter) that should turn from day to night as the visitor scrolls in. The signature opening of a single-villa or single-house site where the day/night pair is the emotional hook. Pair the intro reveal (kicker → headline → sub) with the scrub so the text settles first, then the evening comes."
  lands: "You land on the house at noon, the title rising line by line out of its mask. As you scroll, the frame does not move (it is pinned) but the light changes: the sky deepens, the windows warm, a soft glow gathers over the window band, and the lower third darkens just enough to keep the words crisp. By the time the pin releases you are standing in front of the same house at dusk."
  not_when: "A toggle the user flips on demand (use the toggle dialect — pill + dn.toggle()). A cursor-driven before/after seam (use the cursor/seam dialect — Smarts). A pair whose night frame is NOT geometry-identical to day (it will jump mid-scrub — fall back to a static frame, the engine law). When you cannot afford a pin in the scroll budget."
source:
  grammar: "Nahirna runs the day→night reveal as a SCROLL move: pin the hero, scrub night.opacity + glow.opacity + scrim.opacity off one ScrollTrigger over +=110%. The text reveals once (expo.out, masked lines, stagger) independent of the scrub; the hint fades as the scrub begins. STILLS only — the living-video pair was removed because the two clips were different shots and the house jumped/looped mid-scrub."
  recording: "apps/nahirna/components/sections/00-Hero.tsx (the shipped hero); distilled into the canon as mode:'scrub'."
  registry_ref: ["daynight-engine (canon, mode:scrub)"]
stack: "vanilla (drives window.DayNight) — REQUIRES GSAP + ScrollTrigger (the scrub driver)"
webgl: false
motion_props: [opacity, transform]
trigger: "scroll-driven (pinned ScrollTrigger, scrub:true); the canon owns the pin"
timing_layer: [B-entrance, S-scrub]
owns_pin: true
owns_scroll: false
page_beat: [hero, chapter]
combines_with: [mask-up-title, content-stage-cascade]
anti_combos: [second-smoother, second-cover, mix-blend-over-scrub]
gated_by: [R_perf_limits, R_pin_budget]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target) calls window.DayNight.create with mode:'scrub', reveal:'opacity', glow (the real Nahirna radial gradient), scrim:0.5, and the +=110% pinned scrub config"
  - "the canon writes ONE t from ScrollTrigger.progress; night.opacity, glow.opacity and scrim.opacity all ramp off that single t (no second scroll machinery)"
  - "the variation adds a ONE-TIME intro timeline (kicker → masked-line headline → sub → hint, expo.out, stagger) NOT tied to scrub; replay() re-runs only that"
  - "the scrim gradient is re-tinted to the EXACT seed gradient; the glow uses the EXACT seed radial gradient"
  - "opacity / gradient only on the scrubbed surface; GPU; NO canvas, NO mix-blend, NO backdrop, NO WebGL; night still eager-loaded"
  - "prefers-reduced-motion -> static: night hidden, glow/scrim off, text instantly visible, no scrub, no autoplay nudge"
  - "asset-substitution gate: the exterior house pair (renders/dn-ext-day.webp + renders/dn-ext-night.webp); window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html in a TALL 250vh scroller. __LAB_OK__ true. The exterior hero is pinned; scrolling drives day→night across +=110% — night.opacity rises, the warm glow gathers over the window band, the lower scrim deepens, and the caption stays legible the whole way. The text intro plays ONCE on load (masked lines slide up, expo.out). Because the scrubbed surface is an <img> driven by wheel-scroll, the smoothness-gate APPLIES: drive the wheel over the full day→night run, PASS = fps>=50, jank<8%, night layer present every frame, no mid-scrub decode stutter (night eager-loaded)."
note: |
  V2 of the day↔night family — the NAHIRNA dialect. NOT a new engine: it is the
  canon (window.DayNight) in mode:'scrub' reveal:'opacity', plus the Nahirna caption
  layering (kicker pill, masked-line headline, sub, scroll hint) and a one-time intro.
  The three scrubbed layers (night / glow / scrim) all ride the single t the canon's
  armScrub() writes from a pinned ScrollTrigger over +=110% — exactly the seed.
  STILLS only (the video pair was removed in the real build: different shots → the
  house jumped and the loops reset mid-scrub). Night is EAGER-loaded or it decodes
  mid-scrub and the drag stutters. owns_pin true — do not stack a second pin or a
  second smoother over it. Glow + scrim gradients harvested 1:1 from the seed.
  reduced-motion -> static night-hidden end state, text visible, no scrub.
---

# daynight-scroll-scrub — day dissolves to night as you scroll a pinned hero (NAHIRNA dialect)

V2 of the day↔night family. The daytime render dissolves into the nighttime render
across a **pinned ~110% scroll**, with a warm window-glow rising and a legibility
scrim deepening — all off the **single progress t** the canon writes from one
ScrollTrigger. This is the canon's `scrub` driver, not a new engine.

## What it adds over the canon
The canon already turns ScrollTrigger.progress into `night.opacity = t`,
`glow.opacity = t`, `scrim.opacity = t*scrim`. This variation supplies the **Nahirna
chrome**: the kicker pill, the **masked-line headline** (each line slides up once out
of an `overflow:hidden` mask), the sub, and the **scroll hint** that fades as the
scrub begins — plus a **one-time intro timeline** (expo.out, stagger) that is *not*
tied to the scrub. `replay()` re-runs only that intro.

## Markup + call
```js
// load order: ../daynight-engine/component.css, component.css,
//             GSAP, ScrollTrigger, ../daynight-engine/component.js, component.js
gsap.registerPlugin(ScrollTrigger);

var hero = DayNightScrub.create('#hero', {
  dayMedia: 'renders/dn-ext-day.webp',
  nightMedia: 'renders/dn-ext-night.webp',
  scrub: { start: 'top top', end: '+=110%', pin: true },
  glow: true,            // warm window-glow rises with t (real Nahirna radial)
  scrim: 0.5,            // legibility scrim deepens with t
  kicker: { place: 'вул. Нагірна, Вінниця', edge: 'перша лінія до Південного Бугу' },
  headline: ['Прокидатися', 'від води,', 'не від сусідів'],
  sub: 'Тупікова вулиця, далі тільки річка й дерева. Найближче сусідське вікно аж за садом.',
  hint: 'гортайте, настає вечір'
});
// hero.dn.set(t)  // PURE: drive from any external scrub if you ever need to
```

## The seed it harvests (1:1)
`apps/nahirna/components/sections/00-Hero.tsx`:
```
scrollTrigger:{ trigger:root, start:"top top", end:"+=110%", scrub:true, pin:true,
                pinSpacing:true, anticipatePin:1 }
tl.fromTo(".hero-night-still", {opacity:0}, {opacity:1, ease:"none"}, 0);   // night
tl.fromTo(".hero-glow",        {opacity:0}, {opacity:1, ease:"power1.in"}, 0); // glow
tl.fromTo(".hero-day-scrim",   {opacity:1}, {opacity:0.35, ease:"none"}, 0);   // scrim
// intro reveals ONCE (kicker → lines → sub → hint), expo.out, not tied to scrub.
glow  = radial-gradient(60% 35% at 58% 56%, rgba(232,201,160,0.14), transparent 70%)
scrim = linear-gradient(180deg, rgba(15,15,14,0) 0%, 0% 38%, 0.5 64%, 0.74 100%)
```

## Engine laws (inherited from the canon)
opacity / gradient only on the scrubbed surface; GPU compositable; **NO canvas
drawImage** (Nahirna rejected it for iOS), **NO mix-blend, NO backdrop-filter, NO
WebGL**. The night still is **eager-loaded** (lazy = mid-scrub decode stutter). The
frame-match rule holds: if the night frame is not geometry-identical to day, do not
crossfade — it jumps. `owns_pin` is true: never stack a second smoother or a second
pin over it. `prefers-reduced-motion` → static end state (night hidden, text visible,
no scrub, no autoplay nudge).

## Proven (the lab)
`lab.html` runs in a **tall 250vh scroll container** so the pin + `+=110%` scrub has
real room. The exterior hero (`renders/dn-ext-day.webp` → `dn-ext-night.webp`) pins
on entry; scrolling drives the day→night dissolve, the warm glow gathers over the
window band, the scrim deepens, and the masked-line headline reveals once on load.
Fully interactive plus a gentle one-time autoplay nudge for screen-records.
