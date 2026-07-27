---
id: scroll-hint-descending-tick
name: "Scroll-hint descending tick (a serif 'scroll' label over a faint vertical track with a bright tick that autoplays descending top→bottom — drip + empty beat — gated to the first viewport, swapping to an audio-bars glyph on scroll)"
level: 2
kind: component
status: official
entry:
  call: "ScrollHintDescendingTick.create(target, opts)  // target = the hint container (.shd-hint); the engine builds .shd-label + .shd-track > .shd-tick + .shd-bars > .shd-bar x4 if absent. opts: { label, trackH, tickH, tickMin, cycle, gap, glow, gateTo, swapToBars, autoplay }."
  module: iife
  returns: "{ start, stop, hide, show, el, destroy }"
meaning:
  what: "to-place.co.jp's scroll BAIT — a small serif 'scroll' label over a faint vertical TRACK with a bright TICK that AUTOPLAYS descending top→bottom (a 'drip down the line' + an empty beat between drips), gated to the FIRST viewport, fading out + swapping to an audio-bars EQ glyph once the user scrolls. Its job is to convince a STATIONARY user (scroll = 0) that the page scrolls."
  when: "ANY dark, quiet, full-bleed hero where nothing on the first screen signals that the page is scrollable — the exact problem the user flagged (users may not realize they must scroll, desktop AND mobile). Drop it bottom-right of a cinematic hero (or centred-bottom on mobile). It is the single most reusable atom across our dark-ground heroes (smarts / quadro / nahirna / towns). Use it whenever the hero is a calm void or a full-bleed media plate with no visible 'next'."
  lands: "The first screen is a calm dark void — and in the corner a single faint line carries a tiny bright mark that keeps dripping downward, with the quiet word 'scroll' above it. Nothing else moves, so the eye goes there and reads, without thinking, 'the page goes down.' The moment you do scroll, the cue quietly retires — it fades and a small equalizer glyph takes its place, so it never nags past its job."
  not_when: "There's already an obvious scroll affordance (visible content below the fold, a peeking next card). A short/non-scrolling page. As a PROGRESS indicator (use shared/scroll-indicator — this is its inverse; binding this to scroll position kills it). On a busy/bright hero where a faint corner cue is lost (raise contrast or use a bolder affordance). Pinned on every screen (it's first-viewport only)."
source:
  grammar: "to-place hero: bottom-right — serif lowercase 'scroll' over a ~1px × ~100px white@12% track, an ultra-bright (255) ~18-25px tick descending it, shortening + dimming, with a reset gap; replaced by a small vertical audio-equalizer glyph once scrolled into the interior video sections."
  recording: "apps/quadro/.award-re/teardowns/D_toplace_video.md (§2; Brick 1 of the to-place harvest)"
  registry_ref: ["toplace-scroll-hint-descending-tick"]
