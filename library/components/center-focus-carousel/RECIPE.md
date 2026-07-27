---
id: center-focus-carousel
name: "Center-focus carousel (a row of vertical panels where the centre one is in focus — larger + bright + caption lit — and the sides are dimmed peek-insets; round ‹ › arrows rotate which panel is centred)"
level: 2
kind: component
status: official
entry:
  call: "CenterFocusCarousel.create(target, opts)  // target = .cfc-stage > .cfc-viewport( .cfc-rail > .cfc-panel( .cfc-panel-img + .cfc-panel-cap ) x N ) + .cfc-nav( .cfc-prev + .cfc-counter + .cfc-next ). opts: { start, sideScale, sideDim, slideDur, ease, loop, once, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), play(), next(), prev(), go(i), destroy }"
meaning:
  what: "r1864's /architecture + /comfort feature carousel — a row of vertical PANELS where the CENTRE panel is in FOCUS (scale 1 + full brightness, its caption lit) and the side panels are DIMMED peek-insets (smaller + darkened, caption hidden), with EDGE-PEEK of the neighbours; round ‹ › arrows (+ a 'N / TOTAL' counter) rotate WHICH panel is centred (the rail re-centres on it). Each panel = a full-height image + a caption at its bottom-left. On enter the panels stagger up."
  when: "A 'features / qualities' carousel where each item is a tall image with a one-word caption (lifts, glazing, engineering, security, parking) and you want one in focus at a time while the rest sit dimmed at the edges — a considered, museum-case feel rather than a flat rail. Use it for the building's amenities or architectural qualities, where focusing one at a time reads as care. Best at 5–8 panels so there's always a peek either side."
  lands: "A row of tall photographs, the middle one bright and a touch larger with its name lit at the foot, the ones either side darkened and pulled back — and the next one just peeking in. A round arrow rotates the focus along; whichever panel moves to the centre brightens and names itself while the others recede. It reads like turning the cases in a vitrine, one quality at a time."
  not_when: "A single full-bleed gallery (use fullscreen-media-carousel). A flat 'what's nearby' rail with captions under, no focus emphasis (use poi-caption-carousel). A seam-reveal split (use center-seam-split). Two-up image+stat comparison (use dual-image-split-stat). When all items should read equally at once (a focus carousel deliberately de-emphasises the sides)."
source:
  grammar: "r18641 /comfort: a row of vertical panels (ЛИФТЫ / ОСТЕКЛЕНИЕ / ИНЖЕНЕРНЫЕ СИСТЕМЫ / БЕЗОПАСНОСТЬ / СЕРВИСНОЕ ОБСЛУЖИВАНИЕ / ПАРКИНГ), each with a serif caption at its bottom-left, the centre panel emphasised + edge-peek of the next, a round ‹ 'N / 5' › counter bottom-right."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 10 of the r1864 harvest; the /comfort centre-focus feature carousel)"
  registry_ref: ["r1864-center-focus-carousel"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity, filter]
trigger: "scroll-into-view stagger (once) + a manual centre-focus carousel (arrows / drag / panel-click / dots)"
timing_layer: [B-reveal, C-carousel]
owns_pin: false
owns_scroll: false
page_beat: [features, amenities, architecture, comfort, focus-carousel]
combines_with: [compass-rose-section-divider, collection-tier-announce, masked-heritage-split, numeral-frame-expand-hero]
anti_combos: [pin, mix-blend-over-scroll]
gated_by: [R_perf_limits]
variants: [fullscreen-media-carousel, poi-caption-carousel]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a row of N vertical panels, each = .cfc-panel-img + a .cfc-panel-cap caption at its bottom-left"
  - "the CENTRE panel is in focus (scale 1 + brightness 1 + caption opacity 1); the sides are scale sideScale + brightness sideDim + caption 0, with edge-peek"
  - "on scroll-into-view the panels stagger fade + translateY 40->0; then the focus geometry applies"
  - "round ‹ › arrows (and drag / panel-click / dots) rotate the centred index: the rail re-centres on the active panel, the active brightens + names itself, the others recede; counter N/TOTAL updates; wraps unless loop:false"
  - "set(p 0..1) is a PURE scrub of the ENTER stagger; transform + opacity + filter(brightness) only; NO mix-blend / NO WebGL; owns_pin false"
  - "drag follows F-08 law; reduced-motion or <=820px -> shown (native overflow-x, equal panels); window.__LAB_OK__ on init"
  - "asset-substitution gate: tall feature images + a one-word caption each + a section heading; 5-8 panels for a peek either side"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the rail in: the panels stagger up and the CENTRE one is in focus (bright + larger + caption lit), the sides dimmed insets with edge-peek. Click ‹ ›: the focus rotates — the rail re-centres, the new centre brightens + names itself, the others recede, counter N/TOTAL updates, wraps; drag + panel-click rotate too. Verify the centre-focus emphasis, the re-centre on rotate, the counter, + fps. Scroll so the rail is centred to screenshot the focus + insets + peek."
