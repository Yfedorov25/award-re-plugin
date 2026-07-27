# INNER-CONTENT-MAP — нутро секцій springs (Topic Map фази «повна репліка»)

> S27: Єгор спитав «а всередині секцій щось ще має бути?» — LIVE-DOM підтвердив: ТАК, кожна секція
> має суттєве нутро понад шов+акт-момент, які ми зробили. Це Topic Map для фази поглиблення.
> Джерело: live-DOM скан `[class*=l-]` + `/tmp/inner-map.mjs` (S27). ЗАКОН: будувати нутро секція-за-
> секцією, LIVE-FIRST (зняти живий рух каруселі/слайдера ПЕРШ ніж будувати). Пам'ять [[live-first-before-visual]].

## Що зроблено vs що в live (аудит глибини)

| Секція | Шов/акт (зроблено) | НУТРО в live (треба добудувати) | Слайдів (DOM) |
|---|---|---|---|
| Hero/Gallery | ✅ мозаїка SO-1 | rotated masked reel (є) | — |
| Intro | ⚠️ край у SO-1 | «Open the doors of Springs…» + 7 img | 0 |
| **Wellness** | лише слово «Wellness» | **карусель 4 категорії: Spa · Yoga · Fitness · Café** (фото+підпис кожна) | 6 |
| **Nature** | заголовок+копі | 3 слайди, «Lightness of Breathing», «Essence of Contemplation», 14 img | 3 |
| Place | ✅ одометр 3/9/16 SO-3 | бігова сцена + одометр (є) | 0 |
| **Map** | статична крем-карта SO-4 | **інтерактивна карта** (map-eng, піни Nature Park/embankment/MIBC) | 0 |
| **Residences** | scatter-картки SO-5 | **3 типи-картки: Flats (138, ≤3.1m, «Search flats») · Townhouses (5, ≤4.1m, «Available soon») · Penthouses (7, Green terraces)** | 16 |
| **Interiors** | 1 фото+слово SO-6/7 | **слайдер 5 кадрів (thumb 1-5)** + Quadro Room × UNIQ Development копі | 9 |
| Footer | ✅ SO-7 | лого+legal (є) | — |
| **Callback** | ⬜ | **CTA-форма** (табли, поля, 20 кнопок) — модалка | — |
| **Favorites** | ⬜ | обране (список, 12 кнопок) — модалка | — |

## Точні дані нутра (live, для побудови — НЕ з голови)

### Wellness — карусель
Категорії по порядку: **Spa · Yoga · Fitness · Café** (можливо ще; DOM дав 4 підписи, 6 «слайдів» =
4 категорії + дублі). Кожна = full-bleed фото + назва категорії. Перемикання по скролу (pinned carousel).
Асети шукати: `.asset-cache` `*wellness*slider*` / `2.wellness_*`.

### Residences — 3 картки-типи (точні стати з live)
- **Flats:** «Designer finishings», **138 panoramic view flats**, **up to 3.1 m Ceiling height**, CTA «Search flats»
- **Townhouses:** «Private patios», **5 townhouses**, **up to 4.1 m Ceiling height**, CTA «Available soon»
- **Penthouses:** «Green terraces», **7 Penthouses**, up to 4.1 m Ceiling height, CTA «Available soon»
Асети: `6.residences_*` / `6.design_*` (рендери будівлі).

### Interiors — слайдер 5 кадрів
Thumbs 1-5 (`8.interiors_interiors-thumb-1..5`), full-slides `interiors-slider-1..5`. Копі: «The acclaimed
**Quadro Room** studio collaborated with **UNIQ Development**… Muted palette, arched portals, smooth
curves. Refinement is the new luxury.» Thumb-навігація (клік/скрол міняє великий кадр).

### Map — інтерактивна карта
Асет `5.map/map-eng@xxl.webp` (680×416) + `map-xs-eng` (mobile 680×800). Копі «Easy access to Nature
Park. Landscapes of watercolor tenderness that belong only to you.» Піни: Nature Park, embankment, MIBC
(з SO-3 одометра). SO-4 зробив статичну крем-карту — треба піни+інтерактив.

### Nature — 3 слайди
«Lightness of Breathing», «Essence of Contemplation» (Place-intro), 14 зображень. Slider.

## Порядок побудови (LIVE-FIRST кожна)
1. **Wellness-карусель** (чіткий скоуп: 4 категорії) — ПЕРШИЙ, еталон методу нутра.
2. Residences-картки (найбагатше, 3 типи + стати + CTA).
3. Interiors-слайдер (5 кадрів + thumb-нав).
4. Map-піни (інтерактив).
5. Nature-слайди.
6. Callback+Favorites модалки (окремо, overlay).

Кожна: (1) CDP-capture живого руху нутра; (2) DOM+асети; (3) RESEARCH «чому»; (4) build у відповідний
SO-index (розширити наявний, не новий файл); (5) функц.гейт; (6) visual-parity ≤ self-floor; (7) регенерувати композит.
