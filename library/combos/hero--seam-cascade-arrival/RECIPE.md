---
id: hero--seam-cascade-arrival
name: "Дім, що відкривається"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "The page-enter AS a hero. A dark CENTRE SEAM parts and the hero render SURFACES and BRIGHTENS through the widening gap, then the serif title rises from under a baseline mask, and the eyebrow, body, corner-frame brackets, corner-meta labels and scroll cue assemble LAST. A LOAD-IN cascade, not a pinned scroll hero: the render is fixed behind, every atom is a set(p)/play timeline, the pin budget is ZERO. Work first, interface last (the Saisei authored-arrival)."
  when: "The very first section, when the strongest move available is the ARRIVAL itself. Use it when the brand wants the building to be discovered through a deliberate reveal rather than slammed full-bleed on load, and when the page should read as authored from the first frame. One strong cars-free exterior carries it."
  lands: "The page opens dark. A vertical centre seam splits and the house emerges through the opening, lifting out of darkness into full daylight in one beat. The title rises line by line, then the frame and its small labels quietly settle into the corners. It reads composed and expensive, like the door of the place is being opened for you, not like a slideshow."
source:
  grammar: "Saisei's authored page-arrival lineage (saisei-sbj.webflow.io), harvested frame-by-frame: the page-open render-slicer (a black centre seam parts, the render surfaces while a dark veil clears in lockstep, t073-t080), the line-by-line masked title (S5), and the FIXED content cascade where the chrome arrives last and quietest (S4) under the corner-framed plate (S8). Composed here as ONE load-in timeline so the enter itself is the heroic moment."
  recording: null
  registry_ref: []
uses:
  - { atom: render-slice-reveal,   job: "OWNER of the reveal: the ONE cover over the stage. The dark centre seam parts (center-seam-split, power2.in 1.4s) while the dark veil over the fixed render clears in lockstep (veil 0.96 -> 0, veilEase 0.92) so the building surfaces dark->bright as the gap widens. Driven by the load-in timeline via set(p). No second cover may be added." }
  - { atom: center-seam-split,     job: "The seam engine, COMPOSED inside render-slice-reveal (loaded first, never instantiated standalone here). It is the clip-path inset(0 50% 0 50%) -> inset(0) that peels the dark cover centre->edges. It owns no pin; it is a pure set(p)." }
  - { atom: mask-up-title,         job: "The serif H1 'Дім, що / відкривається' rises from under a baseline mask, line by line (translateY 116% -> 0, stagger 0.14, expo.out), played once at ~1.15s into the timeline as the seam is in its final third. Not a fade." }
  - { atom: content-stage-cascade, job: "Orchestrates the chrome in a FIXED last-order after the work: eyebrow (slide-x) -> body (fade) -> corner-frame brackets (staggered fade) -> corner-meta (fn) -> scroll cue (fade), with an uneven group gap. Played once at ~1.85s. The interface arrives last and quietest." }
  - { atom: corner-frame-meta,     job: "The three corner labels (вул. Замкова / Денний фасад / 6 таунхаусів 82 m2) fade in on a baseline as the LAST cascade stage, making the hero read as an authored plate, not a slide. reveal() is triggered by the cascade's fn stage." }
pin:
  owner: none
  count: 0
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "ZERO pins: no ScrollTrigger pins any element (ScrollTrigger.getAll().filter(pin).length === 0); the hero is a load-in GSAP timeline, NOT a pinned scrub. declare expectPins:0."
  - "ONE cover only: render-slice-reveal owns the single clip-path cover (it composes center-seam-split); no standalone center-seam-split cover is created over the same surface (no second-cover anti-combo)."
  - "Lockstep reveal: as the seam parts, the dark veil over the fixed render clears in lockstep off the SAME set(p) (verified mid-arrival: cover inset grows while veil opacity falls monotonically together); render finishes bright (veil 0) with the cover fully parted (inset(0 50% 0 50%))."
  - "Order proven on screen: render surfaces FIRST (drama 1.4s), title rises SECOND (~1.15s), chrome assembles LAST (~1.85s: eyebrow -> body -> brackets -> corner-meta -> cue). End state: title transform reset, eyebrow/meta/cue opacity 1."
  - "Decode-guard: the hero <img> is force-decoded (img.decode()) before the seam opens, so no undecoded black flickers through the widening gap; img reports decoded 1920x1080."
  - "Engine laws: clip-path + transform + opacity + filter only; will-change set on moving layers; NO mix-blend, NO backdrop-filter, NO WebGL, NO video.currentTime scrub; reduced-motion -> instant shown (seam set(1), title set(1), cascade shown)."
webgl: false
ease: air
class: "scroll (load-in cascade, no pin)"
---

# hero--seam-cascade-arrival — "Дім, що відкривається"

The page-enter authored as the hero. A dark centre seam parts, the cars-free exterior
(`renders/day-34.webp`, 1920x1080) surfaces and brightens through the widening gap, the
serif title rises from under a mask, and the corner-meta + chrome assemble last. One
heroic moment: the arrival itself. No pin — a single load-in GSAP timeline.

## The mechanic root (why it is distinct from the other nine heroes)
Other heroes cluster on "big title over full-bleed media". This one's motion ROOT is a
**dark centre seam that parts to deliver a brightening building** — a reveal-through-the-gap,
not a slide or a pinned scrub. The building is discovered, not slammed. That parting seam
is the unmistakable signature in a single screenshot.

## The cascade (one timeline, zero pins)
```
0      dark field; render hidden behind render-slice-reveal (slice shut + veil 0.96)
0.15s  HEROIC MOMENT — render-slice-reveal.set(0->1) drama 1.4s power2.in:
         the centre seam peels centre->edges, render surfaces, veil clears in lockstep
0.15s  slow ken-burns settle on the render (scale 1.06 -> 1.0, 3s, power1.out)
1.15s  mask-up-title.play() — title rises line by line (stagger 0.14, expo.out)
1.85s  content-stage-cascade.play() — eyebrow -> body -> brackets -> corner-meta -> cue (LAST)
```

## Wiring contract
- `#arrivalStage[data-render-surface]` is the `.rsr-stage`; it wraps `.rsr-render`
  (the hero `<img id="heroImg">`) + `.rsr-veil`. render-slice-reveal injects the seam
  cover here — the ONLY cover.
- center-seam-split's `component.js` is loaded BEFORE render-slice-reveal (canon dep),
  but is only instantiated through `render-slice-reveal` (`slice.seam()`), never standalone.
- `#heroTitle` holds two `.mut-line > span` rows for mask-up-title.
- `#frame` holds the four `.sca__bracket` corner brackets + three `[data-corner]` labels
  (tl/bl/br only — no `rc`, whose CSS translate would fight the atom's transform writes).
- Pin budget: `SectionHarness.declare({ pinOwner:'none', expectPins:0 })`. The harness
  creates no section pin; no atom owns one.

## Gate (load-in hero)
Open `combo-lab.html` in a real browser. `__LAB_OK__` true once ready (1 engine, pins===0,
all 5 cited atoms ran without throwing, the render painted at non-zero size, 0 real console
errors). Watch the arrival: the dark centre seam parts and the building surfaces + brightens
in lockstep, the title rises under its mask, then the corner-meta + chrome settle last.
Verified headless: labOK true, pins 0, render decoded 1920x1080, end state veil 0 + cover
inset(0 50% 0 50%) + chrome opacity 1.
