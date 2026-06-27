---
id: preloader-band-collapse
name: "Preloader band-collapse (a dark intro panel collapses to a centre band, revealing the hero top+bottom; wordmark persists)"
level: 2
kind: component
status: official
entry:
  call: "PreloaderBandCollapse.create(target, opts)  // target wraps .pbc-panel + .pbc-mark + .pbc-counter. opts: { bg, ink, collapseDur, collapseEase, counter, counterDur, markHandoff, minHold }."
  module: iife
  returns: "{ run(onReveal), ready(), set(p), destroy }"
meaning:
  what: "11tanjung's intro — a dark full-screen preloader (a cursive wordmark centred + a fake 0->100 counter) that, when ready, COLLAPSES VERTICALLY into a thin horizontal band at the centre and vanishes, revealing the hero SIMULTANEOUSLY from top and bottom. A clip-path inset(0)->inset(50% 0 50% 0) does it, expo.out. The wordmark sits in a layer above the panel and persists across the seam (optionally scale-hands-off into the hero). set(p) is a PURE scrub."
  when: "The site intro / first load. The handshake before the hero — a branded dark hold (wordmark + load counter) that opens onto the hero with a single clean horizontal seam instead of a plain fade. Pair the counter with a real load gate (min-hold + ready) so it doubles as a loading screen for heavy renders."
  lands: "You land on a dark screen with the name written large in flowing italic and a small percentage ticking up in the corner; when it's ready the dark panel splits open along the middle — the hero appears from the top and the bottom at once, racing to a thin line that thins to nothing — and the name stays put, now sitting over the render. It reads as a deliberate, expensive curtain, not a fade-from-black."
  not_when: "A site that should land instantly (no intro). A page-to-page transition (use center-seam-split / panel-rise-over). When there's no load to mask and no brand hold wanted. Stacking with another full-screen overlay. A soft dissolve (this is a hard horizontal seam)."
source:
  grammar: "11tanjung intro: a dark preloader panel collapses vertically into a centre band -> 0 (expo.out ~1s), uncovering the hero from top+bottom; the '11 tanjung' cursive wordmark persists above the panel; a non-linear counter jumps 6->100 at the end (fake progress)."
  recording: "apps/quadro/.award-re/teardowns/D_11tanjung_video.md (T1 preloader-band-collapse + T2 title-handoff + T3 fake-counter; d010-d022)"
  registry_ref: ["T1-band-collapse-11tanjung"]
stack: "vanilla (GSAP optional — built-in rAF expo tween fallback)"
webgl: false
motion_props: [clip-path, opacity, transform]
trigger: "triggered intro overlay, held by a min-hold + resolve-when-ready contract (run/ready)"
timing_layer: [T-transition, B-entrance]
owns_pin: false
owns_scroll: false
page_beat: [preloader]
combines_with: [hero-title-to-nav-pill, blur-reveal-stagger-title, coords-corner-frame, render-scroll-scale]
anti_combos: [center-seam-split, second-overlay]
gated_by: [R_anti_combos, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the dark panel covers the hero (clip-path inset(0)); on reveal it collapses to a centre band (inset(50% 0 50% 0)) revealing the hero from top AND bottom, expo.out ~1s; opacity fades the last sliver"
  - "the wordmark (.pbc-mark) sits ABOVE the panel and persists across the seam (optional markHandoff scale)"
  - "a fake non-linear counter runs 0->100 bottom-left, jumping to 100 at the end; ready() forces 100% and triggers collapse once minHold elapsed"
  - "set(p 0..1) is a PURE scrub of the collapse (0 covered, 1 revealed)"
  - "clip-path + opacity (+ optional mark transform) only; NO mix-blend on the panel; NO WebGL; reduced-motion -> instant reveal"
  - "GSAP used if present, else a built-in rAF expo tween; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO hero revealed + cursive wordmark + warm-black/warm-white palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The dark intro panel collapses vertically into a thin centre band and vanishes (expo.out), revealing the QUADRO hero from top+bottom; the cursive '11 tanjung' persists over it (mix-blend). At band ~21% the hero shows top+bottom with the wordmark in the centre strip (matches 11tanjung d014). Triggered clip-path overlay (no <img> scroll) — the wheel gate doesn't apply; verify the collapse curve (expo.out) + smoothness (fps>=50, jank<8%)."
note: |
  Brick 1 of the 11tanjung harvest (the intro). The dark panel collapses to a centre band
  revealing the hero top+bottom — a horizontal seam, distinct from Saisei's vertical
  center-seam-split and from panel-rise-over (single-edge rounded curtain). The wordmark
  persists above the panel (shared-element across the seam); pair the fake counter with a
  real min-hold + ready() gate for heavy-render loads. Cursive display = Canela / PP
  Editorial Italic class (Playfair Display italic is the free stand-in). Proven 1:1 on
  QUADRO: expo.out collapse, 0% jank.
---

# preloader-band-collapse — a dark intro panel collapses to a centre band (hero revealed top+bottom)

11tanjung's intro: a dark preloader (cursive wordmark + fake 0→100 counter) collapses
vertically into a thin centre band and vanishes (clip-path inset(0)→inset(50% 0 50% 0),
expo.out), revealing the hero from top AND bottom at once; the wordmark persists above the
panel across the seam.

## Markup + call
```html
<div class="pbc-stage" id="pre">
  <div class="pbc-panel"></div>
  <div class="pbc-mark"><div class="mark">11 tanjung</div></div>
  <div class="pbc-counter">0%</div>
</div>
```
```js
var pre = PreloaderBandCollapse.create('#pre', { bg:'#1e1a17', ink:'#f4f1ea', collapseEase:'expo.out' });
pre.run();          // plays the counter
pre.ready();        // call when the page is actually loaded -> collapses + reveals
```

## Proven (the lab)
OUR QUADRO hero behind the intro: the dark panel collapses expo.out (t100=23%, t300=43%,
t500=48.5%, t1000=50% = gone), revealing the hero top+bottom, the cursive "11 tanjung"
(Playfair Display italic, Canela-class) persisting over it via mix-blend. At band 21% the
hero shows top+bottom with the wordmark in the centre strip (matches 11tanjung d014).
Probe (4× CPU throttle): 0/157 long frames (0.0%), 59.9fps.
