# _REGISTRY_TID — структурований реєстр прийомів (T-ID), v1
> Міграція _TECHNIQUE_REGISTRY (проза v0.2) + 6 відео-тірдаунів + статичні архітектури → таблиця
> в системі координат шарів L1-L5 з [_GRAMMAR](_GRAMMAR.md). Робочий довідник для section-builder:
> motion-score обирає 2-4 кандидати на секцію → варіанти-прототипи → білд. 2026-06-13.
>
> **Колонки:** Вартість впровадження: **S** = до пів дня · **M** = 1-3 дні · **L** = >3 днів / підпроєкт.
> **no-WebGL** заповнено лише там, де оригінал WebGL/3rd-party (🔴) — будуємо ТІЛЬКИ переклад.
>
> **Джерела (скорочення):**
> ERA(v)=D_ERA_video · ERA(a)=D_ERA_architecture · EVR=D_Ever_architecture · AIR(v)=D_AIR_video ·
> AIR(a)=D_AIR_architecture · SPR(v)=D_SPRINGS_video · SPR(a)=D_Springs_architecture ·
> SP(v)=D_SILVERPINEWOOD_video · SP(a)=D_SilverPinewood_architecture · SAI=D_SAISEI_video ·
> 11T=D_11TANJUNG_video · REG=registry-v0.2 (_TECHNIQUE_REGISTRY) · GRM=_GRAMMAR (канон власних білдів smarts/quadro).

## 0. ФУНДАМЕНТ (системні константи — фіксуються в motion-score один раз, НЕ обираються по-секційно)
- **Рушій:** Barba SPA + smooth-scroll lerp ~.1 + rAF `precisescroll` (усі плагіни слухають її, не raw scroll); 0 GSAP у оригіналів — наш переклад: GSAP+Lenis. [REG §0/§6]
- **Ease — ПЕР-САЙТ:** ERA/AIR/Ever/Springs `cubic-bezier(.25,.74,.22,.99)` («air»); SP `=easeOutQuad (.25,.46,.45,.94)`; спільні вторинні: slow `.55,0,.1,1`, anticipation `.47,.04,.5,-.06` (у всіх 5). Motion-score фіксує ОДИН. [REG §1]
- **Durations-каркас:** .2s fast · .4s micro · .8s luxury hover/reveal · 1.6s block · 2.4s slower · 2.8s title; stagger 60ms/line + 180ms/group; luxury hero-reveal delay до 1000ms (SPR(a)). [REG §1]
- **CSS-движок reveal:** `.animation--{name}` + `--inactive/--active` тоггл (Ever, найчистіший) = наш data-reveal/clip патерн. [REG §3]
- **`appear` decode-gate:** IntersectionObserver + `img.decode()` + reveal-on-inview, preload rootMargin 600px; gate-ить інші плагіни до декоду (ERA 1141, Ever 1128). = наш DecodeAhead. [REG §4]
- **addClassCounted** (reference-counted класи — overlapping observers не конфліктують) + mobileScrollable. [REG §4/§7]

---

## L1 BASE-MEDIA (T-1xx) — чим зайнятий кадр

