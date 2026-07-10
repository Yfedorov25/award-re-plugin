# VERIFY — build-spec (архів) vs живий aircenter.space/about

- Дата: 2026-07-10T18:11:36.068Z
- Секція: architecture-intro: <section> з h2 "Architecture of efficiency" (h2 + 2 абзаци + 3-фото sticky-слайдер)
- Метод: той самий SNAPSHOT_FN на обох; без скролу живого (computed styles/bbox-відносно-секції не залежать від видимості); reveal нормалізовано NORMALIZE_CSS + WAAPI finish(); lazy-фото форс-довантажені.
- ⚠️ Метрики «забруднені» анімацією (порівнюються в нормалізованому стані): opacity, transform.

## desktop (1440x900)

Зматчено елементів: 45 · лише-в-архіві: 0 · лише-в-живому: 0
Метрик всього: 1622 · точно (≤0.1): 1566 · в межах 1px: 0 · розійшлося числом (>1px): 48 · розійшлося рядком: 8 → **96.5% збіг**

Найбільші розбіжності:

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| section>div>div>div[2]>div>div>div>div>div>di… | box.x | 0 | 2880 | -2880 |
| section>div>div>div[2]>div>div>div>div>div>di… | box.x | 0 | 2880 | -2880 |
| section>div>div>div[2]>div>div>div>div>div>di… | box.x | 0 | 2880 | -2880 |
| section>div>div>div[2]>div>div>div>div>div>di… | box.x | 0 | 2880 | -2880 |
| section>div>div>div[2]>div>div>div>div[2]>div… | box.x | 0 | 2880 | -2880 |
| section>div>div>div[2]>div>div>div>div[2]>div… | box.x | 0 | 2880 | -2880 |
| section>div>div>div[2]>div>div>div>div>div>di… | box.y | -3990.1 | -4890.1 | 900 |
| section>div>div>div[2]>div>div>div>div>div>di… | box.y | -3990.1 | -4890.1 | 900 |
| section>div>div>div[2]>div>div>div>div>div>di… | box.y | -3990.1 | -4890.1 | 900 |
| section>div>div>div[2]>div>div>div>div>div>di… | box.y | -3990.1 | -4890.1 | 900 |
| section>div>div>div[2]>div>div>div>div[2]>div… | box.y | -3990.1 | -4890.1 | 900 |
| section>div>div>div[2]>div>div>div>div[2]>div… | box.y | -3990.1 | -4890.1 | 900 |
| section section | box.h | 3423.9 | 3873.9 | -450 |
| section>div p-relative | box.h | 3423.9 | 3873.9 | -450 |
| section>div>div container-h | box.h | 3423.9 | 3873.9 | -450 |
| section>div>div>div[2]  | box.y | 723.9 | 1173.9 | -450 |
| section>div>div>div[2]>div sticky | box.y | 723.9 | 1173.9 | -450 |
| section>div>div>div[2]>div sticky | marginTop | 0px | 450px | -450 |
| section>div>div>div[2]>div>div sticky__layer | box.y | 723.9 | 1173.9 | -450 |
| section>div>div>div[2]>div>div>div row | box.y | 813.9 | 1263.9 | -450 |

## mobile (390x844)

Зматчено елементів: 41 · лише-в-архіві: 0 · лише-в-живому: 0
Метрик всього: 1478 · точно (≤0.1): 1474 · в межах 1px: 0 · розійшлося числом (>1px): 0 · розійшлося рядком: 4 → **99.7% збіг**

Найбільші розбіжності:

| елемент | метрика | архів | живе | Δ |
|---|---|---|---|---|
| section>div>div>div[2]>div>div>div>div>div>di… | position | relative | absolute | ≠ |
| section>div>div>div[2]>div>div>div>div>div>di… | position | relative | absolute | ≠ |
| section>div>div>div[2]>div>div>div>div[2]>div… | position | relative | absolute | ≠ |
| section>div>div>div[2]>div>div>div>div[2]>div… | position | relative | absolute | ≠ |

## Вердикт

**Спека з архіву придатна для побудови без ручної розвідки: ТАК, з застереженням «JS-шар окремо».**

Числа: desktop 1566/1622 метрик точно (96.5%), mobile 1474/1478 (99.7%). Зматчено 100% елементів (45/45 desktop, 41/41 mobile), нуль «в межах 1px» — усе або збігається ТОЧНО (0.0), або розходиться через рантайм. Проміжних дрейфів немає.

**Що збіглося на 100%:** ВСЯ типографіка (font-family/size/weight/line-height/letter-spacing/text-transform), кольори, padding, display, flex/grid, border-radius, object-fit, z-index, ширини колонок, текстовий контент, шляхи фото + natural sizes. Тобто СТАТИЧНИЙ CSS-токен-шар з архіву = піксельно точний.

**Всі 60 розбіжностей = 3 JS-рантайм-кластери (не CSS):**
1. **Sticky-травел (Δ450px, ~30 метрик):** живий JS додає `margin-top:450px` на `.sticky` (скрол-травел 3-слайдового слайдера) → висота секції і всі y нижче зсунуті рівно на 450. Архів без JS цього не має.
2. **Стекінг слайдів (Δ±2880 = 2×vw, Δ±900 = 1×vh, `position relative→absolute`):** неактивні слайди 2-3 живий content-animation-плагін ставить absolute і виносить за екран. Плюс transform `matrix(…,-2880,0)` + `opacity:0` на корені секції — Locomotive/reveal скрол-стан (⚠️anim-мітка).
3. **Parallax у спокої (Δ-360 y, Δ-10 x на `image-slider-images`):** pattern `sectionToSticky` дає офсет навіть без скролу.

**Наслідок для конвеєра:** статична екстракція дає готові build-токени; ДИНАМІЧНИЙ шар (sticky-травел, стекінг слайдера, parallax-офсети) треба знімати ОКРЕМО — з data-атрибутів (`data-parallax-*`, `--items-count`) або motion-teardown, і НЕ можна брати геометрію «живого у спокої» як статичну ціль.

**Пастки, перевірені й зафіксовані:**
- Мовчазна брехня екстрактора: самоперевірки (елементи>0, `document.fonts.check('16px Onest')`, naturalWidth фото) — усі пройшли на 4/4 прогонах.
- Mobile ≠ масштабований desktop: окремий прогін 390x844 + touch-UA; mobile-дерево інше (41 vs 45 елементів) і чистіше (без sticky-травелу).
- Reveal-стан: `[data-reveal]:not([data-reveal-visible]){opacity:.005}` — нормалізовано однаковим CSS на обох; opacity/transform у звіті позначені ⚠️anim.
- Матчинг ламався на JS-стейт-класах (`content-animation--ready` на живому) — сигнатура їх ігнорує, інакше субдерево 3 фото мовчки випадало зі звірки.
- Lazy-фото на живому не завантажені поза екраном — форс-довантаження перед зніманням (naturalW/H збіглись 3/3).
