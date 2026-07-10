# VERIFY — build-spec (архів) vs живий https://springs.estate/

- Дата: 2026-07-10T20:14:24.551Z
- Секції: **hero-gallery** (desktop-hero: h1 "Splendor of Renewal" + сітка js-gallery-item) · **intro** (sticky-інтро (на desktop видимий варіант без is-hidden--lg-up... якщо є); mobile-hero) · **wellness** (контентна: окремі desktop (is-hidden--md-down) і mobile (is-hidden--lg-up) DOM-варіанти — беремо ВИДИМИЙ) · **nature** (окремі desktop (is-hidden--md-down) і mobile (is-hidden--lg-up) корені — перший видимий) · **place-bg** (сценографія place: bg-item/gradient/caption (WebGL-підкладка living map)) · **place** (desktop: .l-place sticky__layer усередині l-nature-bg; mobile: окремий .l-place-mobile) · **place-video** (desktop: sticky-контейнер відео; mobile: перший ВИДИМИЙ .l-place-video (в l-place-mobile)) · **map** (два корені (is-hidden--md-down / is-hidden--lg-up) — перший видимий) · **design-1** (слайд design #1 (id="design"), desktop+mobile варіанти) · **design-2** (слайд design #2) · **design-3** (слайд design #3) · **design-4** (слайд design #4 існує ЛИШЕ mobile (is-hidden--lg-up, без desktop-варіанта)) · **residences** (desktop: єдиний .l-residences; mobile: webgl-контейнер (окремий корінь)) · **residences-slider** (mobile-слайдер residences (на desktop цей контент всередині .l-residences)) · **interiors** (desktop: єдиний .l-interiors; mobile: інтро-блок (окремий корінь is-hidden--lg-up)) · **interiors-slider** (mobile-слайдер interiors (на desktop цей контент всередині .l-interiors)) · **header** (sticky-хедер ui-dark header--landing (2 ноди — перший видимий)) · **footer** (футер section--no-overflow ui-dark) · **callback** (форма callback У МОДАЛЦІ — знято з preCss(modal-open); одометр animation-map) · **favorites** (улюблені У МОДАЛЦІ — знято з preCss(modal-open))
- Метод: той самий SNAPSHOT_FN на обох; без скролу живого; reveal нормалізовано NORMALIZE_CSS + WAAPI finish(); lazy-фото форс-довантажені; класи фільтруються через ПЕРЕТИН множин класів архіву й живого.
- ⚠️ Метрики «забруднені» анімацією (порівнюються в нормалізованому стані): opacity, transform.
- ЧИСЛОВИЙ ГЕЙТ: ≥95% (точно ≤0.1px або ≤1px) на кожному вʼюпорті.

## desktop (1440x900) — **99.5%** ✅ PASS

Метрик всього: 26754 · точно (≤0.1): 26607 · в межах 1px: 0 · розійшлося числом (>1px): 36 · розійшлося рядком: 111

### hero-gallery — 99.5%

Зматчено: 136 (архів 136 / живе 188) · лише-в-архіві: 0 · лише-в-живому: 10 · метрик 4934 · розійшлося 24

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| hero-gallery>div>div>div>picture is-invisible… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[1]>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[2]>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[3]>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[4]>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[5]>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[6]>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[7]>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[8]>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[9]>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[10]>div>picture is-invis… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[11]>div>picture is-invis… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[12]>div>picture is-invis… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[13]>div>picture is-invis… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[14]>div>picture is-invis… | opacity ⚠️anim | 0 | 1 | ≠ |

Лише в живому: `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`

### intro — 99.6%

Зматчено: 28 (архів 28 / живе 28) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 1016 · розійшлося 4

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| intro>div sticky__layer | position | sticky | relative | ≠ |
| intro>div>div[2]>div>div>img is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| intro>div>div[3]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| intro>div>div[5]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### wellness — 99.4%

Зматчено: 52 (архів 52 / живе 52) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 1876 · розійшлося 12

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| wellness>div sticky__layer | position | sticky | relative | ≠ |
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


### nature — 99.5%

Зматчено: 88 (архів 88 / живе 88) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 3178 · розійшлося 17

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| nature>div[1]>div>div[2]>div[2]>div>div[1] l-… | box.x | 359.1 | 720 | -360.9 |
| nature>div[1]>div>div[2]>div[2]>div>div[1]>di… | box.x | 359.1 | 720 | -360.9 |
| nature>div[1]>div>div[2]>div[2]>div>div[1]>di… | box.x | 359.1 | 720 | -360.9 |
| nature>div[1]>div>div[2]>div[2]>div>div[1]>di… | box.x | 359.1 | 720 | -360.9 |
| nature>div[1] sticky__layer | position | sticky | relative | ≠ |
| nature>div[1]>div>div[1]>picture is-invisible… | opacity ⚠️anim | 0 | 1 | ≠ |
| nature>div[1]>div>div[2]>div[1]>picture is-in… | opacity ⚠️anim | 0 | 1 | ≠ |
| nature>div[1]>div>div[2]>div[2]>div>div[1] l-… | transform ⚠️anim | matrix(1, 0, 0, 1, -360.922, 0) | none | ≠ |
| nature>div[1]>div>div[2]>div[2]>div>div[1]>di… | opacity ⚠️anim | 0 | 1 | ≠ |
| nature>div[1]>div[1]>div>div[1]>div>div>pictu… | opacity ⚠️anim | 0 | 1 | ≠ |
| nature>div[1]>div[2]>div>div>div>div>picture … | opacity ⚠️anim | 0 | 1 | ≠ |
| nature>div[1]>div[2]>div>div>div>div[1] is-hi… | position | relative | absolute | ≠ |
| nature>div[1]>div[2]>div>div>div>div[1]>pictu… | opacity ⚠️anim | 0 | 1 | ≠ |
| nature>div[1]>div[2]>div>div>div>div[2] is-hi… | position | relative | absolute | ≠ |
| nature>div[1]>div[2]>div>div>div>div[2]>pictu… | opacity ⚠️anim | 0 | 1 | ≠ |


### place-bg — 99.3%

Зматчено: 33 (архів 33 / живе 33) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 1194 · розійшлося 8

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| place-bg>div[2]>div[2]>div>div[1] l-place-web… | box.x | 359.1 | 720 | -360.9 |
| place-bg>div[2]>div[2]>div>div[1]>div l-place… | box.x | 359.1 | 720 | -360.9 |
| place-bg>div[2]>div[2]>div>div[1]>div>picture… | box.x | 359.1 | 720 | -360.9 |
| place-bg>div[2]>div[2]>div>div[1]>div>picture… | box.x | 359.1 | 720 | -360.9 |
| place-bg>div[1]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| place-bg>div[2]>div[1]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| place-bg>div[2]>div[2]>div>div[1] l-place-web… | transform ⚠️anim | matrix(1, 0, 0, 1, -360.922, 0) | none | ≠ |
| place-bg>div[2]>div[2]>div>div[1]>div>picture… | opacity ⚠️anim | 0 | 1 | ≠ |


### place — 100%

Зматчено: 11 (архів 11 / живе 11) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 396 · розійшлося 0


### place-video — 99.6%

Зматчено: 27 (архів 27 / живе 27) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 978 · розійшлося 4

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| place-video>div l-place-video | position | sticky | relative | ≠ |
| place-video>div>div>div>div>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| place-video>div>div>div[1]>div>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| place-video>div>div>div[2]>div>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |


### map — 99.3%

Зматчено: 11 (архів 11 / живе 11) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 400 · розійшлося 3

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| map>div sticky__layer | position | sticky | relative | ≠ |
| map>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| map>div>div[1]>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### design-1 — 99.6%

Зматчено: 13 (архів 13 / живе 13) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 470 · розійшлося 2

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| design-1>div sticky__layer | position | sticky | relative | ≠ |
| design-1>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### design-2 — 98.2%

Зматчено: 12 (архів 12 / живе 12) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 436 · розійшлося 8

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| design-2>div[1]>div[1] l-design__title | box.x | 420 | 720 | -300 |
| design-2>div[1]>div[1]>h3 "Each floor reflect… | box.x | 420 | 720 | -300 |
| design-2>div[1]>div[1] l-design__title | box.y | 372.2 | 450 | -77.8 |
| design-2>div[1]>div[1]>h3 "Each floor reflect… | box.y | 372.2 | 450 | -77.8 |
| design-2>div[1] sticky__layer | position | sticky | relative | ≠ |
| design-2>div[1]>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| design-2>div[1]>div>div[1]>picture is-invisib… | opacity ⚠️anim | 0 | 1 | ≠ |
| design-2>div[1]>div[1] l-design__title | transform ⚠️anim | matrix(1, 0, 0, 1, -299.992, -77.8047) | none | ≠ |


### design-3 — 99.2%

Зматчено: 13 (архів 13 / живе 13) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 472 · розійшлося 4

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| design-3>div>div l-design__slide-images | marginLeft | 0px | 720px | -720 |
| design-3>div sticky__layer | position | sticky | relative | ≠ |
| design-3>div>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| design-3>div[1]>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### residences — 99.6%

Зматчено: 71 (архів 71 / живе 71) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 2564 · розійшлося 9

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| residences>div[1]>div>div>div l-residences__c… | box.w | 12 | 0 | 12 |
| residences>div sticky__layer | position | sticky | relative | ≠ |
| residences>div>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| residences>div>div[1]>div>picture is-invisibl… | opacity ⚠️anim | 0 | 1 | ≠ |
| residences>div>div[2]>div>picture is-invisibl… | opacity ⚠️anim | 0 | 1 | ≠ |
| residences>div>div[3]>div>picture is-invisibl… | opacity ⚠️anim | 0 | 1 | ≠ |
| residences>div[1] sticky__layer | position | sticky | relative | ≠ |
| residences>div[1]>div>div[1]>div>div[1] ui-ba… | position | relative | absolute | ≠ |
| residences>div[1]>div>div[1]>div>div[2] ui-ba… | position | relative | absolute | ≠ |


### interiors — 98.9%

Зматчено: 42 (архів 42 / живе 42) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 1526 · розійшлося 17

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| interiors l-interiors | gridTemplateRows | 3150px | 900px 2250px | ≠ |
| interiors>div sticky__layer | position | sticky | relative | ≠ |
| interiors>div>div>div[1]>picture is-invisible… | opacity ⚠️anim | 0 | 1 | ≠ |
| interiors>div>div[1]>div>div>picture is-invis… | opacity ⚠️anim | 0 | 1 | ≠ |
| interiors>div>div[1]>div>div[1] col | position | relative | absolute | ≠ |
| interiors>div>div[1]>div>div[1]>picture is-in… | opacity ⚠️anim | 0 | 1 | ≠ |
| interiors>div>div[1]>div>div[2] col | position | relative | absolute | ≠ |
| interiors>div>div[1]>div>div[2]>picture is-in… | opacity ⚠️anim | 0 | 1 | ≠ |
| interiors>div>div[1]>div>div[3] col | position | relative | absolute | ≠ |
| interiors>div>div[1]>div>div[3]>picture is-in… | opacity ⚠️anim | 0 | 1 | ≠ |
| interiors>div>div[1]>div>div[4] col | position | relative | absolute | ≠ |
| interiors>div>div[1]>div>div[4]>picture is-in… | opacity ⚠️anim | 0 | 1 | ≠ |
| interiors>div>div[1]>div[1]>div>div>img img-full | opacity ⚠️anim | 0 | 1 | ≠ |
| interiors>div>div[1]>div[1]>div>div[1]>img im… | opacity ⚠️anim | 0 | 1 | ≠ |
| interiors>div>div[1]>div[1]>div>div[2]>img im… | opacity ⚠️anim | 0 | 1 | ≠ |


### header — 99.8%

Зматчено: 51 (архів 51 / живе 54) · лише-в-архіві: 0 · лише-в-живому: 3 · метрик 1836 · розійшлося 4

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| header header | opacity ⚠️anim | 0 | 1 | ≠ |
| header>div[1]>div[1]>a>span>span[1]>span>span… | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| header>div[1]>div[1]>a[1]>span>span "Residences" | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| header>div[1]>div[3]>a[3]>span>span "Contact us" | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |

Лише в живому: `r>div[1]>div[1]>a>span>span[1]>span>span>span·btn__text·Menu`, `header>div[1]>div[1]>a[1]>span>span·btn__text·Residences`, `header>div[1]>div[3]>a[3]>span>span·btn__text·Contact us`

### footer — 99.9%

Зматчено: 28 (архів 28 / живе 28) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 1010 · розійшлося 1

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| footer section | transform ⚠️anim | none | matrix(1, 0, 0, 1, -2880, 0) | ≠ |


### callback — 99.9%

Зматчено: 90 (архів 90 / живе 93) · лише-в-архіві: 0 · лише-в-живому: 3 · метрик 3242 · розійшлося 4

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| callback>div>div[1]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| callback>div[1]>div>a>span>span "request" | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| callback>div[1]>div>a[1]>span>span "callback" | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |
| callback>div[1]>div[1]>div>form>div>div[2]>bu… | transform ⚠️anim | none | matrix(1, 0, 0, 1, 0, 0) | ≠ |

Лише в живому: `callback>div[1]>div>a>span>span·btn__text·request`, `callback>div[1]>div>a[1]>span>span·btn__text·callback`, `>form>div>div[2]>button>span>span·btn__text·submit a request`

### favorites — 97.9%

Зматчено: 34 (архів 45 / живе 36) · лише-в-архіві: 1 · лише-в-живому: 2 · метрик 1226 · розійшлося 26

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| favorites>div[1]>div[2]>div flats__empty | box.w | 0 | 780 | -780 |
| favorites>div>div[2]>div>p leading-trim | box.y | 752.9 | 0 | 752.9 |
| favorites>div[1]>div[2]>div>a[1]>span btn__co… | box.x | 0 | 616 | -616 |
| favorites>div[1]>div[2]>div flats__empty | box.x | 0 | 600 | -600 |
| favorites>div[1]>div[2]>div>div col | box.x | 0 | 600 | -600 |
| favorites>div[1]>div[2]>div>a[1] btn | box.x | 0 | 600 | -600 |
| favorites>div[1]>div[2]>div>div col | box.w | 0 | 480 | -480 |
| favorites>div>div[2]>div>p leading-trim | box.w | 360 | 0 | 360 |
| favorites>div[1]>div[2]>div>a[1] btn | box.y | 0 | 191.6 | -191.6 |
| favorites>div[1]>div[2]>div>a[1]>span btn__co… | box.y | 0 | 191.6 | -191.6 |
| favorites>div[1]>div[2]>div flats__empty | box.h | 0 | 161.6 | -161.6 |
| favorites>div[1]>div[2]>div>a[1] btn | box.w | 0 | 154.7 | -154.7 |
| favorites>div[1]>div[2]>div>div col | box.h | 0 | 131.6 | -131.6 |
| favorites>div[1]>div[2]>div>a[1]>span btn__co… | box.w | 0 | 122.7 | -122.7 |
| favorites>div>div[2]>div>p leading-trim | box.x | 60 | 0 | 60 |

Лише в архіві: `favorites>div[1]>div[2]>div[1]>ul·is-hidden·`
Лише в живому: `favorites>div[1]>div[2]>div>div>p··Here you can save your f`, `favorites>div[1]>div[2]>div>a[1]>span>span··select residence`

## mobile (390x844) — **99.4%** ✅ PASS

Метрик всього: 22194 · точно (≤0.1): 22051 · в межах 1px: 0 · розійшлося числом (>1px): 73 · розійшлося рядком: 70

### hero-gallery — 99.4%

Зматчено: 136 (архів 136 / живе 188) · лише-в-архіві: 0 · лише-в-живому: 10 · метрик 4934 · розійшлося 28

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| hero-gallery>div[1]>div[1] l-gallery__title | box.x | 152.2 | 143.2 | 9 |
| hero-gallery>div[1]>div[1] l-gallery__title | box.w | 217.8 | 226.8 | -9 |
| hero-gallery>div[1]>div[1]>h1 "Splendor of Re… | box.x | 152.2 | 143.2 | 9 |
| hero-gallery>div[1]>div[1]>h1 "Splendor of Re… | box.w | 217.8 | 226.8 | -9 |
| hero-gallery>div>div>div[1]>picture is-invisi… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[1]>div[1]>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[2]>div[1]>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[3]>div[1]>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[4]>div[1]>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[5]>div[1]>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[6]>div[1]>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[7]>div[1]>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[8]>div[1]>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[9]>div[1]>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| hero-gallery>div>div[10]>div[1]>picture is-in… | opacity ⚠️anim | 0 | 1 | ≠ |

Лише в живому: `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`, `hero-gallery>div[1]>div>p>span··`

### intro — 99.7%

Зматчено: 10 (архів 10 / живе 10) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 362 · розійшлося 1

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| intro>div>div>div>img is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### wellness — 99.8%

Зматчено: 16 (архів 16 / живе 16) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 578 · розійшлося 1

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| wellness>div>div>div>div>picture is-invisible… | opacity ⚠️anim | 0 | 1 | ≠ |


### nature — 99.8%

Зматчено: 25 (архів 25 / живе 25) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 904 · розійшлося 2

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| nature>div>div>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| nature>div>div>div[1]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### place-bg — 99.6%

Зматчено: 15 (архів 15 / живе 15) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 544 · розійшлося 2

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| place-bg>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| place-bg>div[1]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### place — 99%

Зматчено: 35 (архів 37 / живе 37) · лише-в-архіві: 1 · лише-в-живому: 1 · метрик 1266 · розійшлося 13

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| place>div>div[1]>ul>li mobile-scrollable__item | box.x | 20 | 370 | -350 |
| place>div>div[1]>ul>li>img img-cover | box.x | 20 | 370 | -350 |
| place>div>div[1]>ul>li[1] mobile-scrollable__… | box.x | 370 | 720 | -350 |
| place>div>div[1]>ul>li[1]>img img-cover | box.x | 370 | 720 | -350 |
| place>div>div>div>div>div[1] is-hidden | box.y | -7174.9 | -7197.7 | 22.8 |
| place>div>div>div>div>div[2] is-hidden | box.y | -7174.9 | -7197.7 | 22.8 |
| place>div>div>div>div>div[1] is-hidden | position | relative | absolute | ≠ |
| place>div>div>div>div>div[2] is-hidden | position | relative | absolute | ≠ |
| place>div>div[1]>ul>li>img img-cover | opacity ⚠️anim | 0 | 1 | ≠ |
| place>div>div[1]>ul>li>img img-cover | img.src | nature-slider-xs-1@xs.webp | nature-slider-xs-2@xs.webp | ≠ |
| place>div>div[1]>ul>li[1]>img img-cover | opacity ⚠️anim | 0 | 1 | ≠ |
| place>div>div[1]>ul>li[1]>img img-cover | img.src | nature-slider-xs-2@xs.webp | nature-slider-xs-3@xs.webp | ≠ |
| place>div[2]>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |

Лише в архіві: `place>div>div[1]>ul>li·mobile-scrollable__item·`
Лише в живому: `place>div>div[1]>ul>li·mobile-scrollable__item is-active·`

### place-video — 99.5%

Зматчено: 12 (архів 12 / живе 12) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 436 · розійшлося 2

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| place-video>div>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| place-video>div[1]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### map — 99.7%

Зматчено: 16 (архів 16 / живе 16) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 580 · розійшлося 2

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| map>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |
| map>div[1]>div>div[1]>div[1]>picture is-invis… | opacity ⚠️anim | 0 | 1 | ≠ |


### design-1 — 98.4%

Зматчено: 14 (архів 14 / живе 14) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 506 · розійшлося 8

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| design-1>div>div>div background | box.w | 390 | 760.5 | -370.5 |
| design-1>div>div>div>picture is-invisible--js | box.w | 390 | 760.5 | -370.5 |
| design-1>div>div>div>picture>img  | box.w | 390 | 760.5 | -370.5 |
| design-1>div>div>div background | box.x | 0 | -185.2 | 185.2 |
| design-1>div>div>div>picture is-invisible--js | box.x | 0 | -185.2 | 185.2 |
| design-1>div>div>div>picture>img  | box.x | 0 | -185.2 | 185.2 |
| design-1>div>div>div background | transform ⚠️anim | matrix(1, 0, 0, 1, -195, 0) | matrix(1, 0, 0, 1, -380.25, 0) | ≠ |
| design-1>div>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### design-2 — 98.8%

Зматчено: 12 (архів 15 / живе 15) · лише-в-архіві: 1 · лише-в-живому: 1 · метрик 434 · розійшлося 5

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| design-2>div[1]>div>ul>li mobile-scrollable__… | box.x | 20 | 370 | -350 |
| design-2>div[1]>div>ul>li>picture is-invisibl… | box.x | 20 | 370 | -350 |
| design-2>div[1]>div>ul>li>picture>img  | box.x | 20 | 370 | -350 |
| design-2>div[1]>div>ul>li>picture is-invisibl… | opacity ⚠️anim | 0 | 1 | ≠ |
| design-2>div[1]>div>ul>li>picture>img  | img.src | design-xs-1.webp | design-xs-2.webp | ≠ |

Лише в архіві: `design-2>div[1]>div>ul>li·mobile-scrollable__item·`
Лише в живому: `design-2>div[1]>div>ul>li·mobile-scrollable__item is-active·`

### design-3 — 99.5%

Зматчено: 5 (архів 5 / живе 5) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 182 · розійшлося 1

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| design-3>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### design-4 — 99.5%

Зматчено: 6 (архів 6 / живе 6) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 218 · розійшлося 1

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| design-4>div[1]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### residences — 99.6%

Зматчено: 13 (архів 13 / живе 13) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 470 · розійшлося 2

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| residences l-residences__webgl-container | gridTemplateRows | 2532px | 844px 0px 1688px | ≠ |
| residences>div>div>div>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### residences-slider — 98.5%

Зматчено: 61 (архів 64 / живе 64) · лише-в-архіві: 1 · лише-в-живому: 1 · метрик 2200 · розійшлося 32

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| residences-slider>div[1]>div>div>ul>li mobile… | box.x | 20 | 370 | -350 |
| residences-slider>div[1]>div>div>ul>li>pictur… | box.x | 20 | 370 | -350 |
| residences-slider>div[1]>div>div>ul>li>pictur… | box.x | 20 | 370 | -350 |
| residences-slider>div[1]>div>div>ul>li[1] mob… | box.x | 370 | 720 | -350 |
| residences-slider>div[1]>div>div>ul>li[1]>pic… | box.x | 370 | 720 | -350 |
| residences-slider>div[1]>div>div>ul>li[1]>pic… | box.x | 370 | 720 | -350 |
| residences-slider>div[1]>div[1]>div>div>div[1… | box.y | -17451.7 | -17474.5 | 22.8 |
| residences-slider>div[1]>div[1]>div>div>div[1… | box.y | -17451.7 | -17474.5 | 22.8 |
| residences-slider>div[1]>div[1]>div>div>div[1… | box.y | -17451.7 | -17474.5 | 22.8 |
| residences-slider>div[1]>div[1]>div>div>div[1… | box.y | -17451.7 | -17474.5 | 22.8 |
| residences-slider>div[1]>div[1]>div>div>div[1… | box.y | -17451.7 | -17474.5 | 22.8 |
| residences-slider>div[1]>div[1]>div>div>div[1… | box.y | -17451.7 | -17474.5 | 22.8 |
| residences-slider>div[1]>div[1]>div>div>div[1… | box.y | -17451.7 | -17474.5 | 22.8 |
| residences-slider>div[1]>div[1]>div>div>div[1… | box.y | -17451.7 | -17474.5 | 22.8 |
| residences-slider>div[1]>div[1]>div>div>div[1… | box.y | -17451.7 | -17474.5 | 22.8 |

Лише в архіві: `idences-slider>div[1]>div>div>ul>li·mobile-scrollable__item·`
Лише в живому: `ider>div[1]>div>div>ul>li·mobile-scrollable__item is-active·`

### interiors — 99.8%

Зматчено: 12 (архів 12 / живе 12) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 434 · розійшлося 1

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| interiors>div>div[1]>picture is-invisible--js | opacity ⚠️anim | 0 | 1 | ≠ |


### interiors-slider — 98.1%

Зматчено: 29 (архів 33 / живе 33) · лише-в-архіві: 1 · лише-в-живому: 1 · метрик 1052 · розійшлося 20

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| interiors-slider>div>div>ul>li mobile-scrolla… | box.x | 20 | 370 | -350 |
| interiors-slider>div>div>ul>li>picture is-inv… | box.x | 20 | 370 | -350 |
| interiors-slider>div>div>ul>li>picture>img  | box.x | 20 | 370 | -350 |
| interiors-slider>div>div>ul>li[1] mobile-scro… | box.x | 370 | 720 | -350 |
| interiors-slider>div>div>ul>li[1]>picture is-… | box.x | 370 | 720 | -350 |
| interiors-slider>div>div>ul>li[1]>picture>img  | box.x | 370 | 720 | -350 |
| interiors-slider>div>div>ul>li[2] mobile-scro… | box.x | 720 | 1070 | -350 |
| interiors-slider>div>div>ul>li[2]>picture is-… | box.x | 720 | 1070 | -350 |
| interiors-slider>div>div>ul>li[2]>picture>img  | box.x | 720 | 1070 | -350 |
| interiors-slider>div>div>ul>li[3] mobile-scro… | box.x | 1070 | 1420 | -350 |
| interiors-slider>div>div>ul>li[3]>picture is-… | box.x | 1070 | 1420 | -350 |
| interiors-slider>div>div>ul>li[3]>picture>img  | box.x | 1070 | 1420 | -350 |
| interiors-slider>div>div>ul>li>picture is-inv… | opacity ⚠️anim | 0 | 1 | ≠ |
| interiors-slider>div>div>ul>li>picture>img  | img.src | interiors-slider-3@xxxl.webp | interiors-slider-5@xxxl.webp | ≠ |
| interiors-slider>div>div>ul>li[1]>picture is-… | opacity ⚠️anim | 0 | 1 | ≠ |

Лише в архіві: `interiors-slider>div>div>ul>li·mobile-scrollable__item·`
Лише в живому: `iors-slider>div>div>ul>li·mobile-scrollable__item is-active·`

### header — 99.8%

Зматчено: 48 (архів 48 / живе 48) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 1728 · розійшлося 3

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| header header | opacity ⚠️anim | 0 | 1 | ≠ |
| header>div[1]>div[1]>a[1] btn | display | inline-flex | none | ≠ |
| header>div[1]>div[1]>a[2] btn | display | none | inline-flex | ≠ |


### footer — 100%

Зматчено: 28 (архів 28 / живе 28) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 1010 · розійшлося 0


### callback — 100%

Зматчено: 88 (архів 88 / живе 88) · лише-в-архіві: 0 · лише-в-живому: 0 · метрик 3168 · розійшлося 0


### favorites — 98.4%

Зматчено: 33 (архів 44 / живе 35) · лише-в-архіві: 1 · лише-в-живому: 2 · метрик 1188 · розійшлося 19

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| favorites>div[1]>div[2]>div flats__empty | box.w | 0 | 350 | -350 |
| favorites>div[1]>div[2]>div>div col | box.w | 0 | 350 | -350 |
| favorites>div[1]>div[2]>div>a[1] btn | box.w | 0 | 134.2 | -134.2 |
| favorites>div[1]>div[2]>div flats__empty | box.h | 0 | 104.3 | -104.3 |
| favorites>div[1]>div[2]>div>a[1]>span btn__co… | box.w | 0 | 102.2 | -102.2 |
| favorites>div[1]>div[2]>div>a[1] btn | box.y | 0 | 94.3 | -94.3 |
| favorites>div[1]>div[2]>div>a[1]>span btn__co… | box.y | 0 | 94.3 | -94.3 |
| favorites>div[1]>div[2]>div>div col | box.h | 0 | 74.3 | -74.3 |
| favorites>div[1]>div[2]>div>a[1]>span btn__co… | box.x | 0 | 36 | -36 |
| favorites>div[1]>div[2]>div>a[1] btn | box.h | 0 | 30 | -30 |
| favorites>div[1]>div[2]>div>a[1]>span btn__co… | box.h | 0 | 30 | -30 |
| favorites>div[1]>div[2]>div flats__empty | box.x | 0 | 20 | -20 |
| favorites>div[1]>div[2]>div flats__empty | box.y | 0 | 20 | -20 |
| favorites>div[1]>div[2]>div>div col | box.x | 0 | 20 | -20 |
| favorites>div[1]>div[2]>div>div col | box.y | 0 | 20 | -20 |

Лише в архіві: `favorites>div[1]>div[2]>div[1]>ul·is-hidden·`
Лише в живому: `favorites>div[1]>div[2]>div>div>p··Here you can save your f`, `favorites>div[1]>div[2]>div>a[1]>span>span··select residence`

## Вердикт

✅ Гейт ≥95% пройдено на всіх вʼюпортах.
