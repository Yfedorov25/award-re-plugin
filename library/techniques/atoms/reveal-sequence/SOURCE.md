# SOURCE — звідки взято закон атома reveal-sequence

## 1. Жива плівка (акцептанс-оракул)
`~/Downloads/Screen Recording 2026-07-14 at 21.17.25.mov`, Enjoy-біт ≈ **13–21s** (покадровий аналіз S36, 2fps):
- ~13–14.0: copy-block «Enjoy nature's embrace…» на темному скрімі зліва + мала media-card справа (рука/листя) — обоє ВЖЕ в кадрі на 14.0
- 15.5–16.5: card wipe-out вгору; ОДНОЧАСНО terrace-рендер піднімається знизу full-bleed (wipe); copy ТРИМАЄТЬСЯ зліва
- 17.0–19.5: hold — copy поверх terrace, terrace осідає (повільний zoom)
- 19.5–20.5: copy виходить ВГОРУ; заходить наступний контент (slider card + caption + nav = атом #5)
Порядок/overlap = ядро закону; далі цикл слайдера — ОКРЕМИЙ атом (slider-cycle).

## 2. Markup
`data-plugin="reveal"` (×14 site-wide) висить на контейнерах СЕКЦІЙ (l-wellness, l-intro, l-gallery-container…) —
плагін секційного входу контенту; конкретні патерни послідовності декларативно НЕ видно (на відміну від
odometer'ових data-parallax keyframes) → закон знято З ПЛІВКИ. reveal-enable-mq="null" на gallery = завжди.

## 3. CD-ТРІАЛ 1/2 (рада #4, мандат)
BUILD цього атома робить Claude Design з нашого SPEC:
- Пакет для CD: `~/Downloads/CD-RUN-reveal-sequence/` (00-READ-FIRST + 01-PROMPT + SPEC-копія + reference/6 кадрів)
- Старт тріалу: 2026-07-16 15:18 (пакет готовий; час CD-циклу міряти від прикріплення папки Єгором)
- Протокол: гейти на RAW output (dom-lint → real-scroll-record → відео-звірка → transfer) → timebox фікс 45хв
  → лог часу vs hand-build ~3-4 год. Вердикт ради: `KAI/COUNCIL-4-CLAUDE-DESIGN-VERDICT-2026-07-16.md`.

## Відомі дірки (закрити наративом Єгора)
overlap card-після-тексту · одночасність swap · величини hold-ів.
