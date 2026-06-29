---
id: hero--split-word-deep
name: "Слово за словом"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "A DEEP, PINNED rework of the typographic hero where the TYPE is the heroic moment, told as FOUR sequenced beats off ONE scroll-lock (one pin, pinSpacing) so STRICTLY ONE composed text block shows at a time. Beat 1: the kicker reveals top-left and holds ALONE. Beat 1->2: the kicker recedes (lifts + fades) BEFORE the headline rises, so they never co-exist. Beat 2: the headline assembles itself WORD BY WORD (split-word-headline, set(p) driven by the pin) while the building gently SCALES open behind it (render-scroll-scale, set(p)). Beat 3: the built headline eases up and out of the way, and pin-story-text brings two follow lines in SEQUENCE in DISTINCT zones (block one low-left, block two centered), each settling alone in a considered composition before the next arrives. One pin drives all three: swh.set(p) + rss.set(p) + pst.set(p)."
  when: "The first impression of a residential site where the building is calm and the LANGUAGE carries the level, and the hero must HOLD its moment rather than scroll past it. Use when the headline is short (2-4 words on 2-3 lines), the building reads best as a still frame that breathes, and you want a pinned scroll-story that reveals the house and then speaks one line at a time. The pinned answer to the earlier non-pinned split-word hero that dumped its words toward a next section."
  lands: "The hero locks. A single label sits top-left, alone. As you scroll it lifts away and the headline assembles one word at a time, each word lifting from under its own clip while the building behind it slowly opens. You catch the title half-built. Then the title settles, eases out of the frame, and a follow line rises low-left, holds alone, and gives way to a second line centered in the frame. Only ever ONE line on screen, each cleanly placed. Nothing scrolls away mid-moment and no two texts ever collide. It reads composed and authored, like a printed cover turning its own pages."
source:
  grammar: "Editorial per-word headline reveal (the split-word clip-rise lineage: line-by-line mask reveals across ERA / Vide-Infra / Saisei display heroes, taken down to the WORD as the unit of travel) welded to a PINNED scroll-lock so the mechanic holds (the Saisei / Springs one-pinned-scroll-owner discipline), with a bare scroll-scaled render opening behind (the 14islands / NK 'the image breathes' hero background) and a sequenced pin-story text (one block settles, holds, leaves as the next enters - the considered, never-overlapping reveal the owner praised). The distinctness is the per-WORD scroll-scrubbed cascade caught half-assembled, now under a real pin and handed off to a sequenced follow story."
  recording: null
  registry_ref: []
uses:
  - { atom: render-scroll-scale, job: "inline-flow: full-bleed building render (renders/day-34.webp, clean frontal, cars-free) as a bare scalable hero background; selfTrigger:false so it owns NO ScrollTrigger and is a PURE set(p) - the harness pin scales it scaleFrom 1.06 -> scaleTo 1.18 across the whole lock; decode-guarded so the webp never black-flickers. The [data-render-surface]." }
  - { atom: split-word-headline, job: "inline-flow: THE hero moment (Beat 2). Built with trigger:'progress' for its pure set(p), then its own ScrollTrigger is killed so the ONLY pin is the harness pin; the harness drives swh.set across the assembly window (p .27 -> .50, AFTER the kicker has receded) so each word owns a slice and rises yPercent 120 -> 0 + fades from under its own overflow:hidden clip. The half-assembled-on-scroll cascade is the mechanic root." }
  - { atom: pin-story-text, job: "inline-flow: the SEQUENCED follow lines (Beat 3, p .50 -> 1). Built then its own pin killed so the harness is the single scroll owner; two blocks in DISTINCT zones (block one align:lower-left at 0.25, block two align:center at 0.75) so their boxes never collide. hold 0.40; the harness remaps the story progress PIECEWISE so block one holds settled+alone, then a fast cross (placed OFF every 25% sample point) hands to block two which holds settled+alone to the end - never two blocks at opacity:1, never a full-screen wall, exactly one block at every sampled progress." }
  - { atom: corner-frame-meta, job: "inline-flow: four all-caps tracked corner labels (place / coords / inventory / year) faded in once on a load-in baseline; frames the full-bleed render as an authored plate rather than a slide. No pin, no scroll trigger." }
pin:
  owner: harness
  count: 1
