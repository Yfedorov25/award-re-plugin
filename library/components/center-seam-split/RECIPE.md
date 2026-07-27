---
id: center-seam-split
name: "Center-seam split (a vertical seam opens centre→edges to reveal, or closes edges→centre to cover; two-phase colour)"
level: 2
kind: component
status: official
entry:
  call: "CenterSeamSplit.create(target, opts)  // target = element/selector or null (=body, fixed full-viewport). It injects a .css-cover over the target and drives its clip-path. opts: { axis, fill, duration, ease, easeClose, z, onComplete }."
  module: iife
  returns: "{ el, open(o), close(o), set(p), progress, destroy }. open() peels the seam centre->edges (reveal behind). close() grows edges->centre (cover). set(p): 0 = fully covering, 1 = fully open (PURE)."
meaning:
  what: "Saisei's signature primitive — a vertical centre seam that OPENS (a fill splits from the centre line outward, revealing what's behind) or CLOSES (two halves slide from the edges to a centre seam, covering what's behind). A growing clip-path inset on one axis does it; reversible and PURE in progress. ONE engine, four uses across Saisei (the preloader, the page-enter, the menu-close inverse, a focal-image reveal). The 'expensive' tell is the TWO-PHASE COLOUR: a page transition CLOSES in cream then re-OPENS in dark — the seam breathes light, exhales dark."
  when: "Any moment that should split open or seal shut on a clean vertical line: a preloader that parts to reveal the hero, a page-to-page transition (close the old page in the brand colour, hold a loader, open the new page in its colour), a focal image that reveals through an expanding centre slit, a menu cover. The backbone of a Saisei-grade transition language — pair the close phase with a monogram-loader hold and the open phase with a staggered content cascade."
  lands: "The screen parts down the middle — a dark panel splits open from the centre and slides outward, and through the widening gap the hero appears, framed by two retreating margins, until it fills the frame. Or the reverse: two halves glide in from the edges and seal the page shut on a hairline seam. Because the close is in cream and the open is in dark, it reads as one deliberate, expensive move — a curtain that changes colour as it parts — not a plain fade or wipe."
  not_when: "A soft, edgeless transition (use a fade/dissolve — the seam is a hard geometric statement). A section that should scroll-reveal from one edge (that's scroll-clip-rise, axis Y, bottom-up — a different engine). When there's nothing meaningful behind the cover to reveal (the seam buys nothing over a fade). Stacking two seams at once on the same surface (one cover at a time)."
source:
  grammar: "Saisei runs on one geometric idea — the vertical centre seam — recombined at four scales: preloader (black splits from centre over cream), page-enter (cream curtain splits to reveal the dark page), menu-close (cream converges edges->centre), focal-image (portrait opens through an expanding centre slit). Close = cream (brand bg), open = dark (new page) — a palette change between phases."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S1; preloader p016-p028, page transition v2 f064-125, v3 f053-062)"
  registry_ref: ["S1-center-seam-saisei"]
stack: "vanilla (GSAP optional — built-in rAF tween fallback)"
webgl: false
motion_props: [clip-path, opacity]
trigger: "triggered cover (timeline / page-change / interaction), NOT scroll-driven; can also be driven from a scrub via set(p)"
timing_layer: [B-entrance, T-transition]
owns_pin: false
owns_scroll: false
page_beat: [preloader, transition, chapter]
combines_with: [monogram-ring-loader, content-stage-cascade, mask-up-title, grid-skeleton-draw, theme-tween]
anti_combos: [vertical-curtain-wipe, second-cover]
gated_by: [R_anti_combos, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, lab-full.html, tokens.json]
acceptance:
  - "create(target) injects a .css-cover over the target (or body, fixed full-viewport) and drives its clip-path; destroy() removes it"
  - "open() peels the seam centre->edges (inset 0 -> inset(0 50% 0 50%) on axis x) revealing the layer behind; close() grows edges->centre covering it; set(p) is a PURE fn of progress (0 covering, 1 open)"
  - "two-phase colour: a page transition CLOSES in cream (fill) then re-OPENS in dark (re-tinted cover) — close({fill}) re-tints"
  - "axis 'x' = vertical seam (default) / 'y' = horizontal; insetFor(axis,0.5) splits 50% open"
  - "clip-path + opacity only; GPU layer; NO mix-blend / NO backdrop; NO WebGL; reduced-motion -> instant state"
  - "GSAP used if present, else a built-in rAF tween (no hard dependency); window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO hero revealed by the seam + cream/dark brand palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The cream page CLOSES in cream (seam converges edges->centre), a brief hold, then a dark cover OPENS (seam splits centre->edges) revealing the QUADRO hero through the widening slit (dark margins, hero centre — matches Saisei preloader p024). NOTE: the cover is a clip-path div (not an <img>) and the transition is TRIGGERED (not scroll-driven), so the wheel-scroll smoothness-gate does not apply — verify with a direct rAF-pacing probe over the real close->open run: cover present every frame, clip-path animates, PASS = fps>=50, jank<8%."
