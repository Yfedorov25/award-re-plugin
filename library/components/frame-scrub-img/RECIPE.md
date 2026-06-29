---
id: frame-scrub-img
name: "Scroll-scrubbed image sequence (img.src swap, no canvas)"
level: 1
kind: component
status: candidate
entry:
  call: "FrameScrubImg.create(target, opts)  // target = the .fsi-stage el/selector. Markup-first: an optional <img class=fsi-frame> inside the stage is the painted surface (created if absent). opts: { framePath, pattern:'f_###.webp', count, from, pad, pinFactor, hold, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, set(p), ready (Promise), frames, onUpdate(fn), refresh, destroy }  (or { static:true, set, ready, frames, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "A scroll-scrubbed IMAGE SEQUENCE, the no-WebGL, no-canvas way to drive a true continuous camera move (a fly-around, an arrival, a construction timelapse) off ONE pinned scroll. A single on-screen <img> has its .src swapped to the frame nearest scroll progress (idx = round(p*(N-1))); every frame is preloaded into an off-DOM Image[] and decode()'d up front, so the swap is a pointer change to an already-decoded same-size bitmap, blitted by the compositor with no main-thread raster. The swap is rAF-throttled and index-deduped, so the DOM is touched at most once per animation frame and only when the integer frame index changes. This is ERA's /architecture 149-frame data-sequence and Ever's ~1333-frame /progress scrub, harvested as a reusable primitive."
  when: "A section whose ONE job is a continuous camera move over the building: a drone fly-around, an arrival glide to the entrance, a season or construction timelapse. When you have a real pre-rendered frame sequence and want the scroll to BE the camera, with text living on the rails. The honest substitute for a WebGL orbit."
  lands: "As you scroll one pinned section, the building turns under one continuous camera, every frame paints crisp and full-bleed, the motion tracks the scroll 1:1 and plays back in reverse on scroll-up, while a serif caption holds on the rails. It reads like a film clip you are scrubbing, not a slideshow of cuts."
  not_when: "A few discrete hero stills with their own captions (use vertical-slide, the film-advance with zero-overlap geometry). A day/night cross-dissolve of ONE frame (daynight-* atoms). A section that must keep native scrolling or already lives under another pin (one scroll owner per page). No real frame sequence on disk -> there is nothing to scrub."
