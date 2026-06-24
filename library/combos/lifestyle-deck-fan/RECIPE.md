---
id: lifestyle-deck-fan
name: "Lifestyle deck-fan climax"
level: 2
kind: combo
status: official
section_job: "the 'show life' climax that sells the lifestyle"
page_beat: lifestyle-climax
meaning:
  what: "Four stacked life-shot cards fan out to the corners on one pinned scrub while paired captions cross-fade, a counter ticks, and depth rides the same progress."
  when: "The emotional lifestyle-climax beat, where a deck of life-shots should bloom open as one authored gesture."
  lands: "The moment that sells the life — the deck blooms, the caption lands the feeling."
  not_when: "Spec/material sections, conversion gates, anywhere a second pin would collide."
source:
  grammar: "Vide Infra Sofi — slide-out deck / lifestyle climax"
  recording: null
  registry_ref: []
theme: { skin: warm, book_end: false }
ease: air
webgl: false
pin: { owner: slide-out-img-text, count: 1, length: "+=130%" }
owns_pin: true
uses:
  - { atom: slide-out-img-text, params: { scrub: 1, endVH: 130, pin: true } }
  - { atom: counter,            params: { rides: pin-progress } }
  - { atom: parallax-depth,     params: { rides: pin-progress } }
  - { atom: reveal,             params: { trigger: onEnter } }
combines_with: [story-stepper-render-focus]
anti_combos: [hero-puzzle-monument, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_theme_flow, R_perf_limits, R_timing_layers]
files: [RECIPE.md, combo-lab.html]
acceptance:
  - "exactly ONE pin (slide-out-img-text owns it)"
  - "cards fan stacked->corners transform-only; captions cross-fade on one clock"
  - "reduced-motion / mobile collapses to a legible static layout, no pin"
verify: "combo-lab.html#__LAB_OK__"
---

# lifestyle-deck-fan — Level-2 SECTION recipe

> A proven stack of 5 primitives that make ONE award section: the "show life" climax.
> Built on the `slide-out-img-text` Level-1 component (deck-fan reveal), wired into a
> warm/dark lifestyle book-end with a headline→CTA crossfade.
>
> Use this when a ЖК/villa site needs its emotional payoff — the moment that sells the
> *life*, not the floor plan — right before the CTA.

---

## Goal
Show **life**. A pinned deck of lifestyle cards fans from dead-centre out to the four
corners while the giant centre headline crossfades, in place, to a quiet proof-line + CTA.
It should read **editorial and dealt** — cards laid out by hand — never flung or bounced.

This is a *climax* section: it earns the CTA by letting the scenes breathe, then empties
the centre so the call-to-action lands in calm space.

---

## The ordered stack (with params)

| # | layer | what it does | params |
|---|---|---|---|
| 1 | **`slide-out-img-text`** (the spine) | 4 cards parked centre fan OUT to corners, de-rotating flat, slightly shrinking. **OWNS the pin.** | `pin:true`, `scrub:1`, `endVH:130`, fan `0 → 0.6` of timeline, per-card stagger `i*0.05`, rotation → `0`, scale → `.8`, `anticipatePin:1`, `invalidateOnRefresh:true` |
| 2 | **counter-parallax (inner img zoom)** | each card's inner `<img>` relaxes its zoom as the card travels — the depth tell that stops the cards looking like flat stickers | inner img `scale 1.12 → 1.0`, mapped to that card's own travel slice |
| 3 | **headline crossfade in place** | centre serif word lifts away; proof-line + CTA crossfade up into the *emptied* centre. NEVER sideways — vertical only. | cap-A out `0.35 → 0.60`, cap-B in `0.50 → 0.85`; `autoAlpha` + small `y` (≈ ±16px), no x |
| 4 | **ghost letterform → word crossfade** | one layer *under* the headline: a giant faint letterform dissolves to a faint word — texture, never competing | `0.30 → 0.70`, opacity ceiling `≤ .06` |
| 5 | **scroll-dot settle** | a centre-bottom dot breathes in once the gesture is done — confirms "you've arrived" | `0.82 → 1.0`, `autoAlpha 0 → 1` |

**Theme:** warm / dark lifestyle climax. This section is a deliberate **book-end** with the
interior tone — golden-hour / lamplit. **Decompress the NEXT section on purpose** (back to
air/light) so this one reads as the peak, not the new baseline.

