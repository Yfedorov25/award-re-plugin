---
extends: cards-swipe
variant: editorial
name: "cards-swipe / editorial split"
status: official
source:
  grammar: "Quadro cards-lab — cards-v3-editorial-split.html (owner-approved)"
  recording: "apps/quadro/public/cards-lab/cards-v3-editorial-split.html"
  registry_ref: ["T-217", "T-405"]
meaning:
  lands: "Brisk, paper-feel SERVICES INDEX — each card is a two-column editorial split (text | render), the deck reads like turning pages of a printed catalogue rather than a film."
overrides:
  layout: "two-column grid split per card (1.18fr / 0.82fr), .flip alternates the column order"
  theme: "alternating theme-cream / theme-dark cards (warm paper grade)"
  accent: "#b9885a (warm copper)"
  serif: "Georgia, 'Times New Roman', serif  (owner-approved — NOT Fraunces)"
  pace: "brisker than base — tighter stagger, render slides in a beat AFTER the headline split-reveal"
  extras: "self-drawing hairline gutter between the two columns; specs row; per-card eyebrow rule"
when_pick_this: "A services / chapters index that should feel like a crisp printed catalogue. Pick cinematic instead for a slow, filmic, hero-adjacent reveal."
files: [variant.recipe.md, params.json, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# cards-swipe / editorial — variant delta

> **variant-as-delta. Base `component.js` is UNTOUCHED.** This is the editorial
> reading of the pinned card deck: a brisk two-column SPLIT (text | render) per
> card, alternating cream/dark themes, warm copper accent, self-drawing hairline
> gutters — a printed-catalogue feel rather than the filmic base. Source:
> owner-approved `cards-v3-editorial-split.html`.

## What makes it "editorial" (the delta only)
- **Two-column split per card** (`1.18fr / 0.82fr`), `.flip` alternates so the
  render swaps sides card-to-card — the printed-spread rhythm.
- **Alternating skins** — `theme-cream` ↔ `theme-dark` cards (warm paper grade).
- **Warm copper accent** `#b9885a` (vs the base/cinematic gold).
- **Serif = Georgia / Times** (owner approved this serif visually — preserve it,
  do NOT swap to Fraunces).
- **Brisker pace** — tighter headline split-reveal stagger (`~0.08`), the render
  slides in **a beat after** the text, hairline gutter **self-draws** (`scaleY`).
- **Snap honest, scrub `~0.6`** — the catalogue clicks page-to-page.

Everything else (the pin, the X-translate track, the snap mechanic, reduced-
motion collapse) is the BASE `CardsSwipe.init(opts)` engine, called with the
merged `params.json` below. No engine code is forked.

## How it is recorded
`variant.lab.html` includes the base `../../component.js`, calls
`CardsSwipe.init({ ...base defaults, ...params.json })`, and skins the cards via
its own `<style>` (the editorial split + cream/dark themes + copper + serif).
The `__LAB_OK__` probe confirms the deck booted with zero console.error.
