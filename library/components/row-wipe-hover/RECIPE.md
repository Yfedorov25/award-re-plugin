---
id: row-wipe-hover
name: "Row wipe hover (tan band wipes L→R + underline grows + ordinal flips to a kanji)"
level: 2
kind: component
status: official
entry:
  call: "RowWipeHover.create(target, { row })  // each .rwh-row has a .rwh-ordinal with data-kanji. CSS draws the band + underline; JS toggles .is-hover + swaps the ordinal text."
  module: iife
  returns: "{ destroy }"
meaning:
  what: "Saisei's list-row hover — hovering a nav row: a tan highlight BAND wipes left->right across the row, a baseline UNDERLINE grows from the left, and the row's ordinal glyph FLIPS to a theme-kanji (ordinal <-> theme). The shapes are CSS (scaleX from left); JS wires the hover + kanji swap."
  when: "The hover state of a menu / nav list — each route lighting up with a wiping band, a growing underline, and an ordinal that becomes a meaning-kanji. The per-row interaction of dual-panel-menu. Where a nav should feel responsive and authored on hover."
  lands: "Hovering a menu row, a warm tan band sweeps across it from the left, a fine underline draws in beneath, and the little number beside it flips to a kanji that names the section — the row answering the cursor with three small, synchronised moves."
  not_when: "A non-interactive list. Touch-only contexts (hover doesn't fire — provide a tap state). When there's no ordinal/kanji pairing to flip (then it's just a band wipe)."
source:
  grammar: "Saisei menu rows: on hover a tan band wipes L->R + an underline grows from the left + the circular ordinal flips to the theme-kanji (e.g. 革新 for Project)."
  recording: "apps/quadro/.award-re/teardowns/D_saisei_video.md (S10 / row-wipe-hover)"
  registry_ref: ["S10-row-wipe-hover-saisei"]
stack: "vanilla (CSS-driven states)"
webgl: false
motion_props: [transform, opacity]
trigger: "hover (mouseenter/leave)"
timing_layer: [A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [menu, chrome]
combines_with: [dual-panel-menu, circular-ui-language, theme-tween]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "on hover: .is-hover toggles -> CSS ::before tan band scaleX 0->1 from the left + ::after underline scaleX 0->1 from the left"
  - "the .rwh-ordinal text swaps to its data-kanji on hover and back on leave"
  - "CSS transform(scaleX, origin left) + opacity only (transition); JS only toggles a class + swaps text; NO mix-blend / NO backdrop / NO WebGL; __LAB_OK__ on init"
  - "asset-substitution gate: OUR nav rows + theme-kanji"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Hover a row: the tan band wipes L->R, the underline grows from the left, and the ordinal flips to a kanji. Hover interaction (not scroll/timeline) — the smoothness-gate doesn't apply; verify the three moves fire on hover."
note: |
  Brick S10 of the Saisei harvest — the per-row hover of the menu. CSS owns the band +
  underline (scaleX from left); JS only toggles the class + swaps the ordinal to its
  data-kanji. Pairs with dual-panel-menu (the nav rows). Proven on QUADRO: band scaleX
  0.68 mid-wipe, ordinal 02->革新, 0% jank.
---

# row-wipe-hover — tan band wipes + underline grows + ordinal flips to a kanji

Saisei's nav-row hover: a tan band wipes L→R across the row, a baseline underline grows
from the left, and the ordinal flips to a theme-kanji. CSS draws the shapes; JS toggles
the state + swaps the glyph.

## Proven (the lab)
OUR nav rows — hovering row 02 adds .is-hover, the tan band wipes L→R (scaleX 0.68
mid-transition), and the ordinal '02' flips to '革新'. Probe (4× throttle): 0% long
frames, 59.9fps.
