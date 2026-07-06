# live-archive — законсервований живий код референс-сайтів

> Створено 2026-07-06 (сесія 5, Fable 5) саме для того, щоб НАСТУПНІ моделі
> (Opus/Sonnet) не мусили самостійно читати мініфікований 600KB shared.js.
> Тут — знімки живого коду + НИЖЧЕ готові витяги-цитати найважчих механік.
> ЗАКОН: живий код > тірдаун-проза > реєстр. Якщо сумнів — grep СЮДИ.

## air/ — aircenter.space (знімок 2026-07-06, v=1781014343)
`air-shared.js` (весь движок) · `air-global.css` · `air-landing.css` ·
`air-about.css` · DOM-зрізи: home, about, location, management-service,
investment, offices.

## ГОТОВІ ВИТЯГИ (перевірені в бою, цитуй — не шукай заново)

### Темп/криві (жива правда)
- durations: `{fast:.2, normal:.4, slow:.8, block:1.4, title:1, titleStagger:.06, text:1, textStagger:.06}`
- JS-свапи contentAnimation = нативні `ease-out`/`ease-in`/`ease-in-out` (НЕ air-bezier!)
- CSS-reveal: `transition: filter 1s cubic-bezier(.25,.74,.22,.99)` + delay `line-index × 60ms`
- хедер themed: `1.2s cubic-bezier(.25,.74,.22,.99)`; бургер: `.6s cubic-bezier(.29,.73,.45,1)`
- меню modal-in/out: фази `0.8s cubic-bezier(.7,0,.3,1)`, повний ритуал 1.6s

### Скрол-движок
- Locomotive Scroll, `lerp: 0.1`, `smooth: true` ВСЮДИ (навіть `smartphone:{smooth:true}`, tablet bp 768)
- наш еквівалент: Lenis lerp 0.1 (⚠️ cdnjs-шлях lenis битий ORB — тільки jsdelivr)

### T-512 wipe (imageClipInVertical/OutVertical — grep у shared.js)
- вперед: старе `polygon(full → лінія-ВГОРІ)`, нове `polygon(лінія-ВНИЗУ → full)`; 1s ease-out
- НЕ «смуга з центру» — один шов краєм-до-краю (виправлення інтерпретації №7)

### contentAnimation (движок слайдерів/пінів — плагіни controller/events/counter/sticky/height)
- index = `min(floor(p·N), N−1)`; ЛІЧИЛЬНИК ставиться ДО анімацій (свап на старті)
- прогрес-бар: `fill_i = clamp(p·N − i)` → `translateX(−100%·(1−fill))`, смужки 2px
- текст: changeShow "text" delay 0.25; фото-дрейф imageSliderImage: 120% висоти, ty −16.666%→0→−16.666%

### Заголовки актів головної (фікс-кол 3!)
- ВСІ h2 = `group group--between` СТАТИЧНІ + `data-reveal="text"` (каскад слів)
- КОНВЕРГЕНЦІЇ РУХОМ НА ГОЛОВНІЙ НЕМА — не додавати T-310-рух там, де розмітка каже статику

### mobileScrollable (T-M23 tap-карусель)
- scroll-snap x mandatory, item ≈9/12 колонок, gap 10px, `scrollIntoView` smooth (~0.4s)
- ⚠️ БІЧНІ ПАДІНГИ обов'язкові — без них останній слайд не стає в snap-центр
- setCounter ДО скролу (лічильник на старті)

### Меню (modal--menu)
- двофазність = ДВІ ПАРИ transition-delay у станах (відкритий: панель чекає .8s; закритий: фон чекає .8s)
- панель md-up: frosted blur 20px, списки 68.571% / плитки 31.429%; моб: column-reverse (плитки НАД списками)

### Двори (l-people-carousel)
- desktop = `carouselWebGl` (ЄДИНИЙ WebGL головної) → наш переклад: perspective+rotateY
  БЕЗПЕРЕРВНИЙ ПОЗИЦІЙНИЙ (rot = clamp(d·24°·1.15) від центру, rAF, IO-гейт) — НЕ дискретні класи
- деко-спіраль: parallax `translateY(-50%) ∓15svh`; моб = mobile-scrollable стрічка

### Хедерні величини Format-піна
- `--status-max-height = 100svh − 2·spacing − header`; пін = `100svh + (N−1)·step`
- бар лічильника: parallax `0-0 → 200-100` (200 бо sticky--under-next)
- лічильник-віджет на hover = КУРСОР секції (cursor--counter, lerp-follower)

### Шви
- sectionToSticky: `translateY(−50svh → 0)` easeSectionInverse, `enableTouch:false`
- sectionFromSticky: `0 → +50svh` easeSection; Half-варіанти: ±25svh
- harmony на ГОЛОВНІЙ: НЕ sticky-картка — зустрічні дрейфи (фон −40→+40svh, картка +20→−20svh)
- T-503 under-next: `margin-bottom: calc(dist·−1)` + z-index наступної секції

