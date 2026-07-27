---
id: story-stepper-render-focus
name: "Pinned render-focus scrollytelling"
level: 2
kind: combo
status: official
section_job: "the 'show the material' beat — look at the building N times"
page_beat: material
meaning:
  what: "A pinned stepper walks through N labelled renders; each step the heading ticks, the render crossfades into focus, split-line copy + reveal + cursor + depth ride the spine's single progress."
  when: "A MATERIAL/proof act where the viewer should LOOK AT the product N times, one labelled render per step."
  lands: "'I looked at the building N times' — each render gets a held, in-focus, captioned frame."
  not_when: "Hero covers, conversion gates, anywhere a second pin would collide."
source:
  grammar: "Vide Infra / ERA frame-scrub — render-focus stepper"
  recording: null
  registry_ref: []
theme: { skin: neutral, book_end: false }
ease: air
webgl: false
pin: { owner: focus-render-switch, count: 1, length: "steps * scrollPerStep" }
owns_pin: true
uses:
  - { atom: focus-render-switch, params: { pin: true } }
  - { atom: parallax-depth,      params: { rides: pin-progress } }
  - { atom: reveal,              params: { trigger: per-step } }
  - { atom: splitLines,          params: { trigger: per-step } }
  - { atom: custom-cursor,       params: { hover: true } }
  - { atom: counter,             params: { rides: pin-progress } }
combines_with: [hero-puzzle-monument, lifestyle-deck-fan, interiors-cards-cursor]
anti_combos: [benefit-wipe-band]
gated_by: [R_pin_budget, R_anti_combos, R_theme_flow, R_perf_limits, R_timing_layers]
files: [RECIPE.md, combo-lab.html]
acceptance:
  - "exactly ONE pin (focus-render-switch owns it); others read the spine's progress"
  - "each render crossfades in focus, never video.currentTime"
  - "split-line copy + counter + reveal ride one clock; pinSpacing holds on release"
verify: "combo-lab.html#__LAB_OK__"
---

# story-stepper-render-focus — pinned scrollytelling "show the material"

> **Level 2 — SECTION recipe.** A proven stack of 5 Level-1 primitives that
> together make ONE award-grade "benefits / what-you-get" section: a single
> focused render that swaps through N steps inside a pin, with depth on the
> two columns and reveal copy that scrubs to the wheel.
>
> Use this when the section's job is **show the material** — finishes,
> amenities, plan logic, "why this building" — and you have one strong render
> per benefit. It is the cinematic alternative to a flat 3-up feature grid.

---

## Goal
Lock the viewport once, hold a big honest render, and walk the reader through
N benefit steps where **the text scrubs and the image snaps**. Depth on the
two columns keeps it from reading as flat slides. The reader leaves having
*looked at the product* N times, not skimmed a bullet list.

---

## The stack (ordered — first one OWNS the pin)

1. **`focus-render-switch`** — the spine. OWNS the single pin for the whole
   section.
   ```
   pin: true
   scrub: true
   scrollPerStep: 0.9      // viewport-heights per step → pin length = N * 0.9vh
   stepHold: 0.78          // render snaps in at 78% of each step
   crossfade: 0.55         // s, render dissolve
   kenBurns: 1.0 → 1.08    // ease:"none", slow constant crawl, restart per step
   ```

2. **`parallax-depth`** on the two columns, sharing the SAME pin progress (do
   NOT create a second ScrollTrigger — read the spine's progress).
   ```
   text column:   yPercent  +6  → -6   (slow, trails)
   render column: yPercent  +12 → -12  (faster, leads)
   ```
   The split speeds are what sell depth. Keep amounts small (≤12%) so nothing
   detaches from the layout.

3. **`reveal`** on each step's heading stack — fire on the **tick** (the swap
   moment), not on scroll-in.
   ```
   group stagger: 180ms     // heading → sub → meta
   y: 14px → 0, opacity 0 → 1, ease: air
   ```

4. **`splitLines`** on the *active* step label only — words wrapped in
   `span.w`, accent colour sweeps word-by-word as you scrub WITHIN the step
   (the read-along feel). Inactive steps stay plain.

