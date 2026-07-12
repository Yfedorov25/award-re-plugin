# AIR-COMPLETE — головна карта покриття

> Програма: повне відтворення сайту AIR (aircenter.space, Vide Infra) у бібліотеці плагіна —
> усі секції, прийоми, композиції, desktop + mobile.
> Джерела: D_AIR_video (+ AIR MOBILE §), D_AIR_architecture, D_AIR_invest_1to1 (контракт 1-в-1),
> D_AIR_mobile_video (раунд 1 + раунд 2), _REGISTRY_TID (44 рядки з AIR-джерелом),
> library/COVERAGE.md + grep registry_ref по всіх RECIPE.md. 2026-07-05.
> Правило: реальність (grep) головніша за документи. AIR-HARVEST-PLAN.md (2026-07-04) частково застарів —
> інвест-гілка з того часу ПОБУДОВАНА, реєстр поповнено T-432/T-433/T-M17…T-M32.

---

## Прогрес-рядок (оновлено 2026-07-06, сесія 5 — кінець будівництва спринтів 1–2)

**Всесвіт = 49 рядків реєстру з AIR-джерелом** (28 desktop T-xxx — дожато T-513 pinned counter-slideshow + 21 mobile T-M).

| Гілка | Відтворено (official) | 🟡 Candidate (збудовано, ЧЕКАЄ ВЕРДИКТУ Єгора) | Частково | Не почато | Разом |
|---|---|---|---|---|---|
| **Desktop** | **13 з 28** — T-310, T-422, T-430*, T-432, T-501, T-409**, T-416, T-433, T-434, T-511, T-322, T-524 + T-427 (функц. locmap-engine) | **6** — T-311 (kinetic-letters-hero), T-510 (pin-release-seam), T-530 (funnel-curtain), T-215 (sticky-card-parallax), T-512 (image-slider-wipe), T-513 (pinned-counter-slideshow) + двори-скін (без T-ID, родич T-110) | 0 | **9** — T-104, T-115, T-119, T-121, T-207, T-210, T-407, T-417, T-509 | 28 |
| **Mobile** | **4 з 21** — T-M01, T-M07, T-M18, T-M19 | **6** — T-M02 (hero-дзеркало), T-M29 (фунел-штора), T-M17 (glass-картка), T-M23 (tap-карусель — тепер ПОВНІСТЮ: reveal official + tap збудований), T-M06 (line-ticks), T-M11 (меню-стек) | 1 — T-M22 (initial-тикер official; між-сторінкова біла штора не почата) | **10** — M08, M20, M21, M24–M28, M30–M32 | 21 |
| **Разом** | **17 з 49 (35%)** | **12 (+скін дворів)** | 1 | 19 | 49 |

**Якщо всі вердикти спринтів 1–2 «топ» → official стрибає до ~29/49 (59%).**

### 🎯 ДЕ МИ (стадія програми, DoD-рівні):
1. **DoD-1 Атоми**: 17 official + 12 candidate на вердикті + 19 не почато (переважно спринти 3–7: дріл, каталог, локація, /about).
2. **DoD-2 Комбо**: Investment закритий вердиктом ✅; всі 6 юнітів спринту-2 зібрані.
3. **DoD-3 Сторінки**: **ЗБОРКА ГОЛОВНОЇ ЗБУДОВАНА** (`combos/home-air`, живі фото/копі hotlink) + пройшла 2 фікс-кола за зауваженням «мало плавності» (Lenis lerp 0.1, reveal-канон на всі фото, зустрічні дрейфи Harmony, Vimeo-луп, позиційний скіс дворів, дрейф фото слайдера, grid→fullbleed скейл, under-next шов, курсор-стрілка). **ЧЕКАЄ ЕКЗАМЕНУ: два вікна поруч з aircenter.space, desktop і телефон.**
4. **DoD-4 Наскрізність**: прелоадер→hero→акти→футер уже одним диханням у зборці; фунел-переходи (T-530/T-M29/T-M22-штора) — після спринтів 3–4.

### ⏳ БЛОКЕР ЗАРАЗ: вердикти Єгора (не блокують побудову, але тримають official-лічильник)
Пари відео в ~/Downloads: `funnel-curtain` · `kinetic-letters-hero` · `pin-release-seam` · `sticky-card-parallax` · `image-slider-wipe` · `pinned-counter-slideshow` · `cfc-air-courtyards` · `air-menu-overlay` + зборка `PAGE--home-air.mp4`/`AIR-REF--home-air.mp4`. Екзамен головної: `http://<IP>:8820/combos/home-air/combo-lab.html`.

