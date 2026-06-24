---
id: slicer-reveal
name: "Slicer reveal (SAISEI horizontal slice)"
level: 1
kind: component
status: official
entry:
  call: "SlicerReveal.init({ stackSel:'#stack', acts:[{ img, alt, side:'left'|'right', chip, eyebrow, lines:[a,b], body, meta, inset?:{ img, alt, cap }, climax?:bool }], start:'top 82%', end:'top 24%', scrub:0.8, sliceDur:0.62, parScale:1.06 })   # The REAL slc-h2 entry is an inline IIFE that reads three .act/.slab bands already in the DOM and builds one scrubbed slicer timeline each. Recorded faithfully as a window-global init(opts). If acts[] is omitted (or the stack already holds .act>.slab markup) the engine drives whatever slc-h2-shaped DOM is present (.stack > .act[.act--right] > .slab > img/.edge/.chip + .text-col, climax act carries #inset) — the SMALLER faithful change. The motion math (per-act clip-path inset(0 100% 0 0) -> inset(0 0 0 0) L->R slice on a scrubbed ScrollTrigger, the pixel-snap that kills the expo asymptote, the stacked NO-RECLOSE logic, the 1.06->1.0 micro-parallax, the light-edge ride, the masked-line text rise, the climax big+small inset pairing, reduced-motion / narrow static path) is byte-faithful to slc-h2 and is NOT rewritten to fit this signature."
  module: iife
  returns: "{ n, timelines, refresh, kill } | { reduced:true, n, refresh, kill } | null"
meaning:
  what: "A SAISEI-grade editorial showcase where each CONTAINED render (~42-50vw) is REVEALED by a hard-edged horizontal clip that opens LEFT->RIGHT (clip-path inset(0 100% 0 0) -> inset(0 0 0 0)) on a generous cream field, a thin light-line riding the leading edge; the render stays OPEN/STATIC once sliced (stacked scroll — never re-closes) while the opposite serif text-column resolves (eyebrow + masked lines rise + meta), acts alternating render side; the climax pairs the big render held open with a SMALL inset detail that slices open beside it."
  when: "A calm-luxury project/features showcase where each render should be REVEALED by an architectural slice on generous cream air — contained renders, alternating render/text rhythm, a thin divider, Fraunces serif. The 'open it like a drawing' editorial read, one render arriving per scroll band."
  lands: "A genuine SAISEI award-page read: renders open like architectural drawings on cream restraint, the serif headline resolving alongside, the big+small pairing landing the climax — premium editorial, never a slideshow-cut, never clutter."
  not_when: "Full-bleed cinematic takeover or a vertical film-advance of big heroes (use vertical-slide, or depth-stack for planes pushing through Z), or a horizontal card deck swiped sideways (use cards-swipe). Also not for flat index/conversion sections where motion must drop."
source:
  grammar: "QUADRO slide-lab — owner-approved, now-fixed slc-h2 horizontal split slicer reveal (SAISEI grade); the contained-render cream slot + L->R architectural slice + stacked no-reclose acts + climax big+small pairing"
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
variants: [horizontal-split]
params_ref: tokens.json
files: [RECIPE.md, component.js, component.css, lab.html, tokens.json]
acceptance:
  - "render revealed by horizontal L-to-R clip slice, eased, no jerk: clip-path inset(0 100% 0 0) -> inset(0 0 0 0) on expo.out, scrub:0.8, pixel-snapped exactly-full at slice end (kills the expo asymptote so no perpetual 99.5%)"
  - "revealed render STAYS static (no re-close) — SAISEI stacked scroll: each act owns its OWN scrubbed ScrollTrigger over its band, once open the render simply scrolls with the page; there is NO re-cover tween (the bug fix is preserved — re-close is NOT reintroduced)"
  - "ZERO image overlap: each act is its own full-height band, so only one render is in its reveal window at a time; the climax inset slices open only AFTER the main render is settled (never two mid-slice at once)"
  - "no visible placeholder plate — photo opens on clean cream: the slot backing IS --render-back = --cream (NO dark/beige plate), renders eager-preloaded (new Image, loading=eager) so the slice opens on a painted image"
  - "SAISEI sizing: contained render + ~55% cream air + Fraunces serif + alternating text-features: render column ~42-50vw with cream gutter, headline in Fraunces, eyebrow/meta in sans, thin --hair divider over meta, acts alternate render side (left/right/left)"
  - "reduced-motion/narrow collapse to static legible layout: prefers-reduced-motion OR <=820px sets .is-static, slices FULLY OPEN (clip inset(0 0 0 0)), no scrub, no edge, block-stacked legible layout"
verify: "lab.html#__LAB_OK__"
---

# slicer-reveal — Slicer reveal (SAISEI horizontal slice)

> **status: official.** Recorded 1:1 from the owner-approved, now-fixed QUADRO
> prototype `apps/quadro/public/slide-lab/slc-h2-split-reveal.html`. This is a
> SAISEI-grade EDITORIAL showcase: contained renders sit on a dominant cream
> field and are **revealed by a hard-edged horizontal slice that opens
> left→right**, then **stay open** as you scroll (stacked scroll, no re-close),
> alternating with a right-/left-aligned serif text-feature over a thin divider.
> It is its OWN component (NOT a cards-swipe or vertical-slide variant):
> cards-swipe swipes a deck **horizontally across a flat track**; vertical-slide
> advances big hero cels **up the page on Y** with a held climax; slicer-reveal
> **opens each contained render in place via a clip-path slice on cream** and
> leaves it open — the "architectural drawing reveal" read.

## The SAISEI grammar (what `component.css` owns)

