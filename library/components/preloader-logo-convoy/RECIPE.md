---
id: preloader-logo-convoy
name: "Прелоадер конвой-wordmark + вхід панелей (AIR-ритуал)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника (прототип-перший)
entry:
  call: "PreloaderLogoConvoy.create(opts)  // opts усі опційні: { wordmark ('AIR'), target (body), bg ('#f4f2ee'), ink ('#111110'), duration (2s — живий CSS AIR), auto (true: прогрес = img-декоди + load), minShowMs (900, анти-блимання), sessionOnce (false) }. Вхідні елементи сторінки маркуються: [data-plc-top] хедер згори, [data-plc-bottom] низ знизу, [data-plc-text] текст +20px."
  module: iife
  returns: "{ setProgress(p), done(), overlay, gate, destroy }  (або { static:true } у reduced-motion / sessionOnce-повторі — оверлей не монтується взагалі)"
meaning:
  what: "Брендовий ритуал входу AIR (T-524): фіксований оверлей з КОНВОЄМ із 3 копій wordmark, що їдуть екраном різними швидкостями під прогрес завантаження (зсуви 76.6% / 38.5% / 0, p_half = min(1, 2p)) + прогрес-бар 2px. На готовності: вихід оверлея 2s cubic-bezier(.7,0,.3,1) СИНХРОННО з «роз'їздом панелей» — хедер в'їжджає згори (−100%→0), низ сторінки знизу (+100%→0), текст осідає з +20px. Один bezier на всі стадії. Знято дослівно з живого global.css aircenter.space."
  when: "Перше завантаження лендінга/головної будь-якого сайту сім'ї: прелоадер = перша фраза бренду і хореограф уваги (глядач дивиться на екран, коли hero проявляється — reveal-канон T-322 більше не грає в порожнечу). T-M22-initial: та сама механіка на мобільному (3 проходи тикера)."
  lands: "Завантаження відчувається як задум, не як очікування: wordmark тричі проходить кадром у різному темпі (паралакс-глибина без 3D), тонкий бар чесно каже скільки лишилось, і сторінка не «з'являється», а РОЗ'ЇЖДЖАЄТЬСЯ з-за країв одним диханням з відходом оверлея."
  not_when: "Повторні заходи в межах сесії (sessionOnce) і внутрішні переходи сторінок — там T-M22-шов (одна біла штора знизу, окремий атом) або T-520-стек. Не для сторінок каталогу/фунела (там T-530/T-M29 чорна штора — інший ритуал). Reduced-motion = нуль оверлея взагалі."
source:
  grammar: "AIR T-524: конвой = .preloader--landing .preloader__content-logo--1/2/3 (зсуви 76.6/38.5/0), бар = .preloader__progress, вихід = .animation--fade-out 2s, вхід = .animation--preloader-top-in/-bottom-in/-text-in (−100% / +100% / 20px, 2s той самий bezier) — знято з живого global.css 2026-07-06; мобільне підтвердження = D_AIR_mobile_video pre-01..30 («zoom-тикер wordmark, 3 проходи»)"
  recording: "aircenter.space global.css (live-CSS extraction) + skills/teardowns/references/D_AIR_mobile_video.md §1"
  registry_ref: ["T-524", "T-M22"]
stack: "vanilla, нуль залежностей (стадія A = прямий style.transform-рендер; стадії B/C = CSS transition)"
webgl: false
motion_props: [transform, opacity]
trigger: "прогрес завантаження (img.decode() + window load), НЕ скрол; done() можна кликати вручну (auto:false)"
timing_layer: [B-entrance]
owns_pin: false
page_beat: [hero]
combines_with: [text-blur-reveal, spread-row-headline, theme-tween]
anti_combos: [second-preloader]
gated_by: [R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "конвой = 3 копії wordmark зі зсувами 76.6% / 38.5% / 0 (p_half = min(1,2p)), усі сходяться на p=1 — формули живого CSS AIR дослівно"
  - "рух = transform + opacity ТІЛЬКИ (D4 чистий); драйвер стадії A = прогрес ЗАВАНТАЖЕННЯ, не скрол"
  - "вихід оверлея і в'їзд панелей СИНХРОННІ, 2s, ОДИН bezier(.7,0,.3,1) на всі стадії (закон «одне дихання»)"
  - "завіса РОЗЧИНЯЄТЬСЯ ВСЯ (opacity всього оверлея → 0), вхід сторінки видимий КРІЗЬ неї: mid-flight оверлей напівпрозорий І хедер уже в кадрі. Гасити лише контент = глуха завіса і page-pop одним кадром (баг-урок відео власника 2026-07-06)"
  - "вхідні елементи ([data-plc-top/-bottom/-text]) паркуються до першого кадру і повертаються на identity після входу; інлайн-стилі знімаються"
  - "оверлей після виходу ЗНІМАЄТЬСЯ з DOM повністю (нуль постійної ваги); повторний вхід за sessionOnce не монтує його взагалі"
  - "no-JS не бачить оверлей ніколи (він будується JS-ом); reduced-motion = static-гілка без прелоадера і без парковки"
  - "анти-блимання: minShowMs гарантує мінімальний показ на швидкому кеші"
  - "нуль layout-зсувів: CLS < 0.1 упродовж усього ритуалу (парковки — transform, не layout)"
---

# preloader-logo-convoy — брендовий ритуал входу AIR

Перший юніт «КІНО»-рами, який хореографує УВАГУ: глядач дивиться на
екран у момент, коли hero проявляється — reveal-канон (T-322) більше
не грає в порожнечу під час завантаження вкладки.

```html
<header data-plc-top>…</header>
<section class="hero">
  <h1 data-plc-text>Заголовок</h1>
</section>
<section class="below" data-plc-bottom>…</section>
<script>
  PreloaderLogoConvoy.create({ wordmark: 'ДІМ', sessionOnce: true });
</script>
```

Джерело правди — живий CSS AIR (не прозовий реєстр): конвой-формули,
2s-тайминг і bezier(.7,0,.3,1) перенесені дослівно. Реєстрова проза
«top/bottom панелі роз'їжджаються» виявилась ВХОДОМ СТОРІНКИ
(header/content-in), а не панелями самого оверлея — виправлено тут
і зафіксовано в T-524.
