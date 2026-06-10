# AZURE (девелопер, KSA) — vi-dataset анкета

## 0. META
site_slug: azure
live_url: https://azure.sa/ («Visit Website» прямо на кейсі)
liveness: live (АЛЕ за Cloudflare bot-challenge — curl/headless = 403 «Just a moment»; зонд = Wayback-дзеркало живих сирців 2025-11-16, бандли v=1763112037 ≈ лист.2025)
рік: ≈2025 (свіжий кейс; картинки кейсу груд.2025)
тип: КОРПОРАТИВНИЙ сайт девелопера-оператора — «largest chain of premium residential compounds in Saudi Arabia» (оренда вілл/квартир у gated compounds, Ріяд); НЕ промо одного ЖК
кейс: videinfra.com/work/azure — turnkey: стратегія → копірайтинг → імплементація

## 1. ТИПОГРАФІКА
display_font: **AZURESans** (кастомний бренд-гротеск: AZURESans-Medium.woff2 + Regular.woff2) — кирилиці НЕМАЄ (unicode-range 0; сайт en, dir=ltr)
body_font: той самий AZURESans 400 · third_font: **TT Jenevers Light Italic** — зареєстрований як italic-500 ВСЕРЕДИНІ родини AZURESans (серифний курсив-акцент вмикається просто <i>)
ваги: 400, 500 (+light italic serif)
H1: fluid 11rem→17.6rem (110→176px @1440→2400vw), lh .909em, ls **-.04em**, fw 500, transform none
H2: 8rem→12.8rem (80→128px), lh 1em, ls -.04em, fw 500
H3: 5rem→8rem · H4/.text-lead: 3rem→4.8rem lh 1.167
body/.text-small: 1.2rem→1.6rem (12→16px), lh 1.33, fw 400
fluid-формула: max(Xrem, min(Yrem, calc(X + N*((vw100−1440px)/960)))) — фірмова VI; ПЛЮС глобальний токен --scale-px=max(.5px,min(1px,…)) — весь UI множиться на скейл-фактор
H1:body = 176:16 = 11:1 (!) · uppercase: МАЙЖЕ НІ (1 правило; все sentence-case) · числа: tabular нема

## 2. КОЛІР
палітра (частоти): #000 ×12 · #fff ×11 · #ce0000 ×2 (error) · #666 ×2 · **#0c436a ×2 (глибокий azure-синій)** · #3f90ce (блакить) · крижані тінти #e9f2fa/#e0e8f0/#f0f3f6 · пісок #efd6be/#e9d4bf/#d6995c · золото #bc9400 · #816b60
база/фони: темна база (більшість секцій ui-dark) зі вставками ui-light; чисті #000/#fff — так
текст: #fff на темному / #000 на світлому
1-й акцент: azure-синій (#0c436a/#3f90ce) · 2-й: пісочно-золотий (KSA)
теми секцій: класи **ui-dark / ui-light** + section--over-previous / section--under-previous (стекове нашарування секцій)
CSS vars: НЕ кольори, а скейл/спейсінг-математика (--scale-px/--scale-rem/--spacing з vw-формулами)

## 3. ДИЗАЙН-СИСТЕМА
container: без класичного .container; брейки 667/979/1440/2400 + aspect-ratio-медіа-квері (13/9, 10/11!) — орієнтація важливіша за ширину
radius: 0 домінує (×25); кнопки var(--btn-rx/--btn-ry); картки calc(--scale-px*30) / *10; 50% кружки
кнопки: data-button-clone-content ×29 — клон-текст hover-механіка (текст дублюється і виїжджає)
іконки/hairline: n/a (не зондовано глибоко)
spacing: --spacing токен з fluid-формулою 60→80px (xxl) / 30→60px (md)

## 4. РУХ/СКРОЛ
движок: **кастомний smooth-scroll з lerp=.1** (smooth-scroll-last-scroll ×8, згадка locomotive ×1 — locomotive-style API: data-scroll ×24, data-scroll-section ×13, data-scroll-sticky ×24); barba.js ×28 page-transitions; Splitting.js ×13 (char-split)
ease-криві (частоти): **cubic-bezier(.25,.74,.22,.99) ×25 (фірмова VI)** · (.55,0,.1,1) ×9 · (.6,0,.4,1) ×6 · (.47,.04,.5,-.06) ×1 (анти-овершут) · (.35,0,.7,1) ×1 · (.29,.73,.45,1) ×1 · 1 динамічна template-string (JS-генерована!)
durations: .8s ×9 · .4s ×7 · 1.3s ×6 · .7s ×6 · 1.6s ×5 · мікро 10-40ms; JS: 500/350ms
reveal: data-reveal ×152 — словник: **text ×66 · title ×38 · line ×23 · line block ×10 · fade-in blur-in block ×6** (+slide-in-top); модифікатори -distance/-delay/-repeat/-group
parallax: **ІМЕНОВАНІ патерни** data-parallax-pattern ×109: imageMove, exquisiteImage, serviceImage, exquisiteMobCard(Overlay), imageMoveMobile (+clamp/-direction/-measure-selector/-enable-mq/-mobile-smooth) — РЕЄСТР патернів, не inline-keyframes
pin/sticky: data-scroll-sticky ×24 (масивне використання)
WOW: 1) **WebGL 3D-мапа compounds** (.js-compounds-plan-webgl, плагін webglMap, lazy-чанки i.e(11)/i.e(13), play/ready API) — компаунди в контексті міста; 2) клон-кнопки (button-clone-content); 3) стекові секції over/under-previous; 4) blur-in reveal; 5) TT Jenevers serif-italic як типографічний акцент усередині гротеску
WebGL: ТАК — інтерактивна 3D-мапа compounds (єдине місце)
prefers-reduced-motion: 1 згадка в shared.js (є обробка)

