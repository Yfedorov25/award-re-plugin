---
id: funnel-curtain
name: "Чорна wordmark-штора фунела + дріл-flash (AIR-ритуал)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника (прототип-перший)
entry:
  call: "FunnelCurtain.create(opts)  // opts усі опційні: { wordmark ('AIR'), repeat (2 — «A I R A I R»), bg ('#111110'), ink ('#f4f2ee'), riseMs (1200), holdMs (180), exitMs (1050), flashMs (450), zIndex (15) }. Використання: fc.play(swapFn) — фунел-ритуал; fc.play(swapFn, 'flash') — T-530 дріл-блимок. swapFn кличеться РІВНО під повним покриттям."
  module: iife
  returns: "{ play(swapFn, mode) → Promise, destroy, gate }  (reduced-motion: swapFn одразу, нуль штори)"
meaning:
  what: "Брендовий ритуал входу у фунел (T-M29): ЧОРНА панель їде знизу→вгору, на її ВЕРХНІЙ КРОМЦІ їде розведений рядок wordmark (повторений, justify-space-between) ~1.2s → повне покриття (свап сторінки рівно тут) → панель продовжує вгору, знизу відкривається нова сторінка ~1.05s; разом ~2.4s (тірдаун-вікно 2.2–2.5s). T-530 (desktop, між рівнями дрілу) = та сама машина, пресет flash ~0.45s без wordmark. Easing = сімейний перехідний bezier(.7,0,.3,1) — той самий, що прелоадер."
  when: "Вхід у продажний фунел (CHOOSE AN OFFICE / ОБРАТИ КВАРТИРУ) — головний конверсійний перехід сайту отримує ДОВШИЙ брендовий ритуал, контраст зі швидкою білою міжсторінковою шторою T-M22 (~0.5s). Flash-режим: перемикання рівнів visual-search дрілу (комплекс → поверх → юніт) на десктопі."
  lands: "Тап у фунел відчувається як ПОРІГ: бренд-рядок на кромці чорної хвилі підіймається, накриває, і нова сторінка відкривається знизу — жест «переступив у інший простір». Дріл-flash тримає той самий чорний ритм, але блимком — рівні дрілу міняються різко і впевнено, без очікування."
  not_when: "Звичайні міжсторінкові переходи (там T-M22 біла штора ~0.5s — легша). Перше завантаження (там preloader-logo-convoy). Unit→unit handoff (там SIMILAR OFFICES press-state без штори — закон тірдауна). Не класти два ритуали поспіль (anti-combo)."
source:
  grammar: "AIR T-M29: чорна панель + розведений рядок «A I R A I R» на кромці, підйом ~1.2s, повний ритуал ~2.2–2.5s (dense tr-05..32, виміряно по кадрах відео власника); T-530: «короткий чорний flash між рівнями дрілу» (реєстр; desktop-тайминг не знятий — flashMs 450 = чесна оцінка, дозйомка уточнить); міжсторінковий транзит-прелоадер AIR у DOM = ui-dark панель (підтверджує чорну штору)"
  recording: "skills/teardowns/references/D_AIR_mobile_video.md §Р2 (dense tr-05..32)"
  registry_ref: ["T-530", "T-M29"]
stack: "vanilla, нуль залежностей (2 transition-кроки transform, свап-колбек під покриттям)"
webgl: false
motion_props: [transform]
trigger: "програмний play() на тап CTA/зміну рівня дрілу; НЕ скрол"
timing_layer: [B-entrance]
owns_pin: false
page_beat: [conversion]
combines_with: [preloader-logo-convoy, text-blur-reveal]
anti_combos: [second-preloader, double-ritual]
gated_by: [R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "панель їде ЗНИЗУ→ВГОРУ двома transition-кроками (translateY 100%→0→−100%), transform ТІЛЬКИ (D4 чистий), нуль layout-зсувів (CLS < 0.1)"
  - "розведений рядок wordmark×repeat живе на ВЕРХНІЙ КРОМЦІ панелі (перша літера біля лівого краю, остання біля правого) і їде РАЗОМ з нею — нуль окремих твінів"
  - "swapFn кличеться РІВНО під повним покриттям (top панелі ≤ 0) — глядач ніколи не бачить підміну"
  - "повний фунел-ритуал 2.2–2.5s (rise ~1.2s + hold + exit ~1.05s); flash-режим ~0.45s"
  - "easing = сімейний bezier(.7,0,.3,1) на обох кроках (одна мова з прелоадером)"
  - "панель після ритуалу ЗНІМАЄТЬСЯ з DOM; паралельні play() ігноруються (одна штора за раз)"
  - "reduced-motion: swapFn одразу, штора не монтується взагалі"
---

# funnel-curtain — поріг фунела як брендовий жест

Третій юніт «КІНО»-рами: головний конверсійний перехід (вхід у вибір
квартири/офіса) отримує найдовший ритуал сайту — чорна хвиля з
бренд-рядком на кромці. Дріл-flash (T-530) — та сама машина на
швидкому пресеті, щоб рівні visual-search мінялись у тій самій мові.

```html
<button id="cta">ОБРАТИ КВАРТИРУ ✛</button>
<script>
  var fc = FunnelCurtain.create({ wordmark: 'ДІМ' });
  cta.addEventListener('click', function () {
    fc.play(function () { router.go('/offices'); });      // фунел-ритуал
  });
  // між рівнями дрілу:
  fc.play(function () { drill.showFloor(7); }, 'flash');  // T-530
</script>
```

Чесна прогалина: desktop-тайминг T-530 не знятий наживо (реєстр каже
лише «короткий чорний flash») — flashMs 450 = оцінка, дозйомка дрілу
на десктопі уточнить і збереже/зрушить число.
