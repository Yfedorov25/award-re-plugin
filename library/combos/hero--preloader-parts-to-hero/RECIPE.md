---
id: hero--preloader-parts-to-hero
name: "Очікування як ритуал"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "A hero whose FIRST beat is the wait itself. A band-collapse preloader (a dark panel with the brand wordmark centred and a live 0 to 100 counter bottom-left) holds as a REAL network gate over the heavy hero render. The render <img> is force-decoded; only when img.decode() resolves (and a minimum ritual hold passes) does preloader.ready() fire: the dark panel collapses to a centre band and clears, the brand wordmark hands off (fades up), and a CENTRE SEAM (a cream cover over the render) OPENS, its two halves parting from the centre line outward to unveil the building. The instant the doors finish, the title rises line by line from under baseline masks and the content cascades in (eyebrow, body, meta, CTA, then the top chrome LAST). One heroic moment: a counted wait that resolves into doors that part from the centre."
  when: "The hero of a premium ЖК / townhouse landing where the level must be signalled before a single word is read, and where the hero render is heavy enough that a load gate is honest rather than decorative. Use it when the brand can own the wait as a ritual (an Awwwards preloader register) and the first reveal should feel earned, not instant."
  lands: "You wait on a calm dark field, a serif wordmark and a counter climbing to 100, then the field collapses to a hairline and cream doors part down the centre to reveal the building, the headline rising into place beside it. It reads engineered, patient and expensive, not a stock fade-up of a big title over a photo. Mid-open it is unmistakable in a still frame: two cream halves retreating from a centre seam."
source:
  grammar: "11tanjung's intro preloader (a dark panel + cursive wordmark + fake 0 to 100 counter that collapses to a centre band, hero revealed top and bottom; D_11tanjung d010 to d018) WELDED to Saisei's signature centre-seam reveal (a cover that peels apart from the centre line outward; D_saisei S1) and Saisei's content cascade (background to accent to title to meta to chrome LAST; D_saisei S4) and the masked big-title rise (D_saisei S5). The award lineage: the wait as brand (11tanjung) handing off into the centre-seam unveil (Saisei)."
  recording: null
  registry_ref: []
uses:
  - { atom: preloader-band-collapse, job: "OWNER OF THE OPENING: the dark gate. Renders the brand wordmark + a live 0 to 100 counter over a full-viewport dark panel; run() starts the counter and holds; ready() (gated on the hero img.decode()) collapses the panel to a centre band and clears it, then fires the onReveal that hands the wordmark off and triggers the seam." }
  - { atom: center-seam-split, job: "THE UNVEIL: a cream cover injected over [data-render-surface], started CLOSED (set(0), fully covering the decoded render so no undecoded frame is ever shown). On the preloader onReveal, open() parts the cover from the centre line outward (axis x, vertical seam, power2.in: hairline dwells then rips open) to reveal the building. This is the heroic moment and the distinctness root." }
  - { atom: mask-up-title, job: "THE HEADLINE: two lines (Очікування / як ритуал) each in an overflow:hidden mask; play() rises them from under the baseline (translateY 116 to 0, expo.out, stagger 0.14) once the doors finish. Driven via the cascade title stage (kind:fn), never on its own pin." }
  - { atom: content-stage-cascade, job: "THE CHOREOGRAPHY: after the doors open, reveals the spine in a FIXED order with a group stagger: eyebrow, title (delegates to mask-up-title), body, meta A, meta B, CTA, and the top chrome LAST (first the building, then the interface). opacity + translateX + scaleX only." }
pin:
  owner: none
  count: 0
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "expectPins:0 — the preloader, the seam and the cascade are TIMELINES (run/open/play), not scrubs; the harness creates NO pin and no engine atom owns one. Verified ScrollTrigger pin count == 0."
  - "DECODE-GUARD: the hero <img> is assigned, then img.decode() is awaited; preloader.ready() fires ONLY on decode resolve (with a load/error fallback). The cream seam stays set(0) (fully covering) until then, so the doors NEVER open onto an undecoded frame (no black flicker). Verified: at reveal the render naturalWidth>0 and the seam was solid until decode."
  - "THE UNVEIL is a centre seam: the cream cover opens from the centre line outward (axis x), lower-half and upper-half... two halves part left and right from a centre seam; NOT a fade, NOT a single-edge wipe. Verified mid-open: a cream centre band with the render parting away on both sides."
  - "FIXED-order cascade after the doors: eyebrow then title (rises from masks) then body then meta then CTA then top chrome LAST; the wordmark hands off (fades) and the preloader stage is removed. No element animates before the doors finish."
  - "Engine laws: motion is clip-path (panel collapse + seam) + transform (wordmark handoff, masked title, slide-x, ambient drift) + opacity (cascade) only; GPU layers; NO mix-blend, NO backdrop, NO WebGL, NO video.currentTime scrub; will-change cleared after one-shots by the atoms."
  - "reduced-motion: instant honest state — render shown, doors set(1) open, title set(1) shown, cascade played, preloader hidden, no panel animation. Built on OUR asset (day-34.webp, cars-free 1920x1080) + Ukrainian Fedoriv copy."
webgl: false
ease: air
class: "scroll (preloader gate -> load-in, no pin)"
---

# hero--preloader-parts-to-hero — «Очікування як ритуал»

The wait IS the brand. A band-collapse preloader (a live 0 to 100 counter and the
brand wordmark over a dark panel) holds as a real decode gate over the heavy hero
render; on a force-decoded ready() the dark panel collapses to a centre band, the
wordmark hands off, and a cream centre seam parts from the middle outward to unveil
the building. Then the title rises from its masks and the content cascades in.

## The four atoms, one load-in (no pin)
- `preloader-band-collapse` OWNS THE OPENING — counter + wordmark + dark panel; `ready()` is decode-gated.
- `center-seam-split` IS THE UNVEIL — a cream cover over `[data-render-surface]`, started `set(0)` (covering), `open()` on reveal: doors part from the centre. The distinctness root.
- `mask-up-title` rises the two-line headline from baseline masks once the doors finish.
- `content-stage-cascade` reveals eyebrow -> title -> body -> meta -> CTA -> chrome LAST.

## DECODE-GUARD (failure #1 on heroes)
`img.src` is set, then `img.decode()` is awaited; `preloader.ready()` fires ONLY on
resolve. The cream seam stays `set(0)` (solid over the render) until then, so the
doors never open onto an undecoded frame. There is no black flicker at the unveil.

## Pin budget
expectPins:0. Nothing scrubs scroll; nothing pins. The preloader + seam + cascade are
plain timelines. The page scrolls natively after the reveal. anti-combos respected:
no second pin, no mix-blend over a scrubbed surface, no scroll-scrub-pin, no second cover
(the cream seam is the ONE cover, and the dark preloader panel clears before it acts).

## Distinctness
Other heroes cluster around "big title over full-bleed media". This one's mechanic
ROOT is a counted, decode-gated WAIT that resolves into DOORS that PART FROM THE
CENTRE. It is unmistakable in a screenshot mid-open and is welded to its own root.

## Gate
Open combo-lab.html in a real browser. `window.__LAB_OK__` true once ready; pins == 0.
Watch the ritual: dark gate with a climbing counter, the panel collapses to a hairline,
cream doors part from the centre to reveal the building, the headline rises and the
content cascades (chrome last). Proven on OUR content: day-34.webp (cars-free) +
Ukrainian copy -> labOK:true, pins:0, render naturalWidth 1920, 0 real console errors.