| T-ID | Назва | Суть | Джерело | $ | Комбінується з | no-WebGL |
|---|---|---|---|---|---|---|
| T-101 | full-bleed still | Фото/рендер на весь кадр як база акту (мета-патерн: акт + медіа + один малий факт-абзац) | всі 5 VI + SAI + 11T (6/6 відео) | S | T-201, T-202, T-305, T-501 | — |
| T-102 | frame-sequence scroll-scrub | Canvas-секвенція кадрів, скраб по скролу (ERA 149-кадрова ANIMA) | ERA(a) §2.3 | M | T-318, T-202, T-217 | ✅ canvas-2D scrub (канон quadro hero) |
| T-103 | відео-фон autoplay-in-view | `videoInview`: відео грає лише у вʼюпорті (ERA video band; SP гольфіст під spread-row) | ERA(a) · EVR · SP(v) | S | T-201, T-310 | — |
| T-104 | inline-SVG план/карта 2-шарова | artwork.svg + невидимий anchor-шар (`data-anchor`/`data-nr` paired path) + JSON `data-plan-plans`, статус = CSS-modifier у runtime | всі 5 VI (EVR §4 · AIR(a) §4 · SP(a) §4 · SPR(a) §4 · ERA(a) §4) | M | T-406, T-407, T-409, T-427 | — |
| T-105 | повноекранний дек з лічильником | Слайди-проєкти/типи з лічильником «N/M» + вертикальні line-ticks прогресу + PREV/NEXT | SAI (проєкти-дек) | M | T-305, T-523, T-425 | — |
| T-106 | rounded-canvas полотно-картка | Секція = «аркуш» зі скругленими кутами, що висувається; альтернатива theme-flip для членування | 11T | S | T-312, T-527 | — |
| T-107 | facilities-акордеон смуг | Ряд вертикальних фото-смуг різної ширини; ховер/скрол розсуває активну (SUNSET DECK…) | 11T | M | T-426, T-305 | — |
| T-108 | інтро-мозаїка дистанцій | Плитки РІЗНИХ планів (макро+аеро+портрет) складаються в діагональний колаж на глибинах | SPR(v) | M | T-525, T-113 | — |
| T-109 | фото-вікно слайдер + синхронний текст | Мале фото-вікно свапає кадри стрілками, текст поруч міняється синхронно; свап = push+settle | SPR(v) (spa-слайдер) | S | T-506, T-110 | — |
| T-110 | фото-карусель (+cursor/+sync/+pinned) | Owl/Keen-карусель: drag-курсор (ERA interiors), carouselSync 2 звʼязані (ERA /architecture), pinned з лічильником (Ever /about) | ERA(a) · EVR | S | T-306, T-401, T-304, T-510 | — |
| T-111 | галерея-тур з «+»-хотспотами | Повноекранні рендери зон з хотспотами — клік веде глибше (лобі→паркінг) | SPR(v) | M | T-112, T-406 | заміна 360°-туру (T-120) без WebGL |
| T-112 | категорійний lightbox-галерея | Галерея з фільтрами категорій + лайтбокс (Ever 5 категорій; ERA full-bleed фільтр-карусель) | EVR · ERA(a) · SPR(a) | M | T-409, T-415 | — |
| T-113 | паралакс-колаж глибин | 4-6 розкиданих фото на різних глибинах їдуть з різною швидкістю (НЕ сітка) = закон C2 | SAI §TRADITION · SP(v) · SPR(v) | M | T-202, T-307, T-212 | — |
| T-114 | horizontal-takeover стрічка | Pin секції, вертикальний скрол → translateX контенту (Ever progress ~1333-img timeline; Springs stickySlider) | EVR · REG §6 | M | T-102, T-510 | — |
| T-115 | фасад-фото з ховер-плитами поверхів | Фото вежі, ховер поверху → напівпрозора плита + закріплена картка «Floor N · X offices · м²» | AIR(v) · SPR(v) (select-a-floor) | M | T-407, T-406, T-423, T-530 | — |
| T-116 | градієнт-канва (екс-WebGL scene) | Анімований бренд-градієнт як емоційна пауза (Springs webglTree/Nature/Wellness = ОДИН shader-plane) | SPR(a) §2 · REG §5 | M | T-209, T-305 | 🔴 → CSS animated-gradient / canvas-2D noise, або статичний градієнт |
| T-117 | бренд-скульптура 3D (екс-GLTF) | Один 3D-обʼєкт хірургічно (SP Zeus у Lobby): long-lens, mouse-light, multi-rate parallax, film-grain | SP(a) §2.13 · REG §5 | L | T-202, T-204 | 🔴 → pre-rendered orbit-кадри (canvas-2D) / crossfade статичних ракурсів |
| T-118 | 3D-map маса забудови | WebGL-масштабна модель кварталу з fly-to і пікером (ERA /3d-map) | ERA(a) · REG §5 | L | T-407, A-03 | 🔴 → pre-rendered orbit (вердикт quadro-phase5) АБО SVG-карта |
| T-119 | карусель з shader-дисторсією | Фото-карусель з UV-distortion на скролі (AIR /about, єдиний WebGL сайту; має DOM-fallback) | AIR(a) §3 · REG §5 | M | T-110 | 🔴 → CSS clip + scale crossfade (VI самі мають DOM-fallback) |
| T-120 | 360°-тур (krpano/tour.js) | Панорамний тур у модалках/окремій сторінці | EVR (/3d-tour) · ERA(a) · SPR(a) | L | T-111 | 🔴 3rd-party → галерея-тур T-111 як no-WebGL заміна |
| T-121 | real-aerial аерофото | Реальне аерофото як база секції оточення | AIR(v) (SURROUNDINGS) | S | T-210, T-427 | — |
| T-122 | карта-мінімал рукописна | Білий лінійний план доріг на бренд-канві (11T) / кремова акварель з рікою (Springs) | 11T · SPR(v) | S | T-305, T-406 | — |

## L2 MEDIA-OVERLAY (T-2xx) — що живе поверх медіа

