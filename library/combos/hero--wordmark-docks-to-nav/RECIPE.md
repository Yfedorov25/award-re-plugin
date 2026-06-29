---
id: hero--wordmark-docks-to-nav
name: "Бренд, що сідає в навігацію"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "11tanjung's signature hero: the GIANT italic wordmark scroll-scrubs scale + translateY DOWN and DOCKS into a frosted top-centre nav pill — the same DOM node the whole way (no swap). As the mark clears the centre band, the REAL headline blur-staggers into focus behind it (per-word filter blur(22px) -> 0, never moving), and the full-bleed render gently pushes in (scale 1.0 -> 1.07). ONE pinned scroll owns all four systems: the dock (owner), the render push-in, the headline focus-pull, and the authored-plate corner meta. The brand physically becomes the nav — a mechanic that is unmistakable in a single screenshot, not just in code."
  when: "The opening hero of a premium ЖК / house site that already has (or wants) a persistent top-centre wordmark nav. Use it as the FIRST impression when the brand mark itself is strong enough to carry the establishing beat and the studio wants the title-to-nav transition to be the heroic moment. The render sells the building; the dock sells the level."
  lands: "You land on a full-screen italic wordmark over the house. As you scroll once, the wordmark shrinks and rises until it sits down inside a frosted pill in the top-centre nav, the readability scrim under it fades, the building quietly pushes in, and the real headline sharpens into focus word by word where the mark used to be. The brand becomes the navigation in front of you. It reads engineered and authored, not a static title card."
source:
  grammar: "11tanjung.com (premium RE Malaysia, Imperio, Awwwards) — the signature 'wordmark docks to nav pill' move, frame-by-frame: the full title (a016) scroll-scrubs scale+translateY into the docked top-centre pill (a024); the headline blur-reveal (a027 'A New' sharp first -> a033 'of Living' last) materialises via a per-word gaussian blur -> 0 with no translate; the render breathes a slow push-in on the same scroll. Harvested into hero-title-to-nav-pill (the dock + pin) + blur-reveal-stagger-title (the focus-pull headline) + render-scroll-scale (the push-in layer) + corner-frame-meta (the Saisei authored-plate corners)."
  recording: null
  registry_ref: []
uses:
  - { atom: hero-title-to-nav-pill, job: "PIN OWNER. Builds the one pinned scrub ScrollTrigger; scroll-scrubs the giant wordmark scale(1 -> 0.085) + translateY(0 -> -46vh) so it docks dead-centre in the nav pill; fades the readability scrim out over the first 60% and the frosted pill plate in over the last 45%. The same DOM node the whole way." }
  - { atom: render-scroll-scale, job: "The full-bleed render layer (the SAME .htp-render element doubles as the .rss-frame). Host-driven (selfTrigger:false): set(p) scales the render 1.0 -> 1.07 on the SAME pin progress. Carries [data-render-surface]. A-ambient breathing behind the copy." }
  - { atom: blur-reveal-stagger-title, job: "The REAL headline, split per word, held at blur(22px)+opacity0 behind the wordmark; played as a ONE-SHOT focus-pull (per-word blur -> 0, no translate) ONLY after the mark has cleared the centre band (p > 0.62), reversible on scroll-up. Plain text only (no inner tags — the splitter is whitespace-based)." }
  - { atom: corner-frame-meta, job: "The Saisei authored-plate corner labels (tl brand+coords, bl tagline, br type/time, rc index); one-shot staggered fade-in just after the headline lands (p > 0.74). C-microdetail; makes the docked frame read as an authored plate, not a slide." }
