---
id: favourites-panel
name: "Favourites: панель + email-шит (T-408 ядро + T-M30)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "FavouritesPanel.create(opts?)  // розмітка: [data-fvp] з [data-fvp-close]/[data-fvp-empty]/[data-fvp-list-wrap]([data-fvp-count]+[data-fvp-list]+[data-fvp-email])/[data-fvp-form]([data-fvp-mail]+[data-fvp-consent]+[data-fvp-send]+[data-fvp-done]). opts: { onSend(list) }"
  module: iife
  returns: "{ open(), close(), add(office), remove(nr), count(), isOpen(), gate, destroy }"
meaning:
  what: "Ядро T-408 (живий /offices): панель favourites — desktop слайд ЗЛІВА (живий modal--side--left --wide), моб slide-down ЗВЕРХУ (T-M30, кадри f-124..162); empty-стан «Your selected offices will appear here» + [Choose an office ✛] ↔ list-стан «Favorites / N offices» (живий transchoice) з рядками №/м²/floor/ціна і ✕; [Send by email ✉] відкриває шит: email + consent + [Send ✛] — невалідний сабміт чесно трясе форму, валідний показує скромний done (success живим НЕ знятий — А-07-канон, не вигадуємо). Крива панелі — жива modal-фазна 0.8s bezier(.7,0,.3,1). Пара до ♡ у office-cards-list (add/remove + бейдж)."
  when: "Разом із каталогом/дрілом: збирання підбірки офісів → email. Спільна система для 2 гілок фунела."
  lands: "Сердечка складаються у тиху ліву шухляду: відкрив — а там уже підбірка з цінами, ✕ зайвому, і один email до менеджера. На телефоні шухляда їде зверху, як шторка повідомлень."
  not_when: "Один-два юніти на сайті (досить прямого Reserve). Немає email-процесу — без шита."
source:
  grammar: "живий /offices: modal--side--left --wide + favouriteList endpoint + favouriteCounter transchoice; T-M30 кадри (панель зверху, «FAVORITES / 2 OFFICES», ✉ шит)"
  recording: "MOBILE-air-4.mp4 f-124..162 (♡ → панель → шит)"
  registry_ref: ["T-408", "T-M30"]
stack: "vanilla, нуль залежностей (стани = класи/hidden; рух = CSS transition живої кривої)"
webgl: false
motion_props: [transform, opacity]
trigger: "клік ♡/кнопок; Escape"
timing_layer: [B-swap]
owns_pin: false
page_beat: [conversion]
combines_with: [office-cards-list, visual-search-drill]
anti_combos: [second-overlay]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "панель: desktop зліва / моб зверху (T-M30), transform 0.8s bezier(.7,0,.3,1); Escape закриває"
  - "empty ↔ list перемикаються станом; лічильник transchoice («1 office»/«N offices»); ✕ прибирає рядок"
  - "email-шит: невалідний сабміт → invalid+shake, done схований; валідний → done + onSend(list)"
  - "success-стан = скромний A-07 (жива діра дозйомки №3 — НЕ вигадувати барокко)"
  - "нуль CLS; errors 0; destroy() чистить"
---

# favourites-panel — тиха шухляда з підбіркою

Другий юніт Спринту-4. Лишилось у спринті: A-13 unit-сторінка
(жива /office/AR-1-18 ВЖЕ в live-archive) + зборка фунела.
