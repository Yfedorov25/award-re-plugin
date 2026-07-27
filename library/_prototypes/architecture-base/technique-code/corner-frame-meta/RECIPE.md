---
id: corner-frame-meta
name: "Corner-frame meta (small all-caps labels at the four corners of a frame, fade in)"
level: 2
kind: component
status: official
entry:
  call: "CornerFrameMeta.create(target, opts)  // target contains [data-corner=tl|bl|br|rc] labels (positioned by CSS). opts: { sel, dur, ease, stagger }."
  module: iife
  returns: "{ reveal(), set(p), hide(), destroy }"
meaning:
  what: "Saisei's corner meta — small all-caps tracked labels at the FOUR CORNERS of a full-bleed frame (eyebrow top-left, location bottom-left, type/year bottom-right, index right-centre), fading in staggered. The framed composition that makes a hero read as an authored plate, not a slide. set(p) scrubs."
  when: "Framing a hero / project plate with metadata — eyebrow, location, type/year, index — pinned to the corners so the big image reads as a composed, captioned spread. The micro-typography layer of a Saisei hero (tracked all-caps in the corners)."
  lands: "The big render sits framed by small, widely-tracked labels tucked into each corner — a kanji eyebrow, the place, the type and year, a section index — fading in around the image so it reads like a captioned plate in a monograph, authored and precise."
  not_when: "A busy layout (the corners want air). Content that needs to read as a list (this is peripheral meta). When there's no real metadata to place (empty corners read as decoration)."
source:
  grammar: "Saisei project hero: tracked all-caps meta in the four corners (eyebrow tl, location bl, type/year br, index rc), faded in."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S8 / corner-frame-meta)"
  registry_ref: ["S8-corner-frame-meta-saisei"]
stack: "vanilla (GSAP optional)"
webgl: false
motion_props: [opacity, transform]
trigger: "triggered (reveal) or scrubbed (set(p))"
timing_layer: [B-entrance]
owns_pin: false
owns_scroll: false
page_beat: [hero, proof]
combines_with: [content-stage-cascade, mask-up-title, render-slice-reveal, vertical-awards-rail]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "[data-corner] labels sit at the four corners (CSS) and fade in (opacity 0->1 + translateY 6->0) staggered"
  - "reveal() runs the staggered fade; set(p 0..1) is a PURE scrub; hide() resets"
  - "opacity + tiny transform only; GPU; NO mix-blend / NO backdrop / NO WebGL; reduced-motion -> shown; __LAB_OK__ on init"
  - "asset-substitution gate: OUR meta (再生 / location / year / index) on a QUADRO hero"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The four corner labels fade in staggered around the render. Triggered (not scroll) — the wheel gate doesn't apply; verify the fade + smoothness."
note: |
  Brick S8 of the Saisei harvest — the corner-meta framing of a hero plate. The tracked
  all-caps in the corners is the micro-typography signature. Pairs with content-stage-
  cascade (as the meta stage) and mask-up-title. Proven on QUADRO: 4 corners fade in, 0% jank.
---

# corner-frame-meta — small all-caps labels at the four corners of a frame

Saisei's corner meta: small all-caps tracked labels tucked into the four corners of a
full-bleed frame (eyebrow / location / type-year / index), fading in staggered — the
framed composition that makes a hero read as an authored plate.

## Proven (the lab)
OUR QUADRO render with 再生 (tl), location (bl), Резиденція—2025 (br), (1) (rc) fading in
staggered. Probe (4× throttle): 0% long frames, 59.9fps.
