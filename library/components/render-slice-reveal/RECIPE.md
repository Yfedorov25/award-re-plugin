---
id: render-slice-reveal
name: "Render slice-reveal (a render appears through an opening centre slice and brightens in sync)"
level: 3
kind: component
status: official
entry:
  call: "RenderSliceReveal.create(target, opts)  // target wraps .rsr-render (img) + .rsr-veil. opts: { veil, fill, duration, ease, veilEase, z }. Composes center-seam-split (load its component.js first)."
  module: iife
  returns: "{ open(o), set(p), reset(), seam(), destroy }"
meaning:
  what: "Saisei's render reveal — a new full-bleed render appears through a black centre SLICE that opens (power2.in: a hairline that dwells then rips), and a dark VEIL over the render clears IN SYNC with the slice, so the render brightens from dark to full colour exactly as the slice grows. The render is FIXED behind; the slice + veil do the reveal. set(p) is a PURE scrub so it can be scroll-driven. Composes center-seam-split."
  when: "Revealing the hero render of a page after a transition — the moment the new render arrives. Where Saisei lands a project/hero image: not a plain fade, but a render that surfaces through a parting slice and lifts from dark to full colour. The pairing of center-seam-split (open) with a render that brightens as it's exposed."
  lands: "The screen parts down the middle and through the widening gap a render appears — at first deep in shadow, framed by two black margins, and as the gap grows the image both widens AND brightens, surfacing from dark to full colour until it fills the frame. It reads as the render being unveiled, lit as it's revealed — expensive, deliberate, not a cut or a fade."
  not_when: "A render that should read instantly (no slice/veil). A soft dissolve (the slice is a hard geometric reveal). When there's no render to brighten (use plain center-seam-split). A scroll-section reveal from one edge (that's scroll-clip-rise, axis Y). Stacking two slices on one surface."
source:
  grammar: "Saisei /project open (t073-t080): the incoming render is fixed full-bleed under a dark overlay; the black slice opens centre->edges (power2.in) exposing it as a growing strip; the render brightens from near-black to full as the slice widens; awards rail slides in near the end."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (the page-open render-slicer; t073-t080; OPEN curve section)"
  registry_ref: ["S1b-render-slicer-saisei"]
stack: "vanilla — composes center-seam-split (GSAP optional via the seam)"
webgl: false
motion_props: [clip-path, opacity]
trigger: "triggered (page open / interaction); set(p) can also scrub it from scroll"
timing_layer: [B-entrance, T-transition]
owns_pin: false
owns_scroll: false
page_beat: [hero, transition, chapter]
combines_with: [center-seam-split, monogram-ring-loader, content-stage-cascade, mask-up-title]
anti_combos: [vertical-curtain-wipe, second-cover]
gated_by: [R_anti_combos, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the render is fixed full-bleed (.rsr-render); a .rsr-veil dark overlay sits over it; a center-seam-split slice opens over the stage"
  - "open() runs the slice (power2.in ~0.93s) and clears the veil IN SYNC via the seam's onUpdate(progress) — render brightens dark->full exactly as the slice grows"
  - "set(p 0..1) is a PURE scrub of slice + veil together (scroll-drivable); reset() re-covers + re-darkens"
  - "composes center-seam-split (does NOT re-implement the seam); clip-path + opacity only; NO mix-blend / NO backdrop; NO WebGL"
  - "reduced-motion -> instant revealed; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO render brightening through the slice"
gate:
  probe: "Open lab.html (composes ../center-seam-split/component.js). __LAB_OK__ true. The black slice opens from centre (power2.in) and the QUADRO render appears as a growing strip, brightening from dark to full colour IN SYNC with the slice (at ~40% the render is a dim centre strip — matches Saisei t076). Triggered clip-path + veil (no <img> scroll) — the wheel gate doesn't apply; verify the slice curve + veil-sync + smoothness (fps>=50, jank<8%)."
note: |
  Level-3 composite — the user's explicit ask ("renders should appear with a slicer like
  Saisei"). It wraps center-seam-split and adds the synced dark veil so the render
  brightens as the slice opens (driven by the seam's new onUpdate(progress) callback).
  The render is FIXED behind; only the slice + veil move. Pairs after a center-seam-split
  page-open / monogram-loader. Proven 1:1 on QUADRO: slice power2.in + veil 0.8->0 in
  lockstep, 0% jank.
---

# render-slice-reveal — a render appears through an opening slice and brightens in sync

Saisei's render reveal: a fixed full-bleed render under a dark veil; a black centre slice
opens (power2.in — hairline dwells, then rips) exposing the render as a growing strip, and
the veil clears IN SYNC so the render brightens from dark to full colour exactly as the
slice grows. Composes center-seam-split.

## Markup + call
```html
<section class="rsr-stage" id="stage">
  <div class="rsr-render"><img src="…"></div>
  <div class="rsr-veil" id="veil"></div>
  <div class="rsr-content"><div class="title">QUADRO</div></div>
</section>
```
```js
var rsr = RenderSliceReveal.create('#stage', { veil: 0.8, fill: '#0e0e0c', duration: 0.93, ease: 'power2.in' });
rsr.open();              // or rsr.set(scrollProgress) to scrub
```

## Proven (the lab)
OUR QUADRO render: the black slice opens power2.in (t100=0.05%, t500=7.3%, t800=30%,
t1000=50%) and the veil clears IN SYNC (0.8 → 0.68 → 0.47 → 0.31 → 0.10 → 0) so the render
brightens exactly as the slice grows. At slice 42% the render shows as a dim centre strip
(matches Saisei t076). Probe (4× CPU throttle): 0/132 long frames (0.0%), 59.9fps.
