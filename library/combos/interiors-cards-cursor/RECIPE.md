---
id: interiors-cards-cursor
name: "Interiors deck with custom cursor"
level: 2
kind: combo
status: official
section_job: "the interiors walk-through as a cinematic horizontal deck"
page_beat: material
meaning:
  what: "A pinned horizontal card deck swipes through interior renders; a custom cursor + decode-gate intros + reveal + a ticking counter ride the spine's single progress."
  when: "An interiors/material act that should read as a curated reel of rooms, one held frame at a time, with a tactile cursor."
  lands: "You walk the interior like a film reel; each room gets its own held, labelled frame."
  not_when: "Hero covers, conversion gates, anywhere a second pin would collide."
source:
  grammar: "Zera / Vide Infra interiors deck + custom cursor"
  recording: null
  registry_ref: []
theme: { skin: dark, book_end: false }
ease: air
webgl: false
pin: { owner: cards-swipe, count: 1, length: "scrubPerCard * (n-1)" }
owns_pin: true
uses:
  - { atom: cards-swipe,    params: { pin: true, snap: true, drag: true } }
  - { atom: parallax-depth, params: { rides: pin-progress } }
  - { atom: custom-cursor,  params: { hover: true } }
  - { atom: reveal,         params: { trigger: per-card } }
  - { atom: appear,         params: { order: decode-gate } }
  - { atom: counter,        params: { rides: pin-progress } }
combines_with: [story-stepper-render-focus]
anti_combos: [hero-puzzle-monument, benefit-wipe-band]
gated_by: [R_pin_budget, R_anti_combos, R_theme_flow, R_perf_limits, R_timing_layers]
files: [RECIPE.md, combo-lab.html]
acceptance:
  - "exactly ONE pin (cards-swipe owns it); cursor/drag never create a second pin"
  - "deck swipes transform-only; counter + reveal ride one clock"
  - "reduced-motion / mobile collapses to a static vertical stack"
verify: "combo-lab.html#__LAB_OK__"
---

# Combo: interiors-cards-cursor

> **Level-2 SECTION recipe.** A proven stack of 4–5 Level-1 primitives that compose one award-grade
> section. Copy the stack, wire it in order, ship it.

- **id:** `interiors-cards-cursor`
- **type:** section recipe (Level 2)
- **owns the pin:** yes (the `cards-swipe` rail)
- **theme:** light (interiors counterpoint — flip back to light from a preceding dark act)

---

## Goal

Show **life and material** — not a gallery, a *handled* rail. A horizontally-swiped row of interior
cards is driven by **vertical scroll**, each card clicking into place, inner photos counter-drifting
for depth, a stitch handle riding the seam, and the cursor morphing into a drag affordance. The
section should feel like you are *pulling the rooms past you* with your hand.

---

## The stack (ordered, with params)

Build in this order. Each primitive owns **different elements**, so their clocks never fight.

1. **`cards-swipe`** — the spine. **OWNS the pin.**
   ```
   pin: true
   scrub: 0.6
   snap: { snapTo: directional, duration: { min: 0.2, max: 0.5 }, ease: air }
   end: "+=" + (innerHeight * 0.9 * (n - 1))   // n = card count
   x: -(railWidth - viewportWidth)             // total horizontal travel
   ```
   Vertical scroll → horizontal `x` on the rail track. The **snap** is the "catch" — each card
   clicks into frame.

2. **`parallax` (containerAnimation variant)** — depth inside each card.
   ```
   for each card:
     inner <img>  xPercent: -1.4 → 1.4
     ease: none
     scrollTrigger: { containerAnimation: railTween, trigger: card, scrub: true }
   ```
   The image counter-drifts against the rail travel → parallax depth as the card crosses frame.

3. **`custom-cursor` (drag-mode)** — the pointer clock, coupled to the rail.
   ```
   idle      scale: .25
   over-rail scale: .9   label/icon: "drag"  (drag affordance)
   ```
   Couple cursor state to the rail's hover/pointerdown — morphs to a grab handle over the cards.
   Optional drag-fling: pointer drag adds inertia into the rail `x` (Draggable + Inertia), snap
   re-catches on release.

