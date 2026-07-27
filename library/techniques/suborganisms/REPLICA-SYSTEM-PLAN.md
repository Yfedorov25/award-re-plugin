# РЕПЛІКА-СИСТЕМА до ≤3% — ПЛАН (вердикт ради, 2026-07-15)

> Мета Єгора (/goal): кожен кадр скролу ≤2-3% відмінності від live, 1-в-1 весь сайт, з Nature→Place.
> Зараз 20-30%/кадр бо агент працює ВСЛІПУ (eyeball CSS + СУБСТИТУТ-фото). Рада (5 радників + 2 рев'ю +
> chairman) винесла вердикт. Транскрипт: `scratchpad/council-transcript-*.md`.

## 🔴 КОРІНЬ (чому не виходить)
1. **СУБСТИТУТ-ФОТО.** Live slider = `nature-slider-md-1/2/3@xxxl.webp` (є на springs.estate). Ми маємо
   лише md-1 + крихітні 40px. Рендеримо ІНШІ фото → сама картинка інша. Pixel-diff НЕ впаде <20% з чужим фото.
2. **ГЕОМЕТРІЯ НА ОКО.** Позиції/розміри/шрифти вгадані. Коли ВИМІРЯВ live bbox → diff впав на 20-60пт миттєво.
3. **НЕМА per-element gate.** Гейти сліпі до покадрової геометрії.
4. **ФАЗА не керована.** Порівнюємо наш проміжний стан з live-settled.

## 🎯 ВЕРДИКТ РАДИ (рішення)
«Live-сайт — це ДЕТЕРМІНОВАНИЙ КОД. ≤3% не ВІДКРИВАЄТЬСЯ діфом — він ВИЗНАЧАЄТЬСЯ 5 ground-truth входами:
реальні асети · scroll→progress transfer · per-element геометрія(t) · easing · композ. ЧИТАЙ істину →
діф ЛИШЕ сертифікує. Одиниця = element × keyframe. Кадр = емерджентний вихід, НЕ вхід.»

### Метрика (вирішено — НЕ raw-px скрізь):
- **DOM-шар → жорсткий ЧИСЛОВИЙ per-element gate** (bbox ≤2px · font ≤0.5px · opacity ≤0.02 · transform ·
  src basename == spec). Це satisfiable (числа проти чисел, імунний до AA й time-desync). ГОЛОВНИЙ гейт —
  каже агенту ЩО фіксити.
- **Pixel-шар → SSIM-ЗОНАЛЬНО (не raw ≤3%).** Raw-px на time-desynced full-bleed = НЕДОСЯЖНО (AA-стеля +
  фазовий зсув). Текст/фото-зони судити SSIM; геометричні/суцільні — тісний px-бюджет. (Пам'ять ssim-metric-unlock
  вже це ратифікувала: px роздував текстури й ховав пріоритети.)
- **≤3% raw-px гейт РЕТИРОВАНО** як покадровий — лишається слабким backstop на не-текст/не-фото зонах.
  DONE = кожен елемент кожної фази проходить ЧИСЛОВИЙ gate AND кожна зона проходить SSIM.

## 🔴 BLIND SPOTS що рада зловила (інакше б тихо отруїли все):
1. **SCRUB-CONTROL = майстер-ризик.** springs = progress-driven pin-scroll, `scrollTo`/wheel = NO-OP
   (пам'ять: рух лише через CDP `synthesizeScrollGesture`). Якщо скрапер не може ДРАЙВИТИ live до фази s —
   він читає ЗАМОРОЖЕНИЙ phase-0 DOM на КОЖНІЙ пробі → answer-key = сміття. Прекондиція всього.
2. **AA-СТЕЛЯ тексту** — субпіксельний AA дає ~кілька% floor, який ≤3%-px і ≤0.5px-font НЕ пройдуть → текст зонально.
3. **devicePixelRatio** headless ≠ live → КОЖЕН bbox зсунутий на масштаб. Пінити dpr=live.
4. **font-load/decode race** — міряти ДО `document.fonts.ready`+decode = хибний AA/layout.

## 📋 ПОРЯДОК ОПЕРАЦІЙ (кожен крок гейтить наступний)
1. **`scripts/drive-live.mjs` (ПЕРШИМ, доки не працює — нічого далі):** CDP `Input.synthesizeScrollGesture`
   рухає live pin-scroll до progress s; ВЕРИФІКУВАТИ що DOM реально змінився між s=0.0 і s=0.5 (transform
   відомого елемента різний). Пінити dpr=live, await fonts.ready+decode. Нейтралізує blind-spots 1/3/4.
2. **`scripts/spec-scraper.mjs`:** з робочим scrub — семпл s=0→1 крок 0.02 → `spec/frame-<s>.json`
   (per-element bbox + getComputedStyle transform/opacity/font/radius/z + `currentSrc` РЕАЛЬНИЙ webp URL).
3. **`scripts/download-assets.mjs`:** curl кожен currentSrc full-res. НУЛЬ субститутів.
4. **apply-spec:** копі-пейст чисел у білдер. НЕ на око.
5. **`scripts/element-gate.mjs`** (ГОЛОВНИЙ числовий).
6. **`scripts/frame-gate.mjs`** (SSIM-зональний, phase-aligned).
7. **Stop-hook G23 SpecGate:** DONE блокується доки не: кожен елемент кожної фази ✓ числовий AND кожна зона ✓ SSIM.

**ВІДКЛАСТИ** універсальний site-DNA extractor (Expansionist) доки Nature→Place не зелений — але скрапер
писати ЧИСТО (сам генералізується потім).

## ✅ ONE THING FIRST
Написати `drive-live.mjs` і ДОВЕСТИ що можна драйвити live springs до довільного s через CDP + перевірити
що DOM реально змінився (два різні transform на s=0.0 vs s=0.5). ДО жодного рядка скрапера. Якщо scrollTo
no-op і це пропустити — скрапер читає frozen phase-0 → весь answer-key сміття → ще тиждень матчингу до
неіснуючого spec.

## Нові гейти/правила (в award-re-plugin):
- **G23 SpecGate** (Stop-hook): блокує «готово/1-в-1» без свіжого element-gate(усі фази ✓) + frame-gate(SSIM ✓).
- **ПРАВИЛО:** заборонено субститут-асет — src basename МУСИТЬ == live currentSrc basename (element-gate ловить).
- **ПРАВИЛО:** заборонено eyeball-геометрію коли spec існує — числа з `spec/frame-<s>.json`, не з голови.
