---
id: office-unit-card
name: "Unit-сторінка: специфікація + plan-tabs + FURNISHED + similar (A-13 + T-431 + T-523 + T-M31)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "OfficeUnitCard.create(root, office, opts?)  // root: [data-ouc-spec]/[data-ouc-price]/[data-ouc-reserve]/[data-ouc-fav]/[data-ouc-tabs]/[data-ouc-panels]/[data-ouc-toggle]/[data-ouc-similar]. office = { nr, code, area, floor, building, price, oldPrice?, plan, planFurnished, floorPlan?, masterPlan?, similar[] }. opts: { onReserve, onHandoff(nr), onFav }"
  module: iife
  returns: "{ tab(id), furnished(bool), gate, destroy }"
meaning:
  what: "Ядро A-13 (жива /office/AR-1-18): ліворуч специфікація (№/Area/Floor/Building/Code) + ціна пробілами + [Reserve ✛] + ♡; праворуч живі вертикальні plan-tabs «Office plan / On the floor / Master plan» (frosted, aria) з T-431 UNFURNISHED↔FURNISHED toggle, який живе ЛИШЕ на табі Office plan (закон T-M31) і свапає СПРАВЖНІ SVG plans/ ↔ plans-furnished/ того самого юніта; внизу T-523 similar-грід з ПЛАНАМИ-превʼю — клік = естафета юніт→юніт без повернення в список. Плани резервують живі 540×420 (нуль CLS). Лаба на живому офісі AR-1-18."
  when: "Фінальна сторінка фунела перед Reserve; ціль handoff-ів з дрілу і каталогу."
  lands: "Офіс лежить перед тобою кресленням: одна кнопка вмебльовує його, таби показують той самий метраж на поверсі й на генплані, а внизу сусідні плани кличуть погортати далі — не повертаючись у список."
  not_when: "Немає планів по юнітах (тоді фото-картка). Similar < 2 — грід не має сенсу."
source:
  grammar: "жива /office/AR-1-18 (live-archive): office-tabs--vertical + mini-plan-building + plans/plans-furnished шляхи + specs; T-M31 закони (toggle лише на OFFICE PLAN; press-state similar)"
  recording: "MOBILE-air-4.mp4 (unit-фрагменти §Р2.3)"
  registry_ref: ["T-431", "T-523", "T-M31"]
stack: "vanilla, нуль залежностей (таби/toggle = стани+ререндер; рух = CSS живої кривої)"
webgl: false
motion_props: [background-color, color, opacity]
trigger: "клік табів/toggle/similar (подієво)"
timing_layer: [B-swap]
owns_pin: false
page_beat: [conversion]
combines_with: [office-cards-list, favourites-panel, visual-search-drill, funnel-curtain]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "3 живі таби (aria-selected); панелі свапаються"
  - "T-431: toggle ЛИШЕ на Office plan (на інших табах зникає), свапає plans/↔plans-furnished/ живі SVG; стан переживає перемикання табів"
  - "специфікація + ціна пробілами (+del); Reserve → onReserve; ♡ → заливка"
  - "T-523: similar з планами-превʼю, клік → onHandoff(nr) (preventDefault)"
  - "плани з aspect-резервом 540/420 — нуль CLS від декоду"
  - "errors 0; destroy() чистить"
---

# office-unit-card — креслення, яке можна вмеблювати

Третій юніт Спринту-4 на живому AR-1-18. Лишилась ЗБОРКА ФУНЕЛА
(юніт 4 = дріл s3 + каталог + favourites + цей unit, екзамен DoD).
