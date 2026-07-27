# PB_performance — ПЕРФОМАНС award-RE (no-WebGL, бойова doctrine) ★★★
> Переписано VI-grounded + БОЙОВІ уроки Quadro/Nahirna (реальні Chrome-трейси на M2 8GB). 2026-06-09.
> Швидкість + ПЛАВНІСТЬ скролу = відчуття «дорого». Лаг скролу вбиває award-враження сильніше за повільний LCP.
> Споріднено: [PB_media](../../re-media/references/PB_media) [PB_scroll_smoothness](../../motion-engine/references/PB_scroll_smoothness.md) [PB_motion_score](../../motion-score/references/PB_motion_score) [D_ERA_architecture](../../re-architecture/references/D_ERA_architecture.md) [D_Springs_architecture](../../re-architecture/references/D_Springs_architecture.md).

## 0. ГОЛОВНЕ
Award-перфоманс тут = НЕ «легкий фреймворк», а ДВІ речі: (1) швидкий старт (LCP/CLS), (2) **залізно плавний скрол** (60fps без ривків). VI доводять: jQuery-era + Barba + Locomotive дають award-плавність — справа не в стеку, а в дисципліні композитора. NO WebGL (хардове правило) знімає найбільший ризик чорного екрану/важкого commit.

## 1. ЦІЛІ
LCP <2.5s · INP <200ms · CLS <0.1 · **скрол стабільні 60fps (frame-gap <16ms у скрол-зоні)**. Останнє — найважливіше для luxury-feel і найважче.

## 2. ВАГА АССЕТІВ (VI-заміри — орієнтир)
- shared.js: ERA 1.34MB, Springs 1.42MB, Ever 483KB — один великий бандл + крихітний per-page. Прийнятно бо Barba кешує між переходами.
- Рендери/фото: ГОЛОВНИЙ кост. Quadro-урок: 8-16MB JPG = DevTools «-47MB savings» + важкий GPU-commit. Шрінкати АГРЕСИВНО (WebP, розмір під слот, не 4K у 1280-канвас).

## 3. ЗОБРАЖЕННЯ (з [PB_media](../../re-media/references/PB_media))
- WebP + JPEG `<source>` fallback; PNG лише cutout; AVIF лише градієнт-текстури.
- **Lazy = JS data-src патерн** (реальний URL у `data-src`, плейсхолдер `px.gif` тримає aspect-ratio-слот) — НЕ native `loading=lazy` (VI так роблять для контролю). Hero = eager + `fetchpriority="high"`.
- Кожен слот = locked `aspect-ratio` → нуль CLS.
- **Immutable cache-headers** на статичні кадри/рендери (Quadro-урок: `max-age=0,must-revalidate` змушував браузер ре-валідувати КОЖЕН кадр при скрол-беку → голодування decode-слотів → ривки. Immutable = найбільший scroll-back виграш).

## 4. ★★★ СКРОЛ-ПЛАВНІСТЬ — БОЙОВА DOCTRINE (Quadro, 4 раунди + council + реальні трейси)
Це серце файлу. Кожен пункт — реальна причина лагу, знайдена трейсом, не теорія.

### 4.1 НІКОЛИ mix-blend-mode над скрол-поверхнею
`mix-blend-mode:screen/overlay` над канвасом/стеком повноекранних зображень → GPU **читає назад + пере-змішує весь стек КОЖЕН скрол-кадр** (Architecture бив 167-217ms кадри!). → Замінити на **plain opacity + will-change:opacity** (свій шар, без backdrop re-read); підняти alpha джерела щоб компенсувати. Над темним фоном additive≈opacity візуально.

### 4.2 НІКОЛИ backdrop-filter над великою скрол-поверхнею
Постійний `backdrop-filter:blur()` на fixed-хедері → GPU ре-блюрить смугу під ним КОЖЕН кадр на ВСЮ сторінку нижче. → Прибрати, замінити щільнішим tint-фоном (frosted-вигляд без read-back). Виняток: interaction-only (модалка по кліку), не скрол.