| T-ID | Назва | Суть | Джерело | $ | Комбінується з | no-WebGL |
|---|---|---|---|---|---|---|
| T-201 | scrim-градієнт | Затемнювальний градієнт поверх медіа для читабельності тексту | SAI (hero-стек) · GRM | S | T-101, T-103, T-211 | — |
| T-202 | inline scroll-keyframe parallax | `data-parallax-{FROM}-{TO}='{json}'` — інтерполяція transform/opacity між % scroll-progress; значення з design-токенів | всі 5 VI (Ever 139×) · REG §2 | M | T-101, T-203, T-204 | ✅ GSAP fromTo + scrub по тих самих % |
| T-203 | named-parallax пресети | 44-69 іменованих патернів/сайт (`designMoveLeftImage`, `videoZoom`, `mapPath1/2/3`…) поверх інлайн-механіки | всі 5 VI · REG §2 | M | T-202, T-214 | — |
| T-204 | deco-шар depth-offset | `data-deco-transform` + `data-deco-multiplier` — декор-елементи зсуваються від mouse/scroll з різним скаляром | EVR (130×) · ERA (48×) · REG §2 | S | T-202, T-401 | — |
| T-205 | parallax-image-zoom | «Фото дихає»: повільний зум зображення на скролі (SP 114×, підпис-ефект сайту) | SP(a) §2 | S | T-101, T-501 | — |
| T-206 | clip-reveal сімʼя медіа | image-clip-in/out-left/right (inset wipe), ellipse-grow, polygon intro-clip, fade-zoom scale 1.1 | EVR (CSS-движок) · REG §3/§6 | S | T-410, T-301 | — |
| T-207 | бренд-3D-обʼєкт наскрізний | Абстрактна скульптура як нитка ідентичності крізь сайт (AIR спіраль/сфера · SP хромові камені · ERA граніт) | AIR(v) · SP(v) · ERA(v) | L | T-311, T-305, T-508 | 🔴 → pre-rendered лупи/відео обертання |
| T-208 | матеріал-як-3D-обʼєкт | Зразок матеріалу обертається БІЛЯ фото застосування (граніт-куб + фасадна панель); макро→застосування = пара кадрів | ERA(v) | M | T-316, T-101 | 🔴 → turn-loop відео/секвенція |
| T-209 | silk-wave бренд-стрічка | Плавна 3D-хвиля тканини на градієнтній канві — пауза-передих між медіа-актами | SPR(v) | M | T-116, T-305 | 🔴 → відео-луп (рендер) |
| T-210 | color-zone overlays на аеро | Напівпрозорі кольорові плями-зони (корти/парки) поверх реального аерофото + картки «PARK · 10 MIN» | AIR(v) | S | T-121, T-422 | — |
| T-211 | wordmark-оверлей поверх hero | Гігантський логотип/назва типографікою як графічний шар ПОВЕРХ hero-медіа | 11T · SAI (hero) | S | T-201, T-421, T-527 | — |
| T-212 | blur→sharp reveal | Фото проявляється з блюру при вході глави/кадру | 11T | S | T-312, T-113 | — |
| T-213 | лінійна графіка-glow (екс-visualizationLines) | Декоративні лінії що «малюються»/світяться поверх секції (ERA ×5, Three.js line-mesh+Fresnel) | ERA(a) · REG §5 | M | T-405, T-301 | 🔴 → SVG self-draw (stroke-dashoffset) = 70% враження |
| T-214 | зустрічний parallax-pair | Ліве/праве зображення їдуть назустріч одне одному скролом (Springs design, 58 блоків) | SPR(a) §2.9/§3 | S | T-202, T-203 | — |
| T-215 | sticky-card-over-parallax | Картка-текст замерзає, паралакс-фон пливе під нею (AIR «About the project») | AIR(a) §2.5 | M | T-202, T-510 | — |
| T-216 | ghost-цифра розділу | Велика напівпрозора цифра/номер секції за контентом | GRM (smarts) | S | T-502, T-305 | — |
| T-217 | day→night dissolve | Перехід стану доби в одному кадрі (скраб/штора) | GRM (quadro hero, smarts §iv) | M | T-102, A-06 | — |

## L3 TEXT-CHOREO (T-3xx) — як заходить текст

| T-ID | Назва | Суть | Джерело | $ | Комбінується з | no-WebGL |
|---|---|---|---|---|---|---|
| T-301 | split-line reveal | splitLines/splitChars → `.ln>span`, per-word line-stagger 60ms (title 2.8s) | всі 5 VI · REG §4 | S | T-302, T-101 | — |
| T-302 | reveal-група зі stagger | Staggered group: 180ms group + 30ms base, group/element distance | всі 5 VI · REG §4 | S | T-301 | — |
| T-303 | titleFill scroll-заливка | Прогресивна заливка тексту кольором по скролу | EVR · REG §4 | S | T-301 | — |
| T-304 | counter count-up | Числа докручуються на reveal (numbers-in); лічильники табів/каруселей | REG §5 · EVR (js-tabs-counter) | S | T-427, T-422, T-105 | — |
| T-305 | акт-заголовок | Одно-кількаслівний акт-розділювач; тон пер-сайт: іменник-стан (Springs Wellness) · іменник-місце (SP TERRITORY) · поетичний імператив (ERA GO TO THE LIGHT) · сентенція (SAI) · фраза-глава (11T) | 6/6 відео-тірдаунів (мета-патерн _GRAMMAR) | S | T-101, T-506, T-207, T-315 | — |
| T-306 | ghost-CAPS за каруселлю | Заголовок як фоновий шар, фото-карусель їде ПОВЕРХ нього + кругла бренд-стрілка | ERA(v) (AMENITIES) | S | T-110, T-401 | — |
| T-307 | scatter→assemble літер | Літери розкидані по кадру і збираються в рядки скролом, серед них плавають фото-плитки | SAI §INNOVATION, /sustainability | M | T-113, T-301 | — |
| T-308 | text-photo interleave | Фото-плитки вбудовані МІЖ словами гігантських display-рядків, рядки доїжджають скролом | SAI §SERVICE | M | T-301, T-113 | — |
| T-309 | тришаровий лейбл | Лейбл з 3 регістрів (ієрогліф + ромадзі + переклад → у RE: цифра + латиниця + укр) | SAI §TRADITION | S | T-305 | — |
| T-310 | spread-row заголовок | Слова розведені по всій ширині рядка, зʼїжджаються/розʼїжджаються скролом — системний act-розділювач | AIR(v) (8+ ужитків) · SP(v) | S | T-103, T-305, T-501 | — |
| T-311 | kinetic nav-letters | Літери лого розкидані по КРАЯХ вʼюпорта, збираються в слово скролом (hero + дзеркало у футері) | AIR(v) | M | T-207, T-202 | — |
| T-312 | фразова естафета глав | Слова однієї фрази розкидані по повноекранному кадру на глибинах; глава = новий кадр + фраза | 11T (Live with Style) | M | T-212, T-313 | — |
| T-313 | кільця-тріо radial-fill | Контурні кола /01 /02 /03 заливаються товстим кільцем по черзі скролом = зміст глав | 11T | M | T-405, T-312 | — |
| T-314 | список-іменників величезним | Амніті голими іменниками гігантським кеглем; ховер пункту дає фото-превʼю | SP(v) (amenities) | M | T-406, T-426 | — |
| T-315 | бренд-рамка-рефрен | Фраза-рефрен бренду повторюється hero→footer («THE PLACE WHERE LIFE BECOMES ART») | ERA(v) · SAI | S | T-305, A-16 | — |
| T-316 | CAPS-факт-абзац | Фактологічний CAPS-абзац 2-3 речення (факт + вигода + цифра близькості) з line-reveal | SP(v) | S | T-301, T-208 | — |
| T-317 | нумерована слайд-історія | Слайди 1·2·3·4: кадр + одна CAPS-теза; стрілки/скрол гортають | SP(v) (/architecture) · SAI (/sustainability) | M | T-110, T-316 | — |
| T-318 | титри-секвенція hero | Hero-копі заходить почергово як кіно-титри поверх scrub-медіа | GRM (smarts hero) | M | T-102, T-201 | — |
| T-319 | text-shelf | Полиця коротких тез: рядки стають один під одним з reveal (службові секції) | GRM (smarts) | S | T-301 | — |

