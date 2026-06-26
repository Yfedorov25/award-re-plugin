---
id: brand-overlay-crossfade
name: "Brand-overlay crossfade (a photo surfaces from under a brand-colour wash that tints to 0)"
level: 2
kind: component
status: official
entry:
  call: "BrandOverlayCrossfade.init(target, opts)  // target = .boc-stage el/selector. Markup: .boc-stage > .boc-img(img, z1) + .boc-wash(brand-colour layer, z2) + [.boc-content](z3). opts: { wash, fadeImage, lerp, pinFactor, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, render, refresh, destroy }  (or { static:true, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "Springs' brand-tinted reveal — the section PINS full-screen on a full-bleed photo dipped in the brand colour, and while pinned a brand-colour WASH tints from full to 0 ON THE WHOLE FRAME, so the photo is seen surfacing from under the house colour across the entire screen (not while it slides in). A single opacity scrub (wash -> 0) over a solid, full-bleed, pinned photo does the reveal; scroll-scrubbed along the pin and reversible. The 'every image enters wearing the brand colour, then clears' move."
  when: "A section whose lead photo should enter wearing the house/section colour and then clear to full colour — the brand-tint signature that ties a gallery or a sequence of full-bleed photos together (every shot dipped in the brand, then resolved). Springs' Place/Jogging beats; the cheap, repeatable way to brand a run of photos without a per-photo treatment."
  lands: "You scroll onto a full-bleed render that fills the screen dipped in the brand green (a heavy tint); it holds there (pinned) and the tint drains off the WHOLE frame to reveal the true photo — the image 'surfacing' from under the brand colour across the entire screen. It reads as a deliberate house wash on every photo, not a fade-from-black; reverse re-tints it. The photo is solid the whole time, so it never shows a hole."
  not_when: "A photo that should read in true colour immediately (no brand beat). A section already owning a heavier transition (section-pager pane, curtain). A hero that must read instantly (a tint delays the read). When the section colour is muddy on the photo (test the multiply-free wash first). On a light backdrop with fadeImage:true (the image would see-through the wash at entry — keep fadeImage:false)."
source:
  grammar: "Springs Place->Jogging SEAM-07: a new full-bleed photo enters under a heavy green brand tint (f099) that lightens (f102) to full colour (f106); the same brand wash recurs on each photo of the run, tying the gallery together."
  recording: "apps/quadro/.award-re/teardowns/D_springs_walkthrough_video.md (SEAM-07, f099-f106)"
  registry_ref: ["T-brand-overlay-springs"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + guarded Lenis 1.1.13"
webgl: false
motion_props: [opacity]
trigger: "ONE pinned scroll-scrub ScrollTrigger (pin:true, pinSpacing:true, scrub:true, start 'top top', end '+=innerHeight*pinFactor'), Lenis-smoothed, reversible; pins the section full-screen and tints the wash off the full frame"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
owns_scroll: false
page_beat: [chapter, material, proof]
combines_with: [portrait-carousel, de-bleed, theme-tween, rotated-mosaic-hero, fluid-type-sizing]
anti_combos: [section-pager, vertical-curtain-wipe, second-pin]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_one_scroll_owner]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, lab-video.html, tokens.json]
acceptance:
  - "ONE pinned scroll-scrub clears the wash (owns_pin TRUE; pin full-screen, start 'top top', end '+=innerHeight*pinFactor'); render(prog) is a PURE fn of progress (wash opacity = wash*(1-prog)); reversible (scroll back re-tints)"
  - "the section pins full-screen on a full-bleed solid photo; the brand-colour wash tints from wash (default 1.0) -> 0 ON THE WHOLE FRAME while pinned (the tint is seen across the entire photo, not a strip as it slides in)"
  - "the wash colour is the brand/section colour (CSS var --boc-wash / background) so the photo enters wearing the house colour, then clears"
  - "opacity ONLY (on the wash, and optionally the image); NO mix-blend / NO backdrop over the scrubbed surface; NO WebGL"
  - "composite coverage (image + wash) stays opaque through the whole transition = zero see-through on any background (fadeImage:false default)"
  - "reduced-motion / <=820px -> static pose (image full, wash 0); window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR render + Ukrainian copy"
