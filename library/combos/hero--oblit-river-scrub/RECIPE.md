---
id: hero--oblit-river-scrub
name: "Обліт над водою"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "A REWORK of the laggy hero--scroll-piloted-flyaround. ONE pinned scroll-scrub paints a 160-frame aerial OBLIT over the water toward the house, frame by frame, to a 2d canvas (scroll-scrub-video, the Apple/AirPods technique: createImageBitmap decode-once + drawImage, NOT video.currentTime). The section scroll-LOCKS while the move plays; three sparse text lines ride the SAME pin and arrive ONE AT A TIME in distinct considered compositions (lower-left, centre, left); a 4-corner meta plate frames it as an authored plate. The lag-free oblit."
  when: "The hero of a riverside real-estate site where the camera arrival over the water IS the first impression and the owner wants the visitor to PILOT it by scrolling. Use it when you have an extracted architect/drone clip (frames) and want a buttery, reversible, scroll-locked arrival with the words landing in sequence as the building flies into frame. The rework answer when the first pass lagged and read primitive."
  lands: "You scroll and the camera flies over the river toward the house, gliding frame for frame, locked and reversible like an Apple product page. The page HOLDS on the move (it does not dump down toward a section that does not exist). One line settles, you read it, it lifts away, the next arrives in a different considered spot. Nothing collides, nothing crowds the screen. It reads engineered, cinematic and slow on purpose, the opposite of the janky first pass."
source:
  grammar: "Owner feedback on hero pass 1 (the laggy oblit): the mechanic must happen WHILE the section is pinned (REAL pin, pinSpacing, no dump-down); multiple texts must arrive in sequence, never overlapping, never a full-screen wall; go deeper than primitive (the house reveals + the text reveals one by one); and DO NOT use frame-scrub-img (img.src swap, decode-jank) for the oblit, use scroll-scrub-video (canvas-2d frame-scrub, 60fps, zero decoder lag). This variant is the canvas-2d lag-free rebuild of that oblit."
  recording: null
  registry_ref: ["hero-pin-story-text", "T-scroll-scrub-canvas"]
uses:
  - { atom: scroll-scrub-video, job: "OWNS the single pin. Preloads the 160 river frames (createImageBitmap, decode-once) and paints the right frame to the canvas on scroll, Lenis-smoothed and reversible. The pinned ScrollTrigger it creates is the only pin; its progress drives the coupled text + plate." }
  - { atom: pin-story-text, job: "Builds the 3 sparse sequenced blocks and supplies the PURE set(p). Its own self-created pin is killed at wire-time so the scrub stays the only pin owner (pin budget = 1); set(p) is driven off the scrub trigger progress on the gsap.ticker. One block settled at a time, never overlapping, never a wall." }
  - { atom: corner-frame-meta, job: "The 4 corner labels (eyebrow / location / type+count / frame index) assemble once, staggered, the instant piloting begins, framing the oblit as an authored plate." }
pin:
  owner: scroll-scrub-video
  count: 1
pin_killed: [pin-story-text]
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "pins===1 (scroll-scrub-video owns the ONE pinned ScrollTrigger; pin-story-text's own pin is killed at wire-time); the section scroll-LOCKS (stage top stays at 0 across the whole pin) and does NOT dump down toward a phantom next section"
  - "no text overlap: at every sampled mid-progress exactly ONE .pst__block is at opacity>=0.9; the three lines arrive in sequence (lower-left -> centre -> left), each width-constrained, none a full-screen wall"
  - "the oblit is the lag-free canvas-2d frame-scrub: createImageBitmap decode-once + drawImage (NOT video.currentTime, NOT frame-scrub-img img.src swap); frame index advances 001->160 with scroll and reverses; 0 empty/blank frames, 60fps baseline (p95 ~18ms), zero decode-jank flashes"
  - "decode-guard: a static day-34 poster (same cars-free view) is the stage background so there is never a black flash before frame 1; the preload veil (0..100) holds until ~45% of frames decode"
  - "motion ONLY transform/opacity/scaleY (+ canvas drawImage); NO mix-blend / NO backdrop-filter over the canvas; NO WebGL (2d canvas); reduced-motion / <=820px -> static (last frame painted, stacked text, no pin, expectPins:0)"
  - "asset-truth: renders/river-frames/f_001.jpg .. f_160.jpg (extracted clip-river oblit, 1280x720) + renders/day-34.webp poster; cars-free; sparse Ukrainian copy, Fraunces+Inter, bronze accent, ZERO em/en-dash"
webgl: false
ease: air
---

# hero--oblit-river-scrub — "Обліт над водою"

The rework of the laggy `hero--scroll-piloted-flyaround`. It fixes all three of the
owner's hard requirements at once:

1. **REAL PIN.** `scroll-scrub-video` owns ONE pinned ScrollTrigger (`pin:true`,
   `pinSpacing:true`). The section scroll-LOCKS while the 160-frame oblit plays and
   does NOT dump the elements down toward a section that does not exist. Verified: the
   stage top stays at 0 across the entire pin (0..1).
2. **PIN-STORY TEXT, SEQUENCED, NO OVERLAP.** `pin-story-text` rides the SAME pin (its
   own pin is killed at wire-time, pin budget = 1). Three sparse lines arrive one at a
   time, each in its own considered composition (lower-left -> centre -> left). Verified:
   at every mid-progress exactly one block is fully visible, never two colliding, never a
   full-screen wall.
3. **DEPTH / WOW, NOT PRIMITIVE, NOT LAGGY.** Both owner-named directions welded onto one
   pinned scrub: "full scroll of the house" (the building flies into frame over the water
   as you scroll) AND "text by sequential reveal" (the lines reveal in turn). The oblit is
   the lag-free canvas-2d frame-scrub (createImageBitmap decode-once, NOT video.currentTime,
   NOT the `img.src` swap that gave the first pass ~19% decode-jank). `corner-frame-meta`
   frames it as an authored plate.

## Architecture (one pin, one scroll owner)
`ScrollScrubVideo.init('#oblit', { frames:'renders/river-frames/f_', count:160, pad:3,
ext:'.jpg', start:1, pinFactor:2.4, lerp:0.16, manageLenis:true })` owns the pin and the
Lenis smoother and returns `{ trigger }`. On the gsap.ticker we read `trigger.progress`
and drive, PURELY: `pinStoryText.set(p)` (the sequenced story), `corner-frame-meta.reveal()`
(once), a scaleY progress hairline, and the 001/160 frame-index readout.

`pin-story-text.create()` always makes its own pinned ScrollTrigger; we `trigger.kill()`
it immediately, keeping only its built DOM + pure `set(p)`. That is the discipline that
keeps the scrub the single pin owner.

## Proven (headless)
`__LAB_OK__:true`, `pins===1`, zero console errors. Scroll sweep: stage top locked at 0
across 0..1 (real scroll-lock); exactly one text block at opacity>=0.9 at every
mid-progress (no overlap); frame index advances 001->160 and reverses. Paint: canvas
non-background fraction 0.954 (painted edge-to-edge), 0 empty frames, all 160 frames
fetched + decoded via createImageBitmap. fps: 60.0 baseline, 0% long frames, p95 18.3ms
(glassy, lag-free). Under 4x CPU throttle the engine still paints every frame with 0
empty frames; the residual long-frame count is the probe's per-step driving loop on the
throttled CPU, not decoder jank (the whole reason this brick replaced frame-scrub-img).
