---
id: section-pager
name: "Wheel-hijack fullpage section pager (EVER curtain engine)"
level: 1
kind: component
status: official
entry:
  call: "SectionPager.init(target, options)  // target = the .sp-stage el or selector. MARKUP-FIRST: the engine pages the .pane children already in target. options all optional: { curtainMs, contentMs, bgZoomMs, bgZoom, ease, lockPad, copyDelay, loop, onStep }. (alias: sectionPager(target, options))"
  module: iife
  returns: "{ go(dir), to(i), current(), ease, destroy }  (or { static:true, destroy } in the reduced-motion / coarse-small branch)"
meaning:
  what: "The WHEEL-HIJACK FULLPAGE PAGER — the engine BOTH EVER and most Vide-Infra 'section curtain' sites run, harvested ONE-TO-ONE from the live EVER site (read off its real landing.js + measured live). It is NOT scroll-scrubbed: the page does not natively scroll. Stacked position:fixed full-viewport panes; ONE wheel / touch / key gesture = ONE section step, input LOCKED during the transition. A rAF tween moves TWO adjacent panes at once (the PAIRED CURTAIN): incoming translateY +100%->0 while outgoing 0->-100%, via easeOutQuart (verbatim from EVER, front-loaded ~59% of travel in the first 200ms, ~850ms total). TWO clocks per step: the short CURTAIN (panes) and a longer CONTENT settle (wordmark clipped-rise + per-line rise + bg scale 1->1.06) that OUTLASTS the curtain — that overhang is the luxury. Reveal is TRANSLATE-only (EVER barely fades). CONFIG-DRIVEN: re-fires on ANY content / word / section-count, not EVER's specific assets."
  when: "A premium, authored, full-screen SECTION-BY-SECTION experience where each scroll gesture advances one held cinematic frame and the next section RISES over the last as a curtain — the opposite of a continuous scrubbed scroll. The backbone of an EVER/Vide-Infra-grade landing: hero -> chapter -> chapter, each a full viewport, each handed off by the paired-curtain rise. This is the ENGINE; the per-section composition (split, wordmark, collage) sits ON TOP and is owned by the site, not this primitive."
  lands: "Scrolling feels like turning pages of an expensive book: one gesture, the current frame lifts away upward while the next rises from below in one paired move, the giant section word and copy keep settling a beat after the frame has arrived. Discrete, deliberate, never a loose continuous scrub; the long content overhang reads as money."
  not_when: "A continuous scroll-scrubbed story where progress maps 1:1 to scroll position (use a pinned scrub component: media-step-switch / slice-clip). A normal long editorial page the eye walks down (stacked-pairs). Anything that must keep native scrolling (long copy, forms, anything accessibility-critical without the static fallback). Mixing a wheel-hijack pager with a scroll-scrub pin in the same page (pick ONE scroll model per page)."
source:
  grammar: "Harvested 1:1 from the LIVE EVER site (ever-live-here.com): custom controller, NO Lenis/GSAP/ScrollTrigger; position:fixed stacked panes; one gesture = one ~850ms section step; paired translateY curtain; easeOutQuart verbatim from landing.js; bg-zoom + per-line reveal outlasting the curtain. Full spec + measured curve in EVER-MOTION-SPEC-live.md."
  recording: "apps/quadro/public/slide-lab/ever-exact.html (the 1:1 build) + apps/quadro/.award-re/teardowns/EVER-MOTION-SPEC-live.md (measured data)"
  registry_ref: ["T-pager-ever"]
stack: "vanilla JS only (no libs). rAF tween + Penner easings (verbatim from EVER)."
webgl: false
motion_props: [transform, opacity]
trigger: "wheel/touch/key HIJACK -> rAF paired-curtain tween (NOT a ScrollTrigger, NOT scrub). Input locked during the transition. Reversible (scrub back = section steps back)."
timing_layer: [B-entrance, A-ambient]
owns_pin: false
owns_scroll: true
page_beat: [hero, chapter, proof, material]
combines_with: [section-curtain-riseover, bleeding-wordmark, theme-tween, splitLines, scroll-indicator]
anti_combos: [scroll-scrub-pin, lenis-smooth-scroll, second-scroll-owner]
gated_by: [R_one_scroll_owner, R_anti_combos, R_perf_limits, R_timing_layers, R_reduced_motion_fallback]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "WHEEL-HIJACK pager, NOT scroll-scrubbed: page does not natively scroll; ONE wheel/touch/key gesture = ONE section step; input LOCKED during the ~850ms transition (a gesture cannot double-fire mid-curtain)"
  - "PAIRED CURTAIN: two adjacent panes move on ONE rAF clock — incoming translateY +100%->0 while outgoing 0->-100% — via easeOutQuart (verbatim); reversible; the measured curve is front-loaded (~59% of travel in the first 200ms)"
  - "TWO clocks: a short curtain (~850ms) AND a longer content settle (~1700ms) that OUTLASTS it (wordmark clipped-rise + per-line rise + bg scale 1->1.06); the overhang is the luxury"
  - "reveal is TRANSLATE-only (clipped rise inside overflow:hidden wraps; [data-fade] used sparingly for sub copy); the outgoing pane stays fully opaque the whole travel (curtain COVERS, never crossfades) => zero blank"
  - "CONFIG-DRIVEN: the lab proves the SAME engine on OUR content — QUADRO renders, Ukrainian copy, a different word, a DIFFERENT section count (3) than EVER — i.e. it re-fires on our assets, it is not a trace of EVER's. (asset-substitution gate)"
  - "GPU law: every .pane its own compositor layer (translateZ(0)/will-change/backface-hidden/contain:layout paint); transform+opacity only; NO mix-blend / NO backdrop-filter over a moving pane; NO clip-path on the moving pane"
  - "prefers-reduced-motion / coarse-small pointer -> static stacked scroll (no hijack), still legible; window.__LAB_OK__ set once panes mount"
