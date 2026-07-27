# ATOM: scrub-carousel-2slide — pinned-heading + scroll-scrub crossfade N слайдів

> Закон руху, НЕ сніпет. Ролі АБСТРАКТНІ: heading (ЗАПІНЕНИЙ поза карткою) / card-mask (нерухома
> рамка) / slide[N] (фото, стековані) / caption[N] (текст, синхронно зі слайдом) / bars[N] (прогрес).
> Джерело правди: springs frozen-music M6, блок 11 (Rich Interior Life). Донор коду: `atoms/
> frozen-music/variants/frozen-music-a.html` L92-108 (markup) + L254-262 (holdD-crossfade).
>
> **extends: `slider-cycle`** з новим `swapMode:'crossfade'` (замість канонічного wipe-up) +
> `progressBars:true` + `headingOutsideMask:true`. springs-mobile атом (390×844).

## СУТЬ (одне речення)
Заголовок ЗАПІНЕНИЙ і не рухається; всередині нерухомої картки-рамки N слайдів (фото+текст)
перемикаються синхронним opacity-CROSSFADE'ом по ЛОКАЛЬНОМУ прогресу скролу (не wipe-up, не
авто-таймер), з ken-burns на утримуваному слайді і прогрес-барами внизу фото.

## ЧОМУ ЦЕ ПРАЦЮЄ
Заповнений заголовок поза карткою робить його «темою розділу», а не підписом слайда — картка під
ним відчувається як вікно, що показує різні кімнати однієї теми. Crossfade (не wipe) читається як
«те саме місце, інший ракурс», м'якше за різкий wipe для інтер'єрів. Scroll-scrub (реверсивний) дає
користувачу керування темпом — слайд слухається пальця, а не таймера.

## НОВА ЦЕГЛИНА (чим відрізняється від slider-cycle)
1. **swapMode crossfade замість wipe-up**: slider-cycle M3 жорстко — «новий слайд заходить wipe-up
   знизу (clip 100%→0%); НІКОЛИ не crossfade». Тут навпаки: opacity двох стекованих шарів =
   f(локального scrub-прогресу), обидва co-composite у переході (як media-step-switch: no blank).
2. **heading поза маскою (pinned)**: у slider-cycle nav/лічильник керує; тут ЗАГОЛОВОК запінений
   зовні картки, слайди міняються всередині — heading не бере участі в циклі.
3. **progress-bars**: N тонких барів внизу фото, активний яскравіший — чиста f(index/scrub).

## МЕХАНІКИ (весь механізм)
- **M1 pin-band**: `.pin-wrap{height:(N+1)*100vh}`; `.stage{sticky;top:0;height:100vh}`. hold 0..1.
- **M2 card-mask**: `.card{position:absolute;overflow:hidden}` НЕ рухається весь цикл. Слайди
  (`.slide-a`,`.slide-b`) абсолютно стековані всередині.
- **M3 scrub-crossfade**: `cf = ease(clamp((hold−a)/b,0,1))`. `slide-a.opacity=1−cf`,
  `slide-b.opacity=cf`; caption-a/caption-b синхронно тим самим cf. Реверсивно (скраб).
- **M4 ken-burns**: `backgroundPosition` (або inner scale) кожного слайда повзе з hold —
  утримуваний слайд живий, не заморожений. Рамка статична.
- **M5 progress-bars**: bar[0] яскравий при cf<0.5, bar[1] при cf≥0.5 (чиста f(cf)).
- **M6 pinned-heading**: заголовок `position:absolute` поза `.card`; не анімується (тема розділу).
- **M7 reduced-motion**: crossfade миттєвий (перший слайд visible); heading static.

## ІНВАРІАНТИ ЗАКОНУ
Heading запінений поза карткою (не рухається); card-рамка нерухома; слайди — CROSSFADE (opacity,
не wipe, не cut); crossfade = f(локального scrub-прогресу) реверсивно (не таймер); фото+текст
синхронно; ken-burns на утримуваному; прогрес-бари = f(index). N слайдів, копі, фото, палітра — фасад.

## РОЗКАДРОВКА (springs-темп, SECTION-MAP M6 блок 11; hold 0..1, N=2)
| hold | стан |
|---|---|
| 0.00→0.35 | hold slide A (фото A + текст A; bar[0] активний); ken-burns повзе |
| 0.35→0.65 | scrub-crossfade A→B (opacity перехрест на ~0.5); caption свапає синхронно |
| 0.65→1.00 | hold slide B (фото B + текст B; bar[1] активний) |

## TRANSFER-ГЕЙТ (acceptance; умова (а) = ЧУЖИЙ фасад)
1. heading НЕ рухається: heading.top на hold 0.1 == на hold 0.9 (Δ≤1px) — запінений поза карткою.
2. card-mask НЕ рухається: card.top на hold 0.1 == на hold 0.9 (Δ≤1px).
3. scrub-crossfade: на hold 0.15 slide-a.op≈1, slide-b.op≈0; на hold 0.85 навпаки (перехрест).
4. caption синхронно: caption-a.op трекає slide-a.op (Δ≤0.1 на семплах).
5. Реверсивність: телепорт hold 0.85→0.15 повертає slide-a.op≈1 (скраб, не одноразовий таймер).
6. progress-bars: активний бар свапається на переході (bar[0] яскравий на hold 0.15, bar[1] на 0.85).
7. Хук `window.__CAROUSEL_OK__=true`; 0 console-errors; scrollWidth−clientWidth==0 на 390px.
8. **ЧУЖИЙ фасад**: build.html — не-springs (інші «інтер'єри» dummy-градієнтами, інша копі/палітра).

## ФАЙЛИ
`build.html` = self-contained, dummy-фасад (2 чужі «кімнати» градієнтами під заголовком уявного
бренду). Гейт: `../../../scripts/atom-gate.mjs scrub-carousel-2slide`.
§КАЛІБРУВАТИ: пороги crossfade (0.35/0.65) знято з springs 2fps; springs-факт «подвійний реверс
A→B→A→B корелює з напрямом скролу» = скраб (не таймер) — при збірці брати springs фото+копі.
