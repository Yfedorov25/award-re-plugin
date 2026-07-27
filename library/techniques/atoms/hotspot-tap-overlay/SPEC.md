# ATOM: hotspot-tap-overlay — маркер на фото → full-page tint + bottom-panel (USER-DRIVEN)

> Закон ВЗАЄМОДІЇ, НЕ сніпет. Ролі АБСТРАКТНІ: photo (медіа) / marker[N] (frosted-кружки в
> довільній x/y НА фото) / overlay (full-page tint + bottom-panel + ✕). Джерело правди: springs
> frozen-music M6, блок 7 (ARISTOCRATIC QUARTET). Донор коду: `atoms/frozen-music/variants/
> frozen-music-a.html` L82-85 (маркери) + L132-139 (оверлей) + L287-298 (openHot/closeHot).
>
> **NEW (не extends)** — жоден наявний атом не поєднує: marker-у-довільній-позиції-на-фото +
> full-page-tint-БЕЗ-blur + bottom-panel. Контраст: `plus-toggle-cards`/`air-plus-toggle` (in-card
> blur toggle), `menu-modal`/`air-menu-overlay` (chrome-nav → full overlay), `architecture--plus-
> hotspots` (veil-cover → full-bleed macro). springs-mobile атом (390×844).

## СУТЬ (одне речення)
На фото сидять frosted-glass маркери в довільних x/y; тап по маркеру відкриває напівпрозорий
темний ТІНТ поверх УСІЄЇ сторінки (без blur, сторінка нерухома) + суцільну bottom-panel ~55%
висоти з текстом+чіп-цифрою+✕; поява/закриття = чистий opacity-crossfade ≤0.5s (панель НЕ з'їжджає).

## ЧОМУ ЦЕ ПРАЦЮЄ
Маркер на самому фото каже «тут є що дізнатись» без слів — око саме шукає цифри. Tint (не blur)
зберігає фото читабельним під панеллю — контекст лишається. Панель, що ПРОЯВЛЯЄТЬСЯ (не з'їжджає),
відчувається як «шар інформації над місцем», а не як окреме вікно. Скрол піксель-у-піксель до/після
= взаємодія не збиває читання сторінки.

## МЕХАНІКИ (весь механізм; ПОВНІСТЮ поза render(p)/scroll)
- **M1 markers**: N кружків `position:absolute` у %-координатах НА .photo (frosted: напівпрозоре
  скло + тонке світле кільце + цифра). `cursor:pointer`; кожен несе `data-key`.
- **M2 open**: tap → overlay `opacity 0→1` (fade-in ≤0.5s, ease). overlay = `position:absolute;inset:0;
  z-index:high`: (а) tint-шар `background:rgba(dark,~.62)` БЕЗ backdrop-filter; (б) bottom-panel
  `bottom:0;height:~55%` суцільна темна, з ✕-кнопкою + чіп-цифрою + caps-текстом ключа.
- **M3 close**: ✕ або тап по tint (поза панеллю) → `opacity 1→0` (crossfade ≤0.5s). Панель НЕ
  translate-иться — лише opacity. `pointer-events` off після fade.
- **M4 scroll-preserve**: відкриття/закриття НЕ чіпають scrollTop; render(p)/scroll НЕ керує оверлеєм
  і НЕ закриває його (якщо є scroll-scrub у сторінці — sweep не має гасити відкритий оверлей).
- **M5 keyboard/a11y**: Esc закриває; ✕ фокусабельний; overlay має роль dialog (опційно у фасаді).
- **M6 reduced-motion**: fade миттєвий (opacity snap).

## ІНВАРІАНТИ ЗАКОНУ
Маркер сидить НА фото (довільна x/y); tint БЕЗ blur; сторінка нерухома при open; панель проявляється
opacity-crossfade'ом (НЕ з'їжджає); scroll до/після незмінний; уся динаміка USER-driven (нуль
scroll/render-звʼязку). Кількість маркерів, тексти, палітра, висота панелі — параметри фасаду.

## РОЗКАДРОВКА (springs, SECTION-MAP M6 блок 7)
| крок | стан |
|---|---|
| база | фото + N маркерів; overlay opacity 0, pointer-events none |
| tap marker k | overlay fade-in ≤0.5s: tint + panel(k) + чіп(k) + текст(k) |
| hold | панель стоїть; scroll сторінки заблокований АБО ігнорований (фасад-вибір) |
| ✕ / tap-tint | overlay fade-out ≤0.5s (opacity, панель не рухається); scroll незмінний |

## TRANSFER-ГЕЙТ (acceptance; умова (а) = ЧУЖИЙ фасад)
1. База: overlay opacity==0, pointer-events==none; N маркерів видимі на фото (rect у межах фото).
2. Tap marker[0]: overlay opacity→1; panel текст == текст ключа[0]; чіп == '1' (або ключ).
3. Панель НЕ з'їжджає: panel.getBoundingClientRect().top ОДНАКОВИЙ до і під час open (Δ≤1px) —
   зміна лише opacity, не transform.
4. Scroll-preserve: scrollTop до open == scrollTop під час open == після close (Δ==0).
5. Close (✕): overlay opacity→0; pointer-events→none після fade.
6. Marker[1] (інший ключ): відкриває ІНШИЙ текст (панель свапає контент по ключу).
7. Хук `window.__HOTSPOT_OK__=true`; 0 console-errors; scrollWidth−clientWidth==0 на 390px.
8. **ЧУЖИЙ фасад**: build.html — не-springs фото (dummy-градієнт), інші тексти/маркери/палітра.

## ФАЙЛИ
`build.html` = self-contained, dummy-фасад (уявний «об'єкт» з 2 маркерами, чужі описи-ключі).
Гейт: `../../../scripts/atom-gate.mjs hotspot-tap-overlay`.
§КАЛІБРУВАТИ: висота панелі (55%) і тексти — фасад-параметри; при збірці організму брати springs-ключі.
