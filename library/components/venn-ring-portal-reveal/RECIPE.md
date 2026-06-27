---
id: venn-ring-portal-reveal
name: "Venn ring portal-reveal (a row of outline circles; on scroll the side circles fill->hollow->shrink to dots while the centre circle opens as a clip-path portal onto a full-bleed render)"
level: 2
kind: component
status: official
entry:
  call: "VennRingPortalReveal.create(target, opts)  // target = .vrp-stage wrapping .vrp-render(img) + .vrp-rings(.vrp-ring x N, centre = .vrp-ring--portal) + optional .vrp-labels. opts: { rings, fillEnd, pinFactor, ease, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, set(p), refresh(), destroy }"
meaning:
  what: "11tanjung's signature content reveal — a row of N outline circles that overlap like a venn diagram. On ONE pinned scroll-scrub the SIDE circles do a stroke-width radial fill (thin ring -> solid disc) then hollow + shrink to a dot and drift to the edges, while the CENTRE circle becomes a clip-path: circle(r) mask whose radius scrubs 0% -> ~85%, opening a full-bleed render behind it (+ the render counter-scales 1.15 -> 1). The venn labels fade as the portal opens. set(p) is a PURE scrub. ease power2.out."
  when: "The transition from an editorial/diagrammatic moment INTO a full-bleed image section — the signature 'reveal the building' beat. Use it once, as the hero->content or content->showcase handoff, when you want the image to be EARNED (drawn open from a centre point) instead of just appearing. The side rings carry small index labels (/01 /02 /03) that read as a three-act idea collapsing into the one image."
  lands: "You scroll and three thin circles in a row first thicken — the outer two fill solid, like ink flooding a ring — then they hollow out and shrink away to dots that slide off to the sides, while the middle circle blooms open from a pinpoint into a full-screen photo of the building that settles as it grows. It reads as a deliberate aperture opening, a portal earned by the scroll, not a slide that appears."
  not_when: "A plain section change (use panel-rise-over or a crossfade). When there's no hero image worth a ceremonial open. More than once per page (it's a signature; repeating it cheapens it). Over a video or a scrubbed surface that already moves (the clip-path open wants a still render under it). When the page can't spare a full pinned viewport-and-a-bit of scroll for one reveal."
