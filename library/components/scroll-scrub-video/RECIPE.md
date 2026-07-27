---
id: scroll-scrub-video
name: "Scroll-scrub video (an architect camera move scrubbed frame-by-frame on a canvas, no decoder jank)"
level: 2
kind: component
status: official
entry:
  call: "ScrollScrubVideo.init(target, opts)  // target = .ssv-stage el/selector. Markup: .ssv-stage > canvas.ssv-canvas + [.ssv-preload (0..100 hint)] + [.ssv-content ...]. opts: { frames, count, pad, ext, start, pinFactor, lerp, preloadMin, cover, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, paint, refresh, destroy }  (or { static:true, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "Scroll-scrubs an architect's camera move (a 3D fly-around / descent, 5-20s) frame by frame as you scroll — the Apple/AirPods technique. A pre-extracted numbered image sequence (ffmpeg) is preloaded and the right frame is painted to a <canvas> on scroll. NOT video.currentTime (which stutters: the source clip is ~1 keyframe per 192 frames, so every seek decodes the whole GOP). The section pins, scroll 0..1 maps to frame 0..N-1 (lerped so it glides), the canvas paints it. Zero decoder lag, locked 60fps, pixel-exact, reversible."
  when: "When an architect/3D artist hands you a short camera move (a fly-around of the building, an arrival/descent to the entrance, an orbit) and you want the USER to drive it by scrolling — the building revealing itself as they scroll, in their own tempo. The hero or a chapter beat of a real-estate site where the 3D model IS the story. Use when you can afford to pre-extract frames (a few MB) and want the scrub buttery rather than the stuttery currentTime hack."
  lands: "You scroll and the camera flies — the building turning, the camera dropping toward the water — and it tracks your scroll exactly, frame for frame, gliding (not snapping, not stuttering). It reads like you are piloting the shot; scroll back and it reverses just as smoothly. It feels like an Apple product page, not a janky video seek. A short preload counter (0..100) holds the first beat, then it is locked-smooth."
  not_when: "A clip that should just play on its own (use a plain autoplay <video>, or brand-overlay-crossfade for a tinted reveal). A long clip (>20s -> too many frames to preload; sample hard or rethink). When you cannot pre-extract frames (no ffmpeg in the pipeline) — do NOT fall back to video.currentTime<->scroll (decoder jank, the whole reason this brick exists). A page that can't own a pin here (one scroll owner per section). Low-bandwidth-first audiences where a few MB of frames is too heavy."
source:
  grammar: "Not an EVER/Springs teardown — a technique the user requested: an architect's 3D fly-around/descent clip (5-20s) scrubbed smoothly by scroll. The source clip (nahirna arrival/descent, 8s 24fps) has 1 keyframe per 192 frames, which is exactly why video.currentTime stutters and the frame-sequence approach is needed."
  recording: "Reference class: Apple product pages (AirPods/MacBook) scroll-driven canvas frame sequences. Our pipeline: ffmpeg image sequence -> canvas. Tracked in memory scroll-scrubbed-video-brick-planned."
  registry_ref: ["T-scroll-scrub-canvas"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + guarded Lenis 1.1.13 + 2d canvas (+ ffmpeg pre-extract)"
webgl: false
motion_props: [canvas-frame, transform]
trigger: "ONE pinned scroll-scrub ScrollTrigger (pin:true, pinSpacing:true, scrub:true, start 'top top', end '+=innerHeight*pinFactor'), Lenis-smoothed; scroll progress -> a lerped frame index painted to the canvas; reversible"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
owns_scroll: false
page_beat: [hero, chapter, proof]
combines_with: [theme-tween, fluid-type-sizing, bleeding-wordmark, de-bleed, brand-overlay-crossfade]
anti_combos: [section-pager, vertical-curtain-wipe, second-pin]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_one_scroll_owner]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE pinned scroll-scrub maps scroll 0..1 to frame index 0..N-1 (owns_pin TRUE; pin full-screen, start 'top top', end '+=innerHeight*pinFactor'); the painted frame is a PURE fn of a smoothed index; reversible"
  - "frames are a PRE-EXTRACTED image sequence DECODED ONCE via createImageBitmap (not held as <img> — a preloaded <img> still holds compressed bytes, so its first drawImage decodes inline and stutters) and painted to a <canvas> with drawImage — NEVER video.currentTime<->scroll (decoder jank is the whole reason this brick exists)"
  - "the frame index is LERPED on the ticker so a fast scroll glides instead of snapping; a preload gate (0..100) holds until preloadMin of frames decode, then reveals"
  - "canvas drawImage only — no per-frame DOM/layout churn; NO mix-blend / NO backdrop over the canvas; NO WebGL (2d canvas)"
  - "reduced-motion / <=820px -> static (paint the last frame, no pin/scrub); window.__LAB_OK__ once the preload gate is met"
  - "asset-substitution gate: OUR architect clip (nahirna arrival/descent) extracted to frames + Ukrainian copy"
