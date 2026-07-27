---
id: hero--house-reveals-on-scroll
name: "Дім розкривається"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "A PINNED, scroll-locked hero where the HOUSE reveals itself. At the top a dark cover hides the building behind a vertical centre seam. As the visitor scrolls, the seam PARTS from the centre outward (center-seam-split) while the render simultaneously pushes in toward the viewer (render-scroll-scale, scale 1.06 -> 1.16), so the building opens INTO the frame. Welded to the SAME single pin, a short story reveals ONE line at a time (pin-story-text): line settles, holds alone, leaves, the next arrives, never overlapping, never a full-screen wall. Corner-frame-meta assembles the authored-plate labels once at intro. One pin, three coupled systems, one locked scroll beat."
  when: "The first impression of a townhouse / villa ЖК where the building itself is the hero and you want the visitor to FEEL it open. The reworked answer to 'a full scroll of the house': the section holds while the house reveals and the copy reveals together, then releases. Pick this over a static plate hero or a flyaround when the signature gesture should be a building opening down a parting centre seam coupled to a push-in."
  lands: "You arrive on a dark framed plate with a hairline centre rule and the line 'Дім, який досі закритий'. You scroll and the section locks: the dark cover splits down the middle and peels to the edges, the townhouse appearing and pushing toward you, while the copy turns over to 'Він розкривається' and then to the proof 'Свій двір. Своя тераса.' One line on screen at a time, the building opening behind it, then the pin lets go. Reads engineered and expensive, not a slide that scrolled away before its moment."
source:
  grammar: "Owner rework of the first hero pass (rejected: no pin, text dumped down toward a phantom next section, primitive, laggy oblit). Built on the Saisei center-seam primitive (a centre seam that parts to reveal what is behind) coupled to the render-scroll-scale push-in and the pin-story-text sequencer, all driven off pin-story-text's single pin."
  recording: null
  registry_ref: []
uses:
  - {  atom: pin-story-text, job: "OWNS the one pinned ScrollTrigger (pin:true, pinSpacing:true). Sequences three sparse text blocks ONE AT A TIME (lower-left -> centre -> lower-left), exactly one at opacity:1 at any scroll position, width-constrained, never overlapping, never a full-screen wall." }
  - {  atom: center-seam-split, job: "PURE set(p) cover over #combo (owns_pin:false). p=0 fully covers the house behind a vertical centre seam; p=1 fully open. Driven off pin-story-text's live trigger.progress via a gsap.ticker so the house parts open IN the same pin." }
  - {  atom: render-scroll-scale, job: "PURE set(p) host-driven render layer (owns_pin:false, selfTrigger:false, creates NO ScrollTrigger). Pushes the cars-free house render in from scale 1.06 -> 1.16 off the SAME trigger.progress, so the building opens toward the viewer as the seam parts." }
  - {  atom: corner-frame-meta, job: "Authored-plate corner labels (address / count / area). reveal() once at intro after the render force-decodes — opacity + tiny transform, NOT on the scrub." }
pin:
  owner: pin-story-text
  count: 1
pin_killed: [pin-story-text]
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "pins === 1, scroll-locks: pin-story-text owns exactly one pinned ScrollTrigger (pin:true, pinSpacing:true); the section HOLDS while the mechanic plays and does NOT dump elements toward a next section. expectPins:1, verified pins===1."
  - "no text overlap: exactly ONE pst block is visible (opacity > 0.5) at every scroll position; verified visibleCount===1 at 0/25/50/75/100% of the pin. Blocks are width-constrained, never a full-screen wall."
  - "the house reveals on the SAME pin: center-seam-split clip-path parts inset 0% -> ~50% (centre seam peels to the edges) AND render-scroll-scale pushes scale 1.06 -> 1.16, both driven off the single trigger.progress; verified moving across the pin."
  - "engine laws: motion ONLY transform + opacity + clip-path; NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/margin, NO WebGL. render force-decoded before reveal (no black flash)."
  - "reduced-motion -> no pin, the pst static stacked deck (all 3 blocks shown, no overlap), the seam fully open (house revealed), the render shown; __LAB_OK__ true. asset-substitution gate: built on OUR cars-free render (renders/day-34.webp) + Ukrainian copy."
  - "__LAB_OK__ true once wired; a [data-render-surface] painted a decoded image at non-zero size; 0 real console errors."
webgl: false
ease: air
---

# hero--house-reveals-on-scroll — "Дім розкривається"

The owner's "full scroll of the house" done with depth: the section PINS, and as you
scroll the building OPENS — a dark cover parts down a vertical centre seam while the
render pushes in toward you — and the copy reveals ONE line at a time on the same pin.
Never two text blocks at once, never a wall, never a hero that scrolls away before its
moment lands.

## One pin, three coupled systems
- **pin-story-text** owns the single pinned ScrollTrigger and sequences the copy
  (one block on stage at a time, no overlap by layout + by the engine).
- A `gsap.ticker` reads that trigger's live `progress` and drives two PURE `set(p)`
  layers that create NO pin of their own:
  - **center-seam-split** `set(p)` — the dark cover peels centre -> edges (the house appears).
  - **render-scroll-scale** `set(p)` — the render scales 1.06 -> 1.16 (opens toward you).
- **corner-frame-meta** assembles the authored-plate labels once at intro (not on the scrub).

## Why it is not the first (rejected) pass
1. REAL PIN: pin-story-text holds the section (pin + pinSpacing). It does not dump
   elements down toward a phantom next section.
2. NO OVERLAP: exactly one line is visible at any scroll point (verified visibleCount===1).
3. DEPTH: the house literally reveals (parting seam + push-in) while the text reveals
   one by one — both directions the owner named, on one pin.
4. NO LAG: a single decoded webp scaled by transform + a clip-path cover. No <img>.src
   frame-swap, no video.currentTime scrub.

## Asset
`renders/day-34.webp` — the cars-free townhouse (front facade, garden, terrace, 1920x1080
landscape). No cars, no front-crop. `renders` symlinks the quadro proto folder.

## Gate
Open combo-lab.html on a server (GSAP + ScrollTrigger + CustomEase from cdn). `__LAB_OK__`
true once wired. Scroll into the pinned range: the dark cover splits down the centre and
peels to the edges revealing the house while the render pushes in, and the copy turns over
one line at a time. Verified headless: labOK true, pins===1, visibleCount===1 at every
sampled position, seam clip 0% -> ~50%, scale 1.06 -> 1.16, 0 console errors;
reduced-motion -> static deck, no pin, house shown.