4. **`reveal`** — card labels.
   ```
   duration: 180ms
   trigger: each label, when its card snaps into frame (onSnapComplete / containerAnimation enter)
   ```
   Labels (room name / material) reveal *as the card catches*, not all at once.

5. **`decode-gate`** — render readiness.
   ```
   gate: each card image
   on: "appear"
   rootMargin / start: 600px before
   ```
   Decode each card render before the rail builds, so the first horizontal pull is jank-free.

---

## How it reads on scroll

1. Section **pins** (light theme snaps in — the counterpoint to the prior dark act).
2. Vertical scroll **slides the card row sideways**; each card **clicks into place** (the snap is the catch).
3. Inner photos **counter-drift** against the travel → depth, the rooms feel three-dimensional.
4. A **stitch handle** rides the seam between cards; the **cursor morphs** to a drag affordance over the rail.
5. Optional: grab + **drag-fling** throws the rail; snap re-catches on release.
6. Card **labels reveal** (180ms) the moment each card snaps into frame.

**Three clocks, no collision:**
- **scrub rail** owns the track `x`
- **snap** owns the catch
- **pointer** owns the cursor + drag

Each drives a different element, so they run clean simultaneously.

---

## Level-1 components used (from `library/components/`)

| component        | role here                                            |
|------------------|------------------------------------------------------|
| `cards-swipe`    | pin + scrub + snap rail (the spine, owns the pin)    |
| `parallax`       | containerAnimation inner-image counter-drift         |
| `custom-cursor`  | drag-mode pointer coupling (.25 idle → .9 over-rail) |
| `reveal`         | 180ms label reveal on snap                           |
| `decode-gate`    | per-card render decode before build                  |

---

## Pin-budget note

- This section **claims one pin** (the `cards-swipe` rail). Account for it in the page pin-budget.
- **Nothing else in this stack may pin.** `parallax` rides `containerAnimation` (no own ScrollTrigger
  pin), `reveal`/`custom-cursor`/`decode-gate` are pointer/visibility-driven, not pinned.
- Pin length is computed: `innerHeight * 0.9 * (n - 1)`. Keep `n` (card count) modest (4–7) so the
  pinned scroll-distance stays under ~1 viewport per card — longer feels like a treadmill.
- Place **after a dark act**: the light flip + the horizontal axis-break is what makes the pin earn
  its budget (axis change = the reader notices the catch).

---

## How to build (outline)

1. **Markup**: a pinned `section` → a `.rail` track (display:flex) → `n` `.card`s, each wrapping an
   inner `<img>` (overflow:hidden on the card so the `img` parallax stays clipped) + a `.label`.
2. **decode-gate** every card image first (appear, 600px lead). Don't build the rail until gated —
   undecoded images make the first horizontal pull stutter.
3. **Build the rail tween** (`cards-swipe`): pin the section, scrub 0.6, `x` to
   `-(railWidth - viewportWidth)`, `end: "+=" + innerHeight*0.9*(n-1)`, directional snap
   (min .2 / max .5, ease air). **This is the only pin.** Keep the returned tween — others need it.
4. **Attach parallax** (`parallax` containerAnimation): for each inner img, xPercent -1.4→1.4,
   ease none, `containerAnimation: railTween`, trigger the card, scrub true.
5. **Wire the cursor** (`custom-cursor` drag-mode): default scale .25; on rail pointerenter →
   scale .9 + "drag" affordance; on leave → back to .25. (Optional: Draggable + Inertia for
   drag-fling into the rail `x`; let snap re-catch on release.)
6. **Labels** (`reveal`): hook each label to its card's snap-into-frame (onSnapComplete or
   containerAnimation enter), 180ms.
7. **Stitch handle**: position a handle element on the active seam; couple its x to the rail progress.
8. **Verify by scrolling**: each card must *catch* (snap), inner photo must counter-drift, cursor
   must morph over the rail, labels must reveal on catch — and the next section must resume cleanly
   after the pin releases (no leftover pin-spacer gap).