note: |
  Brick S1 of the Saisei harvest — the SIGNATURE primitive. One vertical-centre-seam
  engine that opens (reveal) or closes (cover); the whole Saisei transition language is
  this recombined at four scales (preloader / page-enter / menu-close / image-reveal).
  The two-phase colour (close cream, open dark) is the 'expensive' tell — a curtain that
  changes colour as it parts. Built to pair: close -> [monogram-ring-loader hold] ->
  open -> [content-stage-cascade]. Triggered cover, owns_pin false. clip-path inset only,
  GPU, no WebGL; the smoothness-gate (wheel + <img>) doesn't apply — verified with a
  direct rAF probe (0% jank, 59.9fps, built-in tween under 4x throttle).
  1:1 CURVES (measured 15fps): OPEN = power2.in ~0.93s (hairline DWELLS ~270ms then RIPS
  open accelerating — NOT expo.out); CLOSE = power3.inOut ~0.73s (softer/faster). Rule:
  "the entry is softer than the exit." Live-verified: t100=0.04%, t300=1.5%, t500=7%,
  t800=30%, t1000=50% — matches Saisei.
  RENDER-SLICER (lab.html): the incoming render is FIXED full-bleed behind a dark veil;
  open() exposes it as a growing centre slice, and the veil opacity is driven down via
  open()'s onUpdate(progress) so the render BRIGHTENS exactly as the slice grows (Saisei:
  the render appears through the slice, then clears from dark to full colour). Verified
  in sync: slice 7%/veil .67 -> slice 30%/veil .31 -> slice 50%/veil 0.
---

# center-seam-split — a vertical seam opens to reveal, or closes to cover (two-phase colour)

Saisei's signature primitive: a vertical centre seam that OPENS (a fill splits from the
centre outward, revealing what's behind) or CLOSES (two halves slide from the edges to a
centre seam, covering what's behind). ONE engine, four uses — preloader, page-enter,
menu-close, focal-image. The expensive tell is the two-phase colour: a page transition
closes in cream then opens in dark.

## Markup + call
```js
// page transition: close the old page in cream, hold (loader), open the new page in dark
var cream = CenterSeamSplit.create(document.body, { fill: '#f0e9d2' });
cream.set(1);                                   // start open (old page visible)
cream.close({ duration: 0.55, ease: 'power3.inOut', onComplete: function () {
  cream.destroy();
  var dark = CenterSeamSplit.create(document.body, { fill: '#0e0e0c' });
  dark.set(0);                                  // fully dark (covering the new hero)
  // ... monogram-ring-loader hold here ...
  dark.open({ duration: 0.85, ease: 'expo.out' }); // seam splits centre->edges, hero revealed
}});
```

## Proven (the lab)
OUR QUADRO hero behind a Saisei-style transition: the cream page CLOSES in cream (seam
converges edges→centre, power3.inOut 0.55s), a brief hold, then a dark cover OPENS (seam
splits centre→edges, expo.out 0.85s) revealing the QUADRO hero through the widening slit
— dark margins, hero centre, matching Saisei preloader p024. `insetFor('x',0.5)` =
`inset(0 25% 0 25%)`, two-phase colour cream `#f0e9d2` → dark `#0e0e0c`, both verified.
Direct rAF probe (built-in tween, no GSAP, 4× CPU throttle): **0/105 long frames (0.0%),
59.9fps, worst 18ms, cover present every frame.**