\* T-430 закритий атомом `invest-card-reveal` (official), але в реєстрі позначений ⚠️ЗАСТАРІВ для реплік AIR
(owner hover-тест 2026-07-05: розкриття не існує, реальна механіка = T-432, теж закрита).
\*\* T-409 закритий у deep-link-частині (`budget-pills-bridge` official); повна фільтр-форма (chips+range+ajax) = спринт 4.

**Library-реальність (grep, 2026-07-05, сесія 3):**
- official з AIR-refs: `spread-row-headline` (T-310+T-M01), `theme-tween` (T-501+T-M07), `giant-number-fact` (T-422+T-304), `invest-card-reveal` (T-430+T-M18), комбо `invest--quiet-depth` (T-432+T-422+T-310+T-M18), **`case-tabs-table` (T-433+T-416+T-M19), `budget-pills-bridge` (T-409), комбо `invest--strategy-machine` (T-416+T-409+T-M19) — вердикт власника «топ» 2026-07-05 (відео-проба хвилі 2 на телефоні)**.
- функціональні еквіваленти без AIR-T-ID-міток: `locmap-engine` (official — механіка T-427/T-104-карти), `architecture--spec-builds` (base — pinned counter-slideshow «Format», цитує D_AIR_architecture), `clean-floor-hover-select` / `numbered-floorplate-select` / `isometric-building-unit-selector` (official — Ever/r1864-родичі T-115/T-407/ізометрії).
- ✅ **борг T-310 закритий (сесія 3):** хибний `registry_ref` у `media-step-switch` знятий у каноні І в прототипній копії `_prototypes/architecture-base/`; COVERAGE.md чистий.
- ✅ **знайдено й виправлено баг обліку (сесія 3):** парсер `lib-frontmatter.mjs` не зрізав хвостові `# коментарі` — `status: official  # вердикт…` парсився як НЕ-official, тож COVERAGE недораховував офіційні юніти (92 замість 99). Фікс: stripComment у parseScalar (поза лапками). Warnings verify без змін (237=237).

---

## МАТРИЦЯ ПО СЕКЦІЯХ САЙТУ (порядок сторінки)

Статуси: ✅ official · 🟡 candidate · 🟠 частково/родич · ⬜ не почато · — не існує на цій гілці.
Розмір: S ≤ пів дня · M 1–3 дні · L > 3 днів.

### 1. Прелоадер / міжсторінкові переходи

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Прелоадер split-panel → конвой ЛІТЕР (жива правда DOM) | T-524 | ✅ `preloader-logo-convoy` (official, вердикт «топ») | T-M22: initial = zoom-тикер wordmark | ✅ (initial у тому ж атомі) | 0 |
| Міжсторінковий шов | T-520 (Barba → наш стек) | ⬜ як атом-штора | T-M22: ОДНА біла штора знизу↑ ~0.5с; з меню — оверлей сам штора | ⬜ | S |
| Вхід у фунел (ритуал бренду) | T-530 flash-перехід дрілу | 🟡 `funnel-curtain` (candidate) | T-M29: чорна панель + «A I R» на кромці ~2.2–2.5с | 🟡 (той самий атом) | 0 (вердикт) |

### 2. Хедер / меню

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Меню-оверлей: великі пункти + CTA-плитки вибору юніта + спіраль-фон | A-17 | 🟡 `air-menu-overlay` (candidate, двофазний ритуал 1.6s дослівно) | T-M11 full-screen stack, активний пункт посірілий, КОНТЕКСТНІ CTA-плитки (наступний крок юзера) | 🟡 (той самий атом, стек підтверджений кадрами t74–79) | 0 (вердикт) |
| Themed-хедер (перефарбовування під секцію) | A-18 (на движку T-501) | 🟡 вшито в `air-menu-overlay` (1.2s air-bezier, IO, пріоритет меню) | капсула-бургер біла/чорна; естафета hero-wordmark → header-logo | 🟡 | 0 (вердикт) |
| Favourites у хедері (♡ + бейдж-лічильник) | T-408 (частина) | ⬜ | T-M30 (панель зверху + email-шит) | ⬜ | L (разом із §9) |

### 3. Hero

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Kinetic nav-letters: A·I·R збираються скролом; дзеркало у футері | T-311 | 🟡 `kinetic-letters-hero` (candidate, + футер-дзеркало) | T-M02 horizontal-marquee → осідання в розведений рядок | 🟡 (той самий атом) | 0 (вердикт) |
| Бренд-3D-об'єкт (біла спіраль, скраб-обертання; хром-сфера; чорна метал-версія на /management) | T-207 🔴 | ⬜ (тільки pre-rendered лупи/секвенція) | фрагмент угорі + ті самі появи наскрізь | ⬜ | L |
| Gravity-well snap у hero | T-509 ⚠ | ⬜ (council: не scroll-trap — будувати останнім) | на тачі ВИМКНЕНО (запис: снапів нема) | — | M |

