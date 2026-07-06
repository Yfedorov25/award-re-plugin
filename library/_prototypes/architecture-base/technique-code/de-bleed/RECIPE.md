---
id: de-bleed
name: "De-bleed / re-bleed (full-bleed photo insets into a card, wordmark behind)"
level: 2
kind: component
status: official
entry:
  call: "DeBleed.init(target, opts)  // target = .db-stage el/selector. Markup: .db-stage > .db-word (behind, z1) + .db-media (img, z2) + [.db-around...] (editorial, z3). opts: { insetX, insetY, lerp, pinFactor, siblings, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, render, refresh, destroy }  (or { static:true, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "EVER's de-bleed / re-bleed — a full-bleed photo SCALES/INSETS into a contained editorial card on scroll (a giant wordmark sitting BEHIND it, revealed in the freed gutters), the editorial copy + decor rising in around it; the reverse re-bleeds it back to full-bleed (the lead-in to a gallery open). A growing clip-path inset (inset(0) -> inset(insetY% insetX% ...)) does the de-bleed; scroll-scrubbed and reversible. The transition from 'immersive full-bleed image' to 'composed editorial spread' (and back) in one move."
  when: "A section that should open as an immersive full-bleed render and then RESOLVE into an editorial composition — the image stepping back to become a framed card while the section word and copy assemble around it. EVER's architecture/interior beats; the elegant way to go from 'hero photo' to 'editorial layout' without a hard cut, and the natural lead-in to a gallery (re-bleed = open)."
  lands: "A full-screen photo that, as you scroll, draws back into a centred card — and in the margins it frees, a giant section word appears behind it and the copy rises into place. It reads as the image 'settling' into a magazine spread, breathing and authored, and re-bleeds back to full-screen to open a gallery. Not a hard image-to-layout cut."
  not_when: "A section that should stay full-bleed (section-pager pane). A plain contained card that never was full-bleed (just lay it out). When there is no wordmark/editorial to reveal in the freed margins (the de-bleed buys nothing). A page that can't own a pin here (one scroll owner per section)."
source:
  grammar: "EVER walkthrough SEAM B/D: full-bleed photo shrinks into a centred portrait card with the giant wordmark behind, editorial collage assembling around it; the reverse (f_043) re-bleeds to open the gallery."
  recording: "apps/quadro/.award-re/teardowns/D_ever_walkthrough_video.md (SEAM B/D)"
  registry_ref: ["T-debleed-ever"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis 1.1.13"
webgl: false
motion_props: [clip-path, transform, opacity]
trigger: "ONE pinned scroll-scrub ScrollTrigger (scrub:true, pin:true), Lenis-smoothed, reversible; pin length = innerHeight*pinFactor"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
owns_scroll: false
page_beat: [chapter, material, proof]
combines_with: [bleeding-wordmark, fluid-type-sizing, theme-tween, section-pager, parallax-collage]
anti_combos: [second-pin, section-pager, media-step-switch]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_one_scroll_owner]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE pinned scroll de-bleeds the media (owns_pin TRUE); render(prog) is a PURE fn of progress; reversible (scroll back re-bleeds to full-bleed)"
  - "the media goes from full-bleed inset(0) to a contained card inset(insetY% insetX% ...) via a growing clip-path inset on scroll"
  - "a giant wordmark sits BEHIND the media (z below) and is revealed in the freed gutters as the card forms (pairs with bleeding-wordmark / fluid-type-sizing)"
  - "editorial siblings (.db-around) fade + rise in over the back half of the de-bleed"
  - "clip-path + transform + opacity only; GPU layer on the media; NO mix-blend / NO backdrop over the scrubbed surface; NO WebGL"
  - "reduced-motion / <=820px -> static contained-card pose (word behind + copy shown); window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR render + Ukrainian word/copy"
gate:
  probe: "Open lab.html (Lenis from jsdelivr). __LAB_OK__ true (db-ready, NOT db-static). Scroll into the pinned section and confirm: the full-bleed photo draws back into a centred card, the word behind appears in the gutters, the copy rises in; scroll back re-bleeds it to full. Normal smoothness gate (single solid media insetting, no overlap): PASS = 0 blank, fps>=50, jank<8%."
note: |
  Smaller brick 4 of 7. The EVER 'image settles into an editorial spread' move and
  the lead-in to a gallery (re-bleed = open). Composes with bleeding-wordmark /
  fluid-type-sizing (the word behind) and theme-tween. owns_pin -> one scroll owner
  per section.
---

# de-bleed — full-bleed photo insets into a card (wordmark behind)

EVER's de-bleed: a full-bleed photo draws back into a centred editorial card as you
scroll, a giant wordmark appearing behind it in the freed gutters and the copy
rising in around it. The reverse re-bleeds to full (gallery open).

## Markup + call
```html
<section class="db-stage" id="debleed">
  <div class="db-word">АРХІТЕКТУРА</div>           <!-- z1 behind -->
  <div class="db-media"><img src="…"></div>          <!-- z2 full-bleed -> card -->
  <div class="db-around db-around--eye">…</div>       <!-- z3 editorial -->
  <p class="db-around db-around--copy">…</p>
</section>
```
```js
DeBleed.init('#debleed', { insetX: 22, insetY: 12, pinFactor: 1.1 });
```

## Proven (the lab)
OUR render full-bleed → centred card (inset(0%) → inset(11.4% 21%)), the word
"АРХІТЕКТУРА" behind showing in the gutters, eyebrow + copy rising in over the back
half. Normal gate PASS: 0 blank, 0 seam, 59.9fps, jank 1/735.
