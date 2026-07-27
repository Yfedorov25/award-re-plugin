# Hero Patterns — composed sections, not loose atoms

> Derived from the 10 GREEN hero variants in `combos/hero--*`. A **pattern** is a
> named atom-composition that either RECURS across variants or GENERALIZES into a
> reusable shape other sections can adopt. Each pattern fixes the one thing juniors
> get wrong: the **atom order** and the **pin-owner rule**.
>
> Read order law: the SUBJECT (building) resolves first or last on purpose; the
> TITLE never competes with the reveal for the same beat; the CHROME (meta labels,
> nav) assembles LAST. Patterns below encode that as canonical order.
>
> Source variants (id → atoms):
> - `hero--seam-cascade-arrival` — center-seam-split, render-slice-reveal, mask-up-title, content-stage-cascade, corner-frame-meta
> - `hero--wordmark-docks-to-nav` — hero-title-to-nav-pill, blur-reveal-stagger-title, render-scroll-scale, corner-frame-meta
> - `hero--preloader-parts-to-hero` — preloader-band-collapse, center-seam-split, mask-up-title, content-stage-cascade
> - `hero--scroll-piloted-flyaround` — frame-scrub-img, fluid-type-sizing, corner-frame-meta
> - `hero--numeral-frame-sequence` — numeral-frame-expand-hero, corner-frame-meta, theme-tween
> - `hero--tilted-mosaic-world` — rotated-mosaic-hero, theme-tween, mask-up-title, scroll-hint-descending-tick
> - `hero--day-to-night-living` — daynight-scroll-scrub, daynight-engine, mask-up-title, theme-tween
> - `hero--split-word-reveal` — split-word-headline, blur-reveal-stagger-title, render-scroll-scale, corner-frame-meta
> - `hero--curtain-rise-reveal` — panel-rise-over, bleeding-wordmark, fluid-type-sizing, theme-tween
> - `hero--portrait-ledger-arrival` — portrait-vertical-hero, vertical-awards-rail, corner-frame-meta, mask-up-title

---

## The patterns

### 1. `saisei-arrival-cascade`
**What:** A reveal-aperture (slice or seam) parts to surface the building, THEN the
title masks up into the cleared frame, THEN the chrome (meta/labels) assembles last.
The signature is the *staggered cascade of stages* — nothing lands at once.

**Canonical atom order:** `center-seam-split` (or `render-slice-reveal`) → `mask-up-title`
→ `content-stage-cascade` → `corner-frame-meta`.

**Pin-owner rule:** NO pin. This is a load-in cascade driven by enter/load timeline,
not a pinned scrub. If anything pins here you've broken the "settles once on arrival"
feel — the cascade is a one-shot, not a scroll-scrubbed range.

**Anti-combos:** Do not add `frame-scrub-img` or `daynight-scroll-scrub` (those demand
a pin and a moving subject — they fight the one-shot settle). Do not stack a second
title atom (`split-word-headline`) — one title mechanic per hero.

**Recurs in:** `hero--seam-cascade-arrival`, `hero--preloader-parts-to-hero` (its
post-gate body is exactly this cascade).

**When to use:** Default editorial arrival hero — you want a calm, staged unveiling of
one full-bleed render with a serif title and quiet corner meta.

---

### 2. `gated-seam-open`
**What:** A counted, decode-GATED preloader resolves (`ready()`), and only then the
seam doors part. The wait is the dramaturgy; the seam is the payoff. This is
`saisei-arrival-cascade` with a preloader gate welded to its front.

**Canonical atom order:** `preloader-band-collapse` → `center-seam-split` →
`mask-up-title` → `content-stage-cascade`.

**Pin-owner rule:** The PRELOADER owns the gate (it blocks reveal until images decode);
NO scroll pin. Seam parting fires from the preloader's `ready()` resolve, never from a
ScrollTrigger. Guard the reveal on real `decode()` — never a fixed timeout.

**Anti-combos:** Never let scroll trigger the seam while the preloader is still up
(double-driver race). Do not skip the decode guard — an ungated seam over undecoded
WebP = flash of broken frame (the exact F-class jank we log).

