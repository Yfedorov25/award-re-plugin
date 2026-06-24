---
id: slicer-reveal
name: "Slicer reveal (SAISEI horizontal slice)"
level: 1
kind: component
status: official
entry:
  call: "SlicerReveal.init({ stackSel:'#stack', acts:[{ img, alt, side:'left'|'right', chip, eyebrow, lines:[a,b], body, meta, inset?:{ img, alt, cap }, climax?:bool }], start:'top top', end:'bottom bottom', scrub:0.8, sliceDur:0.55, parScale:1.06 })   # Recorded 1:1 from the RESTORED, owner-approved slc-h2 — the CONTAINED ~50vw calm version (NOT the broken full-screen one). The REAL slc-h2 entry is an inline IIFE that drives three tall .beat sections (height:200vh) whose inner STICKY .beat-stage pins a CONTAINED ~50vw render and builds one scrubbed slicer timeline each. Recorded faithfully as a window-global init(opts). If acts[] is omitted (or the stack already holds .beat>.slab markup) the engine drives whatever slc-h2-shaped DOM is present (.stack > .beat[.beat--right] > .beat-stage(sticky) > .render-col > .slab > img/.edge/.chip + .text-col, climax beat carries #inset) — the SMALLER faithful change. The motion math (per-beat clip-path inset(0 100% 0 0) -> inset(0 0 0 0) L->R slice over normalized 0.0->0.55 on a scrubbed ScrollTrigger start 'top top' / end 'bottom bottom', the pixel-snap that kills the expo asymptote, the stacked NO-RECLOSE logic, the 1.06->1.0 micro-parallax, the light-edge ride, the masked-line text rise, the climax big+small inset pairing at 0.62, reduced-motion / narrow static path) is byte-faithful to the restored slc-h2 and is NOT rewritten to fit this signature."
  module: iife
  returns: "{ n, timelines, refresh, kill } | { reduced:true, n, refresh, kill } | null"
meaning:
  what: "A SAISEI-grade editorial showcase where each CONTAINED render (~50vw, never full-screen) sits in a sticky stage and is REVEALED by a hard-edged horizontal clip that opens LEFT->RIGHT (clip-path inset(0 100% 0 0) -> inset(0 0 0 0)) on a calm eased expo.out scrub over a generous cream field, a thin light-line riding the leading edge; the render stays OPEN/STATIC once sliced (stacked scroll — never re-closes) while the opposite serif text-column resolves (eyebrow + masked lines rise + meta), beats alternating render side; the climax pairs the big render held open with a SMALL inset detail that slices open beside it."
  when: "A calm-luxury project/features showcase where each render should be REVEALED by an architectural slice on generous cream air — contained renders, alternating render/text rhythm, a thin divider, Fraunces serif. The 'open it like a drawing' editorial read, one render arriving per scroll band."
  lands: "A genuine SAISEI award-page read: renders open like architectural drawings on cream restraint, the serif headline resolving alongside, the big+small pairing landing the climax — premium editorial, never a slideshow-cut, never clutter."
  not_when: "Full-bleed cinematic takeover or a vertical film-advance of big heroes (use vertical-slide, or depth-stack for planes pushing through Z), or a horizontal card deck swiped sideways (use cards-swipe). Also not for flat index/conversion sections where motion must drop."
