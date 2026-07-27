---
name: re-interactive-map
description: "Art-directed inline-SVG district map: hand-drawn plan in brand colors, POI markers by category, filter, tooltips with walk-times. No map API, no WebGL."
disable-model-invocation: true
license: MIT
---

# re-interactive-map

2-шар SVG (artwork + anchor-rects), POI з категоріями + фільтр + тултіпи (відстань=текст). Кольори бренду, не Google-скрін.

## 🔴 ХУК: КРОК 0 — СЬОРЧИТИ РЕАЛЬНІ POI (обов'язково в НОВОМУ проекті)

Перед будь-якою location/map-секцією в новому проекті ЗАВЖДИ спершу знайти РЕАЛЬНІ об'єкти поруч
з об'єктом через **OSM Overpass API**, не вигадувати. Вигадані вулиці/місця/часи = порушення
asset-truth і вбивають довіру локаційної секції (урок: 6 хардкод-POI не дають award-«лавину»
5→10→15→20хв; треба 25-40 реальних).

**Рецепт (перевірено на с. Агрономічне, дав 59 реальних POI):**
1. Координати об'єкта (lat, lon). Overpass-запит навколо (радіус 3-10 км для пішки+авто):
   ```
   [out:json][timeout:50];
   ( node["shop"](around:7000,LAT,LON);
     node["amenity"~"pharmacy|school|kindergarten|hospital|clinic|bank|post_office|fuel|marketplace|bus_station|fast_food"](around:7000,LAT,LON);
     node["highway"="bus_stop"](around:3500,LAT,LON); );
   out body 150;
   ```
   `curl -A "award-re/1.0 (research)" "https://overpass-api.de/api/interpreter" --data-urlencode "data=$Q"`
   (User-Agent ОБОВ'ЯЗКОВИЙ — без нього 406; тільки `node` дає чистий JSON, `way` вимагає `out center`.)
2. Калібрувати масштаб по 1-2 відомих точках (grid-search site lat/lon + K, щоб geodesic×K/80 = реальні хвилини).
3. walk = geodesic/80 (80 м/хв пішки); drive = m/500 (передмістя 30 км/год). Категорії: продукти/аптека/
   пошта/навчання/транспорт/медицина/банк для infra-режиму.
4. Спроектувати lat/lon → x,y карти (3-точкова affine по відомих точках).
5. route[] (Dijkstra по вулицях) — движок рахує або пряма лінія для дальніх.

Приклад готового датасету: `~/Downloads/LOCATION-design-handoff/pois-expanded-real.js`.

## References
- [PB_interactive_map](./references/PB_interactive_map) — AIR-патерн, 2-шар SVG, plan-marker, фільтр.

Підкоряйся `../../CLAUDE.md`. Усі прийоми — з reference-файлів, не вигадані. NO WebGL (🔴 → no-WebGL переклад).
