---
id: R_stackability
kind: rule
gates: [combines_with, anti_combos, timing_layer]
severity: soft
---

# Stackability — які примітиви комбінуються

How to layer techniques in ONE section without them fighting. The core question: do two moves share a clock, a pin, or a trigger? If they do, they stack for free. Pick ONE pin-owning primitive per section, then layer the rest on top.

## Rules

- **SAME SCROLL CLOCK = STACKS FREE.** Any number of scrub-linked moves can share ONE pin if they all map to the same ScrollTrigger progress (transform / opacity / clip-path only). ERA §03 proves it: 149-frame-scrub + 8 parallax layers + caption splitLines all bound to one pin-pass progress — they fire together and read as one. Pick ONE pin-owning primitive per section, then layer scrub-parallax + reveal + theme-flip on top at ZERO extra pin cost.

- **PARALLAX-DEPTH IS THE UNIVERSAL GLUE.** Every VI section without exception layers parallax-depth (ERA §05 = 27 layers, the densest). It combines with literally everything because it is pure transform on scrub. Default-add it under any primitive to manufacture depth and carry section length — and it needs no pin (ERA §05 / §07 use depth *instead of* a pin).

- **REVEAL (180ms group) + SPLITLINES (60ms/word) = the standard text companion to any primitive.** They are appear-gated and fire on enter, independent of the primitive's scrub, so they never fight it. Put reveal on the side copy of slide-out-img-text, the caption of puzzle-image, the step labels of focus-render-switch.

- **THEME-FLIP IS A FREE TOP-LAYER** (IntersectionObserver, fires once at the boundary). ERA §02 flips dark→light AS the section crosses threshold while reveal + self-draw + parallax all run underneath. It costs no pin and no clock — stack it on any section to mark a hand-off.

- **PUZZLE-ASSEMBLE + PARALLAX-DEPTH + SPLITLINES caption = the strong hero/cover stack** (ERA §01 model: pin + parallax + splitLines title). The assemble (puzzle-image OR puzzle-text) owns the pin; depth and text ride its progress. This is the single best opening combo.

- **COUNTER-PARALLAX PAIRS stack onto slide-out-img-text and cards-swipe for free.** Springs `designMoveLeft` / `designMoveRight` (two images, opposite-sign translateX on one pass) and `natureCaptionMoveUp` (caption rises faster than bg). The primitive already pins; add a mirrored parallax keyframe on a sibling element to get the "meeting" depth.

- **CUSTOM-CURSOR (pointer-spring, strength .25 idle / .9 clickable) couples specifically to cards-swipe and focus-render-switch** — the drag / clickable affordance. It runs on the pointer clock, so it stacks over the scrub primitive without contention (ERA §07 interiors: cursor + carousel + 15 parallax layers + reveal simultaneously).

- **BUTTON clone-content + outline-draw (svgLength) + cursor button-morph all fire on the SAME hover event** — they are one hover-combo, not three clocks. Reserve this trio for CTAs (ERA §08), where the scrub budget deliberately drops.
