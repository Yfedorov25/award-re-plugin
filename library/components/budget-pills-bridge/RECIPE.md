---
id: budget-pills-bridge
name: "Budget pills bridge (AIR B4-міст: 2-3 бюджет-пілюлі з deep-link пре-фільтром ціни ?price[from]&price[to] у каталог; конверсійний шов після кожної моделі стратегії)"
level: 1
kind: component
status: official             # вердикт власника «топ» 2026-07-05 (відео-проба на телефоні, хвиля 2)
entry:
  call: "BudgetPillsBridge.create(target, opts)  // target = <nav data-bpb data-bpb-base> з <a data-bpb-pill data-from data-to>; opts: { base ('#каталог' - заглушка до появи каталога) }. Компонент лише збирає href-и та плюс-іконки; стани = CSS."
  module: iife
  returns: "{ root, pills, links(), destroy, ready }"
meaning:
  what: "Ряд із 2-3 бюджет-пілюль після моделі стратегії (контракт D_AIR_invest_1to1 §1 B4): кожна = deep-link у каталог із пре-фільтром ціни `?price[from]=F&price[to]=T` - дослівний query-контракт, знятий зі статус-бара AIR (живе підтвердження A-12/T-409). Висота ~4.4vh, плюс-іконка праворуч, на мобайлі тап-таргет ≥44px. Секція не розповідає - вона продає конкретний зріз інвентаря."
  when: "Конверсійний місток одразу після доказового біта (модель стратегії, кейс-таблиця): читач щойно побачив числа - дай йому один тап у каталог уже відфільтрований під його бюджет. Контракт повторює міст після КОЖНОЇ моделі."
  lands: "Під таблицею три тихі пілюлі з бюджетами. Тап - і каталог відкривається вже з твоїм ціновим зрізом: нуль форм, нуль питань, шлях від доказу до інвентаря за один жест."
  not_when: "Без каталога-приймача у проді (заглушка тільки для бази/лаб - контракт лінка задокументований, приймач = visual-search наступних хвиль). Як заміна повної фільтр-панелі T-409 (це швидкий вхід, не фільтри). Діапазони, не прив'язані до реального інвентаря (F1: межі = інтерфейс, але якорі - з канону)."
source:
  grammar: "AIR /investment B4 «CHOOSE AN OFFICE»: UP TO 50 MILLION / 50-150 MILLION / 150+ MILLION, плюс-іконки, deep-link offices?price[from]&price[to] у статус-барі; повторюється після Rental Income і після Asset Resale"
  recording: "skills/teardowns/references/D_AIR_invest_1to1.md (§1 B4, §6.8: deep-link підтверджено живцем) + D_AIR_mobile_video.md (§5 f208-210: 3 pill-діплінки за бюджетом)"
  registry_ref: ["T-409"]
stack: "vanilla (нуль GSAP - стани CSS, механіки руху нема)"
webgl: false
motion_props: []
trigger: "клік/тап пілюлі = навігація по deep-link (подієвий атом)"
timing_layer: [A-ambient]
owns_pin: false
owns_scroll: false
page_beat: [conversion, bridge]
combines_with: [case-tabs-table, invest-card-reveal, conversion-quiet-gate]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "PROBE_MODE (закон кола): проби лише при navigator.webdriver/?probe; живий перегляд без автоскролів"
  - "loadStability (D14): head-inline перший кадр; CLS < 0.1 + дрейф якорів ≤ 4px за 1s"
  - "DEEP-LINK КОНТРАКТ: рівно 3 пілюлі; кожен href = base + `price[from]=F&price[to]=T` з числами розмітки, ДОСЛІВНИЙ синтаксис дужок як в AIR (проба перевіряє формат параметрів на stub-base '#каталог')"
  - "ФОРМА: пілюля (border-radius ≥ висота/2 − 1, C12); висота ≈4.4vh на десктопі (±1.2vh) і ≥44px на мобайлі; 3 плюс-іконки; один ряд на десктопі (top-и ±2px)"
  - "КОНТРАСТ тексту пілюлі проти зблендованого філу ≥ 4.5:1"
  - "гігієна: сторінка без x-переповнення; текст-ректи ≥ 16px; console errors == 0; __LAB_OK__ лише від lab (B15)"
verify: "lab.html#__LAB_OK__"
gate:
  probe: "Відкрий lab.html?probe (або headless). __LAB_OK__ true після stability/links/shape/contrast пакетів (__PROBE = href-и і габарити). Живий перегляд: під CTA-рядком «Обрати місце в ряду» три пілюлі з бюджетами; ховер трохи темнішає; статус-бар показує ?price[from]=…&price[to]=…"
note: |
  Хвиля 2. ЧЕСНА РОЗБІЖНІСТЬ ФОРМИ: контракт §1 B4 міряв «світло-сірі
  ПРЯМОКУТНИКИ (радіус малий, це НЕ пілюлі)»; конституція C12 забороняє
  прямокутні ghost-кнопки, і координатор 2026-07-05 явно замовив пілюлі -
  зроблено пілюлями на контрактних габаритах (4.4vh, плюс праворуч);
  фінальне слово за власником на вердикті. Діапазони лаби = фільтр-межі
  навколо канон-якорів інвентаря (22 800 смарт · 67 000 таунхаус), не
  ринкові твердження (F1). База '#каталог' = свідома заглушка: приймач
  (visual-search каталог) ще не збудований; при його появі змінюється
  ЛИШЕ base - query-контракт A-12/T-409 уже зафіксований і пробується.
---

# budget-pills-bridge: від доказу до інвентаря за один тап

Конверсійний шов AIR B4. Після таблиці моделі - ряд бюджет-пілюль; кожна
несе готовий пре-фільтр ціни в каталог (`?price[from]=F&price[to]=T`,
знято дослівно зі статус-бара AIR). Нуль руху, нуль форм: чистий CSS +
зібрані href-и. На мобайлі пілюлі тримають тап-таргет 44px і переносяться
рядами.

## Розмітка + виклик
```html
<nav data-bpb data-bpb-base="#каталог">
  <a data-bpb-pill data-from="0" data-to="30000">До 30 000 доларів</a>
  <a data-bpb-pill data-from="30000" data-to="70000">30 000 · 70 000 доларів</a>
  <a data-bpb-pill data-from="70000" data-to="200000">Від 70 000 доларів</a>
</nav>
```
```js
const bpb = BudgetPillsBridge.create('[data-bpb]');
bpb.links(); // ['#каталог?price[from]=0&price[to]=30000', ...]
```

## Доведено (lab, headless-цифри)
Міст під канон-CTA «Обрати місце в ряду» на панелі #ececea. Числа
дзеркалять window.__PROBE прогону на 1440x900 / 390x844 / 1280x720:
3 href-и з дослівним query-контрактом, пілюльна форма на контрактних
габаритах, контраст ≥4.5, CLS/дрейф у межах. Точні цифри - у
вердикт-звіті сесії.