**Easing:** ONE curve for the whole section — the air/strong-out curve from
`slide-out-img-text` (`CustomEase "sofiAir" = M0,0 C0.22,0.68 0.16,0.99 1,1`).
Fast lead-out, long glide-to-rest = *dealt*, not *flung*. Do not add a second ease.

---

## How it reads on scroll
1. **Enter (p 0.00):** four cards sit stacked, overlapped, behind a giant serif word. The
   centre is dense, intriguing, slightly mysterious — photos are zoomed in (1.12).
2. **Deal (p 0.15 → 0.45):** scrubbing deals the cards out to TL / TR / BL / BR one-by-one
   (stagger), each de-rotating to flat and easing down to .8 scale. Their photos *relax*
   their zoom as they travel — they settle, they breathe.
3. **Crossfade (p 0.50 → 0.75):** the big word lifts and fades; **"the proof is in the
   work."** + the CTA crossfade up into the now-empty centre. The ghost layer swaps letter→word
   underneath at ≤6% — felt, not read.
4. **Settle (p 0.80 → 1.00):** a clean corner grid (no overlap), proof-line fully in, CTA
   underlined, scroll-dot breathing at centre-bottom. You've arrived.

Editorial, dealt — not flung.

---

## Level-1 components it uses
- **`library/components/slide-out-img-text/`** — the spine. Provides DOM
  (`.sofi__stage` / `.sofi__deck` / `.sofi__card` / `.sofi__ghost` / centre captions),
  the corner anchors, the `sofiAir` CustomEase, and the scrub+pin ScrollTrigger.
  Layers 2–5 are tweens added onto **that component's single timeline** — they are not
  separate ScrollTriggers.

No other Level-1 component is required. (If you want the cards to react to pointer once
settled, that's a separate enhancement, not part of this recipe.)

---

## Pin-budget note
- This section spends **one pin** (`endVH:130`, i.e. 1.3× viewport of scroll travel).
- **`slide-out-img-text` OWNS the pin.** Layers 2–5 attach to its timeline with `scrub:1`
  smoothing — they add **zero** additional ScrollTriggers and **zero** additional pins.
- Site-wide rule: a page carries a small pin budget (climax sections only). Spend this one
  here. Do **not** stack another pinned section immediately after — let the next section
  scroll free so the pin reads as a deliberate held beat.
- With Locomotive/smooth-scroll, set the ScrollTrigger `scroller` to the smooth container
  and call `ScrollTrigger.refresh()` after layout/media load (`invalidateOnRefresh:true`
  is already on — keep it, the card anchor positions are measured).

---

## How to build (outline)
1. **Drop in the component.** Copy `slide-out-img-text/` DOM + CSS + JS. Get the bare
   fan-out working first (cards deal to corners on scrub-pin). Verify the pin holds and
   releases cleanly before adding anything.
2. **Content the 4 cards.** Four *lifestyle* scenes — coffee on the terrace, kid in the
   yard, evening lamplight, neighbours/courtyard — not floor plans, not facades. Asymmetric
   corner sizing (one hero card bigger) reads more editorial than a tidy 2×2.
3. **Add layer 2 (counter-parallax).** Per card, tween inner `<img>` `scale 1.12 → 1.0`
   across that card's own travel slice. This is the single most important "not-a-sticker"
   touch — don't skip it.
4. **Wire layer 3 (headline crossfade).** Position the centre serif word + the proof-line/CTA
   *stacked at the same centre point*. Tween A out `0.35→0.60`, B in `0.50→0.85`, with
   `autoAlpha` + a small `y` only. Confirm there is **no x movement** — sideways = junior.
5. **Wire layer 4 (ghost).** One layer under the headline: giant faint letterform → faint
   word, `0.30→0.70`, opacity clamped `≤ .06`. If you can read it without squinting, it's
   too strong.
6. **Wire layer 5 (scroll-dot).** Centre-bottom dot `autoAlpha 0→1` at `0.82→1.0`.
7. **Theme + book-end.** Push this section warm/dark (golden-hour). Then deliberately reset
   the NEXT section to lighter/airier so this one is the peak.
8. **Verify by scrubbing slowly** (frame-by-frame, both directions): cards must *settle*
   not *snap*; centre crossfade must be purely vertical; ghost must stay ≤6%; nothing should
   reflow the pin (watch for jump on `refresh`). Reduced-motion: collapse to the settled
   corner grid + proof-line, no fan animation.
