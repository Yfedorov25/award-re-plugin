---
id: content-stage-cascade
name: "Content stage cascade (reveal a page's elements in a fixed depth order — header LAST)"
level: 2
kind: component
status: official
entry:
  call: "ContentStageCascade.create({ stages, gap })  // stages = ordered [{ el, kind:'fade'|'slide-x'|'draw-line'|'fn', dur, ease, from, stagger, fn }]."
  module: iife
  returns: "{ play(onDone), reset(), destroy }"
meaning:
  what: "Saisei's content-reveal choreographer — after a page opens, its elements appear in a FIXED depth order: background -> accent (awards) -> title -> meta -> header LAST, with a small stagger between groups. It does not invent the per-element animation; it ORCHESTRATES them (fade / slide-x / draw-line / a custom fn that delegates to another brick). The header arriving last and quietest is the rule: first the work, then the interface."
  when: "Staging a hero or page after it opens (after a center-seam-split open, or on first load). Any time content should assemble in a deliberate order rather than all at once — the cascade that makes an arrival feel authored. The conductor that ties center-seam-split (open) + mask-up-title (title stage) + the meta + the chrome together."
  lands: "The page doesn't pop in — it assembles: the photo settles, the award tabs slide in from the edge, the big title rises, the small labels fade into the corners, and only then, last and quietly, the header and its hairline draw across the top. It reads as choreography, and the late, soft header says 'the work first, the interface second'."
  not_when: "A single element reveal (just animate it). A page that should appear instantly. When there is no depth order to honour (one thing on screen). It is an orchestrator — don't use it to animate one node."
source:
  grammar: "Saisei project open: bg(center-split) -> awards(slide-from-right) -> title(mask-up) -> eyebrow + corner meta(fade) -> header + toprule(draw) LAST, ~110ms between groups."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S4; v3 f053-084, v2 f106-125)"
  registry_ref: ["S4-content-cascade-saisei"]
stack: "vanilla (GSAP optional — built-in rAF power3 fallback)"
webgl: false
motion_props: [opacity, transform]
trigger: "triggered (play after a page open / on load)"
timing_layer: [B-entrance]
owns_pin: false
owns_scroll: false
page_beat: [hero, chapter, proof]
combines_with: [center-seam-split, mask-up-title, monogram-ring-loader, corner-frame-meta, vertical-awards-rail]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "stages run in order with a group gap; each stage names el + kind (fade / slide-x / draw-line / fn)"
  - "the LAST stage is the header/chrome and it is the quietest (object-before-interface rule)"
  - "a 'fn' stage delegates to another brick (e.g. mask-up-title.play()) for the title; a NodeList stage reveals per-item with its own stagger"
  - "opacity + transform(translateX) + scaleX(line) only; GPU; NO mix-blend / NO backdrop / NO WebGL"
  - "GSAP used if present, else built-in rAF; reduced-motion -> all shown; reset() re-hides; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO hero staged bg->awards->title->meta->header, proven in the combo"
gate:
  probe: "In lab-full (combo): after the dark open, the cascade reveals bg -> awards -> title(rises) -> meta -> header LAST. Triggered DOM reveal (no <img>, not scroll) — the wheel-scroll gate does not apply; verify the ORDER (header arrives last) and that the full transition stays smooth (fps>=50, jank<8%)."
note: |
  Brick S4 of the Saisei harvest — the conductor of the arrival. The header-LAST rule is
  the signature (and echoes catalog-syndrome-dramaturgy: object before interface). It
  delegates the title stage to mask-up-title via kind:'fn', and is the natural follow-on
  to a center-seam-split open. Proven in the 4-brick combo (lab-full) on QUADRO: 0.3%
  jank, header confirmed last, all stages revealed in order.
---

# content-stage-cascade — reveal a page's elements in a fixed depth order (header LAST)

Saisei's content choreographer: after a page opens, its elements assemble in a fixed
order — background → awards → title → meta → header LAST — with a small stagger. It
orchestrates per-element reveals (fade / slide-x / draw-line / a custom fn that delegates
to another brick). The late, quiet header is the rule: the work first, the interface
second.

## Markup + call
```js
var titleApi = MaskUpTitle.create('#title', { stagger: 0.12 });
var cascade = ContentStageCascade.create({
  gap: 0.12,
  stages: [
    { el: '.hero-bg',  kind: 'fade',      dur: 0.7 },
    { el: '.awards .a',kind: 'slide-x',   from: 36, dur: 0.5, stagger: 0.08 },
    { el: '#title',    kind: 'fn', fn: function () { titleApi.play(); } },
    { el: '.eyebrow',  kind: 'fade',      dur: 0.5 },
    { el: '.meta-br',  kind: 'fade',      dur: 0.6 },
    { el: '.toprule',  kind: 'draw-line', dur: 0.7 },   // chrome LAST
    { el: 'header',    kind: 'fade',      dur: 0.5 }
  ]
});
cascade.reset();        // hide chrome
cascade.play();         // after the page opens
```

## Proven (the lab)
lab-full (combo with center-seam-split + monogram-ring-loader + mask-up-title) on OUR
QUADRO: after the dark open, the cascade revealed bg → awards(slide-x) → QUADRO/HOUSE
title(fn → mask-up-title) → 再生 eyebrow + corner meta(fade) → toprule(draw-line) +
header(fade) LAST, gap 0.12s. Final state verified (all opacity 1, title risen, header
last). Full 4-brick transition probe (4× CPU throttle): 0.3% long frames, 59.9fps.