note: |
  Brick 10 of the r1864 harvest (a VARIATION) — the /comfort centre-focus feature carousel. A row of
  tall panels with the centre one in focus (bigger + bright + caption lit) and the sides dimmed
  peek-insets; ‹ › rotates which is centred, the rail re-centring on it. Marked relatives (in
  `variants`): fullscreen-media-carousel (ONE full-bleed slide, no focus/peek) and
  poi-caption-carousel (a flat rail, no centre-focus emphasis); also distinct from center-seam-split
  (a seam-opener) and dual-image-split-stat (two-up + stat). transform + opacity + filter(brightness)
  = GPU-cheap. owns_pin false. Proven: panels stagger in, active scale(1)+brightness(1)+cap 1 while
  sides scale(0.9)+brightness(0.45)+cap 0; ‹ › rotate re-centres + re-focuses + counter; loop wrap;
  drag + panel-click; 0.54% jank @ 4x throttle; zero console errors. Photos = quadro renders (honest
  demo assets; engine takes any photos). Serif = Playfair Display (Didot/Bodoni class).
---

# center-focus-carousel — a row of panels, the middle one in focus; arrows rotate which is centred

r1864's /comfort feature carousel: a row of vertical panels where the centre one is in focus
(larger + bright + caption lit) and the sides are dimmed peek-insets; round ‹ › arrows rotate which
panel is centred, the rail re-centring on it.

## Markup + call
```html
<section class="cfc-stage" id="comfort">
  <h2 class="cfc-head">Комфорт и сервис</h2>
  <div class="cfc-viewport">
    <div class="cfc-rail">
      <div class="cfc-panel"><div class="cfc-panel-img"><img src="…"></div><div class="cfc-panel-cap">Лифты</div></div>
      <!-- … N feature panels … -->
    </div>
  </div>
  <div class="cfc-nav"><button class="cfc-prev">‹</button><span class="cfc-counter">01 / 06</span><button class="cfc-next">›</button></div>
</section>
```
```js
CenterFocusCarousel.create('#comfort', { sideScale:0.9, sideDim:0.45, loop:true, manageLenis:false });
```

## Proven (the lab)
6 feature panels ('КОМФОРТ И СЕРВИС': Лифты / Остекление / Инженерные системы / Безопасность /
Сервисное обслуживание / Паркинг). ENTER (inline opacity, p / p0 / p2 / p5): 0 / 0 / 0 / 0 → 0.5 /
1 / 0.97 / 0.49 → 1 / 1 / 1 / 1. FOCUS@0: active panel `scale(1)` + `brightness(1)` + cap 1; side
panel `scale(0.9)` + `brightness(0.45)` + cap 0; counter 01/06. AFTER next: old-active dims
(brightness 0.45, cap 0), new-active lights (brightness 1, cap 1), counter 02/06; WRAP prev `02→01`,
prev again → `06/06` (loop). Drag + panel-click rotate. Zero console errors. Smoothness (4× CPU
throttle, scroll-enter + 2 rotates): 373 frames, 0.54% long → PASS. Photos = quadro renders (honest
demo assets; engine takes any photos).