source:
  grammar: "QUADRO slide-lab — RESTORED, owner-approved slc-h2 horizontal split slicer reveal (SAISEI grade), the CONTAINED ~50vw calm version (NOT the broken full-screen one); the contained ~50vw render in a sticky cream stage + calm eased L->R architectural slice + stacked no-reclose beats + clean cream (no plate) + climax big+small pairing"
  recording: "apps/quadro/public/slide-lab/slc-h2-split-reveal.html"
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase"
webgl: false
motion_props: [transform, opacity, clip-path]
trigger: "scroll-scrub driving a clip-path L-to-R slice per render, renders stay open (stacked)"
timing_layer: [B-entrance, A-ambient]
owns_pin: false
page_beat: [material, lifestyle-climax]
combines_with: [reveal, scroll-indicator, vertical-slide]
anti_combos: [second-pin, cards-swipe]
gated_by: [R_perf_limits, R_timing_layers, R_anti_combos]
variants: [horizontal-split, vertical-line-sweep]
params_ref: tokens.json
files: [RECIPE.md, component.js, component.css, lab.html, tokens.json]
acceptance:
  - "render revealed by a CALM horizontal L-to-R clip slice, eased, no jerk: clip-path inset(0 100% 0 0) -> inset(0 0 0 0) on expo.out over normalized 0.0->sliceDur(0.55) of the beat band (start 'top top' / end 'bottom bottom'), scrub:0.8, pixel-snapped exactly-full at slice end (kills the expo asymptote so no perpetual 99.5%) — slow and premium, NOT a snap"
  - "render sizing is CONTAINED ~50vw and explicit (NOT full-screen): the render takes the 50fr lane of the sticky .beat-stage grid var(--mx)|50fr|clamp(40px,6vw,96px)|42fr|var(--mx) at height min(86vh,720px), with cream air around it — this is the restored calm version; the broken full-screen variant is NOT what is recorded"
  - "revealed render STAYS static (no re-close) — SAISEI stacked scroll: each beat owns its OWN scrubbed ScrollTrigger over its tall band (height:200vh) with a sticky stage, once open the render simply scrolls with the page; there is NO re-cover tween (the bug fix is preserved — re-close is NOT reintroduced)"
  - "ZERO image overlap: each beat is its own tall band + sticky stage, so only one contained render is in its reveal window at a time; the climax inset slices open only AFTER the main render is settled (never two mid-slice at once)"
  - "no visible placeholder plate — photo opens on clean cream: the slot backing IS --render-back = --cream (NO dark/beige plate), renders eager-preloaded (new Image, loading=eager) so the slice opens on a painted image"
  - "SAISEI sizing: contained ~50vw render + ~55% cream air + Fraunces serif + alternating text-features: render column ~50vw with cream gutter, headline in Fraunces, eyebrow/meta in sans, thin --hair divider over meta, beats alternate render side (left/right/left)"
  - "reduced-motion/narrow collapse to static legible layout: prefers-reduced-motion OR <=820px sets .is-static, slices FULLY OPEN (clip inset(0 0 0 0)), no scrub, no edge, block-stacked legible layout"
verify: "lab.html#__LAB_OK__"
---

# slicer-reveal — Slicer reveal (SAISEI horizontal slice)

> **status: official.** Recorded 1:1 from the **RESTORED**, owner-approved QUADRO
> prototype `apps/quadro/public/slide-lab/slc-h2-split-reveal.html` — the
> **CONTAINED ~50vw calm** version (NOT the broken full-screen one). This is a
> SAISEI-grade EDITORIAL showcase: **contained ~50vw renders** sit in a sticky
> stage on a dominant cream field and are **revealed by a calm, hard-edged
> horizontal slice that opens left→right**, then **stay open** as you scroll
> (stacked scroll, no re-close), alternating with a right-/left-aligned serif
> text-feature over a thin divider. It is its OWN component (NOT a cards-swipe or
> vertical-slide variant): cards-swipe swipes a deck **horizontally across a flat
> track**; vertical-slide advances big hero cels **up the page on Y** with a held
> climax; slicer-reveal **opens each contained render in place via a clip-path
> slice on cream** and leaves it open — the "architectural drawing reveal" read.

## The SAISEI grammar (what `component.css` owns)

The whole surface is **cream paper restraint** — `--cream:#EDE6D4` is the dominant
pixel (>=55% of every beat), with a barely-there warm radial vignette behind the
stack and **zero ghost/background typography**. The book is set in **Fraunces**
(serif display) for headlines, **Inter** for eyebrow/meta/body.

**Four render-size slots** carry the SAISEI sizing discipline:

1. **Main render column** — a `.render-col` (`height:min(86vh,720px)`) inside the
   sticky `.beat-stage`, contained to ~**50fr** of the stage grid (**~50vw**),
   hugging the page with a small cream gutter. **CONTAINED, never full-screen** —
   this explicit ~50vw containment is the restored, owner-approved sizing; the
   broken variant let the render go full-screen.
