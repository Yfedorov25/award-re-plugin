---
id: developer-air
name: "Зборка /developer AIR (сервісна: TEKTA Group + команда проєкту)"
level: 3
kind: page-assembly
status: candidate
entry:
  call: "статична сторінка; на init: AirMenuOverlay.create() + PlusToggleCards.create([data-ptc-root]) + CookieConsent.create([data-cc])"
  module: page
  returns: "—"
meaning:
  what: "Сервісна /developer AIR (recon-20260706/live-developer.html + live-developer-top.png): HERO статичний спред-ряд «TEKTA … GROUP» (flex space-between = живий group--between; НЕ converge-act-divider) + центр-kicker «Building the best on every site» + статична спіраль (на /developer Vimeo немає — асет-діра, наш градієнт). INTRO: жива копі «TEKTA Group is a full-cycle development company…». PROJECT TEAM: 3 партнер-картки з ✛-розкриттям (plus-toggle-cards) — ADM Bureau / haast / Sawatzky з живими описами. Футер ui-dark breadcrumb Home / About the developer."
  when: "Маршрут /developer (About the developer) будь-якої AIR-репліки."
  lands: "TEKTA і GROUP тримають два краї екрана, між ними дихає спіраль; нижче — хто будує AIR: троє партнерів, кожен розкривається по ✛."
  not_when: "Якщо колись підтвердиться, що живий title converge→spread на скролі (data-scroll-sticky) — перекласти на spread-row-headline замість статичного group--between."
source:
  grammar: "recon-20260706/live-developer.html: hero group--between (TEKTA/GROUP) + kicker; intro lead-копі; project-team = картки партнерів (ADM 2006 / haast 2016 / Sawatzky 1100+ 2016); footer breadcrumb Home / About the developer"
  recording: "live-developer-top.png (hero спред + спіраль)"
  registry_ref: ["x: сервісна сторінка-збірка /developer — маршрутний ряд матриці, окремого T-ID немає"]
stack: "vanilla + GSAP/ScrollTrigger/Lenis (guarded smooth-scroll); air-menu-overlay + plus-toggle-cards + cookie-consent атоми"
webgl: false
motion_props: [opacity, transform, background-color]
trigger: "клік бургера (меню); клік ✛ (партнер-картки); клік ACCEPT (cookie)"
timing_layer: [B-swap]
owns_pin: false
page_beat: [navigation, service-page]
combines_with: [air-menu-overlay, plus-toggle-cards, cookie-consent]
anti_combos: [second-overlay]
gated_by: [R_perf_limits]
variants: []
files: [combo-lab.html]
pin:
  count: 0
acceptance:
  - "hero: статичний спред-ряд TEKTA … GROUP (зазор > 30% ширини ряду) + центр-kicker + спіраль (асет-діра, градієнт)"
  - "intro: жива копі full-cycle development company (2 абзаци)"
  - "project team: 3 plus-toggle-cards (ADM/haast/Sawatzky), ✛ розкриває живий опис, стан міняється"
  - "футер ui-dark breadcrumb Home / About the developer"
  - "меню-модал живий, cookie visible→accept→removed"
  - "loadStability CLS<0.1 + дрейф ≤4px; console errors == 0; НУЛЬ автоскролів у live"
  - "проби GREEN обома в'юпортами (1440×900 + 390×844)"
---

# developer-air — хто будує AIR

Спринт-7, юніт 2/5 сервісних. HERO = живий `group--between` спред-ряд
TEKTA…GROUP статично (НЕ converge-act-divider spread-row-headline — на
скріні title стоїть спред при завантаженні; scroll-converge не
підтверджено, лишено як TODO у not_when). Команда = 3 партнер-картки на
`plus-toggle-cards` (спільний атом з /news і /about ✛-пар).

Діри знань: спіраль-асет (на живому lazy-картинка, не Vimeo — наш градієнт);
чи title converge→spread на скролі (зараз статичний спред 1-в-1 зі скріном).
