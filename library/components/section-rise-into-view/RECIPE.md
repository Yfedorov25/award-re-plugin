---
id: section-rise-into-view
name: "Section rise-into-view (a whole full-bleed media block rises up from below + fades in as it scrolls into view, once — the lightest rise: no per-element mask, no cover, no pin)"
level: 2
kind: component
status: official
entry:
  call: "SectionRiseIntoView.create(target, opts)  // target wraps one or more [data-rise-block] (each a full-bleed media block / section). opts: { riseY, scaleFrom, duration, stagger, ease, start, once, manageLenis }."
  module: iife
  returns: "{ triggers, set(p), play(), destroy }"
meaning:
  what: "crownd/finest's section entrance — a whole full-bleed MEDIA BLOCK rises up from below (translateY riseY -> 0) and fades in (0 -> 1) as it scrolls into view, ONCE, power3.out, with a hair of scale-settle. The simplest, lightest 'rise': the WHOLE block moves as one — no per-element masking, no cover, no theme-flip, no pin."
  when: "The plain, calm entrance for a media block or section as the reader reaches it — a render, a gallery block, an image+caption — when you want it to arrive with a gentle lift rather than just popping in, but you DON'T need the ceremony of a masked line-by-line build or a covering panel. The default 'sections breathe in' grammar for a quiet, editorial page; cheap, reusable, unobtrusive."
  lands: "You scroll and the next block slides up the last stretch into place as it fades in — the whole image (and its caption) rising together a beat before it settles. It reads as composed and unhurried, the page bringing each section to you rather than snapping it on, without any showy masking or covering."
  not_when: "A text+image section that should ASSEMBLE line by line (use scroll-clip-rise). A section-to-section hand-off that should COVER the previous one with a theme change (use panel-rise-over). A hero (use hero-video-render-rotator). When the block should already be visible (no reveal). A pinned set-piece (this is not pinned)."
source:
  grammar: "finest: a full-bleed media block rises up from below into view as you scroll, on the warm-paper page, followed by the next heading."
  recording: "apps/quadro/.award-re/teardowns/D_finest_video.md (F4; crownd.at/projekte/finest)"
  registry_ref: ["F4-section-rise-into-view-finest"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity]
trigger: "scroll-into-view reveal (once; not pinned)"
timing_layer: [B-reveal, C-content]
owns_pin: false
owns_scroll: false
page_beat: [section-entrance, media-block, gallery-block]
combines_with: [scroll-zoom-image-pair, fullscreen-media-carousel, script-overline-display-pair, line-art-location-map]
anti_combos: [scroll-clip-rise, panel-rise-over, pin]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "each [data-rise-block] (or the target) plays ONCE on enter (start ~'top 85%'): opacity 0 -> 1 + translateY riseY(80-90px) -> 0 + optional scale scaleFrom(0.98) -> 1, power3.out"
  - "the WHOLE block is one transform target — NO clip-path/mask (clip-path stays none) and NO cover/pin; that's what separates it from scroll-clip-rise and panel-rise-over"
  - "multiple blocks under one create() each fire on their own enter (optional stagger); set(p 0..1) is a PURE scrub across all blocks (preview)"
  - "transform: translateY + scale + opacity only; NO clip-mask / NO mix-blend / NO backdrop; NO WebGL; owns_pin false (not pinned)"
  - "reduced-motion or <=820px -> shown (no play); GSAP+ScrollTrigger required for scroll; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO media blocks rising on warm paper; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll: each full-bleed media block rises up from below + fades in as it reaches view, once. Verify the rise (translateY riseY->0 + opacity 0->1), that clip-path stays NONE (no mask — distinct from scroll-clip-rise), that it's NOT pinned and does NOT cover the previous section (distinct from panel-rise-over), + fps. Scroll-into-view reveal."
note: |
  finest F4. The lightest of the three 'rise' engines — a whole media block translateY+fade on
  enter. Built as a SEPARATE brick (user's call) but kept HONESTLY distinct from its cousins:
  scroll-clip-rise (per-element bottom clip-MASK, text line-by-line) and panel-rise-over (a
  coloured panel that COVERS the previous section + theme-flip + rounded top, PINNED). This one
  has NO mask, NO cover, NO theme-flip, NO pin — just a clean whole-block rise. transform +
  opacity = GPU-cheap. owns_pin false. Proven on QUADRO blocks: translateY 90->0 + opacity
  0->1, clip-path none at all p (confirms no mask), reveal on enter, 0.3% jank @ 59.9fps, zero
  console errors. Pick scroll-clip-rise for assembling text+image, panel-rise-over for a
  covering theme-flip hand-off, and THIS for a plain calm section entrance.
---

# section-rise-into-view — a whole media block rises up + fades in on enter (the lightest rise)

crownd/finest's section entrance: a whole full-bleed media block rises up from below (translateY
→ 0) and fades in as it scrolls into view, once. The simplest "rise" — the whole block moves as
one, no per-element mask, no cover, no pin. Kept distinct from scroll-clip-rise (per-line mask)
and panel-rise-over (cover + theme-flip + pin).

## Markup + call
```html
<section class="sriv-stage" id="rise">
  <div data-rise-block>
    <div class="sriv-media"><img src="a.webp"></div>
    <div class="cap">Caption</div>
  </div>
  <!-- … more blocks … -->
</section>
```
```js
SectionRiseIntoView.create('#rise', { riseY:90, scaleFrom:0.98, duration:1.0, stagger:0.12, manageLenis:false });
```

## Proven (the lab)
3 full-bleed media blocks on OUR QUADRO renders (macro-table / terrace / night) with serif
captions. Curve measured live (set p / opacity / translateY / clip): 0 / 0.00 / 90px / none →
0.5 / 0.88 / 11.3px / none → 1 / 1.00 / 0px / none. clip-path = none at all p (confirms NO mask —
distinct from scroll-clip-rise). Block 2 opacity → 1.00 on scroll-into-view. Screenshot (mid-rise
0.55): a QUADRO interior media block partway up + serif caption "Інтер'єр, прорахований до деталі",
next block peeking (matches finest F4). Probe (4× CPU throttle, scroll): 2/796 long frames (0.3%),
59.9fps → PASS. Zero console errors.