pin:
  owner: hero-title-to-nav-pill
  count: 1
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "ONE pin, owned by hero-title-to-nav-pill (the harness creates NO section pin); ScrollTrigger.getAll().filter(pin).length === 1; all four cited atoms run without throwing; window.__LAB_OK__ === true."
  - "The wordmark docks dead-centre in a REAL persistent top-centre nav: at dock the wordmark centre y === the pill centre y (measured 36px vs 35px), horizontally centred (cx 720 === viewport/2)."
  - "Coupled off ONE scroll position: pill dock (scale 1 -> 0.085), render push-in (scale 1.0 -> 1.07), and rail (scaleY 0 -> 1) all scrub on the same trigger.progress; the headline blur-reveal + corner meta are one-shots gated late on that same progress."
  - "NO overlap: the headline reveal fires only after the giant mark has cleared the centre band (mark top at ~91px while headline sits at 457-527px when it materialises); reversible — scroll-up below the threshold re-hides it."
  - "DECODE-GUARD: the render (renders/day-34.webp, cars-free landscape) is force-decoded before reveal (render-scroll-scale); no black flicker; [data-render-surface] painted a decoded 1920px image."
  - "reduced-motion / <=820px -> static: htp-static set, pill shown docked, headline + eyebrow + corners shown sharp, render at scaleFrom; __LAB_OK__ true; zero console errors. Motion is transform/opacity/filter only; no WebGL, no mix-blend, no backdrop over a scrubbed surface, no video.currentTime scrub."
webgl: false
ease: air
class: "scroll (pinned scrub)"
---

# hero--wordmark-docks-to-nav — "Бренд, що сідає в навігацію"

11tanjung's signature hero. One pinned scroll drives the giant italic wordmark DOWN
into a frosted top-centre nav pill (the same node the whole way); as the mark clears
centre the real headline blur-staggers into focus behind it and the render gently
pushes in. The brand physically becomes the navigation — the heroic moment is the dock.

## The one mechanic (what makes it distinct on screen)
A brand wordmark that SITS DOWN INTO A REAL NAV. Not "big title + full-bleed media"
(the cluster every hero falls into) — here the title TRAVELS into a persistent UI pill
top-centre, and the headline only exists once the mark has vacated the centre. In a
single screenshot you see a wordmark mid-flight between hero and nav: unmistakable.

## The four systems, ONE pin (owned by hero-title-to-nav-pill)
- **Dock (owner, B-entrance, whole pin):** wordmark scale 1 -> 0.085, translateY 0 -> -46vh,
  scrim fades, frosted pill plate fades in. Docks dead-centre in the nav.
- **Render push-in (A-ambient, whole pin):** the same full-bleed render scales 1.0 -> 1.07,
  host-driven off the same progress (no second trigger). Carries [data-render-surface].
- **Headline focus-pull (B-entrance, late one-shot p>0.62):** per-word blur(22px)->0, no
  translate. Fires only after the mark clears centre; reversible.
- **Corner meta (C-microdetail, late one-shot p>0.74):** Saisei authored-plate corners.

Coupling: hero-title-to-nav-pill captures its OWN onUpdate at create-time, so the combo
does NOT inject into its trigger. Instead it reads that one pin's `trigger.progress` on
`gsap.ticker` (on-change only) and drives the three coupled atoms off the same scroll
position. ONE scroll owner, four systems, no second pin.

## Markup + call (cite ids, never inline atom code)
The hero stage IS the atom's `.htp-stage`. The full-bleed render `.htp-render` doubles as
the render-scroll-scale `.rss-frame` (one render, both jobs). A real `<nav>` with left +
right clusters flanks a centred dock slot. Wiring lives in `combo-lab.html`:
`HeroTitleToNavPill.create('#hero', { pillScale:0.085, pillY:-46, pinFactor:1.0 })`
owns the pin; `RenderScrollScale.create('#renderFrame', { scaleTo:1.07, selfTrigger:false })`,
`BlurRevealStaggerTitle.create('#headline', { blur:22, stagger:0.12 })`, and
`CornerFrameMeta.create('.corner', { stagger:0.09 })` ride the same progress.

## Asset
`renders/day-34.webp` — the clean cars-free LANDSCAPE frontal crop (1920x1080). NO scrubbed
video bg. The building/atmosphere is the hero.

## Copy (Ukrainian, Fedoriv voice, sparse, zero em/en-dashes)
- Wordmark: **QUADRO**
- Eyebrow: Власний берег, Україна
- Headline: **Дім на воді, не в потоці**
- Corners: QUADRO · 503.21 · 34.21 / Перший рядок до берега / Візуалізація · День / 01

## Verified
labOK true, exactly 1 pin, all four atoms ran, render decoded (1920px), zero console
errors. Dock alignment exact (word cy 36 vs pill cy 35). No headline overlap with the
giant mark. Reduced-motion -> static, everything shown. (See SELF-SCORE in the handoff.)