## L4 MICRO (T-4xx) — дрібна жизнь

| T-ID | Назва | Суть | Джерело | $ | Комбінується з | no-WebGL |
|---|---|---|---|---|---|---|
| T-401 | custom cursor spring | Курсор-послідовник (lerp .25/.9 на clickable) з режимами zoom-in/left/right/clickable/button-morph/hidden-spots | всі 5 VI (Ever 77, ERA 15) · REG §7 | M | T-110, T-204, T-406 | — |
| T-402 | курсор-лінза | Кругла бренд-пляма-акцент їде за мишею по фото (підказка глибини/уваги) | SP(v) (/architecture) | M | T-101, T-317 | — |
| T-403 | button clone-content | Кнопка клонує лейбл — hover text-swap/slide | REG §7 (всі 5, бандл-звіт) | S | T-404 | — |
| T-404 | btn outline self-draw | 2×SVG-rect обводка кнопки малюється на ховері (svgLength) + pseudo-fill slide | REG §7 (всі 5, бандл-звіт) | S | T-405, T-403 | — |
| T-405 | svgLength self-draw лінії | getTotalLength → `--path-length` → stroke-dashoffset draw-on (лінії, дільники, підкреслення) | ERA (266×) · SP (72×) · REG §5 | S | T-404, T-213, T-427 | — |
| T-406 | popover/tooltip канон | Popper/Floating-UI до невидимого anchor: hover-strict/click, triangle-adjust, desktop+mobile шаблони | EVR (575+48) · ERA (222) · REG §7 | S | T-407, T-104, T-314 | — |
| T-407 | plan-marker + статус | Маркер юніта: № · м² · ціна попавер; статус-кольори available/hover/reserved/sold/filtered-out; AIR-розширення: попавер З МІНІ-ПЛАНОМ | всі plan-сайти (EVR §4 · AIR(v) · ERA(a) · SPR(a)) | M | T-104, T-406, T-408, T-409 | — |
| T-408 | favourites-система | Серце → лічильник-бейдж у хедері → shortlist-панель → PDF-експорт/email; cross-page localStorage | всі 5 VI · REG §7 | L | T-407, T-411, A-15 | — |
| T-409 | фільтри: chips + range + ajax | Власний range-slider (money-formatter), chips, ajax live-count, pushState без reload; фільтр-state драйвить і list і plan | EVR §4 · AIR(a) · ERA(a) · SPR(a) | M | T-104, T-419, A-15 | — |
| T-410 | tabs/tabsswipe | Свайпові таби: animate-height, image-clip-in контент, counter, openConnectedTab | REG §7 · EVR (tab-synced swap) | S | T-206, T-304, T-110 | — |
| T-411 | форми-канон | floating-label + inputMask + intl-tel + ajaxForm + recaptcha + прихований `currentPageLink` (з якої сторінки/юніта лід) | REG §7 · SPR(a) §6 · EVR | M | T-403, T-405, A-07 | — |
| T-412 | before/after comparison | Сплiт фото слідує курсору (spring .5), touch → drag; `js-scroll-controller-ignore` щоб drag не скролив | EVR §2.6 · REG §5 | M | T-101 | — |
| T-413 | mouse photo-slider | Hover translate стрічки фото по mouse-X (spring .05) + draggable fallback | SPR(a) (a-mouse-slider) · REG §5 | M | T-401 | — |
| T-414 | intro split-hover | Курсор-X свопить hero-фон --1↔--2 (ліва/права половина) | EVR · REG §7 | M | T-201 | — |
| T-415 | imageZoom lightbox | Click/pinch зум зображення в лайтбоксі | ERA · REG §7 | S | T-112 | — |
| T-416 | mortgage-калькулятор | Range-слайдери price/payment/years → monthlyPay; програми ставок | ERA · EVR (18 data-rate) · AIR(a) | M | T-409, T-417 | — |
| T-417 | accordion | Крок-акордеон (how-to-buy) / контент-акордеон | AIR(a) §3 · REG §7 | S | T-416 | — |
| T-418 | scroll-індикатор | «SCROLL TO EXPLORE» + стан is-finished | 11T · REG §7 | S | T-201, A-01 | — |
| T-419 | stickyBottom бар | Прилипаючий нижній CTA-бар / sticky фільтр-панель карти | SP(a) (plan-filters) · REG §7 | S | T-409 | — |
| T-420 | cookieConsent | Бар згоди cookie | REG §7 (неверифіковано конкретний сайт) | S | — | — |
| T-421 | sound-тумблер default-OFF | Амбіент-звук як окремий шар досвіду, за замовчуванням вимкнений | 11T | S | T-211, A-01 | — |
| T-422 | гігантське число-факт | «400 STORES», «3 MIN WALK» величезним кеглем у lifestyle-слайді з людським фото | AIR(v) | S | T-101, T-210, T-304 | — |
| T-423 | ховер-підписи амбіент-зон | Зони будівлі на фото = ховер-обʼєкти з підписами (Wellness center / Nature Park) | SPR(v) | S | T-115 | — |
| T-424 | плаваюче запрошення пікера | Картка «SELECT BY CRITERIA / VISUAL SELECTION» спливає при скролі контент-сторінок — конверсійний місток | ERA(v) | S | A-03 | — |
| T-425 | пілюлі-якорі / бейджі | Pill-елементи як якорі секцій, CTA, лейбли | GRM (smarts) · SAI (ghost-pill CTA) | S | T-418, T-105 | — |
| T-426 | cardHover груповані стани | Груповані hover-стани карток класами (cardsHover/principlesCards) | REG §7 (неверифіковано конкретний сайт) | S | T-107, T-430 | — |
| T-427 | маршрут-кінетика часу | Клік POI → маршрут МАЛЮЄТЬСЯ лінією + хв-число на картці РОСТЕ синхронно; активний POI підсвічується | AIR(v) (живе підтвердження F-8; = smarts §loc) | M | T-104, T-304, T-405 | — |
| T-428 | FLIP first/last | getBoundingClientRect first/last → animate delta; естафета елемента між станами дрілу | SP (86 hits, движок contentAnimation) · REG §6 | M | T-104, A-03 | ✅ GSAP Flip |
| T-429 | scroll-opens-modal | Модалка відчиняється на певному скролі (modal-open-on-scroll) | ERA · REG §6 | S | T-411 | — |
| T-430 | ховер-розкриття тексту картки | Темна картка переваги розкриває повний текст на ховері | AIR(v) (/investment) | S | T-426, A-12 | — |

