# D_SilverPinewood_architecture — silver-pinewood.com ПОВНА АРХІТЕКТУРА ✅
> Vide Infra «quiet luxury», тепла крем-палітра. Живий зонд curl, 2026-06-09. Доповнює [[D_SilverPinewood]] + [[PB_interactive_map]] + [[PB_site_architecture]].
> ГОЛОВНА ЗНАХІДКА: це НЕ багатосторінковий сайт. Це ОДНА довга scroll-сторінка з 17 секцій. 8 «story-сторінок» = БАЙТ-ІДЕНТИЧНИЙ документ (SEO deep-link на якір).

## 1. ГЛИБИНА = 2 унікальні документи (не page-count)
| Роут | Статус | Роль |
|---|---|---|
| / | 200 | Одна scroll-сторінка (17 секцій) |
| /about /architecture /engineering /infrastructure /lobby /location /territory /team | 200 ×8 | **ТОЙ САМИЙ документ** — deep-link якорі (#about, #location...) |
| /privacy-policy | 200 | Окремий шаблон (76KB) |
| /visual-search /flats /sitemap.xml | **404** | НЕ існують |
**Доказ:** кожен роут = той самий ~609KB HTML; `<link rel=canonical href=bare-domain>`; роут лише в og:url. `history`-плагін переписує URL при скролі (#about...) — сторінка сама собі scroll-spy роутер.
**Урок глибини №2 (ВАЖЛИВО):** глибину можна зробити НЕ кількістю сторінок, а **редакторською щільністю в ОДНОМУ скролі** — 17 секцій, ~200 зображень. Це окрема стратегія «luxury-by-atmosphere» (НЕ luxury-by-inventory; тут 0 flats/visual-search).

## 2. ОДНА СТОРІНКА — 17 секцій (+footer+progress-modal = 19 data-scroll-section)
Усі `<section class="ui-{dark|light|brown} ui-background" data-scroll-section data-plugin="reveal history">`. Тема чергує крем↔темне.
1. HERO «Silver Pinewood Residences» — sticky__layer, sticky--under-next, parallax-image-zoom
2. `#about` «Premium residential complex near the iconic Silver Pinewood on the riverbank»
3. ui-brown «century-old pines, crystal-clear bay, fresh air»
4. nature-of-movement «natural movement» — **gravity-well** + sticky
5. `#location` (МАПА, 29img/14svg) — фільтри+маркери, sticky
6. free-days «beauty of idle days» — gravity-well
7. `#territory` «Courtyard»
8. nature-area «miniature nature reserve» — **tab** + gravity-well
9. life-with-taste «tasteful life»
10. «fitness center, wine boutique, beauty salons, lounge»
11. `#architecture` «ARCHITECTURE» — gravity-well
12. «water and air» — **gallery__carousel** (prev/next/counter) + tab
13. `#lobby` «Lobby» — **illustration-zeus = Three.js GLTF 3D-скульптура** (єдиний WebGL)
14. space «Spacious interiors, high ceilings»
15. `#engineering` «advanced engineering solutions and smart features»
16. `#team` «team» — gravity-well
17. CTA «Request a Call» (форма)
+ footer
**~200 `<img>` як `<picture>` WebP (582 .webp). Кожне в parallax-image-zoom (114×) — підпис-ефект «зображення дихає/зумиться на скролі».**

## 3. «СТОРІНКИ» = ЯКОРІ (не окремі сторінки)
/about→§2, /location→§5(мапа), /territory→§7(Courtyard), /architecture→§11-12(intro+карусель), /lobby→§13(3D Zeus), /engineering→§15, /team→§16, /infrastructure→ТЕЖ §5 (та сама мапа).
Підпис-елементи: (a) фільтр-мапа §5, (b) architecture carousel §12, (c) WebGL Zeus §13, (d) tabbed content §8/§12, (e) gravity-well магнітний hover/parallax.

## 4. INFRASTRUCTURE МАПА (критично — user питав ЯК побудована) → [[PB_interactive_map]]
**100% hand-built inline-SVG. 0 mapbox/google/leaflet/yandex/2gis. 14 svg, 0 iframe.**
**Два SVG-шари (обидва viewBox 0 0 1440 1256):**
- `5.location-map/map-image.svg` (69KB) — ВИДИМЕ артворк (27 path, 21 rect, крем-план вулиць)
- `5.location-map/map.svg` (4.6KB) — НЕВИДИМИЙ координатний шар: **52 `<rect data-anchor="..." transform="translate(x y) rotate(deg)">`**. Rotate нахиляє street-лейбли під кутом дороги.
- + map-logo.svg (house-badge)
**Дані:** увесь POI-набір = ОДИН JSON у `data-plan-plans`, рендер через EJS `<script type=text/template>` партіали (`<%= item.title %>`). 50 items + 2 river = 52 = 1:1 з anchor.
**Розміщення маркера:** JS матчить item.anchor (напр. sport-1) до `data-anchor` rect у map.svg, читає translate/rotate, абсолютно позиціонує HTML-маркер+тултіп. plan-marker-rotation = кут.
**5 типів маркерів (data-template-name):** map-marker-point(нумеровані) · -metro · -place(райони: Serebryany Bor, Fili Park) · -river · -street. Класи plan-marker--point/--point-large/--metro/--place/--river/--street.
**Категорії (data.group):** g1 Sport(8) g2 Education(9) g3 Shopping(5) g4 Leisure(5) g5 Restaurants(7) + 15 контекст-лейблів. Фільтр `plan-filters` sticky (syncInputValues stickyBottom), 10 inputs → toggle state.hidden.
**Тултіпи:** tooltip--map-info/-large/--map-house. Кожен: item.title + item.locations[] список + **item.distance як ТЕКСТ** («5 minutes on foot», «11 minutes by car») — НЕ live-routing, hardcoded JSON. Маркери дрейфують parallax (data-parallax-easing="easeOutQuad").

## 5. LOCATION vs INFRASTRUCTURE
**Нема функціональної різниці** — обидва → та сама §5-мапа в тому самому документі. /location = «де в місті», /infrastructure = «що поряд (5 категорій)», але та сама інтерактивна мапа з фільтром. Один ассет під двома роутами для SEO-широти.

## 6. ЗВʼЯЗКИ
Header мінімальний: лише «Contact Us»(#callback-modal) + «Menu»(#menu-modal). Реальна навігація у #menu-modal (8 роутів, Barba перехоплює → scroll-to-anchor). Footer sparse: #top + «website by vide infra». Єдиний CTA: «Request a Call» (§17 + #callback-modal), форма {first_name, phone, hidden utm/group/keywords/description}.

## 7. СТЕК
**0 GSAP. 0 Lenis.** Custom smooth-scroll (Locomotive-derived: data-scroll-section/target/sticky, draggable scrollbar, rAF lerp) + bespoke **gravity-well** магніт-parallax (updateGravityWellLerp). **Barba.js** (33). **Three.js+GLTFLoader+DRACOLoader** (165) — webgl-zeus GLTF-скульптура у Lobby (model.gltf+DRACO+AVIF), ЄДИНИЙ WebGL. jQuery data-plugin (reveal/history/parallax/sticky/carousel/illustrationZeus/syncInputValues/stickyBottom). FLIP (homegrown, 57). shared.js 1.0MB. Cloudflare фронт.

## 8. ВЕРДИКТ (5)
1. **Глибина = редакторська щільність в ОДНОМУ скролі, не page-count** — «9 сторінок» це ілюзія, це 17-секційний ~200-img long-scroll; роути для SEO/deep-link. (Контраст ERA selection-heavy.)
2. **Homegrown scroll-движок = вся магія** — 0 GSAP/Lenis; premium = custom smooth-scroll + gravity-well + parallax-image-zoom (114×) + sticky__layer cross-fade стек.
3. **Мапа — найвідтворюваніший патерн і дуже простий** — 2 SVG-шари (артворк + невидимий 52-rect data-anchor) + 1 JSON data-plan-plans (50 POI / 5 груп) + EJS-партіали + sticky фільтр. Distances = hardcoded strings. 0 map-провайдера. **Будь-хто повторить статичним SVG + JSON.** (Прямо для nahirna §06.)
4. **Section-grammar:** section.ui-{dark|light|brown} + data-scroll-section + reveal, чергує крем/темне. Headline → gravity-well+sticky; content → parallax-image-zoom; rich → typed-plugin (carousel/zeus/map/tab).
5. **Один 3D-момент хірургічно** — WebGL рівно раз (DRACO Zeus у Lobby), не гімік всюди. Решта SVG+WebP+CSS. Ця стриманість = «quiet luxury», не «tech demo».