### 4. Story-акти головної (momentum · format · harmony · life · status)

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Spread-row заголовок (системний act-розділювач, 8+ ужитків) | T-310 | ✅ `spread-row-headline` | T-M01 лівий 2-рядковий стек | ✅ (та сама, моб-гілка атома) | 0 |
| Theme-flip актів | T-501 | ✅ `theme-tween` | T-M07 інверсія фону = межа актів | ✅ (ref у theme-tween) | 0 |
| Sticky-card-over-parallax («About the project»: картка замерзає, фон пливе) | T-215 | 🟡 `sticky-card-parallax` (candidate); ⚠️ на ГОЛОВНІЙ live-harmony = зустрічні дрейфи БЕЗ піна (вшито в зборку) — sticky-версія лишається для /about | T-M17 дзеркало: фото замерзає, glass-картка їде поверх (+хром-сфера) | 🟡 (той самий атом) | 0 (вердикт) |
| Pinned counter-slideshow «Format» (js-format-counter, три вежі 14–34) | **T-513** (дожато 2026-07-06) | 🟡 `pinned-counter-slideshow` (candidate: лічильник-курсор, бар-скраб, живий движок) | пін-спіраль + текст-слайди + 2 line-ticks (T-M06 підтверджено на AIR) | 🟡 (той самий атом) | 0 (вердикт) |
| Pin-then-release ланцюг (sectionToSticky → HalfUnderNext) | T-510 | ⬜ | пін = sticky-підкладка БЕЗ scroll-trap (закон із запису) | ⬜ | M |
| Image-slider 1/2 з лічильником (Status/HAAST) + wipe-шов | T-512 | 🟡 `image-slider-wipe` (candidate; ⚠️ живий код: шов краєм-до-краю, НЕ «з центру» — вердикт вирішить канон; + дрейф фото ±16.666% фікс-кол 2) | tap-карусель [← N/M →] push-wipe (частина T-M23) | 🟡 (tap-режим того самого атома) | 0 (вердикт) |
| Двори-карусель (центр-фото + бічні піки зі скосом, стрілки 48px) | без T-ID (родич T-110) | 🟡 варіант `cfc/air-courtyards` (candidate: WebGL→CSS, скіс безперервний позиційний, 54vw, курсор-стрілка в зборці) | свайп-стрічка | 🟡 (нативна стрічка бази) | 0 (вердикт) |
| Split-біт «EFFICIENT LAYOUTS…» (фото повзе знизу в масці-ректі) | контракт §2 v1 | 🟠 `media-step-switch` (official) — родич; хибний ref T-310 виправити | інсет-фото-картки, чергування full-bleed/інсет | ⬜ | S |
| District-числа з людськими фото | T-422 | ✅ `giant-number-fact` | T-M18 морозна свайп-стрічка на темному макро | ✅ (моб-гілка invest-card-reveal) | 0 |

### 5. /about

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Shader-карусель (єдиний WebGL AIR) → CSS clip+scale переклад | T-119 🔴 | ⬜ | T-M23: системний blur→sharp reveal + tap-карусель push-wipe ~0.4с | 🟠 (blur-каскад живе в invest-комбо; атома нема) | M |
| Діаграма веж B1/B2/B3 (лейбли-лінії, статична) | без T-ID | ⬜ | статична (тапів нема — знято) | ⬜ | S |
| ✛-toggle frosted-картки (PREMIUM TECH / INNOVATIVE ENG) | пара T-417/T-432 | ⬜ | T-M24: in-place крос-фейд, ✛↔−, незалежні стани | ⬜ | M |
| Акордеон площ із планами + гігант-числом + floating-CTA | пара T-417+T-407 | ⬜ | T-M25 (press-state, animate-height, [CHOOSE AN OFFICE ✛]) | ⬜ | M |
| Ізо-модель-стрічка стилобату (іконо-бейджі, drag, гост «4000 M²») | без T-ID (родич T-118) | 🟠 `isometric-building-unit-selector` (official) — інша роль, потрібна стрічка | T-M28 | ⬜ | M |
| Пінований цифро-дек офісних переваг (1..4 + line-ticks) | без T-ID | ⬜ | T-M06-варіант із гігант-цифрою | ⬜ | S |
| B3-сторі glass-картка зі слайдами | T-215+T-M06 зв'язка | ⬜ | = T-M17 + line-ticks | ⬜ | S (після T-M17) |

