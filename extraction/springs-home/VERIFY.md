# VERIFY — build-spec (архів) vs живий https://springs.estate/

- Дата: 2026-07-10T19:24:29.504Z
- Секції: **hero-gallery** (desktop-hero: h1 "Splendor of Renewal" + сітка js-gallery-item) · **intro** (sticky-інтро (на desktop видимий варіант без is-hidden--lg-up... якщо є); mobile-hero) · **wellness** (контентна: окремі desktop (is-hidden--md-down) і mobile (is-hidden--lg-up) DOM-варіанти — беремо ВИДИМИЙ)
- Метод: той самий SNAPSHOT_FN на обох; без скролу живого; reveal нормалізовано NORMALIZE_CSS + WAAPI finish(); lazy-фото форс-довантажені; класи фільтруються через ПЕРЕТИН множин класів архіву й живого.
- ⚠️ Метрики «забруднені» анімацією (порівнюються в нормалізованому стані): opacity, transform.
- ЧИСЛОВИЙ ГЕЙТ: ≥95% (точно ≤0.1px або ≤1px) на кожному вʼюпорті.

## desktop (1440x900) — **97.1%** ✅ PASS

Метрик всього: 7826 · точно (≤0.1): 7600 · в межах 1px: 0 · розійшлося числом (>1px): 160 · розійшлося рядком: 66

### hero-gallery — 96%

Зматчено: 136 (архів 136 / живе 188) · лише-в-архіві: 0 · лише-в-живому: 10 · метрик 4934 · розійшлося 195

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| hero-gallery>div>div[17] l-gallery__item | box.x | -762.3 | 1422.9 | -2185.2 |
| hero-gallery>div>div[17]>div is-hidden--sm-down | box.x | -735.3 | 1449.9 | -2185.2 |
| hero-gallery>div>div[17]>div>picture is-invis… | box.x | -735.3 | 1449.9 | -2185.2 |
| hero-gallery>div>div[17]>div>picture>img  | box.x | -735.3 | 1449.9 | -2185.2 |
| hero-gallery>div>div[16]>div is-hidden--sm-down | box.x | -735.3 | 1132.1 | -1867.4 |
| hero-gallery>div>div[16]>div>picture is-invis… | box.x | -735.3 | 1132.1 | -1867.4 |
| hero-gallery>div>div[16]>div>picture>img  | box.x | -735.3 | 1132.1 | -1867.4 |
| hero-gallery>div>div[16] l-gallery__item | box.x | -762.3 | 1105 | -1867.3 |
| hero-gallery>div>div[7] l-gallery__item | box.x | 1272 | -573.3 | 1845.3 |
| hero-gallery>div>div[7]>div is-hidden--sm-down | box.x | 1299 | -546.3 | 1845.3 |
| hero-gallery>div>div[7]>div>picture is-invisi… | box.x | 1299 | -546.3 | 1845.3 |
| hero-gallery>div>div[7]>div>picture>img  | box.x | 1299 | -546.3 | 1845.3 |
| hero-gallery>div>div[5] l-gallery__item | box.x | -762.3 | 984.4 | -1746.7 |
| hero-gallery>div>div[5]>div is-hidden--sm-down | box.x | -735.3 | 1011.4 | -1746.7 |
| hero-gallery>div>div[5]>div>picture is-invisi… | box.x | -735.3 | 1011.4 | -1746.7 |

Лише в живому: `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`

### intro — 98.2%

