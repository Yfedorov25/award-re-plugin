---
id: news-air
name: "Зборка /news AIR (сервісна: News and offers — 3 картки-лінки)"
level: 3
kind: page-assembly
status: candidate
entry:
  call: "статична сторінка; на init: AirMenuOverlay.create() + CookieConsent.create([data-cc])"
  module: page
  returns: "—"
meaning:
  what: "Сервісна /news AIR (recon-20260706/live-news.html + live-news-top.png): HERO heading <h1 group group--between news-page__title> «News» ліворуч + «and offers» праворуч (статичний спред). СПИСОК (живий data-plugin=ajaxlist /ajax/news) = 3 КАРТКИ-ЛІНКИ <a href=/news/…> — фото (hotlink живі webp) + заголовок + дата + ✛-іконка внизу праворуч. ⚠️ Картки = ЛІНКИ на статті (перехід, data-ajax-page-transition=modal-in), НЕ plus-toggle-cards (in-place розкриття) — інтерпретація звірена по DOM. Футер ui-dark breadcrumb Home / News and offers."
  when: "Маршрут /news (News and offers) будь-якої AIR-репліки."
  lands: "News тримає лівий край, and offers — правий; нижче три новини живими рендерами AIR, кожна веде на статтю; hover підіймає картку і трохи зумить фото."
  not_when: "Не плутати з plus-toggle-cards (розкриття опису in-place) — тут ✛ декоративний, картка = лінк-перехід."
source:
  grammar: "recon-20260706/live-news.html: h1.group--between.news-page__title (News / and offers) + ul (data-plugin=ajaxlist /ajax/news) > li > a.news-card[href=/news/…] > picture.news-card__image + h*.news-card__title + .news-card__footer(date + btn--square ✛); footer breadcrumb Home / News and offers"
  recording: "live-news-top.png (heading спред + 3 картки з фото/дата/✛)"
  registry_ref: ["x: сервісна сторінка-збірка /news — маршрутний ряд матриці, окремого T-ID немає"]
stack: "vanilla; air-menu-overlay + cookie-consent атоми; фото hotlink aircenter.space; нуль скрол-движка"
webgl: false
motion_props: [opacity, transform, background-color]
trigger: "клік бургера (меню); клік/hover картки (лінк+підйом); клік ACCEPT (cookie)"
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
  - "hero heading: статичний спред group--between (News лівий край, and offers правий край — крайове прилягання ≤4px)"
  - "3 картки-ЛІНКИ (a[href^=/news/]) з фото hotlink + заголовок + дата + ✛; НЕ toggle"
  - "hover: transition на transform (картка translateY-4 + фото scale 1.03)"
  - "футер ui-dark breadcrumb Home / News and offers"
  - "меню-модал живий, cookie visible→accept→removed"
  - "loadStability CLS<0.1 + дрейф ≤4px; docHeight стабільна за прохід (безумовно); console errors == 0; НУЛЬ автоскролів"
  - "проби GREEN обома в'юпортами (1440×900 + 390×844)"
---

# news-air — три новини живими рендерами

Спринт-7, юніт 3/5 сервісних. HERO = живий `group--between` спред
(News / and offers). Список — 3 картки-**лінки** (не toggle: живий DOM
показав `<a href=/news/…>` + `data-ajax-page-transition=modal-in`, тому
plus-toggle-cards тут був би неправильною інтерпретацією). Фото — hotlink
живі webp aircenter.space (нуль асет-дір, на відміну від documents/developer).

Урок проби (спринт-7): спред-гейт «зазор > 30% ряду» ФАЛЬШИВИЙ на довгих
словах («and offers» з'їдає зазор) → замінено на крайове прилягання
(перше слово до лівого краю, останнє до правого ≤4px). Бекпорт у developer-air.
