---
id: drag-tab-reveal
name: "Drag-tab reveal (an edge-anchored panel with a 'Pull Me' grab-tab; drag the tab to pull the drawer out, release past a threshold to snap open; click toggles, label + chevron flip)"
level: 2
kind: component
status: official
entry:
  call: "DragTabReveal.create(target, opts)  // target = .dtr-stage > .dtr-panel(.dtr-tab(.dtr-tab-label) + .dtr-content). opts: { side, threshold, duration, ease, openLabel, closedLabel }."
  module: iife
  returns: "{ open(), close(), toggle(), set(p), isOpen(), destroy }"
meaning:
  what: "gapsystudio's 'Pull Me' drawer — an edge-anchored panel sits mostly off-screen with a small grab-tab on its visible edge. You DRAG the tab to pull the panel out (it follows the pointer); release past a threshold and it SNAPS open, otherwise snaps back. Click toggles; Enter/Space too. The tab label + chevron flip with the open state. Pointer move/up tracked on WINDOW (a drag that leaves the tab still ends cleanly)."
  when: "A secondary panel you want PRESENT but out of the way — contact details, a quick menu, a brief, filters — surfaced by a playful, tactile handle instead of a plain button. The 'Pull Me' tab invites interaction (it reads as physical), and the drag gives a sense of weight. Use it for a persistent contact/CTA drawer on an inner page, or anywhere a peek-tab + pull is more inviting than a hamburger."
  lands: "You notice a little dark tab clinging to the edge of the screen that says 'Pull Me'. You grab it and drag — a panel slides out from the edge following your hand, and if you pull far enough it snaps fully open; let go too early and it springs back. Tap it instead and it just opens. The label flips to 'Close' with the arrow turning around. It feels like opening a real drawer, not clicking a menu."
  not_when: "The primary navigation (use a proper nav / menu). Content that must always be visible (don't hide it behind a pull). Mobile where an edge-drag fights the browser's back-swipe gesture (test, or move the tab inward). When there's nothing worth a tactile reveal (a plain button is honest). Stacking several edge-tabs on the same side (they collide)."
source:
  grammar: "gapsy /about: a dark rounded 'Pull Me' tab pinned half-off the far-left edge; a draggable handle that pulls out a hidden panel/drawer from the edge — a tactile UI cue."
  recording: "apps/quadro/.award-re/teardowns/D_gapsy_video.md (C /about; gapsystudio.com, NO-WebGL basket A)"
  registry_ref: ["C-drag-tab-reveal-gapsy"]
stack: "vanilla (transform-driven; Pointer Events; no GSAP needed)"
webgl: false
motion_props: [transform, opacity]
trigger: "triggered (drag / click / keyboard), not scroll"
timing_layer: [D-interaction]
owns_pin: false
owns_scroll: false
page_beat: [contact-drawer, utility-panel, quick-menu]
combines_with: [script-overline-display-pair, menu-tracked-stagger, coords-corner-frame]
anti_combos: [primary-nav, multiple-same-edge-tabs]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "an edge-anchored .dtr-panel sits off its edge by its full width except a .dtr-tab grab-handle on the visible edge (side: left | right)"
  - "dragging the tab toward centre pulls the panel out (translateX follows the pointer, clamped 0..width, no transition while dragging)"
  - "on release: a flick (|dx|>60) opens/closes by direction; else snap to open/closed by p>=threshold, with the cubic-bezier transition; a tap (no move) toggles"
  - "pointer move/up/cancel tracked on WINDOW so a drag that leaves the tab / goes off-window still ends + settles (the F-08 drag law)"
  - "open()/close()/toggle() animate + flip the tab label (Pull Me <-> Close) + chevron; set(p) is a PURE position; isOpen() reports state"
  - "transform: translateX + opacity only; JS toggles .is-open + swaps label; NO mix-blend / NO backdrop; NO WebGL; reduced-motion -> instant snap; keyboard (Enter/Space) toggles"
  - "asset-substitution gate: a dark panel with contact/utility content over OUR QUADRO page + warm palette; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. A 'Pull Me' tab clings to the left edge with the panel hidden. Drag the tab right past ~40% => the drawer snaps open + label flips to 'Close'; a small drag snaps back; a click toggles; a drag released off-window still settles. Triggered (NOT scroll) -> verify the drag-follow + threshold snap + label flip + the off-window settle (F-08), and run the TRIGGERED smoothness probe (arm the meter, cycle drag+click)."
note: |
  Brick 2 of the gapsystudio harvest (NO-WebGL basket A). An edge drawer with a 'Pull Me'
  grab-tab: drag to pull out, snap past a threshold, click to toggle, label+chevron flip.
  A tactile alternative to a hamburger. Bakes in the F-08 drag law from the start: pointer
  move/up on WINDOW so a drag leaving the tab / going off-window still ends + settles. No
  GSAP needed (CSS transition for the snap). transform + opacity = GPU-cheap. owns_pin false.
  Proven 1:1 on a QUADRO page: big-drag opens, click toggles, small-drag snaps back,
  off-window release still settles; 0.4% jank @ 59.9fps, zero console errors. gapsy palette =
  studio near-white #f2f2f0 + warm-black panel + signature red #f0473e accent.
---

# drag-tab-reveal — a 'Pull Me' edge tab drags a drawer out, snaps open past a threshold

gapsystudio's "Pull Me" drawer: an edge-anchored panel sits mostly off-screen with a small
grab-tab on its visible edge. Drag the tab to pull the panel out (it follows the pointer);
release past a threshold and it snaps open, otherwise it snaps back. Click toggles; the tab
label + chevron flip with the open state.

## Markup + call
```html
<div class="dtr-stage" id="drawer">
  <aside class="dtr-panel">
    <button class="dtr-tab"><span class="dtr-tab-label">Pull Me</span></button>
    <div class="dtr-content">… contact / menu / brief …</div>
  </aside>
</div>
```
```js
DragTabReveal.create('#drawer', { side:'left', threshold:0.4, openLabel:'Close', closedLabel:'Pull Me' });
```

## Proven (the lab)
A left "Pull Me" contact drawer over OUR QUADRO aerial render. Measured live: start closed
tx=-380 label "Pull Me"; big drag right → open tx=0 label "Close"; click → closed tx=-380 label
"Pull Me"; small drag (25px) → still closed; drag released far off-window (y=20) → still open,
settled (F-08 holds). Mid-drag (p=0.5): the dark panel half-pulled with the tab on its edge over
the QUADRO page; open: full contact panel (email/phone/socials/presentation) + tab label "Close ‹"
chevron flipped (matches gapsy /about). Triggered probe (4× CPU throttle, 5 drag+click cycles):
1/256 long frames (0.4%), 59.9fps → PASS. Zero console errors.
