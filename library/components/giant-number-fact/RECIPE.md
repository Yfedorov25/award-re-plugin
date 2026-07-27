---
id: giant-number-fact
name: "Giant number-fact (AIR T-422: гігантське число ~20-28vw з людським підписом; T-304: докрутка лічильником ОДИН раз на в'їзді; D6: DOM пишеться лише при зміні)"
level: 1
kind: component
status: official             # вердикт власника 2026-07-05: «топ» (цикл v1→v4: 15 зауважень → машинні проби, контракт D_AIR_invest_1to1)
entry:
  call: "GiantNumberFact.create(target, opts)  // target = [data-gnf] з [data-gnf-num data-gnf-value data-gnf-decimals] + [data-gnf-unit] + [data-gnf-label]. opts: { value (дефолт з data-gnf-value), decimals (0), duration (1.6s), ease ('air'), slidePx (80), start ('top 78%'), trigger:'scroll'|'manual' }."
  module: iife
  returns: "{ el, num, value, stats, played, play(), refresh(), destroy(), ready }"
meaning:
  what: "ОДНЕ гігантське число-факт (clamp ~20-28vw, дефолт clamp(72px, 21vw, 360px)) з малою версальною одиницею на базовій лінії і людським підписом під ним. Коли секція в'їжджає у в'юпорт (once:true, 'top 78%'), блок в'їжджає (translateY + opacity) і число докручується лічильником 0 → значення house ease-ом. ОДИН раз - скрол геть і назад НЕ передокручує. D6-закон лічильника: textContent пишеться ЛИШЕ коли відформатований рядок змінився; stats {ticks, writes} відкриті для машинної проби. Формат = копі-канон: тисячі нерозривним пробілом (22 800), десяткові комою (1,5); tabular-nums проти тремтіння, негативний трекінг великого кегля (C27). У markup стоїть ФІНАЛЬНЕ число - no-JS/reduced-motion правда без скриптів."
  when: "Один факт, який мусить ударити масштабом: ціна входу, хвилини до міста, метри, сотки. AIR ставить такі числа в lifestyle-слайди (400 STORES, 3 MIN WALK); EVR докручує їх лічильником на розділювачах (T-321). Бери, коли в біті РІВНО ОДНА величина (закон копі-канону: одна величина на одометр-рил) і їй потрібен весь кадр."
  lands: "Секція відкривається, і замість абзацу в очі їде число на пів-екрана, яке докручується до значення і стає: 22 800. Маленький підпис під ним каже, ЩО це. Число прочитане тілом раніше, ніж головою - і воно більше не смикається, скільки не гортай."
  not_when: "3-6 точок даних, кожній свій кадр (stat-odometer - пінований степер). Службові лічильники N/6 (C22 - заборонені). Фонова ghost-цифра як декор (C22: гігант-фон = шум). Датасет без чисел (C26: не вигадуй числовий хребет). Кілька величин в одному рилі (канон: одна величина). Число, що мусить жити в matching/таблиці - там звичайна типографіка."
