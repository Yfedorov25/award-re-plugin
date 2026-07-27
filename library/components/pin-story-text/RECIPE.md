---
id: pin-story-text
name: "Pin-story text (a pinned scroll-lock sequencer — text blocks arrive ONE AT A TIME, never overlapping)"
level: 2
kind: component
status: candidate
entry:
  call: "PinStoryText.create(target, { blocks:[{eyebrow,title,body,align:'left'|'center'|'lower-left',at}], end, scrub, hold, ease, manageLenis }) // target = the section host to pin; the component builds the text stage INTO it (background is the host's, not the component's)."
  module: iife
  returns: "{ set(p), trigger, destroy }"
meaning:
  what: "A PINNED scroll-lock text sequencer. The section pins (pin:true, pinSpacing:true) and the page HOLDS while the story plays. As the visitor scrolls, a sequence of text blocks arrives ONE AT A TIME in a clean, considered composition: a block rises + settles, HOLDS alone on stage, then rises + fades OUT as the next rises + fades IN. Background-agnostic: it owns the pin and the text story, NOT the media, so it drops over any render / video / colour field."
  when: "A hero or manifesto where the words are the moment and must land in sequence, not as a wall. Use it when the owner asks for 'text by sequential reveal'. Pair it OVER a static render, an autoplay video bg, or a scroll-scrub-video oblit — the component owns the single pin; the media is a sibling layer the host owns."
  lands: "The page stops and holds. One line settles, you read it, it lifts away, the next arrives in a different considered spot. Nothing collides, nothing crowds the screen. The hero feels authored and slow on purpose, the opposite of the first pass that dumped elements down toward a section that did not exist."
  not_when: "When the media itself is the moment and must crossfade between its OWN two layers (use media-step-switch). When the reveal is a one-shot on load with no scroll (use content-stage-cascade). When there is only a single line (just animate it). It must NOT be combined with another pin owner (pin budget = 1)."
source:
  grammar: "Owner feedback on hero pass 1: REAL pin (hold while the mechanic plays), pin-story text composition (one settles then the next, never overlapping, never a full-screen wall), depth not primitive (sequential reveal)."
  recording: "owner verbal direction 'text by sequential reveal'; sibling reference media-step-switch (msw4a) for the pinned-stage discipline."
  registry_ref: ["hero-pin-story-text"]
stack: "vanilla (GSAP 3.12.5 + ScrollTrigger + CustomEase; Lenis optional via manageLenis)"
webgl: false
motion_props: [opacity, transform]
trigger: "scroll (pinned scrub)"
timing_layer: [C-scroll-driven]
owns_pin: true
owns_scroll: false
page_beat: [hero, manifesto, chapter]
combines_with: [scroll-scrub-video, daynight-scroll-scrub, brand-overlay-crossfade, render-scroll-scale, mask-up-title, corner-frame-meta]
anti_combos: [media-step-switch, room-dolly-scroll, frame-scrub-img]
gated_by: [R_perf_limits, R_one_pin]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "creates EXACTLY ONE pinned ScrollTrigger over the target (pin:true, pinSpacing:true) — owns_pin:true; the section scroll-LOCKS and does not dump down"
  - "blocks reveal ONE AT A TIME: at any progress exactly one block is fully visible; transitions never show two blocks colliding"
  - "no block is a full-screen wall — each is width-constrained (<=46ch / <=52vw); align variants give each a distinct considered anchor (left / center / lower-left)"
  - "set(p) is a PURE function of progress (idempotent, reverse-safe); motion is transform(translateY)+opacity ONLY"
  - "background-agnostic: the component never touches the media layer (the host owns the render/video/colour); decode-guard not needed (text only)"
  - "NO mix-blend / NO backdrop-filter / NO WebGL / NO width/height/top/left animation; will-change set on blocks"
  - "reduced-motion / narrow -> a static stacked list of the blocks, NO pin; window.__LAB_OK__ set on both branches"
  - "Ukrainian copy, Fraunces+Inter, bronze accent, ZERO em/en-dash; H1 clamp(40px,7vw,120px) lh .98 tracking -.03em"
gate:
  probe: "Headless: load lab.html, wait window.__LAB_OK__===true, assert ScrollTrigger.getAll().filter(t=>t.pin).length===1. Scroll the pin in steps and confirm (a) the section holds (scrollY of the pinned host stays at top while progress advances) and (b) exactly ONE .pst__block has opacity>=0.9 at every sampled progress (no overlap). Background render painted at non-zero size."
note: |
  The new hero atom forged from the owner's pass-1 rejection. The whole point is the
  REAL pin + the no-overlap sequence: block settles, HOLDS, leaves as the next enters.
  It is deliberately background-agnostic so it welds onto either owner-requested
  direction — over a static render, an autoplay video bg, or a scroll-scrub-video
  oblit (the lag-free canvas-2d frame-scrub). Distinct from media-step-switch, which
  carries its own two media layers; pin-story-text is JUST the pinned text story.
  PIN BUDGET = 1: never combine with a second pin owner.
---