### 4.3 НІКОЛИ CSS transition на властивості, яку драйвить scroll-var
`html{transition:background-color .2s}` + `--scroll-progress`-driven `--bg` → кожен крок var РЕСТАРТУЄ 0.2s full-viewport bg-tween → весь backdrop репейнтиться безперервно, ніколи не settle. → Прибрати transition; scroll-var уже інтерполює плавно сам.

### 4.4 ОДИН smoothing-authority (не стек easing)
3-4 easing-фільтри в серії (Lenis lerp → ScrollTrigger scrub → manual rAF lerp → lagSmoothing) = різні time-constants ніколи не сходяться → осцилююча швидкість = СТАТЕР, і hero ще й «повільний». → ВИДАЛИТИ шари, не тюнити. ScrollTrigger `scrub:0.6` АБО Lenis — ОДИН смузер. Frame-scrub: tick лише дзеркалить eased-значення (`s.current=s.target`). **lerp=лаг, distance=швидкість — різні важелі** (hero «повільний» лікується коротшою scrub-дистанцією, не меншим lerp).

### 4.5 rAF що чіпає DOM/CSS кожен кадр = тихий page-wide jank
Forever-rAF що пише `--hero-aberration` кожен кадр → page-wide style-recalc 60/s навіть далеко за hero. → **idle fast-path**: коли settled — loop нічого не робить. Gate на «чи є що анімувати».

### 4.6 :root scroll-var у багатьох calc()-токенах = full-page style-recalc
`--scroll-progress` у --bg/--surface/--fg/--scrim (calc) → кожна зміна перераховує колір КОЖНОМУ елементу = Recalculate style 571ms (22%!). → (a) крокувати var (Math.round до 0.04, ~25 кроків замість 100), АБО (b) драйвити day→night через opacity ОДНОГО fixed-overlay (compositor-only, без color-recompute).

### 4.7 Канвас-текстура = найважчий commit
Full-viewport `<canvas>` ре-завантажується в GPU кожен кадр → single 49ms Commit = 3 дропнуті кадри. → DPR cap 1.5, `imageSmoothingQuality:'low'`, малий backing-store + CSS-scale, re-commit лише на реальній зміні кадру. Альтернатива: `<video>` композититься на GPU без per-frame JS-канвас-аплоаду.

### 4.8 Layerize churn
Always-on `will-change` форсує постійні шари → Layerize 389ms (15%). → will-change лише на час твіну (GSAP сам ставить), не назавжди.

## 5. ШРИФТИ
woff2 + preload + `font-display:swap`. SplitText чекає `document.fonts.ready` (інакше reflow-стрибок при reveal).

## 6. ВИМІРЮВАННЯ (як НЕ обдуритись — Quadro-уроки)
- **Headless browse НЕ міряє scroll-feel** — scrollTo-стрибки дають фальшиві gap навіть у плавних секціях. Trust: code-confirmed paint-причини + USER як інструмент.
- **Реальний Chrome-трейс** — єдиний правдивий сигнал. Bottom-up Self-time на ВИДІЛЕНОМУ вікні (не Summary — Summary'євий «unattributed» вводить в оману).
- Міряти PROD (Vercel URL), не dev (HMR роздуває jank: dev hero 34fps vs prod 58fps).
- Incognito (розширення труять трейс: NordPass 448ms).

## 7. SEO/текст (= A1 крит.49)
Текст у DOM, не canvas (SSR). NO WebGL → текст завжди в DOM автоматично. Семантика + meta + per-unit canonical (див. майбутній PB_seo_meta).

## 8. ЧЕК
☐ LCP<2.5 INP<200 CLS<0.1 ☐ скрол 60fps на PROD-трейсі ☐ рендери шрінкнуті (не 8MB) + immutable cache ☐ WebP+JPEG, data-src lazy, hero eager ☐ locked aspect-ratio (0 CLS) ☐ ЖОДНОГО mix-blend/backdrop-filter над скрол-поверхнею ☐ ЖОДНОЇ transition на scroll-driven props ☐ ОДИН смузер (не стек easing) ☐ idle fast-path на rAF ☐ scroll-var крокований АБО opacity-overlay ☐ DPR cap + low smoothing на канвасі ☐ will-change лише під час твіну ☐ woff2+preload+fonts.ready ☐ NO WebGL ☐ виміряно реальним трейсом, не headless.
