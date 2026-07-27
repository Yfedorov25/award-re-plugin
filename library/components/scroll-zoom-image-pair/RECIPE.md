---
id: scroll-zoom-image-pair
name: "Scroll-zoom image-pair (a portrait render in a clipping frame that scales up on scroll, paired L/R with a serif heading + body that holds; copy reveals once on enter)"
level: 2
kind: component
status: official
entry:
  call: "ScrollZoomImagePair.create(target, opts)  // target = .szp-stage > .szp-figure(.szp-frame > img) + .szp-copy([data-zoomcopy]). Add .szp--rtl to swap sides. opts: { zoomFrom, zoomTo, drift, ease, revealCopy, start, end, manageLenis }."
  module: iife
  returns: "{ trigger, reveal, set(p), destroy }"
meaning:
  what: "crownd/finest's editorial pair — a portrait render in a fixed clipping frame on one side + a serif heading/body on the other. As the section passes through the viewport the image SCALES UP within its frame (a scroll-scrubbed Ken-Burns bound to the frame: the frame clips, the image grows ~1.0 -> ~1.14) while the copy holds; the copy rises in once on enter."
  when: "An editorial 'feature' beat — architecture, materials, a single statement render + a paragraph — where you want the image to feel ALIVE as it passes (a slow push-in) without taking over the screen. Use it as the repeating spine of a project narrative, alternating the render L/R; the framed zoom reads premium and calm, the held serif copy carries the message. The opposite of a busy gallery — one render, one thought, gently moving."
  lands: "A tall render sits in a neat frame beside a serif headline and a short paragraph. As you scroll past, the image slowly pushes in within its frame — the edges stay put, the scene just grows a little closer — while the words hold steady, having risen quietly into place as the section arrived. It feels editorial and unhurried, like a printed spread that breathes."
  not_when: "A full-bleed hero (use hero-video-render-rotator). A gallery of many shots (use fullscreen-media-carousel). Body-only sections (no render). When the render shouldn't move (drop the zoom). A pinned set-piece (this is NOT pinned — it scrubs across its natural pass)."
source:
  grammar: "finest: a portrait render (left) + 'Architektur vom Allerfeinsten' serif heading + body (right); on scroll the render gently scales/parallax-zooms within its frame while the copy holds."
  recording: "apps/quadro/.award-re/teardowns/D_finest_video.md (F3; crownd.at/projekte/finest)"
  registry_ref: ["F3-scroll-zoom-image-pair-finest"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity, clip]
trigger: "scroll-scrub (not pinned) + a one-shot copy reveal on enter"
timing_layer: [C-content, B-reveal]
owns_pin: false
owns_scroll: false
page_beat: [feature, editorial, project-narrative]
combines_with: [hero-video-render-rotator, fullscreen-media-carousel, script-overline-display-pair, line-art-location-map]
anti_combos: [pin, full-bleed-hero]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a portrait render sits in a .szp-frame (overflow hidden, aspect-ratio) beside a .szp-copy serif heading + body; .szp--rtl swaps sides"
  - "a scroll-scrub over the section's pass (start 'top bottom', end 'bottom top') scales the image zoomFrom -> zoomTo (default 1.0 -> 1.14); the frame CLIPS the overflow (the image grows, the frame box doesn't)"
  - "the copy ([data-zoomcopy]) reveals ONCE on enter (top 72%): opacity 0->1 + translateY 26px->0, ~0.9s cubic-bezier(.22,1,.36,1)"
  - "optional translateY drift for parallax; set(p 0..1) is a PURE scrub of the zoom"
  - "transform scale/translateY (image) + opacity/translateY (copy) + overflow clip (frame) only; NO mix-blend / NO backdrop; NO WebGL; owns_pin false (not pinned)"
  - "reduced-motion or <=820px -> static (image at zoomFrom, copy shown); GSAP+ScrollTrigger required; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO render in the frame + a serif heading + warm paper palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll a pair through the viewport: the render slowly scales up WITHIN its frame (the frame edges stay put — overflow clipped) while the serif copy holds, having risen in once on enter. .szp--rtl mirrors. Scroll-scrub, NOT pinned. Verify the zoom ramp (zoomFrom->zoomTo), the frame clip (overflow hidden), the copy reveal + fps. Distinct from a full-bleed Ken-Burns hero (this is framed + paired with copy, not pinned)."
note: |
  finest F3. A framed scroll-zoom render paired L/R with held serif copy — an editorial feature
  beat. CONFIRMED NEW: render-scroll-scale was only ever a concept-reference in teardowns, never
  a standalone brick; and this is more than a bare Ken-Burns — the zoom is BOUND TO A FRAME
  (overflow clip) and paired with copy, not pinned. transform scale + opacity + overflow clip =
  GPU-cheap. owns_pin false (scrubs across the natural pass, no pin). Proven on QUADRO renders:
  scale 1.0->1.14 linear, frame clips, copy reveals on enter, 0.2% jank @ 59.9fps, zero console
  errors. Serif stand-in = Playfair Display (Canela / PP-Editorial class). Pair with
  script-overline-display-pair (gapsy) or alternate sides for a project narrative spine.
---

# scroll-zoom-image-pair — a framed render scroll-zooms beside held serif copy

crownd/finest's editorial pair: a portrait render in a clipping frame that scales up on scroll
(the frame clips, the image grows ~1.0 → ~1.14) paired L/R with a serif heading + body that holds;
the copy rises in once on enter. Not pinned — it scrubs across the section's natural pass.

## Markup + call
```html
<section class="szp-stage" id="pair">
  <div class="szp-figure"><div class="szp-frame"><img src="render.webp"></div></div>
  <div class="szp-copy" data-zoomcopy>
    <h2>Heading</h2>
    <p>…</p>
  </div>
</section>
<!-- add .szp--rtl on the next section to mirror -->
```
```js
ScrollZoomImagePair.create('#pair', { zoomFrom:1.0, zoomTo:1.14, revealCopy:true, manageLenis:false });
```

## Proven (the lab)
Two L/R pairs on OUR QUADRO renders (day-front + a serif heading, then terrace rtl). Measured
live: zoom scale 1.0 → 1.035 → 1.07 → 1.105 → 1.14 across p (linear); frame overflow = hidden
(clip confirmed); copy opacity → 1 on enter. Screenshot (mid-zoom 1.07): the QUADRO render scaled
within its 4:5 frame + "Архітектура найвищого ґатунку" serif heading + body held beside (matches
finest F2). Probe (4× CPU throttle, scroll-scrub): 1/618 long frames (0.2%), 59.9fps → PASS. Zero
console errors.