Зматчено: 28 (архів 28 / живе 28) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 1016 · розійшлося 18

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| intro>div>div[3]>picture>img  | box.h | 900 | 1080 | -180 |
| intro>div>div[5]>picture>img  | box.h | 900 | 1080 | -180 |
| intro>div>div[3]>picture>img  | box.w | 720 | 864 | -144 |
| intro>div>div[5]>picture>img  | box.w | 720 | 864 | -144 |
| intro>div>div[3]>picture>img  | box.y | 0 | -90 | 90 |
| intro>div>div[5]>picture>img  | box.y | 0 | -90 | 90 |
| intro>div>div[3]>picture>img  | box.x | 720 | 648 | 72 |
| intro>div>div[5]>picture>img  | box.x | 720 | 648 | 72 |
| intro>div sticky__layer | position | sticky | relative | ≠ |
| intro>div sticky__layer | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| intro>div>div l-intro__opening | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| intro>div>div[2]>div  | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| intro>div>div[2]>div>div>img is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| intro>div>div[3]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| intro>div>div[3]>picture>img  | transform ⚠️anim | none | matrix(1.2, 0, 0, 1.2, 0, 0) | ≠ |


### wellness — 99.3%

Зматчено: 52 (архів 52 / живе 52) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 1876 · розійшлося 13

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| wellness>div sticky__layer | position | sticky | relative | ≠ |
| wellness>div sticky__layer | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| wellness>div>div>div>div[1]>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| wellness>div>div[1]>div>div>div>div>picture i… | opacity ⚠️anim | 0 | 1 | ≠ |
| wellness>div>div[1]>div>div>div>div[1] is-hidden | position | relative | absolute | ≠ |
| wellness>div>div[1]>div>div>div>div[1]>pictur… | opacity ⚠️anim | 0 | 1 | ≠ |
| wellness>div>div[1]>div>div>div>div[2] is-hidden | position | relative | absolute | ≠ |
| wellness>div>div[1]>div>div>div>div[2]>pictur… | opacity ⚠️anim | 0 | 1 | ≠ |
| wellness>div>div[1]>div>div>div>div[3] is-hidden | position | relative | absolute | ≠ |
| wellness>div>div[1]>div>div>div>div[3]>pictur… | opacity ⚠️anim | 0 | 1 | ≠ |
| wellness>div>div[1]>div[1]>div>div[1]>div[1] … | position | relative | absolute | ≠ |
| wellness>div>div[1]>div[1]>div>div[1]>div[2] … | position | relative | absolute | ≠ |
| wellness>div>div[1]>div[1]>div>div[1]>div[3] … | position | relative | absolute | ≠ |


## mobile (390x844) — **96.4%** ✅ PASS

Метрик всього: 5874 · точно (≤0.1): 5660 · в межах 1px: 0 · розійшлося числом (>1px): 168 · розійшлося рядком: 46

### hero-gallery — 96%

Зматчено: 136 (архів 136 / живе 188) · лише-в-архіві: 0 · лише-в-живому: 10 · метрик 4934 · розійшлося 199

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| hero-gallery>div>div[14] l-gallery__item | box.x | -622.9 | 612.4 | -1235.3 |
| hero-gallery>div>div[14]>div[1] is-hidden--md-up | box.x | -609.4 | 625.9 | -1235.3 |
| hero-gallery>div>div[14]>div[1]>picture is-in… | box.x | -609.4 | 625.9 | -1235.3 |
| hero-gallery>div>div[14]>div[1]>picture>img  | box.x | -609.4 | 625.9 | -1235.3 |
| hero-gallery>div>div[13] l-gallery__item | box.x | -622.9 | 440.2 | -1063.1 |
| hero-gallery>div>div[13]>div[1] is-hidden--md-up | box.x | -609.4 | 453.7 | -1063.1 |
| hero-gallery>div>div[13]>div[1]>picture is-in… | box.x | -609.4 | 453.7 | -1063.1 |
| hero-gallery>div>div[13]>div[1]>picture>img  | box.x | -609.4 | 453.7 | -1063.1 |
| hero-gallery>div>div[11]>div[1] is-hidden--md-up | box.x | 458.1 | -593.1 | 1051.2 |
| hero-gallery>div>div[11]>div[1]>picture is-in… | box.x | 458.1 | -593.1 | 1051.2 |
| hero-gallery>div>div[11]>div[1]>picture>img  | box.x | 458.1 | -593.1 | 1051.2 |
| hero-gallery>div>div[11] l-gallery__item | box.x | 444.5 | -606.6 | 1051.1 |
| hero-gallery>div>div[2] l-gallery__item | box.x | -622.9 | 374.8 | -997.7 |
| hero-gallery>div>div[2]>div[1] is-hidden--md-up | box.x | -609.4 | 388.3 | -997.7 |
| hero-gallery>div>div[2]>div[1]>picture is-inv… | box.x | -609.4 | 388.3 | -997.7 |

