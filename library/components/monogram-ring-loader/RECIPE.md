---
id: monogram-ring-loader
name: "Monogram + ring loader (a brand glyph with a stroking ring + grid skeleton, held as a real network-wait gate)"
level: 2
kind: component
status: official
entry:
  call: "MonogramRingLoader.create(target, opts)  // target = element/selector or null (=body). opts: { glyph, html, bg, ink, ringR, grid, minHold, z }."
  module: iife
  returns: "{ el, show(), ready(), hide(), whenDone(cb), destroy }"
meaning:
  what: "Saisei's interstitial loader — a centred brand monogram (木 / a logo glyph) fades in, a thin SVG ring strokes ON around it (stroke-dashoffset full->0), and the next page's grid skeleton (vertical column rules) strokes in top->down. The crux: it is NOT a timed flourish but a real NETWORK-WAIT GATE — it holds for a minimum time AND until the page signals ready(), then retracts. The interstitial that sits in the gap of a page transition."
  when: "Between a page CLOSE and a page OPEN — the held moment of a transition where the next page is loading. Especially for real-estate sites with heavy renders: the monogram + grid-skeleton mask the load instead of a blank flash, and it resolves exactly when the content is ready, not on a guessed timer. Pair: center-seam-split close -> this loader -> center-seam-split open."
  lands: "After the page seals shut in cream, a small brand mark settles in the centre and a thin ring quietly draws itself around it, while faint vertical rules sketch in the next page's columns — it reads as the site composing the next page, holding just long enough, then clearing the moment it is ready. Not a spinner, not a fixed pause — a branded, intentional wait."
  not_when: "An instant transition with no load to mask (the hold buys nothing). A fade/dissolve transition (the loader wants a solid field to sit on). When you cannot signal ready() (then it is just a timer — acceptable but loses the point). Stacking it with another full-screen overlay."
source:
  grammar: "Saisei page transition: on the cream interstitial, 木 + a stroking ring + vertical grid rules of the next page draw in and hold across the real load (URL changes mid-hold, tab spinner active), then retract as the new page opens."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S2 + S3; v2 f071-099, v3 f011-036)"
  registry_ref: ["S2-monogram-loader-saisei"]
stack: "vanilla (GSAP optional — built-in rAF tween fallback) + inline SVG"
webgl: false
motion_props: [opacity, stroke-dashoffset, transform]
trigger: "triggered overlay (sits in a transition gap), held by a min-hold + resolve-when-ready contract"
timing_layer: [T-transition]
owns_pin: false
owns_scroll: false
page_beat: [preloader, transition]
combines_with: [center-seam-split, content-stage-cascade, grid-skeleton-draw, mask-up-title]
anti_combos: [second-overlay]
gated_by: [R_anti_combos, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "show() fades the monogram in, strokes the SVG ring ON (stroke-dashoffset full->0), and draws the grid rules (scaleY 0->1, staggered top-down)"
  - "it HOLDS until BOTH minHold elapsed AND ready() called — never a hardcoded ms (resolve-when-ready)"
  - "hide() / auto-hide retracts: ring un-draws, rules recede, monogram + root fade; whenDone(cb) fires after"
  - "opacity + SVG stroke-dashoffset + transform(scaleY) only; NO mix-blend / NO backdrop; NO WebGL"
  - "GSAP used if present, else a built-in rAF tween; reduced-motion -> instant; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR monogram (木 / QUADRO mark) + cream/ink brand palette, proven in the combo"
gate:
  probe: "In lab-full (combo): after the cream close, the 木 + stroking ring + grid rules hold on the cream gap, then retract and chain the dark open. Triggered SVG/DOM overlay (no <img>, not scroll) — the wheel-scroll gate does not apply; verify the hold respects minHold + ready() and the full transition stays smooth (fps>=50, jank<8%)."
note: |
  Brick S2 of the Saisei harvest — the interstitial that sits in the GAP of a
  center-seam-split transition. THE contract is min-hold + resolve-when-ready (call
  ready() when the page is loaded), NOT a fixed timer — so the grid-skeleton + ring stay
  in sync with real content readiness. Built to chain: seam.close -> loader.show ->
  loader.ready() (on load) -> loader.whenDone(seam.open). Distinct, stealable secondary
  move alongside the center seam. SVG/DOM (no <img>) so the smoothness-gate doesn't apply
  — verified in the combo (0.3% jank across the full 4-brick transition).
---

# monogram-ring-loader — a brand glyph + stroking ring, held as a real network-wait gate

Saisei's interstitial loader: a centred monogram (木) fades in, a thin SVG ring strokes
on around it, and the next page's grid skeleton (vertical rules) draws in — held until
the page is actually ready, then retracted. Not a spinner, not a fixed pause — a branded,
intentional wait that masks a real load.

## Markup + call (chained in a transition)
```js
var seam = CenterSeamSplit.create(document.body, { fill:'#f0e9d2' }); seam.set(1);
seam.close({ onComplete: function () {
  var loader = MonogramRingLoader.create(document.body, { glyph:'木', minHold:900, grid:[7,50,93] });
  loader.show();
  // when the new page is actually loaded:
  loader.ready();                                  // hides once minHold ALSO elapsed
  loader.whenDone(function () {
    loader.destroy(); seam.destroy();
    var dark = CenterSeamSplit.create(document.body, { fill:'#0e0e0c' }); dark.set(0);
    dark.open();                                   // reveal the new page
  });
}});
```

## Proven (the lab)
lab-full (combo with center-seam-split + mask-up-title + content-stage-cascade) on OUR
QUADRO: after the cream close, the 木 monogram + stroking ring + 3 grid rules hold on the
cream gap (minHold 900ms), `ready()` at ~1100ms, then retract and chain the dark open.
Full 4-brick transition probe (4× CPU throttle): 1/311 long frames (0.3%), 59.9fps.
