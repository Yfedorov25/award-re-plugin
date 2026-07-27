# ATOM: hotspot-card-reveal (amenities-terraces) 📱🧬 — ✅ ПРИЙНЯТО Єгором (S44, «це вже воно», на компараторі)

> Закон ВЗАЄМОДІЇ (USER-driven, поза render(p)/scroll). Джерело правди: springs.estate/amenities блок 12
> "Panoramic Terraces". Приймання = ОКО Єгора на side-by-side компараторі (наш живий vs його live-відео),
> не піксель-гейт (dummy-фасад, наш higgsfield-рендер).
>
> **extends: `hotspot-tap-overlay`** (interaction-скелет: frosted-маркери на фото, tap-reveals-info, інші persist),
> АЛЕ DIFFERS: НЕ full-page tint, НЕ full-width bottom-panel, НЕ ✕/chip. Reveal = картка-навколо-маркера.

## СУТЬ (одне речення)
На full-bleed фото сидять 3 frosted-circle маркери у фікс x/y; тап маркера → непрозора dark-green квадратна
картка (~0.73 ratio) FADES+GROWS так, що САМ маркер стає її кутовою іконкою (маркер підіймається над карткою,
НЕ клонується); дефолт-параграф ховається; підпис у РЯДКАХ (кожне слово окремо) внизу-ліворуч; тап будь-де закриває.

## МЕХАНІКИ
- **M1 markers**: 3 кола d≈50px, frosted (напівпрозоре скло + hairline кільце + SVG-гліф) у фікс %-позиціях НА фото.
- **M2 open**: тап → картка (width 63%, aspect 0.73, `#162A1F`) opacity 0→1 + scale .32→1 (0.42s, house-ease),
  transform-origin = кут біля маркера. Тапнутий маркер отримує `.active` (z above card, прозорий фон) = кут картки.
- **M3 corner-anchor**: картка позиціонується так що маркер-центр збігається з її кутом (tr/tl per marker);
  clamp fully in-frame (bottom ≤ 86.5% viewport). НЕ клонувати гліф у картку (баг v1: дві іконки).
- **M4 label rows**: підпис CAPS у РЯДКАХ (span per word, ~21px) внизу-ліворуч. bulb=INTEGRATED/LIGHTING ·
  aperture=TRANSPARENT/PANORAMIC/RAILING · plant=DECORATIVE/CLIMBING/PLANTS.
- **M5 default-hide**: дефолт-параграф "Light plays…" opacity→0 поки картка відкрита.
- **M6 swap**: тап іншого маркера → пряма зміна на його картку. Тап того ж → toggle-close.
- **M7 close = tap anywhere** (Єгор): тап будь-де по фото/картці поза активним маркером закриває.
- **M8 title**: `Panoramic Terraces` serif, scroll-wipe при enter, НЕ бере участі в tap.

## ІНВАРІАНТИ ЗАКОНУ
Маркер сидить НА фото (фікс x/y); тап вирощує картку так що САМ маркер = її кут (0 клонів, 0 дублів);
інші маркери persist frosted; дефолт-текст ховається; картка in-frame; уся динаміка USER-driven (0 scroll-звʼязку);
close = tap-anywhere.

## АСЕТ (наш, не springs)
`variants/assets/terraces.webp` — higgsfield 2k golden-hour rooftop terrace (пара біля перил, диван, fire-pit,
кипарис, скайлайн над рікою; видно transparent railing + climbing plants + lighting-зону для 3 hotspot).
Кроп 390×844. НЕ скріншот springs.

## РОЗКАДРОВКА (live springs f_205 дефолт → f_203 open)
| крок | стан |
|---|---|
| база (f_205) | 3 frosted маркери + нижній параграф "Light plays…" |
| тап bulb (f_203) | dark-green картка виросла, bulb = її top-right кут, "INTEGRATED/LIGHTING" внизу-ліво, параграф зник |
| тап іншого | пряма зміна картки на його підпис |
| тап будь-де | картка закривається, назад до 3 маркерів + параграф |

## ГЕЙТ / ЗВІРКА
- логіка-тест (playwright): tap/swap/toggle/close-anywhere; 3 підписи вірні; 0 клонів (card має 0 svg);
  in-frame (bottom ≤ 844); 0 console-err; 0 404.
- приймання = ОКО Єгора на компараторі `variants/compare.html` (наш живий vs live-відео).

## ФАЙЛИ
`variants/terraces.html` (self-contained, ПРИЙНЯТИЙ канон) · `variants/compare.html` (side-by-side) ·
`variants/assets/terraces.webp` · `variants/_fonts/` · `variants/_springs-tokens.css` · `reference/terraces-live.mp4` (live-кліп).