### 6. Surroundings (оточення)

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Real-aerial аерофото як база | T-121 | ⬜ | T-M27 пінований аеро-журней (скрол = зум/пан) | ⬜ | S + M |
| Color-zone overlays (корти/парки) + хв-картки | T-210 | ⬜ | у складі T-M27 + свайп зон-картки | ⬜ | S |

### 7. Карта / location

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Inline-SVG карта 2-шарова + JSON (карта-половина) | T-104 | 🟠 функц. `locmap-engine` (official) — механіка є, AIR-скін (темна векторна + POI-список праворуч) = адаптація | full-bleed + pan пальцем + ‹›-пілюля | ⬜ AIR-скін | S–M |
| Маршрут-кінетика часу (клік POI → маршрут малюється + число росте) | T-427 | ✅ функц. закрито: `locmap-engine` + `location--surveyed-route-map` (Dijkstra, walker, live-лічильник) | T-M26 POI-свайп-картки: траса гасне → пан/зум → пунктир малюється; число СТАТИЧНЕ | ⬜ | M (моб-двійник) |
| Категорійна карта (фільтри маркер-сетів) | T-409 (частина) | ⬜ | T-M20: стрічка [← PARKS ∨ →] + dropdown-up шит + кластер-бейджі «40+» | ⬜ | M |
| План-половина T-104 (SVG поверхи/юніти + статус clickable=count>0) | T-104 | ⬜ (фундамент дрілу §8) | — | — | M |

### 8. Visual-search дріл (генплан → поверх → юніт)

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Фасад із ховер-плитами поверхів + закріплена картка «Floor N · X offices · м²» | T-115 | ⬜ (родич `clean-floor-hover-select`, official — розширити) | T-M32: НЕ існує → заглушка «only on desktop» + list-заміна | ⬜ (S) | M |
| Flash-перехід між рівнями дрілу | T-530 | ⬜ | T-M29 чорна wordmark-штора (ритуал фунела) | ⬜ | S |
| Попавер юніта З МІНІ-ПЛАНОМ + м² + ціна | T-407 (AIR-розширення) | ⬜ (родич `numbered-floorplate-select`, official — без міні-план-попавера) | попавера нема; план-контекст живе в unit-табах (T-M31) | ⬜ | M |
| Драбинка-стек поверхів зліва (міні-розріз, активний позначено) | без T-ID | ⬜ | відсутній на моб | — | M |
| SELECT MULTIPLE OFFICES тумблер | без T-ID | ⬜ | desktop-only (закон T-M32) | — | S |
| FLIP-естафета дрілу | T-428 | ⬜ | — | — | M |
| 3D-ізометрія master plan (контекст місця без WebGL) | без T-ID | 🟠 `isometric-building-unit-selector` (official) — адаптувати | таб MASTER PLAN у юніті (T-M31) | ⬜ | S–M |
| Компас на плані поверху | без T-ID | ⬜ | міні-контекст під планами | ⬜ | S |

### 9. Каталог /offices (list) + favourites

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Фільтри: chips + range-слайдери + ajax live-count + pushState | T-409 (повна форма) | 🟠 deep-link-частина ✅ official (`budget-pills-bridge`); повна форма = цей спринт | T-M30 (сорт ∨, LIST/GRID, SHOW MORE, sticky [CLEAR/FILTERS]); шит фільтрів НЕ знято | ⬜ | M–L |
| Favourites-система (♡ → бейдж → панель → email) | T-408 | ⬜ | T-M30: заливка ♡ ~0.2с, панель slide-down, ✉ SEND BY EMAIL шит | ⬜ | L (спільна для 2 гілок) |
| Картки списку: план-превʼю + 🔒-зайнято + струк-ціна + «-5%» | A-15 деталі | ⬜ | у T-M30 | ⬜ | у складі T-M30 |
| StickyBottom бар | T-419 | ⬜ | [CLEAR | FILTERS ⚙] + ↑ back-to-top | ⬜ | S |

### 10. Unit-сторінка /office/AR-x-x

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| A-13 AIR-варіант: специфікація + ціна (струк + -5%) + plan-tabs (Office/On-floor/Master-plan) + мінімапа + Reserve | A-13 | ⬜ | T-M31: чіпи + ціна колапсує в sticky-бар + sticky-низ [♡ | RESERVE ✛] | ⬜ | L |
| Перемикач рендеру UNFURNISHED/FURNISHED | T-431 (Ever-канон) | ⬜ | у T-M31 (живе лише на табі OFFICE PLAN) | ⬜ | S |
| Similar offices: грід/карусель з ПЛАНАМИ-превʼю + handoff юніт→юніт | T-523 + без T-ID (грід) | ⬜ | у T-M31 (press-state → нова unit-сторінка) | ⬜ | M |

