---
id: about-air
name: "ЗБОРКА /about (DoD-екзамен №4)"
level: 3
kind: page-assembly
status: candidate            # екзамен: два вікна проти живої /about
section: about
mode: scroll
meaning:
  what: "Сторінка /about з готових атомів спринтів 2–6: hero-spread + лобі-факти (гігант-числа 8/680) → revolves-карусель (T-119-переклад) → headquarters-слайдер (image-slider-wipe, 3 слайди з живими CMWP-текстами) → ✛-пари Premium tech/Innovative eng (plus-toggle-cards) → площі (area-tabs-accordion, живі 79–340 м²) → футер. Lenis lerp 0.1. Живі фото/копі hotlink."
  when: "Мілстоун-екзамен спринту-6: два вікна проти живої /about."
  lands: "Сторінка про будівлю, де кожен акт відповідає своїм жестом: карусель дихає хвилею, headquarters гортаються під скролом, плюси обертаються змістом, а площі дихають висотою."
source:
  grammar: "жива /about (live-archive) + атоми revolves-carousel, image-slider-wipe, plus-toggle-cards, area-tabs-accordion, giant-number-fact"
  recording: "MOBILE-air-2.mp4 (вся /about, 152s)"
  registry_ref: ["T-119", "T-512", "T-M23", "T-M24", "T-M25", "T-417", "T-422"]
stack: "vanilla атоми + Lenis"
webgl: false
uses:
  - { atom: image-slider-wipe, job: "headquarters-слайдер (owns_pin — єдиний пін сторінки; живий №2 інстанс image-slider-sticky)" }
  - { atom: revolves-carousel, job: "T-119-переклад" }
  - { atom: plus-toggle-cards, job: "✛-пари" }
  - { atom: area-tabs-accordion, job: "площі 79–340 м²" }
  - { atom: giant-number-fact, job: "лобі-факти 8 м / 680 м²" }
pin:
  owner: image-slider-wipe
  count: 1
page_beat: [material, features, proof]
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "движки init; headquarters-слайдер свапає на порозі (лічильник «2» на p≈0.5)"
  - "docHeight стабільна (плани з aspect-резервом); errors 0; Lenis на desktop"
  - "ЕКЗАМЕН: два вікна проти живої /about (два слайдери, ✛-пари, площі)"
files: [combo-lab.html, RECIPE.md]
---

# about-air — сторінка, де кожен акт має свій жест

Четвертий посторінковий екзамен. На фікс-кола після проходу: діаграма
веж B1/B2/B3 (статична — S), ізо-стрічка T-M28, реальний Vimeo-фон.