## L5 SEAM (T-5xx) — шви всередині сторінки

| T-ID | Назва | Суть | Джерело | $ | Комбінується з | no-WebGL |
|---|---|---|---|---|---|---|
| T-501 | theme-flip | ui-dark↔ui-light зміна поверхні per-section (themed-class IntersectionObserver swap); розбити ≥3 однотемні поспіль | 4/5 VI (ERA(a) · AIR(a) · EVR · SP(a)) | S | T-205, T-101, T-310 | — |
| T-502 | light-шов з номером | Світла seam-смуга з номером розділу — передих у темному прогоні | GRM (smarts §Розділ01) | S | T-216, T-504 | — |
| T-503 | sticky-under stacking | Pure-CSS: `margin-bottom:calc(dist*-1)` + `:after` спейсер + clip-path polygon — наступна секція наїжджає ПІД попередню | SP(a) (sticky--under-next) · REG §6 | M | T-501, T-510 | — |
| T-504 | нитка крізь сторінку | 2px лінія росте крізь секції — наскрізна естафета manifesto→cta | GRM (smarts) | M | T-502, T-405 | — |
| T-505 | act-слово шов | Слово з clip-маски 0.8-1.2s як межа актів; ≤1-2 на сайт (закон C9) | EVR (_GRAMMAR §3) | S | T-305, T-206 | — |
| T-506 | push-over доводчик | Нове медіа врізається смугою поверх поточного і СІДАЄ з overshoot-settle (без вільного дрейфу) — основний перехід актів Springs | SPR(v) | M | T-305, T-109, T-101 | — |
| T-507 | frame→fullbleed expand | Фото у рамці розширюється до повного кадру скролом — hero-«вдих» | ERA(v) · SP(v) (hero-фото вʼїжджає і розширюється) | S | T-101, T-202, A-01 | — |
| T-508 | спільний елемент перетікає | Обʼєкт/колір/лінія продовжується в сусідній секції — колаж-відчуття | EVR (_GRAMMAR §3) | M | T-207, T-501 | — |
| T-509 | gravity-well snap | `data-scroll-gravity-well` магнітний snap-to-section (lerp) + `data-scroll-snap-point` | ERA · AIR · SPR · SP(a) · REG §6 | M | T-510, T-202 | ⚠ council: НЕ scroll-trap для RE — обережно |
| T-510 | pin-then-release ланцюг | sectionToSticky → sectionFromSticky(HalfUnderNext): секція замерзає і віддає скрол наступній | AIR(a) · REG §6 | M | T-215, T-110, T-114 | — |

### Підклас: PAGE-TRANSITION (міжсторінкові шви + прелоадери)

