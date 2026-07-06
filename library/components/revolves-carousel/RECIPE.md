---
id: revolves-carousel
name: "T-119-переклад: карусель /about без шейдера (clip+scale+blur)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "RevolvesCarousel.create(root, opts?)  // root: [data-rvc-stage]>[data-rvc-slide]×N + [data-rvc-thumbs] + [data-rvc-prev/next] + [data-rvc-count/total]. opts: { swapMs (1000), blurPx (8), scaleFrom (1.06), touchMq }"
  module: iife
  returns: "{ go(i), next(), prev(), index(), gate, destroy } (touch: { mode:'strip' } — нативна snap-стрічка)"
meaning:
  what: "Переклад ЄДИНОЇ WebGL-каруселі /about (carouselWebGl, UV-дисторсія) на CSS за законом no-WebGL і приписом реєстру («clip+scale переклад»): вхідне фото проходить кадром clip-хвилею за напрямом (inset L→R / R→L) з посадкою scale 1.06→1 і blur 8→0 (компенсація дисторсії — закон T-M23), вихідне тихо осідає (scale 0.97 + fade). 1s ease-out (жива сім'я свапів). Лічильник свапається на старті; thumbnails з активним станом; на тачі — жива mobile-scrollable стрічка."
  when: "Фото-карусель одного середовища на сторінках /about-типу; будь-де, де оригінал мав шейдерний свап."
  lands: "Кадр міняється як подих скла: нова картинка входить хвилею зліва, різкішає в русі й сідає на місце — око читає це як дисторсію, хоча жодного шейдера нема."
  not_when: "Пін-слайдер зі скролом (це image-slider-wipe/T-512). Понад ~6 слайдів."
source:
  grammar: "реєстр T-119 (переклад clip+scale) + T-M23 (blur-компенсація); живі факти /about у live-archive (carouselWebGl images 1176×672, thumbnails, mobile-scrollable)"
  recording: "MOBILE-air-2.mp4 t54.5–63.5 (карусель наживо; desktop-шейдер НЕ знятий — діра дозйомки)"
  registry_ref: ["T-119", "T-M23"]
stack: "vanilla, нуль залежностей (WAAPI clip/scale/blur подіями)"
webgl: false
motion_props: [clip-path, transform, filter, opacity]
trigger: "клік стрілок/thumbnails (подієво); моб — нативний свайп"
timing_layer: [B-swap]
owns_pin: false
page_beat: [material]
combines_with: [text-blur-reveal, theme-tween, air-menu-overlay]
anti_combos: []
gated_by: [R_perf_limits, R_no_webgl]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "свап: вхідне clip inset за напрямом + scale 1.06→1 + blur 8→0; вихідне scale 0.97 + fade; 1s ease-out; по завершенні кліпи зняті"
  - "лічильник на старті; thumbnails активний стан; клік thumb = go(i)"
  - "prev: клип з ПРОТИЛЕЖНОГО краю (напрям чесний)"
  - "touch: rvc-strip (snap 76vw, бокові падінги); reduced: миттєві свапи"
  - "нуль CLS; errors 0; destroy() чистить"
---

# revolves-carousel — дисторсія без шейдера

Перший юніт Спринту-6. Desktop-оригінал шейдера НЕ знятий (Desktop-air
не заходив на /about) — у список дозйомки; вердикт по моб-парі + оку.