2. **Cream air column** — the opposite ~**42fr** holds the text-feature; the
   `clamp(40px,6vw,96px)` centre axis is pure cream gutter. Cream + gutter keep
   the render from ever reading full-bleed.
3. **Small inset detail** — `width:min(27vw,300px); height:min(20vh,180px)` (~3:2),
   the SAISEI **big+small pairing** at the climax beat.
4. **Static collapse slot** — under reduce-motion / `<=820px` the render becomes a
   block `aspect-ratio:4/3` and the inset `min(70vw,360px)` 3:2, fully open.

**Cream-air ratio.** The sticky `.beat-stage` grid is
`var(--mx) | 50fr | clamp(40px,6vw,96px) | 42fr | var(--mx)` (mirrored on
`.beat--right`). The render takes the 50fr lane (**~50vw, contained**);
everything else — the two `--mx` margins, the centre axis, and the 42fr text lane
minus its 36ch headline — reads as cream air. By construction the cream surface
stays the **dominant ground** (~55%+), which is the SAISEI restraint the
technique is named for.

**The thin divider.** Each text-feature closes on a `border-top:1px solid
var(--hair)` over the `.beat-meta` line — the SAISEI hairline rule that anchors
the meta to the cream.

## The slice mechanic (what `component.js` owns)

Each render is a `.slab` (a hard `overflow:hidden` clip box whose **backing IS the
page cream** — `--render-back:var(--cream)`, the no-plate fix). At rest the slab
is **closed**: `clip-path: inset(0 100% 0 0)` — clipped from the right down to a
0-width sliver at the left, so only a 1px seam shows on clean cream.

As the beat's sticky stage locks and the band scrolls, ONE scrubbed timeline
slices the render **open left→right**:

```
closed:  clip-path: inset(0 100% 0 0)     (sliver on cream)
open:    clip-path: inset(0 0 0 0)        (full contained ~50vw render)
```

- The slice eases on **`expo.out`** (`E_SLICE`) over normalized `0.0 → sliceDur
  (0.55)` of the beat band, scrubbed (`scrub:0.8`) — a **calm, slow, premium**
  open over ~0.55 viewport of real scroll, a clean, perfectly-vertical,
  **anti-aliased architectural cut**: no blur, no gradient wipe, **NOT a snap**.
- A thin **light line** (`.edge`, the `--seam` bar) is shown the instant travel
  begins, **rides the leading right edge** across the open band (it lives inside
  the slab's `overflow:hidden`), then fades at full open.
- The image behind is **static in world-space** — only a `1.06 -> 1.0`
  micro-parallax `scale` (house ease `air`), never a squash.
- At the slice end the timeline **snaps `clip-path` to exactly `inset(0 0 0 0)`**
  to kill the `expo.out` asymptotic tail (no perpetual 99.5%-open) — the render is
  pixel-exact full.
- The text resolves WITH the slice: eyebrow fades up, the two headline lines
  **rise from under a mask** (`yPercent:112 -> 0`, the `.ln` overflow clips them),
  body + meta fade up — all on the house `air` ease.

## The stacked no-reclose scroll (the BUG-A fix — preserved EXACTLY)

The page is **three tall beat-sections** (`height:200vh`) stacked vertically, each
with an inner **sticky stage** (`.beat-stage`, `100vh`) that pins the contained
~50vw render centred in the viewport while its band scrolls. **Each beat owns its
OWN scrubbed `ScrollTrigger`** (`start:"top top"`, `end:"bottom bottom"`). As a
beat's sticky stage locks, its render slices open **once**; once open it **STAYS
OPEN / STATIC** and simply scrolls away above as the next sticky stage scrolls in.

**There is NO re-cover tween.** The prior render never re-closes; scrolling down
does not re-cover anything. Reverse scroll re-runs the *same* eased tween backward
(the natural scrub symmetry, not a forced "snap shut"). This is the recorded fix
and the recorded component **must not reintroduce a re-close**.

**ZERO image overlap by construction.** Because each beat is a separate tall band
with its own sticky stage, only **one** contained render is ever inside its reveal
window — no two render PHOTOS are mid-slice on the same screen. Beats **alternate
render side** (left / right / left via `.beat--right`) so the eye travels — the
SAISEI editorial rhythm.

## The climax pairing (lifestyle-climax beat)

The last beat is the **climax**. Its main render slices open and **holds**; then a
**small inset detail render** (`#inset`, ~27vw, 3:2) slices open **L→R beside it**
— scheduled at `0.62` of the beat timeline, **after** the main is full at
`sliceDur (0.55)` (never two mid-slice at the same instant). This is the SAISEI
**big+small two-scale pairing** that lands the section.

## The no-plate fix (the BUG-B fix — preserved EXACTLY)

The slab's (and inset's) backing colour is the **page cream**
(`--render-back:var(--cream)`), never a dark/beige plate. While closed the slot
reads as clean cream; the photo slices in **onto cream**. Renders are
**eager-preloaded** (`new Image(); loading="eager"; decoding="async"`) so the
slice always opens on a **painted image** — no grey/beige placeholder rectangle
ever shows. The recorded component carries this fix; the closed state is clean
cream, not a plate.

