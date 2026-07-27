---
id: compass-rose-section-divider
name: "Compass-rose section-divider (a thin line-art compass-rose / quatrefoil ornament that draws + scales + fades in as a section announces itself, above a kicker + giant serif title + body + framed CTA)"
level: 2
kind: component
status: official
entry:
  call: "CompassRoseSectionDivider.create(target, opts)  // target = .crd-stage > svg.crd-rose([data-draw] strokes) + .crd-kicker + .crd-title + .crd-body + .crd-cta. opts: { draw, scaleFrom, rotateFrom, duration, ease, start, once, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), play(), destroy }"
meaning:
  what: "r1864's section-announce — a thin line-art compass-rose / quatrefoil ornament (concentric circles + a 4-petal flower + N/S/E/W rays + a centre dot) that DRAWS + scales + fades in as a section announces itself, above a small kicker, a giant serif display title, body, and a framed CTA. The neoclassical 'this is a new chapter' opener."
  when: "The way a premium, heritage-leaning site ANNOUNCES a new section — a centred ornament + a tracked kicker + a giant serif statement, the page taking a breath before the next chapter. Use it between major beats (after the hero, before a feature run, opening a history/location section) when you want a formal, museum-grade divider rather than just a heading. The drawn ornament gives it craft; keep it centred and generous."
  lands: "The page opens onto calm paper and a small ornament draws itself into being at the centre — a compass-rose of overlapping circles with four fine rays — then a line of tracked caps and a large serif statement settle in beneath it, with a single outlined button. It reads as the start of a new chapter, formal and unhurried, like the title page of a section."
  not_when: "A dense content section that just needs a heading (use plain type). A playful/modern brand (the ornament reads classical). More than a few times per page (it's a chapter-opener; overuse cheapens it). When there's no real statement to announce (it wants a short, weighty title)."
source:
  grammar: "r18642: a line-art compass-rose (4-point star rays + a quatrefoil of 4 overlapping circles + centre dot) above 'НА ЗОЛОТОМ ОСТРОВЕ НАПРОТИВ КРЕМЛЯ', a giant serif 'В САМОМ СЕРДЦЕ МОСКВЫ', body, and a framed 'ПОДРОБНЕЕ' CTA. r18644 /history: a smaller quatrefoil-in-a-square above 'ИСТОРИЯ МЕСТА'."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 4 of the r1864 harvest; the section-announce ornament)"
  registry_ref: ["r1864-compass-rose-section-divider"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [stroke-dashoffset, transform, opacity]
trigger: "scroll-into-view reveal (once; not pinned)"
timing_layer: [B-reveal, T-section-announce]
owns_pin: false
owns_scroll: false
page_beat: [section-announce, chapter-opener, divider]
combines_with: [numeral-frame-expand-hero, masked-heritage-split, collection-tier-announce, river-tinted-poi-map]
anti_combos: [overuse-per-page, pin]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a hand-authored inline SVG ornament (.crd-rose): concentric circles + a 4-petal quatrefoil (4 overlapping circles) + N/S/E/W rays + a centre dot, thin stroke (vector-effect non-scaling-stroke)"
  - "on scroll-into-view the ornament fades opacity 0->1 + scales scaleFrom(0.55)->1 over 0..0.45, and its [data-draw] strokes draw (stroke-dashoffset length->0) over 0..0.6"
  - "the kicker fades (0.35..0.55); the serif title fades + translateY 24->0 (0.45..0.75); the body + CTA fade + rise (0.70..1.0)"
  - "set(p 0..1) is a PURE scrub; stroke-dashoffset + transform + opacity only; NO mix-blend / NO WebGL; owns_pin false"
  - "reduced-motion or <=820px -> shown (no play); GSAP+ScrollTrigger required for scroll; window.__LAB_OK__ on init"
  - "asset-substitution gate: a line-art compass-rose ornament + a tracked kicker + a giant serif Cyrillic title + warm-paper palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the section in: the compass-rose ornament draws itself + scales up, then the kicker, the giant serif title, the body and the framed CTA settle in sequence. Scroll-into-view reveal (not a pin). Verify the ornament draw+scale, the kicker->title->body->CTA order, + fps. The ornament sits at the top of the section — scroll so it's in frame to screenshot it."
note: |
  Brick 4 of the r1864 harvest — the 'how sections announce themselves' ornament (the user
  explicitly wanted this). A thin line-art compass-rose / quatrefoil that draws + scales + fades
  in, then a kicker -> giant serif title -> body -> framed CTA stagger. Related to
  circular-ui-language (EVER) but used as a section-OPENER, and distinct from monogram-ring-loader
  (a loader) and venn-ring-portal-reveal (a portal transition). stroke-dashoffset + transform +
  opacity = GPU-cheap. owns_pin false. Proven on the 'В САМОМ СЕРДЦЕ МОСКВЫ' beat: ornament draws
  + scales 0.55->1, kicker/title/body/CTA stagger, 0.2% jank @ 59.9fps, zero console errors. The
  ornament has two scales in r1864 (the big compass-rose + a small quatrefoil-in-square on
  /history) — same engine, swap the SVG art. Serif = Playfair Display (Didot/Bodoni class).
---

# compass-rose-section-divider — a line-art ornament draws + scales in as a section announces itself

r1864's section-announce: a thin line-art compass-rose / quatrefoil ornament that draws + scales
+ fades in, sitting above a tracked kicker, a giant serif title, body, and a framed CTA. The
neoclassical "new chapter" opener.

## Markup + call
```html
<section class="crd-stage" id="divider">
  <svg class="crd-rose" viewBox="0 0 100 100">
    <line data-draw x1="50" y1="2" x2="50" y2="22"/> <!-- N ray; + S/E/W -->
    <circle data-draw cx="50" cy="38" r="13"/>        <!-- quatrefoil: 4 overlapping circles -->
    <circle data-draw cx="50" cy="50" r="3"/>         <!-- centre dot -->
  </svg>
  <div class="crd-kicker">…kicker…</div>
  <h2 class="crd-title">В самом сердце<br>Москвы</h2>
  <div class="crd-body">…</div>
  <a class="crd-cta" href="#">Подробнее →</a>
</section>
```
```js
CompassRoseSectionDivider.create('#divider', { draw:true, scaleFrom:0.55, duration:1.1, manageLenis:false });
```

## Proven (the lab)
A line-art compass-rose (N/S/E/W rays + a 4-circle quatrefoil + centre dot) above "НА ЗОЛОТОМ
ОСТРОВЕ НАПРОТИВ КРЕМЛЯ" + "В САМОМ СЕРДЦЕ МОСКВЫ" + body + "ПОДРОБНЕЕ" CTA. Curve measured live
(p / rose-op / rose-scale / draw0-off / kicker / title / cta): 0 / 0 / 0.55 / 20 / 0 / 0 / 0 →
0.30 / 0.96 / 0.98 / 3 / 0 / 0 / 0 → 0.55 / 1 / 1 / 0 / 1 / 0.70 / 0 → 0.80 / 1 / 1 / 0 / 1 / 1 /
0.70 → 1 / 1 / 1 / 0 / 1 / 1 / 1. Ornament draws + scales in, then kicker/title/body/CTA stagger.
Screenshot: the quatrefoil compass-rose drawn + the serif announce (matches r1864). Probe (4× CPU
throttle): 0.2% long frames, 59.9fps → PASS. Zero console errors.
