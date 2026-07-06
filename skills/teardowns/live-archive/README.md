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
