---
id: scroll-clip-rise
name: "Scroll clip-rise (text+image section rises from under a bottom mask — photo column + body per-line)"
level: 2
kind: component
status: official
entry:
  call: "ScrollClipRise.create(target, opts)  // target = the section. Mark elements with data-rise (rise whole) and a copy container with data-rise-lines (split into masked lines). opts: { riseSelector, lineSelector, duration, ease, stagger, lineStagger, start, once, manageLenis }."
  module: iife
  returns: "{ trigger, play(), hide(), destroy }  (or { static:true, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "Saisei's text+image SECTION reveal — as the section scrolls into view, each element RISES from under a bottom mask: a vertical portrait photo grows up like a column on the LEFT, and the body copy on the RIGHT reveals LINE BY LINE. clip-path inset(100%->0 from the bottom) + translateY + scale + opacity, power3.out; body split into masked lines (overflow:hidden + translateY 100%->0), ~40ms per-line stagger. Axis Y, bottom->top, scroll-driven — the OPPOSITE of center-seam-split (X, centre-out, timeline)."
  when: "The text+image content sections of a Saisei-grade real-estate site — the project INFO / chapter / proof beats: a photo paired with a paragraph that should ASSEMBLE as you scroll to it rather than just appear. The default section-reveal grammar for the body of the site (after the cinematic hero transition)."
  lands: "You scroll to the section and it builds itself: the photo grows upward like a column rising out of the page, and beside it the heading and the paragraph climb up line by line from behind an invisible baseline, each line a beat behind the last. It reads as composed, unhurried, editorial — the section breathing into place, not a block popping in."
  not_when: "A hero / page-transition (that's center-seam-split — X axis, timeline). Content that should be visible immediately (no scroll-reveal). A single element (just animate it). When the section has no clean bottom edge to mask against. Reversing on scroll-up (set once:false only if intentional)."
source:
  grammar: "Saisei /project INFO section: the cream section rises from under the dark hero; a left portrait photo grows up as a column; the right body reveals line-by-line bottom->top; the same primitive repeats for the next media block (systemic, not one-off)."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S6; v4 x_008-x_036)"
  registry_ref: ["S6-scroll-clip-rise-saisei"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + guarded Lenis 1.1.13"
webgl: false
motion_props: [clip-path, transform, opacity]
trigger: "ONE ScrollTrigger onEnter (start 'top 80%', once) — scroll-into-view, not pinned/scrubbed"
timing_layer: [B-entrance, A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [chapter, material, proof]
combines_with: [center-seam-split, content-stage-cascade, mask-up-title, theme-tween, corner-frame-meta]
anti_combos: [section-pager]
gated_by: [R_perf_limits, R_one_scroll_owner]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "on scroll-into-view, every [data-rise] element rises from under a bottom mask: clip-path inset(100% 0 0 0) -> inset(0), + translateY(12px)->0 + scale(1.04)->1 + opacity 0->1, power3.out, staggered"
  - "a [data-rise-lines] container is split into masked lines (overflow:hidden + inner translateY 110%->0) revealed per-line with ~40ms stagger"
  - "axis is Y, bottom->top (the opposite of center-seam-split's X centre-out); scroll-driven via ScrollTrigger onEnter"
  - "the hidden state is set THROUGH gsap.set (gsap owns the transform channel) so lines/risers don't stall mid-rise"
  - "clip-path + transform + opacity only; GPU; NO mix-blend / NO backdrop over the scrubbed surface; NO WebGL"
  - "reduced-motion / <=820px -> shown; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO photo + Ukrainian copy, Saisei cream/ink palette"
gate:
  probe: "Open lab.html (Lenis from jsdelivr). __LAB_OK__ true. Scroll the section into view: the left photo grows up as a column, the eyebrow + serif h2 rise, the body copy reveals per masked line bottom->top. GATE NOTE: the photo is an <img> clipped from the bottom WHILE rising, so the wheel-scroll gate reads those frames as 'blank' (false positive, same class as F-39) — the rise is smooth and the photo is full after reveal. Verify fps/jank directly (the gate still reports fps 59.9, jank ~0.1%)."
note: |
  Brick S6 of the Saisei harvest — the text+image SECTION reveal (the user's second
  focus). Axis Y, bottom->top, scroll-driven: the OPPOSITE engine to center-seam-split
  (X, centre-out, timeline) — do not conflate in the registry. The hidden state MUST be
  set via gsap.set when gsap is present (gsap owns the transform channel) or risers/lines
  stall mid-rise — same bug class as mask-up-title (caught and fixed here). This is the
  default body-section grammar after the cinematic hero transition. Gate blank% is the
  clipped-<img> false positive; fps/jank are real (59.9 / 0.1%).
---

# scroll-clip-rise — text+image section rises from under a bottom mask

Saisei's text+image section reveal: as the section scrolls in, a vertical portrait photo
grows up like a column on the LEFT, and the body copy on the RIGHT reveals line by line —
all rising from under a bottom mask (clip-path inset bottom + translateY + scale),
power3.out, body per-line stagger ~40ms. Axis Y, bottom→top — the opposite of
center-seam-split.

## Markup + call
```html
<section class="scr" id="section">
  <div class="photo" data-rise><img src="…"></div>
  <div class="body">
    <div class="eyebrow" data-rise>QUADRO · ІНФОРМАЦІЯ</div>
    <h2 data-rise>Дім, що відкривається одним рухом…</h2>
    <p class="copy" data-rise-lines>QUADRO — це простір, де архітектура й природа…</p>
  </div>
</section>
```
```js
ScrollClipRise.create('#section', { duration: 0.8, ease: 'power3.out', stagger: 0.1, lineStagger: 0.04, start: 'top 78%' });
```

## Proven (the lab)
OUR QUADRO section: the photo column grows up on the left (clip inset(100%→0)), the
eyebrow + serif h2 rise, the body copy reveals per masked line (4 lines, ~40ms stagger),
all power3.out, on scroll-into-view. Hidden state set via gsap.set (lines reach
translateY 0, no stall — a bug caught and fixed). Cream washi #f1ebd6 / ink #2a2418.
Gate fps 59.9, jank 1/713 (0.1%); the blank% is the clipped-<img> false positive.
