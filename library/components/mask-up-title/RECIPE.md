---
id: mask-up-title
name: "Mask-up title (a large serif title rises from under a baseline mask, line by line)"
level: 2
kind: component
status: official
entry:
  call: "MaskUpTitle.create(target, opts)  // target = container with .mut-line wrappers (overflow:hidden), each holding the moving text as its first child. opts: { lineSelector, stagger, duration, ease, from }."
  module: iife
  returns: "{ lines, play(o), set(p), reset(), destroy }"
meaning:
  what: "Saisei's big-title reveal — a large serif title RISES from under a baseline mask, line by line (overflow:hidden wrapper + the inner line translateY(110% -> 0)), staggered, expo.out. Not a fade — the words slide up from behind the line, as if printed onto a rising sheet. set(p) is a PURE scrub so it can also be scroll-driven."
  when: "The big serif title of a hero or a project header — the reveal beat after the page opens. The display moment in a Saisei-grade content cascade (it is the 'title' stage). Anywhere a large headline should arrive with intent rather than a plain fade."
  lands: "The headline doesn't fade in — it rises into place, each line climbing up from behind an invisible baseline, one after the other, settling with a soft expo tail. It reads as typeset, deliberate, expensive; the words feel printed onto a sheet sliding up into view."
  not_when: "Small body text (the mask-rise is for display sizes). A title that should read instantly (the rise delays it). When there's no clean baseline to mask against (needs an overflow:hidden line box). Long multi-line paragraphs (use a per-line body reveal / scroll-clip-rise instead)."
source:
  grammar: "Saisei project hero: SHIZUKA then GARDENS rise from under the baseline, per line, line-height ~0.9, expo.out, ~100ms stagger."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S5; v3 f066-073)"
  registry_ref: ["S5-mask-up-title-saisei"]
stack: "vanilla (GSAP optional — built-in rAF expo tween fallback)"
webgl: false
motion_props: [transform]
trigger: "triggered (play) or scrubbed (set(p)) — not inherently scroll-bound"
timing_layer: [B-entrance]
owns_pin: false
owns_scroll: false
page_beat: [hero, chapter, proof]
combines_with: [content-stage-cascade, center-seam-split, fluid-type-sizing, bleeding-wordmark]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "each .mut-line is an overflow:hidden wrapper; its inner line starts translateY(from%) (below the mask) and rises to 0, staggered per line"
  - "play() runs the staggered rise (expo.out); set(p 0..1) is a PURE scrub of all lines; reset() returns to hidden"
  - "transform(translateY) + wrapper overflow:hidden only; GPU; NO mix-blend / NO backdrop / NO WebGL"
  - "GSAP drives a proxy writing the SAME style.transform channel as set() (play and set never conflict); built-in rAF fallback"
  - "reduced-motion -> instant shown; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR title (QUADRO / HOUSE) in the Saisei serif, proven in the combo"
gate:
  probe: "In lab-full (combo): the QUADRO / HOUSE serif title rises from under the baseline mask, per line, after the page opens. DOM text transform (no <img>, triggered) — the wheel-scroll gate does not apply; verify the lines rise + settle smoothly (translateY(0) at rest) and the full transition stays smooth."
note: |
  Brick S5 of the Saisei harvest — the title stage of the content cascade. The rise (not
  a fade) is the whole point. GSAP drives a proxy that writes the same style.transform
  channel as set(), so play() and set() never fight over translate vs yPercent (a bug
  caught in the combo: the title stayed under the mask when GSAP yPercent collided with
  manual translateY). Pair with content-stage-cascade (as a 'fn' stage) and
  center-seam-split (rises after the open). Proven in the 4-brick combo (0.3% jank).
---

# mask-up-title — a large serif title rises from under a baseline mask

Saisei's big-title reveal: each line of a large serif title rises from under an invisible
baseline (overflow:hidden wrapper + translateY 110%→0), staggered, expo.out. Not a fade —
the words climb into place as if printed onto a rising sheet. `set(p)` is a pure scrub so
it can be scroll-driven too.

## Markup + call
```html
<div class="title" id="title">
  <span class="mut-line"><span>QUADRO</span></span>
  <span class="mut-line"><span>HOUSE</span></span>
</div>
```
```js
var t = MaskUpTitle.create('#title', { stagger: 0.12, duration: 1.0, ease: 'expo.out', from: 115 });
t.play();              // or t.set(scrollProgress) to scrub it
```

## Proven (the lab)
lab-full (combo with center-seam-split + monogram-ring-loader + content-stage-cascade) on
OUR QUADRO: the QUADRO / HOUSE serif title rises from under the baseline mask, per line,
stagger 0.12s, expo.out — verified translateY(0%) at rest. Full 4-brick transition probe
(4× CPU throttle): 0.3% long frames, 59.9fps.
