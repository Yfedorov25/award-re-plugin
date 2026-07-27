---
id: editorial-act-crossfade
name: "Editorial act-crossfade (one pinned scroll drives N acts that crossfade 4 layers at once — full-bleed image push-zoom + crossfade, split-word headline with a swapping centre word, topline-label swap, body crossfade)"
level: 2
kind: component
status: official
entry:
  call: "EditorialActCrossfade.create(target, opts)  // target = .eac-stage wrapping .eac-images(.eac-img[data-act] x N) + .eac-headline(.eac-fixed--l + .eac-centre(.eac-word[data-act] x N) + .eac-fixed--r) + .eac-toplines + .eac-bodies. opts: { xfade, zoom, pinFactor, ease, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, set(p), acts, refresh(), destroy }"
meaning:
  what: "11tanjung's editorial acts — ONE pinned scroll-progress drives N acts that cross-fade through 4 synchronized layers at once: (1) a full-bleed image that push-zooms scale(1 -> 1.12) across its window and cross-fades into the next act's image at the seam, (2) a split-word headline on a 3-cell grid (two fixed italic words left-mid + right-mid + a large CENTRE word that SWAPS per act), (3) a topline label swap, (4) a body crossfade. Carries split-word-headline (C3) as its headline layer. set(p) is a PURE scrub across all acts."
  when: "A short editorial run that re-states ONE idea three ways over a single pinned scroll — the 'three acts' beat (Standard / Style / Uncompromised). Use it when you have 2-4 hero-grade renders and want each to land as a held statement (image + a one-word claim + a line of body) rather than a gallery scroll. The fixed words keep a sentence frame; only the puant-word changes, so the eye reads the SHIFT IN MEANING, not a re-layout. One pin, one progress — feels authored, not paginated."
  lands: "You scroll and a full-bleed render slowly pushes in, with a sentence laid across it — two small italic words anchored left and right of a big centre word. As you keep going the render dissolves into the next while the centre word swaps and the line of text underneath changes, the frame of the sentence holding still. It reads like turning the pages of one thought: same grammar, three images, three claims, a steady drift of zoom under each."
  not_when: "A plain section change (use panel-rise-over or a single crossfade). A scrollable gallery of unrelated images (this wants ONE idea restated). A video or already-moving surface under the headline (the push-zoom wants a still render). When you can't spare ~one viewport of pinned scroll per act. More than ~4 acts (the held-statement rhythm flattens into a slideshow)."