source:
  grammar: "ERA era.estate /architecture intro, a 149-frame scroll-scrub data-sequence (data-sequence-frame-count=149, .png.webp). Ever ever-live-here.com /progress, a ~1333-frame scrubbed construction timeline. Both: scroll position -> frame index, one decoded raster on screen, 0 canvas / 0 WebGL / SEO-safe DOM. See D_ERA_architecture (§2.3) + D_Ever_architecture (§3 /progress)."
  recording: null
  registry_ref: ["T-frame-sequence-scrub"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + guarded Lenis 1.1.13 (cdn jsdelivr). No build step."
webgl: false
motion_props: [opacity]
trigger: "ONE pinned scroll-scrub ScrollTrigger (scrub:true, pin:true), Lenis-smoothed, reversible; pin length = innerHeight * pinFactor. The src swap is the motion; the <img> box never transforms (zero CLS)."
timing_layer: [B-entrance]
owns_pin: true
owns_scroll: false
page_beat: [chapter, proof, material]
combines_with: [fluid-type-sizing, splitLines, corner-frame-meta, scroll-indicator]
anti_combos: [second-pin, section-pager, media-step-switch, vertical-slide]
gated_by: [R_pin_budget, R_no_webgl, R_perf_limits, R_one_scroll_owner, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md]
acceptance:
  - "ONE pinned scroll (owns_pin TRUE; exactly one ScrollTrigger pins); set(p) is a PURE fn of progress (idx = round(remap(p)*(N-1))); reversible on scroll-up"
  - "the on-screen surface is ONE <img class=fsi-frame> whose .src swaps per frame; NO canvas drawImage, NO video.currentTime, NO WebGL; the <img> box never reflows (object-fit:cover fixed box, zero CLS)"
  - "every frame preloaded into an off-DOM Image[] and decode()'d up front; the swap is rAF-throttled + index-deduped (DOM touched at most once per frame, only on index change) -> no decode-jank on scroll"
  - "verified mid-scroll: the painted frame index tracks scroll progress (e.g. ~50% -> frame ~60 of 120) and the same position scrolled back paints the earlier frame"
  - "engine laws: Lenis 1.1.13 lerp 0.1 -> gsap.ticker -> ScrollTrigger.update; lagSmoothing(0); opacity-only fade-in; NO mix-blend / NO backdrop over the frame; first frame eager + decoded before __LAB_OK__"
  - "reduced-motion / <=820px -> the final (arrived) frame shown statically, no pin; window.__LAB_OK__ set on ready; asset-substitution gate: built on OUR QUADRO arrival-frames + Ukrainian copy"
gate:
  probe: "Open lab.html in a real browser (Lenis from jsdelivr). __LAB_OK__ true once the engine is wired and the first frame decoded (NOT fsi-static on desktop). Scroll into the pinned range and confirm the building turns under one continuous camera, frame index tracks scroll, and scroll-up plays it back. PASS = 0 blank, fps>=50, jank<8%, 0 CLS."
note: |
  Built for the architecture--flyaround-scrub section variant (creative intent: a cinematic
  fly-around of the building, 120 arrival frames). vertical-slide is the sibling film-ADVANCE
  (a few discrete stills with zero-overlap geometry + per-slide parallax); frame-scrub-img is
  the continuous-CAMERA sibling (every frame, one decoded raster scrubbed by scroll). Pick
  vertical-slide when the beat is a small set of authored stills; pick this when the beat is
  one unbroken move and a real frame sequence exists. canvas drawImage is intentionally NOT
  used: an <img>.src swap between equal-size pre-decoded WebP frames is GPU-blitted with no
  main-thread raster, and the off-DOM decode() up front removes the only jank source, so the
  canvas path (banned) buys nothing here.
  BACKLOG: a thumbnail/keyframe-only fast-decode pass for very large sequences (>300 frames)
  could decode every Nth frame eagerly and the rest lazily near the playhead; not needed at 120.
---

# frame-scrub-img, scroll-scrubbed image sequence (no canvas, no WebGL)

A scroll IS the camera. One pinned scrub maps scroll progress to a frame index; a single
on-screen `<img>` swaps its `.src` to the nearest pre-decoded frame. ERA does this with 149
frames over its /architecture intro; Ever does it with ~1333 over /progress. This is that move
as a reusable atom, on OUR 120 arrival frames.

## The move (one pinned scroll)
- `set(p)` (PURE): `t = p / (1 - hold)` (the last `hold` of the scroll holds the final frame),
  `idx = round(t * (N - 1))`, then `img.src = urls[idx]`, but only when `idx` changed and at
  most once per `requestAnimationFrame`.
- Every frame is preloaded into an off-DOM `Image[]` with `decoding:'async'` and `decode()`'d;
  the swap is therefore a pointer change to a ready bitmap. Neighbours (`idx±1`) are warmed on
  each swap so a fast flick never hits a cold frame.
- The `<img>` box is fixed (`object-fit:cover`) and never transforms, so swapping the source
  causes zero layout / zero CLS. The only animated property is the one-shot `opacity` fade-in.

## Markup + call
```html
<section class="fsi-stage" id="stage">
  <img class="fsi-frame" alt="Обліт будинку">
</section>
```
```js
FrameScrubImg.create('#stage', {
  framePath: 'renders/arrival-frames/', pattern: 'f_###.webp',
  count: 120, from: 1, pad: 3, pinFactor: 2.4, hold: 0.06
});
```

## Why not canvas
`canvas drawImage` is banned in this system, and it would buy nothing here: an `<img>.src` swap
between equal-size, already-decoded WebP frames is composited (blitted) by the GPU with no
main-thread raster. The off-DOM `decode()` up front is what removes decode-jank, the same thing
the canvas path would need anyway, minus the per-frame `drawImage` cost.

## Gate
Open `lab.html` in a real browser. `__LAB_OK__` true once the engine is wired and the first
frame decoded. Scroll the pinned range: the building turns under one continuous camera, frame
index tracks scroll, scroll-up plays it back. PASS = 0 blank, fps>=50, jank<8%, 0 CLS.
Reduced-motion / `<=820px` -> the arrived frame shown statically, no pin.
