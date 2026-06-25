---
id: stacked-pairs
name: "Stacked pairs (text-left / render-right per section)"
level: 1
kind: component
status: official
entry:
  call: "StackedPairs.init(target, options)  // target = a container el or selector (default '#pairs'); if it already holds .pair sections they are used verbatim, else the pairs are BUILT into it from options.slides. options all optional: { slides, lerp, revealStart, revealEnd, kenStart, kenEnd, kenFrom, kenTo, revealSpan, textSpan, manageLenis }"
  module: iife
  returns: "{ triggers, sections, lenis, refresh, destroy }  (or { static:true, sections, destroy } in the reduced-motion / narrow branch)"
meaning:
  what: "A VERTICAL RHYTHM of distinct full-screen sections (NOT a pinned stepper). Each section = TEXT on the LEFT (~38%) + a BIG contained fixed-size RENDER on the RIGHT (~62%, 84vh, clean rounded-left frame, ~2cm gap, a thin bronze rule on the far-left text edge, an index eyebrow + Fraunces serif heading with an italic-bronze keyword + sub, a small tag bottom-right of the render). The render is ALWAYS on the right. You scroll from one PAIR to the NEXT. Each section's render + text REVEAL smoothly as the section enters the viewport (scrub-driven, reverse-safe) — the render rises + fades, the bronze rule fades + grows, the text bits rise in a gentle air-eased stagger — and a SLOW continuous monotonic ken-burns runs on the render while it is on screen. A Lenis-smoothed scroll drives a PURE render(progress) per section. NO pin, NO swap, NO clip."
  when: "An editorial route of paired beats — a quiet day/night/terrace/material/aerial/interior sequence, a numbered set of one-render-one-thought sections — where you want each pair to read as its own calm full-screen statement and the eye to walk DOWN the page from one to the next, rather than being pinned and stepped through swaps in place. The restful alternative to a pinned slicer/stepper."
  lands: "Each pair arrives as its own composed editorial frame as you scroll into it — render settling on the right, words rising on the left, the photo breathing on a slow ken-burns — and then you move on to the next. It reads as an unhurried, expensive vertical magazine spread, never a busy in-place carousel."
  not_when: "An indexed render-deck that must SWAP one big render in place beat-by-beat (use slice-clip's pinned clip-wipe or focus-render-switch's pinned crossfade stepper). A single hero. A section that must be pinned. Never reach for video.currentTime scrubbing."
source:
  grammar: "QUADRO slide-lab — frs11 stacked pairs: the frs7 text-left / render-right composition turned into a pin-LESS vertical rhythm (the calm alternative to the pinned slicer/stepper)"
  recording: "apps/quadro/public/slide-lab/frs11-stacked-pairs.html"
  registry_ref: []
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis 1.1.13"
webgl: false
motion_props: [transform, opacity]
trigger: "per-section scrubbed ScrollTriggers (scrub:true), Lenis-smoothed, reversible — NOT pinned"
timing_layer: [B-entrance, A-ambient]
owns_pin: false
page_beat: [show, material]
combines_with: [reveal, splitLines, scroll-indicator, parallax-depth]
anti_combos: [second-pin]
gated_by: [R_anti_combos, R_perf_limits, R_timing_layers]
variants: [slice-lr, slice-td]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a VERTICAL RHYTHM of distinct full-screen .pair sections, scrolled one to the NEXT — NOT a pinned stepper (owns_pin false; no ScrollTrigger pins)"
  - "frs7 composition per pair: text LEFT ~38%, BIG contained fixed-size render RIGHT ~62% (84vh, rounded-left frame), ~2cm gap, far-left bronze rule, index eyebrow + Fraunces serif heading (italic-bronze keyword) + sub, tag bottom-right; render ALWAYS on the right"
  - "each section reveals on a PURE render(self.progress) from a scrubbed ScrollTrigger (start 'top 85%' end 'top 35%') + an init paint at load — render rises + fades (opacity only; IMG opaque), bronze rule fades + grows, text bits stagger; reverse-safe"
  - "a SEPARATE monotonic ken-burns ScrollTrigger (start 'top bottom' end 'bottom top' scrub) scales the img 1.06 -> 1.12 ease none; image-only, never resets, never blanks"
  - "NO toggleActions — the first frs11 used a toggleActions tween and it failed to fire on load; the fix is the pure scrubbed render(progress) + init paint. Reintroducing toggleActions is the bug."
  - "ONE smoother: Lenis 1.1.13 lerp 0.1 smoothWheel -> gsap.ticker -> ScrollTrigger.update, lagSmoothing(0)"
  - "transform / opacity ONLY — no WebGL, no mask-composite, no mix-blend / backdrop over the scrubbed surface, no video.currentTime"
  - "reduced-motion / <=820px collapse to a static legible stack (no Lenis, no triggers); on narrow the render stacks above the text"