### 11. Сервіси /management-service

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Sticky parallax service-блоки + callback | AIR(a) §3 | ⬜ | пін CMWP: ЧОРНА метал-спіраль + цитата Drucker + line-ticks | ⬜ | M |
| ~12 сервіс-карток (назва + контур-іконка + ✛) | пара T-417 | ⬜ | механіка = T-M24 (підтверджена на /about; на /management тап не знято) | ⬜ | S (після T-M24) |

### 12. Investment ✅ (єдина закрита секція)

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| B0–B2: карусель переваг + cursor-arrow + spread-бенд + число 5.9vw | T-432, T-310, T-422 | ✅ комбо `invest--quiet-depth` (official, вердикт власника «топ») | T-M18 морозна стрічка | ✅ | 0 |
| B3–B5: sticky-рейка + CASE-таби + таблиця + budget-мости | T-433, T-416, T-409 | ✅ `invest--strategy-machine` + `case-tabs-table` + `budget-pills-bridge` (вердикт «топ» 2026-07-05) | T-M19 spy-пара знизу + таб-пресети | ✅ | 0 |
| B6: CTA-форма на фото | T-411 + A-07 | ⬜ AIR-версії (свій канон `conversion-quiet-gate` official — інша композиція) | T-M21 tap-pills поверх full-bleed фото | ⬜ | M |

### 13. CTA / форма (сайтовий фінал) — див. §12 B6: та сама пара T-411/A-07 ↔ T-M21.

### 14. Футер

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| A-16: гігантські A I R по ширині (дзеркало hero) + breadcrumb + legal | T-311-дзеркало | ⬜ (разом із hero §3) | scale-в'їзд wordmark; spread ВИЖИВАЄ лише тут (принцип без T-ID) | ⬜ | S (у пакеті T-311) |
| Крихти-як-футер-елемент (HOME/PAGE перед футером) | — | ⬜ | закон моб-структури всіх сторінок | ⬜ | S |

### 15. Наскрізні механізми («кіно»)

| Прийом | T-ID desktop | Статус у library | T-M mobile | Статус mobile | Розмір |
|---|---|---|---|---|---|
| Blur→sharp reveal-канон (без y-зсуву, каскад 0.15–0.25с; D4-виняток) | контракт §6.1 (кандидат L3) | 🟠 вшитий у 2 invest-комбо; системного атома нема | T-M23 = мобільний reveal-канон AIR v4 | 🟠 | S — систематизувати атомом |
| Dim-scrim шов (секція темніє під наїзд бенду) | **T-511** ✅ (дожато 2026-07-05) | ✅ закритий `invest--quiet-depth` (down-link у registry_ref) | — | — | 0 |
| Center-band wipe → живий шов краєм-до-краю (виправлення №7) | **T-512** | 🟡 `image-slider-wipe` (candidate) | push-wipe T-M23 — tap-режим того самого атома | 🟡 | 0 (вердикт) |
| Бренд-об'єкт у 2 матеріалах наскрізь | T-207 🔴 | ⬜ | посилено (5+ появ) | ⬜ | L |
| Тач-афорданс ‹›-пілюля + ✛ як єдиний CTA-гліф | — | ⬜ | системні константи моб-версії | ⬜ | S (у shared) |

---

## DEFINITION OF DONE — що означає «100% 1-в-1» (зафіксовано 2026-07-06 за словами Єгора)

Програма закрита ТІЛЬКИ коли виконано всі 4 рівні, і кожен приймається посторінковим порівнянням поруч з оригіналом:

1. **Атоми: 48/48 рядків реєстру official** (desktop T-xxx + mobile T-M) — кожен з парою відео `AIR-REF--` / `ATOM--` в Downloads і машинними гейтами.
2. **Комбо: всі секційні композиції** (~13–16) — не «атом працює», а «секція виглядає як секція AIR» (той самий порядок бітів, шви, партитура дистанцій).
3. **Сторінки: посторінкова репліка** — головна · /about · /location · /investment · /management · фунел (list→unit) · сервісні. Акцепт кожної: **два вікна поруч** (наша сторінка vs aircenter.space, desktop І телефон), Єгор гортає обидві синхронно. Розбіжність = фікс до збігу.
4. **Наскрізність: сайт як один фільм** — прелоадер→hero→акти→фунел→футер одним диханням; всі переходи в одній мові (сімейний bezier, reveal-канон, штори).

