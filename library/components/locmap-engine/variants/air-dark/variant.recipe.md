---
extends: locmap-engine
variant: air-dark
name: "locmap-engine / AIR темна векторна (T-427 + T-104 + T-M20)"
status: candidate            # official ТІЛЬКИ після вердикту власника
source:
  grammar: "жива /location (live-archive): темна векторна карта на plan-движку; фільтр категорій = radio-група (park/sport/bank/supermarket/consumer/restaurant) у popover; права колонка Infrastructure; T-M20 моб-закони (стрічка + dropdown-up шит)"
  recording: "Desktop-air.mp4 t33–63 (темна карта: категорії, свап маркер-сетів, tooltip POI) + MOBILE-air.mp4 t50–75 (T-M20 стрічка)"
  registry_ref: ["T-427", "T-104", "T-M20", "T-M26"]
meaning:
  lands: "Чорна калька міста: вулиці ледь світяться, AIR стоїть білою плашкою в центрі, категорії перемикають сузір'я маркерів, а тап по точці малює пунктирний шлях і рахує хвилини."
overrides:
  theme: "чорне поле, сірі вулиці, глухі будівлі; білі маркери; активний = інверсія"
  cats: "живий radio-набір: Parks/Sport/Banks/Supermarkets/Consumer services/Restaurants"
  layout: "карта зліва + колонка Infrastructure праворуч (жива композиція)"
  mobile: "T-M20 категорії + T-M26 POI-свайп-картки: стрічка snap-карток під картою, свайп активує POI — стара траса гасне (движок), пан/зум ~0.5s (transform-only), пунктир малюється прогресивно; ЧИСЛО ХВИЛИН СТАТИЧНЕ (живий закон: count-up на моб не зафіксовано)"
when_pick_this: "Сторінка локації AIR-репліки та будь-який RE-сайт з нічною/технічною мовою карти."
files: [variant.recipe.md, params.json, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# locmap-engine / air-dark — чорна калька міста

> **variant-as-delta. База НЕЗАЙМАНА** — дельта: темна тема поверх
> lm-хуків + жива AIR-композиція (категорії-radio + колонка праворуч).
