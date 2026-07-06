---
id: media-step-switch
name: "Full-bleed media+text stepper (film/quote)"
level: 1
kind: component
status: official
entry:
  call: "MediaStepSwitch.init(target, options)  // target = the pinned stage el or selector (default '#pin'); the engine BUILDS the two full-bleed GPU media layers + the four different-format text moments + chrome INTO it. options all optional: { steps, lerp, pinFactor, dwell, wipeStart, wipeEnd, kenFrom, kenStep, manageLenis }. (alias: mediaStepSwitch(target, options))"
  module: iife
  returns: "{ trigger, moments, layers, lenis, refresh, destroy }  (or { static:true, moments, destroy } in the reduced-motion / narrow branch)"
meaning:
  what: "A PINNED full-bleed MEDIA STEPPER. The full-bleed render/video is the WHOLE background; typographic text steps float OVER it. Each step is a DIFFERENT text TYPE — (1) BIG STATEMENT, (2) VIDEO BEAT, (3) QUOTE, (4) NUMBER/FACT — each with its own font/scale/position, woven with a looping VIDEO beat (the river clip, the emotional centre). Clean sequence per beat: the TEXT settles FIRST, a clear PAUSE, THEN the media crossfades. The swap is an OPACITY crossfade of TWO stacked full-bleed GPU layers (outgoing underneath fully opaque, incoming on top fading 0->1) so media is never see-through (no blank) and never a diptych (no seam). The lite video lives in layer B (poster <img> + <video> toggled; NEVER currentTime-scrubbed, paused off-stage). A Lenis-smoothed scroll drives a PURE render(progress) over a generously-long pin; quantized GPU-only writes (opacity + a tiny monotonic ken-burns) keep it buttery."
  when: "A PROOF / SHOW act where one full-bleed render is the WHOLE frame and the message is carried by a few DIFFERENT typographic moments over it — a big statement, then a quiet film beat, then a felt quote, then one hard number — and you want the media itself to swap in place beat-by-beat as a held film, not a card grid. The cinematic in-place stepper, the counterpart to the pin-LESS vertical stacked-pairs rhythm."
  lands: "Each claim arrives on its own held cinematic frame: the words settle over the full render, a beat passes, then the whole image crossfades to the next while the next text type rises in. The looping river beat reads as the emotional centre. It feels like a short film you scrub through, expensive and authored, never a busy carousel and never a moment where the screen blanks or shows two images at once."
  not_when: "A quiet editorial route where each beat should be its OWN full-screen section the eye walks DOWN the page (use stacked-pairs, pin-LESS). A hero cover. A conversion gate. A section that must NOT be pinned, or a section that already sits under another pin in the same beat (one pin owner per section). Never reach for video.currentTime scrubbing."
