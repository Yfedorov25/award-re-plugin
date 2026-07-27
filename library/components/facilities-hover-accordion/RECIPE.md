---
id: facilities-hover-accordion
name: "Facilities hover-accordion (N image cards in a flex row; hovering a card grows it ~3.5x while neighbours shrink, its label fades in and it shows a wider crop; default-active = centre)"
level: 2
kind: component
status: official
entry:
  call: "FacilitiesHoverAccordion.create(target, opts)  // target wraps .fha-card x N (each: .fha-media img + .fha-label + optional .fha-tab). opts: { grow, defaultIndex, card }."
  module: iife
  returns: "{ setActive(i), clearActive(), cards, destroy }"
meaning:
  what: "11tanjung's facilities row — N image cards in a flex row (flex: 1 1 0). Hovering a card makes it GROW (flex-grow ~3.5, width ~17% -> ~45%) while its neighbours shrink (~13%); the active card's LABEL fades in (opacity 0 -> 1) and the active media eases to a WIDER, centred crop. Default active = the centre card so the row is never flat. transition flex + opacity ~350ms cubic-bezier(.4,0,.2,1). A CSS accordion — JS only moves an .is-active class on hover/focus."
  when: "An amenities / facilities / gallery strip where you have N peer images and want exploration to feel tactile — one card opens to a readable, wider crop with a caption while the others stay as teasers. Use it when the items are equal in rank (pergola, terrace, courtyard…) and a static grid would read as a catalogue. The default-active centre gives the row a focal point before the user touches it."
  lands: "You see a row of tall slivers of images, the middle one already opened wide with its name on it. As you move across, whichever you point at smoothly widens — its photo settling to a fuller, centred crop and a caption fading up — while the rest squeeze to quiet columns with just a label. It feels like flipping through panels with your cursor: one always open, the row breathing as you move."
  not_when: "Items with a clear hierarchy or a single hero (use a feature block). A long list that needs scanning (use a grid or list). Touch-primary surfaces where hover is unreliable (the default-active holds, but consider a tap-carousel). When the captions are long (the collapsed cards can't show them). More than ~6 cards (the collapsed slivers get too thin to read)."
source:
  grammar: "11tanjung D1: 5 cards flex-row flex:1 1 0; hover -> active flex-grow ~3.5 (width ~17% -> ~45%), neighbours shrink (~13%); label opacity 0->1 on the active; the active shows a wider crop (object-position). transition flex+opacity ~350ms cubic-bezier(.4,0,.2,1). default active = centre."
  recording: "apps/quadro/.award-re/teardowns/D_11tanjung_video.md (D1 facilities-hover-accordion)"
  registry_ref: ["D1-facilities-hover-accordion-11tanjung"]
stack: "vanilla (CSS-driven states; JS toggles a class + sets a CSS var)"
webgl: false
motion_props: [flex-grow, opacity, object-position, transform]
trigger: "hover / focus (triggered primitive; default-active centre at rest)"
timing_layer: [D-interaction]
owns_pin: false
owns_scroll: false
page_beat: [facilities, amenities, gallery-strip]
combines_with: [panel-rise-over, editorial-act-crossfade, coords-corner-frame, blur-reveal-stagger-title]
anti_combos: [hover-over-scrubbed-surface]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "N cards in a flex row (flex: 1 1 0); the .is-active card has flex-grow: var(--fha-grow) (default 3.5), neighbours flex-grow 1 -> active ~45% / each neighbour ~13% for 5 cards"
  - "hover/focus moves .is-active to that card; mouseleave/focusout restores the DEFAULT-active (centre by default); JS sets --fha-grow and the default index, no layout math"
  - "the active card's label fades opacity 0 -> 1 (+ lift); the active media eases to a wider, centred crop (object-position 50%); idle cards show an off-centre slice + tiny scale"
  - "all transitions ~350ms cubic-bezier(.4,0,.2,1) (flex-grow + opacity + object-position)"
  - "CSS flex-grow + opacity + object-position (+ tiny scale) only; JS toggles a class; NO mix-blend / NO backdrop; NO WebGL; keyboard parity (focus mirrors hover, cards focusable)"
  - "touch/no-hover -> the default-active card stays; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO facility renders + a serif italic active label + warm palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. At rest the CENTRE card is active (wide, label shown), the rest are thin columns with mini-labels. Hover any card -> it grows to ~45%, neighbours shrink to ~13%, its label fades in, its crop widens; leaving restores the centre. Triggered hover (NOT scroll) -> verify the width split + label fade + default restore, and run the HOVER variant of the smoothness probe (arm the meter, cycle hovers across all cards), not the wheel-scroll variant."
note: |
  Brick 7 of the 11tanjung harvest — the facilities row. A pure CSS flex accordion: every
  card flex:1 1 0, the active one flex-grow ~3.5, neighbours squeeze, label fades in, crop
  widens; JS only moves the .is-active class and holds a default-active centre. A hover/
  triggered primitive (owns_pin false) — distinct from the scroll bricks; probe via the
  HOVER variant. The 17%->45% width split falls out of grow/(grow+N-1) with grow 3.5 and 5
  cards. flex-grow + opacity transitions = GPU-cheap. Proven 1:1 on QUADRO renders: active
  ~45% / neighbours ~13% dead on, label opacity 0->1 on the active only, default centre,
  0.3% jank @ 59.9fps across cycled hovers, zero console errors. The active label is serif
  italic (Canela / PP Editorial class; Playfair Display italic is the free stand-in).
---

# facilities-hover-accordion — a flex row of image cards; hover grows the active, neighbours shrink

11tanjung's facilities row: N image cards (flex: 1 1 0). Hovering a card grows it (flex-grow
~3.5, width ~17% → ~45%) while its neighbours shrink (~13%); the active card's label fades in
and its media eases to a wider, centred crop. Default active = the centre card. A CSS accordion;
the JS only moves an `.is-active` class on hover/focus and restores the default on leave.

## Markup + call
```html
<div class="fha-row" id="fac">
  <div class="fha-card">
    <div class="fha-media"><img src="a.webp"></div>
    <div class="fha-tab">Tab</div>
    <div class="fha-label"><h3>Title</h3><p>…</p></div>
  </div>
  <!-- … 5 cards … -->
</div>
```
```js
FacilitiesHoverAccordion.create('#fac', { grow:3.5, defaultIndex:'center', card:'.fha-card' });
```

## Proven (the lab)
5 cards on OUR QUADRO renders (pergola / terrace / courtyard / night / roof). Measured live:
REST = centre active (widths 12.9 / 12.9 / 45.3 / 12.9 / 12.9 %, label opacity only on the
active). HOVER card 1 → [45.3, 12.9, 12.9, 12.9, 12.9]; HOVER card 5 → [..., 45.3]; LEAVE →
back to the centre at 45.3. Active ~45% / neighbours ~13% = the 11tanjung 17%→45% split, dead
on. Hover-variant probe (4× CPU throttle, cycling all 5 cards ×6): 2/580 long frames (0.3%),
59.9fps → PASS. Zero console errors. Screenshot (terrace active): the building render in a wide
centred crop + "Приватна тераса" label, four collapsed columns with vertical tabs (matches
11tanjung D1).
