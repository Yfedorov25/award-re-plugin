---
id: video-card-reveal
name: "Video-card reveal (a pinned, wheel-stepped, input-locked stack of full-bleed <video> panels that wipe vertically one-per-step — new video rises from the bottom, one horizontal seam up — with per-card playback gating and fixed play-pause + waveform chrome; poster=still → reads still→motion)"
level: 3
kind: component
status: official
entry:
  call: "VideoCardReveal.create(target, opts)  // target = .vcr-stage > .vcr-viewport( .vcr-card > video[muted loop playsinline poster][src|data-src] x N ) + .vcr-chrome( .vcr-wordmark + .vcr-toggle( .vcr-wave > .vcr-bar x N ) + .vcr-index ). opts: { stepDur, ease, overshoot, lazy, loop, autoplayActive, manageLenis }."
  module: iife
  returns: "{ trigger, observer, go(i), next(), prev(), toggle(), index, destroy }"
meaning:
  what: "to-place.co.jp's full-bleed video handoff — a PINNED, wheel/touch-STEPPED, input-LOCKED stack of full-viewport <video> panels where each discrete step WIPES the next video VERTICALLY over the last (new panel rises from the bottom; ONE horizontal seam travels upward) with a transient scale settle; per-card PLAYBACK GATING (only the active video decodes); fixed play-pause + audio-waveform chrome above. poster = the still → first paint = the still → the reveal reads as STILL → MOTION."
  when: "Showcasing a sequence of motion pieces one at a time, full-bleed, with a clean cinematic handoff — purpose-built for Higgsfield image→video reels (each render presented as a hero, poster=its still, autoplaying on arrival). Use it as the centrepiece 'films' beat of a project: interior walk-throughs, render reels, a portfolio of animated stills. One scroll = one render; the page holds (pins) while you step through, then releases. Best at 3–8 clips."
  lands: "The page locks onto a single full-bleed film. One scroll and the next one rises from the bottom, the previous sliding up past a single clean horizontal line, settling with a hair of scale — like cuts in a reel. Only the clip you're on plays; a small play/pause and a live equalizer sit quietly in the corner. When the last one passes, the page lets go and scrolls on. It reads as a gallery of moving rooms, not a slider of thumbnails."
  not_when: "A horizontal swipe gallery with arrows/counter (use fullscreen-media-carousel). A passive auto-crossfade under a fixed title (use hero-video-render-rotator). A centre-seam reveal on ONE fixed render (use render-slice-reveal / center-seam-split). A single fixed surface whose media swaps on scroll-scrub (use media-step-switch). A theme-flipping coloured panel (use panel-rise-over). When you can't supply video (it's a video engine — for stills use a *-carousel). When you must NOT pin/lock scroll."
