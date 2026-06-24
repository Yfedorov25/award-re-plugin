# focus-render-switch — FOCUS-ON-RENDER pinned stepper

> Big media on the LEFT, a stack of headings on the RIGHT. The section
> **pins**; scroll advances through N steps. Each step swaps the render
> (crossfade + slow ken-burns), ticks the heading ticker (prev fades out
> top / current solid / next previewed below), sweeps the current
> heading's words with an accent colour, and bumps a step counter.
>
> Seen on: Naveera / Zera ("Fleet Operating System… → Real-time GPS… →
> AI-powered safety…"). One of the cheapest ways to make a feature list
> feel cinematic instead of a bullet grid.

## What it is (one sentence)
A pinned two-column "scrollytelling" stepper where a focused render on the
left cross-dissolves in sync with a vertically-ticking, word-illuminating
heading on the right.

## Frame-by-frame phases (per step)
1. **Hold** — current render fully visible (ken-burns scale crawling
   1.0→1.08). Focused heading is solid ink, its words already mostly lit;
   next heading sits below at ~40% opacity as a preview.
2. **Read sweep** — as you scroll within the step, the accent colour
   sweeps word-by-word across the focused heading (read-along feel).
3. **Tick** — past the `stepHold` threshold the next render crossfades in
   (~0.55s) while the heading stack slides up `headRise` px: old heading
   fades out the top, next heading rises into focus and goes ink-solid,
   and the *next-next* heading appears below as the new preview.
4. **Counter** — `01 → 02 …` increments at the swap.
Repeat for N steps, then the pin releases and the page continues.

## Easing + durations
- Single house ease **`air` = cubic-bezier(0.22,0.61,0.20,1)** (soft out),
  registered via CustomEase; used for the crossfade and ticker.
- Crossfade ~**0.55s**. Ken-burns is `ease:"none"` over ~4× the step
  length (a slow constant crawl, restarted on each active slide).
- The ticker layout and word-sweep are **scrubbed** (tied to scroll
  progress), not timed — so they feel locked to the wheel.

## Trigger
**Scroll-scrub on a pinned ScrollTrigger.** `start:"top top"`,
`end:"+=" + N*scrollPerStep*innerHeight`, `pin:true`, `scrub:true`.
Pin length scales with the number of steps. NOT in-view, NOT autoplay.

## Timing / stagger
- Pin distance = `N * scrollPerStep` viewport-heights (default 0.9vh each).
- Render swaps are **discrete** (snap at `stepHold≈0.78` of each step) so
  the image doesn't flicker mid-scroll; the heading ticker is **continuous**.

## DOM structure
```
section.frs                      ← gets pinned
  .frs__grid                     ← 48% / 52% CSS grid, vertically centred
    .frs__media                  ← left frame, bleeds off left edge
      .frs__slide.is-active > img   ← one per step (only one visible)
      .frs__slide          > img
      …
    .frs__count                  ← "01" counter in the seam gutter (optional)
    .frs__text
      .frs__stack                ← position:relative ticker container
        h2.frs__head             ← one per step; words wrapped in <span.w> by JS
        h2.frs__head
        …
```
**Contract:** slide count === head count, same order.

## Key CSS / GSAP that creates it
- **Concave seam (signature):** the media frame's right edge has a smooth
  bite where the paper column pushes in — a radial-gradient mask
  subtracted from the rectangle:
  ```css
  -webkit-mask:
     radial-gradient(120px 160px at 100% 50%, transparent 99%, #000 100%),
     linear-gradient(#000,#000);
  -webkit-mask-composite:source-out; mask-composite:subtract;
  ```
- **Render swap:** `gsap.to(slide,{opacity, ease:"air"})` + `is-active`
  class; ken-burns is `gsap.fromTo(img,{scale:1},{scale:1.08,ease:"none"})`.
- **Ticker:** every heading is `position:absolute; top:50%`; JS sets
  `opacity` and `yPercent` from signed distance `d = i - progress` so the
  three live slots (prev/cur/next) read as a vertical conveyor.
- **Word sweep:** headings are split into `<span class="w">`; JS toggles
  `.done` (passed → ink) and `.lit` (current word → accent) from
  sub-progress.

## Gotchas (what makes it look cheap if done wrong)
- **Don't scrub `video.currentTime`.** If a step's media is video, let it
  autoplay-loop and crossfade between `<video>`s — never seek on scroll.
- **Snap the image, scrub the text.** If the render also crossfades
  continuously it smears/flickers; gate the swap on `stepHold`.
- **Decode the next image early** (or it pops in grey). `loading="eager"`
  on at least the next slide, or preload; keep slides as `<img>` not
  background-image so the browser prioritises them.
- **`will-change` only transform/opacity**; never animate the mask or
  border-radius (forces repaint on a pinned, repainting surface — the
  same trap as QUADRO's mix-blend-over-scrub).
- **pinSpacing must be true** or the section after the pin jumps; recompute
  `end` on resize (`ScrollTrigger.refresh()`), it's `innerHeight`-based.
- **Heading max-width** (`18ch`) — without it long headings reflow and the
  ticker jitters as line-count changes between steps.
- **prefers-reduced-motion:** drop the pin entirely → render a static
  stacked list (component.js + CSS both handle this).
- Counter uses `font-variant-numeric:tabular-nums` so width doesn't twitch.

## Reusable parameters (the API)
`FocusRenderSwitch.init(target, {…})`
| param | default | meaning |
|---|---|---|
| `scrollPerStep` | `0.9` | viewport-heights of scroll per step (pin length = N×this) |
| `stepHold` | `0.78` | 0..1 of a step spent on the current render before the swap |
| `crossfade` | `0.55` | seconds for the render dissolve |
| `kenBurns` / `kenBurnsFrom` / `kenBurnsTo` | `true` / `1.0` / `1.08` | slow scale on active slide |
| `headRise` | `34` | px the heading ticker travels per slot |
| `accent` | `#1aa6c7` | word-sweep colour (also via CSS `--accent`) |
| `ease` | `"air"` | GSAP ease name |
| `markers` | `false` | ScrollTrigger debug markers |
| selectors | `.frs__slide/.frs__head/.frs__media/.frs__count` | overridable |

Also exposes **axis/direction** implicitly via `--frs-media-col` (CSS) to
put the media on the right instead of the left, and slide/head counts are
data-driven (just add matching `.frs__slide` + `.frs__head` pairs).

## Run
Open `lab.html` directly (no build). It loads `component.js` + uses inline
CSS mirroring `component.css`. To use in a site: include `component.css`,
the GSAP/ScrollTrigger/CustomEase CDNs, `component.js`, then call
`FocusRenderSwitch.init("#frs", {...})` on `DOMContentLoaded`.
