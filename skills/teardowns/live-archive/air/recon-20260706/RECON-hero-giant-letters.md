# RECON HERO — гігант-літери A·I·R + спіраль (Б-1.2 баг #1)

> Сесія 10 (2026-07-08). Покадровий recon 2 записів Єгора (живе 15.07 / наше 15.08) + читання живого air-home.html/air-shared.js.
> Мета: закрити баг #1 (гігант-літери відсутні) 1-в-1. Постійний — кадри в scratchpad щезнуть.

## ЖИВА ПРАВДА hero (aircenter.space)

**Порядок шарів (знизу вгору) у `section--full-height` + `sticky--under-next`:**
1. **Спіраль-фон** = 2 Vimeo `background=1` лупи (НЕ 3D/WebGL):
   - desktop `is-hidden--sm-down`: `1145251536`, ratio 1428/756
   - mobile `is-hidden--md-up`: `1145256182`, ratio 1093/1345
   - шар: `sticky__layer--sticky`, parallax opacity 1→0 на прогресі -80.
2. **Гігант-літери A·I·R** = ТРИ окремі inline-SVG (клас `l-intro-logo__logo`):
   - desktop viewBox `0 0 1420 140`, mobile viewBox `0 0 350 80`
   - кожна літера = свій `<path fill="black">`, на власному parallax-патерні `landingIntroLogoA/I/R` (+ `...Mobile`)
   - **живі SVG-path (desktop 1420×140):**
     - A: `M40.3666 86.4578L67.3714 16.4163H70.5558L97.5605 86.4578H40.3666ZM118.269 140H138L83.9176 0H54.0095L0 140H19.7306L34.0603 102.947H103.992L118.259 140H118.269Z`
     - I: `M720 0H700V140H720V0Z`
     - R: `M1321.61 16.4895H1368.6C1383.39 16.4895 1395.41 28.4913 1395.41 43.2499C1395.41 58.0086 1383.39 70.0104 1368.6 70.0104H1321.61V16.4895ZM1420 140L1377.09 86.1371C1398.52 83.515 1415.1 65.3154 1415.1 43.2396C1415.1 19.3811 1395.68 0 1371.78 0H1302V139.917H1321.69V86.4066H1352.85L1395.47 139.917H1420V139.99V140Z`
   - **рух:** parallax `scale(140→50)` тобто `scale(${50/140})` на прогресі, `easing: easeOutQuad`. Літери РОЗХОДЯТЬСЯ (A вліво, R вправо) + зменшуються поки скролиш. viewBox 1420-широкий = A біля лівого краю (x≈0-138), I точно центр (x=700-720), R біля правого (x≈1302-1420) — тому вони від початку розкидані на всю ширину.
3. **Копірайт** (шар `l-intro`, parallax `landingIntroMove` + `landingIntroFade`):
   - «The architecture of New Success» (h2, center)
   - «Class (A) premium business center» (center, нижче)

## НАШ combo-lab (що є / чого бракує)

- ✅ Спіраль Vimeo desktop+mobile — правильно (`#top .spiral`, рядки 308-313).
- ✅ Копірайт hero-note + hero-class — є (314-315).
- ❌ **ГІГАНТ-ЛІТЕРИ ВІДСУТНІ в hero.** Замість них компонент `kinetic-letters-hero` дає дрібний кутовий текст `AIR` (`[data-amo-giant]` рядок 272: `font-size: clamp(38px,5.4vw,84px); left:3vw; top:11vh`) — максимум 84px у кутку, НЕ три SVG-літери на весь екран.

## ФІКС (баг #1, 1-в-1)

Замінити кутовий `kinetic-letters-hero` текст на 3 повноекранні inline-SVG-літери в `#top`:
- 3 SVG (viewBox 1420×140 desk / 350×80 mob) з живими path вище, розкидані A·I·R на всю ширину.
- scale 140→50 + розхід на скролі, easeOutQuad (наш переклад parallax на scroll-progress; спіраль лишається фоном).
- Порядок z: спіраль (фон) → літери → копірайт.
- Гейт: reveal, стабільність, 0 помилок, обидва в'юпорти. Пара відео AIR-REF/PAGE під вердикт Єгора.