gate:
  probe: "Open lab.html (Lenis from jsdelivr). __LAB_OK__ true (boc-ready, NOT boc-static). Scroll into the section and confirm it PINS full-screen, then while pinned (stageTop 0) the tint drains off the WHOLE frame: wash ~0.8 heavily dipped -> 0.5 half-clear -> 0 full colour, all at full-bleed; scroll back re-tints. Normal smoothness gate (single solid media under a tinting wash, no two-render overlap): PASS = 0 blank, fps>=50, jank<8%. Also probe composite (img+wash) coverage never thins below opaque."
note: |
  Smaller brick 6 of 7. The Springs 'every photo enters wearing the brand colour,
  then clears' move — the brand-tint signature that ties a gallery/sequence of
  full-bleed photos. PINS full-screen so the tint is seen draining off the WHOLE
  photo in place (the first build scrubbed on entry and the tint was only ever on a
  thin strip as the section slid in = read as 'just a photo'; pin fixed it).
  Default fadeImage:false keeps the photo solid so the composite never thins (zero
  see-through on any background); fadeImage:true (crossfade the image too) is only
  safe on a brand-coloured backdrop. owns_pin TRUE -> it is the section's one scroll
  owner (anti_combos: section-pager, vertical-curtain-wipe, second-pin).

  MEDIA-AGNOSTIC: the .boc-img layer takes an <img> OR a <video autoplay muted loop
  playsinline>. With fadeImage:false the engine never touches the media (only the
  wash), so a live video plays the whole time while the tint drains off the pinned
  frame (lab-video.html, proven on OUR nahirna water render: video advanced
  0.47->5.50, zero paused frames, composite 1.000 throughout). NOTE: this is a video
  PLAYING under the tint (scenario A), NOT scroll-scrubbed currentTime — scrubbing a
  video's currentTime by scroll is a separate brick (decoder jank, see
  scroll-driven-hero law). The smoothness-gate's blank/pixel checks target <img> and
  .media selectors, so a <video> media reads as 'blank 100%' in the gate — that is a
  gate blindspot, not a real blank (verify a video variant with a composite probe
  instead: media-eff-opacity + wash-eff-opacity stays opaque every frame).
---

# brand-overlay-crossfade — a photo surfaces from under a brand-colour wash

Springs' brand-tinted reveal: a full-bleed photo arrives dipped in the house colour
(a heavy brand wash) and, as the section scrolls into view, the wash tints to 0 ON
the photo — the image surfacing from under the brand colour. The photo is solid the
whole time, so it never shows a hole; reverse re-tints it. The signature that brands
a whole run of full-bleed photos cheaply and repeatably.

## Markup + call
```html
<section class="boc-stage" id="reveal" style="--boc-wash:#16302a">
  <div class="boc-img"><img src="…"></div>     <!-- z1 solid photo -->
  <div class="boc-wash"></div>                  <!-- z2 brand-colour wash, opacity -> 0 -->
  <div class="boc-content"><p>…</p></div>        <!-- z3 copy -->
</section>
```
```js
BrandOverlayCrossfade.init('#reveal', { wash: 1.0, fadeImage: false });
```

## Proven (the lab)
OUR QUADRO render PINS full-screen and the green brand wash tints 1.0 → 0 ON the full
frame while pinned (boc-ready, not boc-static): wash 0.8 heavily dipped → 0.5 half-clear
→ 0 full colour, all at stageTop 0 (full-bleed), so the tint is seen across the WHOLE
photo. Composite (image + wash) stays opaque the whole transition — zero see-through on
any background (probed). Normal gate PASS: blank 0.6%, seam 0%, coSolid 0, 59.9fps,
jank 1/684.