source:
  grammar: "QUADRO slide-lab — msw4a film/quote: a pinned full-bleed media stepper whose text steps are four DIFFERENT typographic types woven with a looping lite-video beat (the cinematic in-place counterpart to the pin-less stacked-pairs rhythm)"
  recording: "apps/quadro/public/slide-lab/msw4a-film-quote.html"
  registry_ref: ["x:pinned-media-stepper, точний T-ID уточнюється у спринті-0 (хибний T-310 знятий 2026-07-05)"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis 1.1.13"
webgl: false
motion_props: [transform, opacity]
trigger: "ONE pinned scroll-scrub ScrollTrigger (scrub:1, pin:true), Lenis-smoothed, reversible; pin length = innerHeight*(N-1)*pinFactor"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
page_beat: [proof, material]
combines_with: [reveal, splitLines, counter, scroll-indicator]
anti_combos: [second-pin, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a PINNED full-bleed media stepper (owns_pin TRUE; exactly one ScrollTrigger pins) — the render/video is the WHOLE background, text floats over it"
  - "each step is a DIFFERENT text TYPE (BIG STATEMENT / VIDEO BEAT / QUOTE / NUMBER-FACT), each entering from its own direction (transform-only); NOT a uniform benefit 1-2-3 card"
  - "the sequence WEAVES photos with a looping VIDEO beat (the lite river clip), present and muted-autoplay-loop, paused off-stage, NEVER currentTime-scrubbed"
  - "clean sequence per beat: text settles FIRST -> PAUSE -> media crossfades; outgoing text fades FULLY out before the incoming reads (one text moment at a time, no ghost)"
  - "SWAP = an OPACITY crossfade of TWO stacked full-bleed GPU layers (outgoing underneath always opaque, incoming on top fades 0->1); never see-through (no blank), never a diptych (no seam); NOT a per-frame clip-path on a decoding video"
  - "GPU smoothness intact: each .layer is its own compositor layer (will-change:transform,opacity; translateZ(0); backface-visibility:hidden); only opacity (swap) + transform (a tiny monotonic ken-burns) animate; quantized skip-unchanged DOM writes; eager img.decode()"
  - "render(prog) is a PURE fn of progress (scrubbed onUpdate + render(0) at init); reverse-safe, correct on load/jump"
  - "ONE smoother: Lenis 1.1.13 lerp 0.09 smoothWheel -> gsap.ticker -> ScrollTrigger.update, lagSmoothing(0)"
  - "transform / opacity ONLY — no WebGL, no mask-composite, NO backdrop-filter over the moving media, no mix-blend over the scrubbed surface, no video.currentTime"
  - "reduced-motion / <=820px collapse to a static legible vertical deck of the four shots (no Lenis, no pin, no triggers); the video autoplays inline"
verify: "lab.html#__LAB_OK__"
---

# media-step-switch — full-bleed media+text stepper (film/quote)

> **BASE = msw4a-film-quote** (owner-approved, gate-passing). A **PINNED
> full-bleed MEDIA STEPPER**: the full-bleed render/video is the **whole
> background**, and typographic text steps float **over** it. Each step is a
> **DIFFERENT text TYPE** — **BIG STATEMENT**, **VIDEO BEAT**, **QUOTE**,
> **NUMBER/FACT** — each with its own font / scale / position, **woven with a
> looping VIDEO beat** (the river clip, the emotional centre). The clean sequence
> per beat: the **text settles first**, a clear **pause**, **then** the media
> crossfades. A Lenis-smoothed scroll drives a **pure** `render(prog)` over a
> generously long pin.
> Source recording: `apps/quadro/public/slide-lab/msw4a-film-quote.html`.

## STRICT 1:1 — what msw4a shows, and nothing else
The base is **a pinned full-bleed media stage whose text moments are four
different typographic types woven with a looping video beat, swapped by an
opacity crossfade of two GPU layers.** There is **no wavy seam, no clip-path on
the full surface, no glass card, no uniform benefit card, no deck/morph finale.**
Those belong to other techniques (or to the stale pre-award draft this replaces)
and must not be added here. (This RECIPE intentionally **replaces** the earlier
"wavy-seam media stepper" draft — that base was pre-award.)

## The move (what the eye sees), per beat
1. **Hold** — the current full render fills the frame; its text type (statement /
   video line / quote / number) is settled over it. A long calm matched hold on
   **one** GPU layer (cheap to composite).
2. **Text out** — the outgoing text fades **fully** out (and drifts opposite its
   entry) **before** the incoming reads, so exactly one heading is ever on screen.
3. **Media crossfade** — in a **tight** back-third window the incoming layer
   (on top) fades `0 -> 1` over the outgoing (underneath, still fully opaque). The
   underneath is always opaque, so the media is never see-through; both fill the
   same rect, so it reads as a crossfade, never a diptych.
4. **Text in** — the next text type rises in **from its own direction**
   (transform-only), synced to the back of the crossfade.
5. **Video beat** — when the river step dominates, the **video** paints (over its
   poster) and a small **Відео** tag lights; the video is muted-autoplay-loop and
   is **paused** the moment it leaves the stage. We **never** scrub
   `video.currentTime`.
6. **Ambient** — a slow **monotonic ken-burns** (scale `1.04 -> 1.04+0.05`) drifts
   on the layer imgs across the whole pin; image-only, never resets, never blanks.
7. **Reverse** — scrubbing back runs the **same pure** `render(prog)` backward.

## Why it cannot ghost and cannot blank (the key idea)
The swap is an **opacity crossfade of two stacked full-bleed layers**, NOT a
clip-path on a decoding video (a video re-rastered every frame under a per-frame
clip tanks fps). The **outgoing layer stays fully opaque underneath** the whole
beat, so there is never a transparent moment (**no blank**). Both layers fill the
**identical rect**, so the overlap fraction is ~1 and it reads as a **crossfade,
not a seam/diptych**. On the text side, the outgoing fades **fully** out before
the incoming reads, so there is **never a double-exposure** of two headings.

## The smoothness work (keep it byte-faithful)
This base passes a 4x-CPU-throttled smoothness gate (0 blank, 0 seam, 60fps). The
reasons, all preserved verbatim:
- **Every `.layer` is its own GPU compositor layer** — `will-change:transform,opacity;
  transform:translateZ(0); backface-visibility:hidden`. We animate **only**
  `opacity` (swap) and `transform` (the tiny ken-burns), so the layers never
  repaint on the main thread.
- **NO `backdrop-filter` anywhere** over the moving media; **NO `clip-path`** on
  the full-screen surface; **NO mix-blend** over the scrubbed surface. The text
  blocks have **no live blur** (only `text-shadow`, which composites cheaply). The
  grade + side scrim live in **one shared overlay** above both layers, so a swap
  blends just two image textures (not 2 images + 2 gradients).
- **Quantized DOM writes with skip-unchanged caches** — opacity/x/y/scale and the
  tick/counter/tag are rounded and written **only when they change**, so identical
  frames do not re-invalidate style.
- **Eager `img.decode()` up front** for every still + the poster, so no image
  decode happens on the main thread during the scroll.
- **The lite video** (`renders/clip-river-lite.mp4`, ~5 MB light decode) is
  muted-autoplay-loop, `playsinline`, **paused off-stage**, **never**
  `currentTime`-scrubbed.

## The pin + the smoother
- **ONE pinned ScrollTrigger** — `start "top top"`, `end "+= innerHeight*(N-1)*pinFactor"`,
  `pin:true`, `pinSpacing:true`, `scrub:1`, `anticipatePin:0`. The **generous**
  pin length makes the per-frame delta tiny (buttery). `owns_pin` is **true**.
- **ONE smoother** — Lenis 1.1.13 `lerp:0.09` (heavier glide) `smoothWheel` ->
  `gsap.ticker.add(t=>lenis.raf(t*1000))` -> `lenis.on('scroll', ScrollTrigger.update)`;
  `lagSmoothing(0)`; `window.__lenis` exposed. (`manageLenis:false` lets a host
  page own the single Lenis; then the component only wires its pinned trigger.)
- **`render(prog)` is PURE** — driven from the scrubbed `onUpdate` **plus
  `render(0)` once at init** (reverse-safe, correct on load/jump). Do not animate
  the steps on their own timeline.

## DOM structure (msw4a)
```
.intro                      (kicker · serif title · scrollcue)
.pin #pin                   → JS builds the stage into it (empty host)
  └ .media
     ├ .layer #layerA       full-bleed GPU layer (even-parity steps)  → img#imgA
     ├ .layer #layerB       full-bleed GPU layer (odd-parity steps)   → img#imgB + video#vid (poster)
     ├ .grade               ONE shared grade + side scrim above both layers
     ├ .stage-text          the four DIFFERENT text-type blocks (stacked, one lit)
     │  ├ .moment.m-statement   BIG STATEMENT (serif headline lower-left)
     │  ├ .moment.m-video       VIDEO BEAT (small italic line, centred low)
     │  ├ .moment.m-quote       QUOTE (centred italic, thin bronze rules)
     │  └ .moment.m-number      NUMBER/FACT (one big figure + unit + foot)
     ├ .vtag #vtag          the "Відео" tag (lit only on the video beat)
     ├ .counter #counter    "01 / 04"
     ├ .stepper #stepper    horizontal step ticks (one filling across each beat)
     ├ .credit              "Візуалізація"
     └ .progress > .progress__fill   the right-edge progress hairline (scaleY)
.outro                      (serif closing line)
.static #static             (filled in the reduced-motion / narrow branch)
```
`MediaStepSwitch.init('#pin', opts)` builds this into the empty `#pin` host (the
two layers + four moments + chrome) and wires the single pinned trigger driving a
pure `render(prog)`. No-JS / reduced-motion / `<=820px` shows a static readable
vertical deck of the four shots (the video autoplays inline).

## Entry point (the truth on disk)
- `MediaStepSwitch.init(target, options)` — resolves the pin host (el or selector,
  default `#pin`), builds the stage from `options.steps` (the faithful msw4a
  4-step photo→VIDEO→quote→number deck by default), wires the Lenis smoother
  (unless `manageLenis:false`), and creates the single pinned ScrollTrigger
  driving the pure `render(prog)`. Returns
  `{ trigger, moments, layers, lenis, refresh, destroy }` (or
  `{ static:true, moments, destroy }` in the reduced-motion / narrow branch).
  A back-compat alias `mediaStepSwitch(target, options)` calls the same `init`
  (the legacy ESM base exposed a `mediaStepSwitch(...)` callable).
- `options` are **all optional**: with none it drives the msw4a `#pin` ids and the
  faithful steps.

## Hard rules
- **A PINNED full-bleed media stepper.** `owns_pin` is **true**; exactly one
  ScrollTrigger pins. One pin owner per section (do not stack a second pin).
- **Crossfade two GPU layers, never clip a video.** The swap is an opacity
  crossfade of two stacked full-bleed layers; **no `clip-path` on the full
  surface**, **no `video.currentTime`** scrub.
- **Pure `render(progress)`** — drive it only from the scrubbed `onUpdate` (+ once
  at init). Reverse-safe.
- **ONE smoother:** Lenis 1.1.13 `lerp:0.09` → `gsap.ticker` → `ScrollTrigger.update`,
  `lagSmoothing(0)`.
- **Display = Fraunces serif**; eyebrow / label / cite / tag / counter / credit =
  **Inter.**
- **No WebGL**, no mask-composite, **no `backdrop-filter` over the moving media**,
  no mix-blend over the scrubbed surface. `prefers-reduced-motion` OR `<=820px` →
  static legible vertical deck (no Lenis, no pin, no triggers).
- Ukrainian Fedoriv copy, **zero em-dashes** in visible copy.

## Easing & timing
- Two registered eases: `CustomEase 'air' = 0.25,0.74,0.22,0.99` (the text
  in/out drift) and `CustomEase 'glide' = 0.45,0.05,0.2,1` (the media crossfade,
  a gentle ease-in-out).
- Per beat (`f` 0..1): a long **matched hold** `0.00 -> 0.46`; outgoing **text out**
  `0.40 -> 0.60`; the **media crossfade** `wipeStart 0.50 -> wipeEnd 0.82`;
  incoming **text in** `0.58 -> 0.86`; settled `0.86 -> 1.00`. All N-1 beats play
  over `dwell` (0.88) of the scroll so the last step has landed before the pin
  releases.
- Ken-burns `scale = kenFrom (1.04) + kenStep (0.05) * progress`, monotonic across
  the whole pin — slow, continuous, never resets.

## Gotchas
- **Do not clip the video / scrub currentTime.** The identity is the **opacity
  crossfade of two GPU layers**; a per-frame clip on a decoding video tanks fps.
  The video only ever toggles visibility + play/pause.
- **Keep the outgoing layer opaque underneath** the whole beat — that is what
  prevents a blank. Only the **incoming** (on top) fades in.
- **Keep `render(prog)` pure** — drive it only from `onUpdate` (+ once at init);
  do not run the steps on their own timeline, or they desync from the scrubbed
  scroll.
- **Keep the quantized skip-unchanged writes + eager decode** — they are the
  smoothness work; removing them re-introduces decode spikes and per-frame style
  invalidations.
- **No `backdrop-filter` over the moving media** (the old draft's glass card was a
  perf trap). The text reads via `text-shadow` over the shared grade only.
- **One Lenis per page.** Dropped into a site that already runs Lenis, pass
  `manageLenis:false` so a second smoother is not created.
- **`ScrollTrigger.refresh()` after height change** (resize / orientation, and
  once images decode) so the pin distance is measured against the final layout.

## Variants
- **none.** A single technique with no direction/skin knobs that warrant a
  params-over-base variant (the tunables in `tokens.json` are pacing / extent
  knobs — pin length, dwell, crossfade window, ken-burns — not distinct
  prototypes).

## Files
- `lab.html` — self-contained msw4a demo (pinned full-bleed media stepper, four
  text types, the looping video beat, static fallback, `__LAB_OK__` probe; asserts
  it owns a pin and the video is present).
- `component.css` / `component.js` — drop-in canonical copies (the engine builds
  the two-layer stage + four moments + chrome and wires the single pinned trigger
  driving the pure `render(prog)`).
- `tokens.json` — the knob contract.