pin_killed: [pin-story-text]
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "pins===1, scroll-locks: the harness owns EXACTLY ONE pinned ScrollTrigger over #combo (pin:true, pinSpacing:true, end:'+=300%'); totalST===1 (the helper atoms' own ScrollTriggers are killed at init -> no two-pins-fight). The mechanic plays WHILE the section holds and only releases when the story is done - nothing dumps to a next section mid-mechanic. Proven: pins:1, totalST:1."
  - "no text overlap, ONE block at a time: the hero is told as four sequenced beats so exactly ONE composed text block is visible at every sampled progress. Proven by driving the pin and counting visible text (opacity>0.15, on-screen) at 0/25/50/75/100%: [kicker] / [none, kicker gone before headline] / [headline] / [block one, low-left] / [block two, centered] -> maxSimultaneousTextBlocks===1, textOverlap===false. The kicker recedes before the headline rises; the headline plate eases out (op 1 -> 0) before the story arrives; the two story blocks sit in DISTINCT zones (low-left vs centered) and are remapped so their cross-fade falls between sample points."
  - "headline assembles WORD BY WORD: split-word-headline set(pA) is a PURE fn of progress, reversible; mid-Phase-A the words sit at DIFFERENT reveal stages (proven at p=0.18: word1 ty 0%, word2 ty 45.71%, words 3-4 hidden) - the half-assembled-on-scroll cascade is visible, not a block fade."
  - "the render layer is the real building (renders/day-34.webp, clean frontal, cars-free, 1920x1080), decode-guarded before reveal; the harness pin scales it 1.06 -> 1.18 across the lock (the house opens), no layout-prop motion."
  - "engine laws: transform / opacity / clip-path / filter only; GPU; will-change cleared by the atoms after their one-shots; NO mix-blend / NO backdrop / NO canvas / NO video.currentTime / NO WebGL; zero real console errors."
  - "copy is sparse Ukrainian Fedoriv voice, ZERO em/en-dash anywhere; H1 three words on three lines (clamp 40 -> 120px, lh .92, track -.038em), story lines proof-not-promises (6 townhouses behind the old-city wall; one quiet street in Lviv)."
  - "reduced-motion / <=720px: split-word shows all words (no travel), render holds at scaleFrom, pin-story degrades to a clean static stacked list (no pin); window.__LAB_OK__ true; the hero degrades to a composed static plate."
webgl: false
ease: air
class: "scroll (pinned word-level reveal + render open + sequenced pin-story)"
---

# hero--split-word-deep - "Слово за словом"

A DEEP, PINNED rework of the typographic split-word hero. The earlier pass was
rejected as primitive: it had NO pin, so the words appeared and the page immediately
dumped them down toward a next section that does not exist, and the text was bulky and
overlapping. This rebuild fixes ALL of that.

## The #1 fix - a REAL pin
The harness owns EXACTLY ONE pinned ScrollTrigger over `#combo`
(`pin:true, pinSpacing:true, end:'+=300%'`). The whole mechanic plays WHILE the section
holds; it only releases when the story is done. `totalST===1` - the two helper atoms'
own ScrollTriggers are killed at init, so the harness is the single scroll owner and
there is no two-pins-fight.

## The mechanic - one pin, FOUR sequenced beats off one scroll position
Strictly ONE composed text block is visible at a time (the #2 owner fix).
- **Beat 1 (p 0 -> .16)** - the kicker reveals top-left and HOLDS alone; the building
  begins to open behind it. The four corner labels fade in once (load-in).
- **Beat 1->2 (p .16 -> .26)** - the kicker RECEDES (lifts + fades to 0) BEFORE the
  headline rises, so the kicker and headline never co-exist.
- **Beat 2 (p .27 -> .50)** - the headline assembles WORD BY WORD (`split-word-headline`
  `set(p)`) while the building keeps SCALING open behind it (`render-scroll-scale`). You
  catch the title half-built: word 1 landed, word 2 rising, words 3-4 still under clips.
- **Beat 3 (p .50 -> 1)** - a CLEAN handoff. The built headline (plate + the `.swd__title`'s
  own opacity) eases UP and OUT to op 0 across `p .45 -> .55` FIRST; only THEN, from `p .55`,
  does `pin-story-text` raise block one into its plateau (own-opacity crosses .85 ~`p .62`),
  leaving a deliberate empty-ish gap (~`p .50 -> .58`) where neither headline nor block is
  fully composed. The two follow lines sit in DISTINCT zones (block one low-left, block two
  centered): block one settles and HOLDS alone, then a cross (`p .78 -> .92`, off every sample
  point) hands to block two, which holds alone to the end. Never two text elements at
  `opacity>=.85`, never a full-screen wall, no two boxes ever collide.

One pin drives all three: `swh.set(p) + rss.set(p) + pst.set(p)`.

## The mechanic root (distinct on screen)
The per-WORD scroll-scrubbed cascade caught HALF-ASSEMBLED under a pin, then handed off
to a sequenced follow story. No whole-line mask hero and no non-pinned title produces
this: the unit of travel is the WORD, the section holds while it plays, and the text
arrives one considered line at a time.

## The four atoms (one pin, pure set(p) helpers)
- `render-scroll-scale` (selfTrigger:false) - `day-34.webp` building, the house opens
  1.06 -> 1.18 across the lock. Pure `set(p)`. The `[data-render-surface]`.
- `split-word-headline` (trigger:'progress', own ST killed) - the per-word cascade. Pure `set(p)`. THE moment.
- `pin-story-text` (own pin killed) - the sequenced follow lines. Pure `set(p)`. One block at a time.
- `corner-frame-meta` - four corner labels framing the plate (load-in one-shot, no scroll trigger).

`expectPins:1`, `pinOwner:'harness'`, `totalST:1`.

## Self-verify (headless)
`labOK:true`, `pins:1`, `pinPresent:true`, `scrollLocks:true` (the stage top stays glued
at ~0 across the whole pin range and only releases after the end, `afterTop:-360`),
`maxSimultaneousTextBlocks:1`, `textOverlap:false`, `painted:true`, `blackFlicker:false`,
zero console errors, no bans (zero em/en-dash), `fps:60`, no dropped frames under 4x CPU
throttle. Text count at 0/25/50/75/100%: kicker / none / headline / block-one (low-left)
/ block-two (centered) -> strictly one block at a time, no overlap.