## 5. КОПІРАЙТ/СЕНС (en)
hero H1: «Immerse yourself in the vibrant colours of life» (8 слів)
section-headlines (H2, дослівно): «An exquisite collection of gated residential compounds in Riyadh» · «Compounds» · «Azure is more than just a place to live, it's where you can truly feel at home» · «With various options, we offer thoughtfully designed spaces to cater to diverse needs and preferences» · «Discover a living experience defined by quality, care and a focus on you» · «Why is Azure the Premier Choice?» · «Our Services»; сервіси = епітет-пари: «Picture-Postcard Swimming Pools» · «Opulent and Stylish Salons» · «Luxurious and Sparkling Spa» · «Enthralling Shopping Environment»…
wizard-funnel (H2-питання): «How many rooms you need?» · «Which area in Riyadh are you interested in?» · «For how many months?» · «Your contacts»
тон: сенсорно-гедоністичний, щедрі прикметники (vibrant/exquisite/opulent/enthralling) — НЕ мінімалізм, а luxury-hospitality голос
Big Idea: оренда compound-життя як занурення в яскраві кольори життя (joy of compound living)
прийоми: наказовий спосіб (Immerse, Discover, Picture) · питання як кроки воронки · епітет-пара на кожен сервіс
цифри-в-копі: мінімум (телефон + 11 compounds списком)
CTA: «Book a tour» (хедер, головний) · «Inquire Now» · «Submit» · «About Azure» · телефон +966 9200 25557
ВИСНОВОК-сенс: продають ЛАЙФСТАЙЛ-СЕРВІС оренди (ease/energy/belonging) — гедонізм і турботу, не інвестицію; воронка = бронювання туру/заявка, не покупка

## 6. СТРУКТУРА
home: ~8 секцій — intro(ui-dark) → exquisite-collection → compounds(список+WebGL-мапа) → home-container(«more than just a place») → gallery → wizard(4-крокова воронка) → choice(«Why Premier Choice») → services → contact
сторінки: home + /compounds + 11 сторінок compounds (Palma I, Palma II, Qairawan, Narjis, Hittin, Wadi, Takhassusi, Al Reem, Lamara, Rabwah, Asala, Central) + /about + /contacts + /privacy-policy
nav: Menu(оверлей: Compounds · About Azure · Contacts) · Book a tour · телефон
visual search: ТАК у формі WebGL-мапи compounds + wizard-фільтр (кімнати→район→термін→контакти)

## 7. SIGNATURE
За 5 секунд: темна розкіш + azure-синій і пісок, гігантський AZURESans з ls -.04em і serif-italic вкрапленнями TT Jenevers, стекові секції що наїжджають одна на одну.
Найкрутіший момент: WebGL-мапа compounds у контексті Ріяда + wizard-воронка з питань замість каталогу.
Що вкрасти: РЕЄСТР іменованих parallax-патернів (data-parallax-pattern="imageMove") замість inline-keyframes — масштабується на 109 елементів; токен --scale-px (весь UI скейлиться однією змінною); serif-italic як font-style усередині родини (акцент без другої font-family в розмітці); data-reveal словник з 6 типів.
