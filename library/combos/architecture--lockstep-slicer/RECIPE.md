---
id: architecture--lockstep-slicer
name: "Розкрій"
level: 2
kind: section-variant
status: base
section: architecture
meaning:
  what: "The architecture chapter as Springs' 'Open the doors' COUPLED-SPLIT. ONE pinned scroll, owned by the dual-slicer ENGINE, drives TWO systems in lockstep off one position: the RIGHT column is a vertical CLIP-PATH RENDER STRIP of two frame-matched 16:9 exterior views (day front facade -> terrace), where the incoming lower render is revealed UPWARD by shrinking its top inset (inset(100 0 0 0) -> inset(0)), a crisp full-width horizontal seam travelling up, scroll-scrubbed 1:1, reversible, lower-covers-upper, not a fade and not two opposite slides; the LEFT column SIMULTANEOUSLY reveals the heading per-line (each line rises from under an overflow-hidden clip) and rises a small macro-pergola detail inset from below, both on the SAME scroll. The render leads, the cream serif settles a beat behind. Several things gliding together off one scroll, the 'more custom than EVER' parallel."
  when: "The flagship architecture beat where one section must reveal the BUILDING across more than one viewpoint at once: a column of exterior renders handing off one to the next while the headline assembles line by line and a construction-detail macro lifts into place. The 'this studio can choreograph' moment, a coupled split that reads richer and more authored than a single full-bleed or a plain slider."
  lands: "As you scroll one pinned section, the right view swaps by a clean rising seam, the day front facade handing off to the terrace, while in the same motion the left headline builds line by line and the pergola macro lifts into place. It reads engineered and expensive, two viewpoints of the same building moving in lockstep, not one static image and not a carousel."
source:
  grammar: "Harvested from the springs.estate 'Open the doors of Springs' section, frame by frame: right vertical clip-path render strip with the seam travelling up, scroll-scrubbed and reversible, coupled to a left per-line heading reveal plus a rising inset, two scroll systems on one scrub. Per-frame seam curve in D_springs_dual_render_slicer_clip.md (f_015 seam 100 percent -> f_018 0 percent, reversed f_025 -> f_027, image leads text by a beat f_017 -> f_018)."
  recording: null
  registry_ref: ["T-dualslicer-springs"]
uses:
  - { atom: dual-slicer, job: "owns the single pin and Lenis; runs both systems off one scrub. RIGHT: the .ds-render strip handoff (top-inset clip-path 100->0, lower covers upper, crisp reversible seam). LEFT: the .ds-line per-line rise + the .ds-inset macro-detail rise, geared so the text lands just before the first render finishes opening." }
pin:
  owner: dual-slicer
  count: 1
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "Exactly ONE pinned ScrollTrigger, owned by the dual-slicer ENGINE (pinOwner dual-slicer, expectPins 1); the harness creates no pin and does not double-manage Lenis; render(prog) stays a pure function of progress and is reversible on scroll-up."
  - "RIGHT strip: two frame-matched 16:9 renders (day-front -> terrace-02, both 1920x1080) stacked; the incoming lower render reveals UPWARD via clip-path inset(100 0 0 0)->inset(0); lower covers upper; crisp full-width horizontal seam; not a fade, not two opposite slides."
  - "LEFT column coupled to the SAME scroll: the three heading lines rise from under their .ds-line clips (staggered) AND the .ds-inset macro-pergola detail rises from below, all moving in the same scroll beat as the right seam, the text settling a beat behind the render."
  - "Engine laws hold: Lenis 1.1.13 lerp 0.1 -> gsap.ticker -> ScrollTrigger.update, lagSmoothing(0); motion only on clip-path + transform + opacity; GPU layers via will-change cleared after; NO mix-blend / NO backdrop over the scrubbed surface; NO WebGL; NO video.currentTime."
  - "[data-render-surface] on the FIRST .ds-render (the painted box), NOT on .ds-right: the scaffold forces [data-render-surface] to position:absolute;inset:0, which on .ds-right would pull the whole right column out of the 50/50 flex split and paint the render full-bleed over the left copy. On .ds-render it matches the atom's own position:absolute;inset:0, so the column seam is preserved and the first render paints a decoded img at non-zero size; window.__LAB_OK__ true; zero real console errors."
  - "Composition is art-directed for the ~0.8:1 right column: the wide facade renders carry a parking foreground in their lower band, so an editorial top+bottom scrim on .ds-render::after (deeper at the foot, .62 alpha) lets that asphalt recede into shadow and the white facade reads as the focal subject. No zoom/transform on the renders (that would magnify the cars and crop the building edges, and object-position-Y does not bite at this aspect because cover shows full height); the frame-matched pair stays untouched so the seam aligns edge-to-edge."
  - "reduced-motion / <=820px -> static stacked fallback (columns stack, both renders shown, no clip/transform), the air preserved; built on OUR QUADRO renders + Ukrainian copy."
