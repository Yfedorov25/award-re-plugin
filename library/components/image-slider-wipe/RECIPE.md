---
id: image-slider-wipe
name: "Пін-слайдер 1/2 з лічильником + шов-кліп (T-512) + tap-карусель (T-M23)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника (прототип-перший)
entry:
  call: "ImageSliderWipe.create(section, opts)  // section містить [data-isw-layer]>[data-isw-stage]>[data-isw-slide]×N + [data-isw-card] з [data-isw-ticks]/[data-isw-count]/[data-isw-text]×N. opts: { stepSvh (85), wipeMs (1000 — живий title=1s), wipeEase ('ease-out'), textDelayMs (250), lineStaggerMs (60), mobile ('tap'|'pin'), touchMq }"
  module: iife
  returns: "{ render(p), progress(), index(), goTo(i), gate, destroy } (tap-режим: { mode:'tap', targetFor(i) } — snap-стрічка з [← N/M →])"
meaning:
  what: "Слайдер «Status/HAAST» головної AIR (живий image-slider-sticky + contentAnimation, знято дослівно 2026-07-06): пін 100svh+(N−1)·step, скрол мапиться на індекс floor(p·N), свап фото = T-512 шов — живі polygon-кліпи imageClipIn/OutVertical (1s ease-out): старе колапсує до краю, нове розкривається від протилежного, обидві межі синхронні → ОДИН шов їде краєм-до-краю (вперед знизу↑, назад згори↓). Лічильник свапається НА СТАРТІ (живий counter-плагін: setCounter до анімацій). Прогрес-смужки 2px — безперервний translateX-fill скролом. Текст картки — blur-swap (out одразу, in delay 0.25 + 60ms/рядок). T-M23 моб: tap-карусель = живий mobileScrollable — snap-стрічка (gap 10px, item ≈9/12 колонок, snap center) + [← N/M →], тап → лічильник ОДРАЗУ → smooth-скрол ~0.4с (push справа→наліво), краї без loop."
  when: "Story-акт з 2–3 фото одного простору (Status-акт головної, headquarters-слайдер /about, лобі-слайди сторі-сторінки): фото домінує (8/12), frosted-картка тримає лічильник/текст/CTA."
  lands: "Скрол сам гортає кадри — шов переїжджає фото як лінія прибою, лічильник-гігант перемикається в ту ж мить, і рука відчуває механіку до того, як око дочитає текст. На тачі той самий ритм чесніший: тап або палець — стрічка снапається, цифра вже нова."
  not_when: "Більше ~4 слайдів (пін росте на step за кожен — скрол-податок; для довгих серій = center-focus-carousel/стрічка). Під іншим піном у тому ж біті (owns_pin). Фото різних просторів без спільного наративу (це вже галерея, не слайдер акту)."
source:
  grammar: "живий shared.js aircenter.space (витяг 2026-07-06): imageClipInVertical/OutVertical (polygon-кліпи, 1s ease-out, duration title), counter-плагін (setCounter на старті), sticky-плагін (index=floor(p·N), ticks translateX), mobileScrollable (snap + [← N/M →]); живий CSS landing.css (image-slider-sticky висоти, progress-bar 2px, card-slider)"
  recording: "MOBILE-air.mp4 (лобі-слайди glass-картки з 2 ticks) + D_AIR_mobile_video §Р2 car-13..24 (T-M23 tap push-wipe ~0.4с, лічильник на старті)"
  registry_ref: ["T-512", "T-M23"]
stack: "vanilla, нуль залежностей (CSS sticky пін + rAF-скрол-драйвер + WAAPI-кліпи; tap = нативний scroll-snap)"
webgl: false
motion_props: [clip-path, transform, filter, opacity]
trigger: "скрол: прогрес піна → індекс (свап = подієва WAAPI-анімація, не скраб); моб tap: кнопки/свайп стрічки"
timing_layer: [B-swap]
owns_pin: true
page_beat: [material, proof]
combines_with: [text-blur-reveal, theme-tween, spread-row-headline, pin-release-seam]
anti_combos: [second-pin, funnel-curtain]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "пін: шар sticky 100svh, секція 100svh+(N−1)·stepSvh; index = min(floor(p·N), N−1) — свап рівно на порозі 1/N"
  - "T-512 шов = живі кліпи: вперед старе full→лінія-вгорі, нове лінія-внизу→full (назад дзеркально); обидва 1s ease-out; по завершенні кліпи зняті, старий слайд schований"
  - "лічильник ставиться НА СТАРТІ свапу (до анімацій), формат «N» + «/ M»"
  - "ticks: безперервний fill скролом (transform-only, БЕЗ transition), реверсивний (та сама p → той самий fill ±2%)"
  - "текст: out blur(0→10)+opacity одразу; in delay 0.25s + порядковий каскад 60ms/рядок (md-up, спани розгорнуті після settle); стек у грід-клітинці — нуль CLS на свапі"
  - "tap-режим (T-M23): snap-стрічка x mandatory; тап → лічильник ОДРАЗУ → smooth-скрол у snap-ціль (слайд по центру); краї is-disabled (без loop); свайп синхронить лічильник"
  - "дрейф фото (фікс-кол 2, живий imageSliderImage ДОСЛІВНО): фото 120% висоти, translateY −16.666%→0 на вході піна і 0→−16.666% на останніх 20% спану; діапазон [−16.666, 0] — краї не оголюються; desktop-only (enableTouch:false); клас .isw-drift, gate.driftTy"
  - "reduced-motion: свапи миттєві (без кліпів/blur), лічильник і ticks живі; дрейф вимкнений"
  - "CLS < 0.1; рух = clip-path/transform/filter/opacity ТІЛЬКИ; destroy() чистить слухачі, стилі, анімації"
---

# image-slider-wipe — скрол гортає, шов ріже, цифра вже нова

Другий юніт Спринту-2. Знято з живого JS/DOM/CSS AIR дослівно —
включно з виправленням інтерпретації №7: реєстрова проза T-512 казала
«смуга з центру», живі polygon-кліпи кажуть «один шов краєм-до-краю»
(старе колапсує до краю, нове розкривається від протилежного, межі
синхронні). Вердикт власника вирішить канон.

```html
<section id="status">
  <div data-isw-layer>
    <div data-isw-stage>
      <figure data-isw-slide><img src="lobby-1.avif" alt=""></figure>
      <figure data-isw-slide><img src="lobby-2.avif" alt=""></figure>
    </div>
    <div data-isw-card class="glass">
      <div data-isw-ticks></div>
      <p><span data-isw-count>1</span><span data-isw-total>/ 2</span></p>
      <div class="texts"><p data-isw-text>…</p><p data-isw-text>…</p></div>
      <button data-isw-prev>←</button><button data-isw-next>→</button>
    </div>
  </div>
</section>
<script> ImageSliderWipe.create('#status'); </script>
```

Що лишилось за межами атома (свідомо, для зборки сторінки):
в'їзд/вихід ряду −50svh/+50svh (sectionToSticky — це сім'я
`pin-release-seam`, T-510). Внутрішній дрейф фото ±16.666%
(imageSliderImage) з фікс-кола 2 вшитий В атом (opt.driftPct,
клас .isw-drift, лише desktop).
