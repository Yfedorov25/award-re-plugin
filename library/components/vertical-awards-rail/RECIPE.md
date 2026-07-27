---
id: vertical-awards-rail
name: "Vertical awards rail (writing-mode badges pinned to the right edge, slide in)"
level: 2
kind: component
status: official
entry:
  call: "VerticalAwardsRail.create(target, opts)  // target = .var-rail with .var-badge items (writing-mode vertical). opts: { sel, dur, ease, stagger, from }."
  module: iife
  returns: "{ reveal(), set(p), hide(), destroy }"
meaning:
  what: "Saisei's awards rail — small award badges with VERTICAL text (writing-mode), pinned to the RIGHT edge, stacked, sliding IN from the right (translateX) after the page settles. set(p) scrubs."
  when: "Showing awards / press / honours as a persistent right-edge rail (Awwwards-style W. Winner tabs). The chrome that signals credibility without taking layout space — vertical tabs on the edge that arrive after the hero. Saisei's awards."
  lands: "Two slim vertical tabs slide in from the right edge and dock there — W. Winner, Site of the Day — their text running vertically, a quiet badge of credibility sitting on the frame's edge, arriving a beat after the hero settles."
  not_when: "No awards/press to show (don't fake a rail). A layout where the right edge is busy. When horizontal badges fit better (this is the vertical-edge form)."
source:
  grammar: "Saisei: W. Winner / W. Site of the Day vertical tabs (writing-mode) docked to the right edge, sliding in from the right after the hero."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S9 / vertical-awards-rail)"
  registry_ref: ["S9-vertical-awards-rail-saisei"]
stack: "vanilla (GSAP optional)"
webgl: false
motion_props: [transform, opacity]
trigger: "triggered (reveal after page settle) or scrubbed (set(p))"
timing_layer: [B-entrance, A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [chrome, proof]
combines_with: [content-stage-cascade, corner-frame-meta, render-slice-reveal]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - ".var-badge items (writing-mode vertical, right edge) slide in from translateX(from%) -> 0 + opacity 0->1, staggered"
  - "reveal() runs the slide-in; set(p 0..1) is a PURE scrub; hide() resets"
  - "the hidden state is set THROUGH gsap.set when gsap is present (so gsap.to({xPercent:0}) lands exactly, no stray translateX residue)"
  - "transform(translateX) + opacity only; GPU; NO mix-blend / NO backdrop / NO WebGL; reduced-motion -> shown; __LAB_OK__ on init"
  - "asset-substitution gate: OUR W. Winner / Site of the Day badges"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The vertical badges slide in from the right edge and dock. Triggered (not scroll) — the wheel gate doesn't apply; verify the slide-in + smoothness."
note: |
  Brick S9 of the Saisei harvest — the right-edge awards rail (writing-mode vertical
  tabs). gsap.set-channel fix for the hidden state (no stray inline translateX). Pairs
  with content-stage-cascade (slides in as the awards stage). Proven on QUADRO: badges
  land at translateX(0), 0% jank, 0 warnings.
---

# vertical-awards-rail — writing-mode badges pinned to the right edge

Saisei's awards rail: slim vertical-text badges docked to the right edge, sliding in from
the right after the hero settles — a quiet badge of credibility on the frame's edge.

## Proven (the lab)
OUR W. Winner / W. Site of the Day vertical badges slide in from the right edge to
translateX(0). gsap.set-channel fix (no residue). Probe (4× throttle): 0% long frames,
59.9fps, 0 warnings.
