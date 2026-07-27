# ATOM: design-hero — springs Design hero [MOBILE 390×844]

## СУТЬ
Перший блок springs Design-секції: full-bleed рендер кристалічної вежі (криволінійні greenery-loggia
балкони, скло) + великий напівпрозорий серифний **«Design»** (Victor Serif, вписаний у фото,
права-центр) + «INSPIRED ARCHITECTURE» капсом + абзац знизу «A standalone crystal building soaring
above the treetops…». По скролу — intro fade-up (титул+абзац) + on-scroll parallax фото.

## ДЖЕРЕЛО
Live: `springsmobile-design/ScreenRecording_07-18-2026 11-26-20_1.MP4` (d-01/03) + 18 скрінів.
Розбито на атоми (Єгор): design-hero (цей) + design-scroll (full-bleed рендери↔кремові текст-блоки, next).

## АСЕТИ
Рендер вежі згенеровано higgsfield (nano_banana_pro, 3:4, springs crystal-tower промпт з live-oracle):
`_img/tower-hero.jpg` (криволінійні балкони+greenery-loggia, майже як live). Другий `tower-dusk`
(надвечірня вежа) — для design-scroll. Читається як будівля. springs-шрифти локальні (`_fonts/`).

## МЕХАНІКА
- INTRO (render 0→0.4): фото scale 1.08→1.0 (settle); титул fade-up (@.06); абзац fade-up (@.16, stagger).
- SCROLL (0.4→1): parallax фото -90px; титул+абзац дрейф угору + абзац fade до шва (наступний блок).
- Автоплей intro на load (до скролу).

## ІНТЕРАКТИВ / render(p)
`window.render(p)` clamp 0..1 (intro→parallax split@0.4). `__ATOM_OK__` після init. Lenis+ScrollTrigger.
Сторінка 150vh (parallax). GSAP володіє анімованими трансформами.

## ГЕЙТ
`scripts/design-hero-gate.mjs` — 15/15 ALL PASS: хуки, Victor Serif на «Design», «INSPIRED
ARCHITECTURE», абзац crystal-building, фото-рендер (bg-image), покриття, позиції титул/абзац,
0 overflow, intro fade-up, on-scroll parallax, детермінізм, 0 console-err.

## СТАН
Побудовано (не CD — власноруч з higgsfield-рендером) ✅ · self-contained ✅ · гейт 15/15 ✅ ·
борд → око Єгора. element-gate НЕ застосовний (згенерований асет, не live-піксель).
Перший з 2 атомів design-наративу. A=springs-точний.
