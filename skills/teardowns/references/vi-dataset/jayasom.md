# JAYASOM — vi-dataset анкета

## 0. META
site_slug: jayasom
live_url: https://www.jayasom.com/ — домен ЖИВИЙ, але VI-сайт ЗАМІНЕНО (зараз HubSpot CMS «Luxury Destination Wellness Retreat»: AOS, OwlCarousel, FontAwesome — нуль VI)
liveness: dead (оригінал VI; зонд = Wayback 2022-01-24, повні живі сирці; бандли v=1594195728 ≈ лип.2020)
рік: 2020 запуск (бандл-версія) → замінений ≈2025-2026
тип: НЕ нерухомість — ultra-luxury WELLNESS-компанія (керування destination-wellness-резортами; аудиторія = партнери, резорти, ІНВЕСТОРИ, не гості)
нагороди: CSSDA WOTD · Communication Arts Webpicks · Rating Runeta Bronze

## 1. ТИПОГРАФІКА
display_font: **Mont** (mont-light.woff2 300 + mont-regular.woff2 400) — і display, і body ОДНА родина; кирилиця: n/a (сайт en, unicode-range нема)
body_font: Mont 400 · third_font: нема · ваги: 300/400 (НУЛЬ bold — light-люкс)
H1: 4rem → 6.8rem (68px desktop), lh 1em, ls **-.04em**
H2: 2.2rem (22px), lh 1.09-1.18em, ls +.02em · H3/.text h2: 2rem lh 1.1
body: 1.4rem→1.6rem (14→16px), lh 1.25-1.29, ls +.02em; великі цифри-акценти 10rem/12rem (приховані елементи сцен)
fluid: НІ — ступінчасті rem-розміри (html 62.5%-схема)
H1:body = 68:16 ≈ 4.3:1 (камерно, НЕ гігантизм — еталон стриманості)
uppercase: 1 правило (майже нема); лейбли = letter-spacing .16em
числа: tabular нема

## 2. КОЛІР
палітра (частоти): **#fff ×30 · #0006ff ×30 (!) · #000 ×29** — ТРИКОЛІРНА система з рівними частотами; #fc3838 ×5 (error) · сірі #999/#ccc/#dfdfdf · #4d51ff (світлий ультрамарин-ховер) · #262626
база/фони: білий + чистий ультрамарин #0006ff як ПОВНОЦІННИЙ фон сцен (не акцент-крапка)
текст: #000 на білому / #fff на синьому
1-й акцент: ультрамарин #0006ff (фірмовий) · 2-й: нема (свідома трихромія)
теми секцій: сцени перемикають білий↔синій
чисті #000/#fff: ТАК

## 3. ДИЗАЙН-СИСТЕМА
container: сцени-полотна на весь екран (scene-based, без контент-контейнера)
radius: 0 база; пілюлі 30/80/100px (кнопки), 6px дрібне
кнопки: пілюлі; CTA «Explore»
hairline/іконки: SVG-лінії з data-dashoffset-from/-to (розчерки)
spacing: rem-сітка

## 4. РУХ/СКРОЛ
движок: scroll-jacked СЦЕНИ (anchor-навігація /#1-1…/#6, data-nav-next-duration; без Locomotive/Lenis); barba.js ×8 переходи сторінок
ease-криві (частоти): **cubic-bezier(.26,0,.22,1) ×32 (фірмова сайту — НЕ глобальна VI-крива!)** · cubic-bezier(.645,.045,.355,1) ×11 (easeInOutCubic); JS: easeOut/easeOutExpo/easeInOutExpo
durations: .45s ×14 · .8s ×12 · .4s ×10 · **3.5s ×15 (амбієнт — повільний wellness-темп)** · .72s/.75s/1s
reveal: сцени + SVG dashoffset-розчерки (data-dashoffset ×10)
parallax: нема класичного — все в WebGL-сценах
pin/sticky: 0 у CSS (сцени самі тримають вьюпорт)
WOW: 1) **«Природа→силует»** — фото природи морфляться в людські силуети від взаємодії юзера (комунікаційна концепція в WebGL); 2) **«Струни»** — лінії-струни тягнуться крізь усі сцени, реагують на курсор хвилею; 3) у секції Modes струни розпадаються на прямі лінії = ІНТЕРАКТИВНЕ МЕНЮ 6 послуг; 4) сцен-переходи «state-of-the-art» (кейс підкреслює CPU-оптимізацію)
WebGL: ТАК, МАСИВНО — **PixiJS (×199) + сирі шейдери** (90 varying, 25 gl_FragColor, uniform mat/vec/sampler) — вся подача = WebGL-сцени
prefers-reduced-motion: 0

## 5. КОПІРАЙТ/СЕНС (en)
hero H1: «Jayasom» + H2 «Wellness Wisdom» + CTA «Explore» (хіро = 3 слова сумарно)
hero-параграф: «Find us on the road less travelled, where reflection and contemplation are at ease and where time seems to stands still, where your whole person — mind, body and spirit — is nourished and restored.»
section-headlines (6 сцен, дослівно): «Wellness Wisdom» · «Mind, Body, Spirit» · «Benefits» · «Modes» · «Places» · «Opportunities»
Modes (H3): Holistic Therapies · Physiotherapy · Fitness · Nutrition · Beauty · Spa & Body
Places (H3, статуси): «Open Now — Jeddah, KSA» · «Opening Soon — Ibiza, Spain» · «Opening Later — Hyderabad, India» · «Japan»
nav: About us · For owners · Get in touch (+якорі 6 сцен)
тон: медитативно-поетичний («road less travelled», «time seems to stand still»), 1-2-слівні заголовки
Big Idea: природна краса стає внутрішньою частиною людини — wellness як мудрість, не послуга
прийоми: метафора-трансформація (природа→силует у WebGL = меседж); тріада «Mind, Body, Spirit»; статуси-маячки Open Now/Soon/Later як roadmap для інвестора
цифри-в-копі: майже нема (B2B-емоція, не ROI-таблиці)
CTA: «Explore» · «Get in touch» · «New property management request» · «For owners»
ВИСНОВОК-сенс: продають ІНВЕСТИЦІЮ-ПАРТНЕРСТВО через атмосферу (B2B-сайт, що говорить мовою медитації — інвестора занурюють у продукт замість пітч-деку)

## 6. СТРУКТУРА
home: 6 WebGL-сцен — Wellness Wisdom(hero) → Mind, Body, Spirit → Benefits → Modes(струни-меню 6 послуг) → Places(4 локації) → Opportunities(CTA)
сторінки: home + /about-us + /for-owners + /get-in-touch + /privacy-policy (5)
visual search: нема (не каталог); Places = локації зі статусами
особливість: окремі desktop/mobile бандли (global-desktop.css… — UA-розгалуження на сервері)

## 7. SIGNATURE
За 5 секунд: чистий ультрамарин #0006ff + Mont Light + струни, що хвилюються за курсором, фото природи морфяться в силуети.
Найкрутіший момент: струни розпадаються на прямі лінії і стають інтерактивним меню Modes (декор → навігація).
Що вкрасти: трихромія з РІВНИМИ частотами (#fff=#0006ff=#000 — акцент як повноцінний фон); декоративний елемент, що перетворюється на меню; темп 3.5s-амбієнт для «дорогої» тиші; статуси Open Now/Soon/Later як наратив експансії.