gate:
  probe: "Open lab.html in a REAL browser. __LAB_OK__ true once panes mount. Then drive a wheel gesture and confirm: (1) exactly one section advances per gesture, (2) the curtain is a paired rise (not a fade/crossfade), (3) reversible, (4) the wordmark + lines keep settling AFTER the curtain lands, (5) zero blank frame mid-rise. This is a SCROLL-MODEL primitive (wheel-hijack) — the curtain-mode smoothness gate (CURTAIN=1) applies (overlap of two solid panes during the rise is EXPECTED, not a diptych); blank/jank/fps stay hard. Eye-check in a real browser is required."
note: |
  This is the FIRST harvested ENGINE per the 2026-06-26 council verdict: don't clone
  reference sites 1:1 — harvest the MECHANISM, prove it config-driven on OUR content,
  bank it, move on. The composition that sits on top (hero split, giant wordmark fill,
  the Architecture editorial collage) is NOT owned here — those are separate primitives
  (bleeding-wordmark, fluid-type sizing, pinned-parallax composition) and site-specific
  art direction. This component owns ONLY the scroll model + paired curtain + reveal
  orchestration. Pairs with section-curtain-riseover (the visual seam) and theme-tween.
---

# section-pager — wheel-hijack fullpage pager (EVER curtain engine)

The reusable ENGINE behind EVER and most Vide-Infra "section curtain" landings,
harvested one-to-one from the live site. **Not** scroll-scrubbed — a custom
wheel/touch/key hijack that pages full-viewport `position:fixed` panes, one
gesture per step, with a paired-curtain rise on `easeOutQuart` and a content
settle that outlasts the curtain.

## Why this is a primitive (and the giant letter / collage are NOT)
Per the council: the **mechanism** (scroll model + curtain + reveal timing) is
reusable and config-driven. The **composition** on top — EVER's giant `eveR`
spanning the screen, the oval-video-in-a-letter, the Architecture editorial
collage with floating spheres — is art direction + assets, captured as separate
primitives or invented per project. This file owns the engine only.

## Engine contract (measured live off EVER)
- custom controller, **no Lenis / no GSAP / no ScrollTrigger**; page doesn't scroll.
- stacked `position:fixed` panes; one wheel/touch/key gesture = one section step;
  input locked during the ~850ms transition.
- paired curtain: incoming `translateY(+100%->0)`, outgoing `0->-100%`, `easeOutQuart`
  verbatim (`1-(1-t)^4`), front-loaded (~59% of travel in the first 200ms).
- two clocks: curtain ~850ms + content settle ~1700ms (wordmark rise + per-line
  rise + bg `scale 1->1.06`) that OUTLASTS the curtain = the luxury overhang.
- reveal TRANSLATE-only (EVER barely fades); outgoing pane stays opaque the whole
  travel (curtain covers, never crossfades) -> zero blank.

## Markup contract
`<div class="sp-stage">` containing `<section class="pane">` children. Inside a
pane: a `.bg` with an `<img>` (gets the bg zoom); `[data-rise]` / `.rise` for a
clipped-rise element (e.g. a bleeding wordmark in a `[data-rise-wrap]`);
`[data-rise-line]` for a multi-line block (auto-split into per-line rises);
`[data-fade]` for the sparing sub-copy fade. Call `SectionPager.init('#stage', opts)`.

## Asset-substitution gate (the lab)
`lab.html` runs the EXACT engine on QUADRO renders + Ukrainian copy + the word
"quadro" + **three** sections (EVER's count differs) — proving the primitive is
config-driven, not a trace of EVER's assets. This is the council's required gate:
"feels right on OUR content" = done, not "matches EVER's pixels".

## Next harvest (per council, ~1 afternoon each, banked even if rough)
- `fluid-type-sizing` — the giant-word SIZING mechanism (viewport + word-length
  aware), extracted as a formula, not EVER's specific letter.
- `pinned-parallax-composition` — the Architecture collage ENGINE (multi-layer
  parallax), working on QUADRO content.
- from SPRINGS: `dual-parallel-slicer` + `pinned-stat-odometer` only.
