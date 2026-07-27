# ERA — era.estate (живий зонд curl, 2026-06-10)

## 0. META
site_slug: era · live_url: https://era.estate · liveness: **live** (200) · рік: n/a в сирці (© Tekta Group без року) · тип: ЖК преміум (Art Deco вежі, Москва, Tekta Group)

## 1. ТИПОГРАФІКА
- **display_font: Decart** Regular 400 — `/assets/fonts/Decart-Regular.woff2` (198 глифів; кирилиця А-я 64/64, укр ЄІЇҐ 0/4 — RU-сабсет)
- **body_font: Gilroy** — Gilroy-Medium.woff (500) + Gilroy-Bold.woff (700); кирилиця 64/64, укр 4/4
- third_font: нема (Consolas-stack лише для code). Ваги: 400 (Decart), 500/700 (Gilroy)
- **H1** `.h1,h1`: font-size `calc(var(--scale-text-rem)*35.5)` = **355px** @xxxxl → 257 @xxl → 171 @md → 85 моб; lh 1.118→1.012em; ls −0.02/−0.03em; **uppercase**; 400
- **H2**: ×25.7 = 257/171/140/57px; lh ~1.01em; ls −0.02em; uppercase
- **H3**: ×11.2 = 112/85/57/32px; lh 1.06-1.14em
- **body**: ×1.8 = 18/16/14/12px; lh 1.25–1.29em; ls 0; Gilroy 500; lowercase
- **caption** `.text-small`: ×2 = 20/15/12px; **uppercase**; ls .02–.05em; `.text-lead` ×2.3=23px uppercase
- fluid-формула: НЕ clamp на font-size — глобальний токен `--scale-text-rem: max(0.84rem, min(1rem, 0.84rem + 1.6*((100vw−720px)/480)))` (html font-size:62.5% → 1rem=10px); розміри через каскад breakpoint-варів `var(--xxxxl,…) var(--n-xxxxl,…)`
- **H1:body ≈ 19.7:1** (355:18) — найекстремальніший з 5 сайтів
- uppercase-стратегія: всі заголовки + text-small + text-lead uppercase, body — ні
- числа: окремого шрифту нема; `font-feature-settings:"kern" 1` only

## 2. КОЛІР
- Палітра (:root): **#051936 blue** (база-дарк; найчастіший hex ×17) · **#f8f0e8 beige** (×8) · #fff · #000 · **#cf8f7d brick** (акцент-1, ×6) · #c07863 dark-brick · #686058 grey · #7e848f grey-2 · #e34a4a error
- Градієнти-токени: `--c-brick-gradient` 90deg #dda086→#c1816f · `--c-gradient-blue-pink` 180deg #051936→#cf8f7d · `--c-text-gradient` #eab6a0→#cf8f7d (текст-градієнт на display!)
- Теми секцій: `.ui-dark` (bg blue) / `.ui-light` (bg beige) / `.ui-white` + `*-background` варіанти; токени `--t-background/--t-heading/--t-line` перемикаються класом
- Scrim: `linear-gradient(180deg,transparent,rgba(0,0,0,.45))`; `transparent 10%→rgba(0,0,0,.5) 97.6%`; top-scrim `rgba(0,0,0,.7)→transparent 23.28%`
- Чисті #000/#fff: так (`--c-black:#000`, `--c-white:#fff`)

## 3. ДИЗАЙН-СИСТЕМА
- container: `--container-max-width:var(--vw100)` = 100vw (full-bleed, без max-width)
- gutters: `--grid-gutter` 40px(lg)/30px(md)/0(моб); 12 кол → 4 кол моб
- radius: домінує **0** (×62); картки calc(scale-px×20/30/40); 50% круглі кнопки
- hairline: `1px solid var(--t-line)`; `--t-line-thin: rgba(blue|beige,0.15)` / thick 0.5 / footer 0.2
- кнопки: гігантські круглі CTA `--button-height` 120/180px + btn--square; hover через t-button-link токени
- spacing-ритм: `--spacing` 80/60/40/20px по брейкпоінтах; глобальний `--scale-px: max(0.6px…1px)` масштабує ВСЕ

