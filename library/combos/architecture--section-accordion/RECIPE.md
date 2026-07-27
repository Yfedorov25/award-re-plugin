---
id: architecture--section-accordion
name: "Дім у розрізі"
level: 2
kind: section-variant
status: base
section: architecture
meaning:
  what: "An INTERACTIVE architecture chapter built as a horizontal accordion of FOUR big renders, one open at a time. The building is shown у розрізі as peer components - Вінець (покрівля) / Пергола (тінь) / Фасад (оболонка) / Основа (ділянка). At rest one slab is open (a near-full render, with its kicker + big serif label + one-line material spec) and the other three are narrow vertical strips carrying only a rotated spine label. HOVER, focus or click a strip and it EXPANDS to a near-full render of that component while the others compress to thin spines, its plate fading up; move to the next slab and it opens while the previous collapses, a smooth horizontal accordion flow. The render NEVER swaps as a slab opens or collapses (object-fit:cover slice -> near-full), so the slab you touch IS the slab that opens - marker-content correspondence is structural, not wired. The owner's exact ask (big renders + hover the next one -> it opens), the REDO of the failed exploded-layers / anatomy variants."
  when: "The architecture section when the building should be read PART BY PART and the parts are equal in rank - you want each component to open to a big, legible render with a single line of material proof, one at a time, without leaving the page or breaking the composition. The 'this is what the house is made of' beat as a tactile thing the reader drives with the cursor, richer than a static grid and calmer than a slider."
  lands: "A row of tall renders fills the section, one already opened wide with its name and a line of material spec; the rest are quiet vertical strips with a single rotated label. As you move across, whichever you point at glides open to a near-full render while the previous folds back to a strip - one always open, the row breathing horizontally. It reads engineered and editorial, like opening the layers of the building with your cursor; every slab shows exactly the component it names."
source:
  grammar: "ERA (era.estate) /architecture carouselSync (two linked render carousels handing one architectural view to the next, each frame carrying its own label) + Springs (springs.estate) 'Open the doors' clip-path render strip (a seam that travels to reveal the next render), re-cast as a HOVER accordion: the travelling seam of those scroll engines becomes a clip-path inset that opens one slab at a time on hover, with ERA's per-frame label + material spec on the open slab."
  recording: null
  registry_ref: ["D_ERA_architecture", "D_Springs_architecture"]
uses:
  - { atom: layer-accordion-reveal, job: "owns the whole interaction: builds the four .lar-slab layers from panels[], holds one open at a time, and animates the open BAN-CLEAN via transform: translateX(--x) + clip-path: inset(--w) + opacity/filter (no width/left/flex tween). Hover/focus/click/Enter open a slab and collapse the previous; mouseleave restores the default-open slab. It creates NO ScrollTrigger (a hover/triggered primitive), which is why this section owns no pin." }
pin:
  owner: none
  count: 0
gated_by: [R_perf_limits, R_no_webgl, R_anti_combos, R_timing_layers]
acceptance:
  - "INTERACTIVE, no scroll pin: pins === 0, expectPins:0, pinOwner none; the cited layer-accordion-reveal owns the interaction and creates no ScrollTrigger; window.__LAB_OK__ true with 0 real console errors"
  - "ONE open at a time: at rest defaultIndex (Фасад) is open (~62% of the rack, plate kicker+label+spec shown) and the other three are vertical strips (~12.7% each) with a spine label; hover/focus/click a strip opens it and collapses the previously open slab; never more than one .is-open; mouseleave restores the default"
  - "MARKER-CONTENT CORRESPONDENCE (the failed-variant fix): each slab's render IS the component it names and the render NEVER swaps open or collapsed, so the slab you touch is the slab that opens. Verified by clicking each: Вінець=renders/macro-roof.webp (rooftop deck), Пергола=renders/macro-pergola.webp (timber soffit), Фасад=renders/day-34.webp (frontal facade), Основа=renders/aerial.webp (aerial site). Never a label on one element revealing another"
  - "VISUAL STRENGTH + ASSET TRUTH (the failed-variant fix): the open slab is a near-FULL big render (not a small crop), and the four renders are visually DISTINCT (a square rooftop deck, a timber soffit, a wide frontal facade, a tall aerial of the grounds); no two near-identical shots, no cars-as-architecture, no duplicate image relabelled"
  - "BAN-CLEAN motion: the open animates ONLY via transform (translateX) + clip-path (inset) + opacity/filter; every slab is a fixed width:100% layer and NO width/height/top/left/margin/flex is animated; the house air ease cubic-bezier(.22,1,.36,1), open ~620ms / label ~340ms; will-change: transform, clip-path on the slabs, dropped in the static fallback; NO WebGL / NO mix-blend / NO backdrop-filter / NO video.currentTime"
  - "reduced-motion / hover:none(touch) -> a static labelled list (all four slabs even, every label shown, no clip/transform transitions). Ukrainian Fedoriv copy, sparse, proof-not-promises, ZERO em/en-dash; built on OUR QUADRO renders"
webgl: false
ease: air
---

# architecture--section-accordion - Дім у розрізі

REDO of the exploded-layers / anatomy variants as a STRONG horizontal ACCORDION (the
owner's exact ask: big renders + hover the next one -> it opens). The building is shown
as four peer components side by side - `Вінець / Пергола / Фасад / Основа` - at rest one
open as a near-full render and the rest narrow strips. Hover a strip and it expands to a
near-full render of that component while the others compress to spines; move to the next
and it opens while the previous collapses. One open at a time, a buttery horizontal flow.

## Why this fixes the two failures

1. CORRESPONDENCE (the unforgivable old bug: a number on the glazing revealed a terrace).
   Here the render NEVER swaps - a slab is the SAME render whether it is a strip or open
   (object-fit:cover slice -> near-full). So the slab you touch is provably the slab that
   opens; there is no separate marker that can point at the wrong element. Verified live by
   clicking each slab: Вінець->macro-roof, Пергола->macro-pergola, Фасад->day-34,
   Основа->aerial.
2. VISUAL STRENGTH (the old bug: small duplicate crops). The open slab is a near-FULL big
   render, and the four are deliberately distinct: a square rooftop deck, a timber soffit,
   a wide frontal facade, a tall aerial of the grounds. No two near-identical shots.

## The one move (ONE atom, no pin)

`layer-accordion-reveal` owns the whole interaction. Every slab is the SAME fixed
`width:100%` layer; the open is animated ban-clean by `transform: translateX(--x)`
(position) + `clip-path: inset(0 calc(100% - --w) 0 0)` (visible width) + `opacity`/
`filter` for the labels - never a width/left/flex tween. It creates no ScrollTrigger, so
the section owns no pin (`pins === 0`).

## Proven

On OUR QUADRO renders + Ukrainian copy: rest = Фасад open ~62% with its plate, three
strips ~12.7% with spine labels; hovering each strip opens exactly that component
(macro-roof / macro-pergola / day-34 / aerial), one `.is-open` at a time, the previous
collapsing; transform + clip-path only; reduced-motion/touch -> static labelled list;
`__LAB_OK__` true, 0 pins, zero console errors.
