---
id: gravity-well
name: "Gravity-well (T-509: м'який магнітний доводчик скролу — в'язкість біля коротких секцій, НЕ snap-trap)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "GravityWell.create(opts?)  // розмітка: <section data-gw-point> на КОРОТКИХ index/map секціях. opts: { radiusSvh, nudgeMax, settleVel, minPull, enableTouch(false), scope }"
  module: iife
  returns: "{ gate, points(), _pullAt(y,vel), destroy }"
meaning:
  what: "T-509 gravity-well — м'який магнітний доводчик скролу, знятий з живого air-shared.js (updateGravityWellLerp/Delta). Біля точки-свердловини (центр короткої секції) плавний скрол стає ГУСТІШИМ (жива механіка: lerp*=factor), і коли користувач ВІДПУСТИВ (швидкість ~0) ціль м'яко підтягується до центру. Вільний скрол ЗАВЖДИ проходить наскрізь — це В'ЯЗКІСТЬ, НЕ snap-jump. desktop-only (на тачі вимкнено, живий закон). Наш переклад не володіє smooth-scroll (щоб не воювати з Lenis): довідник на нативному скролі — мікро-scrollBy до центру ∝ дистанції, ТІЛЬКИ на низькій швидкості (anti-trap)."
  when: "КОРОТКІ index/map секції (вибір поверху, карта, короткий індекс) — де ніжне тяжіння до центру допомагає читанню. desktop."
  lands: "Коли повільно докочуєшся до короткої index-секції і майже зупиняєшся — вона ніжно доводить погляд у центр, як магніт. Гортаєш активно — магніту немає, скрол вільний."
  not_when: "⛔ НІКОЛИ під довгим reveal / контентною секцією, яку ЧИТАЮТЬ (рада: scroll-trap неправильний для RE — R_anti_combos). ⛔ Не стакати зі scroll-snap CSS. ⛔ Не на тачі (вимкнено). ⛔ Не як основний прийом — на AIR майже не вживається (🔶 обережно; це прийом Silver Pinewood)."
source:
  grammar: "живий air-shared.js: updateGravityWellLerp(t) — у зоні [offset ± n·Pe.d] lerp*=clamp((|t−center|/e + Pe.c)/(1+Pe.c)); updateGravityWellDelta — e.next -= l·i·(1−Pe.b); data-scroll-gravity-well='[{viewport,element}]' + data-scroll-snap-point"
  recording: "D_AIR_mobile_video.md §T-509: «НЕ СПОСТЕРІГАЄТЬСЯ на тачі — вимкнений»; _TECHNIQUE_REGISTRY.md (🔶 council: НЕ scroll-trap)"
  registry_ref: ["T-509"]
stack: "vanilla, нуль залежностей (rAF-довідник на нативному скролі; НЕ володіє smooth-scroll)"
webgl: false
motion_props: [scroll]
trigger: "скрол біля точки на низькій швидкості (desktop); тач = вимкнено"
timing_layer: [A-scroll]
owns_pin: false
page_beat: [navigation, index, map]
combines_with: [locmap-engine, visual-search-drill]
anti_combos: [long-reveal, scroll-snap-css, second-overlay]
gated_by: [R_anti_combos, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ANTI-TRAP (головне): при швидкості > settleVel pull==0 — активне гортання НІКОЛИ не смикається, скрол вільний наскрізь"
  - "напрям: нижче центру pull<0 (вгору), вище pull>0 (вниз), РІВНО в центрі pull==0 (нуль дзижчання)"
  - "згасання: поза зоною (|d|>radius) pull==0; скрізь |pull| ≤ nudgeMax"
  - "конвергенція: після settle біля точки scrollY СХОДИТЬСЯ до центру, без overshoot/осциляції"
  - "desktop-only: на тачі gate.disabled==true, points()==[], нуль nudges (живий закон)"
  - "loadStability CLS<0.1 + дрейф ≤4px; console errors == 0; НУЛЬ автоскролів у live"
  - "проби GREEN обома в'юпортами (1440×900 desktop-магніт / 390×844 вимкнено)"
---

# gravity-well — магніт, не пастка

Останній юніт спринту-7 (свідомо останній — найризикованіший). Жива
правда врятувала від пастки: T-509 у air-shared.js = **модуляція lerp**
біля точки (в'язкість), НЕ snap-jump. `updateGravityWellLerp` множить
`scroller.scroll.lerp` на фактор <1 у зоні → скрол густішає; вільний
скрол проходить. Рада: тільки короткі index/map, НІКОЛИ під reveal.

Наш переклад НЕ володіє smooth-scroll (Lenis родини) — довідник на
нативному скролі: мікро-`scrollBy` до центру ∝ дистанції, ТІЛЬКИ коли
швидкість ~0 (anti-trap: активне гортання завжди вільне). На тачі
вимкнено (живий закон).

Діри знань: точні константи тяжіння Pe.b/Pe.c/Pe.d (заміфіковані у
webpack-модулі за числовим індексом) — консервативні дефолти позначені
law:"gap" у tokens. На AIR ефект майже невидимий (🔶 обережно) — це
прийом Silver Pinewood; тримати стриманим.