**Recurs in:** `hero--preloader-parts-to-hero`. (Pairs as the gated front-end for
pattern 1.)

**When to use:** First-load hero where heavy render assets must decode before reveal,
and you want the wait itself to feel intentional.

---

### 3. `wordmark-to-nav-handoff`
**What:** A big brand wordmark scroll-scrubs upward/downward and DOCKS into a real,
persistent top-centre nav pill; the headline materialises in the vacated centre only
AFTER the mark has cleared it. A handoff, not a fade.

**Canonical atom order:** `hero-title-to-nav-pill` (the docking mark) → [mark clears
centre] → `blur-reveal-stagger-title` (headline fills the vacancy) → `render-scroll-scale`
(render eases up behind) → `corner-frame-meta`.

**Pin-owner rule:** ScrollTrigger PINS the hero for the scrub range; the docking mark
owns the timeline. The nav pill is a REAL persistent element that survives unpin (it
does not get destroyed when the hero unpins) — that persistence is the whole point.

**Anti-combos:** Do not run a seam/curtain reveal in the same hero — the docking mark
needs an uncluttered field to travel across. Avoid `mask-up-title` here; the headline
uses `blur-reveal-stagger` so it reads as "materialising into a vacancy", distinct from
a line-mask.

**Recurs in:** `hero--wordmark-docks-to-nav`.

**When to use:** Brand-forward hero where the logo IS the motion and you want a
persistent centred nav identity carried out of the hero.

---

### 4. `title-plus-render-scale`
**What:** A scroll-scrubbed TITLE assembly (split-word or blur-stagger) runs against a
render that gently scales up on the same scroll, framed by static corner meta. The
title is caught half-assembled mid-scroll; the render breathing behind sells depth.

**Canonical atom order:** `split-word-headline` (or `blur-reveal-stagger-title`) →
`render-scroll-scale` → `corner-frame-meta`.

**Pin-owner rule:** ScrollTrigger PINS and `scrub`s; ONE progress timeline drives BOTH
title reveal and render scale (do not give them separate triggers — they must share the
same scroll range or they desync). Corner meta is static, outside the scrub.

**Anti-combos:** Do not add a seam/curtain/preloader — this pattern is a continuous
scrub, not a one-shot arrival. Do not pair two title atoms; pick split-word OR
blur-stagger.

**Recurs in:** `hero--split-word-reveal`, `hero--wordmark-docks-to-nav` (its tail uses
the same blur-title + render-scale layer).

**When to use:** Scrolly hero where you want the headline to assemble under the reader's
own scroll, with a quietly living render behind it.

---

### 5. `daynight-hero`
**What:** A pinned day-to-night dissolve of the SAME exterior view, welded to a
page-wide warm→dark recolour off the SAME scroll: windows ignite as the whole field
cools from dawn-paper to night-dark.

**Canonical atom order:** `daynight-scroll-scrub` (the same-view dissolve) +
`daynight-engine` (page-wide recolour, same progress) → `mask-up-title` → `theme-tween`.

**Pin-owner rule:** ScrollTrigger PINS; a SINGLE scroll progress feeds the dissolve, the
`daynight-engine` recolour, AND the `theme-tween` — one driver, three consumers. Never
let the page recolour run on a separate trigger from the image dissolve (the "welded"
feel dies the instant they desync).

**Anti-combos:** Do not combine with `frame-scrub-img` (two pinned scrubbed surfaces
fight). Avoid mix-blend/backdrop-filter over the scrubbed surface (logged hero-lag).
Day and night must be the SAME framing — different views = a slideshow, not a dissolve.

**Recurs in:** `hero--day-to-night-living`. (The `daynight-engine` + `theme-tween`
welding GENERALIZES — see "Generalizes beyond hero" below.)

**When to use:** "Living building" hero — you want the headline atmosphere (a day in the
life) and have a frame-matched day+night exterior pair.

---

