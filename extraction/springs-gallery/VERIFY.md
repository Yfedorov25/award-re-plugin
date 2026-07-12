# VERIFY — build-spec (архів) vs живий https://springs.estate/gallery

- Дата: 2026-07-12T09:51:39.026Z
- Секції: **header** (sticky-хедер ui-dark header--sticky (той самий компонент, що home)) · **gallery** (єдина flow-секція: desktop gallery-desktop-fixed + sticky-slider--full-screen (6 img), mobile gallery-mobile-layout (6 img); h1.sr-only + btn--outline)
- Метод: той самий SNAPSHOT_FN на обох; без скролу живого; reveal нормалізовано NORMALIZE_CSS + WAAPI finish(); lazy-фото форс-довантажені; класи фільтруються через ПЕРЕТИН множин класів архіву й живого.
- ⚠️ Метрики «забруднені» анімацією (порівнюються в нормалізованому стані): opacity, transform.
- ЧИСЛОВИЙ ГЕЙТ: ≥95% (точно ≤0.1px або ≤1px) на кожному вʼюпорті.

## desktop (1440x900) — **99.5%** ✅ PASS

Метрик всього: 7509 · точно (≤0.1): 7473 · в межах 1px: 0 · розійшлося числом (>1px): 13 · розійшлося рядком: 23

### header — 99.9%

Зматчено: 49 (архів 49 / живе 52) · лише-в-архіві: 0 · лише-в-живому: 3 · метрик 2989 · розійшлося 3

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| header>div[1]>div[1]>a>span>span[1]>span>span… | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| header>div[1]>div[1]>a[1]>span>span "Residences" | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| header>div[1]>div[3]>a[2]>span>span "Contact us" | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |

Лише в живому: `r>div[1]>div[1]>a>span>span[1]>span>span>span·btn__text·Menu`, `header>div[1]>div[1]>a[1]>span>span·btn__text·Residences`, `header>div[1]>div[3]>a[2]>span>span·btn__text·Contact us`

### gallery — 99.3%

Зматчено: 74 (архів 74 / живе 74) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 4520 · розійшлося 33

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| gallery section | box.h | 900 | 2880 | -1980 |
| gallery section | height | 900px | 2880px | -1980 |
| gallery>h1 "gallery" | bottom | 900px | 2880px | -1980 |
| gallery>span[1] btn | bottom | 780px | 2760px | -1980 |
| gallery>div[2] gallery-gradient | bottom | 0px | 1980px | -1980 |
| gallery>div[3] gallery-desktop-fixed | box.h | 900 | 2880 | -1980 |
| gallery>div[3] gallery-desktop-fixed | height | 900px | 2880px | -1980 |
| gallery>div[4] sticky-slider | box.h | 900 | 2880 | -1980 |
| gallery>div[4] sticky-slider | height | 900px | 2880px | -1980 |
| gallery>div[4] sticky-slider | minHeight | 900px | 2880px | -1980 |
| gallery>div[3]>div>div[1]>div gallery-desktop… | box.w | 9 | 0 | 9 |
| gallery>div[3]>div>div[1]>div gallery-desktop… | width | 9px | 0px | 9 |
| gallery>div[3]>div>div[1]>div gallery-desktop… | right | 171px | 180px | -9 |
| gallery>div[3]>div gallery-desktop-fixed__sticky | position | sticky | relative | ≠ |
| gallery>div[3]>div gallery-desktop-fixed__sticky | right | auto | 0px | ≠ |


## mobile (390x844) — **99.9%** ✅ PASS

Метрик всього: 6960 · точно (≤0.1): 6950 · в межах 1px: 0 · розійшлося числом (>1px): 0 · розійшлося рядком: 10

### header — 100%

Зматчено: 45 (архів 45 / живе 45) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 2745 · розійшлося 0


### gallery — 99.8%

Зматчено: 69 (архів 69 / живе 69) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 4215 · розійшлося 10

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| gallery>div[3]>div>div>div>div[1] is-hidden | position | relative | absolute | ≠ |
| gallery>div[3]>div>div>div>div[2] is-hidden | position | relative | absolute | ≠ |
| gallery>div[4]>div>div>div>a>picture is-invis… | opacity ⚠️anim | 0 | 1 | ≠ |
| gallery>div[4]>div>div>div[1]>a>picture is-in… | opacity ⚠️anim | 0 | 1 | ≠ |
| gallery>div[4]>div>div>div[2]>a>picture is-in… | opacity ⚠️anim | 0 | 1 | ≠ |
| gallery>div[6]>div[1]>div>div>div>div>div  | zIndex | auto | 1 | ≠ |
| gallery>div[6]>div[1]>div>div>div>div>div[1] … | position | relative | absolute | ≠ |
| gallery>div[6]>div[1]>div>div>div>div>div[1] … | zIndex | auto | 0 | ≠ |
| gallery>div[6]>div[1]>div>div>div>div>div[2] … | position | relative | absolute | ≠ |
| gallery>div[6]>div[1]>div>div>div>div>div[2] … | zIndex | auto | 0 | ≠ |


## Вердикт

✅ Гейт ≥95% пройдено на всіх вʼюпортах.
