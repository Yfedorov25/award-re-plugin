---
id: numeral-frame-expand-hero
name: "Numeral frame-expand hero (giant outline numerals with a small framed view inside; on scroll the frame expands to a full-bleed photo, the numerals fade, a serif title rises in, a parallax pan, then exit-rise — one continuous pinned scroll-narrative)"
level: 2
kind: component
status: official
entry:
  call: "NumeralFrameExpandHero.create(target, opts)  // target = .nfe-hero > .nfe-bg(.nfe-frame > img) + .nfe-numerals(.digits) + .nfe-title + .nfe-sub. opts: { frameInset, frameScale, panY, exitY, pinFactor, ease, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), destroy }"
meaning:
  what: "r1864's signature hero — one continuous pinned scroll-narrative in 4 stages: (A) FRAME-EXPAND: giant outline numerals on warm-black with a small framed view sitting INSIDE the numeral row; on scroll the frame expands to a full-bleed photo (clip-inset -> 0 + scale -> 1 + img fades up) while the numerals fade out. (B) TITLE-IN: the serif display title + sub-line rise in. (C) PARALLAX-PAN: the background drifts up while the title holds. (D) EXIT-RISE: the hero fades to 0 + rises as the next section arrives."
  when: "A flagship hero where the project's NAME or YEAR is the identity, and you want the landing to feel like a single authored sequence rather than a static image + a scroll. Ideal for heritage / luxury real-estate or a brand whose number/monogram carries weight: the numeral frames a teaser view, the view becomes the world, the promise (title) lands, and the page hands off. Use it once, at the very top; it owns the first ~2.4 viewports of scroll."
  lands: "You arrive to a huge thin-outlined number on near-black, with a small framed glimpse of the place held inside it. As you scroll, that little window opens — growing until the photograph fills the screen — the number dissolving into it; then the headline settles over the view, the scene drifts slowly upward, and finally the whole hero lifts and fades away as the next section rises to meet you. It reads as one cinematic title sequence."
  not_when: "A content-first page that should land instantly. When there's no meaningful number/monogram to carry the opening (use hero-video-render-rotator or a plain hero). A short page that can't spare ~2.4 viewports of pinned scroll. Stacking with another full-screen intro. Over a video (use an <img>/poster — this never scrubs video.currentTime)."