**Мілстоуни посторінкових зборок** (нове правило: в кінці кожного спринту — зборка, не тільки атоми):
- Після спринту 2 → **ГОЛОВНА цілком** поруч з оригіналом (перша повна сторінка).
- Після спринту 4 → **весь фунел** (list → unit) поруч.
- Після спринту 6 → /about + /management + /investment.
- Після спринту 7 → повний сайт, фінальний прохід Єгора по всіх сторінках у двох вікнах = закриття AIR-COMPLETE.

Атом-вердикти лишаються воротами в official, але СПРАВЖНІЙ акцепт кожного прийому повторюється на рівні сторінки — якщо на зборці щось не як в AIR, атом повертається в доробку незалежно від старого вердикту.

---

## ЧЕРГА БУДІВНИЦТВА (секції-спринти)

Принципи: шви-«кіно» дають найбільший ефект на відчуття «один фільм» (6 наскрізних механізмів);
investment уже готовий — його лишилось дотиснути; карта ПЕРЕВІРЕНА: механіка T-427/T-104 справді
закрита locmap-engine (official) — лишився AIR-скін + моб-двійники. Кожен спринт = атоми + комбо + моб-двійник разом.

**Спринт 0 — ✅ ЗАКРИТИЙ ПОВНІСТЮ (2026-07-05, сесія 3):** ✅ вердикт власника «топ» по `case-tabs-table` / `budget-pills-bridge` / `invest--strategy-machine` → official (відео-проба); ✅ хибний `registry_ref T-310` у `media-step-switch` знятий (канон + прототипна копія); ✅ реєстр дожатий: **T-434** sticky anchor-рейка (L4, закрита invest--strategy-machine), **T-511** dim-scrim шов (L5, закритий invest--quiet-depth), **T-512** center-band wipe (L5, атом у спринті 2); down-link registry_ref у комбо додано, COVERAGE мапить 18 T-ID.

**Спринт 1 — «КІНО»-рама — ✅ ЗБУДОВАНИЙ 5/5 (2026-07-06):**
✅ official: `text-blur-reveal` (T-322), `preloader-logo-convoy` (T-524+T-M22-initial) — вердикти «топ» · 🟡 candidate (чекають вердикту): `funnel-curtain` (T-530+T-M29), `kinetic-letters-hero` (T-311+T-M02), `pin-release-seam` (T-510) · ⬜ лишилась T-M22 між-сторінкова біла штора (S, добити у спринті 3 разом з фунел-переходами).
→ Метод, що б'є: живий CSS/DOM aircenter.space > тірдаун-проза.

**Спринт 2 — Story-акти головної + хедер/меню — ✅ ЗБУДОВАНИЙ 6/6 (2026-07-06, сесія 5):**
🟡 всі candidate, чекають вердикту: `sticky-card-parallax` (T-215+T-M17) · `image-slider-wipe` (T-512+T-M23-tap; ⚠️ виправлення інтерпретації №7 — живий шов краєм-до-краю, не «з центру») · `pinned-counter-slideshow` (T-513 — реєстр дожатий +T-M06; лічильник-курсор) · `center-focus-carousel/air-courtyards` (двори: WebGL→CSS, скіс безперервний позиційний) · `air-menu-overlay` (A-17/A-18+T-M11, двофазний ритуал 1.6s) · **ЗБОРКА `combos/home-air`** (page-assembly, живі фото/копі, 10 движків) + фікс-кол 1 (Lenis lerp 0.1 + reveal-канон + дрейфи Harmony + Vimeo-луп + позиційний скіс) + фікс-кол 2 (дрейф фото слайдера в атомі + grid→fullbleed скейл + under-next шов + rides + курсор-стрілка + syncTouch).
→ ЕКЗАМЕН: Єгор гортає зборку поруч з aircenter.space (два вікна, desktop і телефон). Розбіжність = фікс до збігу; атом може повернутись у доробку.

**Спринт 3 — Visual-search дріл — ✅ ЗБУДОВАНИЙ 5/6 (2026-07-06, сесія 5; зборка фунела = спільна зі спринтом 4):**
🟡 candidate: `building-floor-drill` (T-115+T-104+T-M32: плити, clickable=count>0, маркери 60/120ms, tooltip) · `floor-plan-select` (T-104+T-407+T-M32: ЖИВИЙ план 2_18, попавер з міні-планом/цінами, драбинка, SELECT MULTIPLE ✛, компас −15°) · комбо `visual-search-drill` (T-530 flash + T-428 FLIP — естафета рівнів) · `funnel-curtain/white-veil` (T-M22 біла штора — хвіст спринту-1 закритий).
Живі сторінки/SVG/конфіги дрілу законсервовані в live-archive. ⬜ лишились: ізометрія master plan (адаптація isometric-building-unit-selector — перенесено в хвіст) · T-M25 акордеон площ (він у /about — спринт 6).

