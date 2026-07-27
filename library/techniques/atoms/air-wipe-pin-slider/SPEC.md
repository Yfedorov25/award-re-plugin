# ATOM: air-wipe-pin-slider — pinned fullbleed-слайдер із clip-швом і glass-карткою

> Закон руху, НЕ сніпет. Ролі абстрактні (data-атрибути движка): layer / stage / slide×N / text×N / count / total / ticks / card. Слайд = img АБО .isw-fill (будь-що).
> Джерело: AIR /about p18 `image-slider-sticky` + T-512 + T-M23 (знято з живого shared.js/DOM 2026-07-06). Пазл: air-iswpin-1; движок ImageSliderWipe (vanilla, нуль залежностей).
> ✅ TRANSFER-ГЕЙТ (числовий) ПРОЙДЕНО 2026-07-16: N=4 (у демо 3), слайди = CSS-градієнти (нуль фото), картка ЗЛІВА (у демо справа), serif-скін — закони M1-M7 відтворились (playwright PASS). APPROVE-око Єгора: ⬜ попереду.

## СУТЬ (одне речення)
Секція висотою `100svh + (N−1)·85svh` пінить шар, скрол мапиться в індекс кадру `idx = min(floor(p·N), N−1)`, і кожна зміна кадру = clip-wipe шов краєм-до-краю (1s ease-out) + blur-свап тексту (delay 250ms) + лічильник, що свапається НА СТАРТІ руху.

## ЧОМУ ЦЕ ПРАЦЮЄ
Шов, що фізично переїжджає екран, мозок читає як перегортання сторінки (не crossfade-«зміну слайду»); лічильник на старті = стан зрозумілий ще до кінця анімації; ticks скрабом дають безперервний зв'язок рука-екран між дискретними свапами.

## МЕХАНІКИ
- **M1 pin**: `position:sticky; top:0; height:100svh` шар; `minHeight = calc(100svh + (N−1)·85svh)` на секції; `p = clamp01(−rect.top / (h − vh))`.
- **M2 index-закон**: `want = min(floor(p·N), N−1)`; **гістерезис**: свап лише якщо `|p − boundary| > 0.015` (1.5% спану) — lerp-коливання довкола порога не дриґає кадр.
- **M3 wipe-закон** (WAAPI, подієвий — НЕ скраб): старий кадр колапсує `polygon FULL→TOP_LINE`, новий розкривається `BOTTOM_LINE→FULL` (вперед; назад — дзеркально), 1s ease-out, обидва одночасно → видима межа їде краєм-до-краю.
- **M4 text-свап**: старий текст `blur 0→10px + opacity 1→0` одразу; новий `blur 10px→0 + opacity 0→1` з delay 250ms; свап ЦІЛИМ блоком.
- **M5 counter-закон**: `counter.textContent` міняється синхронно ПЕРЕД запуском anim (на старті).
- **M6 ticks**: fill k = `translateX(−100%·(1−clamp01(p·N−k)))` — прямий transform у rAF, без transition (скраб).
- **M7 drift**: медіа 120% висоти; `ty = max(−drift, −drift·((1−entry)+exit))`, drift=16.666%; entry = вхід секції у в'юпорт, exit = останні 20% спану піна.
- **M8 mobile-режими** (touch) — ДВІ опції `mobile:`:
  · `'tap'` (default, канон live AIR /about): рух шва не переноситься — horizontal snap-стрічка, гортаєш тапом/свайпом.
  · `'scroll-pin'` (для hero-organism): pin ЗБЕРІГАЄТЬСЯ на touch, каптіон свапається ПО СКРОЛУ (не тапом),
    2-сегментний progress-bar заповнюється скрабом. iOS-перф ([[ios-perf-mobile-scroll]]): нативний scroll+rAF БЕЗ Lenis,
    `overscroll-behavior-y:none`, will-change лише під час свапу, drift off на touch.
    ✅ РЕАЛІЗОВАНО S38: `mobile:'scroll-pin'` → tapMode=false → pin-гілка на touch. Engine-дельти в build.html:
    [M9] will-change під час свапу (killAnims+goTo+onfinish знімають) · overscroll-behavior-y:none · hook `__ISW_OK__`.
    Звірено числом (playwright 390×844): mode=pin, counter свап на progress=0.53 (поріг 0.5), pin тримає layer.top=0,
    реверс симетричний, handoff чистий (visibility). Прийнято Єгором S38 (борд BOARD-b3-v2). CD-конверт: `_cd-scroll-pin/`.
    tap-гілка НЕ зламана (канон для інших сайтів).
- **M9 reduced-motion**: свапи миттєві (класи), drift вимкнено.

## COUPLING / SCROLL-WINDOW
Гібрид: ticks+index+drift = scrub (прямий p); сам wipe+text = подієві WAAPI-твіни, запущені порогом. Вікно = весь pin-band; пороги свапів на k/N спану.

## ІНВАРІАНТИ ЗАКОНУ
step 85svh/кадр; мапінг M2 з гістерезисом 1.5%; wipe 1s ease-out полігонами (не inset — WAAPI інтерполює однакову кількість вершин); text-delay 250ms; counter на старті; drift 16.666%. Параметри движка (stepSvh, wipeMs, blurPx, driftPct…) — опції; скін картки/слайдів — фасад.

## TRANSFER-ДОКАЗ (2026-07-16)
`_transfer-tests/iswpin-terra.html` (порт 8820): 4 «пори доби» градієнтами, картка зліва. Playwright-гейт: minHeight `100svh+255svh` = (4−1)·85 ✓ (N-генералізація); counter 1→2→3→4, swaps=3 ✓; idx@p: .289→1, .639→2, .99→3 (= floor(p·4)) ✓; clip-анімації бігли ✓; drift у [−16.666, 0] ✓; goTo(0) → counter «1» синхронно (M5 ✓).

## ФАЙЛИ
`build.html` = transfer-білд (TERRA-фасад, N=4). Оригінальний пазл: `KAI/GALLERY-DRAFT/02-section-compositions/about-air-batch1/air-isw-fullbleed-pin.html` (там же еталонний скін AIR).
