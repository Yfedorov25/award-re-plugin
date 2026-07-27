# PB_responsive — МОБІЛЬНА ПЕРЕБУДОВА award-RE (VI-grounded) ★★
> Поглиблено: як VI реально перебудовує секції на мобілі + консолідація розкиданих mobile-фактів. 2026-06-09.
> Споріднено: [PB_media](../../re-media/references/PB_media) [PB_scroll_smoothness](../../motion-engine/references/PB_scroll_smoothness.md) [PB_visual_search](../../re-visual-search/references/PB_visual_search) [PB_interactive_map](../../re-interactive-map/references/PB_interactive_map) [PB_nav](PB_nav.md) [PB_performance](../../perf-doctrine/references/PB_performance.md).

## 0. ПРИНЦИП
Більшість трафіку ЖК — мобільна. Мобільний = СВІДОМА РЕКОНСТРУКЦІЯ композиції, не «зменшений desktop». VI це роблять системно через named-брейки + per-компонент fallback.

## 1. VI-БРЕЙКПОІНТИ (з [PB_media](../../re-media/references/PB_media) §3, art-directed)
Named breakpoints у `<picture>` через **media-query (не density)**:
- `@xxxl` `(min-width:1920px)+(min-height:700px)` · `@xxl` `(min-width:1440px)+700h` · `@md` `(min-width:568px)…980px` · `@xs` = без media (мобіл-дефолт `<img src>`).
- Кожен слот шле власні WebP+JPEG під розмір — мобіл НЕ тягне desktop-рендер.

## 2. ЯК VI ПЕРЕБУДОВУЄ КОНКРЕТНІ СЕКЦІЇ (реальні fallback)
- **Visual-search → СПИСОК** на малих екранах ([PB_visual_search](../../re-visual-search/references/PB_visual_search)): SVG-плита `width:50vw`+, pinch/pan через CSS-transform обгортки; на дуже малих — каталог-список замість плану (тапати дрібні полігони незручно). Ever dual-view (list↔plan) природно → list на мобілі.
- **Карта району → нижня смуга** ([PB_interactive_map](../../re-interactive-map/references/PB_interactive_map)): категорійний фільтр з sticky-боку → горизонтальна смуга внизу (`stickyBottom` + `enable-mq:sm-down`); POI-тултіпи → mobile-варіант `map-tooltip-info-mobile`.
- **Nav → full-screen modal-menu** ([PB_nav](PB_nav.md)): burger → overlay, пункти stagger, sticky CTA лишаються.
- **Pinned/horizontal секції** → спрощений yPercent або вимкнення pin (мобіл scroll-perf).
- **Multi-column split → стек** (1 колонка), media-side чергування зникає.
- **Hero frame-sequence** → легша версія (менше кадрів) АБО статичний кадр; canvas DPR cap.

## 3. СКРОЛ/РУХ НА ТАЧІ (з [PB_scroll_smoothness](../../motion-engine/references/PB_scroll_smoothness.md) §9)
- **Lenis `smoothTouch:false`** — нативний тач плавніший за інтерпольований. КРИТИЧНО.
- Спростити SplitText (слова, не символи). will-change обережно (мобільна RAM). 3D-шари/cutout-PNG мінімум.
- Кастом-курсор OFF (тач). Магнітні кнопки OFF. Parallax легший (yPercent менший).

## 4. ТЕХ-ПРАВИЛА
- `svh/dvh` не `vh` (мобільний бар ріже). Hero `min-height:100svh`.
- `body ≥16px` (iOS зум при фокусі інпута).
- Тап-зони ≥44px. Тач замість hover (active-стани, не :hover-only).
- clamp-типографіка вниз (H1 до ~36-40px), але довжина копі вільна.
- Форми full-width, `type=tel` клавіатура ([PB_forms_lead_capture](../../forms-lead-capture/references/PB_forms_lead_capture)).
- aspect-ratio-слоти тримають layout → 0 CLS на мобілі теж.

## 5. ВИМІРЮВАННЯ
Реальний середній Android (не лише iOS/емулятор). PROD, не dev. Тест: scroll-плавність, тап-зони, visual-search-список, карта-смуга, форма-клавіатура. (Headless НЕ міряє тач-feel — [PB_performance](../../perf-doctrine/references/PB_performance.md) §6.)

## 6. ПОМИЛКИ
vh замість svh · body<16px · hover-only на тачі · Lenis smoothTouch=true (лагає тач) · visual-search SVG без list-fallback (дрібні полігони) · карта без mobile-фільтр-смуги · pin/horizontal не спрощені · desktop-рендер на мобілі (вага) · кастом-курсор/магніт на тачі · тап<44px.

## 7. ЧЕК
☐ named-брейки @xs/@md/@xxl/@xxxl, мобіл не тягне desktop-рендер ☐ visual-search→список fallback ☐ карта→нижня фільтр-смуга ☐ nav→full-screen modal ☐ pin/horizontal спрощені ☐ split→стек ☐ Lenis smoothTouch:false ☐ курсор/магніт OFF ☐ svh + body≥16px + тап≥44px ☐ форми tel-keyboard full-width ☐ тест на реальному Android PROD.
