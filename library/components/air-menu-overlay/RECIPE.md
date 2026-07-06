---
id: air-menu-overlay
name: "Меню-оверлей AIR + themed-хедер (A-17 + A-18 + T-M11)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника (прототип-перший)
entry:
  call: "AirMenuOverlay.create(opts?)  // розмітка: [data-amo-header]+[data-amo-burger]>[data-amo-burger-lines] · [data-amo-modal]>[data-amo-bg]+[data-amo-bg-image]+[data-amo-giant]+[data-amo-panel]>[data-amo-left]/[data-amo-right]>[data-amo-card] · секції з data-amo-theme. opts: { scope }"
  module: iife
  returns: "{ open(), close(), toggle(), isOpen(), theme(), gate, destroy }"
meaning:
  what: "Меню AIR (живий modal--menu, знято дослівно 2026-07-06): ДВОФАЗНИЙ ритуал 1.6s — завіса кольору теми 0.8s cubic-bezier(.7,0,.3,1), потім (delay .8s) frosted-панель (translateY 30→0) + спіраль-фон + ГІГАНТ-лого зліва; close дзеркально (панель до −30 першою, фон другим). Панель md-up: frosted (blur 20px), списки 68.57% / CTA-плитки 31.43% через 1px лінії. A-18: хедер fixed перефарбовується під секцію 1.2s cubic-bezier(.25,.74,.22,.99); відкрите меню має пріоритет теми. Бургер: 2 спани → хрест .6s. T-M11 моб: column-reverse (CTA-плитки НАД списками — контекстний наступний крок), спіраль fixed 100svh, АКТИВНИЙ пункт посірілий (opacity .35, «ти вже тут»)."
  when: "Головна навігація будь-якої сторінки AIR-репліки: 4 великі пункти + 3 малі + 2 конверсійні плитки. Хедер-обв'язка A-18 — на кожній сторінці з чергуванням світлих/темних актів."
  lands: "Тап MENU — і спершу дихання: колір теми накриває сторінку, лише потім у цю тишу в'їжджає панель з пунктами і гігантські літери бренду. Закривається так само чемно, у зворотному порядку. Хедер весь час живе кольором акту під ним."
  not_when: "Сайти з іншою мовою меню (dual-panel-menu = SAISEI). Односторінкові лендинги без навігації. Якщо в біті вже йде інший full-screen оверлей (модалка фільтрів тощо) — один оверлей за раз."
source:
  grammar: "живий DOM/CSS aircenter.space (витяг 2026-07-06): modal--menu + animation--modal-in/out--(in)active (двофазні transition-delay), .menu md-up/n-md, .header transition 1.2s + data-plugin=themed, .icon-menu span .6s"
  recording: "MOBILE-air.mp4.MP4 t74–79 (T-M11 наживо: відкриття, плитки зверху, посірілий LOCATION, перехід у /management)"
  registry_ref: ["T-M11", "x: A-17 (меню-оверлей) + A-18 (themed-хедер) — архітектурні ряди матриці §2, T-рядків нема"]
stack: "vanilla, нуль залежностей (весь рух = CSS transitions; JS тільки класи + IO теми)"
webgl: false
motion_props: [opacity, transform, background-color]
trigger: "клік/тап бургера; Escape; скрол — лише тема хедера (IO, без скрабу)"
timing_layer: [B-swap]
owns_pin: false
page_beat: [navigation]
combines_with: [theme-tween, preloader-logo-convoy, kinetic-letters-hero, funnel-curtain]
anti_combos: [second-overlay]
gated_by: [R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "open двофазний: фон 0.8s bezier(.7,0,.3,1) ПЕРШИЙ; панель/спіраль/гігант з delay .8s (панель translateY 30→0)"
  - "close дзеркальний: панель (до −30)/спіраль/гігант гаснуть одразу, фон чекає .8s; після хвоста модал visibility:hidden"
  - "панель md-up: frosted blur 20px, 68.571/31.429, плитки через 1px лінію"
  - "A-18: хедер background-color/color 1.2s air-bezier; тема = секція під лінією хедера (IO верхні 12%); меню відкрите → тема меню, close → повернення теми секції"
  - "бургер: 2 спани → хрест (translateY ±4px + rotate ±45°) .6s bezier(.29,.73,.45,1)"
  - "моб (T-M11): column-reverse (плитки НАД списками), активний пункт [aria-current] посірілий і некликабельний"
  - "скрол-лок html при відкритому меню; Escape закриває; reduced-motion не ламає (переходи дозволені — подієві, не скраб)"
  - "рух = opacity/transform/background-color ТІЛЬКИ, все в CSS; destroy() чистить класи і слухачі"
---

# air-menu-overlay — спершу дихання теми, потім панель

П'ятий юніт Спринту-2. Двофазність знята з живих класів
`animation--modal-in/out--(in)active`: у CSS це просто ДВІ ПАРИ
transition-delay — у відкритому стані чекає панель, у закритому чекає
фон. Жодного JS-таймлайна: движок лише перемикає `.amo-open`.

```html
<header data-amo-header> … <button data-amo-burger>
  <span data-amo-burger-lines><i></i><i></i></span> MENU</button></header>
<div data-amo-modal class="amo-closed" aria-hidden="true">
  <div data-amo-bg></div>
  <div data-amo-bg-image></div>
  <div data-amo-giant>AIR</div>
  <nav data-amo-panel>
    <div data-amo-left>…списки (активний з aria-current)…</div>
    <div data-amo-right><a data-amo-card>…</a><a data-amo-card>…</a></div>
  </nav>
</div>
<section data-amo-theme="dark">…</section>
<script> AirMenuOverlay.create(); </script>
```

За межами атома (на зборку): справжній перехід за пунктом меню
(біла штора T-M22 / чорна фунел-штора T-M29 — сім'я прелоадерів),
favourites-♡ у хедері (T-408, спринт 4).
