---
id: fullscreen-media-carousel
name: "Fullscreen media-carousel (edge-to-edge full-bleed slides that swipe one full viewport at a time; slides can be image or video; round arrows + counter, no card chrome)"
level: 2
kind: component
status: official
entry:
  call: "FullscreenMediaCarousel.create(target, opts)  // target = .fmc-stage > .fmc-track > .fmc-slide (img|video) xN + .fmc-prev/.fmc-next + optional .fmc-counter(.fmc-cur/.fmc-total). opts: { duration, ease, loop, drag, wheel, index }."
  module: iife
  returns: "{ go(i), next(), prev(), index(), count, destroy }"
meaning:
  what: "crownd/finest's interior gallery — a FULL-BLEED carousel where each slide fills the whole viewport EDGE-TO-EDGE (no card chrome, no peek), swiping one full width at a time via round ‹ › arrows / drag / wheel / keyboard. Slides can be IMAGES or VIDEO; a video slide plays only while active AND on-screen. A '02 / 05' counter tracks position."
  when: "An immersive interior / amenity / project gallery where each shot deserves the WHOLE screen — bedroom, living, bath, pool — and you want to step through them like full-frame plates, with the option to drop a moving clip in among the stills. Use it as the showcase beat of a property page; the edge-to-edge framing + a calm counter reads premium, and mixing one video slide adds life without a busy grid."
  lands: "An interior fills the entire screen, corner to corner, with just two quiet round arrows and a small '02 / 05' at the foot. You swipe (or press an arrow) and the next room slides fully into place — and one of them isn't a photo at all but a slow clip that starts playing as it arrives, then stops as you move on. It feels like flipping through full-bleed plates of the home, one room at a time."
  not_when: "A set of items that need captions / specs / CTAs per card (use horizontal-spec-carousel). Many peers shown at once (use avatar-card-carousel). A small thumbnail strip. When every slide is video on a heavy page (gate it: one clip, lazy/poster the rest). When the gallery must sit inside a column (this wants the full viewport)."
source:
  grammar: "finest interior gallery: full-bleed images that swipe horizontally with ‹ › arrows (bedroom -> living/dining -> bathroom -> pool); each slide fills the viewport edge-to-edge; some slides are video."
  recording: "apps/quadro/.award-re/teardowns/D_finest_video.md (F2; crownd.at/projekte/finest)"
  registry_ref: ["F2-fullscreen-media-carousel-finest"]
stack: "vanilla (transform-driven; arrows / drag / wheel / keyboard; IntersectionObserver-gated video)"
webgl: false
motion_props: [transform]
trigger: "triggered (arrows / drag / wheel / keyboard), not scroll"
timing_layer: [C-content, D-interaction]
owns_pin: false
owns_scroll: false
page_beat: [gallery, interiors, showcase]
combines_with: [hero-video-render-rotator, scroll-zoom-image-pair, line-art-location-map, coords-corner-frame]
anti_combos: [carousel-over-scrubbed-surface, all-video-slides-unlazy]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "each .fmc-slide is flex 0 0 100% = the FULL viewport width (slideW == stageW, no peek, no card chrome); the track translateX(-index * 100%)"
  - "step by one via ‹ › arrows / drag / horizontal wheel (if on) / Left-Right keys; ease ~cubic-bezier(.22,1,.36,1)"
  - "slides can be img OR video; a video slide plays only when active AND on-screen (IntersectionObserver), pauses otherwise; muted+loop+playsinline; never touches video.currentTime"
  - "drag follows the pointer; release past max(60px, 12% of width) steps, else snaps back; pointer move/up on WINDOW (F-08)"
  - "a counter (.fmc-cur / .fmc-total) tracks idx+1 / N; arrows disable at the ends when loop is false"
  - "transform: translateX only; NO mix-blend over the media; NO WebGL; reduced-motion -> instant index"
  - "asset-substitution gate: OUR QUADRO renders + a clip filling the viewport edge-to-edge; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Each slide fills the viewport edge-to-edge (no peek); round ‹ › arrows + a '02 / 05' counter. Step (arrow / drag / key) -> the track moves one full width, the counter updates, arrows disable at the ends; the VIDEO slide plays when active and pauses when off. Triggered (NOT scroll) -> verify full-width slides + step + video play/pause + ends, and run the TRIGGERED smoothness probe (stepping; steady video is not jank)."
note: |
  finest F2 — the user's priority prico ("several photos, swipe, one fills the screen, with
  video"). A full-bleed media carousel: each slide is the WHOLE viewport, no card chrome,
  swipe one full width at a time, slides can be image or video. Distinct from
  horizontal-spec-carousel (framed landscape card + edge-peek + per-card CTA + spec-row) and
  avatar-card-carousel (many portrait cards + name/role + progress-line) — this is ONE
  full-viewport media slide. Video is IntersectionObserver-gated (plays only active+on-screen)
  and never scrubs currentTime (scroll-driven-hero law). Drag uses the F-08 window-pointer law.
  transform: translateX only = GPU-cheap. owns_pin false. Proven on QUADRO media (4 renders +
  a real .webm at idx1): edge-to-edge (slideW==stageW), step -100%, counter tracks, video
  play/pause correct, ends disable, 0.9% jank @ 59.9fps, zero console errors. Real use: lazy/
  poster non-active video, keep clips short + compressed.
---

# fullscreen-media-carousel — edge-to-edge full-bleed slides (image or video), swipe one viewport at a time

crownd/finest's interior gallery: a full-bleed carousel where each slide fills the whole viewport
edge-to-edge (no card chrome, no peek), swiping one full width at a time via round ‹ › arrows /
drag / keyboard. Slides can be image or video; a video slide plays only while active + on-screen.
A "02 / 05" counter tracks position.

## Markup + call
```html
<section class="fmc-stage" id="gallery">
  <div class="fmc-track">
    <div class="fmc-slide"><img src="a.webp"></div>
    <div class="fmc-slide"><video src="clip.webm" muted loop playsinline></video></div>
    <!-- … more slides … -->
  </div>
  <button class="fmc-prev">‹</button>
  <button class="fmc-next">›</button>
  <div class="fmc-counter"><span class="fmc-cur">01</span><span class="sep">/</span><span class="fmc-total">05</span></div>
</section>
```
```js
FullscreenMediaCarousel.create('#gallery', { duration:700, drag:true });
```

## Proven (the lab)
5 full-bleed slides on OUR QUADRO media (terrace render, clip-river-lite.webm VIDEO at idx1,
day-front, macro-table, night). Measured live: slideW 1440 == stageW 1440 (edge-to-edge, no
peek); step translateX 0 → -100 → -200 → -400%; counter 01/05 → 02/05 → 03/05 → 05/05; the video
slide (idx1) playing=true when active, paused on a render slide; arrows disable at idx0 (prev) /
idx4 (next). Screenshot (idx2 render): the QUADRO render filling the whole viewport + round ‹ ›
arrows + "03 / 05" counter (matches finest F2). Triggered probe (4× CPU throttle, next/prev
cycles): 3/317 long frames (0.9%), 59.9fps → PASS. Zero console errors.
