---
id: grid-skeleton-draw
name: "Grid skeleton draw (the next page's column rules stroke in on the interstitial)"
level: 2
kind: component
status: official
entry:
  call: "GridSkeletonDraw.create(target, opts)  // injects vertical rules into the target. opts: { cols, colour, opacity, width, dur, ease, stagger, origin }."
  module: iife
  returns: "{ draw(), undraw(), set(p), rules, destroy }"
meaning:
  what: "Saisei's grid skeleton — the next page's vertical column RULES stroke in (scaleY 0->1) on the interstitial, drawing the incoming page's layout grid before the content arrives ('the page sketches its skeleton'). draw() builds them, undraw() recedes."
  when: "On a transition interstitial (under a monogram loader) — sketching the incoming page's column grid while it loads, so the wait reads as the site composing the next page rather than a blank pause. Saisei's loader grid. The 'page builds itself' cue for heavy-render real-estate sites."
  lands: "On the held cream screen between pages, faint vertical lines draw themselves in, top to centre — the column grid of the page that's coming — so the wait reads as the site laying out the next page, not a dead pause; then they recede as the page opens."
  not_when: "An instant transition (no interstitial to sketch on). A page with no clear column grid. When it would clutter the loader (keep the rules faint and few)."
source:
  grammar: "Saisei interstitial: vertical column rules (margins ~7%/93% + inner thirds) stroke in under the cream loader, held across the load, then recede."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S3 / grid-skeleton-draw)"
  registry_ref: ["S3-grid-skeleton-draw-saisei"]
stack: "vanilla (GSAP optional)"
webgl: false
motion_props: [transform, opacity]
trigger: "triggered (on the interstitial) or scrubbed (set(p))"
timing_layer: [T-transition]
owns_pin: false
owns_scroll: false
page_beat: [preloader, transition]
combines_with: [monogram-ring-loader, center-seam-split, theme-tween]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "draw() injects vertical rules at the given cols (x%) and strokes them in (scaleY 0->1, transform-origin centre|top), staggered"
  - "undraw() recedes them; set(p 0..1) is a PURE scrub"
  - "transform(scaleY) + opacity only; GPU; NO mix-blend / NO backdrop / NO WebGL; reduced-motion -> shown; __LAB_OK__ on init"
  - "asset-substitution gate: OUR grid columns sketched on the cream interstitial"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The vertical column rules stroke in (scaleY 0->1) on the cream field with 木. Triggered DOM rules (no <img>, not scroll) — the wheel gate doesn't apply; verify the rules draw in staggered + smoothness."
note: |
  Brick S3 of the Saisei harvest — the grid skeleton of the interstitial. Pairs UNDER a
  monogram-ring-loader (the 木 + ring sit on top while the rules sketch the next page's
  columns). Proven on QUADRO: 5 rules stroke in scaleY 0->1 centre-origin, 0% jank.
---

# grid-skeleton-draw — the next page's column rules stroke in on the interstitial

Saisei's grid skeleton: faint vertical column rules of the incoming page stroke in
(scaleY 0→1) on the cream interstitial — the site sketching the next page's grid while
it loads — then recede as the page opens. Pairs under a monogram loader.

## Proven (the lab)
OUR cream interstitial with 木 — 5 vertical rules stroke in (scaleY 0→1, centre-origin,
staggered) sketching the grid. Probe (4× throttle): 0% long frames, 59.9fps.
