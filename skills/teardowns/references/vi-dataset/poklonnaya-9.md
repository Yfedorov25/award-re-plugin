# POKLONNAYA 9 — vi-dataset анкета

## 0. META
site_slug: poklonnaya-9
live_url: https://poklonnaya9.site/ (лінк з videinfra.com/work/poklonnaya-9)
liveness: live, але GEO-BLOCKED — IP 158.160.44.250 (Yandex Cloud) таймаутить з-за кордону; зонд через Wayback-знімок 2026-06-10 (200, повні сирці HTML+CSS+JS). Знімок = EN-версія сайту (lang="en").
рік: n/a (кейс-сторінка без дати; девелопер ANT Development, готель SO/ Moscow 5*)
тип: ЖК (преміум-вежа, Москва, Поклонна гора; апартаменти пов. 8-28 + готель SO/ пов. 1-7 + пентхауси)

## 1. ТИПОГРАФІКА
display_font: Neutraface Condensed Custom («Neutraface Cond Medium Fin.ttf», fw 500) — h1/h2/h3/menu; кирилиця: n/a (зонд EN-версії; Neutraface офіційної кирилиці не має — файл «Custom/Fin» = кастомний)
body_font: Futura PT Book 400 + Medium 500 (FuturaPT-Book.woff / FuturaPT-Medium.woff) — body/кнопки; кирилиця: так (Paratype)
third_font: n/a
H1 (.h1/h1): 4.35 → 8.7 → 11.7 ×(--scale-rem) (≈117px max), lh 1.026-1.034em, ls .04-.05em, fw 500 (Neutraface)
H2: 5.8 → 8.7 ×scale-rem, lh .948-1.034em, ls 0-.05em
H3: 2.6 → 4.35 → 5.8 ×scale-rem, lh 1.034-1.154em, ls .05em
body: 1.2 → 1.5 → 1.8 ×scale-rem (12→18px), lh 1.667em, letter-spacing .1em (ШИРОКИЙ трекінг боді — фірмова риса); small 1→1.5
fluid: ТАК — VI scale-система: html{font-size:62.5%}; --scale-rem:calc(0.5rem + 5*((100vw − 720px)/720)), --scale-px аналогічно (все = calc(var(--scale-*) * N))
H1:body = 11.7:1.8 ≈ 6.5:1
uppercase: лише 4 CSS-правила — заголовки НАБРАНІ капсом у контенті ("A PLACE OF POWER…"); + ls .1em на боді імітує label-стиль
числа: tabular n/a

## 2. КОЛІР
палітра (токени :root, hex-частоти: #fff ×13 · #000 ×7 · #ff6e00 ×4): --c-orange:#ff6e00 (+rgb 255,110,0) · --c-white:#fff · --c-black:#000 · --c-gray:grey · --c-dark-lines:#262626 · --c-dark-gray:#1e1e1e · --c-disabled:#c5c5c5 · --c-print:#000 · --c-error:#d9534f
база/фони: ТЕМНИЙ сайт — всі 7 секцій home = ui-dark (×29); ui-light ×4 (модалки/форми)
текст: біла/чорна пара через t-токени; 1-й акцент: #ff6e00 (оранж — лінки hover, headings-link, primary)
2-й акцент: n/a (моно-акцент)
теми секцій: дворівнева токен-система — фіз. кольори --c-* → семантичні --t-* (--t-background, --t-text, --t-heading, --t-primary, --t-link-hover:orange, --t-line:rgba(black,.15)); класи ui-dark/ui-light/ui-background перемикають t-шар
scrim/overlay: --t-line rgba(var(--c-black-rgb),.15) · --t-line-gray .2 · --t-line-orange rgba(orange,.3) · --t-smallish rgba(black,.3)
чисті #000/#fff: ТАК

## 3. ДИЗАЙН-СИСТЕМА
container: без фіксованого max-width — .container-h з padding var(--spacing) (=80/60/20px ×scale); brejки aspect-ratio-aware: @media (min-width:568px) and (max-aspect-ratio:13/9),(min-width:668px)…,(min-width:980px) ×79 — МЕДІА-ЗАПИТИ ЧЕРЕЗ АСПЕКТ, не лише ширину (567/667/979/1439/1920 + 13/9)
radius: 15/20/30/40 ×scale-px (м'які картки) + 50% (кола) + АРКА: border-radius:calc(50vw − 60px) calc(50vw − 60px) 0 0 — арочні зображення
hairline: --t-line rgba(black,.15) 1px
кнопки: токенні --button-height 30/40/60 ×scale-px; механіка inset box-shadow: --button-background-size 1px (контур) → calc(height/2) (заливка) на hover
іконки: n/a (зонд без SVG-аудиту)
spacing: --spacing 80/60/20, --spacing-sm 60/40/20; все через --scale-px (в'юпорт-пропорційна сітка)

## 4. РУХ/СКРОЛ
движок: кастомний smooth-scroll класу Locomotive (namespace="locomotive" в бандлі), lerp:.1 (і lerp=.1*inertia); barba.js ×23 — page transitions; keen-slider ×7 — карусельний движок; IntersectionObserver ×9
ease-криві: cubic-bezier(.25,.74,.22,.99) ×33 — ФІРМОВА VI, токен --transition-easing · (.55,0,.1,1) ×2 · (.6,0,.1,1) ×2 · (.74,0,.24,.99) ×2 · (.47,.04,.5,−.06) ×2 (анти-овершут) · (.13,.41,.1,1) ×1
JS-easing: easeInQuartOutExpo ×4, easeInOutExpo ×3, easeOutExpo ×2, easeInExpo ×2 + Bez-набір
durations: токени --transition-duration:.5s (база) /1s /.25s; CSS-сітка: 1s ×14 · .5s ×17 · 1.5s ×7 · .25s ×5 · амбієнт 4.5s/5s/5.5s/6s/8s (повільні фонові)
reveal: data-plugin="appear" ×93 + data-reveal: fade-in ×28 · slide-in-bottom slow ×15 · title ×13 · building ×4 (кастомний реверс будівлі!) · text ×2; data-reveal-delay ×17
parallax: ІМЕННІ ПАТЕРНИ — data-parallax-pattern="block|image|verticalText" ×18 + множники data-parallax-block-multiplier ×10, data-parallax-deco-transform ×6 (плагін parallaxDeco), data-parallax-enable-mq (вимикається на мобайлі)
pin/sticky: position:sticky ×5, fixed ×13; stickyHeader-плагін; класи section--fix / section--fix-2 (перша й остання секції)
WOW: 1) Lottie-прелоадер-інтро (preloaderLottie + preloaderIntro; lottie ×47 у бандлі); 2) арочні зображення (border-radius 50vw арка = архітектурний мотив); 3) verticalText-паралакс (вертикальний текст їде окремою швидкістю); 4) СИСТЕМА «ОБРАНЕ» — favouriteCounter + favouritesList + cardScroll (вішліст квартир, рідкість для ЖК); 5) data-reveal="building" — власний reveal для рендерів вежі
WebGL: У БАНДЛІ Є (клас preloaderWebgl, getContext("webgl")) але на home НЕ активований — юзається Lottie-прелоадер
prefers-reduced-motion: ТАК ×2 — @media (prefers-reduced-motion:reduce),(update:slow)

