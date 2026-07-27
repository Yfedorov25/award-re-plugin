# ATOM: tap-arrow-cycle (amenities-forest) 📱🧬 — ✅ ПРИЙНЯТО оком Єгора (S45, «це вже те що треба»)

> ✅ S45 ПРИЙНЯТО на компараторі в русі після 2 раундів фіксів. Закриває блоки 07/08/11 (усі три =
> ця сама tap-arrow-cycle механіка, варіює лише layout/асети). Приймання = ОКО Єгора, не піксель-гейт.
> Фінальні фікси Єгора (раунд 2): wipe .34→.62s плавніший; стрілки 46→42px менші; наліз стрілок на
> фото усунено (photo h358, band 72px, arrows gap→photo 16px); forest-gate тепер ловить наліз назавжди.

> 🔴 S45 ВИПРАВЛЕННЯ МЕХАНІКИ (Єгор зловив): перехід НЕ crossfade opacity, а **vertical WIPE знизу-вгору**
> (нова картинка вилазить з нижнього краю фрейму, шов їде вгору, стара статична під нею). Доведено 60fps
> покадрово (179.3-180.5с, wipe-seq): park зверху зникає, layers росте знизу. Реалізовано clip-path
> inset(100% 0 0 0)→inset(0), .34s. Я раніше бачив 1 кадр накладення (f_180) і лінувато назвав crossfade,
> не витягнувши покадрову послідовність напрямку (та сама помилка [[live-first-before-visual]] — дивись РУХ).
> S45 полірування геометрії (точні виміри f_168 @390): caption font→11px (cap-height 6.7px виміряно),
> letter-spacing .11em, pitch 14px; photo ratio 0.842 (не 0.851); photo inset L20 R23 top20; gap фото→caption
> 19px; caption→низ картки 26px; стрілки 46px right-edge→card-right 20px. video-parity collisions=0 (3 стани).

> Закон РУХУ (tap-driven, discrete cycle). Джерело правди: springs.estate/amenities forest-carousel блок.
> Приймання МЕХАНІКИ = ОКО Єгора на компараторі (наш живий iframe vs live-відео).
> 🔴 МЕХАНІКА ОБРАНА ЄГОРОМ S45: борд-блокер показав, що кадри (f_168–190) доводять tap-arrow-cycle
> (одна cream-картка + стрілки + crossfade), а НЕ drag-swipe filmstrip з ТЗ ATOM 5. Єгор обрав "tap-arrow-cycle
> (як у кадрах)". Цей атом закриває блоки 07/08/11 (усі три = одна arrow-cycle механіка).

## СУТЬ (одне речення)
ОДНА велика cream-panel картка у фікс-слоті (y≈35%→88% viewport); всередині framed-фото + caps-caption
lower-left + circle-стрілки ‹ → lower-right; ТАП стрілки гортає дискретний індекс 3 слайдів ПО КОЛУ
(wrap-around); перехід між слайдами = плавний opacity-crossfade фото+підпису; горизонтальний drag теж гортає.

## МЕХАНІКИ
- **M1 fixed card slot**: `.section{padding-top:35dvh}` + card centered; card w 89.6% (349px@390), aspect 0.777
  (виміряно з f_168: cream-panel 5.2%→94.8% × 34.9%→88.2%). cream `#f3e5cb` (виміряно). radius 2px.
- **M2 framed photo**: inner margins ~20px@390 (виміряно 59px@1170) L/R/top; photo aspect 0.851 (виміряно).
- **M3 tap-cycle**: `#next`/`#prev` → idx=(idx±1+N)%N, N=3, **loop wrap-around** (2→next→0, 0→prev→2).
- **M4 crossfade (🔴)**: усі 3 `.slide` ABSOLUTE-стековані; лише активний opacity 1, решта 0; transition
  opacity .5s ease(.25,.74,.22,.99). Завжди РІВНО 1 active slide + 1 active capset (0 третій-стан). Live
  f_180 ловить накладення двох фото+двох підписів під час переходу = саме crossfade.
- **M5 caption**: capset ABSOLUTE-стек lower-left, 2 рядки caps 13px w500 ls.09 uppercase, ink `#183023`
  (dark-green), синхронний crossfade з фото. PRIVATE FOREST PARK / MULTIPLE FOREST LAYERS / NEUTRAL PALETTE OF BLOSSOMS.
- **M6 arrows**: 2 circle-buttons 46px lower-right, hairline `rgba(24,48,35,.55)`, :active tint (pressed
  state як live f_184). SVG ‹ →.
- **M7 drag**: pointerdown/up на картці (не на стрілках); |dx|>45 → свайп вліво=next, вправо=prev. Стрілки=основне.
- **M8 skrol НЕ міняє**: вертикальний скрол сторінки не чіпає індекс (доведено gate).
- **M9 reduced-motion**: transition off.

## ІНВАРІАНТИ ЗАКОНУ
Tap ‹→ (не scroll-scrub, не auto-timer) міняє дискретний індекс; loop wrap в обидва боки; crossfade
(0 третій-стан, завжди 1 active); одна фікс cream-картка (не стрічка з кількох карт); скрол не міняє.

## АСЕТИ (наші higgsfield, не springs)
3× portrait 3:4 у `variants/assets/` (nano_banana_pro 2k):
- `park.webp` — private forest park, god-rays на гравійній доріжці, кам'яна арка (≈ live f_168).
- `pine.webp` — multi-layer forest garden, високі стовбури + chartreuse папороть/juniper (≈ live f_174).
- `blossom.webp` — біла вишня макро на dark-green bokeh (≈ live f_187).

## ТЕКСТИ (verbatim з live-кадрів)
Captions: PRIVATE FOREST PARK · MULTIPLE FOREST LAYERS · NEUTRAL PALETTE OF BLOSSOMS.
Prose під карткою (serif cream): "Man-made forest garden features towering pine trees adorned with bushy
crowns, verdant juniper, and delicate clusters of fieldfares. Step out of the shimmering shade into a
forest clearing and hold the sunshine in your hands."

## ГЕЙТ / ЗВІРКА
- `scripts/forest-gate.mjs` (PASS ✅): старт idx0; tap 0→1→2; loop wrap 2→0 та 0→2; завжди 1 active
  slide+cap; скрол не міняє; drag=next; 0 err; 0 404; card ratio 0.777=live; photoRatio 0.851=live;
  card in-frame; cardTop 35% / cardBot 88.2% = live 34.9%/88.2%.
- Самозвірка ОКОМ: board /tmp/forest-shots (наш 3 стани vs live f_168/f_187) — форма/позиція/caption/arrows збіг.
- приймання МЕХАНІКИ = ОКО Єгора на компараторі `variants/compare.html`.

## ФАЙЛИ
`variants/forest.html` · `variants/compare.html` · `variants/assets/{park,pine,blossom}.webp` ·
`variants/_fonts/` · `variants/_springs-tokens.css` · `reference/forest-live.mp4`.

## ЗАКРИВАЄ БЛОКИ
07 (botanical) · 08 (forest) · 11 (forest-land slider) — усі три = ця сама tap-arrow-cycle механіка
(варіює лише layout/асети). Після приймання: параметризувати {assets[], captions[], prose} для реюзу.