| T-ID | Назва | Суть | Джерело | $ | Комбінується з | no-WebGL |
|---|---|---|---|---|---|---|
| T-520 | Barba SPA-переходи | data-barba wrapper/container, namespace=page, hooks, prefetch XHR, stylesheet-swap | всі 5 VI · REG §6 | M | T-521…T-530 | ✅ наш стек: Next router / View Transitions |
| T-521 | page-transition ритуал бренду | Прелоадер = перехід = повернення: ОДИН брендовий ритуал (SAI: ієрогліф-у-колі + лінія-куртина + slice-розкриття з вертикального бруса) | SAI (головна знахідка) | L | T-520, T-523 | — |
| T-522 | modal-in перехід сторінки | Нова сторінка вʼїжджає модалкою (`data-ajax-page-transition="modal-in"`) | EVR · REG §6 | M | T-520 | — |
| T-523 | next-handoff | Внизу сторінки сутності — превʼю наступної (фото+назва): естафета проєкт→проєкт / юніт→юніт без повернення в список | SAI | S | T-521, A-09 | — |
| T-524 | прелоадер split-panel | Top/bottom панелі розʼїжджаються + text-in → logo-parallax | AIR · REG §6 | S | T-520, T-311 | — |
| T-525 | прелоадер liquid-fill morph | Logo заливається clip-path і morph-ить у хедер (8s) | SPR (preloaderLanding) · REG §6 | M | T-108, T-520 | — |
| T-526 | прелоадер palette-cycle | Logo циклить палітру, themed під НАСТУПНУ сторінку + staggered letter-fade | EVR · REG §6 | S | T-501, T-520 | — |
| T-527 | прелоадер rounded-canvas + % | Канва зі скругленими кутами + %-лічильник → гігантський лого осідає в hero | 11T | S | T-106, T-211, T-520 | — |
| T-528 | прелоадер фонтан-лінії + SKIP | Лінії ростуть (+half-ring shader) + кнопка SKIP | ERA(v) · REG §5 | M | T-213, T-520 | 🔴 ring-shader → SVG/canvas arc draw |
| T-529 | history scroll-spy deep-link | replaceState переписує URL-hash на in-view секцію; роути = якорі одного документа (SEO deep-link) | SP(a) §1/§3 · ERA · REG §6 | S | T-520, A-22 | — |
| T-530 | flash-перехід дрілу | Короткий чорний flash між рівнями visual-search (комплекс → поверх) | AIR(v) | S | A-03, T-520 | — |

---

## L6 MOBILE / RESPONSIVE (T-M0x) — переклад прийомів на портретний екран
> Джерело: 4 мобільні відео-тірдауни 2026-06-13 (SAISEI, AIR, SPRINGS, SilverPinewood, ~360 кадрів @390pt).
> Дедуплікований крос-сайтовий синтез: це НЕ нові прийоми, а ЗАКОНИ ТРАНСФОРМАЦІЇ десктопного T-ID у мобільну форму.
> Кожен T-M застосовується ПОВЕРХ базового T-ID через `gsap.matchMedia()` / media-query. Десктоп лишається 1:1.
> **Головний закон:** на 390px немає ГОРИЗОНТАЛІ — все паралельне стає послідовним, все рознесене по ширині стає стеком,
> кожен hover стає tap. Award-студії не «спрощують» — вони ПЕРЕКЛАДАЮТЬ, зберігаючи копі й драматургію 1:1.

