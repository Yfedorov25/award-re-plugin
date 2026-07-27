# RECON /about — повний бриф для переробки скелета (сесія 16)

> Джерело правди: `air-about.html` (6892 рядки) + `air-global.css` (мініф.) + `air-shared.js` (Locomotive Scroll).
> Причина: наш `combos/about-air/combo-lab.html` (775 рядків) = звичайні гріди в потоці, БЕЗ pinning, БЕЗ reveal-тексту. Живий = 14 sticky-pin секцій. Це переробка СКЕЛЕТА, не косметика. Числа section-parity (p9 51% / p18 88%) — суміш розсинхрону темпу + реальної структурної розбіжності. Вердикт ока Єгора: «зовсім все погано, пропрацьовувати глибоко».

## КОРІНЬ (чому наше не збігається)
1. **НЕМА pinning.** Живе = Locomotive `sticky--under-next` + `:after`-spacer 100svh + наступна секція наїжджає зверху з `margin-bottom:-100svh`. Наше = потік/гріди.
2. **Reveal-текст:** живе = `blur(10px)→0 + opacity 0→1`, WORD-BY-WORD, stagger `--line-index * 60ms`, ease `cubic-bezier(.25,.74,.22,.99)`, 1s. НЕ translateY. Колір **#8d8d8d** (`--c-grey`, бо `--t-text` у секціях = grey, НЕ heading). Наше = чорний lowercase статичний.
3. **Glass-панель:** `backdrop-filter: blur(40px)` (`ui-background-blur-large`) + bg `rgba(0,0,0,0.12)` light / `rgba(255,255,255,0.1)` dark (`ui-background-alt-dark`), radius 5px, padding 20px (`px/py-layout`).

## КОЛЬОРИ (токени :root)
- `--c-white:#fff` · `--c-black:#000` · `--c-grey:#8d8d8d` (світло-сірий reveal) · `--c-grey-blur:hsla(0,0%,76%,.4)`
- **ui-light:** bg `#fff` · text `#8d8d8d` · heading `#000` · line `rgba(0,0,0,.2)` · small `rgba(0,0,0,.3)`
- **ui-dark ui-background:** bg `#000` · text `#8d8d8d` · heading `#fff` · line `rgba(255,255,255,.2)` · small `rgba(255,255,255,.3)`
- Хедер інвертується САМ через `--t-heading` (секція несе `data-themed-class="ui-light|ui-dark"`); окремого класу хедера НЕМА.

## ТИПОГРАФІКА (Onest, все UPPERCASE, desktop = 1-й аргумент fork)
- family: `Onest, Helvetica Neue, Helvetica, Arial, sans-serif`
- `--scale-text-rem`: `max(0.7875rem, min(1rem, 0.7875rem + 2.125*((vw100-720)/480)))` (0.7875→1rem між vw 720→1200)
- `.h1`: `calc(--scale-text-rem * 11.3)` · w400 · lh 0.9734 · ls -.04em(md)/-.02em · color --t-heading
- `.text-h2-large` / `.text-h2-medium`: `* 7.1` · w400 · lh ~0.986 · ls -.04em
- `.text-lead`: `* 4.2` · w400 · lh 1.071 · ls -.02em
- `.text-small`: `* 1.1`→`*1` · w500 · lh 1.27 · ls 0/.01em
- `.text-tiny`: `* .8` · w500
- `.leading-trim`: `text-box:trim-both cap alphabetic`

## MOTION-МОВА
- ГОЛОВНИЙ ease: **`cubic-bezier(.25,.74,.22,.99)`** (×22 — reveal/fade/blur/theme)
- preloader/fade-out: `cubic-bezier(.7,0,.3,1)` · базова тривалість `.6s` · reveal `calc(--line-total*60ms + 1s)`
- image reveal: `[data-reveal=image-in-fullscreen] img { filter:blur(20px) }` → color 1s ease