source:
  grammar: "AIR — гігантські числа в lifestyle-слайдах (T-422); EVR — count-up гігант-факт на розділювачах (T-321 = T-304 + T-422)"
  recording: "skills/teardowns/references/D_AIR_video.md (§Драматургія п.4: гігантські числа «400 STORES», «3 MIN WALK») + _REGISTRY_TID T-422/T-304/T-321"
  registry_ref: ["T-422", "T-304"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (once-тригер; без Lenis - атом не володіє скролом)"
webgl: false
motion_props: [transform, opacity]
trigger: "ScrollTrigger once:true 'top 78%' (число в'їжджає ОДИН раз); або trigger:'manual' - інтегратор кличе play() у своїй партитурі"
timing_layer: [B-entrance]
owns_pin: false
owns_scroll: false
page_beat: [proof, divider]
combines_with: [invest-card-reveal, spread-row-headline, theme-tween, section-rise-into-view]
anti_combos: [numeral-odometer-roll, second-count-engine-in-beat]
gated_by: [R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "C27-масштаб машинно: computed font-size числа ≥ 18% ширини в'юпорта; letter-spacing НЕГАТИВНИЙ; tabular-nums увімкнений"
  - "ДРАЙВ реальним скролом (B14): секцію довезено у в'юпорт → семпли textContent на 120/300/800ms: значення ростуть монотонно, на 120ms докрутка ще НЕ доїхала; settled ДОСЛІВНО == «22 800» (тисячі нерозривним пробілом - формат канону)"
  - "блок доїхав: opacity 1, transform identity; bbox числа ПОВНІСТЮ у в'юпорті (гігант, що ріжеться краєм = провалений гігант)"
  - "десяткова кома канону: інстанс 1,5 settled ДОСЛІВНО == «1,5»"
  - "D6 машинно: інстанс value=5 - stats.writes ≤ 7 ПРИ stats.ticks > writes (лічильник пише DOM лише при зміні відформатованого рядка)"
  - "ONCE: скрол геть і назад - stats.ticks НЕ виросли, текст стоїть фінальним (число не смикається)"
  - "рух ТІЛЬКИ transform/opacity на блоці + textContent лічильника (D4/D6); нуль CSS transition на керованих властивостях (D3); NO mix-blend / NO backdrop / NO WebGL"
  - "мобільний гейт (≤768px, проба 390x844): число вміщається (bbox.left ≥ 16px, right ≤ vw - одиниця переноситься під число flex-wrap-ом, не ріже екран); докрутка і settled «22 800»; та сама D6-проба; сторінка ≤8 екранів, проміжки ≤1.5 екрана, текст-ректи left ≥ 16px"
  - "no-JS / reduced-motion / no-GSAP / NaN-value = СТАТИЧНА ПРАВДА: фінальне число з markup стоїть без руху, нуль трігерів"
  - "__LAB_OK__ виставляє ЛИШЕ lab після всіх проб + console errors == 0; на десктопі - десктопний пакет, на ≤768px - мобільний (B15: гейт не бреше)"
verify: "lab.html#__LAB_OK__"
gate:
  probe: "Відкрий lab.html (desktop). __LAB_OK__ true лише після проб (window.__PROBE = семпли докрутки в часі + scale/D6/once числа). Гортай: рендер → «Ціна входу»: 22 800 доларів в'їжджає і докручується один раз → рендер → темний акт «Свій двір»: 1,5 сотки (кома канону) → «Дорога»: 5 хвилин до Вінниці → рендер → хвіст. Прокрути назад і знову вниз: числа НЕ смикаються (once). На 390x844: число тримається в екрані, одиниця переноситься під нього."
note: |
  v1, кандидат до вердикту власника. Перевірка на дублікат перед побудовою
  (CONTRACT): stat-odometer = пінований степер N точок (інша роль і пін);
  numeral-odometer-roll = одометр-рол колонкою; minutes-bloom = пінована
  карта-секція; shared/counter = стаб. Атома «одне гігантське число-факт
  з докруткою і без піна» не було → новий атом, не варіант. Реєстрові
  мітки: T-422 (гігант-факт AIR) + T-304 (count-up на reveal; T-321 = їх
  канонічна пара на EVR). Мобільний переклад РЯДУ таких чисел у морозну
  свайп-стрічку = T-M18 і живе на рівні секції/комбо (invest--quiet-depth),
  не в цьому атомі. Копі lab-а - ТІЛЬКИ еталони _COPY_CANON (ЕТ-09/16/29),
  «ви»-регістр, нуль тире у видимому тексті (E1/B16).
---

# giant-number-fact: число на пів-екрана · докрутилось раз і стоїть

Атом числового удару AIR (T-422 + T-304). Одне число-факт величезним кеглем
(clamp ~21vw, негативний трекінг C27, tabular-nums), мала версальна одиниця
на базовій лінії, людський підпис під ним. На в'їзді секції у в'юпорт блок
під'їжджає (translateY + opacity) і число докручується house ease-ом до
значення - ОДИН раз (once:true). Лічильник шанує D6: DOM пишеться лише при
зміні відформатованого рядка, stats {ticks, writes} доводять це машинно.
Формат чисел = копі-канон: 22 800 (нерозривний пробіл), 1,5 (кома).
У markup стоїть фінальне число - без JS сторінка каже правду.

## Розмітка + виклик
```html
<div data-gnf>
  <span class="gnf-row">
    <span data-gnf-num data-gnf-value="22800">22 800</span>
    <span data-gnf-unit>доларів</span>
  </span>
  <span data-gnf-label>вхід з ремонтом під ключ</span>
</div>
```
```js
const fact = GiantNumberFact.create('[data-gnf]', { ease: 'air', duration: 1.6 });
await fact.ready;                 // fonts.ready + wire
// у власній партитурі: GiantNumberFact.create(el, { trigger: 'manual' }).play()
// fact.stats -> { ticks, writes } для машинної D6-проби
```

## Доведено (lab, headless-цифри)
Три канон-факти між full-bleed рендер-секціями (C11) на light/dark ритмі:
22 800 доларів (ЕТ-09), 1,5 сотки (ЕТ-29, доказ коми), 5 хвилин до Вінниці
(ЕТ-16, доказ D6). Виміряно 1440x900: кегль 302.4px = 21.0% vw, трекінг
-9.07px (негативний), tabular-nums on; семпли докрутки 9 602 → 17 241 →
22 485 на 120/300/800ms, settled дослівно «22 800», блок доїхав (opacity 1,
transform identity), bbox у кадрі; десятковий інстанс settled «1,5»;
D6-інстанс (value 5): 66 тіків проти 6 записів DOM; once-проба: 67 → 67
тіків після скролу геть і назад, текст стоїть; 0 console errors.
Мобільний пакет 390x844: число в екрані (одиниця переноситься під нього),
settled «22 800», D6 66/6, сторінка 4.65 екрана, максимальний проміжок
0.65 екрана, текст-ректи від 23.4px. Ті самі пакети зелені й на 1280x720.
Числа звіряються з window.__PROBE при кожному прогоні.