| T-ID | Назва | Закон трансформації desktop→mobile | Підтверджено | $ | Поверх T-ID | no-WebGL |
|---|---|---|---|---|---|---|
| T-M01 | spread-row → лівий стек | Слова рознесені по ширині (з'їжджаються скролом) колапсують у лівий 2-рядковий wrap по СМИСЛОВІЙ парі. Роль акт-розділювача перебирає інверсія фону (T-M07) | AIR, SAI, SP (4/4) | S | T-301,T-311 | ✅ |
| T-M02 | hero-wordmark → horizontal-marquee АБО split | Гігант-wordmark або біжить горизонтально (scroll translateX marquee, AIR) або стискається на менше рядків з обрізкою 3-го краєм порту (SP). Фіксується розведеним рядком | AIR, SP, SAI | M | T-211,T-311 | ✅ |
| T-M03 | 2-col → vertical stack | БУДЬ-ЯКА двоколонкова секція (hero+бічний текст, info+details, меню+бренд-знак) злипається у single-column. Закон портрета, не втрата прийому. Короткі ключ-значення лишаються 2-col таблицею | всі 4 | S | A-01,A-09,A-16 | ✅ |
| T-M04 | z-паралакс → паралакс-ribbon | Колаж фото на різних z-швидкостях стає вертикальною стрічкою: плитки послідовно вниз, глибина через РІЗНИЙ розмір+y-offset+краєве накладання (не z-швидкість) | SAI, SP, SPR | M | T-113,C2 | ✅ scroll-linked translateY |
| T-M05 | push-over → crossfade-act | Доводчик акт→акт: бічний push-врізу смугою замінюється довгим CROSSFADE (0.6-0.8с) + scale-creep фону. Overshoot-settle акт-СЛОВА лишається 1:1 | SPR (головна дельта), SP | S | T-501,T-505,T-506 | ✅ |
| T-M06 | desktop-слайдер → pinned-scroll | Горизонтальний слайдер/слайд-історія стає вертикальним PIN на 3-4 екрани: медіа застигле, текст-блоки по черзі crossfade поверх (внутрішній progress, «сторінка» не міняється) | SPR (бігова), SP (/architecture) | M | A-08,A-19,T-105 | ✅ sticky + scroll-progress |
| T-M07 | act-divider = інверсія фону | Бо spread-розгін гине, межі актів тримає різка інверсія фону (білий↔чорний AIR, зелений↔кремовий SPR). Act = зміна світла | AIR, SPR | S | T-501,T-502 | ✅ |
| T-M08 | бічна панель → нижня таб-стрічка | Карта/калькулятор: бічний список POI або ховер-картки → нижня sticky горизонтальна СТРІЧКА табів (← CATEGORY ∨ → / CASE 1·2); активний фільтрує. tap-маркер → нижня док-плашка-tooltip | AIR, SP | M | A-04,A-14,T-406,T-409 | ✅ overflow-x scroll-snap |
| T-M09 | hover → tap (повсюдно) | Усі hover-стани зникають: попавер юніта, ховер-превʼю amenities, курсор-лінза, ховер-фарбування меню → tap-reveal / press-state. Курсор-only прийоми (лінза) випадають повністю | всі 4 | S | T-406,T-430,A-17 | ✅ |
| T-M10 | side-award/badge-rail | Sticky вертикальний side-rail зі стеком (текст rotate 90°, writing-mode), що їде крізь усі секції біля краю — економить горизонтальне місце | SAI | S | T-201,A-18 | ✅ writing-mode/rotate |
| T-M11 | menu/footer = full-screen stack дзеркало | Бургер→full-screen оверлей = ВІЗУАЛЬНА КОПІЯ футер-секції (та сама нумерація + той самий бренд-гігант). Єдина нав-мова вхід/футер. CTA-плитки вибору юніта зверху | SAI, AIR | M | A-16,A-17 | ✅ |
| T-M12 | act-word bleed + browser-chrome aware | Акт-слова рендеряться ШИРШИМИ за порт, краї свідомо обрізаються (кінематичне «гігант не вміщається»). Layout тримає CTA/cookie/footer над плаваючою браузер-капсулою (safe-area) | SP, SAI | S | T-301,T-305 | ✅ font-size>100vw + safe-area |

---

## ARCHETYPES (A-xx) — роль секції → дефолтний стек (база для процедури _GRAMMAR §5)

| A-ID | Роль | Дефолтний стек (T-ID) | Джерело |
|---|---|---|---|
| A-01 | hero | T-101/T-102/T-103 + T-201 + T-318 (титри) + тиха CTA + T-418; варіанти входу: T-311 (kinetic letters), T-211 (wordmark-оверлей), T-507 (frame→fullbleed), текст-як-обʼєкт (SP) | GRM (smarts/quadro) · ERA(v) · AIR(v) · SAI · 11T · SP(v) |
| A-02 | manifesto/задум | Пін-скраб або світла декларація + T-301 великі тези + T-216; ефектний варіант: T-307 scatter→assemble | GRM (smarts §02) · SAI |
| A-03 | visual-search (3-рівневий дріл) | T-104 + T-115 + T-407 + T-406 + T-428 (FLIP-дріл) + T-530; AIR-розширення: драбинка-стек поверхів зліва · попавер юніта з міні-планом · select-multiple · 3D-ізометрія master plan · similar-грід з планами-превʼю | EVR §4 · AIR(v)/(a) · ERA(a) · SPR(a) |
| A-04 | локація/карта | T-104/T-121/T-122 + T-427 (маршрут-кінетика) + T-409 (категорії) + T-210; дистанції = hardcoded строки в JSON (SP), НЕ live-routing; Ever винятково Google Maps — ми → inline-SVG | AIR(v) · SP(a) §4 · ERA(a) · SPR(a) |
| A-05 | trust/процес будівництва | Фази + ПОМІСЯЧНІ міні-каруселі реальних фото (T-110) + вебкам-кнопка + лайтбокс (T-415); масштабний варіант: T-102/T-114 frame-sequence таймлайн (Ever ~1333 img) | ERA(v) (максимальна форма F5) · EVR |
| A-06 | інтерʼєр | Warm-колаж (T-113) + T-217 day/night штора + lightbox-stories (T-112) | GRM (smarts §iv) |
| A-07 | CTA-форма | Чисте полотно + T-411 + underline-поля self-draw (T-405) + чіп обраного юніта + success-wipe; Springs: таби REQUEST/CALLBACK, 0 tel/mailto — конверсія ЛИШЕ формою з currentPageLink | GRM (smarts §cta) · SPR(v)/(a) §6 |
| A-08 | проєкти/типи-дек | T-105 (дек з лічильником + line-ticks) + T-305 + T-506 свапи | SAI (/project) |
| A-09 | сторінка сутності | hero-назва → INFO+фото → DETAILS-таблиця → цитата клієнта → awards/press → T-523 next-handoff | SAI (yama-house) |
| A-10 | філософія-вставка | Full-bleed dark кадр (T-101) + ОДИН поетичний абзац = медійний text-breath | SAI (一期一会) |
| A-11 | types-карусель | Картка типу: фото + назва + площа + спеки + FLOOR PLAN CTA + prev/next; Springs-варіант: повноекранний рендер + темна картка з T-422 числом («7 Penthouses») | 11T · SPR(v) |
| A-12 | invest-переваги | 3 темні картки + T-430 ховер-розкриття + deep-link у каталог з pre-фільтром ціни | AIR(v)/(a) §3 |
| A-13 | units-картка split | Бренд-фон: № величезним + м²/rooms/поверх/ціна + чіпи опцій + PDF/♥/share (T-408) ‖ крем-панель: план чорнилом + перемикач LAYOUT/FLOOR (T-410); AIR-варіант: plan-tabs + мінімапа «on the floor» + 3D-ізометрія + similar-карусель | SPR(v) (/flat/123) · AIR(a) §5 · ERA(a) |
| A-14 | інфра-карта з категоріями | T-104 (2 SVG-шари + 1 JSON) + панель категорій → ховер підсвічує точки → плашка-список обʼєктів (T-406); маркери 5 типів, glass-pill POI (Springs) | SP(v)/(a) §4 · SPR(a) §5 |
| A-15 | list↔plan dual-view | ОДИН датасет → LIST (/flats ajax) + PLAN (/visual-search SVG), toggle selector__link зберігає фільтр-state (T-409); обидва → /flat/{code} | EVR §4 (канон) · AIR(a) |
| A-16 | футер-як-секція | Нумероване меню + гігантський бренд-знак (SAI) / rounded-канва + контакт-КОЛО + back-to-top смуга (11T) / дзеркало hero-літер (AIR, T-311) + legal | SAI · 11T · AIR(v) |
| A-17 | меню-оверлей | Повноекранне: фото-фон реагує на пункт + ховер фарбує слово (SP) / великі пункти + плитки-CTA вибору юніта + бренд-обʼєкт-фон (AIR) | SP(v) · AIR(v) |
| A-18 | хедер-конверсія постійна | Вся конверсія в хедері завжди: MENU · SELECT APARTMENT · TOUR · ♥ · REQUEST A CALL; themed-перефарбування під секцію; + службова адресна смуга під актами | ERA(v) · AIR(a) |
| A-19 | категорійна галерея | T-112 + фільтри категорій; desktop-варіант: pinned scroll-gallery з кастомним скролбаром | EVR · ERA(a) · SPR(a) §3 |
| A-20 | how-to-buy / mortgage | Крок-акордеон (T-417) + T-416 калькулятор (+trade-in, програми ставок) | AIR(a) · ERA(a) · EVR |
| A-21 | паркінг plan+table dual | T-104 план (data-nr="М94") + таблиця рядків (~528) + таби типів | EVR §3 |
| A-22 | crossлінк-спина | Кожна story-сторінка завершується лінк-меню до сусідніх — сторінки утворюють кільце, не глухий кут (visualizationLinesMenu) | ERA(a) §3 |

---

## ПОКРИТТЯ

Метод підрахунку: первинне (перше назване) джерело кожного T-ID. «Спільне» = прийом зафіксований на ≥3 сайтах одночасно.

| Джерело | T-ID первинних | Коментар |
|---|---|---|
| ERA (відео+статика) | 15 | T-102,103,110,118,208,213,306,315,405,415,416,424,429,507,528 |
| AIR (відео+статика) | 15 | T-115,119,121,207,210,215,310,311,417,422,427,430,510,524,530 |
| Ever (ЛИШЕ статика) | 14 | T-112,114,120,204,206,303,406,409,412,414,505,508,522,526 |
| Springs (відео+статика) | 10 | T-108,109,111,116,209,214,413,423,506,525 |
| SilverPinewood (відео+статика) | 10 | T-117,205,314,316,317,402,419,428,503,529 |
| 11TANJUNG (лише відео) | 10 | T-106,107,122,211,212,312,313,418,421,527 |
| SAISEI (лише відео) | 7 | T-105,113,307,308,309,521,523 |
| GRM — власний канон smarts/quadro | 7 | T-216,217,318,319,425,502,504 |
| Спільні (≥3 сайтів) + registry-загальні | 21 | T-101,104,201,202,203,301,302,304,305,401,403,404,407,408,410,411,420,426,501,509,520 |
| Мобільні закони трансформації (T-M0x) | 12 | T-M01…T-M12 — крос-сайтовий синтез 4 моб-тірдаунів (SAI/AIR/SPR/SP) |
| **Разом T-ID** | **121** | + 22 архетипи A-01…A-22 |

### Бідні зони (<3 прийомів — кандидати на майбутні відео-тірдауни)
1. **Ever наживо — 0 відео.** Найбагатший статичний зонд (14 T-ID), але доводчики, темп, page-transition «modal-in», before/after у русі НЕ зняті. **Кандидат №1 на відео-тірдаун.**
2. **SAISEI L4 MICRO = 0** — інтеракції зняті (дек, переходи), але курсор/ховери/кнопки не зафіксовані.
3. **Springs L3 TEXT-CHOREO = 0 первинних** — окрім спільного T-305 (акти-іменники) текстова хореографія Springs не описана.
4. **SilverPinewood L1 = 1** (T-117 Zeus) — базова медіа-мова SP (відео гольфіста, фото-колажі) зафіксована лише як приклади чужих T-ID.
5. **11TANJUNG L5 in-page = 0 первинних** — як саме rounded-канви (T-106) шиються між собою, не зафіксовано; також немає статичного зонду глибини 11T.
6. ~~Мобільна поведінка = 0 T-ID~~ **ЗАКРИТО 2026-06-13:** L6 MOBILE (T-M01…T-M12) = крос-сайтовий синтез 4 моб-тірдаунів. Лишилась діра: мобільна поведінка ВЛАСНИХ сайтів (smarts/quadro/nahirna) і моб-версії ERA/Ever/11T не зняті.
7. **Page-transition ERA/SP** — Barba-переходи флагмана ERA і SP наживо не описані (лише прелоадери).

> Правило підтримки: новий відео-тірдаун додає РЯДКИ у відповідні шари (наступний вільний номер у T-1xx…T-5xx), не міняючи модель. Якщо прийом не лягає в шар — лагодимо _GRAMMAR і пишемо чому.