The whole surface is **cream paper restraint** — `--cream:#EDE6D4` is the dominant
pixel (>=55% of every beat), with a barely-there warm radial vignette behind the
stack and **zero ghost/background typography**. The book is set in **Fraunces**
(serif display) for headlines, **Inter** for eyebrow/meta/body.

**Four render-size slots** carry the SAISEI sizing discipline:

1. **Main render column** — `height:min(82vh,700px)`, contained to ~**50fr** of
   the act grid (≈ 42–50vw), hugging the page with a small cream gutter.
2. **Cream air column** — the opposite ~**42fr** holds the text-feature; the
   `clamp(40px,6vw,96px)` centre axis is pure cream gutter. Cream + gutter keep
   the render from ever reading full-bleed.
3. **Small inset detail** — `width:min(27vw,300px); height:min(20vh,180px)` (~3:2),
   the SAISEI **big+small pairing** at the climax act.
4. **Static collapse slot** — under reduce-motion / `<=820px` the render becomes a
   block `aspect-ratio:4/3` and the inset `min(70vw,360px)` 3:2, fully open.

**Cream-air ratio.** The act grid is
`var(--mx) | 50fr | clamp(40px,6vw,96px) | 42fr | var(--mx)` (mirrored on
`.act--right`). The render takes the 50fr lane; everything else — the two `--mx`
margins, the centre axis, and the 42fr text lane minus its 36ch headline — reads
as cream air. By construction the cream surface stays the **dominant ground**
(~55%+), which is the SAISEI restraint the technique is named for.

**The thin divider.** Each text-feature closes on a `border-top:1px solid
var(--hair)` over the `.beat-meta` line — the SAISEI hairline rule that anchors
the meta to the cream.

## The slice mechanic (what `component.js` owns)

Each render is a `.slab` (a hard `overflow:hidden` clip box whose **backing IS the
page cream** — `--render-back:var(--cream)`, the no-plate fix). At rest the slab
is **closed**: `clip-path: inset(0 100% 0 0)` — clipped from the right down to a
0-width sliver at the left, so only a 1px seam shows on clean cream.

As the act scrolls up into view, ONE scrubbed timeline slices it **open
left→right**:

```
closed:  clip-path: inset(0 100% 0 0)     (sliver on cream)
open:    clip-path: inset(0 0 0 0)        (full contained render)
```

- The slice eases on **`expo.out`** (`E_SLICE`) over `duration:0.62`, scrubbed
  (`scrub:0.8`) — a clean, perfectly-vertical, **anti-aliased architectural cut**:
  no blur, no gradient wipe.
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

The page is **three full-height acts stacked vertically**. **Each act owns its OWN
scrubbed `ScrollTrigger`** (`start:"top 82%"`, `end:"top 24%"`). As an act enters,
its render slices open **once**; once open it **STAYS OPEN / STATIC** and simply
scrolls with the page as the next act comes up below it.

**There is NO re-cover tween.** The prior render never re-closes; scrolling down
does not re-cover anything. Reverse scroll re-runs the *same* eased tween backward
(the natural scrub symmetry, not a forced "snap shut"). This is the recorded fix
and the recorded component **must not reintroduce a re-close**.

**ZERO image overlap by construction.** Because each act is a separate full-height
band, only **one** render is ever inside its reveal window — no two render PHOTOS
are mid-slice on the same screen. Acts **alternate render side** (left / right /
left via `.act--right`) so the eye travels — the SAISEI editorial rhythm.

## The climax pairing (lifestyle-climax beat)

The last act is the **climax**. Its main render slices open and **holds**; then a
**small inset detail render** (`#inset`, ~27vw, 3:2) slices open **L→R beside it**
— scheduled at `0.66` of the act timeline, **after** the main is full (never two
mid-slice at the same instant). This is the SAISEI **big+small two-scale pairing**
that lands the section.

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
stack: every slab is forced **fully open** (`clip-path:inset(0 0 0 0)!important`),
the micro-parallax and light edges are killed, and the acts collapse to a
**block-stacked legible layout** (render `aspect-ratio:4/3`, inset 3:2, text
`max-width:46ch`). No scrub, no motion. The probe passes via the static branch
(`3 slabs && 3 acts`).

## Motion contract (perf)

`motion_props: [transform, opacity, clip-path]` only. The reveal is **clip-path +
transform/opacity on scrub** — no `mix-blend`, no `backdrop-filter` over the
scrubbed surface, no `video.currentTime`, no WebGL. `owns_pin:false` — these are
plain scrubbed ScrollTriggers over each act band (no pin), so it composes under a
section that may pin elsewhere without fighting a pin budget.

## How it is recorded (reproduction shape)

The 5-artifact `official` set: `component.js` (the byte-faithful slice engine —
real `entry.call`, the per-act clip slice + pixel-snap + light-edge + micro-
parallax + masked-line text + climax inset pairing + the stacked no-reclose logic
+ reduced-motion path + `__LAB_OK__` probe, no magic numbers inline:
`start`/`end`/`scrub`/`sliceDur`/`parScale` are the knobs), `component.css` (the
recorded SAISEI cream / render-slab / text-features / divider CSS, with the
no-plate fix — closed state clean cream), `tokens.json` (the knob contract:
render vw, cream-air ratio, slice ease/duration, climax pairing, scrub),
`lab.html` (loads `component.js`+`component.css`, calls `init` with real QUADRO
content pointing at `renders/`, library `__LAB_OK__` probe), and a green
`scripts/library-verify.mjs`.

## variants: horizontal-split

The recorded slc-h2 IS the `horizontal-split` reading — the L→R architectural
slice over the contained cream slot. A future params-over-base delta could express
a top→bottom slice or a different act count without forking `component.js`, but the
recorded, owner-approved technique is the horizontal split, so it is the base here.