## 5. КОПІРАЙТ/СЕНС (зонд EN-версії; оригінал ru недоступний — geo-block)
hero H1 (SEO, прихований): «LCD POKLONNAYA 9 - official website, prices and promotions from the developer ANT Development» (машинний переклад «ЖК»→«LCD»)
hero видимий хедлайн (.text--g3): «A PLACE OF POWER OVERLOOKING THE PLACE OF GLORY» — 8 слів (гра: Поклонна гора / Парк Перемоги)
section-headlines (H2, дослівно): «5* HOTEL SERVICE IN YOUR HOME» · «THE FREEDOM TO ENJOY LIFE» · «A PLACE OF POWER OVERLOOKING THE PLACE OF GLORY» · «A NEW DIMENSION FOR THE GOLD STANDARD IN ARCHITECTURE» · «NEWS & OFFERS» · «SELECT AN APARTMENT»
nav: INFRASTRUCTURE · DESIGN · LOCATION · GALLERY · LIFESTYLE · ABOUT THE PROJECT · APARTMENTS · PENTHOUSES · CONSTRUCTION PROGRESS · NEWS · CONTACTS · DOCUMENTS · TERMS OF SALE · TEAM · VIDEO ABOUT THE PROJECT · DOWNLOAD PDF BROCHURE
CTA-дієслова: «SELECT AN APARTMENT» · «REQUEST A CALLBACK» · «FAVORITES» · «DOWNLOAD PDF BROCHURE»
тон: статусний максималізм — «place of power», «gold standard», «5*»
цифри-в-копі: «5*» (готель), поверхи «Floors 1-7» / «8-28»
прийоми: гра слів (power/glory), готельна лексика як доказ сервісу, капс-набір заголовків
Big Idea: вежа над Парком Перемоги, де живеш як у 5* готелі — SO/ Moscow обслуговує твій дім
ВИСНОВОК-сенс: продають СТАТУС + СЕРВІС (готельне життя як перманентний привілей, вид на «місце слави» = символічна влада)

## 6. СТРУКТУРА
home: 7 секцій — hero(section--fix, прелоадер-інтро) → готель SO/ + freedom → location («place of power») → architecture («gold standard») → news & offers → select apartment (plan) → contacts/footer(section--fix-2); всі ui-dark
сторінки: apartments, penthouses, infrastructure, design, location, gallery, lifestyle, about, construction progress, news, contacts, documents, terms of sale, team (≈14, nav 16 пунктів)
visual search: ТАК — data-plugin="plan" + data-plan-plugins="anchors markers" (VI plan-движок) + обране (favourites)
к-сть мов: en (зонд; ru — оригінал, недоступний)

## 7. SIGNATURE
За 5 секунд: суцільно темний люкс + оранж #ff6e00, кондензований капс Neutraface, арочні вирізи зображень, широкий .1em трекінг боді.
Найкрутіший момент: арка border-radius:50vw на фото + verticalText-паралакс — архітектурний мотив прошитий у CSS-геометрії.
Що вкрасти: дворівневу токен-систему --c-*→--t-* (теми = підміна одного шару) + aspect-ratio-aware медіазапити (13/9) + «обране» для квартир (favouriteCounter) + анти-овершут криву (.47,.04,.5,−.06).
