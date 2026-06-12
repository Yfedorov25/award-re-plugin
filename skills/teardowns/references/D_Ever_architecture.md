# D_Ever_architecture — ever-live-here.com ПОВНА АРХІТЕКТУРА ✅
> Vide Infra · Tekta Group, двомовний (/en+/ru). Живий зонд curl, 2026-06-09. Доповнює [PB_visual_search](../../re-visual-search/references/PB_visual_search) + [PB_site_architecture](../../re-architecture/references/PB_site_architecture).
> Стек: SSR PHP(Symfony) + jQuery + Barba.js + Locomotive Scroll + Popper.js + Owl Carousel + Splitting.js + Google Maps + **krpano** (3D-tour). БЕЗ GSAP/WebGL/React. ~400+ URL.
> EVER = НАЙКРАЩИЙ приклад dual-view (list↔plan) вибору квартир.

## 1. ГЛИБИНА (~400+ URL; robots disallow + sitemap порожній навмисно)
- **Story (4):** /en · /en/about(10 секцій) · /en/location(5) · /en/territory(10)
- **Catalog+selection:** /en/flats(LIST фільтр) · /en/visual-search(PLAN 3-level) · /en/parking-storage(plan+table dual) · /en/gallery(5 категорій) · /en/progress(frame-sequence)
- **Detail:** /en/flat/{code} (URL = unit code, напр. EV-5-5-12) · **212 unit-сторінок** (/en/api/apartments/count → 212)
- **Trust/legal/convert:** /en/developer /en/contact /en/documents /en/mortgage(калькулятор) /en/user-agreement /en/privacy-policy
- **News:** /en/news-promotions + /en/news/{slug}
- **3D-tour:** /en/3d-tour (HTTP 200, **krpano** — embedpano, .xml, swf+html5)
**Разом:** ~14 роутів + 6 building + ~33 floor/building + 212 unit + news ≈ **400+ URL**, домінують 212 unit-сторінок.

## 2. ГОЛОВНА — 7 секцій (`scroll-controller-section ui-{cold/warm/green}`)
scroll-controller-section = JS pinned/horizontal-takeover (translate3d, sticky) на Locomotive.
1. HERO `intro ui-cold-3` — H1 «Ever / Live here», 6 picture + **2 video**, js-intro-animated, tabs, CTA «View on the map»
2. Architecture `ui-cold-3` «SIMPLE SHAPES, EXPRESSIVE FINISHES» — Owl-carousel(28 pic) + js-tabs-counter + parallax + pin + custom cursor
3. Interior `ui-warm-2` «AESTHETICS COMPLEMENT COMFORT / by HAAST» — Owl + tab-synced image swap «1/3»
4. Territory `ui-green` «CONTRAST OF ARCHITECTURE AND NATURE» — суб-таби Nature/Play/Chill/Sport, 22 pic, parallax+pin+slider
5. Location `ui-warm-1` «ENJOY NATURE WITHOUT LEAVING THE CITY / 7 min Kaluzhskaya metro» — 28 pic + video, tabbed
6. **Apartments `ui-cold-2`** «READY-MADE SPACES» — **before/after image-comparison slider** (js-image-comparison-control, js-scroll-controller-ignore щоб drag не скролив секцію)
7. News+Footer `ui-background` — ajax news (js-ajax-list) + конверсійні модалки («Request a call», «Order a taxi» + «THANK YOU!») + favourites + footer-landing

## 3. СЕКЦІЇ ПО СТОРІНКАХ
| Сторінка | Секцій | Підпис-елемент |
|---|---|---|
| /en/about | 10 | pinned Owl-каруселі з лічильниками («TACTILE ARCHITECTURE», «ATMOSPHERIC LOBBY»...), ~50 img/секція |
| /en/location | 5 | **Google Map** (js-map) + pinned POI-таби; «VARIETY OF PARKS» Owl(64 img) |
| /en/territory | 10 | «playful route»+«Sports»+«ENGINEERING GENIUS» pinned parallax + counters |
| /en/gallery | 5 | категорійний lightbox (LANDSCAPING/ARCHITECTURE/COMMON AREAS/PARKING/TERRACES) |
| /en/progress | 1 | **frame-sequence ~1333 img** (камера по кварталах будівництва), scrub timeline |
| /en/parking-storage | 1 | **plan+table dual** — plan__svg (data-nr="М94") + табл. parking__row/type/number/cost (~528 рядків), parking__tabs |