gate:
  probe: "Open lab.html (Lenis from jsdelivr). The preload counter runs 0->100, then __LAB_OK__ true (ssv-ready, NOT ssv-static). Scroll into the section: it PINS, and the camera move scrubs frame-by-frame with scroll (gliding, reversible) — NO stutter. SMOOTHNESS-GATE BLINDSPOT: the gate's blank/pixel checks target <img>/.media; this brick paints a <canvas> (no <img>), so the gate falsely reads 'blank 100%'. Verify with a DIRECT probe instead — the canvas is opaque every frame (a frame is painted), the painted frame index advances 0->N-1 with scroll and reverses, fps>=50, jank<8%."
note: |
  The user's B-brick (scroll-SCRUBBED video, vs the A case where a video just plays
  under a tint = brand-overlay-crossfade). Built AFTER the EVER+Springs catalogue.
  Method chosen empirically: frames->canvas (Apple/AirPods), because the architect's
  clip is ~1 keyframe per 192 frames so video.currentTime<->scroll decodes the whole
  GOP every seek = stutter (the scroll-driven-hero law forbids it). Pre-extract with
  ffmpeg (asset_pipeline in tokens.json), preload, paint a lerped frame index to a 2d
  canvas. owns_pin TRUE. GATE NOTE: a canvas has no <img>, so the smoothness-gate reads
  'blank 100%' falsely — verify with a direct canvas-opacity + frame-advance probe
  (same blindspot class as <video>/<svg> media, see F-39). Weight: 100-150 frames at
  ~30-60KB = 4-7MB/section; budget it.
  DECODE-JANK LESSON (F-40): a preloaded <img> still holds COMPRESSED bytes, so the
  FIRST drawImage of each frame decodes the webp inline and blocks the scroll — 13.8%
  long frames. Decode each frame ONCE with createImageBitmap (ready raster, drawImage =
  cheap GPU copy) -> 0.2%. Also cap DPR (~1.25) so frames aren't upscaled per paint.
---

# scroll-scrub-video — an architect camera move scrubbed frame-by-frame (no decoder jank)

Scroll-scrubs an architect's camera move (a 3D fly-around / descent) frame by frame as
you scroll — the Apple/AirPods technique. A pre-extracted image sequence painted to a
<canvas>, NOT video.currentTime (which stutters because the clip is ~1 keyframe per 192
frames). The section pins, scroll 0..1 maps to frame 0..N-1 (lerped so it glides), the
canvas paints it. Zero decoder lag, 60fps, reversible.

## Asset pipeline (ffmpeg)
```bash
ffmpeg -i clip.mp4 -vf "fps=15,scale=1280:720:flags=lanczos" \
  -c:v libwebp -q:v 58 -compression_level 4 -method 4 frames/f_%03d.webp
# 8s clip @ fps=15 -> 120 frames; tune -q:v for weight (~30-60KB/frame target).
```

## Markup + call
```html
<section class="ssv-stage" id="scrub">
  <canvas class="ssv-canvas"></canvas>
  <div class="ssv-content">…copy…</div>
  <div class="ssv-preload">0%</div>
</section>
```
```js
ScrollScrubVideo.init('#scrub', { frames: 'frames/f_', count: 120, ext: '.webp', pinFactor: 2.0, lerp: 0.16 });
```

## Proven (the lab)
OUR nahirna arrival/descent fly-in (120 webp frames, 1280×720): the preload runs 0→100,
then the section pins and the camera move scrubs frame-by-frame with scroll — gliding,
reversible, the canvas opaque every frame. KEY FIX: the first build held `<img>`s and
stuttered (13.8% long frames under 4× CPU throttle = decode-jank — each frame's first
`drawImage` decoded the webp inline). Switching to `createImageBitmap` (decode once →
ready raster) + a DPR cap dropped it to **0.2% long frames (2/953), 59.9fps, 0 empty
frames** — glassy, no decoder jank. (Gate reads 'blank 100%' falsely: a canvas has no
`<img>` — verified with a direct canvas-opacity + frame-advance + pacing probe.)
