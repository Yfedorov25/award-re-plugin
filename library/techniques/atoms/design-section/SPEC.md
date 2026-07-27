# ATOM: design-section — springs Design (4-beat scroll narrative) [MOBILE 390×844]

## СУТЬ
Повна springs Design-секція: scroll-наратив, що чергує FULL-BLEED рендери кристалічної вежі з
КРЕМОВИМИ editorial текст-блоками. 4 біти:
1. **Design hero** — full-bleed рендер вежі (greenery-loggia балкони) + великий напівпрозорий Victor
   Serif «Design» + «INSPIRED ARCHITECTURE» + lede «A standalone crystal building soaring above the
   treetops…».
2. **Cream text-block 1** — deep-green Victor Serif на #f5e8d1: «Each floor reflects boundless
   perspectives in its glistening waves…».
3. **Full-bleed render 2** — вежа надвечір (циліндричні скляні еркери, тераси, місто).
4. **Cream text-block 2** — «Tabanlioglu, the renowned architectural bureau… chessboard pattern…
   weightless volume…».
Хедер інвертує колір (світлий над рендером / темний над cream) легіт. Стик → Residences (інший атом).

## ПОХОДЖЕННЯ (CD-конвеєр)
Побудовано ЧЕРЕЗ Claude Design (проєкт 151cb058) — [[build-through-cd-not-solo]]. Я: розібрав live
(springsmobile-design відео 11-26-20 + 18 скрінів) → згенерував 2 рендери вежі higgsfield →
CD-RUN пакет `~/Downloads/CD-RUN-design-v1/` (4 beat-кадри + hires-oracle + рендери + токени +
draft) → 01-PROMPT розкадровка 4 бітів + 3 варіанти → CD → RAW → гейт на RAW. Assets всередині
`variants/assets/` (шляхи CD дослівні).

## ВАРІАНТИ (той самий наратив, різна scroll-choreography)
- **A editorial calm** — strip translate угору, hard seams, gentle parallax, текст fade+rise. **ОБРАНО Єгором.**
- **B crossfade drift** — біти crossfade'яться (opacity шарів), сильніший ken-burns, титул дрейф-out.
- **C pinned reveal** — hero pin, line-mask clip-reveal beat2, façade clip-reveal beat4, ken-burns.

## АСЕТИ
`variants/assets/tower-hero.jpg` (hero-loggia), `tower-dusk.jpg` (надвечірня вежа) — згенеровані
higgsfield (nano_banana_pro, springs crystal-tower). springs-шрифти `variants/assets/fonts/`.

## ІНТЕРАКТИВ / render(p)
`window.render(p)` clamp 0..1 драйвить весь 4-beat скрол детерміновано. `__ATOM_OK__` після init.
Lenis+ScrollTrigger scrub. Сторінка ~440vh. GSAP володіє анімованими трансформами. springs-ease.

## ГЕЙТ
`scripts/design-section-gate.mjs` — **ALL PASS ×3** (18 перевірок): хуки, Victor Serif, 2 full-bleed
рендери, кремовий блок, ВЕСЬ текст live ×6 фрагментів (textContent), beat-progression, детермінізм,
clamp, 0 overflow, 0 console-err. 🔴 УРОК ГЕЙТА: текст-присутність міряти textContent, НЕ innerText
(innerText ховає off-screen/autoAlpha:0 біти); beat-progression через opacity+y (не позицію-в-центрі,
бо B/C = crossfade). 0 фіксів у білді.

## СТАН
CD-конвеєр ✅ · self-contained ✅ · гейт ALL PASS ×3 ✅ · **A ОБРАНО (Єгор, 2026-07-18, «варіант А
найкращий»)**. element-gate НЕ застосовний (згенеровані асети, не live-піксель). Всі 3 у базі, A=канон.
Solo-чернетка hero → `design-hero/` (окремий, лишається як робочий референс).
