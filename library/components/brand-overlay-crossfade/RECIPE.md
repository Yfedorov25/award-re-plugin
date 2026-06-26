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
  what: "Springs' brand-tinted reveal — a full-bleed photo arrives under a brand-colour WASH whose opacity then animates to 0 ON the photo as the section scrolls in, so every photo gets a brief 'brand-tint' beat before it resolves to full colour. A single opacity scrub (wash -> 0) over a solid photo does the reveal; scroll-scrubbed and reversible. The 'every image enters wearing the brand colour, then clears' move."
  when: "A section whose lead photo should enter wearing the house/section colour and then clear to full colour — the brand-tint signature that ties a gallery or a sequence of full-bleed photos together (every shot dipped in the brand, then resolved). Springs' Place/Jogging beats; the cheap, repeatable way to brand a run of photos without a per-photo treatment."
  lands: "A full-bleed render that comes in dipped in the brand green (a heavy tint), and as you scroll the tint drains off it to reveal the true photo — the image 'surfacing' from under the brand colour. It reads as a deliberate house wash on every photo, not a fade-from-black; reverse re-tints it. The photo is solid the whole time, so it never shows a hole."
  not_when: "A photo that should read in true colour immediately (no brand beat). A section already owning a heavier transition (section-pager pane, curtain). A hero that must read instantly (a tint delays the read). When the section colour is muddy on the photo (test the multiply-free wash first). On a light backdrop with fadeImage:true (the image would see-through the wash at entry — keep fadeImage:false)."
source:
  grammar: "Springs Place->Jogging SEAM-07: a new full-bleed photo enters under a heavy green brand tint (f099) that lightens (f102) to full colour (f106); the same brand wash recurs on each photo of the run, tying the gallery together."
  recording: "apps/quadro/.award-re/teardowns/D_springs_walkthrough_video.md (SEAM-07, f099-f106)"
  registry_ref: ["T-brand-overlay-springs"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + guarded Lenis 1.1.13"
webgl: false
motion_props: [opacity]
trigger: "ONE entry scroll-scrub ScrollTrigger (scrub:true, start 'top bottom', end 'top 30%'), Lenis-smoothed, reversible; no hard pin (resolves as the section enters)"
timing_layer: [B-entrance, A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [chapter, material, proof]
combines_with: [portrait-carousel, de-bleed, theme-tween, rotated-mosaic-hero, fluid-type-sizing]
anti_combos: [section-pager, vertical-curtain-wipe]
gated_by: [R_anti_combos, R_perf_limits, R_one_scroll_owner]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE entry scroll-scrub clears the wash (owns_pin FALSE, no hard pin); render(prog) is a PURE fn of progress (wash opacity = wash*(1-prog)); reversible (scroll back re-tints)"
  - "the photo is solid under the wash; the brand-colour wash tints from wash (default 1.0) -> 0 ON the photo as the section enters the viewport"
  - "the wash colour is the brand/section colour (CSS var --boc-wash / background) so the photo enters wearing the house colour, then clears"
  - "opacity ONLY (on the wash, and optionally the image); NO mix-blend / NO backdrop over the scrubbed surface; NO WebGL"
  - "composite coverage (image + wash) stays opaque through the whole transition = zero see-through on any background (fadeImage:false default)"
  - "reduced-motion / <=820px -> static pose (image full, wash 0); window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR render + Ukrainian copy"
gate:
  probe: "Open lab.html (Lenis from jsdelivr). __LAB_OK__ true (boc-ready, NOT boc-static). Scroll the section up into the viewport and confirm: the render arrives dipped in the brand green, the tint drains off it to reveal the true photo, scroll back re-tints. Normal smoothness gate (single solid media under a tinting wash, no two-render overlap): PASS = 0 blank, fps>=50, jank<8%. Also probe composite (img+wash) coverage never thins below opaque."
note: |
  Smaller brick 6 of 7. The Springs 'every photo enters wearing the brand colour,
  then clears' move — the brand-tint signature that ties a gallery/sequence of
  full-bleed photos. Default fadeImage:false keeps the photo solid so the composite
  never thins (zero see-through on any background); fadeImage:true (crossfade the
  image too) is only safe on a brand-coloured backdrop. owns_pin FALSE -> resolves on
  entry, leaves the page's one scroll owner free for a following pin.
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
OUR QUADRO terrace render enters under a full green brand wash that tints 1.0 → 0 as
the section scrolls in (boc-ready, not boc-static). Composite (image + wash) stays
opaque the whole transition — zero see-through on any background (probed). Normal gate
PASS: blank 2%, seam 0%, coSolid 0, 59.9fps, jank 1/686.
