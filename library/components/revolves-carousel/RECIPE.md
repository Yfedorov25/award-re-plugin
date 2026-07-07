---
id: revolves-carousel
name: "T-119 desktop: slide-push карусель /about (виправлення №8)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "RevolvesCarousel.create(root, opts?)  // root: [data-rvc-stage]>[data-rvc-slide]×N + [data-rvc-thumbs] + [data-rvc-prev/next] + [data-rvc-count/total]. opts: { swapMs (1100), gapPx (20), parallaxPct (6), touchMq }"
  module: iife
  returns: "{ go(i), next(), prev(), index(), gate, destroy } (touch: { mode:'strip' } — нативна snap-стрічка)"
meaning:
  what: "Живий desktop-свап каруселі /about (самостійна дозйомка 2026-07-06, виправлення інтерпретації №8): SLIDE-PUSH — старий кадр їде вліво, новий заходить справа, між ними білий ҐЕП 20px; фото всередині кожного кадру КОНТРПАРАЛАКСИТЬ (відстає від треку, сім'я imageSliderImage); 1.1s air-крива. Морфу немає — WebGL живого лише рендерив текстури. Лічильник свапається на старті; thumbnails з активним станом; на тачі — жива mobile-scrollable стрічка."
  when: "Фото-карусель одного середовища на сторінках /about-типу; будь-де, де оригінал мав «шейдерну» карусель (насправді трекову)."
  lands: "Кадри їдуть як вагони з проміжком світла між ними, а сцена всередині кожного вікна трохи відстає — плівкове відчуття глибини без жодного шейдера."
  not_when: "Пін-слайдер зі скролом (це image-slider-wipe/T-512). Понад ~6 слайдів."
source:
  grammar: "живий desktop /about (recon-20260706/carousel-midslide.jpg: трек + ґеп + контрпаралакс); стрілки = cursor-зони T-432 (js-carousel-next display:none); T-M23 лишається для моб-стрічки"
  recording: "AIR-REF--about-carousel-desktop.mp4 (самостійна дозйомка headless 2026-07-06) + MOBILE-air-2.mp4 t54.5–63.5 (моб)"
  registry_ref: ["T-119", "T-M23"]
stack: "vanilla, нуль залежностей (WAAPI transform-only подіями)"
webgl: false
motion_props: [transform]
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
  - "свап: вхідний translateX(calc(±100%±gap)→0), вихідний дзеркально; ҐЕП у польоті = 20px ±6; 1.1s air-крива; нуль clip-path/blur"
  - "контрпаралакс: фото обох кадрів мають transform у польоті (±6%, запас img 112%)"
  - "лічильник на старті; thumbnails активний стан; клік thumb = go(i)"
  - "prev: вхідний заходить ЗЛІВА (напрям чесний)"
  - "touch: rvc-strip (snap 76vw, бокові падінги, фото 100%); reduced: миттєві свапи"
  - "нуль CLS; errors 0; destroy() чистить"
---

# revolves-carousel — живий slide-push (перебудовано за дозйомкою)

Перший юніт Спринту-6; перебудований у Спринті-7 після самостійної
дозйомки живого desktop (clip+blur був інтерпретацією з мобільних
кадрів — виправлення №8). Історія перекладу T-M23 лишається в
моб-стрічці та системному blur-reveal /about.
