# D_ERA_architecture — era.estate ПОВНА АРХІТЕКТУРА (глибина сайту) ✅
> Vide Infra · Tekta Group «ERA», Москва. Живий зонд curl (SSR HTML/CSS/SVG), 2026-06-09.
> Фокус: СКІЛЬКИ сторінок, СКІЛЬКИ секцій, ЯК повʼязані. Доповнює [[PB_visual_search]] + [[PB_site_architecture]].
> Стек: БЕЗ JS-фреймворку. Custom rAF smooth-scroll (НЕ Lenis/Locomotive/GSAP) + Barba.js + Three.js (точково) + data-plugin реєстр.

## 1. ГЛИБИНА (карта URL) — ~270+ сторінок
**21 фіксований роут + ~89 floor-сторінок + 6 building + 151 unit-сторінок** (підтверджено `/api/flats/count`→151).
- **Story (10):** / · /about · /architecture · /location · /territory(благоустрій) · /gallery · /progress · /commercials · /parking-storage · /news
- **Catalog+selection (7):** /flats(фільтр-каталог) · /visual-search(SVG drill) · /3d-map(Three.js маса) · /3d-tour · /panorama · /parking-storage-list · /favourites
- **Trust/legal/detail:** /contacts · /developer · /documents · /how-to-buy · /privacy-policy · /flats/ER-{b}-{s}-{n} (unit)
**Урок глибини №1:** кожна квартира/поверх/будинок = ОКРЕМИЙ SSR-URL (індексується, шерариться). Це й є «глибина» проти one-pager.

## 2. ГОЛОВНА — 9 секцій (`<section data-scroll-section data-plugin="reveal">`, тема ui-dark↔ui-light по черзі)
1. HERO `intro-sticky` — «place of art / The place where life becomes art» — 6 шарів parallax, sticky-pin
2. Manifesto `#art-deco` «The new Art Deco era» — reveal + `visualizationLines` (self-draw лінії, WebGL) + parallax
3. Architecture intro — **149-кадрова scroll-scrub секвенція** (`data-sequence-frame-count=149`, .png.webp) + 8 parallax
4. Video band — `videoInview` (4 img + 7 video, autoplay-in-view)
5. Lifestyle `#joy` (найбільша) «Joys of every day» — carousel + **27 parallax** + 23 appear + visualizationLinesCylinder
6. Materials `#touch` «A touch of sophistication» — reveal + visualizationLinesImage
7. Interiors (light) — `carousel cursor` (custom drag-курсор) + 15 parallax
8. **Apartments `#plans`** «Select by criteria / Visual Selection» — 4 arrow-CTA → /flats та /visual-search (конверсійна передача)
9. CTA+footer `new-era` — lead-form (modal+comagic), 34 video, cookieConsent, favouriteCounter

## 3. СЕКЦІЇ ПО СТОРІНКАХ (глибина кожної story-page)
| Сторінка | Секцій | Підпис-елемент |
|---|---|---|
| /about | 9 | contentAnimation storytelling + visualizationLinesMenu |
| /architecture | **14** | `carouselSync` (2 звʼязані каруселі) + self-draw лінії |
| /location | 13 | `mapPlacesPicker` — інтерактивна POI-карта (1.58MB вбудованих даних) |
| /territory | 9 | carousel + contentAnimation |
| /gallery | 1 | full-bleed фільтр-карусель |
| /progress | 18 | 12 вбудованих відео поквартального прогресу будівництва |
**Спинний хребет:** КОЖНА story-page закінчується `visualizationLinesMenu` — крос-лінк-меню до сусідніх сторінок (сторінки утворюють кільце, не глухий кут).

## 4. VISUAL-SEARCH — 3 рівні (повний детальний розбір → [[PB_visual_search]])
```
/visual-search → 6 buildings → /building/2 → 32 floors → /building/2/floor/29 → 10 units → /flats/ER-2-2-279
```
- SVG-плита геометрії: `/assets/images/apartments/visual-plan/floors/2/2_13.svg`, 10× `<path data-nr class="plan__svg__hoverable" stroke="#CF8F7D">`. БЕЗ статусу в SVG.
- Статус (з `visual-search-floor.css`): доступно/hover = `--c-brick #cf8f7d`; reserved+sold = `--c-blue #051936` opacity .3-.5, sold `pointer-events:none`. Транзишн `cubic-bezier(.25,.74,.22,.99)` 0.4-0.8s.
- На floor/29: 9 із 10 markers `--disabled`, лише data-nr=7 активний. Popover картка: «117.4 м² · №279 · 5Е · 61 271 668 ₽».
- Контекст-скоупи `.plan--main/building/floor/parking` — один компонент, 4 теми.

## 5. ЗВʼЯЗКИ (funnel «цікаво → конкретна квартира»)
```
Home §8 «Apartments»
  ├ «Select by criteria» → /flats (range-фільтри, sort, 12 карток/стор через /api/flats)
  └ «Visual Selection» → /visual-search → building → floor → unit
       (або /3d-map WebGL-маса → той самий drill)
  ▼ обидва сходяться ▼
  /flats/ER-2-2-279 (план, м², поверх, дата здачі, ціна → «забронювати», PDF, буклет, share, favourite)
```
- Nav-drawer + sticky header: усі story + 4 selection-входи (criteria/visual/3d-map/3d-tour).
- Footer (у §9): legal/trust колонка + «Website by Vide Infra».
- Crossлінк-спина: visualizationLinesMenu наприкінці кожної сторінки.
- Cross-page shortlist (favourites) тримається на всіх 270 сторінках.

## 6. СТЕК
SSR HTML (EJS-шаблони) + 2 бандли (shared.js 1.34MB + per-page). Переходи: **Barba.js** (data-barba, 68 namespace). Скрол: **custom rAF SmoothScroll** (НЕ Lenis/Locomotive/GSAP — 0 GSAP). **Three.js** (163 ref): /3d-map, /panorama, /3d-tour + `visualizationLines*`. Splitting.js (текст), Matter.js (фізика, точково), comagic (трекінг дзвінків). Усе через `data-plugin="..."` self-init реєстр (~35 плагінів).

## 7. ВЕРДИКТ ГЛИБИНИ (5)
1. **Роути, не якорі** — ~270 SSR-URL (21+151+89+6). Кожна квартира/поверх лінкабельна й індексується.
2. **2 конверсійні воронки → 1 канонічна detail-сторінка** — раціонал (/flats фільтр) + просторовий (/visual-search або 3d-map), обидва → /flats/ER-b-s-n із бронюванням+PDF.
3. **Один SVG-plan-компонент на всі просторові рівні** — `.plan__svg__hoverable`+data-nr+plan-marker, переколорований `.plan--*`. Геометрія без статусу, статус у runtime.
4. **Повторюваний словник page-type + section-type** — story(8-14 themed секцій, ui-flip, finish=visualizationLinesMenu) · catalog(ajax) · spatial-selector(SVG) · webgl-viewer · trust. Section-types: hero-parallax, frame-sequence-scrub(149), carousel(+cursor/+sync), reveal, video-inview, self-draw-lines, CTA+form.
5. **Кастомний движок, стримане tooling** — Barba + custom scroll + data-plugin реєстр + Three.js лише де треба 3D. Глибина = контент-архітектура + консистентна компонентна система, не важчий фреймворк.