5. **`custom-cursor`** in clickable mode over the render — ONLY if steps are
   tappable (click render to jump to next step).
   ```
   mode: clickable
   scale: 0.9
   ```
   If steps are scroll-only, omit this primitive entirely. Don't fake
   affordance.

### Theme
Continuous **neutral-warm** across the whole stepper — honest render light,
no theme flip mid-section. A flip here breaks the "you're looking at one real
material" illusion. Save any dark/light flip for the section seam, not inside.

### Hard rule — video steps
If a step's media is video, **NEVER scrub `video.currentTime`** (seek-stutter,
decode starvation). Autoplay-loop it muted instead. Each looping video counts
toward the **2-decoder cap** — so at most 2 video steps live at once; the rest
must be `img`/`webp`. Snap the inactive videos to `display:none` to release
decoders.

---

## How it reads on scroll
1. Section reaches `top top` → **pins**. Page stops.
2. A big render holds, ken-burns crawling 1.0→1.08 (alive, not frozen).
3. As the wheel turns, the accent **sweeps word-by-word** across the active
   heading (text scrubs — tied to progress).
4. At **78%** of the step the next render **snaps** in (0.55s crossfade) and
   the heading stack ticks up: old fades out the top, next rises to ink-solid,
   next-next previews below. Counter bumps `01 → 02`.
5. The two columns drift at different speeds the whole time → parallax depth.
6. After step N the pin **releases** and the page continues.

**The one-line law:** *snap the image, scrub the text.* The image is discrete
so it never flickers mid-wheel; the copy is continuous so it feels locked to
your hand.

---

## Level-1 components it uses
From `library/components/`:
- `focus-render-switch/` — the pinned two-column stepper spine (pin owner).

From `library/grammar` primitives (compose into the spine, no separate pin):
- `parallax-depth` — split-speed yPercent on the two columns.
- `reveal` — grouped heading-stack entrance on each tick.
- `splitLines` — per-word accent sweep on the active label.
- `custom-cursor` (clickable) — optional, only for tappable steps.

> If `focus-render-switch` is missing the parallax hooks, add `data-depth`
> attributes to `.frs__text` and `.frs__media` and drive `yPercent` from the
> spine's `self.progress` inside its `onUpdate` — do not spin up a 2nd
> ScrollTrigger.

---

## Pin-budget note
- **This section spends exactly ONE pin.** The spine owns it; every other
  primitive rides the same progress. Adding a second ScrollTrigger here =
  jank and double-pin spacer math errors. Don't.
- Pin distance = `N * scrollPerStep` vh (default `N * 0.9`). For N=4 that's
  ~3.6 viewport-heights of scroll — budget it against the page's total pin
  count (aim ≤2 pinned sections per page so the page doesn't feel "stuck").
- Decoder budget: ≤2 live video steps at once (the global 2-decoder cap).

---

## How to build (outline)
1. **Drop the spine.** Copy `focus-render-switch/component.{html,css,js}`.
   Set `scrollPerStep:0.9`, `stepHold:0.78`, `crossfade:0.55`, ken-burns
   `1.0→1.08 ease:"none"`. Verify it pins and swaps with placeholder renders.
2. **Wire copy.** One `h2.frs__head` per step + sub/meta. Author N honest
   benefit lines (no "premium living" slop — name the actual material/spec).
3. **Add depth.** Tag the two columns, drive split `yPercent` (text ±6,
   render ±12) from the spine's `onUpdate(self.progress)`.
4. **Add reveal + splitLines.** Group-stagger the heading stack on tick
   (180ms); wrap active label words in `span.w`, scrub the accent sweep.
5. **Cursor (conditional).** If steps are clickable, mount `custom-cursor`
   clickable@0.9 over `.frs__media`; else skip.
6. **Media pass.** Real renders, neutral-warm grade across all N. Any video
   step → autoplay-loop muted, max 2 live, others `display:none`.
7. **Verify by scroll** (the section ritual, not a screenshot):
   - pin engages at `top top`, releases after step N
   - image snaps at ~78%, never flickers mid-wheel
   - text/accent scrubs continuously, reverses cleanly on scroll-up
   - columns drift at visibly different speeds (depth reads)
   - no theme flip inside the section
   - ≤2 video decoders live; no `video.currentTime` scrubbing anywhere
8. **Rollback point**, then integrate into the page and prod-check.
