---
id: hero-puzzle-monument
name: "Self-assembling cover hero"
level: 2
kind: combo
status: official
section_job: "the opening cover that earns the render"
page_beat: hero
meaning:
  what: "Scattered blurred fragments fly home into one full-bleed monument while the serif title reveals word-by-word and the indicator hands you down."
  when: "The first section, when one strong full-bleed render is available and the cover must read as ONE scroll gesture."
  lands: "You recognize the house before it finishes = ownership; the building resolves into being."
  not_when: "Sections without a single hero render; conversion gates; anywhere a second pin would collide."
source:
  grammar: "Vide Infra / Saisei / Zera-class cover reveal"
  recording: null
  registry_ref: []
theme: { skin: dark, book_end: true }
ease: air
webgl: false
pin: { owner: puzzle-image, count: 1, length: "+=120%" }
owns_pin: true
uses:
  - { atom: puzzle-image,    params: { rows: 6, cols: 4, scatter: 1.8, blurFrom: 18, staggerFrom: center, pin: true } }
  - { atom: parallax-depth,  params: { rides: pin-progress } }
  - { atom: splitLines,      params: { trigger: onEnter-gated } }
  - { atom: appear,          params: { order: before-all } }
  - { atom: scroll-indicator, params: { is-finished: true } }
combines_with: [story-stepper-render-focus]
anti_combos: [lifestyle-deck-fan]
gated_by: [R_pin_budget, R_anti_combos, R_theme_flow, R_perf_limits, R_timing_layers]
files: [RECIPE.md, combo-lab.html]
acceptance:
  - "exactly ONE pin (puzzle-image owns it); no second ScrollTrigger pin"
  - "render recognizable before assembly completes (~p0.6)"
  - "no layout animation; transform/opacity/filter only; fps holds"
verify: "combo-lab.html#__LAB_OK__"
---

# hero-puzzle-monument — the self-assembling cover

> **Level-2 SECTION recipe.** A proven stack of 5 primitives that make ONE
> award hero: the opening cover that self-assembles from scattered, blurred
> fragments into a single full-bleed monument render, while the serif title
> reveals word-by-word and the indicator hands you to the next beat.
> One gesture, one pin, one ease.

`id: hero-puzzle-monument` · `intent: SHOW HOUSE (the opening cover)`
Observed on Vide Infra / Saisei / Zera-class cover reveals.

---

## Goal

The hero is not a static photo with text on top. It is a **single scroll
gesture** that earns the render: pieces of the house hang scattered and blurred
on a dark field; as you scroll the pinned frame, they fly home from the center
out; you **recognize the house before it finishes**; a brief seam-flash; then it
locks seamless and full-bleed while the title reveals and the scroll-indicator
flips to `is-finished` and hands you down. The viewer feels the building
*resolve into being* — that is the whole pitch of the section.

**Reads as ONE move:** one ease (`air`), one pin (puzzle-image owns it), one
progress (everything else is bound to that same scrub).

---

## The ordered stack (with params)

The order is the build order AND the z-read order. Each layer is bound to the
**same pin progress** the puzzle owns — nothing introduces a second pin.

1. **`puzzle-image`** — the spine. **OWNS THE ONLY PIN.**
   ```js
   trigger:'scrub', pin:true,
   rows:6, cols:4,            // 24 tiles — denser/finer than the 4×4 default
   scatter:1.8,               // tile-widths; puzzle, not explosion
   staggerFrom:'center',      // center-out = "assembly", not a fade
   blurFrom:18,               // px, cap ≤20 (blur is the FPS killer)
   scrollDistance:'+=120%',   // ≈1.2× viewport of pin
   ease:'air', seamFix:0.5, seed:7
   ```
   Mobile: drop to `rowsMobile:4, colsMobile:3` (12 tiles) to protect the blur/FPS budget.

2. **`parallax-depth`** — 2–3 sibling chrome layers (eyebrow, caption), bound to
   the **same pin progress**, **transform-only**.
   - eyebrow: slow (`y` translate factor ~0.04 of progress)
   - caption: faster (~0.10)
   - These are **siblings of the stage, not grid children** (see DOM). Pure
     `transform` — never `top/left/margin`.

