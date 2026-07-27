# LOFTEC — vi-dataset анкета

## 0. META
site_slug: loftec
live_url: http://loftec.ru/ — МЕРТВИЙ (DNS не резолвиться, curl 000; CDX: 200 до 2025-01, 503 у 2024) · fallback: https://videinfra.com/work/loftec
liveness: dead (зонд = Wayback-сирці: повний HTML + global.css + landing.js + shared.js; capture ≈2017-18 — у копі «Ключи – в 2018 г.»)
рік: ~2017 запуск VI-версії (2017-01 ще стара WP-сторінка «Старт продаж», 2018-01 — вже VI-сайт)
тип: ЖК/апартаменти-лофти (Москва, ЦАО; девелопер Coldy, CMS Bitrix)
awards (з кейс-сторінки): CSS Design Awards Website of The Day · Behance UI/UX Design · Rating Runeta Bronze · Tagline Silver

## 1. ТИПОГРАФІКА
display_font: Graphik Web (GraphikLC — кирилична LC-версія Commercial Type; Light 300 + Regular 400, eot/woff/woff2) — ОДНА родина на все; кирилиця: так
body_font: та сама Graphik Web (300/400)
third_font: n/a
H1 (.h1/h1): 2.8rem → 4rem → 6rem → 7rem (max ≈70px, html[lang=en]); line-height 1.25–1.5em, font-weight 200 (!— легша за наявні файли, браузер мапить на Light), letter-spacing 0
H2 (.h2/.text--h2): 3rem → 4rem → 6rem, lh 1.25–1.33, fw 200; .text--h2-large 3.5→4.5→7rem fw 100
H3: 2.4rem → 4.8rem (.text--h3-large), lh 1.2–1.4
body: 1.3rem lh 2em (ru) / 1.4rem lh 1.857 (en); html{font-size:62.5%} → база 10px
caption/label (.text--extra-small): 1rem ls .15em; .text--small 1.2rem ls .09em
fluid: НІ — ступінчасті media queries (брейки 479/668/979/1199)
H1:body = 70:13 ≈ 5.4:1
uppercase: лише 3 правила (мінімум; ієрархія через надлегкі ваги 100/200, не капс)
числа: tabular n/a; великі цифри-факти («98.7 м²», «4 м», «5 минут») сетяться display-розміром

## 2. КОЛІР
палітра (частоти): #2f3338 ×26 (графітовий сланець — БАЗА) · #a37063 ×20 (глиняна теракота — 1-й акцент) · #d3d3d3 ×17 (світло-сірий — 2-й фон) · #777c82 ×16 (сіро-блакитний текст) · #fff ×20 · #282b2e ×5 (темніший фон) · #df9e70 ×3 (пісочний highlight) · #595c63 ×3
база/фони: класи .ui-base-background #2f3338 / .ui-secondary-background #d3d3d3 / .ui-dark-background #282b2e — секції перемикають тему
текст: #fff на графіті / #2f3338 на сірому; лінки в .ui-light → #a37063
1-й акцент: #a37063 (теракота = цегла лофту); 2-й: #df9e70
scrim: hsla(0,0%,100%,.4) hairlines
чисті #000/#fff: #000 ×1 (майже не юзається), #fff — так, для тексту
CSS vars: НЕМАЄ (2017, до custom properties)

## 3. ДИЗАЙН-СИСТЕМА
container: явного .container нема; контентні max-width 960/939/840px, MQ-пороги 479/668/979/1199
radius: 0 переважно; дрібні 2-3px (форми), 100px pills, 50% кола
hairline: 1px solid #595c63 / #a37063 / #b5b5b5 / hsla(0,0%,100%,.4)
кнопки: прямокутні, дрібні (height 22px, radius 3px у базі); CTA-лінки текстові з підкресленням-переходом
іконки: SVG stroke (мінімально)
spacing: rem-сітка від 10px бази; layout-height-12 класи (12-рядкова вертикальна сітка)