## 4. РУХ/СКРОЛ
- движок: **Locomotive-style virtual scroll** у shared.js (`namespace="locomotive"`), **lerp:.1**; Barba.js (переходи); Three.js повний у бандлі (THREE.WebGLRenderer ×42 — для /3d-map)
- ease: **cubic-bezier(.25,.74,.22,.99) ×28** (house ease) · (.55,0,.1,1) ×2 · (.18,0,.78,1) ×1 · JS: (.2,.6,.35,1)
- durations: 1.6s ×11 · .4s ×10 · .8s ×6 · 2s ×4; утиліти `.animation--fast` .2s / `.animation--slow` .8s
- reveal: `[data-reveal]` opacity 0→1 (no transform) + data-reveal-duration/delay; ×28 на home
- parallax: `data-plugin="parallax"` ×71 + **named patterns** `data-parallax-pattern="apartments|apartments-title|apartments-image…"` (keyframes в JS-реєстрі) + clamp + measure-selector + mobile-smooth
- pin/sticky: `data-scroll-sticky` ×4 на home; `data-scroll-gravity-well` ×2 (скрол-магніт)
- WOW: ① visualizationLines/Cylinder/Image/Menu (лінії-арт поверх рендерів) ② sequence (кадрова анімація) ③ text-gradient на Decart-заголовках ④ gravity-well ⑤ 3d-map (Three.js маса)
- WebGL: ТАК (Three.js) — але НЕ на home; точково /3d-map
- prefers-reduced-motion: ТАК (вбиває всі анімації + reveal force-visible)

## 5. КОПІРАЙТ/СЕНС
- hero H1: **"place of art"** (EN, 3 слова) + лід "The place where life becomes art"
- section-H2 дослівно: "The new Art Deco era" · "architecture" · "Joys of every day" · "A touch of sophistication" · "Интерьеры" (неперекладений RU у EN-версії!) · "Apartments" · "A new ERA for the city, a new chapter in your life."
- тон: поетично-статусний, мистецтвоцентричний; гра слів ERA/era, art/Art Deco/art de vivre
- Big Idea: **«життя як мистецтво — перший Art Deco-район міста»**
- прийоми: гра слів; цитата архітектора (Grigorios Gavalidis, GAFA bureau); анафора-список "to jog down the embankment · to enjoy a concert · to take a walk"
- цифри-в-копі: на home майже нуль (факти живуть у каталозі/юніт-сторінках)
- CTA-дієслова: Select by Criteria · Visual Selection · virtual tour · Request a call · 3D-map · select apartment
- ВИСНОВОК: продають **СТАТУС ЧЕРЕЗ МИСТЕЦТВО** (художня спадщина як виправдання ціни)

## 6. СТРУКТУРА
- home: 9 `<section>` / 10 data-scroll-section: hero("place of art")→Art-Deco-era→architecture(+quote)→joys-of-every-day→sophistication/interiors→apartments→CTA-finale→footer
- сторінок: **~270+** (21 фікс + ~89 floor + 6 building + 151 unit)
- nav дослівно: Select by Criteria · Visual Selection · 3D-map · virtual tour · Architecture · Location · Amenities · About the project · Panorama · Gallery · How to buy · news · developer · documents · contacts · Commercial premises · Parking and storage
- visual-search: **ТАК** (/visual-search SVG drill + /3d-map + /panorama + /flats фільтр)

## 7. SIGNATURE
- За 5 сек: гігантський Decart "place of art" (355px) на глибокому синьому #051936 з цегляно-рожевим градієнт-текстом
- Найкрутіший момент: visualization-lines поверх рендерів + 3d-map Three.js маса
- Що вкрасти: token-формула (1 дарк-база + 1 крем + 1 теплий акцент + градієнт-пара) і H1:body 20:1
