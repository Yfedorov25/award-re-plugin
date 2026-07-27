# ATOM: air-flash-drill (B6) — чорний flash: свап екранів РІВНО під повним покриттям + FLIP-число

> Закон = T-530 (реєстр; desktop-тайминг наживо не знятий — «чесна прогалина» RECIPE). Движок-прародич:
> `award-re-plugin/library/components/funnel-curtain/` (mode 'flash'); curtain-пресет (T-M29,
> 1200/180/1050 + wordmark-рядок) задокументований коментарем у білді, НЕ збудований.
> Кліпи: `AIR-REF--visual-search-drill.mp4` (flash) + `AIR-REF--funnel-curtain.mp4` (curtain, моб).
> BUILD: CD batch-3, RAW 0 фіксів. ✅~ блоковий вердикт Єгора С33-4.

## СУТЬ
play(swapFn): чорна панель opacity 0→1 (220ms) → hold 60ms, swapFn ТІЛЬКИ тут → 1→0 (320ms);
bezier(.7,0,.3,1) обидва боки; вхідний рівень scale 1.02→1 settle 400ms; число поверху летить
FLIP-клоном (first-rect ДО покриття, 0.6s E) з клікнутої плити в сайдбар; назад — той самий ритуал.

## ІНВАРІАНТИ
Кадр НІКОЛИ не показує обидва рівні (per-rAF доведено: свап на op=0.999, 0 кадрів з двома);
double-fire guard (повторні кліки повертають той самий promise); мертві плити = нуль хендлерів;
FLIP-клон знімається по фінішу, фінальне число = реальний DOM; reduced-motion = instant swap.

## ГЕЙТИ (С33-3, 10/10 на RAW + per-rAF flash-framestep.mjs)
mid-cover/swap-under-cover/exclusive-levels · finished · flip-lifecycle · back-reverse ·
double-fire (3 кліки=1 перехід) · dead-inert · 0 errors · reduced-instant.

## §КАЛІБРУВАТИ
Сумарно 600ms (220/60/320 з мого промпта) vs реєстрові ~450ms — вирішує око Єгора.

## ФАЙЛИ
`build.html` = cd-b3/air-b3-flash-drill.html (PORT ELV-фасад, RAW).