webgl: false
ease: air
---

# architecture--lockstep-slicer · "Розкрій"

The architecture chapter built as Springs' signature COUPLED-SPLIT. One pinned
scroll, owned by the `dual-slicer` engine, drives two systems in lockstep so the
building reveals itself across two viewpoints at once: the right column hands one
exterior render up to the next behind a crisp rising seam, while the left headline
assembles line by line and a construction-detail macro lifts into place. The render
leads, the cream serif settles a beat behind. That coupling is what reads "more
custom than EVER", not more effects.

## The two systems (one scroll)
- RIGHT: a `.ds-render` strip of two frame-matched 16:9 exterior views. The
  incoming lower render (`terrace-02`) is revealed UPWARD over the outgoing
  `day-front` via `clip-path: inset(100% 0 0 0) -> inset(0)`, scroll-scrubbed,
  lower-covers-upper, a crisp full-width horizontal seam, fully reversible on
  scroll-up. Because both renders are 1920x1080 under `object-fit: cover`, the
  seam aligns edge-to-edge with no jump. The strip lives in the right half of the
  50/50 split (`.ds-right` keeps the atom's `position:relative; flex:0 0 50%`); the
  `[data-render-surface]` marker rides the first `.ds-render`, not `.ds-right`, so
  the scaffold's absolute-fill rule lands on the painted box and never collapses the
  column. In the ~0.8:1 column the building is the hero; an editorial bottom scrim
  grounds the parking foreground so it reads as context, not subject.
- LEFT: the three `.ds-line__i` lines rise from under their `overflow:hidden`
  `.ds-line` clips (staggered), and the `.ds-inset` macro-pergola detail rises
  from below, on the SAME scroll beat. The engine gears the left reveal so the
  text finishes just before the first render handoff completes, reproducing the
  Springs "image first, word confirms" cadence (frame-cited f_017 -> f_018).

## Why this register, not the mood read
Architecture sells the BUILDING, so the strip carries form and material, the day
front facade and the terrace, and the inset is a macro of the pergola, not a
portrait and not a day-to-night mood crossfade (that is the atmosphere chapter,
out of scope here). The heading states the form plainly: "Фасад / відкриває /
терасу." The body is proof, not promise: brick, glass, the terrace timber, a
geometry that works for quiet rather than for show.

## Pin + engine ownership
`dual-slicer` is an ENGINE: `owns_pin: true`. It creates the single pinned
ScrollTrigger on `#slicer` (length `innerHeight * 1.5 * max(1, handoffs)`) and it
manages Lenis itself. The harness therefore creates NO pin and does not touch
Lenis; it only `boot()`s, wraps the atom in `ranOK('dual-slicer', ...)`, and
`declare({ pinOwner: 'dual-slicer', expectPins: 1, atomsCited: ['dual-slicer'] })`.
One scroll owner, one pin, the two-pins-fight guard never fires.

## Type / color / motion (concrete)
- Display serif Fraunces 300 for the heading, clamp(40px, 7vw, 120px), line-height
  .96, tracking -0.03em; clean Inter for body 15-18px / 1.62 and the eyebrow
  (uppercase 12px, ls .26em, weight 500). Contrast H1/body well past 4:1.
- Palette is quiet stone: warm near-black field `#14120e`, umber-charcoal copy
  panel, cream `#efe8da` text, muted stone `#9b9385` body, brass `#c2a878`
  eyebrow, one hairline border token `rgba(239,232,218,.16)`. One base plus one
  accent, no veil of color over the renders.
- Motion is the engine's: `ease: air` (cubic-bezier 0.22,1,0.36,1) registered
  once; the seam is `ease: none` 1:1 with scroll (the architectural hard cut),
  every text element eases up (the soft type). Hard cut plus soft serif is the
  Springs luxury contrast. One heroic moment per section: the lockstep handoff.
- Air: section padding-y clamp(80px, 12vh, 200px), side clamp(20px, 5vw, 80px),
  gaps on the 8pt rhythm (40 / 32 / 48). reduced-motion and <=820px fall back to a
  clean static stack with the air kept.
