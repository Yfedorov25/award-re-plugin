# AIR — aircenter.space (живий зонд curl, 2026-06-10)

## 0. META
site_slug: air · live_url: https://aircenter.space · liveness: **live** (200) · рік: n/a в сирці (футер «© 2026 Tekta group» — динамічний) · тип: бізнес-центр класу A (офіси, Ходинське поле, Tekta Group)

## 1. ТИПОГРАФІКА
- **display_font = body_font: Onest** (Google-шрифт) — Onest-Regular.ttf (400) / Onest-Medium.ttf (500) / Onest-SemiBold.ttf (600); подається як **TTF, не woff2**; 534 глифи; кирилиця 64/64, укр ЄІЇҐ 4/4. ОДНА родина
- third_font: нема. Ваги: 400 (заголовки/lead), 500 (body/btn), 600 (рідко)
- **H1**: `calc(var(--scale-text-rem)*11.3)` = **113px** @xxxxl → 99 → 71 → 56 → 42 моб; lh 0.973em; ls −0.04em; **uppercase**; 400 (скромний H1 — фото головніше)
- **H2 = H3 = H4 = H5** (один розмір!): ×4.2 = **42px**/37/28/21; lh 1.07em; ls −0.02em; uppercase; 400. `.text-lead` = той самий розмір
- **body** `.text-default`: ×1.4 = **14px**/13; lh 1.286em; ls 0; **UPPERCASE** (єдиний із 5 сайтів, де body теж капсом!)
- **caption** `.btn,.text-small`: ×1.1 = 11px/10; lh 1.27em; uppercase
- fluid: `--scale-text-rem: max(0.84rem, min(1rem, …(100vw−720px)/480))` (html 62.5%); breakpoint-вар каскад
- **H1:body ≈ 8:1** (113:14) — найстриманіший
- uppercase-стратегія: **ВСЕ uppercase, включно з body** — текст стає графічною текстурою
- числа: метрики (1/3/7/11 min) сетяться як H2-цифри; tabular нема

## 2. КОЛІР
- Палітра (:root): **#000 black** (база, найчастіший ×18) · **#fff white** (×12) · #f2f2f2 superlight · #606060 dark-grey · #8d8d8d grey · #dfdfdf white-hover · #333 black-hover · #ea4651 discount · #e34a4a error
- **Акцентного кольору НЕМА взагалі** — ч/б каркас, колір дає тільки фото/відео
- Теми секцій: `.ui-dark`/`.ui-light` + `.ui-background-alt` = rgba(black,.05) / rgba(white,.1) / `.ui-background-alt-dark` rgba(black,.12); **`data-themed-class="ui-light|ui-dark"` ×11** — секція сама перемикає тему хедера при скролі
- Scrim: фірмові синювато-сірі: `linear-gradient(200.92deg, rgba(51,53,78,0) 61.84%, #33354e 91.25%)` · `rgba(85,86,99,0) 87.42% → #555663`
- hairline: `1px solid rgba(var(--t-line-rgb),.12)` та var(--t-line) rgba .2
- Чисті #000/#fff: ТАК — буквально база системи

## 3. ДИЗАЙН-СИСТЕМА
- container: 100vw; gutters `--grid-gutter` **20px/10px** (найщільніша сітка з 5)
- radius: **5px** фірмовий дрібний (×15) + 2px; кнопки прямокутні r=5px (`--btn-rx: min(5px, height/2)`)
- hairline: rgba(line,.12); spacing: `--spacing` 50/40/30/20px · `--spacing-layout` 20px
- кнопки: компактні прямокутні, текстові btn--text-h2 (заголовок-як-кнопка)
- іконки: SVG спрайт, дрібні

## 4. РУХ/СКРОЛ
- движок: **Locomotive Scroll** (namespace="locomotive", lerp:.1) + Barba.js; Splitting.js ×25 (по-літерні/по-словні анімації)
- ease: house **cubic-bezier(.25,.74,.22,.99) ×23** + ВЛАСНИЙ дует **(.7,0,.3,1) ×11** (різкіший inOut) + (.29,.73,.45,1) ×4
- durations: .6s ×12 · 2s ×6 · 1s ×6 · .8s ×4 · 1.2s ×2 (середній темп швидший за luxury-сайти)
- reveal: `[data-reveal]` opacity **.005→1** (anti-CLS: майже-невидимий замість 0); ×27
- parallax: `data-plugin="parallax"` ×34 + `data-parallax-pattern` ×29 (named у JS) + index/first + clamp
- pin/sticky: `data-scroll-sticky` ×8; 11 scroll-sections з чергуванням тем
- WOW: ① intro-логотип AIR = 3 окремі SVG-літери з незалежним parallax (landingIntroLogoA/I/R) ② Format: pinned counter-slideshow «3 towers 14–34 floors» ③ data-themed-class перемикання теми по скролу ④ deep-link з прайс-фільтром у каталог ⑤ Splitting по-літерні reveal
- WebGL: 1 шейдер-карусель на **/about** (about-revolves); на home — НІ
- prefers-reduced-motion: **НЕМА** в CSS

## 5. КОПІРАЙТ/СЕНС
- hero H1 дослівно: **"AIR — A Premium Class A Business Center on Khodynka Field by Tekta Group"** (12 слів; SEO-H1) + видимий display-теглайн **"The architecture of New Success"**
- section-headlines дослівно: "The momentum to rise higher" · "A new premium format" · "An intelligent harmony of curved glass and radiant metal" · "At the center of life. At the heart of business" · "Designed with people in mind" · "A tangible sense of status"
- тон: статусно-амбітний, вертикаль успіху ("rise higher"), технологічна елегантність; короткі рублені твердження: "At this level, AIR has no competitors."
- Big Idea: **«архітектура нового успіху — офіс як статусний ліфт»**
- прийоми: метафора руху вгору; антитеза center of life/heart of business; назва-стихія AIR
- цифри-в-копі: **1 min Mall · 3 min Metro · 7 min Downtown · 11 min Highway** (walk/drive) · 3 towers 14–34 floors · Class (A)
- CTA-дієслова: Choose an office · Call me back · Learn more · By parameters · On the master plan · Choose a parking spot
- ВИСНОВОК: продають **СТАТУС/УСПІХ для бізнесу** (інвестиція в образ компанії)

## 6. СТРУКТУРА
- home **11 scroll-sections**: intro-logo(AIR-літери)→hero→impulse(momentum)→format(3 вежі, pinned counter)→harmony(скло+метал)→life(карта+min-метрики)→people-bridge→courtyards→atmosphere→status(slider 1/2)→footer
- сторінок: **~120** (71 office-detail + 28 floor + story/news/legal)
- nav дослівно: Choose an office · About the project · Location · Interactive map · On the master plan · By parameters · Project management · Investment · Construction progress · News and offers · About the developer
- visual-search: **ТАК** (генплан → вежа → поверх → офіс; deep-link з прайс-фільтром)

## 7. SIGNATURE
- За 5 сек: ч/б преміум-мінімал, ВСЕ uppercase Onest, єдиний колір = фото; 3 SVG-літери A-I-R розлітаються при скролі
- Найкрутіший момент: intro-логотип з пошаровим parallax літер + pinned counter-slideshow веж
- Що вкрасти: data-themed-class (секція керує темою хедера) + дисципліна «нуль акцентних кольорів» + reveal opacity .005
