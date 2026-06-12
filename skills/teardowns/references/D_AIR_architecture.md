# D_AIR_architecture — aircenter.space ПОВНА АРХІТЕКТУРА ✅
> Vide Infra · Tekta Group бізнес-центр AIR, Москва. Живий зонд curl, 2026-06-09.
> Доповнює [[D_AIR_location]] (карта) + [PB_visual_search](../../re-visual-search/references/PB_visual_search) + [PB_site_architecture](../../re-architecture/references/PB_site_architecture).
> Стек: SSR PHP(Symfony, EJS, /ajax/*.json) + **Locomotive Scroll** (підтверджено) + Barba.js + data-plugin реєстр. БЕЗ GSAP/Lenis/React. WebGL лише 1 (image-карусель /about).

## 1. ГЛИБИНА (sitemap.xml = 120 URL)
| Роль | К-ть | Приклади |
|---|---|---|
| **Per-office detail** `/office/AR-{b}-{n}` | **71** | /office/AR-1-1, /office/AR-2-205 |
| **Floor-selection** `/visual-search/building/N/floor/M` | **28** | b1(11 floors)+b2(17) — лише поверхи з офісами |
| Story/brand | 7 | /about /location /investment /management-service /developer /progress /panorama |
| Catalog+selection | 4 | /visual-search(генплан) /offices(фільтр-список) /parking /panorama |
| Trust/legal | 4 | /documents /user-agreement /privacy-policy /contacts |
| News | 4 | /news + 3 статті |
| Funnel/buy | 2 | /how-to-buy /how-to-buy/mortgage |
**Урок:** 120-сторінковий сайт = 71 office + 28 floor = 99 SEO-сторінок інвентаря з ОДНОГО plan-датасету.

## 2. ГОЛОВНА — 11 секцій (`data-scroll-section data-themed-class="ui-light|ui-dark"`, тема чергується)
1. Intro-logo — гігантський «AIR» = 3 окремо-анімовані SVG-літери (landingIntroLogoA/I/R), кожна parallax незалежно, sticky
2. HERO — H1 «AIR — A Premium Class A Business Center…» / «The architecture of New Success». scroll-snap у герой, sticky bg
3. Impulse — «The momentum to rise higher» — clip-reveal пара зображень, sectionToSticky pin
4. **Format** — «Three towers 14–34 floors» — **pinned counter-slideshow** (js-format-counter), image-scale, 3 sticky-шари
5. Harmony — «curved glass and radiant metal» + картка «About the project», parallax-bg під sticky-карткою
6. **Life** — «At the heart of business» + **домашня location-карта** (sticky) + метрики «1 min Mall / 3 min Metro / 7 min Downtown / 11 min Highway»
7. «Designed with people in mind» — bridge-statement
8. Courtyards — «cozy open courtyards instead of a shared podium»
9. Atmosphere spacer — full-bleed
10. Status — «facades resemble frozen waves (HAAST)» — 1/2 image-slider з лічильником, sectionToSticky pin
11. Footer — повна nav + legal + «Website by Vide Infra»

## 3. СЕКЦІЇ ПО СТОРІНКАХ
| Сторінка | scroll-sections | reveal | parallax | Підпис-елемент |
|---|---|---|---|---|
| /about | **14** | 67 | 13 | **WebGL image-карусель** (about-revolves, шейдер-дисторсія, єдиний WebGL) |
| /location | 8 | 21 | 10 | district SVG-карта з `js-transport-filter` (37 POI + 12 metro) |
| /investment | 5 | 38 | 4 | стратегія-картки **deep-link у каталог із pre-фільтром ціни** (/offices?price[from]=0&price[to]=50000000) |
| /management-service | 4 | 4 | 7 | sticky parallax service-блоки + callback |
| /how-to-buy | (500 сьогодні) | — | — | tabs accordion крок-аккордеон; mortgage sub = калькулятор |

## 4. PLAN-ПЛАГІН (одне `data-plugin="plan"` = весь продукт)
Inline SVG + JSON-маркери з `data-plan-plans` + EJS-тултіпи. ОДИН плагін живить: домашню карту, /location-карту, генплан visual-search, плани поверхів. **0 map-бібліотек** (grep mapbox|leaflet|google = 0).
- **/visual-search:** SVG `visual-search/image.svg` + JSON 71 items (3 building + 68 floor). Статус: `state:{hoverable,clickable}`, `clickable:true` ЛИШЕ коли `count>0` → 28 клікабельних floor = 28 URL. EJS: `<div class="plan-marker plan-marker--building <%- item.stateClass %>">`. Floor-tooltip: «Floor N · X offices · areaMin–areaMax м²» або «no offices available».
- **floor page:** SVG `/offices/plans/k2/floor_5/2_5.svg`, 12 office items {id,link,code,area,actualPrice,originalPrice,disabled,...}. `disabled` СВОПИТЬ тег: `<<%- office.disabled?'div':'a' %>` → продане = неклікабельний div з overlay.
- **/location:** 3 SVG-карти, 37 pin+12 metro+7 street+1 main; фільтр `js-transport-filter`; маркери plan-marker--metro/--poi/--street(rotate by data-plan-marker-angle)/--pin/--main.

## 5. UNIT-СТОРІНКА /office/AR-1-1 містить
Specs «Office №1 · 218.4 м² · Floor 7 · Building 1 · Completion 2028 · ceiling 3.94m · view Nature Park» · price «626 500 ₽/m² + 136 827 600 ₽» (struck-through + -5% badge коли знижка) · plan-tabs (Office/On-floor/Master-plan, Unfurnished|Furnished) · mini-plan-building + office-genplan · breadcrumbs · CTA «Reserve»(/ajax/booking.json) + favourite · «Similar offices» карусель (~10 карток).

## 6. ЗВʼЯЗКИ
- Header (themed, перефарбовується): About/Location/Project-management/Investment + Progress/News/Developer + CTA callback-modal.
- Footer: усі розділи + legal + «Website by Vide Infra» + ©2026 Tekta.
- **Selection flow:** /visual-search(3-building генплан) → clickable floor → /visual-search/b/N/floor/M (12 office SVG) → /office/AR-X-NN → Reserve(/ajax/booking.json) або callback(/ajax/contact.json + Comagic + reCAPTCHA). Паралель: /offices ajax-фільтр (building/area/price/sort, live-count /ajax/offices-total).
- **Cross-page shortlist:** favourite/favouriteList/favouriteCounter — серця всюди, drawer, лічильник у header, «send by email» (/ajax/offices/favourites/mail).
- **Investment funnel:** стратегія-картки deep-link із pre-set price.

## 7. СТЕК
SSR PHP-Symfony (transchoice, EJS, /ajax/*.json). Переходи: **Barba.js** (28 ref) + js-preloader. Скрол: **Locomotive Scroll** (html.has-scroll-smooth{overflow:hidden}, namespace «locomotive», data-scroll-section/sticky/snap-point, rAF + named easings). Parallax-шар: data-plugin="parallax" + named patterns (landingIntroLogoA, landingFormatImageScale, sectionToSticky...). **0:** GSAP/Lenis/Three(global)/Mapbox/Leaflet. WebGL лише /about карусель. Comagic+reCAPTCHA forms, Mindbox аналітика.

## 8. ВЕРДИКТ (5)
1. **Глибина = data-generated інвентар, не руками** — 1 plan-датасет → 3 building → 28 floor → 71 office (99 SEO-URL), кожен повністю специфікований.
2. **Один reusable SVG-plan-движок = весь продукт** — inline-SVG + JSON + EJS, 0 map-бібліотек; status = `state:{hoverable,clickable}` де clickable=count>0.
3. **Page-types:** themed-scroll-story · SVG-selection-plate · data-detail · ajax-catalog · trust/legal/news. Новий tower/floor/unit = просто нові рядки датасету.
4. **Section-types (11 домашніх):** pinned-counter-slideshow, sticky-card-over-parallax, clip-reveal-pair, image-slider-counter, sticky-map, text-reveal-editorial, theme-flip-spacer.
5. **Premium = engineered, не WebGL** — Locomotive + Barba + named-parallax реєстр + per-section перефарбування + cross-page favourites + ajax live-count. ВЕСЬ движок відтворюється БЕЗ WebGL.
