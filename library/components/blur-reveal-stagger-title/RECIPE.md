---
id: blur-reveal-stagger-title
name: "Blur-reveal stagger title (a headline materialises via per-word blur 20→0, a frosted focus-pull)"
level: 2
kind: component
status: official
entry:
  call: "BlurRevealStaggerTitle.create(target, opts)  // target = a heading element; its text is split into per-word .brst-word spans. opts: { blur, stagger, duration, ease, order }."
  module: iife
  returns: "{ words, play(o), set(p), reset(), destroy }"
meaning:
  what: "11tanjung's headline reveal — a multi-line display title MATERIALISES via a per-word gaussian blur(20px->0) + opacity(0->1), staggered ~100ms per word, with NO translate. A frosted focus-pull: the words don't move, they sharpen into place where they sit. set(p) is a PURE scrub. Distinct from a mask-up/rise reveal."
  when: "The headline that appears after the hero title docks (the freed centre) — or any display heading that should come INTO FOCUS rather than slide or fade. The 11tanjung beat where 'A New Standard of Living' sharpens word by word over the render. Pairs after hero-title-to-nav-pill."
  lands: "The words don't slide or fade in — they swim into focus, one after another, blurry then crisp, as if the title is being brought into the lens. It reads soft and photographic, settling into a sharp cursive line; the focus-pull feels filmic, not mechanical."
  not_when: "Body text (blur-reveal is for display sizes). A title that should read instantly. Over a SCROLLED/VIDEO surface where the blur would re-run every frame (perf — keep it a one-shot reveal). When a hard mask-up/rise is the brand voice instead (Saisei). Long paragraphs."
source:
  grammar: "11tanjung: the cursive 'A New Standard of Living' (3-line diagonal split) materialises per-word via blur(20->0)+opacity, ~100ms stagger, ease-out, no translate; 'A New' sharpens first, 'of Living' last."
  recording: "apps/quadro/.award-re/teardowns/D_11tanjung_video.md (H3 blur-reveal-stagger-title; a027-a033)"
  registry_ref: ["H3-blur-reveal-11tanjung"]
stack: "vanilla (GSAP optional — built-in rAF fallback)"
webgl: false
motion_props: [filter, opacity]
trigger: "triggered (play) or scrubbed (set(p))"
timing_layer: [B-entrance]
owns_pin: false
owns_scroll: false
page_beat: [hero, chapter, proof]
combines_with: [hero-title-to-nav-pill, split-word-headline, render-scroll-scale, coords-corner-frame]
anti_combos: [scrubbed-blur-surface]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the heading text is split into per-word inline-block spans; each starts filter:blur(blur px) + opacity 0 and reveals to blur(0) + opacity 1"
  - "words reveal staggered (~100ms) in reading order (or a custom order); NO translate — the words sharpen in place (focus-pull)"
  - "play() runs the staggered focus-pull (ease-out ~580ms); set(p 0..1) is a PURE scrub of all words; reset() back to blurred"
  - "filter(blur) + opacity only; per-word GPU layer; NO mix-blend / NO backdrop / NO WebGL"
  - "blur animates ONLY on reveal (a burst), not on a continuous scroll/video surface (perf-safe); reduced-motion -> shown sharp; window.__LAB_OK__"
  - "asset-substitution gate: OUR headline (Новий стандарт життя) in the cursive serif over a QUADRO render"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The cursive headline materialises per-word via blur 20->0 + opacity, staggered (one word sharp while the next is still blurred — matches 11tanjung a028), settling to a sharp 3-line split. DOM text filter (no <img>, triggered) — the wheel gate doesn't apply; verify the per-word stagger + smoothness (fps>=50, jank<8%). Blur is a reveal burst (not a scroll surface) so it's perf-safe."
note: |
  Brick 3 of the 11tanjung harvest — the headline focus-pull. blur(20->0) per word, no
  translate (≠ Saisei mask-up-title which rises from a baseline). PERF: the blur is a
  one-shot reveal burst, NOT a continuous scroll/video surface — that's the only safe
  use of filter:blur (over a scrubbed surface it would re-run every frame and tank fps,
  see quadro-scroll-perf). Pairs after hero-title-to-nav-pill (the title docks, then this
  reveals in the freed centre) + split-word-headline (3-line diagonal layout). Cursive =
  Canela/PP-Editorial-Italic class (Playfair italic free stand-in). Proven 1:1 on QUADRO:
  focus-pull cascade, 0% jank.
---

# blur-reveal-stagger-title — a headline materialises via per-word blur 20→0

11tanjung's headline reveal: a multi-line cursive title comes into focus word by word —
each word blur(20px→0) + opacity(0→1), staggered ~100ms, no translate. A frosted
focus-pull: the words sharpen into place where they sit (they don't slide or fade).

## Markup + call
```html
<div class="title" id="title">
  <span class="l1">Новий</span><span class="l2">стандарт</span><span class="l3">життя</span>
</div>
```
```js
// split each line and reveal in reading order with a small line-gap (diagonal cascade)
[...document.querySelectorAll('#title span')].forEach(function (l, i) {
  var a = BlurRevealStaggerTitle.create(l, { blur: 20, stagger: 0.11, duration: 0.58, ease: 'power2.out' });
  setTimeout(function () { a.play(); }, i * 220);
});
```

## Proven (the lab)
OUR QUADRO render, headline "Новий стандарт життя" (3-line split layout, Playfair italic):
each word blur 20→0 + opacity 0→1, stagger 0.11s, power2.out. Mid-reveal verified: "Новий"
blur 3.1px/op .84, "стандарт" 15.3px/.24, "життя" 20px/0 (focus-pull cascade, matches
a028). Probe (4× CPU throttle): 0/268 long frames (0.0%), 59.9fps — blur safe because
it's a reveal burst, not a scroll surface.
