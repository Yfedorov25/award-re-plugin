---
id: aerial-journey
name: "Аеро-журней: фрейм→fullbleed + зум-посадка + зони (T-121 + T-210 + T-M27)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "AerialJourney.create(section, opts?)  // section: [data-aj-layer]>[data-aj-outer]>[data-aj-inner](img/відео) + [data-aj-zones](svg з [data-aj-zone]) + [data-aj-cards]([data-aj-card]). opts: { spanSvh (120), innerFrom (1.25), zonesAt (0.55), cardStaggerMs (120), touchMq }"
  module: iife
  returns: "{ render(p), progress(), gate, destroy } (reduced: static — все видиме)"
meaning:
  what: "Аеро-акт /location (живі патерни shared.js дослівно): фрейм аерофото росте з грід-ширини у fullbleed (scale + borderRadius 5→0), а саме аеро «сідає» зумом 1.25→1 тим самим easeInOutQuad-ходом — камера ніби знижується над районом (T-121/T-M27). Після посадки (p≥0.55) проступають кольорові зони-полігони (корти/парки/кафе) і хв-картки каскадом 120ms (T-210). На тачі та сама механіка зі швидшим входом (живі *Touch-патерни)."
  when: "Секція «Surroundings» сторінки локації: одне сильне аерофото/відео-луп + 2–4 зони інфраструктури."
  lands: "Скрол опускає тебе на район, як дрон на посадці: рамка розчиняється, місто наближається — і коли колеса торкаються, на карті проступають кольорові плями життя з хвилинами пішки."
  not_when: "Нема справжнього аеро (це база T-121 — «real-aerial»). Понад ~4 зони (каша)."
source:
  grammar: "живий shared.js: locationInfrastructureVideoOuter/Inner(+Touch) ДОСЛІВНО; жива розмітка #infrastructure (пін + двошарове Vimeo-аеро)"
  recording: "MOBILE-air-3.mp4 (T-M27 аеро-журней + зони)"
  registry_ref: ["T-121", "T-210", "T-M27"]
stack: "vanilla, нуль залежностей (rAF-скраб transform/borderRadius; зони = класи з 0.6s air)"
webgl: false
motion_props: [transform, border-radius, opacity, translate]
trigger: "скрол: entry+pin прогрес (скраб); зони — поріг p"
timing_layer: [A-ambient]
owns_pin: true
page_beat: [material, proof]
combines_with: [locmap-engine, text-blur-reveal, theme-tween]
anti_combos: [second-pin]
gated_by: [R_pin_budget, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "до входу: outer < 1 (грід-фрейм, radius ~5px), inner > 1.2; на піні: обидва = 1, radius 0 (живі величини)"
  - "easeInOutQuad-хід (живий), reverse-safe (±0.02)"
  - "зони: p≥zonesAt → полігони opacity 1 + картки каскадом (delays i·120ms); reverse ховає"
  - "touch: вхід удвічі швидший (живі Touch-патерни); reduced: static"
  - "скраб = transform/borderRadius у rAF; CLS<0.1; errors 0; destroy() чистить"
---

# aerial-journey — дрон сідає на район

Третій юніт Спринту-5. Лишилась ЗБОРКА /location (карта air-dark +
цей аеро + транспорт-пін) — екзамен №3.
