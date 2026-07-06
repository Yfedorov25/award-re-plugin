---
extends: center-focus-carousel
variant: air-courtyards
name: "center-focus-carousel / двори AIR (центр-фото + бічні піки зі скосом)"
status: candidate            # official ТІЛЬКИ після вердикту власника
source:
  grammar: "живий DOM aircenter.space #people (витяг 2026-07-06): l-people-carousel = data-plugin='carouselWebGl cursor' (ЄДИНИЙ WebGL головної) → CSS-переклад за законом no-WebGL; деко-спіраль l-people-carousel-deco__deco з живим парадаксом translateY(-50%)∓15svh; моб = mobile-scrollable стрічка"
  recording: "Desktop-air.mp4 t≈78–96 (двори: центр-фото рівне, бічні зі скосом, ротація) + MOBILE-air.mp4 (свайп-стрічка)"
  registry_ref: ["x: без T-ID — двори-карусель, родич T-110 (матриця §4)"]
meaning:
  lands: "Подвір'я гортаються як листівки на столі: центральна лежить рівно, сусідні підняті ребром до ока (перспективний скіс), спіраль бренду тихо пливе за ними. Жодного WebGL — сам скіс і є вся «кривизна»."
overrides:
  layout: "панелі ЛАНДШАФТНІ 44vw 7/4 (живі фото 840×480), gap 10px; піки бічних з країв"
  skew: "CSS-переклад WebGL-кривизни: perspective(1100px) rotateY(±24°) на ВНУТРІШНЬОМУ .cfc-panel-img (позиційні класи .is-l/.is-r від варіант-скрипта; база незаймана — вона тінить transform самої .cfc-panel)"
  theme: "світле поле AIR (paper #f4f2ee); sideDim 0.92 — бічні НЕ морозяться, працює скіс"
  deco: "спіраль за каруселлю, живий парадакс −15svh→+15svh за прохід секції (transform-only, rAF)"
  nav: "стрілки 48px квадратні ‹ › + лічильник N / M; підписів на фото нема (живі двори без капшенів)"
  mobile: "нативна свайп-стрічка бази ≤820px (= живий mobile-scrollable)"
when_pick_this: "Акт «подвір'я/життя» головної AIR та будь-який ряд фото одного середовища, де фокус-карусель має відчуватись об'ємною БЕЗ WebGL."
files: [variant.recipe.md, params.json, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# center-focus-carousel / air-courtyards — variant delta

> **variant-as-delta. База `component.js` НЕЗАЙМАНА.** Живий оригінал — єдина
> WebGL-карусель головної AIR (carouselWebGl): центр-фото рівне, сусіди
> вигнуті від ока. Переклад no-WebGL: скіс = `perspective + rotateY(±24°)`
> на внутрішньому wrapper-і зображення (база анімує transform самої панелі,
> тому внутрішній шар вільний), позиційні класи веде маленький
> варіант-скрипт по зміні лічильника.

## Дельта (тільки відмінне від бази)
- **Ландшафтні панелі 44vw 7/4** — живі фото дворів 840×480; gap 10px.
- **Скіс замість темряви**: sideDim 0.92 (світле поле AIR) — глибину дають
  rotateY(±24°) бічних, не brightness.
- **Спіраль-деко** за каруселлю з живим парадаксом −15svh→+15svh за прохід
  секції (дослівні keyframes l-people-carousel-deco__deco).
- **Стрілки 48px** квадратні, лічильник між ними; капшенів нема.
- **Моб** — база сама падає в нативну стрічку ≤820px (= живий AIR).
