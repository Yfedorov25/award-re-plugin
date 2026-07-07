---
id: progress-air
name: "Зборка /progress AIR (сервісна: Construction progress + місяць-слайдер)"
level: 3
kind: page-assembly
status: candidate
entry:
  call: "статична сторінка; на init: AirMenuOverlay.create() + CookieConsent.create([data-cc]) + інлайн місяць-слайдер"
  module: page
  returns: "—"
meaning:
  what: "Сервісна /progress AIR (recon-20260706/live-progress.html + live-progress-top.png): HERO 3-частинний спред <p class='h1 group group--between group--middle'> «Construction» (лівий край) + «Commissioning: 2028» (ЦЕНТР-kicker, is-hidden--sm-down) + «progress» (правий край) + 1px divider під. ГАЛЕРЕЯ: велике фото + оверлей-пігулка знизу центр ‹ «FEBRUARY 2026 ▾» › — місяць-слайдер (‹ › гортають 5 живих фото Feb 2026 hotlink, wrap; дропдаун = вибір місяця, живий лише February 2026). Футер ui-dark breadcrumb Home / Construction progress."
  when: "Маршрут /progress (Construction progress) будь-якої AIR-репліки."
  lands: "Construction і progress тримають краї, між ними — коли здача (2028); нижче велике фото будмайданчика і пігулка-місяць, стрілками гортаєш хроніку."
  not_when: "Коли зʼявиться >1 місяць — дропдаун активувати (зараз живий лише Feb 2026, гортання по фото цього місяця)."
source:
  grammar: "recon-20260706/live-progress.html: p.h1.group--between.group--middle (Construction / Commissioning:2028 mid / progress) + divider; галерея progress_image + слайдер-пігулка (prev/next arrows + month dropdown FEBRUARY 2026 ▾); footer breadcrumb Home / Construction progress"
  recording: "live-progress-top.png (3-спред + фото + слайдер-пігулка)"
  registry_ref: ["x: сервісна сторінка-збірка /progress — маршрутний ряд матриці, окремого T-ID немає"]
stack: "vanilla; air-menu-overlay + cookie-consent атоми; фото hotlink aircenter.space; інлайн місяць-слайдер (5 фото, wrap)"
webgl: false
motion_props: [opacity, transform, background-color]
trigger: "клік бургера (меню); ‹ › слайдер (фото-крослайд); клік ACCEPT (cookie)"
timing_layer: [B-swap]
owns_pin: false
page_beat: [navigation, service-page]
combines_with: [air-menu-overlay, cookie-consent]
anti_combos: [second-overlay]
gated_by: [R_perf_limits]
variants: []
files: [combo-lab.html]
pin:
  count: 0
acceptance:
  - "hero 3-спред group--between group--middle: Construction лівий край, progress правий (крайове прилягання ≤4px), Commissioning:2028 центр (is-hidden--sm-down)"
  - "1px divider під заголовком"
  - "галерея: 5 живих фото Feb 2026 (hotlink); слайдер ‹ › гортає (index+1/-1, wrap), рівно 1 .is-current"
  - "місяць-пігулка FEBRUARY 2026 ▾ по центру знизу фото"
  - "футер ui-dark breadcrumb Home / Construction progress"
  - "меню-модал живий, cookie visible→accept→removed"
  - "loadStability CLS<0.1 + дрейф ≤4px; docHeight стабільна за прохід (безумовно); console errors == 0; НУЛЬ автоскролів"
  - "проби GREEN обома в'юпортами (1440×900 + 390×844)"
---

# progress-air — хроніка будівництва з місяць-слайдером

Спринт-7, юніт 4/5 сервісних. Перший 3-частинний спред (group--middle:
Construction · Commissioning:2028 · progress) — центр-kicker ховається на
моб (is-hidden--sm-down, жива поведінка). Місяць-слайдер — інлайн (5 живих
фото Feb 2026 hotlink, ‹ › wrap, крослайд opacity 0.55s). Дропдаун місяців
= один живий (February 2026), тому гортання по фото цього місяця.

Діри знань: інші місяці (живий дропдаун має лише Feb 2026).
Урок: 3-частинний спред-гейт = крайове прилягання першого/останнього span
(центр ігнорується) — той самий фікс що news/developer.