Лише в живому: `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`

### intro — 99.7%

Зматчено: 10 (архів 10 / живе 10) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 362 · розійшлося 1

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| intro>div>div>div>img is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### wellness — 97.6%

Зматчено: 16 (архів 16 / живе 16) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 578 · розійшлося 14

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| wellness>div>div>div>div background | box.h | 844 | 1012.8 | -168.8 |
| wellness>div>div>div>div>picture is-invisible… | box.h | 844 | 1012.8 | -168.8 |
| wellness>div>div>div>div>picture>img  | box.h | 844 | 1012.8 | -168.8 |
| wellness>div>div>div>div background | box.y | 0 | -84.4 | 84.4 |
| wellness>div>div>div>div>picture is-invisible… | box.y | 0 | -84.4 | 84.4 |
| wellness>div>div>div>div>picture>img  | box.y | 0 | -84.4 | 84.4 |
| wellness>div>div>div>div background | box.w | 390 | 468 | -78 |
| wellness>div>div>div>div>picture is-invisible… | box.w | 390 | 468 | -78 |
| wellness>div>div>div>div>picture>img  | box.w | 390 | 468 | -78 |
| wellness>div>div>div>div background | box.x | 0 | -39 | 39 |
| wellness>div>div>div>div>picture is-invisible… | box.x | 0 | -39 | 39 |
| wellness>div>div>div>div>picture>img  | box.x | 0 | -39 | 39 |
| wellness>div>div>div>div background | transform ⚠️anim | none | matrix(1.2, 0, 0, 1.2, 0, 0) | ≠ |
| wellness>div>div>div>div>picture is-invisible… | opacity ⚠️anim | 0 | 1 | ≠ |


## Вердикт

✅ Гейт ≥95% пройдено на всіх вʼюпортах.

**Числа:** desktop 97.1% / mobile 96.4% (гейт 95%; AIR-еталон v0: 96.5/99.7).
Всі 6 пар секція×вʼюпорт ≥96%: hero-gallery 96.0/96.0 · intro 98.2/99.7 · wellness 99.3/97.6.
Зматчено 100% архівних елементів (136/28/52 desktop, 136/10/16 mobile).

**Природа залишкових розбіжностей (все — JS-рантайм, юрисдикція animation-map, НЕ статичної спеки):**
1. `box.x/box.y` hero-gallery (~140 метрик) — живий JS розкладає js-gallery-item по треку каруселі;
   в архіві (JS off) вони в природній сітці. Розкладку в русі знімає animation-map.
2. `position: sticky → relative` на `.sticky__layer` — Locomotive замінює CSS-sticky своїм
   transform-стікі в рантаймі.
3. `position: relative → absolute` на прихованих слайдах слайдерів — движок contentAnimation
   абсолютизує неактивні слайди.
4. `opacity/transform` на `is-invisible--js` (⚠️anim) — стан appear-плагіна, нормалізація
   покриває data-reveal, але не цей клас (сховані до появи у вʼюпорті).
5. `img.naturalW` розбіжності — live віддає інші розміри через media/cache ресайзер залежно
   від моменту завантаження; src збігаються.

**Що добудовано в екстракторі під час фікс-циклу (2 ітерації, обидві результативні):**
- симетричний перетин класів архів∩живе в сигнатурі матчингу + позиційний fallback
  (рантайм і ДОДАЄ класи, і ЗНІМАЄ їх — `is-invisible--js`);
- активація lazy: `data-src`/`data-srcset` при `srcset`-заглушці `data:svg` на `<img>` І `<source>`;
- нормалізація `--cookie-height: 0` (mobile 803 vs 844 — це був cookie-банер, не лейаут).
