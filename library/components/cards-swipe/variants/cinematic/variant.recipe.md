---
extends: cards-swipe
variant: cinematic
name: "cards-swipe / fullbleed cinematic"
status: official
source:
  grammar: "Quadro cards-lab — cards-v2-fullbleed-cinematic.html (owner-approved)"
  recording: "apps/quadro/public/cards-lab/cards-v2-fullbleed-cinematic.html"
  registry_ref: ["T-217", "T-405"]
meaning:
  lands: "Slow, luxe, hero-adjacent FILM — each card is a single dark full-bleed render with a serif title; the deck reads as a cinematic reel held one frame at a time."
overrides:
  layout: "single full-bleed render per card (NOT split) — dark grade"
  theme: "dark-only (radial vignette field)"
  accent: "#c8a96a (cinematic gold)"
  serif: "'Times New Roman', Georgia, ui-serif, serif  (owner-approved — NOT Fraunces)"
  pace: "slower than base — scrub ~0.7, snap min0.2/max0.5, line-mask title reveal, italic gold accents"
  extras: "per-card content timeline (eyebrow/lines/desc/feats staggered), bronze stitch, hero hint fade on enter"
when_pick_this: "A hero-adjacent SHOW act that must feel filmic and slow. Pick editorial instead for a brisk printed-catalogue index."
files: [variant.recipe.md, params.json, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# cards-swipe / cinematic — variant delta

> **variant-as-delta. Base `component.js` is UNTOUCHED.** This is the filmic
> reading of the pinned card deck: each card is a single dark FULL-BLEED render
> with a serif title that masks up line-by-line; slow scrub, gold accents, a
> bronze seam stitch — hero-adjacent and luxe. Source: owner-approved
> `cards-v2-fullbleed-cinematic.html`.

## What makes it "cinematic" (the delta only)
- **Full-bleed render per card** (NOT the editorial split) on a **dark** field
  with a radial vignette.
- **Dark-only grade**, **cinematic gold accent** `#c8a96a`.
- **Serif = Times / Georgia** (owner approved this serif visually — preserve it,
  do NOT swap to Fraunces).
- **Slower pace** — `scrub ~0.7`, snap `min 0.2 / max 0.5`, the title reveals via
  a **line mask** (`yPercent` up), italic gold accents on key words.
- **Per-card content timeline** — eyebrow → title lines → desc → feats →
  continue, staggered on the `air` ease; a hero **hint** fades out on enter.

The pin, the X-translate track, the snap mechanic, and the reduced-motion
collapse are all the BASE `CardsSwipe.init(opts)` engine, called with the merged
`params.json`. No engine code is forked.

## How it is recorded
`variant.lab.html` includes the base `../../component.js`, calls
`CardsSwipe.init({ ...base defaults, ...params.json })`, and skins the cards via
its own `<style>` (dark full-bleed + gold + Times serif). The `__LAB_OK__` probe
confirms the deck booted with zero console.error.