## 4. РУХ/СКРОЛ
движок: НАТИВНИЙ скрол + scrollTo ×28; IntersectionObserver; jQuery-архітектура (Bitrix), fancybox
ease-криві CSS: cubic-bezier(.25,.74,.22,.99) ×4 (фірмова VI) · cubic-bezier(.46,.01,.54,1) ×2
JS-easing: easeOutExpo ×2, easeInOutExpo ×2, easeInExpo ×2 (Expo-сім'я)
durations: .4s ×5 · .8s ×3 · .625s ×3 · 1.25s ×2; JS duration 750ms
reveal: плагін appear — data-appear-effects="fade | image | text" (3 іменовані ефекти), transition.generateInSequence («fade-out», «appear-image»)
parallax: $.fn.parallax плагін у shared.js (є, але в розмітці data-parallax атрибутів немає — мінімальне використання)
pin/sticky: position:sticky 0; fixed ×5 (хедер/оверлеї)
WOW-прийоми: 1) «Виберіть літеру» — інтро = інтерактивний вибір літер L-O-F-T-E-C, кожна літера відкриває свою секцію; 2) Canvas-2D інтро (js-intro: малювання на canvas getContext("2d"), офскрін-канвас для переходів); 3) Акронім-навігація — структура всього сайту зашита в назву бренду; 4) Тематична рекольоровка секцій ui-base/secondary/dark-background
WebGL: НІ (canvas 2D в інтро)
prefers-reduced-motion: 0

## 5. КОПІРАЙТ/СЕНС (ru)
hero H1: «LOFTEC» (1 слово) + інтро-приглашення «Выберите букву» · sub: «Concept Loft by Coldy»
section-headlines (H2, дослівно — АКРОНІМ LOFTEC): «Lifestyle / Стиль жизни» · «Opportunities / Возможности» · «Fusion / Синтез» · «Technologies / Технологии» · «Expanse / Пространство» · «Coldy / Колди» (+ «Новости»)
ключові рядки: «Стиль жизни современного человека» · «Лофт в центре Москвы» · «Потолки до 4 м» · «Технологии – инновационный лофт» · «Робот-консьерж в лобби» · «Пространство для избранных» · «Уникальные виды на старую Москву»
nav: Планировки и цены · Коммерческая недвижимость · +7 495 933 83 60 · Записаться на показ
CTA-дієслова: «Записаться на показ» (головний, повторюється в 3 секціях) · «Рассчитать ипотеку» · «Узнать больше про "Умный дом"» · «Отправить» · «Подробнее»
тон: технологічний, молодий, статусно-урбаністичний; «для избранных» але без пафосу старих грошей
цифри-в-копі: 98.7 м² · скидка 7,8 млн · потолки 4 м · 5 минут от метро · з 2004 года (Coldy)
Big Idea: назва бренду = карта сайту — LOFTEC як акронім шести цінностей (Lofts+Technology)
прийоми: акронім-гра; білінгва-заголовки (en-слово + ru-розшифровка); імператив CTA
ВИСНОВОК-сенс: продають ТЕХНОЛОГІЧНИЙ СТИЛЬ ЖИТТЯ для молодих амбітних (smart home, робот-консьєрж, лофт-естетика) — не метри, а ідентичність «я сучасний»

## 6. СТРУКТУРА
home: 8 секцій — intro(вибір літери) → lifestyle → opportunities → fusion → technologies → expanse → coldy → новости
сторінки: Планировки и цены (вибір апартаментів) · Коммерческая недвижимость · галерея (renders/interiors/improvement) · location · about (architecture, technical-solutions) · apartments/{id} · actions
visual search: ТАК — «Планировки и цены», сторінки окремих апартаментів /apartments/904/
nav: мінімальна (2 пункти + телефон + CTA) — фокус на скрол-сторітелінг home

## 7. SIGNATURE
За 5 секунд: графіт #2f3338 + теракота #a37063, надлегка Graphik 100/200 величезним кеглем, інтро «Выберите букву» з літерами LOFTEC.
Найкрутіший момент: акронім-навігація — 6 літер бренду = 6 секцій сайту, вибір літери як гра.
Що вкрасти: 1) структура «назва = карта смислів» (кожна літера бренду розгортається в цінність); 2) ієрархія вагою (fw 100/200 на 70px) замість капсу; 3) білінгва-заголовок (en-термін + локальна розшифровка) як дешевий «преміум».