### 6. `numeral-title-sequence`
**What:** Outline-numeral-as-aperture: a giant stroke-only numeral holds a small framed
window of the building inside its counters, and that window dilates to full-bleed as the
digits dissolve. The number is both title and mask.

**Canonical atom order:** `numeral-frame-expand-hero` (numeral aperture dilating) →
`theme-tween` (field recolours as it goes full-bleed) → `corner-frame-meta` (assembles
once full-bleed lands).

**Pin-owner rule:** ScrollTrigger PINS for the dilation range; the numeral atom owns the
single timeline (aperture window scale + digit dissolve + theme tween are keyed off one
progress). Corner meta is the post-dilation chrome, outside the scrub.

**Anti-combos:** Do not add a separate title atom — the numeral IS the title; a second
headline competes. Do not add a seam/curtain — the numeral counters ARE the reveal
aperture.

**Recurs in:** `hero--numeral-frame-sequence`.

**When to use:** A hero with a strong number to own (storeys, year, unit count) where you
want the figure to literally frame and then surrender to the building.

---

### 7. `atmosphere-mosaic-hero`
**What:** A tilted rigid MOSAIC of many varied photos under one tinted multiply wash
drifts up as a single field on scroll — a whole WORLD, not one full-bleed frame. The
diagonal tile-seam is the signature.

**Canonical atom order:** `rotated-mosaic-hero` (the tilted tile field) → `theme-tween`
(single wash over the whole field) → `mask-up-title` → `scroll-hint-descending-tick`
(invites the drift).

**Pin-owner rule:** NO pin. The mosaic is a parallax plane that drifts on scroll (one
field, one transform) — pinning would freeze the world it's meant to let you fall
through. The whole mosaic shares ONE tint/transform so it reads as a single plane.

**Anti-combos:** Do not add `render-scroll-scale` or a seam — there is no single hero
render to scale or part. Do not let individual tiles animate independently (that breaks
the "one rigid world" read into AI-slop confetti).

**Recurs in:** `hero--tilted-mosaic-world`.

**When to use:** Lifestyle/place-led hero where you sell the WORLD and mood rather than
one building — many images, one wash, one drift.

---

### 8. `subject-flyaround-scrub` (VIDEO-class)
**What:** The only hero whose SUBJECT physically moves — the building turns in continuous
3D-feeling rotation under one pinned scroll, swapping frame-exact reversible WebP frames;
the title yields the frame to it.

**Canonical atom order:** `frame-scrub-img` (the frame sequence is the hero) →
`fluid-type-sizing` (title scales but stays subordinate) → `corner-frame-meta`.

**Pin-owner rule:** ScrollTrigger PINS for the full frame range; `frame-scrub-img` owns
the scrub and maps progress → frame index. Use `createImageBitmap`/decoded frames, never
`<img>` swap (logged: 13.8% → 0.2% jank). Title is subordinate — it must not contend for
motion focus.

**Anti-combos:** Do not weld a `daynight-scroll-scrub` or a seam onto it — a second
scrubbed surface steals the pin budget and the subject's motion. Do not scrub
`video.currentTime` (scroll-hero law); use frame-exact WebP.

**Recurs in:** `hero--scroll-piloted-flyaround`.

**When to use:** When you have a 120-frame drone/turntable sequence and want the building
itself to be the motion — the premium VIDEO-class hero.

---

### 9. `curtain-rise-reveal`
**What:** A rounded coloured CARD physically lifts over a dark brand field, surfacing the
building inside it as it seats. The rounded leading edge is visible throughout the rise
(translateY 900 → 56 → 0).

**Canonical atom order:** `bleeding-wordmark` (brand field beneath) → `panel-rise-over`
(card lifts over it) → `fluid-type-sizing` (title scales into the seated card) →
`theme-tween` (field settles as the card seats).

**Pin-owner rule:** Curtain rise can be load-in OR a short pinned scrub; `panel-rise-over`
owns the rise timeline. The rounded leading edge must stay rounded for the WHOLE travel
(not just at rest) — that's what reads as "curtain", not "slide".

