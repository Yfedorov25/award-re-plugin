---
id: oval-mask-reveal
name: "Oval-mask reveal (an arched/oval mask over a photo that animates open — a thin centred slit grows into a full arch — revealing the image; the media parallaxes, a kicker + serif title settle)"
level: 2
kind: component
status: official
entry:
  call: "OvalMaskReveal.create(target, opts)  // target = .omr-stage > .omr-frame( .omr-media > img/video ) + .omr-kicker + .omr-title. opts: { start, archTop, archBottom, mediaScaleFrom, parallax, duration, ease, once, pin, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), play(), destroy }"
meaning:
  what: "r1864's section media-reveal — an ARCHED / OVAL mask over a photo that REVEALS by ANIMATING the mask GEOMETRY on section enter: it starts as a thin centred vertical SLIT and GROWS outward into a full arch (rounded/pointed top + soft-oval bottom), unveiling the photo within; the media scale-settles + parallaxes inside; a kicker + serif title settle. The 'a window opens onto the surroundings' reveal."
  when: "A heritage / classical section where you want a single image to arrive through an arch — surroundings, a landmark, an interior — the arched aperture itself opening as the reveal. Use it when the project leans neoclassical (the arch reads as a portico/window) and the image deserves a ceremonial unveiling rather than a flat fade. Best for one focal photo with a short title beneath. For a STATIC arched/oval frame (media parallaxing inside a fixed shape) use oval-mask instead."
  lands: "A dark page, and at the centre a thin sliver of an image; it widens and an arch rises — a rounded crown over a soft-oval foot — until a full portico-shaped window stands open onto the photo, the image easing back to rest inside it. A line of tracked caps and a serif title settle beneath. It reads as opening a window onto the place, ceremonial and classical."
  not_when: "A STATIC arched/oval frame with no opening animation (use oval-mask). A rectangular reveal (use scroll-clip-rise / render-slice-reveal). A carousel of images (use the *-carousel bricks). A modern/brutalist brand (the arch reads classical). When the image needs to be full-bleed (the arch deliberately frames + crops)."
source:
  grammar: "r18644 /location ОКРУЖЕНИЕ: a full-bleed surroundings photo with a quatrefoil ornament + serif title; the r1864 family frames heritage/architecture imagery in arched windows / arches. The reveal animates the arch open."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 11 of the r1864 harvest; the arched media reveal)"
  registry_ref: ["r1864-oval-mask-reveal"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [clip-path, transform, opacity]
trigger: "scroll-into-view reveal (once; optionally pinned)"
timing_layer: [B-reveal, T-section-announce]
owns_pin: optional
owns_scroll: false
page_beat: [section-announce, media-reveal, heritage, surroundings]
combines_with: [compass-rose-section-divider, masked-heritage-split, collection-tier-announce, numeral-frame-expand-hero]
anti_combos: [pin-conflict, mix-blend-over-scroll]
gated_by: [R_perf_limits]
variants: [oval-mask]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "an .omr-frame masked into an arch (big top corner-radii = crown, soft bottom = oval foot) over an .omr-media (img/video)"
  - "on scroll-into-view the mask opens via clip-path inset(round): horizontal slit -> full width (0..0.55), then vertical with the bottom lagging (top 0.20..0.78 / bottom 0.30..0.85) = a rising arch"
  - "the inner media scales mediaScaleFrom(1.12)->1 + a small parallax translateY over 0..0.85"
  - "the kicker fades (0.55..0.75); the serif title fades + translateY 26->0 (0.65..1.0)"
  - "set(p 0..1) is a PURE scrub; clip-path(inset round) + transform + opacity only; NO mix-blend / NO WebGL"
  - "reduced-motion or <=820px -> shown (mask open, no parallax; border-radius arch as no-JS fallback); window.__LAB_OK__ on init"
  - "asset-substitution gate: one focal heritage/architecture photo + a short serif title + a tracked kicker; arch radii tuned per brand"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the section in: the arched mask opens from a thin centred slit into a full arch (rounded crown + soft-oval foot, the bottom lagging = rising), the media scale-settles + parallaxes, then the kicker + serif title settle. Verify the slit->arch geometry, the rising-bottom lag, the media settle, + fps. A mid-scrub frame (~p 0.4) shows the rising-arch aperture; the full frame shows the complete arch + kicker/title."
note: |
  Brick 11 of the r1864 harvest (a VARIATION) — the arched media reveal. An arch/oval mask that
  ANIMATES OPEN (a thin centred slit grows into a full arch — rounded crown + soft-oval foot, the
  bottom lagging so it reads as a rising arch) revealing a photo; the media scale-settles +
  parallaxes; a kicker + serif title settle. Marked relative (in `variants`): oval-mask (EVER) —
  that mask shape is STATIC (media parallaxes inside a FIXED oval); THIS is the animated
  counterpart (the mask GEOMETRY itself animates). clip-path(inset round) + transform + opacity =
  GPU-cheap; the .omr-frame carries a border-radius arch as a no-JS fallback. owns_pin OPTIONAL.
  Proven: clip-inset opens slit->arch (top crown 48%, foot 14%), media 1.12->1, kicker->title
  settle; 0.00% jank @ 4x throttle; zero console errors. archTop/archBottom tune the crown/foot.
  Photo = quadro render (honest demo asset; engine takes any <img>/<video>). Serif = Playfair
  Display (Didot/Bodoni class).
---

# oval-mask-reveal — an arch opens onto a photo: a slit grows into a full portico window

r1864's arched media reveal: an arch/oval mask that animates open (a thin centred slit grows into
a full arch) revealing a photo, the media scale-settling + parallaxing inside, a kicker + serif
title settling. The animated counterpart to EVER's static oval-mask.

## Markup + call
```html
<section class="omr-stage" id="okruzhenie">
  <div class="omr-frame"><div class="omr-media"><img src="…" alt=""></div></div>
  <div class="omr-kicker">В сердце исторического центра</div>
  <h2 class="omr-title">Окружение</h2>
</section>
```
```js
OvalMaskReveal.create('#okruzhenie', { archTop:48, archBottom:14, mediaScaleFrom:1.12, manageLenis:false });
```

## Proven (the lab)
An arched/oval photo mask ('ОКРУЖЕНИЕ' + kicker 'В СЕРДЦЕ ИСТОРИЧЕСКОГО ЦЕНТРА'). REVEAL curve
measured live (p / clip-inset / mediaScale / kicker / title): 0 / inset(50% round 48% 48% 14% 14%)
/ 1.12 / 0 / 0 → 0.30 / inset(28% top, 4.7% sides, 50% bottom) / 1.03 / 0 / 0 → 0.55 / inset(3% top,
0% sides, 8% bottom) / 1.005 / 0 / 0 → 0.85 / inset(0%) / 1 / 1 / 0.92 → 1 / inset(0%) / 1 / 1 / 1.
Screenshots: mid-scrub = a rising-arch aperture; full = a tall arch (rounded crown + soft-oval foot)
framing the photo, kicker + serif title below. Zero console errors. Smoothness (4× CPU throttle,
scroll-enter): 227 frames, 0.00% long → PASS. Photo = quadro render (honest demo asset; engine takes
any `<img>`/`<video>`).