verify: "lab.html#__LAB_OK__"
---

# stacked-pairs — text-left / render-right per section

> **BASE = frs11-stacked-pairs** (owner-approved: "це залишаємо"). A **VERTICAL
> RHYTHM** of distinct full-screen sections — **NOT a pinned stepper.** Each
> section is the frs7 composition: **TEXT on the LEFT** (~38%) + a **BIG contained
> fixed-size RENDER on the RIGHT** (~62%, 84vh, clean rounded-left frame, ~2cm
> gap, a thin bronze rule on the far-left text edge, an index eyebrow + Fraunces
> serif heading with an italic-bronze keyword + sub, a small tag bottom-right).
> The render is **always on the right.** You **scroll from one PAIR to the NEXT.**
> Each section's render + text **REVEAL** as it enters the viewport (scrub-driven,
> reverse-safe), and a **slow continuous monotonic ken-burns** runs on the render
> while it is on screen. A Lenis-smoothed scroll drives a **pure** `render(prog)`
> per section. **NO pin, NO swap, NO clip.**
> Source recording: `apps/quadro/public/slide-lab/frs11-stacked-pairs.html`.

## STRICT 1:1 — what frs11 shows, and nothing else
The base is **a quiet editorial vertical sequence of text-left / render-right
pairs, each revealing as it enters view.** There is **no pin, no in-place swap,
no clip wipe, no rail, no progress line, no second pin, no portrait take-over.**
Those belong to other techniques and must not be added here.

## The move (what the eye sees), per section
1. **Approach** — as the section rises into the lower-middle of the screen, the
   big render on the right rises (y 46→0) and fades in (opacity 0→1; the `<img>`
   itself is fully opaque), the thin bronze rule on the far-left fades in and
   grows (scaleY 0.6→1), and the three text bits (index eyebrow, serif title,
   sub) rise in a gentle **air**-eased **stagger** (each on a slightly later
   slice of the reveal).
2. **Settle** — the reveal completes by ~`revealSpan` (0.55) of the section's
   entrance travel and then **HOLDS** while the section is centred. It does not
   keep drifting.
3. **Breathe** — the whole time the section is on screen, a **slow continuous
   monotonic ken-burns** scales the render (1.06→1.12) on a **separate** trigger
   that spans the section's full pass through the viewport. Image-only; it never
   resets and never blanks.
4. **Next / reverse** — you scroll on to the next pair (no pin holds you).
   Scrubbing back runs the **same pure** `render(prog)` backward; the reveal
   un-plays.

## Why it is calm and cannot blank (the key idea)
There is **no swap and no clip** — each section owns exactly one render that is
always present and always opaque; only its `transform`/`opacity` move on entrance
and its `scale` drifts on the ken-burns. So there is never a transparent moment
(no ghosting) and never an empty moment (no blank). The page reads as an
**unhurried vertical magazine spread**, the restful counterpart to the pinned
slicer/stepper.

## The bug this technique encodes the fix for — NO toggleActions
The **first version of frs11 used a `toggleActions` tween** for the entrance and
it **failed to fire on load**: sections that were already in the viewport never
received their "enter" callback, so they stayed hidden. The **fix** — and the
whole reason the reveal is shaped the way it is — is a **PURE function of each
section's own viewport progress**, driven from a **scrubbed** ScrollTrigger's
`onUpdate` **plus painted once at init** from the trigger's current progress
(then that init trigger is killed). This is correct on load, on jump, and on
reverse. **Do not reintroduce `toggleActions`.**

## The two triggers per section (both `scrub:true`, neither pins)
| trigger | start / end | drives |
|---------|-------------|--------|
| **reveal** | `top 85%` → `top 35%` | `onUpdate: render(self.progress)` — the rise+fade of the render, bronze rule, and staggered text; plus an **init** trigger that paints once at load then is killed |
| **ken-burns** | `top bottom` → `bottom top` | `gsap.fromTo` the img `scale 1.06 → 1.12` `ease "none"` — monotonic across the whole pass, image-only, never resets |

## Hard rules
- **NOT a pinned stepper.** `owns_pin` is **false**; no ScrollTrigger pins. The
  reveal is per-section and in-view, not a pinned in-place timeline.
