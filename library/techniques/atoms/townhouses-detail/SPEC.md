# ORGANISM: townhouses-detail (M8) — Residences detail flow (Flats·Townhouses·Penthouses·Amenities)

> springs /design continuation ПІСЛЯ frozen-music. 8 блоків, увесь flow (НЕ pin). Джерело правди:
> `~/Downloads/CD-RUN-townhouses-v1/SECTION-MAP.md` (2 live-відео Єгора 2026-07-20). Побудовано CD
> ([[build-through-cd-not-solo]]) → DC-формат конвертовано в self-contained (DCLogic→IIFE, variant-літерал).
>
> Це ОРГАНІЗМ-flow (не extract-атом): усі механіки вже в базі — hero-parallax, fade-coupling reveal,
> air-theme-flip. Нуль нових законів (M8 flow-only). Складено, не витягнуто.

## СУТЬ
Вертикальна flow-стрічка з 8 блоків: 3 hero-рендери (full-bleed фото + serif-title нижня третина +
caps-kicker) чергуються з body-блоками (крем↔темно-зелений інверсія) що несуть параграф + specs-список
з hairline-роздільниками; фінал = teal Amenities-картка + footer. Шви = hard-cut flow; theme-flip
хедера на кожному переході. НУЛЬ pin, НУЛЬ overlap, НУЛЬ crossfade фонів.

## 8 БЛОКІВ (verbatim у гейті)
1. **Flats hero** — фото вітальні (запечений «Flats»+«LIMITLESS VISION» — CD взяв з live-кадру).
2. **Flats body** (cream #EEE3CE) — параграф + `138 view flats`·`62-347 m²`·`Unique transformable
   glazing`·`Designer finishings`.
3. **Townhouses hero** — закатне патіо; DOM «Townhouses»+«Garden of fulfilled expectations».
4. **Townhouses body** (dark #1C3026 інверсія) — параграф + `5 townhouses`·`174-378 m²`·`Ceiling
   heights up to 4 meters`·`Private patio`·`Designer finishings`.
5. **Penthouses hero** — тераса-дах; DOM «Penthouses»+«Glowing perspectives».
6. **Penthouses body** (cream) — 2 параграфи + `7 penthouses`·`Ceiling heights…`·`Luxurious
   terraces`·`Designer finishings` (area немає).
7. **Amenities** (teal #0E3A34) — «Amenities»+«Beauty at your fingertips»+кнопка →; breadcrumbs.
8. **Footer** — «Springs» лого + legal + back-to-top ↑.

## МЕХАНІКА (flow-only, складено з бази)
- **hero-parallax**: img `translate3d(0, -depth·hH·prog, 0)`, depth A=0.04/B=0.08/C=0.05. B додає
  scale-settle 1.04→1.0 на вході.
- **fade-coupling reveal**: текст opacity 0→1 + y 24→0 при перетині `top 62%`; specs-стаггер 60ms (B=90).
- **air-theme-flip**: колір хедера cream↔ink tween 0.8s залежно від теми секції під хедер-лінією.
- **C-варіант**: hairline draws-in (scaleX 0→1) над hero-title + kicker letter-spacing settle 0.30→0.16em.

## 3 ВАРІАНТИ (✅ B ПРИЙНЯТО Єгором S43, «діпер параллакс», на борді iPhone)
- **A** calm flow: parallax -4%, спокійний editorial темп.
- **B** deeper parallax (🏆 КАНОН): -8% + scale-settle 1.04→1.0, stagger 90ms. Живіший рух героїв.
- **C** designer take: hairline + kicker letter-spacing settle.

## TRANSFER-ГЕЙТ
`../../../scripts/townhouses-gate.mjs [a|b|c]` — verbatim 25 якорів · theme-секції photo+cream+dark+teal ·
specs 13 рядків hairline · hero-parallax живий · theme-flip хедера інвертує · no-pin (scrollHeight>4vh) ·
amenities-кнопка+back-to-top · 0 console-err · 0 404 · заборонені (158) відсутні. ALL PASS ×3 (S43).

## ФАЙЛИ
`variants/townhouses-{a,b,c}.html` (self-contained) + `townhouses-all.html` (борд 3 iframe) +
`variants/assets/` (4 hero-webp/jpg реальні springs-рендери з live-відео) + `variants/tokens/`.
DC-оригінал: `dc-raw/` (SpringsPhone компонент + gen-selfcontained.mjs генератор). CD-проєкт 1a351774.
🔴 ЩО ЗВІРЕНО: townhouses-gate судить СТРУКТУРУ і МЕХАНІКУ числами (verbatim textContent, theme-теги,
specs-count, hero-parallax рухається, theme-flip хедера інвертує, no-pin). ЩО НЕ ЗВІРЕНО: per-element
проти live (element-gate НЕ застосовний, answer-key spec/frame-*.json = springs-only SO-3, townhouses
його не має за задумом, dummy-фасад як residences-tabs/location/frozen-music, [[g23-specgate-is-springs-only]]);
темп, фасад, вага/кегль шрифтів, spacing проти live кадрів = 0 checks (НЕ звірено). Це судить око Єгора
на борді на реальному пристрої.
§ФІКСИ S43 (мої, поверх CD): Amenities DOM-заголовок+kicker+→ іконка (CD лишив порожні); asset/token
шляхи (у variants/); token-CSS шрифт-шлях _fonts/ + прибрано неіснуючий Bold.otf.
