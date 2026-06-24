# media-step-switch

> Switching between images or video synced with stepped text — a tabbed/stepped
> media swap driven by scroll. Source: `rec7-image-video-switch` (Naveera / Zera
> portfolio). User: *"афігєнний прийом переключання картинок чи відео з текстом"*.

## What it is (one sentence)
A pinned full-bleed stage where a fixed glass card holds **stepped copy**
(BENEFIT 01 → 02 → 03…); scrubbing through the pin swaps the **background media**
for each step via an **organic wavy `clip-path` wipe** (new media reveals top→down
behind an undulating seam), crossfades the copy, and advances a **vertical
step-rail** — the card never moves, only media + copy + the filled dot change.

## Frame-by-frame (one transition, step N → N+1)
1. **Settle (0%)** — stage pins. Media layer N fully shown (flat full-bleed),
   card crisp, rail fill at N/(N-1), dot N lit.
2. **Seam enters (0–25%)** — incoming layer N+1 begins to reveal from the top;
   its top clip edge is an undulating wave (ripple amplitude grows toward the
   midpoint). In the recording the seam reads like fabric being pulled down over
   the old frame.
3. **Mid-wipe + copy dim (25–40%)** — wave crosses the card band; old copy fades
   to 0 *first* (fast, 0.28s, linear) so there's a clean beat with no text fighting
   the moving seam. Rail fill grows toward the next mark.
4. **New copy clarifies (34–74%)** — incoming copy fades up +10px → 0 with `air`
   ease, **after** the seam has passed the card. Dot N turns off, dot N+1 turns on
   at ~35%.
5. **Land (74–100%)** — incoming layer fully shown (flat), ripple flattens to 0 at
   the ends (sine-gated), tiny positional push on the new image resolves to rest.
   Old layer is re-closed at 99.9% so a *backward* scrub re-wipes cleanly.

The recording shows ~4 frames of seam travel at 2fps → the wipe itself is ~0.7s;
the whole step occupies one viewport-height of scroll.

## Easing + durations
- **One ease:** `air` = `CustomEase "M0,0 C0.22,0.61 0.18,1 1,1"` (slow-out, late
  settle). Used for the wipe, copy-in, rail fill, image push.
- Copy-out is `ease:"none"` over 0.28s (a deliberate hard dim, not a fade-curve).
- Per-transition: wipe 0.7s · copy-out 0.28s @ +0.02 · copy-in 0.4s @ +0.34 ·
  rail 0.7s · dot toggle @ +0.35. All inside a `scrub` timeline, so wall-clock
  duration = scroll speed; the numbers are *ratios*, not seconds.

## Trigger
**Scroll-scrub on a pinned section.** `ScrollTrigger { trigger:stage, start:"top top",
end:"+="+(N-1)*100+"%", scrub:true, pin:true, anticipatePin:1 }`. NOT in-view, NOT
click (though the same engine accepts click/tab control — drive `tl.tweenTo(label)`).

## DOM structure
```html
<section class="msw-stage" id="stage">
  <div class="msw-layer" data-layer="0"><img src="…" alt=""></div>     <!-- or <video muted autoplay loop playsinline> -->
  <div class="msw-layer" data-layer="1"><img src="…" alt=""></div>
  <div class="msw-layer" data-layer="2"><img src="…" alt=""></div>
  <div class="msw-scrim"></div>

  <div class="msw-card">
    <div class="msw-rail">
      <div class="msw-fill"></div>
      <div class="msw-dots"><span class="msw-dot"></span><span class="msw-dot"></span><span class="msw-dot"></span></div>
    </div>
    <div class="msw-copy">
      <article class="msw-step" data-step="0">…</article>
      <article class="msw-step" data-step="1">…</article>
      <article class="msw-step" data-step="2">…</article>
    </div>
  </div>

  <div class="msw-progress"></div>
</section>
```
Rules: one `[data-layer]` AND one `[data-step]` per step (counts must match).
First layer + first step are the initial state. Media uses `object-fit:cover` +
`scale(1.06)` overscan so the push/parallax never reveals a hard edge.

