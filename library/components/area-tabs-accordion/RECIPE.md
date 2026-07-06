---
id: area-tabs-accordion
name: "Площі офісів: таби ↔ акордеон (T-M25 + пара T-417/T-407)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "AreaTabsAccordion.create(root, opts?)  // root: [data-ata-tabs] + [data-ata-panel data-ata-label='79 м²']×N (план + гігант-число + CTA всередині). opts: { touchMq }"
  module: iife
  returns: "{ open(i), mode(), gate, destroy }"
meaning:
  what: "Живий дуальний блок площ /about (data-plugin='tabs accordion'): на десктопі — таби з живими площами (79/136.1/220.4/340 м², активний = інверсія 0.6s air), на моб — акордеон T-M25 (animate-height 0.45s air, press-state, ✛→45°, auto-scroll до відкритої — живий data-accordion-auto-scroll). Панель: план + гігант-число площі + [Choose an office ✛]. Multi-open на моб чесний: авто-закриття сусідів живим не зафіксоване — не вигадуємо."
  when: "Секція «оптимальні рішення» /about-типу: 4–6 форматів площ з планами; будь-який dual-режимний контент таби↔акордеон."
  lands: "На великому екрані площі стоять рядком-меню і перемикаються миттєво; на телефоні той самий ряд складається в акордеон — рядок прожимається, висота дихає, і плюс стає хрестиком."
  not_when: "2 панелі (досить пари кнопок). Контент без планів/чисел — це просто акордеон тексту."
source:
  grammar: "живий /about a-solutions-tabs: tabs accordion (enable-mq md-up/sm-down, auto-scroll) + живі площі; T-M25 (press-state, animate-height, floating-CTA)"
  recording: "MOBILE-air-2.mp4 f-190..252 (акордеон площ наживо)"
  registry_ref: ["T-M25", "T-417", "T-407"]
stack: "vanilla, нуль залежностей (таби = класи; акордеон = height-transition)"
webgl: false
motion_props: [background-color, color, transform, height, opacity]
trigger: "клік табу / тап голови акордеона"
timing_layer: [B-swap]
owns_pin: false
page_beat: [features, proof]
combines_with: [text-blur-reveal, plus-toggle-cards, office-cards-list]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "md-up: таби з живими площами, aria-selected, панелі свапаються"
  - "sm-down: акордеон — animate-height 0.45s air, press-state, ✛→45°, auto-scroll"
  - "multi-open чесний (без вигаданого авто-закриття); повторний тап закриває свою"
  - "нуль CLS; errors 0; destroy() чистить"
---

# area-tabs-accordion — ряд площ, що дихає висотою

П'ятий юніт Спринту-6. Лишилась ЗБОРКА /about (екзамен №4).
