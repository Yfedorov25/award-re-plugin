# ATOM: air-kinetic-letters · B0 hero wordmark (NEW law, S40)

> 🔴 РІЗНИЙ ЗАКОН від SPEC.md. SPEC.md = старий FLIP-колапс (гліфи летять у хедер-слот по скролу,
> B2-організм). Цей файл = B0 hero-заставка AIR: gigant impact-wordmark + per-letter blur-stagger
> вхід + fan-arcs КРІЗЬ літери. Обидва живуть під тим самим id, бо це «kinetic letters» родина,
> але механіка різна. B0 будувався atom-first через CD на ЧУЖОМУ фасаді (VIK), не фотокопія AIR.

## СУТЬ (одне речення)
Гігантський 3-літерний wordmark розтягнутий edge-to-edge (вага 400, тонкий), заходить per-letter
blur-stagger-ом, поки дві гофровані fan-дуги проходять за/крізь літери; kicker над, класифікація під.

## ЧОМУ ЦЕ ПРАЦЮЄ
Gigant розтягнутий wordmark = impact-заставка бренду; величезний letter-spacing + вага 400 =
елегантність (не важкий блок); fan-дуги крізь літери = кінетичний архітектурний мотив. Переноситься
на будь-який короткий wordmark (доведено: VIK landscape studio, не AIR).

## РОЛІ (абстрактні)
- **wordmark** (3 gigant гліфи, uppercase, вага 400, edge-to-edge через justify-content:space-between)
- **kicker** (2 рядки, чорний, центр, над wordmark)
- **caption** (2-3 рядки класифікації, сірий, центр, під wordmark)
- **arcs** (дві процедурні гофровані fan-дуги: одна top-right арка, одна left крізь літери)
- **arrow** ↓ bottom-right

## МЕХАНІКИ
- **M1 gigant-spread**: wordmark `display:flex; justify-content:space-between`, side-inset ~20px
  (краї ≥12px від екрана — НЕ клипить). font-size ~118px @390. Вага 400.
- **M2 blur-stagger вхід** 🔴: кожен гліф `blur(16px)→0 · translateY(12px)→0`, delay `240+i·150ms`,
  dur 900, ease `cubic-bezier(.22,.61,.36,1)`. HOLD на старті. kicker (delay 150) + caption
  (після літер) + arrow (останній) fade-up blur→0. arcs ведуть (delay 80, scale 0.965→1, dur 1200).
- **M3 fan-arcs процедурні** 🔴: НЕ crop/растр. Генеруються `makeFan(cfg,contrast)` — гофровані
  blades (polygon) + creases (line) + shadow. 2 fan-конфіги на екран (top-right + left). Читаються
  як елегантні архітектурні пелюстки, не повернутий прямокутник.
- **M4 reduced-motion**: усе одразу видиме (opacity 1, без blur/translate).

## ЧИСЛА (звірено з live B0 · reference-frames/B0-live-wordmark.jpg, 390×844)
Джерело правди = ink-extent scan живого кадру + S39 aircenter computed-style.
- **wordmark**: leftMargin ~20-22px · rightMargin ~22-24px · span ~344-348px · vCenter ~366-367px.
  вага 400 · #0a0a0a · uppercase. (band-height варіює з набором літер — це ОК на чужому фасаді.)
- **kicker**: 21px · 400 · letter-spacing -0.21px · #0a0a0a · center · над wordmark (top ~198).
- **caption**: 13px · 500 · #8d8d8d rgb(141,141,141) · center · під wordmark (top ~548).
- фон #fff. arrow ↓ bottom-right.
- шрифт **Onest** (400 headings, 500 caption). [[air-real-font-onest]].

## ВАРІАНТИ (CD Turn 1, борд variants/b0-all.html)
- **1a Faithful** (ОБРАНО як parity-pick): centered spread, дуги top-right + left крізь літери.
  = найближче до live composition. Fixed до live числами (vCenter 367 vs 366).
- **1b Tight**: upper-left, одна велика sweep-дуга. Альт (не live-composition).
- **1c Open air**: max stretch, дуги top+bottom. Альт (клипить трохи + дуги не як live).

## ПАРНІСТЬ / ГЕЙТ
- `node scripts/air-b0-gate.mjs [1a|1b|1c]` — 4-умовний foreign-facade (VIK, overflow, wordmark
  edge-to-edge не-клип, weight 400, вхід-композиція, arcs процедурні, 0 err). b0-1a: PASS.
- Dense-parity: `KAI/s39-boards/DENSE-PARITY-REPORT.json` (24 кадри, 8 осей, числа+око).
- 🔴 фінальне судження парності + вибір варіанту = око Єгора на iPhone.

## КОНВЕРСІЯ (DC→self-contained)
CD видав DC-формат (React/DCLogic + sc-for + {{ }} bindings). Конвертовано:
- sc-for SVG placeholder → vanilla `makeFan/buildSet` рендер polygon/line при завантаженні;
- `runEntrance` → vanilla Web Animations API (verbatim таймінги);
- hook `window.__KINETIC {composed, treatment, replay}`.
Генератор: `dc-raw/gen-selfcontained.mjs` (🔴 regen, не hand-edit .html — regen перезапише).
RAW CD: `dc-raw/VIK-Kinetic-Wordmark.dc.html`.

## EXTENDS / ВІДНОШЕННЯ ДО БАЗИ
Закон руху ⊂ base INDEX: `kinetic-letters-hero` (родина) + `text-blur-reveal` (per-element blur→0).
B0 = НОВА композиція-цеглинка hero-біта (gigant static impact + arcs), не FLIP. У organism-МАНІФЕСТ
склеюється за atomID на AIR-контенті (тексти/фото AIR), нуль колажу з їхніх рендерів.