source:
  grammar: "to-place interior walkthrough: full-bleed interior VIDEOs swapping one-per-scroll-step via a vertical wipe (seam ~46-50% mid-travel), a transient inset+blur/scale settle before full-bleed, top-left TO PLACE wordmark + diamond, top-right circular play/pause + 4-5 bar waveform (tall=playing, squat=paused). No per-card captions — pure imagery."
  recording: "apps/quadro/.award-re/teardowns/D_toplace_video.md (§3; Brick 2 of the to-place harvest)"
  registry_ref: ["toplace-video-card-reveal"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + Observer (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity]
trigger: "pinned section + a GSAP Observer discrete wheel/touch step (input-locked); IntersectionObserver playback gating"
timing_layer: [C-carousel, D-pinned-step, V-video]
owns_pin: true
owns_scroll: true
page_beat: [films, render-reel, gallery, hero-sequence]
combines_with: [scroll-hint-descending-tick, bleeding-wordmark, theme-tween, fluid-type-sizing]
anti_combos: [scrub-video-currenttime, mix-blend-over-scroll, nested-pin]
gated_by: [R_perf_limits, R_no_webgl]
variants: [fullscreen-media-carousel, hero-video-render-rotator, render-slice-reveal, media-step-switch]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a pinned .vcr-stage holding a stack of absolutely-positioned full-bleed .vcr-card > video panels (muted loop playsinline + poster=still)"
  - "a GSAP Observer steps the index on wheel/touch; INPUT LOCKED until the step timeline completes (a double-step advances only one)"
  - "per step (~0.8s, expo.out): incoming yPercent ±100→0 + scale overshoot→1; outgoing yPercent 0→∓100 — ONE horizontal seam travels vertically"
  - "playback gating: only the active card's video plays/decodes; on leaving → pause (pause only, no currentTime seek — house idiom; event-driven, not all-at-once)"
  - "fixed chrome above the video (wordmark + circular play/pause + animated waveform + index) never moves during a wipe; the toggle is independent of scroll; waveform reflects audio state"
  - "transform + opacity only; NO mix-blend / NO WebGL; NEVER scrub video.currentTime; owns_pin true; releases the pin at the last card"
  - "reduced-motion or <=820px → native vertical scroll-snap of the cards + IntersectionObserver playback gating (no pin/lock); poster=Higgsfield still so first paint = still; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll into the section → it pins; each wheel/touch step wipes the next full-bleed video up from the bottom (one horizontal seam) + a scale settle; only the active video plays (others paused); input locks during a step; the play/pause + waveform reflect audio and are independent of scroll; the last card releases the pin. Verify the vertical wipe + seam, the gate (one decoder), the input-lock, the still→motion (poster), + fps. NOTE: Observer wheel is unreliable headless — drive via api.next()/prev(); scroll past the first 100vh spacer to engage the pin before screenshotting."
note: |
  Brick 2 of the to-place harvest — the user's explicit ask (B): a video-card reveal to showcase
  Higgsfield image→video render reels across projects. The mechanism: poster = the still → first
  paint = the still → autoplay on arrival → reads STILL → MOTION, one full-bleed render at a time,
  handed off by a vertical wipe (new from the bottom, one seam up) + a scale settle. Level 3
  (owns_pin + owns_scroll + Observer step controller). Marked relatives (in `variants`):
  fullscreen-media-carousel (HORIZONTAL swipe + arrows), hero-video-render-rotator (passive opacity
  crossfade under a fixed title), render-slice-reveal/center-seam-split (centre seam on ONE fixed
  render), media-step-switch (ONE fixed surface, scrubbed), panel-rise-over (coloured theme panel) —
  this is the only discrete-wheel-stepped + input-locked, full-bleed VIDEO panels translating
  vertically with per-card play/decode gating. LAWS: transform + opacity only, NEVER scrub
  video.currentTime (the video autoplays; scroll STEPS panels), only the active video decodes
  (perf), poster + playsinline + muted (mobile). Proven: only-active gating, vertical wipe (one
  seam + scale settle), input-lock (double-step → +1), toggle + waveform reflect state, pin engages
  + releases; 2.05% jank @ 4x throttle; zero console errors. Lazy-load current ±1 only. Pairs with
  scroll-hint-descending-tick on the hero before it. Serif chrome = Playfair Display.
---

# video-card-reveal — full-bleed films that wipe up one-per-scroll; only the active one plays (still→motion)

to-place.co.jp's full-bleed video handoff: a pinned, wheel-stepped, input-locked stack of
full-viewport `<video>` panels that wipe vertically one-per-step (new video rises from the bottom,
one horizontal seam up) + a scale settle, with per-card playback gating and fixed play-pause +
waveform chrome. poster = the still → reads still → motion. Built for Higgsfield render reels.

## Markup + call
```html
<section class="vcr-stage" id="reel">
  <div class="vcr-viewport">
    <div class="vcr-card"><video muted loop playsinline poster="render-01-still.webp"><source src="render-01.mp4" type="video/mp4"></video></div>
    <div class="vcr-card"><video muted loop playsinline poster="render-02-still.webp" data-src="render-02.mp4"></video></div>
    <!-- … N Higgsfield reels … -->
  </div>
  <div class="vcr-chrome">
    <div class="vcr-wordmark"><span class="vcr-dia"></span>TO PLACE</div>
    <button class="vcr-toggle"><span class="vcr-wave"><span class="vcr-bar"></span>…×5…</span></button>
    <div class="vcr-index">01 / 03</div>
  </div>
</section>
```
```js
VideoCardReveal.create('#reel', { stepDur:0.8, ease:'expo.out', overshoot:0.94, lazy:true, manageLenis:false });
```
Needs GSAP + ScrollTrigger + Observer. `data-src` = lazy (mounted on approach). `poster` = the Higgsfield still.

## Proven (the lab)
3 full-bleed video cards (poster stills + clip-river / nahirna-water sources, lazy `data-src`) on a
charcoal stage with TO PLACE wordmark + diamond, a circular play/pause + 5-bar waveform, a `NN / 03`
index. Observer registered, `__LAB_OK__` true. INITIAL GATE: only card 0 plays (others paused at
t=0). MID-WIPE: card 0 at translateY −90% (exiting up), card 1 at +9.9% mid-rise + scale 0.994
(overshoot settle), card 2 at 100% — vertical wipe, one seam up. AFTER STEP: idx 1, counter `02/03`,
playing `[false,true,false]` (gate follows active). INPUT LOCK: rapid double-next advanced only +1.
TOGGLE: play→pause works, waveform reflects state. Posters set on all 3 (first paint = still →
still→motion); incoming card after settle plays (1920px, readyState 4). Pin engages (stageTop 0).
Zero console errors. Smoothness (4× CPU throttle, 3 wipes): 195 frames, 2.05% long → PASS.
Screenshots: settled = full-bleed playing video + fixed chrome; mid-wipe = one horizontal seam up +
`02/03` + chrome stationary.