## PINNING-МЕХАНІЗМ (головне)
- `.sticky` = grid, всі шари в одну area `sticky_content` (стос), змінні `--sticky-*-distance:100svh`.
- `.sticky__layer--sticky` = липне (`position:sticky top:0`; у Locomotive JS робить `position:fixed` поки секція в в'юпорті).
- `.sticky--under-next` = `margin-bottom:-100svh` + `:after{height:calc(min-height -100svh + next-distance)}` → spacer тримає pin ~100svh поки НАСТУПНА секція наїжджає зверху. (md-up: next-distance=0px override)
- `.sticky--section-to-sticky` = `margin-top:50svh`(md)/0 → контент в'їжджає у pin через parallax `sectionToSticky`.
- `.sticky--full-height` = pin-шар 100svh (intro/architecture/headquarters fullbleed).
- `data-plugin="stickyBottom"` = pin до НИЖНЬОГО краю (картки наростають знизу — space/service/solutions).
- Слайдери `image-slider-sticky --items-count:N` = pin з N станів, лічильник «1/N» + прогрес-бар синхронні зі скролом, тексти/фото кросфейд через `imageSliderImage`.
- `stack-slider` (solutions desktop) = кожна картка pin через stickyBottom + `--stack-index`, картки стекаються.

## МІЖСЕКЦІЙНІ ШВИ (5 dark fade)
`.section-fade-overlay ui-dark ui-background` = `position:absolute; bottom:0; height:100svh; z-index:1; pointer-events:none`, bg `#000`, opacity керує parallax: `data-parallax-0-100'{"opacity":0.5}'` `data-parallax-100-100'{"opacity":0}'`. НЕ gradient — opacity-driver.
Стоять ТІЛЬКИ в кінці СВІТЛИХ секцій→світлі: після info-top, info-bottom, space, autonomy, certificate. Переходи В темні (architecture→revolves, headquarters→space, service→certificate, solutions→footer) швів НЕ мають — темна splash сама розділювач.

## КАРТА 14 СЕКЦІЙ (порядок, рядки air-about.html, патерн)
1. **INTRO** (314) `ui-dark full-height no-overflow` — fullbleed фото pin (`sticky--full-height --under-next`), h1 "the project: / confidence / in AIR" group--between, arrow #next. Асет `1.intro/background@xxxl`. parallax landingIntroMove+Fade.
2. **INFO-TOP** (402) `ui-light reveal` — pin (`--under-next --section-to-sticky`) 3 вежі SVG-піни B1(20fl)/B2(34fl)/B3(14fl), reveal-h2 «Business is built…14 to 34 floors». Асет `2.info-top/image@xxxl`. → fade-шов @496.
3. **INFO-BOTTOM** (508) `ui-light reveal` — center-абзац TEKTA/Commonwealth → 2-кол фото (imageMove) → pin генплан (пін b3) + «Learn more»→#headquarters. h2 «A large corporation…Building 3». Асети `3.info-bottom/image-1,2,map`. → fade @672.
4. **ARCHITECTURE** (687) `ui-light no-overflow-clip reveal` — h1 "Architecture / of efficiency" + 2 абзаци → **image-slider-sticky --items-count:3** (`sticky--full-height`, темний ui-dark): fullbleed фото-слайдер + **glass card-slider** (ui-background-alt-dark blur-large) справа з прогрес-баром 3 сегм + лічильник «1/3». 3 тексти кросфейд (Schüco / 8.4×8.4m / Khodynskoye). Асети `4.architecture/image-1..3@xxxl`.
5. **REVOLVES** (928) `ui-dark reveal` #revolves — інтро → pin (stickyBottom): fullbleed Vimeo `1145246264` (квадрат) + WebGL-карусель поверхів (desktop) / список (mobile). h2 "Everything / revolves / around / you". Асети placeholder + `5.revolves/image-1..3`.
6. **HEADQUARTERS** (1122) `ui-light no-overflow-clip reveal` #headquarters — **image-slider-sticky --items-count:3 --headquarters**: fullbleed фото вежі B3 + SVG-лінія-конектор + glass card-slider (with-buttons) справа: прогрес + «1/3» + 3 тексти + кнопка «Advantages of independence»→#advantages. h1 "Headquarters / for visionaries". Асет `6.headquarters/background@xxxl`.
7. **SPACE-INTRO splash** (1537) `ui-dark no-overflow-clip` #space — fullbleed title-splash темне фото + центр h1 "A space of / opportunities" (group--between). Асет `7.space/background-top@xxxl` (image-in-fullscreen).
8. **SPACE** (1586) `ui-light reveal` — 2-кол статблоки («8м» ceiling / «680м²» lobby) → fullscreen карусель лоббі (4 слайди, thumb-рейка, «1/4») → pin (stickyBottom): fullbleed фон + пін-титул «Everything for visitor comfort» + **7 glass-карток фіч** (card-team ui-background-alt blur, offset-грід наїжджають). Асети `7.space/image-1..4`, `background-bottom`, `icon-1..7.svg`. → fade @2238.
9. **AUTONOMY** (2252) `ui-light no-overflow-clip reveal` #autonomy — fullbleed фон + центр h2 "Maximum / autonomy" → 2-кол грід (текст+фото+2 квадрат+glass-картка кави) → pin (`--section-to-sticky about-automony-sticky-bottom` stickyBottom): fullbleed фон + parallax-титул «4000м²» + **інтерактивний plan** (SVG-мапа ~20 POI-пінів+тултіпи + compass rotate -15°). Асети `8.automony/background,image-1..3,map.svg,map@xxxl`. → fade @2647.
10. **SERVICE** (2662) `ui-dark reveal` #service (величезна) — split-h2 "Service / excellence" + інтро-грід + широке фото → pin (stickyBottom): fullbleed Vimeo `1145253896`(desk)/`1145257803`(mob) + 2 блоки: **«Premium technologies» 7 великих glass-карток** (card-team--service--large, hover-popup cardHover, діагональ offset) + **«Innovative engineering» 6 малих** (col--md-2). Асети `9.services/image,icon-1..7.svg`.
11. **CERTIFICATE** (4098) `ui-light no-overflow-clip reveal` #certificate — pin (`--under-next --section-to-sticky` stickyBottom): fullbleed фон (background--top) + split-титул h1 "CLEVER / certificate" + велика заява h2 (offset--md-6) + лого CLEVER + абзац. Асети `10.certificate/background`, `logo-clever.webp`. → fade @4189.
12. **SOLUTIONS-INTRO splash** (4203) `ui-dark no-overflow-clip` #solutions — fullbleed title-splash + центр split-h1 "layout / solutions". Асет `11.solutions/background@xxxl`.
13. **SOLUTIONS** (4251) `ui-light no-overflow-clip reveal` — статблоки («52.7м²»/«1610.5м²») → mobile image-slider-sticky (4, «1/4») → **desktop stack-slider** (4 картки --stack-index, перші 3 pin stickyBottom, стекаються) → **office-tabs** (tabs accordion: 79/136/220/340/763/1566 м²) → footer-office CTA «Choose an office»: «By parameters»→/offices, «On the master plan»→/visual-search. Асети `image-1..4`, `office-1..6.webp` плани.
14. **FOOTER** (5596) `ui-dark footer--with-breadcrumbs` — stacked: breadcrumbs (Home/About) → великий AIR SVG лого → © 2026 Tekta + «Website by Vide Infra» → UPPERCASE legal disclaimer. Асет `logo-footer.svg`.

## ПОРЯДОК ПЕРЕРОБКИ (запропоновано)
Скелет (sticky-система + токени тем + reveal-механізм + glass-утиліти + fade-шви) ПЕРШИМ як спільна основа → потім секції зверху вниз партіями по 3-4 → section-parity після кожної партії проти about-folds. /about = пілот, потім конвеєр на location/investment/progress/management (у них ті самі патерни — image-slider-sticky, glass-картки, plan, tabs).