**Anti-combos:** Do not also part a seam — the card edge IS the reveal boundary; two
boundaries muddy it. Avoid `corner-frame-meta` flush to the card's rounded corners
(the radius and square meta-ticks clash).

**Recurs in:** `hero--curtain-rise-reveal`.

**When to use:** Brand-first hero that wants a tactile "lift the veil" gesture surfacing
the render inside a card.

---

### 10. `portrait-ledger-arrival`
**What:** A tall PORTRAIT 9:16 render plate stood UPRIGHT and dead-centred on a wide dark
field with generous air both sides, flanked by a vertical credentials rail, four corner-
meta labels, and a serif title masking up in the side air. A museum plate, not a backdrop.

**Canonical atom order:** `portrait-vertical-hero` (the centred upright plate) →
`vertical-awards-rail` (credentials in the right air) → `corner-frame-meta` (four labels
frame the field) → `mask-up-title` (line-by-line in the left air).

**Pin-owner rule:** NO pin. Settles ONCE on enter and holds (composed static plate). The
plate is centred with deliberate side-air — do not let any element bleed into that air or
the "plate on a field" composition collapses into a full-bleed.

**Anti-combos:** Do not add `render-scroll-scale` / `frame-scrub-img` / seam — the plate is
fixed and centred by design; scaling or parting it destroys the museum-plate stance. Do not
fill the side air with a full-width media.

**Recurs in:** `hero--portrait-ledger-arrival`.

**When to use:** When the hero render is PORTRAIT (9:16) and you want a credentialed,
gallery-plate composition rather than a full-bleed backdrop.

---

## Generalizes BEYOND hero (reusable layers for any section)

These are atoms/sub-compositions that recur as a LAYER across hero variants and lift
cleanly into other sections. Treat them as section-agnostic building blocks:

- **`corner-frame-meta` (chrome layer).** Appears in 6 of 10 heroes as the LAST-assembling
  frame. It is a pure overlay independent of the reveal mechanic underneath — drop it on
  ANY full-bleed section (architecture, location, units) to add the "framed editorial"
  signature. Rule: it assembles last and stays static (never scrubbed).

- **`render-scroll-scale` (living-render layer).** Used in `wordmark-docks-to-nav` and
  `split-word-reveal` as a render that breathes behind the title. Generalizes to any
  pinned section wanting a "quietly alive" backing image (architecture reveals, story
  steppers) — share its progress with the foreground element, never give it its own
  trigger.

- **`theme-tween` (field-recolour layer).** Recurs in numeral, mosaic, daynight, and curtain
  heroes. It's a page/section-field recolour off scroll progress — reusable in ANY section
  that should shift mood with scroll (e.g. architecture dusk-seam, manifesto). Pairs with
  `daynight-engine` for the full page-wide welded recolour.

- **`mask-up-title` (line-reveal layer).** The default serif title reveal across 5 heroes —
  section-agnostic; use it for any section headline that should rise line-by-line. One title
  mechanic per section (don't stack with split-word/blur-stagger).

- **`daynight-engine` welding (page-wide driver).** From `day-to-night-living`: a single
  scroll progress feeding image dissolve + page recolour + theme. The WELDING discipline
  (one driver, many consumers, never desynced) is the reusable lesson for any multi-layer
  scrubbed section — not just heroes.

- **`content-stage-cascade` (staged load-in).** The "nothing lands at once" stagger from the
  arrival heroes generalizes to any on-enter section that introduces multiple elements
  (spec lists, award rails) — sequence them, don't pop them together.

## Cross-cutting pin-owner law

At most ONE pinned-scrub mechanic per hero. If a variant already owns the pin
(`frame-scrub-img`, `daynight-scroll-scrub`, `render-scroll-scale` in a pinned hero,
`numeral-frame-expand-hero`), every other layer must consume that same progress or run
as a non-pinned load-in. Two independent pins = desync and stolen scroll budget. The
no-pin patterns (saisei-arrival-cascade, atmosphere-mosaic-hero, portrait-ledger-arrival)
must NOT be retrofitted with a pin to "add interactivity".
