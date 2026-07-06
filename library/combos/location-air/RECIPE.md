---
id: location-air
name: "ЗБОРКА /location (DoD-екзамен №3: аеро-журней + темна карта)"
level: 3
kind: page-assembly
status: candidate            # екзамен: два вікна проти живої /location
section: location
mode: scroll
meaning:
  what: "Сторінка локації AIR: Surroundings-заголовок → аеро-журней (посадка фрейм→fullbleed + зум 1.25→1, зони+хв-картки після посадки) → темний карт-акт (жива векторна тема, 6 живих категорій-radio, маршрути Dijkstra з хвилинами) → футер. Всі цеглини — атоми спринту-5 без змін."
  when: "Мілстоун-екзамен спринту-5: два вікна проти живої /location; розбіжність = фікс до збігу."
source:
  grammar: "живі /location + shared.js патерни (все в live-archive) + атоми aerial-journey і locmap-engine/air-dark"
  recording: "MOBILE-air-3.mp4 (аеро+зони, POI) + Desktop-air.mp4 t33–63 (темна карта)"
  registry_ref: ["T-121", "T-210", "T-427", "T-104", "T-M20", "T-M26", "T-M27"]
stack: "vanilla атоми бібліотеки"
webgl: false
uses:
  - { atom: aerial-journey, job: "Surroundings-акт: посадка + зони (owns_pin — єдиний пін сторінки)" }
  - { atom: locmap-engine, job: "темний карт-акт — дельта варіанта air-dark (категорії/маршрути)" }
pin:
  owner: aerial-journey
  count: 1
page_beat: [material, proof]
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "аеро: посадка на піні (outer=1, radius 0), зони після p≥0.55"
  - "карта: темна тема (>50 елементів), 6 живих категорій, маршрут по select"
  - "docHeight стабільна; errors 0; ЕКЗАМЕН: два вікна проти /location"
files: [combo-lab.html, RECIPE.md]
---

# location-air — з неба на карту

Третій посторінковий екзамен. На фікс-кола після проходу Єгора:
транспорт-пін (map-small.svg з live-archive), панорама-кнопка
(в'юер — діра дозйомки №1), Lenis у зборку.