**Спринт 4 — Каталог + favourites + unit — ✅ ЗБУДОВАНИЙ 4/4 (2026-07-06, сесія 5, фінал дня):**
🟡 candidate: `office-cards-list` (A-15/T-409/T-419: 8 живих офісів, фільтри з live-лічильником, ♡+бейдж, 🔒, −5%) · `favourites-panel` (T-408 ядро: панель зліва/зверху, email-шит; success = A-07, жива діра дозйомки) · `office-unit-card` (A-13: живий AR-1-18, T-431 furnished-SVG, T-523 handoff) · **ЗБОРКА `combos/funnel-air`** (DoD-екзамен №2: дріл→план→unit + каталог-гілка + ♡; закон штор: фунел чорний, буденні білі T-M22).
→ ВЕСЬ ПРОДАЖНИЙ ФУНЕЛ AIR ІСНУЄ. Екзамен: два вікна проти /visual-search і /offices.

**Спринт 5 — Локація + оточення (S+M+M+S):**
AIR-скін locmap-engine (темна векторна + POI-список + картка-число) · T-M20 категорійна стрічка + шит + кластери · T-M26 POI-свайп-картки з прогресивним маршрутом · T-121+T-210 аеро + зони (+T-M27 аеро-журней).

**Спринт 6 — /about + сервіси + форма (M+M+M+S+M+M):**
T-119-переклад карусель · T-M24 ✛-toggle стрічки · T-M28 ізо-стрічка · цифро-дек + діаграма веж · /management пін CMWP + сервіс-картки · B6 CTA-форма (+T-M21 tap-pills).

**Спринт 7 — довгий хвіст (L+M+M+S) — У ХОДІ (2026-07-07):**
✅ T-207 бренд-об'єкт — РОЗКРИТО дозйомкою-само (= живі Vimeo-лупи, каталог у live-archive/README) і вшито в home-air (`8c99001`) · ✅ cookie-consent атом (`0bcaa44`) · ✅ revolves desktop → slide-push, виправлення №8 (`827c059`) · ⏭️ меню-картка звірка · ⏭️ 5 сервісних сторінок (news/developer/progress/documents/parking — DOM+скріни зняті) · T-509 gravity-well (⚠ останнім, обережно) · ❌ how-to-buy = 500 НА СЕРВЕРІ AIR (сторінки не існує в проді — з плану знято) · дрібні наскрізні (✛-гліф, ‹›-пілюля у shared).

---

## Прийоми без T-ID (тірдаун є — реєстр недожав) → дожати у відповідному спринті

Desktop (11):
1. **Драбинка-стек поверхів** (floor-сторінка) — спринт 3.
2. **SELECT MULTIPLE OFFICES тумблер** — спринт 3.
3. **3D-ізометрія master plan** — спринт 3 (функц. родич isometric-building-unit-selector вже official).
4. **Similar-грід з планами-превʼю** (превʼю = міні-план, не фото) — спринт 4.
5. **Компас на плані поверху** — спринт 3.
6. ✅ **Pinned counter-slideshow «Format»** — дожатий у реєстр як **T-513** (спринт 2, сесія 5); атом candidate.
7. ✅ **Image-slider 1/2 з лічильником** — закритий атомом `image-slider-wipe` разом з T-512 (спринт 2, сесія 5); candidate.
8. **Text-reveal-editorial bridge-statement** («Designed with people in mind») — спринт 2 (сирівці split-word-headline/mask-up-title/theme-tween є; комбо manifesto-bridge не існує).
9. ✅ **Dim-scrim шов** — дожатий у реєстр як **T-511** (спринт 0, сесія 3); закритий invest--quiet-depth.
10. 🟠 **Center-band wipe шов** — рядок дожатий як **T-512** (спринт 0, сесія 3); код атома = спринт 2.
11. ✅ **Sticky anchor-рейка моделей** — дожата у реєстр як **T-434** (спринт 0, сесія 3); закрита invest--strategy-machine.

Mobile (2):
12. **Map-marker drill: тап маркера → док-картка → сторі-сторінка** (mv4 f-024..032) — розчинено між T-M20/T-M15, окремого закону нема — спринт 5.
13. **Footer-wordmark-spread-survives + scale-в'їзд** — принцип згадано в T-M01/T-M11, окремого рядка нема — спринт 1.