3. **`splitLines` title reveal** — the serif headline assembles word-by-word.
   ```
   data-reveal="title", duration:2.8s, stagger:60ms/word, ease:air
   ```
   Fires `onEnter` (NOT scrubbed — it's a one-shot reveal), but **gated**: it may
   only start after the appear/decode gate (#5) resolves, so words never reveal
   over an empty/undecoded stage.

4. **`theme`** — **dark baseline**, book-ended (hero opens dark, the page later
   returns to dark = a closing bracket). **No flip mid-section.** The dark field
   is what makes the scattered, faint tiles read as fragments-in-the-void.

5. **`appear` decode-gate** — **MANDATORY, runs BEFORE assemble.**
   ```js
   await img.decode();   // single decode → N sprite slices
   rootMargin:'600px'    // warm the decode before the section is in view
   ```
   If you skip this the tiles flash empty / pop in undecoded — the recognition
   beat dies. Decode gate also unblocks the title reveal (#3) and arms the
   indicator (#6).

   **+ `scrollableIndicator`** — a `motion-bait` hint that flips `is-finished`
   as the pin releases (progress ≈0.9→1.0), handing the viewer to the next beat.

---

## Level-1 components it uses (`library/components/`)

| Level-1 | role in this combo | key params here |
|---|---|---|
| **`puzzle-image`** | spine; owns the pin | `rows:6 cols:4`, `scatter:1.8`, `staggerFrom:'center'`, `blurFrom:18`, `scrollDistance:'+=120%'`, `seamFix:0.5` |
| `puzzle-text` *(sibling, optional)* | only if the wordmark is a DOM layer instead of baked | normally **baked into the render** — prefer baking |

Primitives **not yet broken out** as own component dirs but used here (treat as
shared house utilities — wire inline per the params above):
`parallax-depth` (scroll-bound transform layers), `splitLines` (word reveal),
`theme` (dark token set), `appear` (decode-gate + intersection), and
`scrollableIndicator` (`is-finished` hint). If/when these get their own
`components/<name>/` dir, point this combo's rows at them.

---

## How it reads on scroll

```
p=0.00  dark field. ~24 chips scattered, blurred (18px), faint, slightly small.
        eyebrow + caption sit quiet. indicator pulses (motion-bait).
p→0.25  DRIFT — tiles fade up, blur eases, begin translating home from center.
        chrome layers drift at their own (slow/fast) rates → depth.
p→0.70  CONVERGE — bulk of motion; center-out stagger; the house is LEGIBLE
        with gaps. ← the "recognize it before it's done" beat.
p→0.90  SEAT/SNAP — last edge tiles close; brief SEAM-FLASH (the assembled tell);
        title reveals word-by-word (serif, 60ms/word) now that the cover is whole.
p→1.00  WHOLE — seamless, full-bleed monument. clean hold. indicator → is-finished.
        pin releases → hands down to the next section.
```

One ease across all of it (`air`): fast close of distance, long settle = "click
into place." The seam-flash is **free** — it falls out of per-tile blur tails
closing at slightly different progress; do not animate it separately.

---

## Pin-budget note

- **ONE pin for the whole hero.** `puzzle-image` owns it (`pin:true`,
  `scrollDistance:'+=120%'`). Everything else (parallax chrome, title, indicator)
  is bound to **that same ScrollTrigger's progress** — they add **zero** pins.
- **Never** give parallax-depth or the indicator its own `pin:true` — a second
  pin inside the hero double-pins and the section stutters / jumps.
- Pin length ≈ 1.0–1.3× viewport. `+=120%` is the tuned default: enough travel
  for a legible center-out assembly without dragging. Shorter (`+=90%`) = rushed
  assembly; longer (`+=160%`) = the viewer waits on a finished cover.
- The full-bleed climax (stage box → 100vw) and the pin-release live **inside**
  this same pin's tail (last ~10% of progress) — do not open a new pinned segment
  for it. Animate the **stage container's** transform/size, not the tiles.

---

## How to build (copy-and-go outline)

1. **DOM** — one pinned section; stage is an aspect-locked, `overflow:hidden`
   frame; chrome are **siblings of the stage**, not grid children:
   ```html
   <section class="hero puzzle" data-theme="dark">
     <div class="puzzle__stage">
       <div class="puzzle__grid"></div>   <!-- tiles injected -->
     </div>
     <span class="puzzle__eyebrow" data-parallax="0.04">вул. Замкова</span>
     <h1 class="puzzle__cap" data-reveal="title">Дім, що збирається на очах</h1>
     <div class="scroll-indicator" data-bait>↓</div>
   </section>
   ```
   Prefer **baking** the wordmark + any caption INTO the render `src` so they
   assemble WITH the tiles (the Zera/Saisei tell). Use a DOM `splitLines` title
   only when the copy must stay live/selectable/localized.

2. **Theme** — set the page/hero dark token set first. Hero opens dark and the
   page's last section returns dark (book-end). No mid-hero theme flip.

3. **Decode-gate (gate everything on this)** —
   `await img.decode()` with `rootMargin:'600px'`; only after it resolves do you
   build the grid, arm the title reveal, and enable the indicator.

4. **Puzzle (the pin)** —
   ```js
   PuzzleImage(document.querySelector('.hero.puzzle'), {
     src:'/renders/hero-cover.webp', alt:'…',
     rows:6, cols:4, rowsMobile:4, colsMobile:3,
     trigger:'scrub', pin:true, scatter:1.8, staggerFrom:'center',
     blurFrom:18, ease:'air', scrollDistance:'+=120%', seamFix:0.5, seed:7,
     respectReducedMotion:true
   });
   ```
   Capture the returned ScrollTrigger — its `progress` is the bus everything else
   rides.

5. **Bind chrome to that progress** — in the puzzle's `onUpdate`, drive the
   `data-parallax` layers by `transform: translateY(progress * factor * vh)`.
   Transform-only. No second ScrollTrigger.

6. **Title + indicator on the tail** — at `progress ≥ ~0.9`, play the
   `splitLines` reveal once (guard a `played` flag) and flip the indicator to
   `is-finished`. Release happens naturally when the pin ends.

7. **Reduced-motion / mobile** — `respectReducedMotion:true` → tiles seat
   instantly, no blur, no pin (or a very short one); title fades in plainly;
   lower tile count. The cover still lands; it just doesn't perform.

### Verify (the success criteria — loop until all true)
- **Seated state is seamless** — zoom in; no black hairlines (that's what
  `seamFix` is for). This is the whole point of the section.
- **You recognize the house at ~p0.6**, before it finishes — if not, raise
  `staggerFrom` spread / lower `scatter`.
- **Exactly one pin** — DevTools ScrollTrigger markers show a single pinned
  trigger for the hero.
- **No layout animation** — only `transform/opacity/filter` move; homes are static.
- **FPS holds** during converge — if it drops, cut tile count or `blurFrom`
  before anything else (blur is the cost).
- **Title never reveals over an empty stage** — decode-gate proven by throttling
  the network and watching the order.
