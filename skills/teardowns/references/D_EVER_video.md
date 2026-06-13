# D_EVER_video — живий тірдаун ever-live-here.com

> **Тип:** ДЕСКТОПНИЙ відео-тірдаун (запис 264с, найдовший і найбагатший з усіх 7 відео-тірдаунів).
> **Закриває діру реєстру №1:** «Ever наживо — 0 відео, найбагатший статичний зонд (14 T-ID)».
> **Метод:** 15 контактних аркушів 3×3, fps=1/2 (кожен кадр = 2с), екран 2560×1600 landscape.
> Таймкод позиції = (аркуш−1)×18с + позиція_в_аркуші×2с.
> **База, яку ДОПОВНЮЄМО (не дублюємо):** [re-architecture/references/D_Ever_architecture.md → канон у teardowns/references/D_Ever_architecture.md].
> Статичний зонд знав СТРУКТУРУ (DOM, плагіни, дані). Це відео знає РУХ: доводчики, темп, theme-ритм, page-transitions, мікрокінетику.
> Ever = ЖК бізнес-класу (Москва, Обручева вул. вл. 23, забудовник Sezar Group / архітектори SPEECH + GAFA; копі рос/англ). Палітра: **теплий теракотово-беж `#c89878`-ish ↔ темний slate-зелений `#2e3a36`-ish** — два полюси, що ритмічно чергуються через увесь сайт.
> Дата: 2026-06-13.

---

## Що нового проти статичного зонду (РУХ)

Статичний зонд дав 14 T-ID із DOM/плагінів. Чого він НЕ міг знати і що додає це відео:

1. **Hero — механіка wordmark-as-photo-mask наживо.** Зонд знав про `intro split-hover` (T-414) і wordmark, але не як гігант «ever» працює ЛІТЕРАМИ-вікнами у фото, як ці фото-маски ротуються (велосипедист → інтер'єри → обличчя → зелень → рука), і як «LIVE HERE» проявляється. Це сигнатура сайту — описана покадрово нижче.
2. **Theme-ритм як драматургія, а не атрибут.** Зонд знав про `theme-flip` (T-501). Відео показує ТЕМП чергування беж↔slate: майже КОЖЕН акт = інверсія світла. Це не випадковість — це головний доводчик меж між актами (Ever не покладається на push-over як Springs).
3. **3D-кулі матеріалів в ARCHITECTURE.** Зонд бачив `матеріал-як-3D-обʼєкт` лише в ERA. Тут Ever має ВЛАСНІ 3D-сфери (плетена мушля-куля, цегляна сфера, клінкер-куля) що висять/обертаються біля тексту — нова комбінація.
4. **Falling-leaves / particle overlay** на блоках PLACE/NATURE — рух часток поверх медіа, статиці невидимий.
5. **Location-map route-кінетика наживо.** Зонд знав Google Maps. Відео показує: клік POI → «Build a route» + хвилини-лічильник РОСТЕ (15→18 хв) у картці — підтвердження маршрут-кінетики (T-427) на ЩЕ одному сайті.
6. **A-15 dual-view у РУСІ.** Зонд описав list↔plan↔card структуру. Відео показує переходи: `modal-in` картки юніта, перемикач «Window's view / White box», 3D-мушлю в картці, accordion-специфікації, FLIP назад у список.
7. **Visual-search drill наживо.** EVER PLAN (3D-ізометрія кварталу з пінами Housing 1-6) → клік → HOUSING 1 (фасад вежі) → ховер поверху → плита «22 FLOOR / 28 FLOOR / 34 FLOOR» з лічильником квартир. Зонд знав SVG-движок; відео знає послідовність дрілу + flash-перехід.
8. **Floating brand-object (чорна сфера) в INFRASTRUCTURE** — наскрізний 3D-об'єкт як нитка ідентичності, паралаксить окремо від фону.
9. **Меню-оверлей наживо** — нумероване меню + 2 CTA-плитки (Choose an apartment / Choose a car park) + дзеркало контакту.
10. **Гігант-числа що докручуються** — «34 FLOOR», «3,2», «5,5», «60», «212 option», хвилини маршруту: counter count-up (T-304) на масштабних фактах.

---

## Hero — wordmark-as-photo-mask (покадрово, детально — СИГНАТУРА)

> Аркуш D_01 поз.4-9 + D_02 поз.1. Таймкод ~0-16с. Це найважливіший прийом сайту і кандидат на новий T-ID.

**Механіка в шарах (знизу вгору):**
1. **Шар фото-фон** — full-bleed рендер кварталу/інтер'єру (T-101), повний колір, насичений.
2. **Шар БЕЖ-заливки** — суцільна тепла теракотово-бежева панель `#c89878`-ish, що НАКРИВАЄ майже весь кадр.
3. **Шар wordmark «ever»** — гігантський (≈70-80% ширини в'юпорта, baseline по центру вертикалі), але це НЕ фарба і НЕ текст поверх. Це **виріз-маска (knockout)**: всередині контурів літер беж-панель ПРОЗОРА, і крізь неї видно фото-фон. Тобто кожна літера = вікно у живе фото.

**Покадровий прохід (preloader → reveal):**
- **~0-2с (D_01 поз.4):** preloader — велике бежеве поле, в центрі величезний знак «**e**» (логотип-монограма) контуром у бежі. Це брендовий ритуал входу (T-526 palette-cycle preloader сімейство).
- **~2-4с:** слово розкривається з «e» у повне «**ever**». Спочатку слово сіро-блакитне на темному slate (D_02 поз.1 — переходовий стан: slate-фон, «ever» світло-сірим контуром). Потім перефарбовується/перекидається у беж-маску.
- **~4-8с (D_01 поз.5):** беж-маска активна. Крізь літери видно фото двору: у «e» — велосипедист згори (top-down), у «v»/«r» — фасади/зелень. Унизу зліва малий факт-абзац: *«The composition of the landscape is built on the contrast of architecture and nature, which do not oppose each other, but rather coexist harmoniously.»* Праворуч/унизу проявляється **«LIVE HERE»** беж-капіталлю (з line-stagger reveal).
- **~8-10с (D_01 поз.6):** фото-маски ЗМІНИЛИСЯ — той самий wordmark, але тепер крізь літери видно ІНШІ кадри: інтер'єри, зелень, **рука торкається листя** (у «r»). Тобто маски — це не статика: фото за літерами **крос-фейдять/свапаються** (carousel за knockout-маскою). «LIVE HERE» лишається закріпленим.
- **~10-16с (D_01 поз.7-8):** ще свап — крізь літери **обличчя людини** великим планом (D_01 поз.8: око/обличчя у «e»). Тобто ротація масок: ДВІР(велосипедист) → ІНТЕР'ЄР → ЗЕЛЕНЬ(рука+листя) → ОБЛИЧЧЯ. Кожен свап ≈2-3с, ease «air».
- **intro split-hover (T-414, підтверджено зондом):** курсор у лівій/правій половині свопить фон-варіант --1↔--2. Тобто маски реагують і на мишу, не лише на таймер.

**Чому це працює (для плагіна):** wordmark тут НЕ оверлей-логотип (T-211), а **knockout-маска з відеокаруселлю всередині** — назва бренду буквально стає «вікнами у життя». Малий факт-абзац + «LIVE HERE» дають вербальний якір. Header вже повний (MENU · Apartments · ♥ · Request a call-back · ⊞) — конверсія з кадру 1.

**Header (з'являється одразу, D_01 поз.5+):** зліва «menu»-pill + «Apartments»-pill + ⊞-іконка (selection-on-plan). По центру — лого «ever». Справа — ♥ (favourites) + «Request a call-back»-pill + ⊞/MM-іконка. Хедер themed: на беж-секціях темний текст, на slate — світлий (T-501 перефарбування хедера, A-18).

---

## Секції по порядку (кожна: прийом · доводчик-вхід · доводчик-вихід · theme)

### 01 · HERO (беж)
- **Прийом:** wordmark-knockout-маска з фото-каруселлю (новий T-ID, див. вище) + T-414 split-hover + T-201 факт-абзац + «LIVE HERE» reveal + ↓ scroll-cue (кругла беж-кнопка з ↓, D_01 поз.6).
- **Вхід:** preloader «e»→«ever» palette reveal.
- **Вихід:** scroll → беж-маска тоне, наступний акт.
- **Theme:** беж (із slate-проблиском у момент wordmark-перефарбування).

### 02 · ARCHITECTURE — «SIMPLE SHAPES, EXPRESSIVE FINISHES» (slate→беж)
> D_01 поз.7-9, D_02 поз.1-6. Таймкод ~14-30с.
- **Прийом:** act-заголовок «**ARCHITECTURE**» гігантською беж-капіталлю внизу кадру (T-305), що **виїжджає з-за/під фото** (фасад у круглій/овальній масці поряд). Праворуч стек-заголовок **«SIMPLE SHAPES, / EXPRESSIVE / FINISHES»** + абзац *«Modern, high-quality façades, shaped masonry, French balconies and spacious outdoor terraces…»*.
- **🔴 3D-кулі матеріалів:** біля тексту висять і **повільно обертаються** 3 сфери-зразки матеріалів: (1) **плетена/мушля-куля** біла (текстура «shaped masonry»), (2) **цегляна/клінкер сфера** теракотова, (3) клінкер-куля темніша. Входять із fade-zoom (scale 1.1→1, T-206) + continuous slow rotate. Рендеряться як WebGL/3D-об'єкти АБО pre-rendered turn-loop (зонд не підтвердив движок; для нас — turn-loop секвенція).
- **Овал-маски фото:** фасади показані в **овальних/еліптичних масках** (image-clip ellipse-grow, T-206), не прямокутниках — рима до knockout-літер hero. Цитата архітектора в овалі: *«NATURE HAS BECOME OUR INSPIRATION AND COLLABORATOR, FOR IT ALONE HAS CONTROL OVER THE CHANGING SEASONS…»* (CAPS-факт-абзац T-316).
- **Гігант-факт «34 FLOOR»** (D_02 поз.6): число «34» докручується (T-304), праворуч «FLOOR», нижче *«EVER IS THE ULTIMATE PRIVILEGE WHEN IT COMES TO THE VIEWS FROM ITS WINDOWS»*. Іконки «Apartments with accommodations» / «Covered gallery entrances».
- **«HIGH-QUALITY FACADE MATERIALS»** (D_02 поз.4) — цегляний фасад у круглій масці з ⊙-zoom-cursor хотспотом.
- **Доводчик-вхід:** slate-затемнення + act-слово виїжджає знизу (T-305) + овали ростуть.
- **Доводчик-вихід:** theme-flip slate→беж перед наступним актом.
- **Theme:** мікс — slate-секція з беж-вставками, кулі теракотові.

### 03 · INTERIOR — «AESTHETICS COMPLEMENT COMFORT» (slate↔беж, чергування)
> D_02 поз.4-9, D_03 поз.1-9, D_04 поз.1. Таймкод ~28-56с. Найдовший акт — багато підслайдів.
- **Прийом:** act-слово «**INTERIOR**» гігантською капіталлю внизу (T-305), театрально **частково перекрите фото-карткою** інтер'єру (лобі з декоративним металевим «дротяним» світильником-скульптурою). Зверху-зліва стек «**AESTHETICS / COMPLEMENT / COMFORT**».
- **Наскрізний декор-об'єкт:** хвилясту **дротяну люстру-скульптуру** (squiggle-light) видно на КІЛЬКОХ підслайдах поспіль — спільний елемент перетікає між кадрами (T-508), паралаксить з depth-offset (T-204).
- **Нумерована слайд-історія** інтер'єру: великі ghost-числа «**1**», «**2**», «**3**» (D_03 поз.2-9): кожен підслайд = кадр інтер'єру + ghost-цифра (T-216) + CAPS-теза. «Spacious entrance areas on her wears with high ceilings…» / «STYLISH AND SPACIOUS ENTRANCE AREAS ON TWO LEVELS» / «LIFTS FROM A LEADING EUROPEAN MANUFACTURER».
- **Гігант-факти що докручуються:** «**5,5**» HEIGHTS,M (висота стель) · «**60**» / «**2,5**» (D_03 поз.7: «ENTRANCE DOORS TO THE APARTMENTS ARE FITTED WITH CODED LOCKS») — counter count-up (T-304) на спеках.
- **Бренд-партнер:** «**HAAST**» (D_03 поз.8) — *«THE ENTRANCES AND COMMON AREAS ARE DESIGNED BY THE LEADING ARCHITECTURAL FIRM HAAST»* — лого-партнера на slate.
- **«+»-хотспоти** на фото інтер'єру (D_02 поз.7: круглі «+» біля сходів) — клік розкриває деталь/lightbox.
- **Доводчик-вхід:** act-слово виїжджає + фото-картка насуває поверх; theme slate.
- **Доводчик-вихід:** theme-flip у теплий беж перед TERRITORY (golden-hour кадр).
- **Theme:** переважно slate (темний інтер'єрний настрій), беж-вставки на спеках.

### 04 · TERRITORY — «CONTRAST OF ARCHITECTURE AND NATURE» (беж golden-hour)
> D_03 поз.9, D_04 поз.1-9. Таймкод ~52-72с.
- **Прийом:** golden-hour аерофото парку/двору full-bleed (T-101/T-121) + act-слово «**TERRITORY**» беж-капіталлю + стек «CONTRAST OF / ARCHITECTURE / AND NATURE» + ghost-число «**3**».
- **«SINGLE COURTYARD WITH BRIDGE OVER PEDESTRIAN-ONLY SHOPPING STREET»** (D_04 поз.2) — фото мосту в овал-масці + іконки-схеми (план двору лінійною графікою T-405). *«VERSATILE LANDSCAPING, URBAN BALCONIES, A NATURAL AMPHITHEATRE…»*
- **Доводчик-вхід:** з темного INTERIOR — різкий theme-flip у теплий золотий кадр (контраст світла = межа акту).
- **Theme:** беж/теплий золотий.

### 05 · HARMONY OF INTERESTS — триптих NATURE / SPORT / PLACE (slate→беж, з particle-overlay)
> D_04 поз.4-9, D_05 поз.1-9, D_06 поз.1-3. Таймкод ~66-96с.
- **Прийом:** **spread-row-подібний** триптих: ліва колонка-якір «**HARMONY / OF INTERESTS**» (фіксована), а праворуч повноекранні відео-кадри людей у природі з гігантськими вертикальними act-словами по правому краю: «**NATURE**» → «**SPORT**» → «**PLACE**».
- **«PLACE» rotated-вертикаллю** по правому краю (writing-mode) і ТРИМАЄТЬСЯ через багато кадрів (D_05 поз.1-9: «PLACE» вертикально стоїть, поки фон-відео людей у природі змінюється) — side-rail act-слово (рима до T-M10, але тут десктоп).
- **🍂 Falling-leaves particle overlay:** на блоках PLACE/NATURE поверх відео ПАДАЄ осіннє листя (помаранчеві частки летять згори-вниз, D_05 поз.5-9, D_06 поз.1-3) — particle-шар поверх медіа. Емоційний акцент сезону.
- **Відео-фони autoplay-in-view (T-103):** реальні відео людей (жінка в авто, пара, дівчинка біжить до тата, бігунка в парку) — кінематографічні, тепла колористика.
- **«ENJOY NATURE WITHOUT LEAVING THE CITY»** (D_05 поз.5+) — фото в круглій масці + факт-абзац *«5 minutes from Kaluzhskaya metro station… 30-40 minute walk… Voronovsky park…»*
- **Доводчик між NATURE→SPORT→PLACE:** crossfade відео-фону, act-слово свопиться, particle-листя наскрізне.
- **Theme:** slate (NATURE/SPORT темні) → беж (PLACE світліший, ENJOY-блок).

### 06 · INFRASTRUCTURE / LOCATION-MAP — «CITY CENTER OBRUCHEVA STR. VL. 23» (slate-зелений)
> D_06 поз.4-9, D_07 поз.1-3. Таймкод ~90-108с.
- **Прийом:** карта району (T-104/Google-Maps у оригіналі → наш inline-SVG) на темному slate-фоні, лінійна графіка доріг. Лейбл «**CITY CENTER / OBRUCHEVA STR. VL. 23**» + вертикальне «PLACE» по краю (естафета з попереднього акту, T-508).
- **🍂 Листя продовжується** поверх карти (наскрізний particle).
- **«ever»-пін** на карті (D_06 поз.4: пігулка «ever» = маркер ЖК) + POI-точки.
- **Route-кінетика (T-427) наживо:** «**Build a route**»-pill (D_06 поз.4+). Клік POI → «**/**»-іконка (старт), маршрут малюється, і **хвилини докручуються**: «**15**» minutes walk to Voronovsky Park → «**18**» minutes walk to Yugo-Zapadny Forest Park (D_06 поз.6-9, D_07 поз.1). Активний POI підсвічується, картка «N minutes walk to {назва}» + «Build a route».
- **Доводчик-вхід:** theme-flip беж(PLACE)→slate(map).
- **Theme:** темний slate-зелений.

### 07 · APARTMENTS-інтро — «READY-MADE SPACES FOR YOUR IDEAS» (світлий, near-white)
> D_07 поз.4-9, D_08 поз.1. Таймкод ~108-128с.
- **Прийом:** найсвітліша секція сайту — near-white. Act-слово «**APARTMENTS**» гігантом + стек «READY-MADE / SPACES / FOR YOUR IDEAS» + «+»-хотспот. **Велика овальна маска-сцена** інтер'єру з меблями (синій диван, телескоп, жовте крісло, ваза-мушля) — предметна композиція в овалі.
- **🔴 Бренд-3D-об'єкт:** біла **плетена ваза-мушля** (та сама фактура що архітектурні кулі) висить ліворуч від «APARTMENTS» — наскрізний об'єкт ідентичності (T-207). Зверху на нитці **чорний світильник** опускається в кадр.
- **Гігант-факти:** «**3**» / «**3,4-3,8**» (ceiling heights) · «**3,2**» HEIGHT OF WINDOWS,M (D_07 поз.4-5) — counter count-up на спеках планувань. «INCREASED HEIGHT OF CEILINGS AND WINDOWS», «French balconies / Spacious open verandas / Apartments with accommodations / Low windows sills».
- **CTA:** «**Choose an apartment**» (D_07 поз.7, кругла беж-кнопка в овалі) — місток у каталог.
- **Доводчик-вхід:** різкий theme-flip slate(map)→near-white — найяскравіша інверсія сайту.
- **Theme:** світлий/near-white (єдина така).

### 08 · NEWS & PROMOTIONS (slate) + ФУТЕР
> D_07 поз.8-9, D_08 поз.1-2. Таймкод ~124-134с.
- **Прийом:** «**NEWS , PROMOTIONS**» заголовок + 3-картковий ряд новин: кожна = дата (02:00 / 19:24 / 22:00) + заголовок + «+» + фото-прев'ю. *«Grass rustling and blooming gardens: a 3D tour…» / «Moving up: 5word high-speed elevators…» / «New stage of EVER construction: monolithic works…»*
- **ФУТЕР (D_07 поз.9):** гігантський wordmark «**ever ever ever**» що **горизонтально їде** (marquee) на slate + контакт «OBRUCHEVA STR. 23KZ / 13TH FLOOR» + «Plan a route»-pill + «Sales office Every day from 09:00–21:00» + телефон + Documents-лінк. Футер-як-секція (A-16) дзеркалить hero-wordmark.

### 09 · APARTMENTS dual-view (list↔plan↔card) — КОНВЕРСІЙНЕ ЯДРО
> Окрема секція нижче (детальний флоу).

### 10 · GALLERY (категорійна, numbered slides)
> D_11 поз.3-9, D_12 поз.1-9, D_13 поз.1-9. Таймкод ~198-238с.
- **Прийом:** категорійна повноекранна галерея з гігант-заголовком категорії беж-капіталлю + лічильником «/ N»: «**LANDSCAPING**» → «**ARCHITECTURE**» → «**COMMON AREAS**» (/8, numbered 1-8) → «**APARTMENT TERRACES**» (/3) → «**INFRASTRUCTURE**».
- **Numbered slides:** кожен слайд = full-bleed рендер + гігант-ghost-число «1…8» (T-216) + «+»-хотспоти + PREV/NEXT кругли стрілки. Пагінація «/ 8».
- **APARTMENT TERRACES (D_13):** penthouse-балкони golden-hour, людина в підвісному кріслі-куполі над містом — найемоційніші кадри. Numbered 1-2-3, «/ 3».
- **INFRASTRUCTURE-слайд (D_14):** «**PALETTE WILL TAKE YOU AWAY FROM THE CITY FOR A WHILE — TO A PLACE WHERE IT'S EASY TO DRAW ON NEW ENERGY»** + **🔴 чорна 3D-сфера** (floating brand-object) що паралаксить окремо + ghost-«1» + icon-pills (Natural amphitheatre…). Crossfade фону між кадрами парку, сфера тримається.
- **Theme:** переважно slate (галерея темна, фото яскраві).

### 11 · TERRITORY deep-dive — PLAYFUL / SPORTS / SHOPPING (беж↔slate)
> D_15 поз.1-9. Таймкод ~252-264с.
- **Прийом:** ще один наратив-прохід території. «**PLAYFUL**» (дитячі майданчики, ⊙-3D-кулі деко) → «**SPORTS**» (вертикальне side-rail слово, ping-pong **ракетка+кулька як деко-об'єкти** що паралаксять, T-204) → «**SHOPPING**» (full-bleed «BAKERY» вуличка, dutch-district копі).
- **«EVER MAKES UP FOR THE LACK OF COMMUNICATION WITH NATURE»** (D_15 поз.5-6) — факт-абзац + фото в круглій масці + «+».
- **«FITNESS EQUIPMENT THAT LOOKS MORE LIKE SCULPTURES THAN SPORTING ITEMS»** (D_15 поз.8).
- **Theme:** беж (PLAYFUL) → slate (SPORTS/SHOPPING).

---

## Конверсійний флоу A-15 dual-view (список↔план↔картка↔reserve, у русі)

> D_07 поз.9 → D_08 (повний) → D_09 (повний) → D_10 поз.1-6. Це канон A-15, тепер у динаміці.

**Точка входу:** «Choose an apartment» (з APARTMENTS-інтро) АБО хедер «Apartments»-pill АБО «Selection on plan» (⊞).

**Стан 1 — LIST (`/flats`, near-white таблиця):**
- Заголовок «**APARTMENTS**» теракотою + лічильник «**212 option**» беж-цифрою (D_08 поз.3) — counter count-up.
- Таблиця-колонки: **Plan · Area · Rooms · Room · Housing · Floor · Features · Price**. Кожен рядок: міні-іконка плану ▸ «24.8 M²» · «1C» · «№ 12» · «5» · «2» · (features-іконки) · «8 258 400 ₽».
- Рядки: «30.6 M² · 1C · № 259 · … · 14 440 140 ₽», «29.3 M² · 1C · № 48 · 3 · 6 · 🔒 · 15 285 810 ₽» (🔒 = reserved-стан), «29.3 M² · 1C · № 246 · … · 16 050 540 ₽», «42.4 M² · 2E · № 265 · … · 17 066 000 ₽».
- **Плаваюча чорна «Filters»-пігулка** (D_08 поз.3,6) — sticky внизу таблиці, відкриває фільтр-панель (chips + range-slider ціни/площі/поверху + ajax live-count «212 option» оновлюється, T-409).
- Toggle угорі: «**Selection on plan**» ↔ list (selector__link, тримає фільтр-state, A-15).

**Page-transition LIST → CARD (`modal-in`, T-522):**
- Клік рядка → нова сторінка `/flat/{code}` **в'їжджає МОДАЛКОЮ** (затемнення позаду D_08 поз.4-5: видно темну вуаль і картку що насувається). Не reload — Barba ajax-page-transition «modal-in».

**Стан 2 — UNIT CARD (`/flat/EV-3-3-279`, dual-panel):**
- **Ліва панель (slate/темна):** «**1C**» великим · «3 housing / 27 floor» · «**29.3 M²**» · «**16 126 720 ₽**» теракотою. Внизу: «**Reserve**»-кнопка (темна пігулка) + «**Similar apartments**»-стрілка. ♥-favourite угорі. **🔴 Біла плетена 3D-мушля** висить у лівій панелі (наскрізний бренд-об'єкт T-207, рима до hero/architecture/apartments).
- **Права панель (крем/світла):** **план квартири «чорнилом»** — тонко-лінійне ink-планування (T-104 SVG) + позначки «↗ Architect Plan», «↘ Furniture». **Перемикач-pill зверху: «Window's view» ↔ «White box»** (T-410 tabs).
  - «**Window's view**» — рендер виду з вікна.
  - «**White box**» (D_08 поз.6, D_09 поз.2): клік → права панель **свопить контент** (image-clip-in T-206) на рендер «білої коробки» — порожня квартира з вікном у круглій масці + текст *«A CONVENIENT OPTION, ESPECIALLY FOR THOSE WHO WANT TO QUICKLY MOVE ON TO ENJOYING THINGS LIKE CHOOSING THE COLOUR OF THE WALLPAPER OR CURTAINS WHEN THEY RECEIVE THE KEYS.»*
- **Спеки-accordion (D_09 поз.1-3):** скрол картки вниз → розкривні рядки: **FLOOR FINISHING · CEILING FINISH · WALL FINISHING · POWER SUPPLY · WATER SUPPLY · DOORS · METERS · VENTILATION · HEATING**. Кожен accordion-рядок (T-417) з ⊕/⊖, розкриває технічний абзац (*«Inner walls and partition made of monolithic reinforced concrete…»*, *«Whitebox energy meters are located in the hallway…»*, *«Radiators for heating. All radiators in apartments with W2 are equipped with thermostatic valves…»*).
- **«Reserve» (D_09 поз.4):** клік → ✗-стан/форма (D_09 поз.4: червоний ✗ + 📄-іконка) — резерв-модалка/форма (T-411, currentPageLink = код юніту).

**Page-transition CARD → LIST (FLIP-назад, T-428):**
- «**← Back to the apartments**»-pill (D_09 поз.5) → повернення у список, картка з'їжджає, рядок на місці (FLIP first/last).

**Стан 3 — VISUAL-SEARCH / EVER PLAN (`/visual-search`, 3-рівневий дріл, A-03):**
> D_10 поз.1-9. Альтернативний вхід «Selection on plan».
- **Рівень 1 — EVER PLAN:** заголовок «**EVER PLAN**» беж + **3D-ізометрія всього кварталу** (рендер 6 веж згори-збоку) на slate. Піни «**Housing 1…Housing 6**» (попавери T-406) над вежами. Клік пін → попавер «**apartment starting from 1{X}1 mln. ₽ / Completion III кв. 2026**». POI навколо (Educational/Shopping centre/Forest з км).
- **Рівень 2 — HOUSING 1:** заголовок «**HOUSING 1**» + «← Back to plan» + фасад однієї вежі (фото-рендер). **Ховер поверху → беж-плита «{N} FLOOR»** (T-115/T-407): «**22 FLOOR — Apartments not on sale**», «**8 FLOOR — Apartments not on sale**», «**28 FLOOR**» (розкриває список: «2 apartment starting from 26.3 mln», «1 apartment starting from 27.2 mln»…), «**34 FLOOR — 2 apartment starting from 37 mln**». Плита-картка слідує за курсором/поверхом.
- **Рівень 3:** клік поверх/квартиру → `/flat/{code}` card (modal-in, той самий Стан 2). Естафета через flash-перехід (T-530).
- Loader-спінер (D_10 поз.2-4: ◌ кружок) під час ajax-дріла.

**Меню-оверлей (A-17):**
> D_10 поз.7-9, D_11 поз.1-2. Клік «menu».
- Повноекранний slate-оверлей. Нумероване/просте меню великими пунктами: «**ABOUT · PLACE · TERRITORY · GALLERY · HOW TO BUY**» + дрібний під-список «VIEWS · CONSTRUCTION PROGRESS · DEVELOPER · NEWS AND PROMOTIONS · DOCUMENTS · CONTACTS».
- Праворуч **2 CTA-плитки:** «**Choose an apartment**» (беж-плитка з 3D-лавкою-об'єктом) + «**Choose a car park and storage room**» (плитка з 3D-авто-об'єктом). Конверсійні плитки вибору юніту у меню (рима до A-17 AIR).
- Ховер пункту → перефарбування слова (теракота-акцент).

---

## Page-transitions / доводчики (як саме шиються)

| Подія | Прийом | Деталь руху |
|---|---|---|
| **Завантаження сайту** | preloader «e»→«ever» palette-reveal (T-526) | беж-поле, монограма «e» контуром → розкривається у «ever» → перефарбування slate→беж, осідає в hero |
| **Hero маски** | knockout-карусель за wordmark (новий T-ID) | фото за літерами крос-фейдять кожні ~2-3с: двір→інтер'єр→зелень→обличчя; + split-hover --1/--2 від курсору |
| **Між актами** | **theme-flip (T-501) як головний доводчик** | майже кожен акт = інверсія беж↔slate; різкий стрибок світла = межа. Ever НЕ покладається на push-over — світло несе ритм |
| **act-слово вхід** | T-305 виїзд з-під фото | гігант-капіталь виїжджає знизу/з-за медіа-маски, овершут-settle |
| **спільний об'єкт** | T-508 перетікання | дротяна люстра (INTERIOR), плетена мушля (architecture→apartments→card), вертикальне act-слово (PLACE→map) тримаються крізь кадри |
| **particle** | falling-leaves overlay | помаранчеве листя падає поверх PLACE/NATURE/map — наскрізний сезонний шар |
| **list → card** | **modal-in (T-522)** | сторінка `/flat/{code}` в'їжджає модалкою поверх затемненого списку; Barba ajax, без reload |
| **card → list** | FLIP-назад (T-428) | «← Back» — картка з'їжджає, рядок списку на місці |
| **visual-search дріл** | flash-перехід (T-530) + ajax-loader | EVER PLAN → HOUSING N → floor → flat; між рівнями короткий перехід + ◌-спінер |
| **toggle list↔plan** | selector__link (A-15) | зберігає фільтр-state; перемикає датасет між /flats і /visual-search |
| **Window's↔White box** | tabs image-clip-in (T-410/T-206) | права панель картки свопить рендер inset-wipe'ом |
| **counter-факти** | count-up (T-304) на reveal | 34, 212, 5,5, 3,2, 60, хвилини маршруту 15→18 — докручуються при вході в в'юпорт |
| **footer wordmark** | horizontal marquee (T-114-подібне) | «ever ever ever» їде горизонтально на slate, дзеркало hero |

---

## Копі

**Тон:** бізнес-клас, стримано-поетичний, англ-версія (оригінал рос). Без вигуків і гейм-сленгу (повна протилежність нашому quadro/smarts). Речення-сентенції, often CAPS-абзацами. Природа vs архітектура — наскрізна тема.

**Act-слова (іменники-розділювачі, T-305):** ARCHITECTURE · INTERIOR · TERRITORY · NATURE · SPORT · PLACE · APARTMENTS · INFRASTRUCTURE · PLAYFUL · SPORTS · SHOPPING · LANDSCAPING · COMMON AREAS · APARTMENT TERRACES. → Іменник-стан / іменник-місце (за каноном _GRAMMAR: Ever тяжіє до однослівних номінативів).

**Hero / маніфест:**
- «**LIVE HERE**» (hero-рефрен)
- «The composition of the landscape is built on the contrast of architecture and nature, which do not oppose each other, but rather coexist harmoniously.»
- «PALETTE WILL TAKE YOU AWAY FROM THE CITY FOR A WHILE — TO A PLACE WHERE IT'S EASY TO DRAW ON NEW ENERGY» *(зверни увагу: оригінал використовує em-dash — НАШ бан лишається, у власних білдах не копіюємо)*

**Архітектура (CAPS-факт-абзаци):**
- «SIMPLE SHAPES, EXPRESSIVE FINISHES»
- «NATURE HAS BECOME OUR INSPIRATION AND COLLABORATOR, FOR IT ALONE HAS CONTROL OVER THE CHANGING SEASONS, THE LIFE OF PLANTS AND THE COLOURING OF THEIR LEAVES.»
- «THE FACADES ARE INDIVIDUAL FOR EACH TOWER, BUT THEY FOLLOW THE SAME CONCEPT: UNIFORM MASONRY, INDIVIDUALLY DESIGNED GLAZED BRICKS, PORCELAIN STONEWARE»
- «EVER IS THE ULTIMATE PRIVILEGE WHEN IT COMES TO THE VIEWS FROM ITS WINDOWS» (під «34 FLOOR»)

**Інтер'єр / спеки:** «AESTHETICS COMPLEMENT COMFORT» · «STYLISH AND SPACIOUS ENTRANCE AREAS ON TWO LEVELS» · «LIFTS FROM A LEADING EUROPEAN MANUFACTURER» · «THE ENTRANCES AND COMMON AREAS ARE DESIGNED BY THE LEADING ARCHITECTURAL FIRM HAAST» · «ENTRANCE DOORS TO THE APARTMENTS ARE FITTED WITH CODED LOCKS».

**Локація / природа:** «ENJOY NATURE WITHOUT LEAVING THE CITY» · «EVER MAKES UP FOR THE LACK OF COMMUNICATION WITH NATURE» · «5 minutes from Kaluzhskaya metro station…».

**Apartments-каталог мікрокопі:**
- Інтро: «READY-MADE SPACES FOR YOUR IDEAS» · «Functional layouts and rare formats: master bedrooms with their own walk-in wardrobes and bathrooms, flat combinations, spacious terraces, French balconies, apartments with accommodations.»
- Картка-юніт: «1C» (тип) · «29.3 M²» · «16 126 720 ₽» · «3 housing / 27 floor» · «Window's view» / «White box» / «Reserve» / «Similar apartments» / «← Back to the apartments».
- White-box: «A CONVENIENT OPTION, ESPECIALLY FOR THOSE WHO WANT TO QUICKLY MOVE ON TO ENJOYING THINGS LIKE CHOOSING THE COLOUR OF THE WALLPAPER OR CURTAINS WHEN THEY RECEIVE THE KEYS.»
- Спек-accordion: FLOOR FINISHING / CEILING FINISH / WALL FINISHING / POWER SUPPLY / WATER SUPPLY / DOORS / METERS / VENTILATION / HEATING.
- Таблиця-колонки: Plan / Area / Rooms / Room / Housing / Floor / Features / Price. Лічильник «212 option».
- Visual-search: «EVER PLAN» / «Housing 1-6» / «{N} FLOOR — Apartments not on sale» / «{N} apartment starting from {X} mln. ₽» / «Completion III кв. 2026».

**Хедер/конверсія:** MENU · Apartments · Selection on plan · ♥ · Request a call-back · Plan a route · Choose an apartment · Choose a car park and storage room.

**Копі-урок для плагіна:** Ever доводить, що бізнес-клас можна вести БЕЗ жодної емоційної гри слів — самі **однослівні act-номінативи + сухі CAPS-факти з цифрою** + одна поетична рамка («LIVE HERE» / «PALETTE WILL TAKE YOU AWAY»). Це протилежний полюс до нашого quadro-тону; для дорогих об'єктів — еталон стриманості. (Em-dash в оригіналі є — наш бан на нього у власних білдах НЕ скасовується.)

---

## T-ID кандидати (нові прийоми В РУСІ, яких не було в статиці)

> ВНЕСЕНО в _REGISTRY_TID 2026-06-13. Номери: L2→T-218/T-219, L3→T-320/T-321, L4→T-431, L6→T-M13…T-M16.

### 🆕 T-218 · wordmark-knockout фото-карусель (СИГНАТУРА Ever) — L2 MEDIA-OVERLAY
**Суть:** гігантський wordmark бренду = НЕ оверлей-текст (то T-211) і НЕ просто маска одного фото. Це **knockout-виріз у суцільній бренд-панелі**, крізь контури літер видно фото-фон, і фото за літерами **крос-фейдять каруселлю** (двір→інтер'єр→зелень→обличчя, ~2-3с/кадр, ease air) + split-hover свопить варіант від курсору. Літери бренду буквально стають «вікнами у життя».
**Джерело:** EVR(v) hero. **$:** M. **Комбінується з:** T-211, T-414, T-201, T-301 («LIVE HERE» reveal), T-103 (відео в масці).
**no-WebGL:** ✅ повністю CSS/DOM — `background-clip:text` АБО SVG `<text>` як `<mask>`/`<clipPath>` над фото-каруселлю; карусель = крос-фейд `<img>` з IntersectionObserver-таймером; split-hover = свап двох фото-шарів за mouse-X. WebGL не потрібен.

### 🆕 T-219 · particle-overlay сезонний (falling-leaves) — L2 MEDIA-OVERLAY
**Суть:** шар часток (осіннє листя) повільно падає ПОВЕРХ відео/фото lifestyle-актів — наскрізний сезонний емоційний акцент, тримається крізь кілька секцій (PLACE→NATURE→map).
**Джерело:** EVR(v) HARMONY/PLACE/map. **$:** S. **Комбінується з:** T-103, T-101, T-508.
**no-WebGL:** ✅ canvas-2D particle АБО кілька PNG-листків з CSS-keyframe translateY+rotate+drift; rAF-gated через precisescroll. Економно: 8-15 часток.

### 🆕 T-320 · act-слово як вертикальний side-rail (десктоп) — L3 TEXT-CHOREO
**Суть:** act-слово (PLACE/SPORTS) поставлене ВЕРТИКАЛЬНО (writing-mode/rotate) по правому/лівому краю в'юпорта і ТРИМАЄТЬСЯ закріпленим, поки фон-медіа під ним крос-фейдить кілька кадрів. Десктопний родич мобільного T-M10, але як драматургічний якір акту, не економія місця.
**Джерело:** EVR(v) HARMONY-триптих, TERRITORY-deep. **$:** S. **Комбінується з:** T-305, T-103, T-508, T-501.
**no-WebGL:** ✅ `writing-mode:vertical-rl` / `rotate(90deg)` + sticky.

### 🆕 T-321 · гігант-факт із counter на спец-розділювачі — L3 (розширення T-304+T-422)
**Суть:** велике число-спека (34 FLOOR · 5,5 m · 3,2 m · 60 · 2,5 · 212 option) докручується count-up при вході, стоїть як міні-акт між наративними кадрами, з підписом-одиницею і факт-абзацом. Ever робить це СИСТЕМНО (≈6 ужитків) — не разовий ефект як T-422(AIR).
**Рішення:** НЕ новий T-ID — це **T-304 + T-422 у системному застосуванні**. Внести у дельти як підтвердження на 2-му сайті + позначку «системний, не разовий».
**no-WebGL:** ✅ (T-304 вже ✅).

### 🆕 T-431 · «White box / Furnished» перемикач рендеру в картці юніту — L4 MICRO
**Суть:** у картці квартири pill-перемикач свопить ПРАВУ панель між «Window's view» (мебльований рендер виду) і «White box» (порожня біла квартира + пояснення-копі) через image-clip-in. Дає покупцеві обидва ментальні режими (готове vs чистий аркуш).
**Джерело:** EVR(v) /flat. **$:** S. **Комбінується з:** T-410, T-206, A-13.
**no-WebGL:** ✅ tabs + clip-reveal двох зображень.

### 🔴 (вже в реєстрі, підтверджено рухом) 3D-кулі матеріалів / бренд-мушля
Architecture-сфери (мушля/цегла/клінкер) + наскрізна біла плетена ваза-мушля = **T-208 (матеріал-як-3D) + T-207 (бренд-3D наскрізний)**, тепер підтверджено на Ever. Оригінал ймовірно WebGL/3D → наш переклад: **pre-rendered turn-loop секвенція** (canvas-2D crossfade ракурсів), як вердикт quadro-phase5/SP-Zeus. Чорна сфера в INFRASTRUCTURE = той самий T-207.

---

## Дельти для реєстру (уточнити рухом / доповнити архетипи)

**Уточнити наявні T-ID (додати Ever(v) як підтвердження руху):**
- **T-414 (intro split-hover)** — підтверджено наживо: курсор ліво/право свопить hero-маску --1↔--2, у комбінації з knockout-каруселлю (T-218). Було «EVR · REG §7» зі статики → тепер з рухом.
- **T-501 (theme-flip)** — **апгрейд ролі:** на Ever це НЕ просто per-section swap, а **головний доводчик меж між актами** (майже кожен акт = інверсія беж↔slate). Додати примітку: «на Ever theme-flip несе ритм актів замість push-over; для dark-heavy сайтів — основний seam». Палітра-полюси: теплий беж `#c89878`-ish ↔ slate-зелений `#2e3a36`-ish.
- **T-522 (modal-in page-transition)** — підтверджено наживо: list→card `/flat/{code}` в'їжджає модалкою поверх затемненого списку. Було зі статики → тепер видно рух.
- **T-526 (preloader palette-cycle)** — підтверджено: «e»→«ever» з перефарбуванням slate→беж осідає в hero.
- **T-304 (counter count-up)** — системне підтвердження (34/5,5/3,2/60/212/маршрут-хвилини); поряд із T-422 позначити «Ever = системний ужиток ×6».
- **T-427 (маршрут-кінетика)** — підтверджено на 2-му сайті (після AIR): «Build a route» → хвилини 15→18 докручуються, POI підсвічується. Зміцнює прийом (тепер AIR+Ever).
- **T-410 (tabs)** — підтверджено: «Window's view / White box» swap + спек-accordion (T-417) у картці.
- **T-508 (спільний елемент перетікає)** — багаті приклади наживо: дротяна люстра (INTERIOR), плетена мушля (architecture→apartments→card), вертикальне act-слово (PLACE→map). Зміцнити.
- **T-114 (horizontal-takeover)** — footer-wordmark «ever ever ever» horizontal marquee = легкий ужиток (поряд із progress-timeline).

**Доповнити архетипи (A-xx):**
- **A-01 (hero):** додати варіант входу «**wordmark-knockout фото-карусель (T-218)**» — найсильніший hero-прийом Ever, поряд із T-311/T-211/T-507.
- **A-03 (visual-search):** Ever-розширення підтверджено рухом — **EVER PLAN = 3D-ізометрія кварталу з пінами Housing 1-6 (попавери «from X mln»)** → **HOUSING N = фасад вежі + ховер-плита «{N} FLOOR» з лічильником квартир/«not on sale»** → flat-card (modal-in). + ◌-loader на ajax-дрілі, flash-перехід (T-530).
- **A-13 / A-15 (units-картка / dual-view):** додати **T-431 «Window's view / White box» перемикач** + спек-accordion 9 рядків (FLOOR/CEILING/WALL/POWER/WATER/DOORS/METERS/VENTILATION/HEATING) + наскрізну 3D-мушлю в лівій панелі. Таблиця-колонки канон: Plan/Area/Rooms/Room/Housing/Floor/Features/Price + «N option» count-up.
- **A-17 (меню-оверлей):** Ever-варіант = нумероване меню великими пунктами (ABOUT/PLACE/TERRITORY/GALLERY/HOW TO BUY) + **2 CTA-плитки з 3D-об'єктами** (Choose an apartment / Choose a car park) + під-список службових + контакт-дзеркало. Рима до AIR-варіанту.
- **A-19 (категорійна галерея):** Ever-канон = гігант-заголовок-категорія беж-капіталлю + numbered slides (ghost-число 1…8) + «/N» лічильник + «+»-хотспоти + floating brand-object на INFRASTRUCTURE-слайді (T-207).
- **A-16 (футер):** Ever = horizontal-marquee «ever ever ever» (T-114) + контакт/години/Plan a route + Documents — дзеркало hero-wordmark.

**Закриття діри покриття:**
- Реєстр §«Бідні зони» п.1 «**Ever наживо — 0 відео**» → **ЗАКРИТО 2026-06-13** цим тірдауном. Ever тепер: 14 статичних T-ID + рух (theme-ритм як доводчик, hero-knockout механіка, A-15/A-03 у динаміці, modal-in/flash переходи) + 4 нові кандидати (T-218 wordmark-knockout, T-219 particle-leaves, T-220 vertical-side-rail-act, T-431 White-box-toggle).
- Рядок покриття Ever: первинних T-ID 14 → **+4 кандидати (T-218, T-219, T-220, T-431) = 18** після внесення.

---

## EVER MOBILE
> 16 контактних аркушів 3×3 @fps=1, iPhone 1170×2532 portrait. Таймкод = N×9с + позиція. Ever ПІДТВЕРДЖУЄ 9/12 T-M і додає 4 нові (T-M13…T-M16).

### Мобільний hero (як працює wordmark-as-mask на портреті)
Сигнатура (літери «ever» = маски-вікна у фото) на 390px НЕ зникає і НЕ біжить marquee — збирається з horizontal-marquee прелоадера у фіксований stacked-hero:
- t≈0–3с: прелоадер. Гігантський тонкий outline «ever ever e…» їде горизонтально справа-наліво по split-фону (графіт #33414d ‖ теракот #b08d77) — десктоп T-414 split, на моб автопрокручується.
- t≈3с: hero сідає. Верхні ~60% — фото (людина на газоні з велосипедом, top-down). Гігант «ever» (~96-120pt) НИЖЧЕ, контури літер прорізані як вікна у ДРУГЕ фото (теракот-фасад крізь літери) — mask 1:1. Круглий `+` хотспот у ніжці першої «e».
- «LIVE / HERE» 2 рядки ~22pt ліво-низ; `↓` у крузі право-низ.
- Hero = КАРУСЕЛЬ фонів: верхнє фото свапається (газон→фасад→двір-фонтан→рука-виноград→портрет), нижнє фото-в-літерах свапається СИНХРОННО, фон-band циклить колір (графіт→бордо→зелений) = T-526 у hero.
- scrim-абзац-рефрен тягнеться хвостом крізь кожен hero-кадр: «The composition of the landscape is built on the contrast of architecture and nature…».

### Desktop→Mobile (ключове)
| прийом | десктоп | мобільний | механіка |
|---|---|---|---|
| wordmark-mask hero | knockout-карусель за курсором | dual-photo anchor-стек, обидва шари свапаються синхрон + bg palette-cycle | T-M13 |
| act-слова | гігант на канві | bleed-обрізані + «прокатуються» партіями по вертикалі (ARCHIT…→…ECTURE) | T-M12/T-M16 |
| переходи актів | theme-ритм slate↔беж | crossfade + scale-creep + palette-cycle 5 темо-зон | T-M05/T-M07 |
| карта-локація | Google Maps + hover | бордова мінімал-карта + нижня док-плашка ГІГАНТ-числом хвилин (7→18) + tap-‹› | T-M14 |
| попавери (facade/news/POI) | Floating-UI triangle-tooltip | full-card / slide-up bottom-sheet з ✕ | T-M15 |
| before/after (T-412) | slide за курсором | вертикальний хендл, touch-drag | 1:1 touch |
| apartments список | таблиця-колонки | СТЕК карток (міні-план + 1C/24.8M²/5 Housing·2 Floor/ціна + ♥), sold=замок | T-M03+T-408 |
| filters | бічна панель | плаваюча чорна pill «Filters» центр-низ (T-419 sticky) | T-M08 |
| меню | оверлей | full-screen dark stack + 2 CTA-плитки зверху (Choose apartment / Car park) | T-M11+A-17 |
| галерея | pinned scroll-gallery | lightbox: фото + гігант-номер «N/6» + прогрес-лінія + ↓/✕, вільний свайп | A-19+T-112 |

### Підтвердження L6
ПІДТВЕРДЖЕНО сильно: T-M02(split-гілка)/M03/M05/M07/M08/M09/M11/M12. Частково: M04/M06. НЕ ужиті (немає в дизайні Ever): T-M01(spread-row), T-M10(side-rail на моб — але є вертикальний act-word на ДЕСКТОПІ, див. T-320).

### Конверсійний флоу — НУЛЬ редукції
list/plan dual-view (A-15), favourites (T-408), filters (T-419 sticky-pill), before/after (T-412), POI-routing (A-04 числом-док), категорійна галерея-lightbox (A-19), menu-as-conversion (T-M11) — УСІ присутні, лише перекладені tap+sheet+stack. Найсильніше живе підтвердження: award-рівень = ПЕРЕКЛАД, не редукція.

### Копі
Акти: LIVE HERE · ARCHITECTURE · SIMPLE SHAPES EXPRESSIVE FINISHES · INTERIOR · AESTHETICS COMPLEMENT COMFORT · TERRITORY · HARMONY OF INTERESTS · NATURE/PLAY/SPORT · LOCATION · APARTMENTS · READY-MADE SPACES FOR YOUR IDEAS. Числа-факти: 34 FLOOR, 6 HECTARES, 7/18 minutes walk, 212 option. CTA тихі ghost-pill: View on the map · Build a route · Choose an apartment · Show more · Filters. Co-brand: HAAST (entrances), GMA Architects (founder). Адреса OBRUCHEVA STR. 23, 09:00-21:00, VK.

### T-M кандидати (нові з Ever)
- T-M13 hero-wordmark = свапаючий dual-photo anchor: mask-wordmark = anchor стека [фото/літери-маска-фото/LIVE HERE/scrim], обидва фото-шари свапаються синхрон + bg palette-cycle; прелоадер marquee→fixed-stack. no-WebGL ✓ (background-clip:text + crossfade + scroll-bg-color). Поверх T-211/T-526/T-M02.
- T-M14 POI-карусель числом-док: карта + нижня док-плашка з ГІГАНТ-числом хвилин (count-up) + tap-‹› гортає POI по одному; пін бренд-пілюлею. no-WebGL ✓ (counter + inline-SVG карта). Поверх T-104/T-304/T-419/T-M08.
- T-M15 попавер→bottom-sheet з ✕: десктоп tooltip→full-card/slide-up sheet з ✕ (без трикутника), фото-овал+CAPS+іконо-сітка; стосується facade/news/POI. no-WebGL ✓ (fixed sheet + translateY + backdrop-close). Поверх T-406/T-522/T-M09.
- T-M16 bleed act-word «прокатка»: акт-слово ширше за порт показує РІЗНІ фрагменти в сусідніх скрол-кадрах (вертикальна прокатка як кінотитр). no-WebGL ✓ (font-size>100vw + translateY scroll-keyframe). Поверх T-305/T-M12.