## 4. FLATS + VISUAL-SEARCH (dual-view ядро) → [PB_visual_search](../../re-visual-search/references/PB_visual_search)
### (a) /en/flats — LIST
Ajax-каталог, list порожній на SSR, гідрейт із `/en/api/apartments`. form.js-ajax-filters + js-ajax-list + js-ajax-list-count-counter + js-load-more + js-filter-reset.
**Фільтр-параметри (server-defaults):** square[from/to] **24-144** м² · price[from/to] **8 258 400 - 52 994 550** ₽ · floor[from/to] **2-34** · rooms[] (1C студія,1,2,3,4,5) · building[] (1-6) · extras[] (balcony,terrace,bedroom,garden,windows,top-floor,whitebox) · sort · on-sale + exclude-reserved toggles. Слайдери = native `<input type=range class=sr-only>` стилізовані JS, data-range-formatter для ₽.
**View toggle:** selector__link (SVG #selector-list / #selector-visual) → «Plan»→/visual-search, «List»→/flats. Однаковий на обох.
**Unit schema (/en/api/apartments JSON {status,data[],total}):** id,code:«EV-5-5-12»,number,rooms:«1С»,floor,building,square:24.8,price,actualPrice,discountPrice,url:/en/flat/EV-5-5-12,isFavourited,**isReserved:true**,plan:«.../5_02r_12.svg». **Статус у LIST = boolean isReserved** + discountPrice + on-sale.

### (b) /en/visual-search — PLAN 3-level
- L1 complex: data-nr="b1".."b6" (6 building), popover #marker-b{n}
- L2 building /5: data-nr="1".."34" (33 floor), plan__back, plan__compass
- L3 floor /5/28: data-nr="1".."11" (units) → /en/flat/{code} (EV-5-5-292)
**SVG (building-5.svg, 1440×794, з building-5.original.svg через transform-svgs.js):** парний набір з тим самим data-nr:
```
<path data-nr="2" class="plan__svg__hoverable" fill="#AC7E65"/>   ← велика highlight-фігура (теракота)
<path data-nr="2" class="plan__svg__anchor" fill="#000002"/>      ← крихітний 10×10 невидимий rect = Popper-якір
```
SVG runtime-інжект через data-plan-src.
**Статус (visual-search.css):** `.plan__svg *{pointer-events:none}; g{pointer-events:auto}`; база `.hoverable{fill:#ac7e65;mix-blend-mode:multiply;opacity:0}`; available hover/active `opacity:1` + `--clickable{cursor:pointer}`; **sold `--disabled{fill:#95a3ae;opacity:1;pointer-events:none}`** (сіре мертве); **reserved `--styled-disabled{fill:#95a3ae;cursor:default}`** (видиме сіре, не клік); **filtered-out `--styled-opacity{fill:#dce2eb;opacity:.5}`** (бліде). Скоупи: .plan--main(теракота)/.plan--floors(dark #402020 @.3)/.plan--floor(сіре #95a3ae). Popper hover-popover.

### (c) list↔plan = ОДИН датасет
Обидва = проекції /en/api/apartments. Фільтр-state (square/price/floor/rooms/building/extras/on-sale/exclude-reserved) драйвить обидва: LIST re-query; PLAN toggle data-nr region `--clickable`(in-set) ↔ `--styled-opacity`(filtered-out dimmed). Кожен region/code → /en/flat/{code}. selector__link свопить проекцію, зберігаючи фільтр.

## 5. ЗВʼЯЗКИ
Header: About·Place·Territory·Gallery·How-to-buy(mortgage)·Progress·Developer·News·Contacts·**Choose apartment**(visual-search)·**Choose parking**(parking-storage)·3D-tour icon. Footer: docs/developer/news/contacts/visual-search/parking + legal. Воронка: flats/visual-search(фільтр) → region/card → /en/flat/{code} → favourites-shortlist(PDF /en/api/favourite/pdf/mail.json) + callback/taxi-модалки(/en/api/contact.json). Mortgage: калькулятор (price/payment/years слайдери, 18 data-rate програм, trade-in). Lang: /en↔/ru.

## 6. СТЕК
SSR PHP-Symfony (_token CSRF, /uploads/{hash}.pdf) + jQuery(101 $()). **Barba.js** (@barba/core, namespace) переходи. **Locomotive Scroll** (scroll-controller-section pin/horizontal). **Popper.js** (всі plan-popover). Splitting.js (heading reveal). Owl Carousel. IntersectionObserver(reveal). Google Maps JS (+Yandex marker fallback). **krpano** /3d-tour. Custom: image-comparison, gallery-lightbox, cursor, ajax-filter/list, favourites+PDF. **0 GSAP/WebGL/React.** shared.js 483KB + page bundle.

## 7. ВЕРДИКТ (5)
1. **Dual-view selection — майстерхід** — 1 датасет(212) → LIST(/flats) + PLAN(/visual-search), toggle selector__link, обидва → /flat/{code}. PLAN = 3-level SVG drill, статус = CSS-modifier на data-nr-paired hoverable/anchor. 0 canvas/WebGL, SSR, SEO-safe.
2. **`hoverable+anchor` paired-path = reusable примітив** — кожна плита (buildings/floors/units + parking/storage) той самий paired markup, ті самі `--clickable/disabled/styled-disabled/styled-opacity` + Popper до невидимого __anchor.
3. **Section-grammar робить «безкінечну» глибину дешево** — мала множина блоків (scroll-controller pinned + Owl + parallax/reveal + counter + before/after + tabbed) рекомбінується. /about=10, /territory=10, home=7. Різноманіття ілюзорне.
4. **Реальна глибина через реальні дані+frame-sequences** — 212 unit-сторінок, per-unit plan-SVG, ~1333-img progress timeline, ~528-row parking, krpano tour. Контент-маса за кінематографічним фасадом.
5. **Engineered, не важко** — 0 modern framework/WebGL; «дорогий» feel = Barba + Locomotive pin + Splitting + дисциплінований ui-cold/warm/green theming + стриманість. jQuery-era tech з award-полишем — дуже відтворюване для no-WebGL білда.