- **No swap, no clip.** One render per section, always present, always opaque;
  only `transform`/`opacity` (entrance) and `scale` (ken-burns) move. **No
  `video.currentTime`.**
- **Pure `render(progress)`, never `toggleActions`** (see above). Drive it only
  from the scrubbed `onUpdate` + once at init.
- **ONE smoother:** Lenis 1.1.13 `lerp:0.1` → `gsap.ticker` → `ScrollTrigger.update`,
  `lagSmoothing(0)`. (`manageLenis:false` lets a host page own the single Lenis;
  then the component only wires its triggers.)
- **Display = Fraunces serif**, big; index / sub / tag / meta = **Inter.**
- **No WebGL**, no mask-composite, no mix-blend / backdrop-filter over the
  scrubbed surface. `prefers-reduced-motion` OR `<=820px` → static legible stack
  (no Lenis, no triggers; the render stacks **above** the text on narrow).
- Ukrainian Fedoriv copy, zero em-dashes in visible copy.

## Easing & timing
- Reveal ease `CustomEase 'air' = 0.25,0.74,0.22,0.99` (gentle air; the same ease
  for the render rise, the bronze rule, and each staggered text bit).
- `revealSpan 0.55` — the render/bar reveal finishes by 55% of the entrance
  travel then holds. `textSpan 0.42` — each text bit reveals over 42% of the
  travel, offset (`-0.06 - k*0.05`) to a later slice for the stagger.
- Ken-burns `scale 1.06 → 1.12`, `ease "none"`, scrubbed across `top bottom →
  bottom top` (the section's full pass) — slow, continuous, monotonic.

## DOM structure (frs11)
```
.intro                      (kicker · serif title · scrollcue)
.pairs #pairs               → JS builds (or reads) one .pair per slide
  └ .pair                   grid-template-columns: 38% 62%
     ├ .pair__bar           the thin bronze rule on the far-left text edge
     ├ .pair__text          index eyebrow + serif title + sub (LEFT)
     │  ├ .pair__idx        "01 / 06"
     │  ├ .pair__title      Fraunces, italic-bronze <em> keyword
     │  └ .pair__sub        one-line sub
     └ .pair__media         the contained fixed-size render (RIGHT, 84vh)
        ├ img               object-fit cover (ken-burns scales this)
        ├ .grade            bottom gradient
        └ .pair__tag        the beat tag (bottom-right)
.outro                      (serif closing line)
```
`StackedPairs.init('#pairs', opts)` reads the `.pair` markup if present, else
builds it from `opts.slides` (the faithful frs11 6-render deck by default).
No-JS / reduced-motion / narrow shows a static readable stack.

## Entry point (the truth on disk)
- `StackedPairs.init(target, options)` — resolves the container (el or selector,
  default `#pairs`), uses any existing `.pair` markup or builds it from
  `options.slides`, wires the Lenis smoother (unless `manageLenis:false`), and
  creates the per-section reveal + ken-burns triggers driving a pure
  `render(prog)`. Returns `{ triggers, sections, lenis, refresh, destroy }` (or
  `{ static:true, sections, destroy }` in the reduced-motion / narrow branch).
  `options` are **all optional**: with none it drives the frs11 `#pairs` ids and
  the faithful slides.

## Gotchas
- **Do not pin.** This is the whole point of stacked-pairs vs slice-clip /
  focus-render-switch. If a section needs pinning, that is a different technique.
- **Never `toggleActions`** for the entrance — it does not fire for sections
  already in view on load. Keep the pure scrubbed `render(prog)` + init paint.
- **Keep the ken-burns on its OWN trigger** (`top bottom → bottom top`), separate
  from the reveal — it must be monotonic across the full pass and never reset
  when the reveal completes.
- **`render(prog)` must stay pure** — drive it only from `onUpdate` (+ once at
  init); do not animate the entrance on its own timeline, or it desyncs from the
  scrubbed scroll.
- **One Lenis per page.** If the section is dropped into a site that already runs
  Lenis, pass `manageLenis:false` so a second smoother is not created.

## Variants
- **none.** A single technique with no direction/skin knobs that would warrant a
  params-over-base variant (the tunables in `tokens.json` are calmness/extent
  knobs, not distinct prototypes).

## Files
- `lab.html` — self-contained frs11 demo (vertical pair rhythm, per-section
  reveal + ken-burns, static fallback, `__LAB_OK__` probe; asserts no pin).
- `component.css` / `component.js` — drop-in canonical copies (the engine builds
  or reads the `.pair` deck and wires the two pin-less triggers per section).
- `tokens.json` — the knob contract.
