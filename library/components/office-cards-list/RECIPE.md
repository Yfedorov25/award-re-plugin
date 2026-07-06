---
id: office-cards-list
name: "Каталог офісів: картки + фільтри + ♡ + sticky-бар (A-15 + T-409 + T-419 + T-408-частина)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "OfficeCardsList.create(root, offices, opts?)  // root: [data-ocl-filters] (chips [data-ocl-chip='b:N'] + [data-ocl-range='area|price'] з парою input[type=range]) + [data-ocl-sort-btn] + [data-ocl-view-btn] + [data-ocl-list] + [data-ocl-sticky] ([data-ocl-clear] + [data-ocl-counter]); бейдж хедера [data-ocl-fav-badge]. offices = живий формат {nr,area,floor,building,price,plan,href,locked?,oldPrice?}. opts: { onFav(count) }"
  module: iife
  returns: "{ filter(), state(), gate, destroy }"
meaning:
  what: "Каталог /offices AIR (жива сторінка знята дослівно): картки card-office (план-превʼю 540×420 з popover-збільшенням праворуч на hover · №/м²/Floor/Building · ціна пробілами · ♡ з чорною заливкою і бейджем-лічильником у хедері · 🔒 для зайнятих · струк-ціна з −5%), фільтри T-409 (chips будівель + двоповзункові range area/price з ЖИВИМ діапазоном 39 611 870–706 815 000 step 1M) з live-лічильником «Show N offices» без перезавантаження, сорт ціни ↑/↓, LIST/GRID перемикач, T-419 sticky-бар [Clear | лічильник] знизу. Лаба на ЖИВИХ даних (8 реальних офісів, плани hotlink)."
  when: "List-гілка конверсійного фунела (пара до visual-search дрілу); T-M30 — це ж і є моб-фунел."
  lands: "Список дихає під пальцями: посунув повзунок — лічильник у барі одразу перерахував, сортнув — найдорожчий сплив угору, ♡ залилось чорним і хедер порахував. Зайняті офіси чесно стоять під замком."
  not_when: "Мало юнітів (до ~6) — досить дріл-плану без списку."
source:
  grammar: "живий /offices: card-office / popover / favourite-конфіг / range (step 1M) / js-filter-result-counter / js-filters-sort / view-switcher; T-M30 закони (🔒, −5%, sticky-низ) з D_AIR_mobile_video §Р2.3"
  recording: "MOBILE-air-4.mp4 f-055..170 (list-фунел наживо)"
  registry_ref: ["T-409", "T-419", "T-408", "T-M30"]
stack: "vanilla, нуль залежностей (фільтри/сорт = чисті функції + ререндер; ♡/чіпи = класи)"
webgl: false
motion_props: [opacity, background-color, color, transform]
trigger: "input/click фільтрів (подієво); скролу нема (sticky-бар = CSS)"
timing_layer: [B-swap]
owns_pin: false
page_beat: [conversion]
combines_with: [visual-search-drill, funnel-curtain, building-floor-drill]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "картка = живий card-office: план+popover(right, 0.6s), №/м²/Floor/Building (grid: B-скорочення), ціна пробілами, ♡"
  - "фільтри: chips + range (живий діапазон/step) → live «Show N offices» (transchoice) на КОЖНУ зміну"
  - "♡: is-active чорна заливка ~0.2s + бейдж у хедері (число/9+); стани переживають ререндер"
  - "сорт: перша картка найдешевша/найдорожча; LIST/GRID через data-view-style"
  - "🔒: картка глуха (href #); знижка: струк-ціна + бейдж −5%"
  - "T-419: sticky-бар [Clear | лічильник]; Clear скидає чіпи і повзунки"
  - "нуль CLS; errors 0; destroy() чистить"
---

# office-cards-list — список, що дихає під фільтрами

Перший юніт Спринту-4, на живих даних. Далі в спринті: T-408 favourites
ПОВНА система (панель slide-down + email-шит) · A-13 unit-сторінка
(T-431 toggle + T-523 handoff) · SHOW MORE пагінація · зборка фунела
(юніт 6 спринту-3 + цей список + дріл + unit).
