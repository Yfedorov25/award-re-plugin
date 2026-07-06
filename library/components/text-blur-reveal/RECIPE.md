---
id: text-blur-reveal
name: "Text blur-reveal каскад (AIR reveal-канон)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника (прототип-перший)
entry:
  call: "TextBlurReveal.create(sections, opts)  // sections = селектор/Element/Element[] секцій-груп; у кожній [data-brv] елементи з data-brv-order (0=заголовок, 1=цифри, 2=параграфи, 3=CTA). opts усі опційні: { duration (0.3s), lag (0.18s), blurFrom (10px), ease ('out-quad'|'air'), threshold (0.18), jumpVh (0.45), keyMedia (decode-гейт), autoArm (true) }"
  module: iife
  returns: "{ groups, gate, log, arm, settled, destroy }  (або { static:true, destroy } у reduced-motion / no-GSAP гілці — контент видимий одразу)"
meaning:
  what: "ОСНОВНИЙ reveal-канон AIR: текст в'їжджає filter blur(10px)→0 + opacity, БЕЗ y-зсуву. ОДИН каскад на секцію за ордером (заголовок → цифри → параграфи) з лагом 0.18s, 0.3s на елемент, once по скрол-тригеру. Секція, досягнута стрибком або мідскролом, рендериться settled МИТТЄВО без анімації (Д4б); звичайний скрол-крок скасовує стрибок-мітку (maintenance-фікс); озброєння чекає decode() ключових медіа."
  when: "Будь-яка текстова поява на сайті з reveal-мовою AIR — kicker'и, заголовки, службові числа, параграфи карток, CTA-ряди. Це системний атом-канон: усі секції сайту говорять ОДНІЄЮ мовою появи (half T-M23 mobile reveal-канону — та сама механіка на тачі)."
  lands: "Текст не «під'їжджає», а ПРОЯВЛЯЄТЬСЯ з розфокуса на своєму місці — дорого і тихо, як наведення різкості в кіно. Каскад дає порядок читання (спершу заголовок, тоді цифри, тоді дрібне), нуль стрибків лейауту, нуль повторних програвань."
  not_when: "Медіа/картинки (це ТЕКСТОВИЙ канон; медіа-blur→sharp = окремий шов). Секції під піном, де текст мусить скрабитись прогресом (канон = time-based once, НІКОЛИ не scrub). Сайти без AIR reveal-мови (у SAISEI/Springs свої канони появи)."
source:
  grammar: "AIR /investment всюди (v1-v4): blur→sharp + opacity без y-зсуву — системна ТЕКСТОВА хореографія цілої сторінки; движок = бойовий blur-reveal v3 з invest--quiet-depth + invest--strategy-machine (вердикт власника «топ» 2026-07-05), систематизований атомом без переписування законів"
  recording: "skills/teardowns/references/D_AIR_invest_1to1.md §3.1/§6.1"
  registry_ref: ["T-322", "T-M23"]
stack: "vanilla + GSAP 3.12.5 (без ScrollTrigger — IntersectionObserver + sync scroll-jump listener)"
webgl: false
motion_props: [filter, opacity]
trigger: "IntersectionObserver threshold 0.18 per-секція, once; sync scroll-listener ловить стрибки (delta > 0.45vh/подію) → instant-settled"
timing_layer: [B-entrance]
owns_pin: false
page_beat: [hero, proof, material, conversion]
combines_with: [spread-row-headline, giant-number-fact, case-tabs-table, theme-tween]
anti_combos: [scrub-reveal]
gated_by: [R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "рух = filter blur(10px→0) + opacity ТІЛЬКИ, БЕЗ y-зсуву (контракт §3.1): top елемента до/після reveal стабільний ±1.5px"
  - "D4-виняток свідомий: one-shot ≤0.3s/елемент, time-based, НІКОЛИ не scrub; will-change ставиться перед твіном і чиститься onComplete"
  - "Д4(а): ОДИН каскад на секцію, delay = order × lag (елементи одного ордера разом), once — група ніколи не перезапускається"
  - "Д4(б): стрибок/мідскрол-прихід/проскочена секція = settled МИТТЄВО без анімації; після стрибка НУЛЬ [data-brv] у проміжних станах (opacity 0.05..0.95 / blur 0.5..9.5px)"
  - "рейс-стійкість: рішення «каскад чи instant» відкладене на один кадр після IO-колбека; звичайний скрол-крок (delta>2px) скасовує стрибок-мітку"
  - "decode-гейт: озброєння після decode() keyMedia — reveal не стартує на пікселях, яких ще нема"
  - "no-GSAP / prefers-reduced-motion = контент видимий одразу, движок не ховає нічого (static-гілка)"
  - "loadStability: CLS < 0.1, дрейф якоря ≤ 4px"
---

# text-blur-reveal — AIR reveal-канон як системний атом

Систематизація движка blur-reveal v3, що двічі пройшов бій в invest-комбо
(вердикт власника «топ» 2026-07-05). Закони перенесені 1-в-1, нічого не
переписано: Д4(а) секційний каскад за ордером, Д4(б) instant-settled на
стрибку/мідскролі, рейс-стійкість IO vs scroll, maintenance-фікс
стрибок-мітки, decode-гейт.

Розмітка: `[data-brv]` + `data-brv-order="0|1|2|3"`
(0 = kicker/заголовок · 1 = цифри/титули · 2 = параграфи · 3 = CTA).

```html
<section id="act">
  <p data-brv data-brv-order="0">Kicker</p>
  <h2 data-brv data-brv-order="1">Заголовок</h2>
  <p data-brv data-brv-order="2">Параграф.</p>
</section>
<script>
  TextBlurReveal.create('#act', { keyMedia: '#hero img' });
</script>
```

Конституційна примітка: `filter: blur` не входить у D4-список
(transform/opacity/clip-path). Виняток дозволений СВІДОМО і вузько —
one-shot ≤0.3s/елемент, time-based. Скрабити блюр заборонено назавжди.

T-M23 (мобільна половина): та сама механіка на тачі без змін —
IO + стрибок-детектор працюють однаково; друга половина T-M23
(tap-карусель push-wipe) — окремий атом спринту 2 (T-512-родич).