Закриті з часу AIR-HARVEST-PLAN (для історії): cursor-arrow → T-432 ✓ · tab-crossfade → T-433 ✓ · case-tab-calculator → T-M19 ✓ · horizontal-scroll-number-cards → T-M18 ✓ · tap-pill-form → T-M21 ✓ · deep-link pre-фільтр → budget-pills-bridge/T-409 ✓.

---

## Залишкові діри знань → ✅ ЗАКРИТО ДОЗЙОМКОЮ-САМО 2026-07-07 (headless-Хром; сирці live-archive/air/recon-20260706/)

4 дрібні з раунду 2 (моб):
1. ✅ **/panorama** — сторонній fullscreen-iframe `aero2.ru/3d/Hod/hod.html` (власного в'ювера НЕМАЄ; репліка = iframe hotlink).
2. **Шит фільтрів списку** (tap FILTERS ⚙) — лишається останньою дрібною дірою (не блокує: desktop-фільтри зняті повністю).
3. ✅ **Favourites/форми success** — стани СТАТИЧНО в DOM (`js-form-success`: «Thank you! We've received your request…» + error-блок) — знято БЕЗ сабміту (int-form-states.json).
4. ✅ **Форма B6 чипи/сабміт** — та сама статична пара станів.

Знайдені додатково:
5. ✅ **Desktop верх /investment** — знято: AIR-REF--invest-hero-desktop.mp4 (чорна спіраль-луп + statement + cursor-arrow картки).
6. ✅ **Desktop /how-to-buy** — 500 НА СЕРВЕРІ AIR (сторінки в проді НЕ ІСНУЄ — знято з плану, не діра).
7. ✅ **Конвергенція spread-row /investment** — підтверджено ще раз: статично розведений, руху немає.
8. ✅ **Desktop /panorama /news /developer /progress /documents /parking** — DOM+скріни зняті (побудова = спринт-7 черга 2).
9. **/management ✛-картки** — механіка = T-M24 (plus-toggle-cards вже candidate); окремий запис не критичний.
10. ✅ **Ховер-стани** — знято: кнопки/чипи = `color 0.6s cubic-bezier(.25,.74,.22,.99)` (int-btn-transitions.json); меню-лінки в AIR-REF--menu-desktop.mp4.
11. ✅ **Cookie-банер desktop** — знято + атом `cookie-consent` збудований (жива поведінка: accept = remove() без фейду).
БОНУС: ✅ меню desktop = картка-модал (AIR-REF--menu-desktop.mp4) · ✅ карусель /about desktop = SLIDE-PUSH (виправлення №8) · ✅ T-207 = Vimeo-лупи (каталог у live-archive/README).

---

## Оцінка обсягу

- **Атоми/моб-гілки будувати:** ~14 desktop T-ID не почато + ~16 моб T-M не почато + ~11 прийомів без T-ID; з урахуванням того, що моб-гілки здебільшого живуть усередині тих самих атомів (matchMedia), а 5 прийомів закриваються адаптацією official-родичів (clean-floor-hover-select, numbered-floorplate-select, isometric-building-unit-selector, center-focus-carousel, locmap-engine) — **≈ 22–26 нових/розширених атомів**.
- **Комбо-рівень:** hero-air, menu-air, 3–4 story-акти головної, about-пакет (2–3), surroundings, location-air, дріл (2–3 рівні), list+favourites, unit, services, cta-form-air, footer-air — **≈ 13–16 комбо**.
- **Розмірна сума:** 3×L (T-207, T-408/T-M30, A-13/T-M31) + ~13×M + ~20×S ≈ 35–45 люд.-днів чистої побудови (без вердикт-циклів власника).
- **Спринтів: 7 + спринт-0** (при поточному темпі інвест-гілки — вона зайняла ~2 дні на 6 одиниць — це ~6–8 тижнів календарно з вердикт-циклами).
- Прогрес на сьогодні (сесія 5, 2026-07-06): **17 з 49 official (35%) + 12 candidate на вердикті** (всесвіт 47→49: T-322 і T-513 дожаті). **Спринти 0–2 ЗБУДОВАНІ ПОВНІСТЮ; зборка головної існує і пройшла 2 фікс-кола.** Стадія: ЧЕКАЄМО (а) вердиктів по 8 парах відео, (б) екзамену головної «два вікна». Наступне будівництво — Спринт 3 (visual-search дріл) + хвіст T-M22-штора.
