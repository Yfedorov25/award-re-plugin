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
| T-218 | wordmark-knockout фото-карусель | СИГНАТУРА Ever: гігант-wordmark = knockout-маска в бренд-панелі, контури літер = вікна у фото-карусель що крос-фейдить позаду (двір→інтер'єр→зелень→обличчя, ~2-3с) + split-hover swap | EVR(v) (головна знахідка) | M | T-211, T-414, T-526 | ✅ background-clip:text / SVG-mask + crossfade шарів |
| T-219 | particle-overlay сезонний | Падаюче листя/частинки канвою поверх секції (autumn-leaf деко над location/territory) | EVR(v) | S | T-204, T-101 | ✅ canvas-2D particle loop |

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
| T-320 | act-слово як вертикальний side-rail | Акт-слово (PLACE/SPORTS) поставлене ВЕРТИКАЛЬНО (writing-mode/rotate) по краю в'юпорта і ТРИМАЄТЬСЯ закріпленим, поки фон-медіа крос-фейдить кілька кадрів — драматургічний якір акту (десктоп-родич мобільного T-M10) | EVR(v) | S | T-305, T-501 | ✅ writing-mode/rotate + sticky |
| T-321 | гігант-факт із counter на розділювачі | Велике число доводиться лічильником на спец-розділювачі секцій (34 FLOOR, 6 HECTARES) — комбінація count-up + ghost-факт як ритм-удар | EVR(v) (розширює T-304+T-422) | S | T-304, T-422, T-216 | ✅ |
| T-322 | text-blur-reveal каскад | ОСНОВНИЙ reveal-канон AIR: текст в'їжджає filter blur(10px)→0 + opacity, БЕЗ y-зсуву; каскад за ордером заголовок→цифри→параграфи з лагом 0.15-0.25s, 0.3s/елемент, once по скрол-тригеру; секція, досягнута стрибком/мідскролом = settled МИТТЄВО без анімації (Д4б). D4-виняток: one-shot blur ≤0.3s time-based, ніколи не scrub | AIR(v1-v4) /investment всюди + D_AIR_invest_1to1 §3.1/§6.1 | S | T-310, T-422, T-433, T-M23 | ✅ gsap filter-твін (text-blur-reveal; двічі бойово в invest-комбо) |

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
| T-430 | ховер-розкриття тексту картки ⚠️ЗАСТАРІВ | У AIR v4 ВІДСУТНІЙ (owner-перевірка hover 2026-07-05: текст карток видимий завжди). Реальна ховер-механіка = T-432. Не використовувати для реплік AIR | AIR(v) старий запис | S | T-426, A-12, T-432 | — |
| T-432 | cursor-arrow навігація каруселі | Вся картка каруселі = клік-зона: за курсором їде кнопка-стрілка, ліва половина картки = «←» prev, права = «→» next (48px, біла плитка). Текст картки видимий завжди; картка напівпрозора над бренд-обʼєктом (T-207 просвічує) | AIR(v4) /investment, hover-запис 2026-07-05 | S | T-430, T-207, A-12 | — |
| T-431 | «White box / Window's view» перемикач рендеру | У картці юніту перемикач показу: голий white-box ↔ умебльований/вид з вікна — той самий план, два рендери; tap-таби + clip | EVR(v) (/flat) | S | T-410, A-13 | ✅ tabs + clip-swap |
| T-433 | tab-crossfade чисел | Таби CASE/стратегій міняють ЧИСЛА кросфейдом 0.25-0.35s БЕЗ layout-зсуву: старе й нове значення НАКЛАДЕНІ мід-флайт (привид старого поверх нового), актив-таб = чорний border-bottom 2px на всю клітинку | AIR(v4) /investment + D_AIR_invest_1to1 §6.2 | S | T-416, T-M19 | ✅ opacity ghost-кросфейд (case-tabs-table) |
| T-434 | sticky anchor-рейка моделей | Ліва липка колонка 23vw з hairline-пунктами моделей: актив чорніє на межі секцій (scroll-spy), клік = плавний anchor-скрол (#strategy-2); навігаційний хребет багатомодельного акту, ЄДИНИЙ sticky секції (нуль пінів); споріднена з драбинкою-стеком A-13/visual-search | AIR(v4) /investment B3-B5 + D_AIR_invest_1to1 §6.3 | S | T-416, T-433, T-425 | ✅ position:sticky + scroll-spy (invest--strategy-machine) |

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
| T-511 | dim-scrim шов | Секція, що виїжджає, притемнюється scrim-ом на ~15-20% під наїзд наступного headline-бенду (spread-row); глибина стику БЕЗ піна, звичайний скрол | AIR(v1) /investment (контекст) + D_AIR_invest_1to1 §5/§6.4 | S | T-310, T-501 | ✅ overlay-opacity scrim (invest--quiet-depth) |
| T-512 | center-band wipe | Нове фото розкривається горизонтальною смугою з ЦЕНТРУ старого (слайдер v3); шов свапу медіа всередині слайдера/акту; моб-родич = push-wipe T-M23 | AIR(v3) слайдер + D_AIR_invest_1to1 §6.5 | S | T-110, T-109 | ⬜ атом у спринті 2 (clip-path inset wipe) |

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
| T-M12 | act-word bleed + browser-chrome aware | Акт-слова рендеряться ШИРШИМИ за порт, краї свідомо обрізаються (кінематичне «гігант не вміщається»). Layout тримає CTA/cookie/footer над плаваючою браузер-капсулою (safe-area) | SP, SAI, EVR | S | T-301,T-305 | ✅ font-size>100vw + safe-area |
| T-M13 | hero-wordmark = свапаючий dual-photo anchor | Mask-wordmark на моб = НЕ статичний оверлей, а anchor стека [верхнє фото / друге фото-в-літерах-масках / LIVE HERE / scrim-рефрен]. Обидва фото-шари свапаються СИНХРОННО, фон-band циклить N темо-кольорів. Прелоадер: wordmark horizontal-marquee на split-фоні → ОСІДАЄ у fixed mask-hero | EVR | M | T-218,T-211,T-526,T-M02 | ✅ background-clip:text + crossfade обох шарів + scroll-bg-color |
| T-M14 | POI-карусель числом-док | Карта-локація: hover-routing/бічний список POI → нижня док-плашка з ГІГАНТ-числом хвилин (count-up) + tap-‹› гортає POI по одному; пін бренд-пілюлею. Заміна T-427 там, де немає live-routing | EVR | M | T-104,T-304,T-419,T-M08 | ✅ counter + inline-SVG карта |
| T-M15 | попавер → bottom-sheet з ✕ | Десктоп Floating-UI tooltip (triangle-anchor) → full-card / slide-up bottom-sheet з ✕ (без трикутника): фото-овал + CAPS-абзац + іконо-сітка. Стосується amenity/news-promo/POI | EVR | S | T-406,T-522,T-M09 | ✅ fixed sheet + translateY + backdrop-close |
| T-M16 | bleed act-word «прокатка» по вертикалі | Акт-слово ширше за порт показує РІЗНІ фрагменти в сусідніх скрол-кадрах (ARCHIT…→…ECTURE) — не просто обрізане з боків (T-M12), а вертикально «прокочується» повз порт, як кінотитр | EVR | S | T-305,T-M12,T-202 | ✅ font-size>100vw + translateY scroll-keyframe |
| T-M17 | sticky-фото + glass-картка scroll-over | Дзеркало T-215 на портреті: десктопна картка замерзає і фон пливе; на моб навпаки — full-bleed фото ФІКСУЄТЬСЯ, поверх нього знизу в'їжджає напівпрозора frosted-картка [act-заголовок + бренд-об'єкт + CTA-✛] (~1.2–1.5с скролу), далі фото віддає скрол наступному акту | AIR(mv) | S | T-215,T-207,T-510 | ✅ position:sticky + rgba/backdrop-панель (D2: не над канвасом) |
| T-M18 | числа-ряд/ховер-картки → frosted-swipe стрічка | Ряд гігантських чисел-фактів (T-422) АБО картки з ховер-розкриттям (T-430) стають горизонтальною scroll-snap стрічкою морозних карток поверх темного макро-фото; текст розкритий ОДРАЗУ (ховер гине), сусідня картка виглядає з-за краю як свайп-кью; людські фото десктопу → темне архітектурне макро | AIR(mv) | S | T-422,T-430,T-M09 | ✅ overflow-x scroll-snap + backdrop-filter над статичним фото |
| T-M19 | калькулятор → таб-пресети + sticky-spy пара | Range-слайдери калькулятора гинуть: CASE-таби tap-свапають ЦІЛИЙ фіксований датасет (OFFICE 110.6→84.7 м²); таблиця key-value right-aligned + гігант-підсумок (FROM 8 YEARS · ~553 000) + зірочка*→дисклеймер; внизу ЗАКРІПЛЕНА пара «1./2. STRATEGY» = scroll-spy (підкреслення їде за секцією) І tap-навігація | AIR(mv) | M | T-416,T-410,T-529,T-419,T-M08 | ✅ |
| T-M20 | карта-категорії: strip + dropdown-up шит + кластери | Деталізація T-M08 живим AIR: стрічка [← CATEGORY ∨ →] — стрілки гортають категорії по одній, ∨ відкриває ВГОРУ напівпрозорий список-шит (актив білим); вибір свапає ВЕСЬ набір іконо-маркерів; скупчення POI = кластер-бейдж «40+»; вхід у full-map з домашньої pan-прев'ю кнопкою [INTERACTIVE MAP ✛]; тач-афорданс = кругла ‹ ›-пілюля замість курсор-режимів | AIR(mv) | M | T-104,T-409,T-M08,A-04 | ✅ |
| T-M21 | форма → tap-pills поверх full-bleed фото | Дропдауни/радіо стають чіпами-pills (goal/budget), інпути = морозні underline-поля; ВСЯ форма живе ПОВЕРХ full-bleed фото-фіналу (не на білому полотні); заголовок форми = обіцянка результату (RECEIVE A PERSONALIZED SELECTION) | AIR(mv) | S | T-411,A-07,T-M09 | ✅ |
| T-M22 | міжсторінковий шов = одна біла штора знизу↑ | Десктопний split-panel прелоадер (T-524) на моб спрощений до ОДНІЄЇ білої панелі: тап-перехід = штора знизу→вгору ~0.5с, під нею нова сторінка (каркас одразу, важке медіа доініціалізовується ~0.5с); перехід З МЕНЮ — без штори, білий оверлей меню САМ виконує її роль (свап ≤0.3с); initial load = zoom-тикер wordmark (T-M02: 3 проходи, кожен більшим кеглем) | AIR(mv) | S | T-524,T-520,T-M02,T-M11 | ✅ fixed-панель translateY |
| T-M23 | shader-ефекти → blur-reveal + tap-карусель push-wipe | Пара T-119: UV-дисторсія на моб = СИСТЕМНИЙ blur→sharp reveal (~0.3–0.5с) для заголовків/абзаців/фото при вході в порт; фото-карусель = інсет-вікно з [← N/M →], тап-стрілка → push-wipe справа→наліво ~0.4с, лічильник свапається на старті (без дисторсії) | AIR(mv2) /about | S | T-119,T-212,T-110,T-M09 | ✅ filter:blur+opacity; НЕ над канвасом (D2) |
| T-M24 | ✛-toggle frosted-картки (hover-розкриття → tap) | Пара T-417/T-430/T-432: картка стрічки [заголовок + контур-іконка + ✛ знизу-справа]; тап ✛ → in-place крос-фейд ~0.3–0.4с (title+іконка ↔ повний CAPS-текст/чек-лист ☐), ✛ морфиться в −; РОЗМІР картки не змінюється; стани незалежні по картках і ЖИВУТЬ при свайпі стрічки; працює на світлих і чорних стрічках | AIR(mv2) /about PREMIUM TECH + INNOVATIVE ENG | S | T-417,T-430,T-432,T-M18 | ✅ |
| T-M25 | акордеон площ із планами + floating-CTA | Пара T-417+T-407: рядки-площі [79 M² ✛ … 1566.7 M²]; тап → press-state (рядок темнішає) → animate-height (розгорт ~0.5–0.7с, згорт ~0.3–0.4с) + гігант-число вростає + ПЛАН-КРЕСЛЕННЯ + абзац; ✛↔−; поверх акордеона плаває чорна пілюля [CHOOSE AN OFFICE ✛] = мобільний T-424 конверсійний місток | AIR(mv2) /about LAYOUT SOLUTIONS | M | T-417,T-407,T-424,T-M09 | ✅ |
| T-M26 | маршрут-кінетика → POI-свайп-картки над картою | Пара T-427: hover/клік POI → нижня свайп-стрічка карток [назва + гігант-хв + MIN OF FOOT/DRIVE + км], сусідня виглядає з краю; снап картки активує POI: стара траса гасне ~0.2с → мапа перецентровується/зумиться ~0.5с → маршрут малюється прогресивно ~0.4–0.6с; пішки = ПУНКТИР, авто = суцільна підсвітка самої вулиці; count-up НЕ зафіксовано (число статичне) | AIR(mv2) /location TRANSPORT ACCESSIBILITY | M | T-427,T-104,T-M08,T-M14 | ✅ SVG stroke-dashoffset по реальній геометрії |
| T-M27 | real-aerial + color-zones → пінований аеро-журней | Пара T-121+T-210: реальне аерофото ФІКСУЄТЬСЯ, скрол = зум/пан-подорож по зонах; кольорові зони (червона/бірюзова) прямо на аеро; текст-оверлеї blur-in по ходу; поверх піна їде свайп-стрічка морозних зон-карток [гігант-хв + MIN WALK + назва зони] | AIR(mv2) /location SURROUNDINGS | M | T-121,T-210,T-M17,T-M18 | ✅ sticky + scroll-driven transform фото |
| T-M28 | ізо-модель-стрічка з іконо-бейджами + drag | 3D-друкована біла ізо-модель стилобату ширша за порт: чорні іконо-бейджі ритейлу на плитах веж + лейбли зон (DROP-OFF/MALL/ENTRANCE/Ⓟ) + гост-гігант «4000 M²» за моделлю; вільний 1-вісний drag із ‹›-пілюлею + тонка прогрес-лінія знизу | AIR(mv2) /about retail-galleries | M | T-118,T-115,T-M12,A-03 | ✅ pre-rendered ізо + overflow-x drag |
| T-M29 | funnel-штора: чорна панель + wordmark на кромці | Доповнення T-M22: вхід у КОНВЕРСІЙНИЙ фунел (CHOOSE AN OFFICE) отримує довший брендовий ритуал — чорна панель їде знизу↑, на її верхній кромці розведений рядок «A I R A I R» (~1.2с підйом), повне покриття → вихід угору, знизу нова сторінка; ритуал ~2.2–2.5с; звичайні переходи лишаються швидкою білою шторою (C9: один ритуал) | AIR(mv2) фунел | S | T-524,T-M22,T-M02,T-521 | ✅ fixed-панель + wordmark-рядок |
| T-M30 | list-фунел + favourites-панель з email-шитом | Пара A-15+T-408+T-419: OFFICE SELECTION список [план-превʼю ліворуч · № · м² · поверх · корпус · ♡ · ціна]; 🔒-превʼю = зайнятий; знижка = струк-ціна + червоний бейдж «-5%»; сорт ∨ + перемикач [LIST/GRID] + [SHOW MORE ✛] пагінація + sticky-низ [CLEAR / FILTERS]; ♡ картки → заливка чорним ~0.2с → бейдж-лічильник у хедері → панель FAVORITES (slide-down зверху, «N OFFICES», список темніє під нею) з ✉ → шит SEND BY EMAIL [поле + consent + SEND ✛] | AIR(mv2) /filter-by-parameters | L | T-408,T-409,T-419,A-15,T-M09 | ✅ localStorage + fixed-панелі |
| T-M31 | unit-сторінка: таби планів + render-toggle + similar-handoff | Пара A-13+T-431+T-523: шапка [№+м²+поверх+корпус+COMPLETION-лейбл] + чіпи (стеля 3.94 M · 👁 вид) + ціна-блок (за м² + гігант + струк + -5%), при скролі ціна колапсує в sticky топ-бар; таби [OFFICE PLAN / ON THE FLOOR / MASTER PLAN]: креслення → поверховий план з залитим юнітом → ізо-модель з чорним бейджем вежі; toggle [UNFURNISHED/FURNISHED] живе ЛИШЕ на OFFICE PLAN; sticky-низ [♡ / RESERVE ✛]; SIMILAR OFFICES → press-state → нова unit-сторінка без повернення в список | AIR(mv2) /office/73 | L | A-13,T-431,T-523,T-407,T-410,T-419 | ✅ tabs+clip-swap |
| T-M32 | закон непортованості: plan-select = desktop-only заглушка | Master-plan multi-select дріл (T-115/A-03) VI НЕ переклали на моб: пункт меню веде на сторінку-заглушку «SELECTING MULTIPLE UNITS ON THE MASTER PLAN IS ONLY AVAILABLE ON DESKTOP» + контур-іконка монітора; конверсію на моб несе LIST-фунел (T-M30). Закон: складні multi-select органи → чесна заглушка + повноцінна list-заміна, НЕ покалічений дріл | AIR(mv2) | S | T-115,A-03,T-M30 | ✅ |

> ДОДАНО 2026-07-05: T-M23…T-M32 — РАУНД 2 дозйомки AIR (AIR(mv2) = D_AIR_mobile_video §РАУНД 2,
> записи mv2/mv3/mv4 = 768 кадрів @2fps + 6 вікон @10fps). Закрито всі 8 цілей раунду:
> T-115 (на моб відсутній — T-M32) · T-119 (T-M23) · T-121+T-210 (T-M27) · T-407 (частково — T-M31) ·
> T-427 (T-M26) · T-530 (не існує — ритуал = T-M29) · T-417 ✛ (T-M24/M25) · T-408 (T-M30).
> Сайт v4: /location повністю нова сторінка; blur→sharp = системний мобільний reveal AIR.
> ДОДАНО 2026-07-04: T-M17…T-M22 — соло-мобільний тірдаун AIR, запис №2 власника
> (AIR(mv) = [D_AIR_mobile_video](../../teardowns/references/D_AIR_mobile_video.md), 232 кадри @2fps + 3 вікна @6fps).
> Там же: повна таблиця «десктопний AIR T-ID → мобільний вердикт» (21 T-ID, включно з чесними
> «не знято»: T-115/119/121/210/407/427/530 — кандидати на наступний запис) і повторні
> підтвердження T-M01/M02/M06/M07/M09/M11 на AIR. Мобільний пін AIR = sticky-підкладка
> БЕЗ scroll-trap (свайп вільний — сумісно з C7).

---

## ARCHETYPES (A-xx) — роль секції → дефолтний стек (база для процедури _GRAMMAR §5)

| A-ID | Роль | Дефолтний стек (T-ID) | Джерело |
|---|---|---|---|
| A-01 | hero | T-101/T-102/T-103 + T-201 + T-318 (титри) + тиха CTA + T-418; варіанти входу: T-311 (kinetic letters), T-211 (wordmark-оверлей), **T-218 (wordmark-knockout фото-карусель — найсильніший, Ever)**, T-507 (frame→fullbleed), текст-як-обʼєкт (SP); моб: T-M13 dual-photo anchor | GRM (smarts/quadro) · ERA(v) · AIR(v) · SAI · 11T · SP(v) · EVR(v) |
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
| A-13 | units-картка split | Бренд-фон: № величезним + м²/rooms/поверх/ціна + чіпи опцій + PDF/♥/share (T-408) ‖ крем-панель: план чорнилом + перемикач LAYOUT/FLOOR (T-410); AIR-варіант: plan-tabs + мінімапа «on the floor» + 3D-ізометрія + similar-карусель; **Ever-варіант: T-431 «Window's view / White box» перемикач рендеру + спек-accordion 9 рядків (FLOOR/CEILING/WALL/POWER/WATER/DOORS/METERS/VENTILATION/HEATING) + наскрізна 3D-мушля** | SPR(v) (/flat/123) · AIR(a) §5 · ERA(a) · EVR(v) |
| A-14 | інфра-карта з категоріями | T-104 (2 SVG-шари + 1 JSON) + панель категорій → ховер підсвічує точки → плашка-список обʼєктів (T-406); маркери 5 типів, glass-pill POI (Springs) | SP(v)/(a) §4 · SPR(a) §5 |
| A-15 | list↔plan dual-view | ОДИН датасет → LIST (/flats ajax) + PLAN (/visual-search SVG), toggle selector__link зберігає фільтр-state (T-409); обидва → /flat/{code}; Ever-канон у русі: таблиця колонки Plan/Area/Rooms/Room/Housing/Floor/Features/Price + «N option» count-up → modal-in картка (T-522) → T-431 view-toggle → Reserve → FLIP-back; моб: стек карток + sticky-pill «Filters» (T-419) | EVR §4 + EVR(v) (канон) · AIR(a) |
| A-16 | футер-як-секція | Нумероване меню + гігантський бренд-знак (SAI) / rounded-канва + контакт-КОЛО + back-to-top смуга (11T) / дзеркало hero-літер (AIR, T-311) + legal | SAI · 11T · AIR(v) |
| A-17 | меню-оверлей | Повноекранне: фото-фон реагує на пункт + ховер фарбує слово (SP) / великі пункти + плитки-CTA вибору юніта + бренд-обʼєкт-фон (AIR) | SP(v) · AIR(v) |
| A-18 | хедер-конверсія постійна | Вся конверсія в хедері завжди: MENU · SELECT APARTMENT · TOUR · ♥ · REQUEST A CALL; themed-перефарбування під секцію; + службова адресна смуга під актами | ERA(v) · AIR(a) |
| A-19 | категорійна галерея | T-112 + фільтри категорій; desktop-варіант: pinned scroll-gallery з кастомним скролбаром; Ever-моб: lightbox з гігант-номером «N/6» + прогрес-лінія + ↓/✕, вільний свайп | EVR · EVR(v) · ERA(a) · SPR(a) §3 |
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
| Ever (відео+статика) | 19 | +T-218,219,320,321,431 з відео (wordmark-knockout, particle-leaves, vertical-act-rail, giant-fact-counter, white-box-toggle); раніше 14 статичних |
| Springs (відео+статика) | 10 | T-108,109,111,116,209,214,413,423,506,525 |
| SilverPinewood (відео+статика) | 10 | T-117,205,314,316,317,402,419,428,503,529 |
| 11TANJUNG (лише відео) | 10 | T-106,107,122,211,212,312,313,418,421,527 |
| SAISEI (лише відео) | 7 | T-105,113,307,308,309,521,523 |
| GRM — власний канон smarts/quadro | 7 | T-216,217,318,319,425,502,504 |
| Спільні (≥3 сайтів) + registry-загальні | 21 | T-101,104,201,202,203,301,302,304,305,401,403,404,407,408,410,411,420,426,501,509,520 |
| Мобільні закони трансформації (T-M0x) | 16 | T-M01…T-M16 — крос-сайтовий синтез 5 моб-тірдаунів (SAI/AIR/SPR/SP + EVR додав T-M13…T-M16) |
| **Разом T-ID** | **130** | + 22 архетипи A-01…A-22 |

### Бідні зони (<3 прийомів — кандидати на майбутні відео-тірдауни)
1. ~~Ever наживо — 0 відео~~ **ЗАКРИТО 2026-06-13:** D_EVER_video (десктоп 264с + мобайл 142с). Найбагатший зонд тепер 19 T-ID + рух (knockout-hero механіка, theme-ритм як доводчик, A-15 dual-view у динаміці, modal-in/flash, before/after touch). Лишилось для майбутнього: точний тайминг crossfade між актами, доводчик bottom-sheet slide-up.
2. **SAISEI L4 MICRO = 0** — інтеракції зняті (дек, переходи), але курсор/ховери/кнопки не зафіксовані.
3. **Springs L3 TEXT-CHOREO = 0 первинних** — окрім спільного T-305 (акти-іменники) текстова хореографія Springs не описана.
4. **SilverPinewood L1 = 1** (T-117 Zeus) — базова медіа-мова SP (відео гольфіста, фото-колажі) зафіксована лише як приклади чужих T-ID.
5. **11TANJUNG L5 in-page = 0 первинних** — як саме rounded-канви (T-106) шиються між собою, не зафіксовано; також немає статичного зонду глибини 11T.
6. ~~Мобільна поведінка = 0 T-ID~~ **ЗАКРИТО 2026-06-13:** L6 MOBILE (T-M01…T-M16) = крос-сайтовий синтез 5 моб-тірдаунів (SAI/AIR/SPR/SP/EVR). Лишилась діра: мобільна поведінка ВЛАСНИХ сайтів (smarts/quadro/nahirna) і моб-версії ERA/11T не зняті.
7. **Page-transition ERA/SP** — Barba-переходи флагмана ERA і SP наживо не описані (лише прелоадери).

> Правило підтримки: новий відео-тірдаун додає РЯДКИ у відповідні шари (наступний вільний номер у T-1xx…T-5xx), не міняючи модель. Якщо прийом не лягає в шар — лагодимо _GRAMMAR і пишемо чому.

---

## IMPLEMENTED-BY — brain→body coverage map (append-only; generated-adjacent)

> Added by the library migration (2026-06-24). The 6 reproducible primitives in
> `library/` realize these registry techniques. This is the DOWN link from the
> 163-`.md` brain to the executable body — append-only, no existing row changed.
> Authoritative coverage lives in `library/COVERAGE.md` (generated). Walk back the
> other way via each RECIPE's `source.registry_ref`.

| T-ID(s) | IMPLEMENTED-BY (library id) | path | status |
|---------|-----------------------------|------|--------|
| T-217, T-405 | `cards-swipe` (+ variants: editorial, cinematic) | `library/components/cards-swipe/` | official |
| T-101, T-201 | `puzzle-image` | `library/components/puzzle-image/` | official |
| T-118 | `puzzle-text` | `library/components/puzzle-text/` | official |
| T-077 | `focus-render-switch` | `library/components/focus-render-switch/` | official |
| T-310 | `media-step-switch` | `library/components/media-step-switch/` | official |
| T-220 | `slide-out-img-text` | `library/components/slide-out-img-text/` | official |
| (pending) | `depth-stack` (forward-stack / deal-fan / portal-through) | `library/components/depth-stack/` | seed |

Combos (Level-2 section recipes) that compose the above:
`hero-puzzle-monument`, `benefit-wipe-band`, `lifestyle-deck-fan`,
`manifesto-flip-draw`, `interiors-cards-cursor`, `story-stepper-render-focus`,
`conversion-quiet-gate` — see `library/combos/<id>/RECIPE.md` (`uses:` cites the
component ids). Shared utils cited by combos live in `library/shared/`.