source:
  grammar: "11tanjung C2 editorial-act-crossfade: full-bleed image push-zoom scale 1->1.12 + crossfade onto the next; synchronously the split-headline centre word swaps (opacity), the topline label swaps, the body crossfades; ONE scroll-progress on 4 layers; ~3-3.5s scroll per act; runs 3 acts (Standard / Style / Uncompromised). C3 split-word-headline: the headline = 3 italic words on a grid (left-mid 'Live' / right-mid 'with' / centre-large '{var}'); the centre word is a swappable slot."
  recording: "apps/quadro/.award-re/teardowns/D_11tanjung_video.md (C2 editorial-act-crossfade + C3 split-word-headline; 'Live with Standard -> Style -> Uncompromised')"
  registry_ref: ["C2-editorial-act-crossfade-11tanjung", "C3-split-word-headline-11tanjung"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [opacity, transform]
trigger: "owns_pin scroll-scrub (pinned for innerHeight*pinFactor; ~1 viewport per act)"
timing_layer: [C-content]
owns_pin: true
owns_scroll: false
page_beat: [editorial-acts, manifesto, showcase]
combines_with: [venn-ring-portal-reveal, hero-title-to-nav-pill, render-scroll-scale, coords-corner-frame, panel-rise-over]
anti_combos: [center-seam-split, second-pin, video-under-headline]
gated_by: [R_anti_combos, R_perf_limits, R_owns_pin]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "N acts read from the DOM (.eac-img[data-act] / .eac-word[data-act] / .eac-topline / .eac-body); ONE pinned scroll-progress drives all of them"
  - "each live image push-zooms scale(1 -> 1+zoom, default 1.12) across its own window, then cross-fades (opacity, ease-out) into the next over the last `xfade` of the window"
  - "the split-word headline has two FIXED italic words (left-mid + right-mid) on a 3-cell grid + a large CENTRE word that swaps per act (opacity crossfade); the fixed words never change"
  - "the topline label and the body paragraph share the SAME opacity envelope as the live image (four layers, one progress); set(p 0..1) is a PURE scrub"
  - "opacity (crossfade) + transform: scale (push-zoom) only; readability scrim baked into each image layer (static); NO mix-blend / NO backdrop over the scrubbed images; NO WebGL; owns_pin"
  - "reduced-motion or <=820px -> first act shown static, no pin; GSAP+ScrollTrigger required for scroll; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO renders crossfading + split-word headline + warm-black/warm-white palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true, acts read from DOM. Scroll the pinned stage: each render push-zooms (scale 1->1.12) then crossfades to the next; synchronously the centre headline word swaps, the topline swaps, the body crossfades — all on one progress. owns_pin scroll-scrub. Verify the 4-layer sync (image opacity == word == topline == body at every p) + the push-zoom + the crossfade seams + fps/jank. Drive the LAB's own pinned instance to screenshot (do NOT create() a second instance — two pins on one element conflict)."
note: |
  Brick 5 of the 11tanjung harvest — the editorial acts (C2) WITH split-word-headline (C3)
  folded in as its headline layer (one scroll-progress; building C3 apart would duplicate
  the progress engine — handoff step 5 is 'C2+C3' as one brick). The signature is RESTRAINT:
  a fixed sentence frame (Live … with) with one swapping puant-word and a steady push-zoom
  drift, three renders crossfading. Distinct from a gallery (one idea, not many images) and
  from center-seam-split / panel-rise-over (those are section transitions; this is an
  in-section three-beat). owns_pin. opacity + scale only = GPU-cheap. Proven 1:1 on QUADRO
  renders: push-zoom 1->1.12 power2.out crossfade, all four layers synced, 0.3% jank @
  59.9fps, zero console errors. Cursive display = Canela / PP Editorial Italic class
  (Playfair Display italic is the free stand-in).
---

# editorial-act-crossfade — one pinned scroll drives N acts that crossfade 4 layers at once

11tanjung's editorial acts: a single pinned scroll-progress moves through N acts, each a held
statement built from four synchronized layers — a full-bleed render that push-zooms `scale(1 →
1.12)` and crossfades into the next, a split-word headline (two fixed italic words + a swapping
centre word), a topline label that swaps, and a body line that crossfades. One idea, restated.

## Markup + call
```html
<section class="eac-stage" id="acts">
  <div class="eac-images">
    <div class="eac-img" data-act="0"><img src="a.webp"></div>
    <div class="eac-img" data-act="1"><img src="b.webp"></div>
    <div class="eac-img" data-act="2"><img src="c.webp"></div>
  </div>
  <div class="eac-headline">
    <div class="eac-fixed--l">Live</div>
    <div class="eac-centre">
      <div class="eac-word" data-act="0">Standard</div>
      <div class="eac-word" data-act="1">Style</div>
      <div class="eac-word" data-act="2">Uncompromised</div>
    </div>
    <div class="eac-fixed--r">with</div>
  </div>
  <div class="eac-toplines">… .eac-topline[data-act] …</div>
  <div class="eac-bodies">… .eac-body[data-act] …</div>
</section>
```
```js
EditorialActCrossfade.create('#acts', { xfade:0.28, zoom:0.12, pinFactor:3.0, ease:'power2.out', manageLenis:false });
```

## Proven (the lab)
3 acts on OUR QUADRO renders (terrace → day-front → night). Curve measured live
(p / image-opacity / image-scale / centre-word-opacity):
0 / [1,0,0] / [1.000,1,1] / [1,0,0] → 0.28 / [.33,.67,0] / [1.101,1,1] / [.33,.67,0] (seam) →
0.33 / [0,1,0] / [1.119,1,1] / [0,1,0] → 0.62 / [0,.25,.75] / [1,1.103,1] / [0,.25,.75] (seam) →
1 / [0,0,1] / [1,1,1.120] / [0,0,1]. All four layers share one opacity envelope; each live
image push-zooms 1→1.12 then crossfades. Mid-act frame (p=0.5, "Style"): the day-front QUADRO
render under "Live | Style | with", topline "/ 02 — THE FORM", body crossfaded (matches
11tanjung act 2). Probe (4× CPU throttle): 3/1017 long frames (0.3%), 59.9fps → PASS. Zero
console errors.
