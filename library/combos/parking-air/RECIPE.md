---
id: parking-air
name: "Зборка /parking AIR (сервісна: Parking selection + LEVEL ONE/TWO + план)"
level: 3
kind: page-assembly
status: candidate
entry:
  call: "статична сторінка; на init: AirMenuOverlay.create() + CookieConsent.create([data-cc]) + інлайн таби + план-движок"
  module: page
  returns: "—"
meaning:
  what: "Сервісна /parking AIR (recon-20260706/live-parking.html + live-parking-top.png): HERO h1 «Parking selection». ТАБИ LEVEL ONE / LEVEL TWO (перемикач планів) + легенда «Available spaces» (spaces is-hidden--sm-down) + маркер-квадрат. ПЛАН: інтерактивний SVG (живий = 1843 rect + 490 data-hoverable + 189 data-callback-modal — кожне місце hover-підсвітка + click-modal; підпис MALL). ⚠️ ТОЧНИЙ SVG (1843 місця) = АСЕТ-ДІРА — будуємо РЕПРЕЗЕНТАТИВНИЙ план на нашому інлайн plan-движку: 14 місць/рівень зі статусами available/sold (детерміновані, не random), hover-підсвітка + click-вибір, sold некликабельний. Механіка 1-в-1, геометрія — наша. Футер ui-dark breadcrumb Home / Parking."
  when: "Маршрут /parking (Choose a parking spot) будь-якої AIR-репліки — конверсійне ядро вибору місця."
  lands: "Parking selection, два рівні на пігулці, і план: зелені місця живі — наводиш, воно темніє, клік вибирає; сірі продані й не клікаються. Available spaces у легенді."
  not_when: "Коли зʼявиться точний архітектурний SVG-план паркінгу (1843 місця) — підмінити репрезентативну геометрію на живу (механіка вже готова). floor-plan-select (квартирний движок) для паркінгу надлишковий — свідоме спрощення (karpathy §2)."
source:
  grammar: "recon-20260706/live-parking.html: h1 Parking selection + LEVEL ONE/LEVEL TWO таби + legend Available spaces + великий SVG-план (data-hoverable×490, data-callback-modal×189, MALL); footer breadcrumb Home / Parking"
  recording: "live-parking-top.png (h1 + таби + легенда + SVG-план)"
  registry_ref: ["T-427", "x: сервісна сторінка-збірка /parking на plan-движку (T-427); маршрутний ряд матриці"]
stack: "vanilla; air-menu-overlay + cookie-consent атоми; інлайн plan-движок (SVG rect + hover/select) + таби"
webgl: false
motion_props: [opacity, transform, fill]
trigger: "клік бургера (меню); клік таба (свап рівня); hover/click місця (підсвітка+вибір); клік ACCEPT (cookie)"
timing_layer: [B-swap]
owns_pin: false
page_beat: [navigation, service-page, conversion]
combines_with: [air-menu-overlay, cookie-consent]
anti_combos: [second-overlay]
gated_by: [R_perf_limits]
variants: []
files: [combo-lab.html]
pin:
  count: 0
acceptance:
  - "hero h1 Parking selection"
  - "таби LEVEL ONE / LEVEL TWO: клік свапає активний + план міняється (available рахунок різний per level)"
  - "легенда Available spaces (spaces is-hidden--sm-down) + swatch"
  - "план: 14 місць/рівень, hover available → підсвітка (is-hover), click available → is-selected, sold некликабельний (no-op); статуси детерміновані (не random)"
  - "MALL підпис над планом; футер ui-dark breadcrumb Home / Parking"
  - "меню-модал живий, cookie visible→accept→removed"
  - "loadStability CLS<0.1 + дрейф ≤4px; docHeight стабільна за прохід (безумовно); console errors == 0; НУЛЬ автоскролів"
  - "проби GREEN обома в'юпортами (1440×900 + 390×844)"
---

# parking-air — конверсійне ядро вибору місця

Спринт-7, юніт 5/5 сервісних (фінал батчу). HERO + LEVEL ONE/TWO таби +
легенда Available spaces + інтерактивний SVG-план. Живий план — 1843 rect
(архітектурний), це АСЕТ-ДІРА; будуємо репрезентативний (14 місць/рівень,
статуси детерміновані per-level, hover+click+sold-noop) — механіка 1-в-1
з живим (data-hoverable + статус + модал), геометрія наша.

Свідоме спрощення (karpathy §2): floor-plan-select — квартирний движок
(units/floors/tooltips/compass), для паркінгу (місце = rect + статус)
надлишковий; інлайн plan-движок ~30 рядків.

Діри знань: точний SVG-план паркінгу (1843 місця, архрендер) — у дозйомку.
Статуси місць детерміновані (D-закон проб: жодного Math.random).