source:
  grammar: "r18642: outline '1864' on warm-black, a framed Kremlin-through-columns view inside the numerals -> the frame expands to a full-bleed embankment photo -> serif title 'УРОВЕНЬ ЖИЗНИ / КЛАССА DE LUXE / БЕЗ КОМПРОМИССОВ' over it -> vertical parallax pan -> exit into the light section."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (r1864.ru hero; Brick 1 of the r1864 harvest)"
  registry_ref: ["r1864-numeral-frame-expand-hero"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [clip-path, transform, opacity]
trigger: "owns_pin scroll-scrub (pinned for innerHeight*pinFactor; one 4-stage narrative)"
timing_layer: [A-hero, T-transition]
owns_pin: true
owns_scroll: false
page_beat: [hero, intro]
combines_with: [compass-rose-section-divider, collection-tier-announce, river-tinted-poi-map, isometric-building-unit-selector]
anti_combos: [second-hero, preloader-band-collapse, second-pin]
gated_by: [R_anti_combos, R_perf_limits, R_owns_pin]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "(A) on scroll the .nfe-frame clip-path inset goes frameInset%(34)->0 + scale frameScale(0.62)->1, the inner img opacity 0.4->1, and .nfe-numerals opacity 1->0 (gone by ~0.30) over 0.00..0.35"
  - "(B) the .nfe-title fades opacity 0->1 + translateY 30px->0 over 0.30..0.55; the .nfe-sub a beat later (0.42..0.66)"
  - "(C) the .nfe-bg parallaxes translateY 0 -> -panY(120) over 0.55..0.90 while the title holds"
  - "(D) the whole .nfe-hero exits opacity 1->0 + translateY -> -exitY(160) over 0.85..1.00"
  - "set(p 0..1) is a PURE scrub of all 4 stages; clip-path inset + transform + opacity only; NO mix-blend / NO WebGL; NEVER scrub video.currentTime; owns_pin (one pin, span = innerHeight*pinFactor)"
  - "reduced-motion or <=820px -> final state (photo + title shown, no exit); GSAP+ScrollTrigger required; window.__LAB_OK__ on init"
  - "asset-substitution gate: outline numerals + OUR QUADRO render expanding + a serif Cyrillic display title + warm-black palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the pinned hero: the framed image (inside the outline numerals) expands to full-bleed as the numerals fade, then the serif title rises in over it, then the bg pans, then the hero lifts + fades as the next section arrives. owns_pin scroll-scrub. GATE-BLINDSPOT: clip-path media false-blanks a naive probe early; verify the inset/scale/opacity curve per stage + fps. Drive the lab's own pinned instance to screenshot."
note: |
  Brick 1 of the r1864 harvest (the SIGNATURE hero, site identity). One pinned scroll-narrative
  that absorbs 4 reported hero fragments (frame-expand + title-fade + parallax-pan + exit-rise)
  into a single engine. Distinct from hero-title-to-nav-pill (title shrinks into a pill),
  hero-video-render-rotator (rotating bg under a fixed title), preloader-band-collapse (intro
  curtain): here a framed teaser INSIDE outline numerals opens into the photo, then the page
  hands off. clip-path + transform + opacity = GPU-cheap. owns_pin. Proven 1:1 on a QUADRO
  render: frame inset 34->0 + scale 0.62->1, numerals fade by 0.30, title in by 0.55, pan to
  -120px, exit rise; 0.2% jank @ 59.9fps, zero console errors. Serif = Playfair Display
  (Didot/Bodoni/PP-Editorial class for the Cyrillic luxe register).
---

# numeral-frame-expand-hero — outline numerals open a framed view into a full hero, title lands, page hands off

r1864's signature hero: giant outline numerals with a small framed view inside; on scroll the
frame expands to a full-bleed photo (the numerals fade), a serif display title rises in over it,
the background parallax-pans, then the whole hero lifts and fades as the next section arrives.
One continuous pinned scroll-narrative.

## Markup + call
```html
<section class="nfe-hero" id="hero">
  <div class="nfe-bg"><div class="nfe-frame"><img src="render.webp"></div></div>
  <div class="nfe-numerals"><div class="digits">1864</div></div>
  <div class="nfe-title">Уровень жизни<br>класса de luxe<br>без компромиссов</div>
  <div class="nfe-sub">…</div>
</section>
<section class="next">…</section>
```
```js
NumeralFrameExpandHero.create('#hero', { frameInset:34, frameScale:0.62, panY:120, exitY:160, pinFactor:2.4, manageLenis:false });
```

## Proven (the lab)
OUR QUADRO aerial render in the frame. Curve measured live (p / frame-inset / frame-scale /
numerals-op / title-op / bg-pan): 0 / 34% / 0.62 / 1.00 / 0 / 0 → 0.18 / 8% / 0.91 / 0.16 / 0 / 0 →
0.35 / 0% / 1 / 0 / 0.36 / 0 → 0.55 / 0% / 1 / 0 / 1.00 / 0 → 0.75 / 0% / 1 / 0 / 1 / -98px →
1 / 0% / 1 / 0 / 1 / -120px (+ exit op→0, rise -160px over 0.85..1). Screenshots: (1) outline
"1864" + the framed QUADRO aerial inside the numerals; (2) frame expanded full-bleed + serif
"УРОВЕНЬ ЖИЗНИ / КЛАССА DE LUXE / БЕЗ КОМПРОМИССОВ" + sub-line (matches r1864). Probe (4× CPU
throttle): 1/663 long frames (0.2%), 59.9fps → PASS. Zero console errors.
