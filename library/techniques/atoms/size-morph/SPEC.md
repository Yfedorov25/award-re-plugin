# ATOM: size-morph — реальний layout-морф height/width плити по травел-вікну (v1)

## СУТЬ
Розмір медіа-плити (height 100svh→70/60svh, width 195%→100%) скрабиться РЕАЛЬНИМИ layout-
властивостями по вікну травелу елемента: край плити фізично відступає і відкриває поверхню
під/поруч. Inner-медіа тримає object-fit:cover (міняється КРОП, не пропорції). Scale-settle
(1.2→1.0) — ОКРЕМЕ, РАНІШЕ вікно. НІКОЛИ не transform-scale замість розміру.

## МЕХАНІКИ (SERVED MARKUP ×8 інстансів; keyframe-JSON нижче)
- M1 ENTRY: inner scale 1.2→1.0 на вікні входу ([100-0]→[-200-0] у нотації сайту), height
  константний 100svh, ease:none.
- M2 REST: ~1 viewport травелу без морфів (плита їде як full-bleed).
- M3 COLLAPSE (підписний закон): пізнє коротке вікно (~50 од. травелу, [-200-0]→[-250-0]):
  height 100svh→70svh (варіант residence-tree: [0-0]→[-50-0], до 60svh). НИЖНІЙ край
  піднімається; під ним ВЖЕ лежить поверхня наступної секції — reveal 1:1. Контент, заякорений
  всередині плити, їде з краєм (доказ що це layout, не clip/transform).
- M4 WIDTH-ВАРІАНТ: overwide band у колонці, width 195%→100% свого контейнера тим самим
  видом вікна ([-200-0]→[-250-0]) — смуга звужується в колонку.
- M5 ІНВАРІАНТИ: всі вікна ease:none + clamp; scale і size НЕ перекриваються; object-fit:cover
  завжди; чиста f(p), реверсивно; жодного піна.

## ВИТЯГ MARKUP (джерело правди)
```
l-intro opening-1/3:  [100-0] scale(1.2) h100svh → [-200-0] scale(1.0) h100svh → [-250-0] h70svh
residence-tree:       [100-0] scale(1.1) h100svh → [0-0] scale(1.0) → [-50-0] h60svh
l-design__slide__bg:  [-200-0] w195% → [-250-0] w100%
```

## ДЖЕРЕЛА / СТАН
MARKUP: `skills/teardowns/live-archive/springs/springs-home.html` (витяги в
`~/Downloads/CD-RUN-snap-morph-v1/NARRATION.md`).
NARRATE/FILM: ⬜ — на 2-6fps кадрах морф явно не зловлений; вікна = точні з markup, темп live
підтвердити оком.
BUILD: через Claude Design — пакет `~/Downloads/CD-RUN-snap-morph-v1/` (промпт 02).

## ВІДКРИТІ ПИТАННЯ (закрити оком Єгора або v2)
1. Що саме відкриває колапс на live (наступна секція/фон) — у демо reveal зроблено явним 1:1.
2. Чи є layout-jank на live від анімації height (сайт живе з цим — перевірити perf у демо).
3. svh vs vh (мобільний паритет) — у демо vh.

## TRANSFER-ГЕЙТ
Той самий закон на іншому фасаді: інші пропорції колапсу (65svh≠70svh), інша колонка для
width-варіанта — getComputedStyle показує живі height/width, settle окремим вікном, реверс
чистий; __MORPH_STATE__() дає числовий гейт.

## СТАН ПІСЛЯ CD (S38)
BUILD = CD (проєкт fa221289), RAW без фіксів; гейти ALL PASS; collisions=0.
Вікна білда: ENTRY scale 1.2→1.0 ('clamp(top bottom)'→'top top') · REST ~40vh · COLLAPSE
height 100→70vh ('bottom 60%'→'clamp(bottom 12%)') · WIDTH 195%→100% ('top 55%'→'top -25%').
Реальні layout-props підтверджені getComputedStyle (900→765→630px). ✅ APPROVE Єгора 2026-07-17 («ці приймаю»).
