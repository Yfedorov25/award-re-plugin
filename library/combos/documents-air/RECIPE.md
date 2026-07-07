---
id: documents-air
name: "Зборка /documents AIR (сервісна сторінка)"
level: 3
kind: page-assembly
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "статична сторінка; на init: AirMenuOverlay.create() + CookieConsent.create([data-cc])"
  module: page
  returns: "—"
meaning:
  what: "Сервісна сторінка /documents AIR, знята дослівно (recon-20260706/live-documents.html + live-documents-top.png): hero h1 «Documents» ліворуч + статична спіраль-картинка праворуч (НЕ Vimeo — на /documents iframe немає) + ПОРОЖНІЙ <ul class=document-list> (документів не опубліковано) + темний футер з breadcrumb Home / Documents. Хедер-обв'язка з робочим меню-модалом (air-menu-overlay, №9 no-giant desktop) і жива cookie-пігулка (cookie-consent)."
  when: "Маршрут /documents будь-якої AIR-репліки. Найтонша із сервісних — статична, без скрол-движка."
  lands: "Велике DOCUMENTS у тиші, спіраль дихає праворуч, список поки порожній — чесно, як на живому. Меню і cookie живуть як усюди."
  not_when: "Коли зʼявиться реальний список документів — дозняти рядки .document-list (зараз діра: живий список порожній, НЕ вигадуємо)."
source:
  grammar: "recon-20260706/live-documents.html: .container-h.pb-8.document-page > h1.leading-trim.mb-6 «Documents» + <ul.document-list></ul> (порожній) ; footer.ui-dark > ol.breadcrumbs (Home / Documents)"
  recording: "live-documents-top.png (hero+спіраль+футер-breadcrumb)"
  registry_ref: ["x: сервісна сторінка-збірка /documents — маршрутний ряд матриці, окремого T-ID немає"]
stack: "vanilla; air-menu-overlay + cookie-consent атоми; нуль скрол-движка"
webgl: false
motion_props: [opacity, transform, background-color]
trigger: "клік бургера (меню); клік ACCEPT (cookie)"
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
  - "hero: h1 «Documents» ліворуч + статична спіраль праворуч (спіраль-асет = діра, наш ambient-градієнт як у menu-lab)"
  - "document-list ПОРОЖНІЙ 1-в-1 з живим (0 li; порожній стан «No documents published»)"
  - "футер ui-dark з breadcrumb Home / Documents (current disabled)"
  - "меню-модал живий (air-menu-overlay open/close), cookie-пігулка visible→accept→removed"
  - "loadStability CLS<0.1 + дрейф ≤4px; console errors == 0; НУЛЬ автоскролів у live-режимі"
  - "проби GREEN обома в'юпортами (1440×900 + 390×844)"
---

# documents-air — найтонша сервісна, чесно порожня

Спринт-7, юніт 1/5 сервісних. Жива /documents — це майже порожня
сторінка: заголовок, спіраль, і `<ul class="document-list">` без жодного
рядка (документів на сайті ще нема). Вердикт Єгора: будуємо 1-в-1 з
порожнім списком, НЕ вигадуємо документи (BUILD-PROTOCOL §1.5).

Пін нуль. Скрол-движка нуль. Тільки хедер-меню + cookie як усюди.

Діри знань (у дозйомку, коли зʼявиться):
- реальні рядки `.document-list` (зараз порожній на живому);
- спіраль-асет (на живому — статична lazy-картинка, не Vimeo; беремо наш
  градієнт-плейсхолдер).