source:
  grammar: "11tanjung C1 (SIGNATURE): N outline circles in a row (overlapping = venn). On scroll the side circles stroke-width radial-fill -> hollow -> shrink-to-dot + drift out; the centre circle becomes clip-path: circle(r) mask, r 0 -> full, revealing a full-bleed render (+ render counter-scale 1.15 -> 1); venn labels fade. scrub, mask ease-out."
  recording: "apps/quadro/.award-re/teardowns/D_11tanjung_video.md (C1 venn-ring-portal-reveal; b024 thin rings -> b028 side discs filled -> b033 side dots + centre portal opening -> b048 full render)"
  registry_ref: ["C1-venn-ring-portal-reveal-11tanjung"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [clip-path, border-width, transform, opacity]
trigger: "owns_pin scroll-scrub (pinned for innerHeight*pinFactor; the move IS the scroll)"
timing_layer: [B-reveal, C-content]
owns_pin: true
owns_scroll: false
page_beat: [hero-to-content, showcase-reveal]
combines_with: [hero-title-to-nav-pill, preloader-band-collapse, render-scroll-scale, split-word-headline, coords-corner-frame]
anti_combos: [center-seam-split, panel-rise-over, second-pin]
gated_by: [R_anti_combos, R_perf_limits, R_owns_pin]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "N outline circles sit in a row (overlapping = a venn); the centre one (.vrp-ring--portal) is the portal mask, the rest are side rings"
  - "on scroll the SIDE rings fill (border-width 1px -> ~61px, a disc) over 0..fillEnd, then hollow back to 1px + shrink (scale -> 0.06) + drift outward (translateX) over fillEnd..1, opacity easing down"
  - "the CENTRE opens a clip-path: circle(0% -> ~85% at 50% 50%) on the render; the render counter-scales 1.15 -> 1; the centre guide ring fades over the first 60%"
  - "the venn labels (/01 /02 /03 + caption) fade over the first 50%; set(p 0..1) is a PURE scrub (0 = three thin closed rings, 1 = portal full)"
  - "clip-path + border-width + transform + opacity only; NO mix-blend / NO backdrop over the scrubbed render; NO WebGL; owns_pin (one pin, span = innerHeight*pinFactor)"
  - "reduced-motion or <=820px -> portal open (render shown), no pin; GSAP+ScrollTrigger required for the scroll path; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO render revealed through the portal + warm-brown fields + cream rings + '11 tanjung' cursive pill"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the pinned stage: three thin rings -> side rings fill to discs -> side rings hollow + shrink to dots + drift out while the centre circle opens a clip-path portal onto the QUADRO render (counter-scaling 1.15->1), labels fading. owns_pin scroll-scrub. GATE-BLINDSPOT: clip-path media -> a naive blank% probe FALSE-blanks at p<1; verify the portal-radius + side-border curve + fps/jank, NOT blank%. Drive the LAB's own pinned instance to screenshot (do NOT create() a second instance — two pins on one element conflict)."
note: |
  Brick 4 of the 11tanjung harvest — the SIGNATURE content reveal. A row of venn circles
  collapses (side rings fill -> hollow -> dots drift out) while the centre circle opens a
  clip-path portal onto a full-bleed render. Distinct from Saisei's center-seam-split (a
  two-panel slide) and from panel-rise-over (a single-edge rounded curtain): this is a
  CIRCULAR aperture grown from a centre point, with the side rings as the choreography that
  earns it. owns_pin (one pinned scroll). clip-path circle is GPU-cheap. Proven 1:1 on the
  QUADRO render: portal radius 0%->85% power2.out, side border peaks ~55px at fillEnd then
  hollows + drifts, 0.1% jank @ 59.9fps. Cursive pill = Canela / PP Editorial Italic class
  (Playfair Display italic is the free stand-in).
---

# venn-ring-portal-reveal — a row of outline circles collapses while the centre opens a clip-path portal onto a full-bleed render

11tanjung's signature reveal: N outline circles in a row (overlapping = a venn). On a single
pinned scroll-scrub the side circles fill into discs, hollow out, shrink to dots and drift to
the edges, while the centre circle becomes a `clip-path: circle(r)` mask that opens 0% → ~85%
onto a full-bleed render (the render counter-scales 1.15 → 1 as it grows); the venn labels fade.

## Markup + call
```html
<section class="vrp-stage" id="venn">
  <div class="vrp-render"><img src="render.webp" alt="…"></div>
  <div class="vrp-rings">
    <div class="vrp-ring"><span class="lbl"><b>01</b>…</span></div>
    <div class="vrp-ring vrp-ring--portal"></div>
    <div class="vrp-ring"><span class="lbl"><b>03</b>…</span></div>
  </div>
</section>
```
```js
VennRingPortalReveal.create('#venn', { fillEnd:0.4, pinFactor:1.4, ease:'power2.out', manageLenis:false });
```

## Proven (the lab)
OUR QUADRO render (terrace.webp) behind three rings. Curve measured live
(p / clip-radius / side-border / render-scale):
0 / 0% / 1px / 1.15 → 0.2 / 30.6% / 31px / 1.096 → 0.36 / 50.2% / 55px / 1.061 →
0.62 / 72.7% / 25px / 1.022 → 0.78 / 80.9% / 9px / 1.007 → 0.85 / 83.1% / 4px / 1.003 →
1 / 85% / 1px / 1. Side border peaks ~55px near fillEnd then hollows back to 1px while the
disc shrinks + drifts out. Mid-portal frame (p=0.62): the QUADRO building revealed through a
centre circle, two hollow side rings (/01 /03), warm-brown fields, "11 tanjung" pill top-centre
(matches 11tanjung b033). Probe (4× CPU throttle): 1/682 long frames (0.1%), 59.9fps → PASS.