## Key CSS / GSAP that creates it
- **Wavy seam = animated `clip-path:polygon(...)`.** A top edge of `waveCols+1`
  samples, each `y = baseY + amp·sin(...)`; `baseY` sweeps −8%→108% across the
  wipe, `amp = waveAmp·sin(p·π)` so the ripple is 0 at both ends and peaks
  mid-wipe. Closed over the bottom two corners. Hidden state = seam at top
  (nothing shown); shown state = seam past bottom.
- **Stacked layers, clip not opacity.** Every layer is `position:absolute;inset:0`;
  only its `clip-path` animates — this is what gives the *cut/reveal* feel instead
  of a cheap crossfade.
- **Glass card** = `backdrop-filter:blur(14px) saturate(120%)` over the media.
- **Copy** = N `<article>` absolutely stacked in one `.msw-copy`; only opacity
  toggles, never layout.
- **Rail** = a fill `<div>` whose `height` grows + dots toggling `.is-on`.
- **Progress hairline** = `scaleX` bound to `self.progress` in `onUpdate`.

## Gotchas (what makes it cheap if done wrong)
- **Don't crossfade the media.** A simple opacity fade between layers reads
  generic. The whole identity is the *clip-path seam*. If you must fall back
  (clip-path unsupported), use a straight `inset()` wipe, never opacity.
- **NEVER scrub `video.currentTime`.** If a layer is video it just
  `muted autoplay loop playsinline` and loops; only its **visibility** (clip)
  animates. Scrubbing currentTime causes seek-stutter on every layer.
- **Dim old copy before the seam, clarify new copy after.** Overlapping both
  fades over the moving wave = muddy, two texts fighting. The 0.28s hard-out +
  delayed-in is the beat that makes it feel intentional.
- **Re-close the outgoing layer at slice end** (`+0.999`) or scrubbing *back up*
  shows the old layer already gone and the wipe runs empty.
- **`backdrop-filter` over a clip-animating surface repaints every frame** — keep
  the card small, avoid stacking grain/`mix-blend` over it (known Quadro perf
  trap). One blur layer only.
- **Pin length must equal `(N-1)` units.** If copy is long, the card can need
  `min-height` so steps don't reflow as they swap.
- **Overscan the media (`scale ≥1.06`)** or the `yPercent` push reveals a bare
  edge at the top/bottom.
- **`prefers-reduced-motion`:** kill the ScrollTrigger, snap to step 0 static.
  No wave, no scrub.
- **Mobile:** keep the wave (cheap), but consider `direction` and a taller card
  `min-height`; backdrop-blur is costlier on mobile GPUs — test FPS.

## Reusable parameters (component.js `opts`)
| param | default | meaning |
|---|---|---|
| `scrub` | `true` | `true` or a number (smoothing seconds) |
| `pin` | `true` | pin the stage during the sequence |
| `stepVH` | `100` | scroll length per transition (% of viewport height) |
| `wave` | `true` | wavy seam vs straight horizontal inset wipe |
| `waveAmp` | `4.5` | ripple amplitude (%) at midpoint |
| `waveCols` | `8` | seam sample count (ripple detail) |
| `direction` | `'down'` | `'down'` \| `'up'` sweep direction |
| `overscan` | `1.06` | media scale to hide edges during push |
| `pushPercent` | `3` | incoming layer positional push (%) |
| `wipeEase` | `'air'` | registered CustomEase name or any gsap ease |
| `onStep` | `null` | `(index)=>{}` fired when a dot lights |

Step **count** is inferred from `[data-step]` elements — no `count` param needed.

## Usage
```html
<link rel="stylesheet" href="component.css">
<script type="module">
  import { mediaStepSwitch } from './component.js';
  // gsap, ScrollTrigger, CustomEase('air') must be registered first
  mediaStepSwitch('#stage', { wave:true, scrub:0.6, direction:'down' });
</script>
```

`lab.html` in this folder is the self-contained 1:1 reproduction (runs by opening
it, gradient placeholders, no assets needed). Swap each `.msw-layer > div` for an
`<img>` or muted autoplay `<video>` to ship.