### T-207 БРЕНД-ОБ'ЄКТ = ПРЕРЕДЕРЕНІ VIMEO-ЛУПИ (розкрито 2026-07-06, oEmbed + thumbnails)
НЕ WebGL, НЕ realtime-3D. Публічні embeds (без hash), шаблон URL:
`https://player.vimeo.com/video/<ID>?loop=1&muted=1&autoplay=1&autopause=0&background=1`
iframe: `allow="autoplay; encrypted-media" loading="lazy" data-plugin="lazy"`, у `.background background--cover`.
Обертання спіралі — ВСЕРЕДИНІ відео (луп 10–20с), секція лише пінить/дрейфить контейнер.

| ID | title | де | що |
|---|---|---|---|
| 1145251536 | homepage_1 | home hero desktop (`is-hidden--sm-down`) | біла спіраль горизонтальна, 20s |
| 1145256182 | homepage_1_m | home hero mobile (`l-intro-background-mobile`) | вертикальна композиція, 20s |
| 1145253326 | homepage_2 | home format desktop | біла спіраль вертикальна, 20s |
| 1145256699 | homepage_2_m | home format mobile (`l-format-section__background`) | 20s |
| 1145253896 | homepage_3 | statement «At the heart of business & life» desktop (home/investment/management/about) | ЧОРНА металева спіраль, 20s |
| 1145257803 | homepage_3_m | той самий statement mobile + `proj-info-section__background` (/management) | 10s |
| 1145246264 | about_1 | /about | чорна спіраль варіант, 10s |
| 1145247916 | air_hodynka | /location desktop (`sticky--section-to-sticky ui-dark`) | аерозйомка Ходинки, 9s |
| 1145255087 | air_hodynka_mobile | /location mobile | 9s |
| 1145249515 | air_panorama | /location desktop | панорама з даху, 9s |
| 1145255626 | air_panorama_mobile | /location mobile | 9s |

### САМОСТІЙНА ДОЗЙОМКА 2026-07-06 (headless-Хром по живому сайту; сирці: air/recon-20260706/)
Відео-пари в ~/Downloads: AIR-REF--menu-desktop / --cookie-banner / --about-carousel-desktop / --invest-hero-desktop.
- **Меню desktop** = ЦЕНТРОВАНА КАРТКА-модал (не fullscreen): ліва колонка великі лінки (ABOUT THE PROJECT / LOCATION / PROJECT MANAGEMENT / INVESTMENT) + внизу дрібні (CONSTRUCTION PROGRESS / NEWS AND OFFERS / ABOUT THE DEVELOPER); права колонка 2 плитки з ✛: CHOOSE AN OFFICE + CHOOSE A PARKING SPOT (блюр-прев'ю планів). Позаду праворуч — біла спіраль. Бургер → X.
- **Cookie-банер**: `.cookie-consent` fixed bottom:20px по центру, біла пігулка `THIS WEBSITE USES COOKIES` + btn--xs btn--secondary ACCEPT (`js-cookie-consent-accept`), transition all.
- **Ховер кнопок**: `color 0.6s cubic-bezier(.25,.74,.22,.99)` (air-крива) на btn--primary/secondary/rotation.
- **Форма success/error** (СТАТИЧНО в DOM, сабміт не потрібен): `.js-form-success` = `h2 "Thank you!"` + «We've received your request and will contact you shortly» (px-layout py-layout ui-background img-rounded, is-hidden → свап з формою); `.js-form-error-message` = alert-блок error-message text-small. Витяг: recon-20260706/int-form-states.json.
- **/panorama** = fullscreen сторонній iframe `https://aero2.ru/3d/Hod/hod.html` (aero2.ru 360-тур), клас `panorama-iframe`. Власного в'ювера НЕМАЄ.
- **/how-to-buy** = HTTP 500 НА СЕРВЕРІ AIR (сторінки не існує в проді — не діра наших знань).
- **/parking** = «PARKING SELECTION» h1 + таби LEVEL ONE/LEVEL TWO + великий SVG-план паркінгу (той самий plan-движок, AVAILABLE SPACES легенда).
- **/news** = spread-row «NEWS … AND OFFERS» + 3 картки (фото + заголовок + дата + ✛).
- **/developer** = spread-row «TEKTA … GROUP» + біла спіраль по центру + скрол-к'ю стрілка.
- **/progress** = spread-row «CONSTRUCTION … PROGRESS» + «COMMISSIONING: 2028» + фотогалерея з пігулкою «FEBRUARY 2026 ▾» і стрілками ←→.
- **/documents** = h1 DOCUMENTS + спіраль праворуч + breadcrumb HOME/DOCUMENTS + список документів.
- **⚠️ ВИПРАВЛЕННЯ ІНТЕРПРЕТАЦІЇ №8 — /about desktop карусель (T-119)**: живий desktop = SLIDE-PUSH треком (старий кадр їде вліво, новий заходить справа, між ними білий ҐЕП ~15-20px) + ВНУТРІШНІЙ КОНТРПАРАЛАКС картинки в кожному кадрі (~як imageSliderImage), тривалість ~1.0-1.2s air-ease. Кадр: recon-20260706/carousel-midslide.jpg. Стрілки `js-carousel-next/prev` display:none — клік ловлять cursor-зони (`cursor__button--right`), малює курсор-фоловер (T-432). WebGL (`js-carousel-webgl-spinner`, canvas) РЕНДЕРИТЬ текстури, але видимий рух = трек+паралакс, морфа немає. Наш clip+blur переклад був з мобільних кадрів → desktop-варіант revolves-carousel ПЕРЕБУДУВАТИ під slide-push.
