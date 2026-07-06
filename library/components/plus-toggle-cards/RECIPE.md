---
id: plus-toggle-cards
name: "✛-toggle картки: in-place крос-фейд (T-M24 + пара T-417)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "PlusToggleCards.create(root, opts?)  // root: [data-ptc-card]×N, кожна з [data-ptc-face] (назва+іконка+[data-ptc-plus]) і [data-ptc-popup]. opts: { touchMq }"
  module: iife
  returns: "{ states(), gate, destroy }"
meaning:
  what: "Живі сервіс-картки /management (card-team--service + cardHover) і ✛-картки /about (PREMIUM TECH / INNOVATIVE ENG): лице картки (назва + контур-іконка + ✛) крос-фейдиться IN-PLACE у попап зі списком (0.35s air), ✛ обертається на 45° (стає ×), стани карток НЕЗАЛЕЖНІ й переживають свайп (T-M24). Desktop: hover-активація (живий cardHover) + клік-фіксація; тач: тап-toggle."
  when: "Ряди сервісів/переваг ~4–12 карток (/management ~12, /about ✛-пари); будь-який factsheet з розкриттям на місці."
  lands: "Картка не веде нікуди — вона обертається змістом на місці: плюс стає хрестиком, назва поступається списку. Кожна живе своїм життям: відкрив дві поруч — порівнюй."
  not_when: "Довгі тексти (це акордеон T-M25). Один великий блок (не грід)."
source:
  grammar: "живий /management-service: card-team--service + cardHover + btn--rotation; T-M24 (dense svc-09..16: крос-фейд ~0.3–0.4с, стани незалежні)"
  recording: "MOBILE-air.mp4 t82–94 (сервіс-картки з ✛ наживо)"
  registry_ref: ["T-M24", "T-417"]
stack: "vanilla, нуль залежностей (стани = класи; рух = CSS transitions)"
webgl: false
motion_props: [opacity, transform]
trigger: "hover (desktop cardHover) / тап (T-M24); клік-фіксація"
timing_layer: [B-swap]
owns_pin: false
page_beat: [features, proof]
combines_with: [text-blur-reveal, theme-tween, revolves-carousel]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "is-active: face op→0, popup op→1 (0.35s air, in-place — нуль зсувів), ✛ rotate 45°"
  - "стани незалежні: дві активні одночасно; повторний тап гасить лише свою"
  - "desktop: hover вмикає/mouseout гасить (без фіксації), клік фіксує"
  - "нуль CLS; errors 0; destroy() чистить"
---

# plus-toggle-cards — картка обертається змістом

Другий юніт Спринту-6. Механіка спільна для /management (~12 карток)
і /about (✛-пари) — на зборках лише скіни.
