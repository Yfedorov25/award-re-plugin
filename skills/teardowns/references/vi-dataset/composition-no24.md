# COMPOSITION NO.24 — vi-dataset анкета

## 0. META
site_slug: composition-no24
live_url: https://k24moscow.ru/ (домен СКВОТОВАНО ~2024 — зараз чужий WP-блог про нерухомість) · fallback: https://videinfra.com/work/composition-no-24
liveness: dead (оригінал жив 2018→2023; зонд = Wayback 2023-10-03 + 2023-09-17, повні сирці HTML/CSS/JS)
рік: ~2018-12/2019 запуск (перший архівний 200 — 11.2018); Behance-кейс «K24 Residence» 2020; Awwwards SOTD
тип: ЖК (Москва, вул. Хавська 24; бренд на основі супрематизму/авангарду)
⚠️ K24 Residence і Composition No.24 — ОДИН І ТОЙ САМИЙ САЙТ (один домен, той самий бандл 2020↔2023, ідентичні data-атрибути). Див. k24.md.

## 1. ТИПОГРАФІКА
display_font: Karloff Negative Bold (Typotheque; bold.eot/woff, w=400-файл, юзається fw700) — на .h1/.h1-lg/.h2-lg/.text--heading/h1; кирилиця: так (сайт ru)
body_font: Euclid Flex 300/400/500 (light/regular/medium.otf) — body/button/input; kern увімкнено (font-feature-settings "kern" 1)
third_font: n/a
H1 (.h1/h1): 5.6rem → 8.4rem → 14.1rem (max, ≈141px), line-height .92, letter-spacing -.02em (на менших), fw 700, колір #000
H2: 4.1rem lh .976 fw 500 → 5.6rem lh .929; .h2-lg 4rem uppercase ls -.02em fw700 → 5.6rem
H3: 2.4rem lh 1.25 → 2.8rem lh 1.29; .h3-lg 2.6 → 3.7rem
body: 1.3rem lh 1.46 → 1.6rem lh 1.375; html{font-size:62.5%}
fluid: НІ — ступінчасті media queries (брейки 479/668/979/1279)
H1:body = 141:16 ≈ 8.8:1
uppercase: 18 правил (лейбли, .h2-lg)
числа: tabular n/a; font-feature "kern" глобально, 4 згадки feature-settings

## 2. КОЛІР
палітра (частоти): #fff ×65 · #000 ×57 · #f50000 ×41 (супрематичний червоний — 1-й акцент) · #a0937c ×7 (тепла кава, 2-й акцент) · #ecdebb ×6 (пісочний) · #d9534f ×3 (error) · #a90000 ×2
база/фони: білий + чорний, секції перемикаються data-theme
текст: #000 на світлому / #fff на темному
теми секцій: data-theme="dark|light|primary|tetriary"; класи .ui-dark ×118, .ui-primary ×55, .ui-tetriary ×22, .ui-light ×4 (4-темна система: світла/темна/червона/беж)
чисті #000/#fff: ТАК — свідомо, супрематичний контраст
CSS vars: немає кольорових токенів; зате char-split математика: --char-index/--word-index/--line-index, --char-center, --distance: calc((offset²)/center), --distance-sine

## 3. ДИЗАЙН-СИСТЕМА
container: явного .container max-width нема; головний MQ-поріг 979px (×127), широкий 1480px
radius: 0 переважно; кнопки-pills 100px (і 100px 0 0 100px напівпілюлі); 40/60px великі заокруглення
hairline: 1px #000, 1px rgba(0,0,0,.1)
кнопки: btn--primary/secondary/tetriary/text з :before-outline механікою, transition .6s; інверсні варіанти на ui-темах
spacing: rem-сітка від html 62.5%

## 4. РУХ/СКРОЛ
движок: НАТИВНИЙ скрол (без Locomotive/Lenis); scrollTo ×37 (data-scrollto ×9, data-scrollto-force ×7), IntersectionObserver ×8; barba.js ×5 — page-transitions
ease-криві: cubic-bezier(.25,.74,.22,.99) ×49 (фірмова VI) · cubic-bezier(.55,0,.1,1) ×27 · cubic-bezier(.25,.74,.22,1.1) ×9 (overshoot!) · cubic-bezier(.47,.04,.5,-.06) ×6 (анти-овершут, заходить нижче 0)
JS-easing: easeOutStrong ×23, easeInStrong ×14, easeInOutStrong ×14, easeIn/Out/InOutExpo
durations: 1.2s ×48 (БАЗОВА) · .6s ×14 · .3s ×14 · .9s ×8 · 2.4s · 7.2s (амбієнт); стаггер: calc(var(--line-total)*25ms + .96s) і *85ms
reveal: плагін appear ×47 + data-appear-effects ×13
parallax: n/a (без data-parallax; рух — appear + theme-перемикання)
pin/sticky: position:sticky 0; fixed ×9 (хедер, інтро, оверлеї)
WOW-прийоми: 1) «Супрематичний інтро-морфінг» — introSlider: вектор-композиція Малевича морфиться в будинок; 2) «Char-wave заголовки» — CSS-математика --distance-sine розкидає літери хвилею («Кв арти ры»); 3) «4-темна рекольоровка секцій» (data-theme + applyTheme); 4) «Visual search квартир» — плагіни apartmentsCount + range; 5) strokeOffset — SVG dash-розчерки
WebGL: НІ (вектор/DOM)
prefers-reduced-motion: 0

## 5. КОПІРАЙТ/СЕНС (ru)
hero H1: n/a — <h1> відсутній; інтро = анімований супрематичний логотип «Композиция №24»; hero-CTA-плашка: «ПОСЛЕДНЯЯ КВАРТИРА В КОМПОЗИЦИЯ №24»
section-headlines (H2, дослівно): «архитектура» · «Территория» · «Квартиры» · «Ди зай н» · «Расп оложе ние» · «Кв арти ры» · «Кач ество жизни» · «Зак азать звонок» (спліт-написання = char-анімація в сирці)
H3 = голі цифри-факти: «8», «9», «7», «20» (поверхи/хвилини/планування)
nav: Дизайн · Расположение · Выбрать квартиру · Галерея · Качество жизни · Как купить · Контакты · Новости и акции · Ход строительства · Документация · Команда проекта · EN
CTA-дієслова: «Заказать звонок» · «Выбрать квартиру» · «Узнать больше» · «Посмотреть»
тон: мінімалістичний маніфест; майже без прикметників, слова-секції з одного іменника
Big Idea: житло як твір супрематизму — мистецтво, в якому можна жити
прийоми: типографіка = головний меседж; цифри як H3
ВИСНОВОК-сенс: продають МИСТЕЦТВО і культурний статус (авангард як ідентичність покупця)

## 6. СТРУКТУРА
home: 5 секцій — top(інтро-морфінг) → location → apartments → quality → contacts
сторінки: квартири (вибір), галерея, як купити, новини, хід будівництва, документація, команда, контакти (nav = 11 пунктів)
visual search: ТАК — плагіни apartmentsCount/range, «Выбрать квартиру»

## 7. SIGNATURE
За 5 секунд: чорний+білий+#f50000, Karloff Negative, квадрати/кола Малевича, літери що розлітаються хвилею.
Найкрутіший момент: інтро — супрематична композиція морфиться в будинок (вектор, без WebGL).
Що вкрасти: CSS char-split математика (--distance-sine хвиля без JS-анімації кожної літери) + овершут-крива (.25,.74,.22,1.1) для «живих» появ + 4-темна data-theme рекольоровка.