stack: "vanilla (no GSAP required; injected CSS @keyframes, or a GSAP timeline if present)"
webgl: false
motion_props: [transform, opacity]
trigger: "ambient autoplay loop (NOT scroll-driven) + a first-viewport IntersectionObserver/scroll gate"
timing_layer: [A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [hero, scroll-affordance, ambient-cue]
combines_with: [bleeding-wordmark, fluid-type-sizing, theme-tween, circular-ui-language, video-card-reveal]
anti_combos: [scroll-bound-progress, pin]
gated_by: [R_perf_limits]
variants: [scroll-indicator]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a bottom-right corner cluster: a serif lowercase 'scroll' label + a faint ~1px×~100px vertical track + a bright tick"
  - "the tick AUTOPLAYS at rest (scroll=0): spawns at the top, translates DOWN shortening (tickH→tickMin) + dimming + fading, with an EMPTY BEAT before the next drip; DOWN only (no yoyo)"
  - "contrast: ultra-bright tick (#fff) on a near-invisible track (~12%); optional soft glow on the tick"
  - "gated to the first viewport: on scroll the label+track fade 1→0 and (swapToBars) an animated audio-bars EQ glyph turns on; on scroll back to top the cue returns"
  - "transform + opacity only; NO mix-blend / NO WebGL; owns_pin false; A-ambient (NOT bound to scroll position)"
  - "reduced-motion → a single slow pulse (no perpetual loop); mobile → centred-bottom, shorter track, tap-safe margin (do NOT just shrink the desktop widget); window.__LAB_OK__ on init"
  - "asset-substitution gate: a dark/quiet hero with no obvious scroll affordance + a serif type system (the 'scroll' label shares the display family)"
gate:
  probe: "Open lab.html. __LAB_OK__ true. At REST (no scrolling) watch the bottom-right: the bright tick keeps DRIPPING down the faint track with a gap between drips (it MOVES with scroll=0 — that's the whole trick). Scroll down: the 'scroll' cue fades and a small audio-bars glyph appears in its place. Scroll back to top: the cue returns. Verify autoplay-at-rest (sample the tick's top over time, must move), the empty beat, down-only, the gate swap, + fps. Crop the bottom-right corner to screenshot the tick / bars."
note: |
  Brick 1 of the to-place harvest — the user's explicit ask (A): a scroll cue so users realize the
  page scrolls (desktop + mobile). THE TRICK is the inversion: it AUTOPLAYS at scroll=0 (a thing
  moving downward in the corner = 'the page goes down'); it is NOT a scrollbar thumb and NOT bound
  to scroll position. Marked relative (in `variants`): shared/scroll-indicator — a PROGRESS
  REPORTER bound to scroll position; this is its exact inverse (a rest-state baiter). Load-bearing
  details that ARE the technique: the empty beat between drips (drop it → loading-marquee), the
  tick shortening + dimming as it descends (constant length → mechanical loader), the extreme
  contrast (bright tick / ~12% track), DOWN-only, first-viewport lifetime → swap to audio-bars,
  serif lowercase 'scroll' (sans outs it). transform + opacity = GPU-cheap (0.00% jank). FIX: the
  gone-state fades ONLY the label+track, not the container, so the audio-bars sibling survives.
  Reusable across every dark-ground hero we build. Serif = Playfair Display (Canela-class).
---

# scroll-hint-descending-tick — a bright tick drips down a faint line in the corner: "the page goes down"

to-place.co.jp's scroll bait: a serif "scroll" label over a faint vertical track with a bright tick
that autoplays descending top→bottom (drip + empty beat), gated to the first viewport, swapping to
an audio-bars glyph on scroll. It convinces a stationary user (scroll=0) that the page scrolls.

## Markup + call
```html
<section class="hero" id="hero">
  …hero content…
  <div class="shd-hint" id="hint"></div>   <!-- the engine builds label/track/tick/bars -->
</section>
```
```js
ScrollHintDescendingTick.create('#hint', { label:'scroll', gateTo:'#hero', swapToBars:true });
```
Full markup (if you want it explicit):
```html
<div class="shd-hint">
  <span class="shd-label">scroll</span>
  <span class="shd-track"><span class="shd-tick"></span></span>
  <span class="shd-bars"><span class="shd-bar"></span>…×4…</span>
</div>
```

## Proven (the lab)
A to-place-style charcoal hero (TO PLACE wordmark + diamond, white menu-dot, MORE pill, ghost
'VOICE' wordmark) with the cue bottom-right. AT REST (scroll=0): tick top travels 670→752
(down-only) then resets to 630 (next drip from top) = moved 122px → AUTOPLAYING, not scroll-bound;
empty-beat observed (opacity dips <0.08 between drips). GATE: scroll down → label+track fade 1→0
(`shd-gone`) + bars `is-on` (animated EQ glyph, 17×22px corner); scroll back to top → cue returns.
Zero console errors. Smoothness (4× CPU throttle, 4s of the loop at rest): 241 frames, 0.00% long →
PASS. Screenshots: corner = serif 'scroll' + faint track + bright descending tick; scrolled corner
= the 4-bar EQ glyph. FIX: the gone-state fades only `.shd-label`+`.shd-track` (not the container)
so the audio-bars sibling survives. Relative: shared/scroll-indicator (a progress reporter) — this
is its exact inverse (a rest-state baiter that autoplays at scroll=0).
