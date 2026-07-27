---
id: script-overline-display-pair
name: "Script-overline display pair (a handwritten script overline in quotes above a huge condensed display title; on scroll the script lifts in, the display reveals line-by-line from a bottom mask, then body+CTA; anchors an alternating L/R section)"
level: 2
kind: component
status: official
entry:
  call: "ScriptOverlineDisplayPair.create(target, opts)  // target = .sodp-stage > .sodp-copy(.sodp-script + .sodp-title[.sodp-line xN] + .sodp-body + .sodp-cta) [+ .sodp-visual]. Add .sodp--rtl to swap sides. opts: { lineStagger, duration, ease, start, once, manageLenis }."
  module: iife
  returns: "{ trigger, play(), set(p), destroy }"
meaning:
  what: "gapsystudio's services type-pair — a small HANDWRITTEN SCRIPT overline (in quotes) above a HUGE CONDENSED display title. On scroll-into-view the script fades + lifts in first, then the display title reveals LINE BY LINE from a bottom mask (inner translateY 100%->0, line-staggered), then the body + CTA fade-rise. The pair anchors one side of an alternating L/R section (text/visual swap via .sodp--rtl). set(p) is a PURE scrub."
  when: "A services / capabilities / manifesto run where each beat is one bold statement and you want a TYPE-LED section, not an image-led one. The handwritten script overline adds a human, studio voice over the loud condensed display; the line-by-line mask reveal makes the big word land with weight. Use it as the repeating spine of a /services or /what-we-do page, alternating the visual side L/R so the rhythm doesn't flatten."
  lands: "You scroll to a section and a casual handwritten line in quotes appears — like a note scrawled above the headline — then the headline itself rolls up into place one big line at a time, tall and condensed, almost filling the column. A sentence of body and a button settle in underneath. The next section mirrors it, visual on the other side. It reads as a confident studio talking in its own hand, the type doing the work."
  not_when: "An image-first or data section (this is type-led). When you have no short, punchy statement to set as the display (it needs a 1-3 word title). A dense paragraph block (the display wants brevity). Repeating it >~5 times without the L/R swap (the rhythm flattens). When the brand voice isn't playful enough for a handwritten overline."
source:
  grammar: "gapsy /services: a handwritten script overline in quotes (e.g. 'Designing Mobile Apps That Make Life Easier!' / 'Design In Motion - Bringing Your Vision To Life!') above a huge condensed display title ('Mobile App Design' / 'Motion Design' / 'Brand Design'), body + 'View More' pill; the section alternates text/visual L<->R; a floating red-pedestal product on the other side (separate brick floating-product-orbit)."
  recording: "apps/quadro/.award-re/teardowns/D_gapsy_video.md (D /services; gapsystudio.com, NO-WebGL basket A)"
  registry_ref: ["D-script-overline-display-pair-gapsy"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity, clip]
trigger: "scroll-into-view reveal (triggered timeline; not a pin)"
timing_layer: [B-reveal, C-content]
owns_pin: false
owns_scroll: false
page_beat: [services, capabilities, manifesto]
combines_with: [floating-product-orbit, drag-tab-reveal, menu-tracked-stagger, coords-corner-frame]
anti_combos: [reveal-over-scrubbed-surface]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a handwritten script overline (.sodp-script, in quotes) sits above a huge condensed display title (.sodp-title)"
  - "on scroll-into-view the script fades opacity 0->1 + translateY 12px->0 (0.00..0.30)"
  - "the display title reveals LINE BY LINE: JS wraps each .sodp-line text in a mask (overflow hidden) + inner span that rises translateY 100%->0 + opacity, line-staggered over 0.15..0.80, power3.out"
  - "body + CTA fade opacity 0->1 + translateY 16px->0 last (0.70..1.00); set(p 0..1) is a PURE scrub"
  - "the section is a CSS grid; .sodp--rtl swaps copy/visual sides for the alternating rhythm; the engine drives only the copy, not the visual aside"
  - "transform(translateY) + opacity + overflow-clip only; NO mix-blend / NO backdrop; NO WebGL; owns_pin false"
  - "reduced-motion or <=820px -> shown (no play); GSAP+ScrollTrigger required for scroll; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO render in the aside + a serif/script overline + condensed display + warm palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll a section in: the handwritten script overline lifts in first, then the huge condensed display title rolls up line by line from a bottom mask, then body+CTA settle. .sodp--rtl mirrors the layout. Scroll-into-view reveal (not a pin). Verify the script->lines->body order + the line bottom-mask + fps/jank. Smoothness via the scroll-into-view path."
note: |
  Brick 1 of the gapsystudio harvest (NO-WebGL basket A — gapsy's home is a WebGL studio-tour
  we do NOT copy; we harvest its flat type/UI engines). A type-led section: handwritten script
  overline + huge condensed display that rolls up line-by-line from a bottom mask, then body+CTA;
  alternating L/R. transform + opacity + overflow-clip = GPU-cheap. owns_pin false. Proven 1:1 on
  QUADRO renders: script in first, display lines ladder from the mask (line 2 staggered behind
  line 1), body+CTA last; 0.2% jank @ 59.9fps, zero console errors. Display stand-in = Anton
  (condensed grotesque, Druk/Anton class); script stand-in = Caveat (handwritten marker).
  gapsy palette = studio near-white #f2f2f0 + warm-black ink + signature red #f0473e accent.
---

# script-overline-display-pair — a handwritten script overline above a huge condensed display, line-by-line reveal

gapsystudio's services type-pair: a small handwritten script overline (in quotes) above a huge
condensed display title. On scroll-into-view the script lifts in first, then the display title
rolls up line by line from a bottom mask, then the body + CTA fade-rise. Anchors one side of an
alternating L/R section (swap with `.sodp--rtl`).

## Markup + call
```html
<section class="sodp-stage" id="s1">
  <div class="sodp-copy">
    <div class="sodp-script">“…handwritten overline…”</div>
    <h2 class="sodp-title">
      <span class="sodp-line">Web</span>
      <span class="sodp-line">Design</span>
    </h2>
    <p class="sodp-body">…</p>
    <a class="sodp-cta" href="#">View more ›</a>
  </div>
  <div class="sodp-visual"><img src="render.webp"></div>
</section>
<!-- add class .sodp--rtl on the next section to mirror -->
```
```js
ScriptOverlineDisplayPair.create('#s1', { lineStagger:0.12, duration:1.0, ease:'power3.out', start:'top 80%', manageLenis:false });
```

## Proven (the lab)
2 alternating sections on OUR QUADRO renders (Веб-дизайн L / Візуальна ідентичність R). Curve
measured live (p / script-op / line-translateY% / body-op):
0 / 0 / [100,100] / 0 → 0.20 / 0.96 / [58,100] / 0 → 0.40 / 1 / [0,100] / 0 → 0.60 / 1 / [0,4] / 0 →
0.80 / 1 / [0,0] / 0.70 → 1 / 1 / [0,0] / 1. Script in first, display lines ladder up from the mask
(line 2 staggered behind line 1), body+CTA last. Settled frame: red-quote Caveat script overline
above the huge Anton condensed "Веб-дизайн", QUADRO render in the aside (matches gapsy /services).
Probe (4× CPU throttle, scrolled in): 1/563 long frames (0.2%), 59.9fps → PASS. Zero console errors.
