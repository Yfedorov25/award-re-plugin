---
id: media-step-switch
name: "Wavy-seam media stepper"
level: 1
kind: component
status: official
entry:
  call: "mediaStepSwitch(stageSel, opts)"
  module: esm
  returns: "controller | null"
meaning:
  what: "A pinned stage steps through stacked media layers; each step a wavy (or straight) seam wipes the next image/video in from one edge with a small parallax push, synced to stepped text + dots."
  when: "A PROOF/benefit act with 2-N stepped statements, each carrying its own full-bleed media that should swap with a crafted seam, not a hard cut."
  lands: "Each claim arrives on its own held frame; the seam wipe makes the swap feel authored, like turning a page."
  not_when: "Hero covers, conversion gates, sections with only one media."
source:
  grammar: "Vide Infra benefit-band — wavy-seam stepper"
  recording: null
  registry_ref: ["T-310"]
stack: "vanilla ESM + GSAP 3.12.5 + ScrollTrigger + CustomEase"
webgl: false
motion_props: [transform, opacity, clip-path]
trigger: "one pinned scroll-scrub stepper; stepVH per transition"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
page_beat: [proof, material]
combines_with: [splitLines, reveal, counter, scroll-indicator]
anti_combos: [second-pin, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: [default]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "seam wipe reveals each layer via clip-path polygon, never video.currentTime scrub"
  - "dots/fill track the active step; onStep fires per step"
  - "reverse-scroll replays seam wipes 1:1"
verify: "lab.html#__LAB_OK__"
---

# media-step-switch

> Switching between images or video synced with stepped text — a tabbed/stepped
> media swap driven by scroll. Source: `rec image-video-switch` (Naveera / Zera
> portfolio). User: *"афігєнний прийом переключання картинок чи відео з текстом"*.

> **PASS: TRUE 1:1 (WAVE-2).** Corrects the WAVE-1 draft (3 steps, gradient
> placeholders, `direction:'down'`, a hard zero-overlap copy dim) to **4 steps,
> REAL portrait renders, `direction:'up'`, and a soft `power1.out` copy-out that
> OVERLAPS the `air` copy-in** so both headings are briefly co-visible (a ghosted
> double-exposure, verified in the source frames f_009 / f_011).

## What it is (one sentence)
A pinned full-bleed stage where a fixed glass card holds **stepped copy**
(BENEFIT 01 → 02 → 03 → 04); scrubbing through the pin swaps the **background
media** for each step via an **organic wavy `clip-path` wipe** (new media reveals
**bottom→up** behind an undulating seam), crossfades the copy **with a deliberate
soft overlap**, and advances a **vertical step-rail** — the card never moves, only
media + copy + the filled dot change. At the end the pin simply **un-pins and the
stage scrolls up** to the next section (no morph / deck / full-bleed finale).

## Phases (one transition = one scrub slice, 0..1) — all 7 implemented
0. **P0 Settle** — stage pins. Media layer N flat full-bleed; card crisp; rail fill
   at N/(N-1); dot N lit. The bottom seam of the next media pre-peeks at the edge.
1. **P1 Seam enters (0–40%)** — incoming layer N+1 reveals **from the BOTTOM**; its
   wavy clip edge rises, amplitude growing toward its mid peak (~7% of stage h).
   Copy N begins to soften.
2. **P2 Mid-wipe + soft crossfade (40–60%)** — the wave crosses the **card band** at
   peak amplitude. Copy N fades out on `power1.out` (~0.30 of the slice) **while**
   copy N+1 has already begun fading in on `air` → both partly visible = the ghost.
   Dot toggles N→N+1 at ~35%. Rail fill grows.
3. **P3 Land / flatten (60–100%)** — layer N+1 fully shown; amplitude sine-gated back
   to 0 (seam flat off the top). Copy N+1 fully clarified; copy N fully gone. New
   settle state, mirror of P0.
4. **P4 / P5** — slices 1 and 2 replay the same engine (terrace→interior, then
   interior→night). The arc darkens day → dusk to mirror the source progression.
6. **P6 Release / handoff** — pin un-pins; the whole stage scrolls **up** out of view
   via native scroll and the next section rises underneath. A plain scroll handoff,
   NOT an animated finale (`anticipatePin:1` keeps the unpin jitter-free).

## Easing + durations
- **One ease:** `air` = `CustomEase "M0,0 C0.22,0.61 0.18,1 1,1"` (slow accel, late
  settle). Drives the wipe, the media push, the rail fill, the **eyebrow+heading+
  body** copy-in, and the step-dot scale.
- **Copy-out is `power1.out`** over ~0.30 of the slice, **starting at the same point
  the copy-in starts (≈0.40)** → the deliberate soft overlap / ghost. (WAVE-1 used a
  hard `ease:"none"` zero-overlap dim — wrong.)
- CSS mirror `--msw-air` = `cubic-bezier(0.22,0.61,0.18,1)` at 0.3s drives the
  **dot / rail micro-transitions only**.
- All numbers are **ratios of one slice**, not wall-clock seconds (it is a `scrub`
  timeline). Per slice: wipe 1.0 · copy-out 0.30 @ +0.40 · copy-in 0.42 @ +0.40 ·
  rail 0.85 · dot toggle @ +0.35.

## Trigger
**Scroll-scrub on a pinned section.** `ScrollTrigger { trigger:stage, start:"top top",
end:"+="+(N-1)*100+"%", scrub:1, pin:true, anticipatePin:1 }`. NOT in-view, NOT
click (though the same engine accepts click/tab control — drive `tl.tweenTo(label)`).

## DOM structure
```html
<section class="msw-stage" id="stage">
  <div class="msw-layer" data-layer="0"><img class="media" src="…" alt=""></div>  <!-- or <video muted autoplay loop playsinline> -->
  <div class="msw-layer" data-layer="1"><img class="media" src="…" alt=""></div>
  <div class="msw-layer" data-layer="2"><img class="media" src="…" alt=""></div>
  <div class="msw-layer" data-layer="3"><img class="media" src="…" alt=""></div>
  <div class="msw-scrim"></div>

  <div class="msw-card">
    <div class="msw-rail">
      <div class="track"></div>
      <div class="msw-fill"></div>
      <div class="msw-dots">
        <span class="msw-dot is-on" data-dot="0"></span><span class="msw-dot" data-dot="1"></span>
        <span class="msw-dot" data-dot="2"></span><span class="msw-dot" data-dot="3"></span>
      </div>
    </div>
    <div class="msw-copy">
      <!-- each step holds its OWN eyebrow+heading+body so the eyebrow crossfades too -->
      <article class="msw-step" data-step="0"><span class="idx">…</span><h3>…</h3><p>…</p></article>
      <article class="msw-step" data-step="1" style="opacity:0">…</article>
      <article class="msw-step" data-step="2" style="opacity:0">…</article>
      <article class="msw-step" data-step="3" style="opacity:0">…</article>
    </div>
  </div>

  <div class="msw-progress"></div>
</section>
```
Rules: one `[data-layer]` AND one `[data-step]` per step (counts must match).
First layer + first step are the initial state. Media uses `object-fit:cover` +
`scale(1.06)` overscan so the push never reveals a hard edge. Our renders are 9:16
portrait; centered subjects crop cleanly to the landscape stage.

## Key CSS / GSAP that creates it
- **Wavy seam = animated `clip-path:polygon(...)`, driven by a `{p}` proxy.** A
  `waveCols+1`-sample edge, each `y = baseY + amp·sin(...)`. For `direction:'up'`
  `baseY` rises 108%→−8%, closed over the two **top** corners; `amp = waveAmp·sin(p·π)`
  so the ripple is 0 at both ends and **peaks mid-wipe**. The proxy + `onUpdate`
  recompute the polygon every frame — interpolating the polygon *string* linearly
  collapses that peak, so DON'T tween `clipPath` directly between poly(0) and poly(1).
- **Stacked layers, clip not opacity.** Every layer is `position:absolute;inset:0`;
  only its `clip-path` animates — the cut/reveal feel, never a cheap crossfade.
- **Prior layers stay flat at `poly(1)`** as the steady background — never re-close
  them to `poly(0)` (that makes the background vanish).
- **Glass card** = `backdrop-filter:blur(14px) saturate(120%)` over the media.
- **Copy** = N `<article>` absolutely stacked; only `autoAlpha`+`y` toggle, never layout.
- **Rail** = a fill `<div>` whose `height` grows + dots toggling `.is-on` (scale .86→1).
- **Progress hairline** = `scaleX` bound to `self.progress` in `onUpdate`.

## Gotchas (what makes it cheap if done wrong)
- **Don't crossfade the MEDIA.** Opacity fade between media layers reads generic; the
  identity is the `clip-path` seam. Fallback (clip-path unsupported) = `inset()` wipe,
  never opacity. (Opacity overlap is used ONLY on the COPY.)
- **NEVER scrub `video.currentTime`.** A video layer is just `muted autoplay loop
  playsinline`; only its **visibility (clip)** animates. currentTime scrub = seek-stutter.
- **Soft-overlap the copy (ghost).** Start the new copy fading in while the old still
  has residual opacity. Do NOT hard-cut and do NOT fully separate the two fades.
- **Re-animate, don't re-set.** The proxy owns both ends of the incoming layer
  (forward → poly(1), backward → poly(0)) so back-scrub re-wipes cleanly; never set
  `clip:'none'` mid-timeline (GSAP can't reverse it).
- **`backdrop-filter` over a clip-animating surface repaints every frame** — keep the
  card small, ONE blur layer, no grain/`mix-blend` stacked over it (Quadro perf trap).
- **Overscan the media (`scale ≥1.06`)** or the `yPercent` push reveals a bare edge.
- **Pin length must equal `(N-1)` units.** Lock `min-height` on the card so steps don't
  reflow as they swap.
- **`ScrollTrigger.refresh()` after height change** (resize/orientation, and once
  images decode on `load`) so the pin distance is measured against the final layout.
- **`prefers-reduced-motion`:** kill the ScrollTrigger, snap to step 0 static. No wave,
  no scrub.
- **Mobile:** keep the wave (cheap), lock a taller card; backdrop-blur is costlier on
  mobile GPUs — test FPS. The card moves to the bottom; the pin stays.

## Reusable parameters (component.js `opts`)
| param | default | meaning |
|---|---|---|
| `scrub` | `1` | `true` or a number (smoothing seconds) |
| `pin` | `true` | pin the stage during the sequence |
| `stepVH` | `100` | scroll length per transition (% of viewport height) |
| `wave` | `true` | wavy seam vs straight horizontal inset wipe |
| `waveAmp` | `7` | ripple amplitude (%) at midpoint |
| `waveCols` | `14` | seam sample count (ripple detail) |
| `waveFreq` | `1.5` | number of sine humps across the width |
| `direction` | `'up'` | `'up'` (source) \| `'down'` sweep direction |
| `overscan` | `1.06` | media scale to hide edges during push |
| `pushPercent` | `4` | incoming layer positional push (%) |
| `wipeEase` | `'air'` | registered CustomEase name or any gsap ease |
| `onStep` | `null` | `(index)=>{}` fired when a dot lights |

Step **count** is inferred from `[data-step]` elements — no `count` param needed.

## Usage
```html
<link rel="stylesheet" href="component.css">
<script type="module">
  import { mediaStepSwitch } from './component.js';
  // gsap, ScrollTrigger, CustomEase('air') must be registered first
  mediaStepSwitch('#stage', { wave:true, scrub:1, direction:'up' });
</script>
```

`lab.html` in this folder is the self-contained TRUE 1:1 reproduction. It ships with
**real 9:16 portrait renders** from the sibling NAHIRNA dataset (referenced relative
to the file with `encodeURI` for the Cyrillic filename); if that project is absent the
images `onerror`-fall back to grade-matched gradients so the technique still demos.
Swap each `.msw-layer > img` for your own `<img>` / muted autoplay `<video>` to ship.
