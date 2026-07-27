# ATOM: cream-pin-swap-stack (amenities-ivy) 📱🧬 — блок 09 · v3 (S48, конвеєр ради S47)

> Закон РУХУ (scroll-driven, pinned stage). Джерело: `CHOREO.md` v4 (CLAIMS з zonetrack +
> «ЗАКОН РУХУ v2» з густого виміру 324 кадрів) + `reference/ivy-live.zonetrack.json`
> (клас З LIVE = pin+swap). Ітерації 1-2 S47 ХИБНІ (negative-etalons/, довічні).
> ✅ СТАТУС: ПРИЙНЯТО ОКОМ ЄГОРА (S49, «так, тепер ідеально», після 2 ітерацій S49).
> expectations.json ЗАМОРОЖЕНІ (зміна = нове рішення Єгора). Атом №1 вікна «труба залатана».

## СУТЬ (одне речення)

PIN-стейдж на cream (#f5e8d1): 3 фото-картки в полях приходять ЗНИЗУ і НАКРИВАЮТЬ одна одну
СТОСОМ (стара стоїть, її верх визирає ззаду), а центрований Victor Serif заголовок міняє
текст НА МІСЦІ крос-фейдом (pod → playground → yoga → шов у mosaic).

## ФАЗИ render(p) (шлях через чекпоінти live; паузи руки НЕ копіюємо, закон live-tempo-nonlinear)

- **Ф1 стенд-1 (p 0.00–0.26):** pod-картка + «Sit down to read…» стоять [src: zonetrack
  f104-127 STANDS]; з p 0.21 pod починає власний recede (ще непомітний, τ^1.35).
- **Ф2 cover №1 (p 0.26–0.38):** playground їде знизу ОДНИМ ходом у слот 43dvh,
  ПАРАЛЕЛЬНО pod тане [src: zonetrack f128-190 COVERED-BY:bottom (enter-continuation
  merge S49-b); густий вимір: pod тане з f130]. Всередині swap №1 заголовка
  (p 0.30–0.38) [src: zonetrack ink 19→0→11, f147-150].
- **Ф4 swap №2 (p 0.49–0.57):** «Bring the little ones…» → «Meditate on our softest lawns»
  [src: zonetrack f222-227, ink 29→0→18]; playground з 0.44 вже тане (live: з f212).
- **Ф5 cover №2 (p 0.58–0.70):** yoga знизу ОДНИМ ходом; ПАРАЛЕЛЬНО двоє старших тануть;
  ззаду видно ДВА верхи [src: zonetrack f232-263 COVERED-BY:bottom (merge); live f264].
- **Ф6 (p 0.70–1.0):** ВСІ ТРИ тануть разом (recede кожної триває) [src: густий вимір
  f264-308]; yoga ty-плато ~43dvh (її recede щойно народився, під eps).
- **Ф7 swap №3 = шов у mosaic (p 0.78–0.90):** «Meditate…» → «Springs creates a mosaic of
  beautiful reality.» на місці [src: zonetrack f282-286, ink 20→2→13]. Стейдж не рухається;
  вихід секції дає сторінка (краї-TRAVELS у паритеті обрізаються).

## МЕХАНІКИ

- **M1 pin-stage**: `.wrap{height:~340vh}` + `.stage{position:sticky;top:0;height:100dvh}`.
- **M2 стос карток PERSPECTIVE-DRIFT v2 (ГУСТИЙ вимір S49-b, 324 кадри)**: 3 квадратні
  картки в ОДНОМУ слоті ~43dvh (фото в cream-полях), z-index 2<3<4; origin top center.
  Дві фази на картку:
  (а) в'їзд знизу ОДНИМ безперервним ходом прямо в слот (scale 1, без проміжних посадок);
  (б) після посадки (beat ~0.06 p) ВЛАСНИЙ БЕЗПЕРЕРВНИЙ recede-у-даль до кінця атома:
  вгору dy = 10.9·τ^1.35 dvh + вужчання ds = 0.33·τ^1.45 (power-law ease-in; спільна
  крива: pod Δ7.8dvh/Δs0.226 @τ0.79 · playground Δ4.8/0.13 @τ0.56 · yoga Δ1.6/0.036
  @τ0.24). Recede стартує ЩЕ ДО приходу наступної (live: pod з f130, playground з f212);
  під час в'їзду нової старші тануть ПАРАЛЕЛЬНО; після третьої всі три тануть РАЗОМ.
  [🔴 три виправлення ока Єгора: НЕ застиглий розмір (іт.1), НЕ різкі сходинки (іт.2),
   НЕ статичні доводки/докрутки (S49: «докрутки» = хвости в'їзду, розрізані паузами руки)]
- **M3 title-swap**: один div, text-align:center, Victor Serif spr-ink; крос-фейд через opacity
  (out 0.4 вікна → підміна → in 0.6 вікна). Кегль 22px [src: вимір S47 brightness 5.8% ≈ наш 5.6%].
- **M4 (скасовано S49-b)**: докруток стосу НЕ ІСНУЄ — див. M2(б) і CHOREO «ЗАКОН РУХУ v2».
- **M5 хедер**: dark-on-cream (spr-ink на cream), статичний.

## ІНВАРІАНТИ

Заголовок НІКОЛИ не міняє позицію (drift < eps3, тільки opacity+текст); старі картки НІКОЛИ
не рухаються під час cover (drift < eps3); нова картка ЗАВЖДИ з-під низу екрана; cream-канва
весь час; render(p) чиста функція.

## АСЕТИ (наші higgsfield, звірені оком у S47)

`variants/assets/ivy-pod.webp` · `ivy-playground.webp` · `ivy-yoga.webp` (4:5, у полях).

## ТЕКСТИ (verbatim live)

«Sit down to read under ivy-covered awning» / «Bring the little ones to a landscaped
playground» / «Meditate on our softest lawns» / «Springs creates a mosaic of beautiful
reality.» (останній = шов у блок 10). Підписи на фото: «PERMANENT OUTDOOR RECREATION SPACES»
/ «VIDEO-MONITORED PLAYGROUNDS» / «PORTABLE OUTDOOR FURNITURE».

## ГЕЙТ / ЗВІРКА

- `node scripts/zone-track.mjs --atom amenities-ivy` вже прогнано (клас pin+swap; це референт).
- `node scripts/self-check.mjs --atom amenities-ivy`: structure-parity МУСИТЬ дати
  title [SWAPS×3] і card [COVERED-BY] після trim країв (обидва cover зливаються зі своїми
  хвостами в'їзду enter-continuation merge і колапсуються як сусіди; S49-b); mechanic-class
  config=pin+swap=live. Пороги ledger v5 (підписано S48).
- Самозвірка оком (B20) ДО показу; приймання = ОКО Єгора на `variants/compare.html`.