## Reduced-motion / narrow path

`prefers-reduced-motion: reduce` OR `max-width:820px` sets `.is-static` on the
stack: the sticky stages flatten, every slab is forced **fully open**
(`clip-path:inset(0 0 0 0)!important`), the micro-parallax and light edges are
killed, and the beats collapse to a **block-stacked legible layout** (render
`aspect-ratio:4/3`, inset 3:2, text `max-width:46ch`). No scrub, no motion. The
probe passes via the static branch (`3 slabs && 3 beats`).

## Motion contract (perf)

`motion_props: [transform, opacity, clip-path]` only. The reveal is **clip-path +
transform/opacity on scrub** — no `mix-blend`, no `backdrop-filter` over the
scrubbed surface, no `video.currentTime`, no WebGL. `owns_pin:false` — these are
plain scrubbed ScrollTriggers over each beat band (the sticky stage is CSS
`position:sticky`, NOT a ScrollTrigger pin), so it composes under a section that
may pin elsewhere without fighting a pin budget.

## How it is recorded (reproduction shape)

The 5-artifact `official` set: `component.js` (the byte-faithful slice engine —
real `entry.call`, the per-beat clip slice + pixel-snap + light-edge + micro-
parallax + masked-line text + climax inset pairing + the sticky-stage stacked
no-reclose logic + reduced-motion path + `__LAB_OK__` probe, no magic numbers
inline: `start`/`end`/`scrub`/`sliceDur`/`parScale` are the knobs),
`component.css` (the recorded SAISEI cream / sticky beat-stage / contained
~50vw render-slab / text-features / divider CSS, with the no-plate fix — closed
state clean cream), `tokens.json` (the knob contract: render ~50vw, cream-air
ratio, slice ease/duration, climax pairing, scrub), `lab.html` (loads
`component.js`+`component.css`, calls `init` with real QUADRO content pointing at
`renders/`, library `__LAB_OK__` probe), and a green `scripts/library-verify.mjs`.

## variants

### horizontal-split (the base reading)
The recorded, restored slc-h2 IS the `horizontal-split` reading — the calm L→R
architectural slice over the **contained ~50vw** cream slot, in the sticky stage.
This is the base; no fork.

### vertical-line-sweep (`variants/vertical-line-sweep/`)
A params-and-engine delta where the slice axis turns **vertical, top→bottom**: a
luminous warm **scan-line descends** from the top edge of each render to the
bottom and the image is **revealed in its wake** (clip-path bottom-inset travels
top→bottom), on the same clean cream field, contained render + serif. The vertical
cousin of the horizontal slice. Recorded 1:1 from owner-chosen
`apps/quadro/public/slide-lab/slc-v3-topdown-line-sweep.html`. See
`variants/vertical-line-sweep/variant.recipe.md`.
