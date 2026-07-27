# VI_DNA_MASTER — ДНК-досьє всіх 19 проєктів Vide Infra
> Зібрано 2026-06-10 з: **19 анкет vi-dataset** (живі зонди curl / Wayback / case-pages; victory-park.md долито останнім — зʼявився під час збірки) + 5 глибоких архітектур big-5 (D_ERA/AIR/Ever/Springs/SilverPinewood_architecture) + системних PB_visual_search і PB_site_architecture.
> Правило: факти ТІЛЬКИ з джерел; де даних нема — «n/a».
> ⚠️ K24 Residence = Composition No.24 (один сайт, доведено зондом) — у таблицях K24 позначено «= comp-24», у статистиці прийомів рахувати ЯК ОДИН сайт.

**Порядок у всіх таблицях і главах:** big-5 живі (ERA · AIR · EVER · SPRINGS · SILVER PINEWOOD) → живі інші (AZURE · ENITEO · POKLONNAYA 9) → мертві з повними сирцями (COMPOSITION NO.24 · K24 · KHLEBNY · LEVEL · LOFTEC · NEVA TOWERS) → мертві case-page-only (REPUBLIC · ASTRIS · FAIRY FOREST) → JAYASOM (Wayback, не-нерухомість) → VICTORY PARK (live geo-blocked, Wayback-сирці; долито останнім).

---

# ЧАСТИНА 1 — НАСКРІЗНІ ДНК-ТАБЛИЦІ

## T1 · Типографіка

| Сайт | Display font | Ваги в ділі | H1 розмір (точно) | lh | ls | Case | Body font / розмір | H1:body |
|---|---|---|---|---|---|---|---|---|
| **ERA** | Decart Regular (RU-сабсет, без укр ЄІЇҐ) | 400 (Decart) · 500/700 (Gilroy) | calc(--scale-text-rem×35.5) = **355px** @xxxxl → 257 → 171 → 85 моб | 1.118→1.012em | −0.02/−0.03em | uppercase всі заголовки + captions | Gilroy 500 / 18→12px, lowercase | **≈19.7:1** (рекорд) |
| **AIR** | Onest (= body, ОДНА родина, TTF) | 400/500/600 | ×11.3 = **113px** → 42 моб | 0.973em | −0.04em | **ВСЕ uppercase, навіть body** | Onest 500 / 14px UPPERCASE | ≈8:1 |
| **EVER** | ITC Avant Garde Gothic (= body, одна родина) | 400/500 | **160px** (16rem) → 270px на великих; .text--h0 **324→513px** | 1em; h0 **0.494em** | −0.04em | h1–h5 uppercase глобально | та сама / 14px lowercase | 11.4:1 (з h0 до 36:1) |
| **SPRINGS** | Victor Serif 40 Regular (серіф!) | 400 (серіф+body) · 500/700 (TT Commons) | hero .g1 ×26 = **260px** → 60 моб; робочий H1 ×10 = 100px | .g1 **0.615em**; H1 0.9–0.95em | −0.02em | **lowercase-інверсія** (капс лише caption 12px ls .08em) | TT Commons Pro 400 / 20→16px | 13:1 hero (5:1 робочий) |
| **SILVER PINEWOOD** | TT Fors Medium — **1 шрифт × 1 вага на ВСЕ** | лише 500 | ×17 = **170px** → 30 моб | 0.88–0.94em | **−0.06em** (найщільніший) | ВСЕ uppercase; ієрархія тільки розміром | TT Fors / 16px UPPERCASE ls +0.04em | 10.6:1 |
| **AZURE** | AZURESans Medium (кастом-бренд; кирилиці нема) | 400/500 + TT Jenevers Light Italic (як italic всередині родини) | fluid 11rem→17.6rem = **110→176px** | 0.909em | −0.04em | sentence-case (1 правило капсу) | AZURESans 400 / 12→16px | 11:1 |
| **ENITEO** | Axiforma (єдина родина) | 300/400/500 | 3.35→18.9rem = **до 189px** | 0.899–1.19em | −0.02→−0.04em (більший = тісніше) | lowercase, капс ×1 («тихий» люкс) | Axiforma / 11→15px ls .04em | 12.6:1 |
| **POKLONNAYA 9** | Neutraface Condensed Custom 500 | 500 (Neutraface) · 400/500 (Futura PT) | 11.7×--scale-rem ≈ **117px** | 1.026–1.034em | **+0.04–0.05em** (розріджений, не стиснутий) | заголовки НАБРАНІ капсом у контенті | Futura PT Book / 12→18px, **ls .1em** | 6.5:1 |
| **COMPOSITION №24** | Karloff Negative Bold (Typotheque) | 700 (display) · 300/400/500 (Euclid Flex) | 5.6→8.4→**14.1rem ≈141px** | 0.92 | −0.02em | sentence; .h2-lg uppercase (18 правил) | Euclid Flex / 13→16px | 8.8:1 |
| **K24** | = comp-24 (той самий сайт) | = | = | = | = | = | = | = |
| **KHLEBNY** | Ristretto Slab Pro Regular | 400 (+ Maiola Bold зрідка) | 10rem → .h1-large 12→**18rem ≈180px** | 0.89–0.9em | 0 (лейбли .12em) | sentence (капс лише 9 правил) | **Maiola Pro serif** / 16px (сериф-тіло!) | ≈11:1 |
| **LEVEL** | Circe (Paratype; 100–800 у файлах) | **200** заголовки + 600 капс-лейбли | H1–H5 = **36px** lh 24px; display-цифри 76px (планувальник) | 24px (lh<1) | n/a | sentence + 11px UPPERCASE-лейбл усередині хедінга | Circe / 13px uppercase (.secondary) | ≈2.8:1 (велике лише в цифрах) |
| **LOFTEC** | Graphik Web / GraphikLC (одна родина) | **100/200**/300/400 (надлегкі) | 2.8→4→6→**7rem ≈70px** | 1.25–1.5em | 0 | мінімум (3 правила) — ієрархія вагою | Graphik / 13px lh 2em | 5.4:1 |
| **NEVA TOWERS** | RobotoCondensed (self-hosted TTF) | 300/400/500/600 | 4.8→**12rem ≈120px** | **0.83em** | .05em (h1-small) | лейбли uppercase (21 правило) | RobotoCondensed 300 / 16px | 7.5:1 |
| **REPUBLIC** | n/a (кейс: «Bold typography», «large typography») | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| **ASTRIS** | висококонтрастна антиква, ім'я n/a (лого з зіркою-діамантом) | n/a | n/a | n/a | широкий трекінг на дрібному | дрібне ВСЕ uppercase «гравірувально» | serif параграфи / n/a | n/a |
| **FAIRY FOREST** | фет-фейс дідона, ім'я n/a (кирилиця так) | n/a | гігант-слово ≈25-30% висоти екрана | n/a | n/a | гігант sentence; лейбли uppercase letterspaced | геометричний гротеск / n/a | ~10:1 візуально |
| **JAYASOM** | Mont (= body; Light+Regular) | **300/400, нуль bold** | 4→**6.8rem = 68px** | 1em | −0.04em | майже нема (лейбли ls .16em) | Mont 400 / 14→16px | **4.3:1** (еталон стриманості) |
| **VICTORY PARK** | SangBleu Empire Regular 400 (+Wonder Garden Script рукопис, +SangBleu Sunrise, +Codec Pro News — **5 родин, найбагатший стек VI**) | 400 (Empire) · 300/400/500 (Euclid Square) | base 3.95rem, флюїд calc(3.95rem + 39.5*((100vw−320px)/346)) посегментно | 1.013em | −.02em, флюїдно тіснішає | заголовки Sentence Case; **UPPERCASE НА BODY** | Euclid Square / 1rem=10px(!) + флюїд, ls .1em UPPERCASE | ≈8:1+ |

## T2 · Колір

| Сайт | База/фон(и) | Текст | Акцент(и) hex | Теми-класи | Чисті #000/#fff? |
|---|---|---|---|---|---|
| **ERA** | #051936 blue (дарк) + #f8f0e8 beige | beige на blue / blue на beige | **#cf8f7d brick** + градієнт #dda086→#c1816f + text-gradient #eab6a0→#cf8f7d | .ui-dark/.ui-light/.ui-white + токени --t-background/--t-heading/--t-line | так (--c-black/--c-white) |
| **AIR** | **#000 + #fff** (ч/б каркас) | ч/б | **акценту НЕМА** (колір дає тільки фото); #ea4651 discount тех. | .ui-dark/.ui-light + **data-themed-class ×11** (секція перемикає тему хедера) | ТАК — буквально база системи |
| **EVER** | ДВА КЛІМАТИ: warm #dcc5b7/#ac7e65/#402020 · cold #dce2eb/#95a3ae/#313e48 | за кліматом секції | теракота #ac7e65; + #293630 green | **.ui-warm-1/2/3 ×33 + .ui-cold-1/2/3 ×14** + green/white | #000 лише --c-print; #fff так |
| **SPRINGS** | #162d24 dark-green + #f5e8d1 beige-bg (+#e0d1b6) | beige на green / green на beige | #1b4732 green (hover) + олива #758535/#a7b431 + блакить #005160/#67bfda; error **жовтий** #e1c35b | .ui-light ×9 / .ui-dark ×4 + -background | #fff так; чорний НЕ чистий — #030303 |
| **SILVER PINEWOOD** | #f0eae2 крем · #998170 brown · #282828 dark (5 змінних всього) | #282828 / #f0eae2 | #ba8f71 beige | **ТРИ теми**: .ui-light/.ui-dark/.ui-brown — ритм cream→brown→dark | #fff так; **чистого чорного НЕМА** |
| **AZURE** | темна база (#000-домінанта) + ui-light вставки | #fff / #000 | azure **#0c436a/#3f90ce** + пісок #efd6be/#d6995c + золото #bc9400 | ui-dark/ui-light + **section--over/under-previous** (стек секцій) | так |
| **ENITEO** | трирівнева: #565440 ОЛИВА · #2c2926 теплий чорний · #e9e4dc крем | #e9e4dc на темному / #2c2926 на світлому | **#c49f8a пудрова теракота** (hover/active) | ui-olive/ui-dark/ui-light + plugin theme ×6 (перефарбування на скролі) | **НІ** — лише ×4 технічні; все тепле землисте |
| **POKLONNAYA 9** | ТЕМНИЙ сайт — всі 7 секцій home ui-dark | біла/чорна пара через --t-* | **#ff6e00 orange** (моно-акцент) | дворівнева **--c-* → --t-*** + ui-dark/ui-light | так |
| **COMPOSITION №24** | #fff + #000 (секції перемикаються) | #000/#fff | **#f50000 супрематичний червоний** + #a0937c кава + #ecdebb пісок | data-theme="dark|light|primary|tetriary" (.ui-dark ×118/.ui-primary ×55/.ui-tetriary ×22) — 4-темна | ТАК — свідомий супрематичний контраст |
| **K24** | = comp-24 | = | = | = | = |
| **KHLEBNY** | #fdfbf7 слонова кістка + #211c24 чорнильно-сливовий | #211c24 / #fdfbf7 | **#d49256 акварельна охра** | ui-dark/light/black-background + **data-left-theme/right-theme** (роздільні теми половин екрана!) | майже ні (#000 ×3) |
| **LEVEL** | #fff (світла база) + сланець #384957/#475764 | #676265/#333 на білому, #fff на сланці | **#2dbcb6 бірюза** + #f7931d помаранч (дрібний) | n/a — без класової системи (px-епоха) | #fff так; #000 ×15 помірно |
| **LOFTEC** | #2f3338 графіт + #d3d3d3 світло-сірий + #282b2e | #fff / #2f3338 | **#a37063 глиняна теракота** + #df9e70 пісок | .ui-base/.ui-secondary/.ui-dark-background | майже ні (#000 ×1) |
| **NEVA TOWERS** | нейві #1c1f2a/#242735 + теплий #f1efed | #fff / #6e7076 | **#cabd9b шампань-золото** + #b2a78c; золоті hairlines = hsla(43,20%,62%,.07/.2) | за секціями, без токенів | так, обидва активно |
| **REPUBLIC** | n/a (кейс: фактура цегли, «texture and atmosphere in the heart of history») | n/a | n/a | n/a | n/a |
| **ASTRIS** | чорно-шоколадний ≈#1d1714 ↔ крем-білі «розвороти» | золото+білий / чорний | золото-бронза ≈#c89a6a | темне↔крем чергування як книга | n/a |
| **FAIRY FOREST** | лісовий зелений ≈#0e3a26 + лавандово-білий ≈#eef0f8; фото ↔ світла секція | білий/жовтий на фото · зелений на світлому | **жовтий ≈#f7c81e** (гігант-слово, CTA-кружок, прогрес-бар) | n/a | n/a |
| **JAYASOM** | білий + **чистий ультрамарин #0006ff ЯК ФОН сцен** | #000 на білому / #fff на синьому | #0006ff — трихромія РІВНИХ частот (#fff ×30 = #0006ff ×30 = #000 ×29) | сцени перемикають білий↔синій | ТАК |
| **VICTORY PARK** | #181d24 глибокий синьо-чорний (ui-dark ×39) + #f9f0ec рожево-кремовий (×182) + #59413e шоколад | #f9f0ec на темному | **#ac835e бронза/кемел** (×123) + золото #cfa261 + світла бронза #ca9d75 | ui-dark/ui-light/ui-brown + -background (ритм dark→light→brown) | майже ні — все тоноване тепло |

## T3 · Рух

| Сайт | Scroll-движок | ГОЛОВНИЙ ease + частота | Інші криві | Pin-стратегія | WebGL де | reduced-motion? |
|---|---|---|---|---|---|---|
| **ERA** | Locomotive-style virtual scroll lerp .1 + Barba.js | **(.25,.74,.22,.99) ×28** (house) | (.55,0,.1,1) ×2 · (.18,0,.78,1) · JS (.2,.6,.35,1) | data-scroll-sticky ×4 + gravity-well ×2; durations 1.6s ×11 · .4s ×10 | Three.js — /3d-map, panorama, visualizationLines; НЕ home-маса | ТАК (вбиває все + reveal force-visible) |
| **AIR** | Locomotive lerp .1 + Barba + Splitting ×25 | (.25,.74,.22,.99) ×23 | **власний дует (.7,0,.3,1) ×11** · (.29,.73,.45,1) ×4 | sticky ×8; 11 секцій із theme-flip; durations .6s ×12 | 1 шейдер-карусель /about (home — НІ) | НЕМА |
| **EVER** | Locomotive + Barba + **data-custom-scroll-id ×215** хореографія | (.25,.74,.22,.99) ×30 | (.71,.01,.66,.99) · (.41,0,.07,1) · (.47,.04,.5,−.06) | scroll-controller pinned/horizontal-takeover | **НІ** (3D-tour = krpano) | ТАК |
| **SPRINGS** | Locomotive-style lerp .1 + Barba | **(.25,.74,.22,.99) ×72 — РЕКОРД** | (.55,0,.1,1) ×9 · easeInOutCubic ×4; durations .4 ×37 · 8s ×2 амбієнт | **sticky ×28 РЕКОРД** + snap-point ×20 | ТАК, НА HOME: webglTree/Nature/Wellness (Three+OGL) | НЕМА |
| **SILVER PINEWOOD** | Locomotive-style lerp .1 + Barba | **easeOutQuad (.25,.46,.45,.94) ×11 — ЄДИНИЙ без house-ease** | (.7,0,.4,1) ×10 + **data-parallax-easing per-element ×17** | sticky ×15 + **gravity-well ×8** (max) | ТАК, на home: Zeus GLTF-скульптура (єдиний момент) | ТАК |
| **AZURE** | кастом smooth-scroll lerp .1 (locomotive-API) + Barba ×28 + Splitting | (.25,.74,.22,.99) ×25 | (.55,0,.1,1) ×9 · (.6,0,.4,1) ×6 · анти-овершут ×1 | data-scroll-sticky ×24 | WebGL 3D-мапа compounds (єдине місце) | є (1 обробка) |
| **ENITEO** | кастом locomotive-класу lerp .1 + Barba ×23 | **(.39,.01,.04,1) ×28 — ВЛАСНА крива** | (.25,.74,.22,.99) ×27 · анти-овершут; durations **4s ×47 амбієнт** | майже нема пінів (sticky ×1); reveal="3d" perspective 45vw | НІ | ТАК ×2 + data-parallax-enable-reduced-motion ×16 |
| **POKLONNAYA 9** | locomotive-класу lerp .1 + Barba ×23 + keen-slider ×7 | (.25,.74,.22,.99) ×33 (токен --transition-easing) | (.55,0,.1,1) · (.74,0,.24,.99) · анти-овершут ×2; амбієнт 4.5–8s | sticky ×5 + section--fix/-2 | у бандлі є, НЕ активований (Lottie-прелоадер натомість) | ТАК ×2 (+update:slow) |
| **COMPOSITION №24** | **НАТИВНИЙ скрол** + scrollTo ×37 + barba ×5 | (.25,.74,.22,.99) ×49 | (.55,0,.1,1) ×27 · **овершут (.25,.74,.22,1.1) ×9** · анти-овершут ×6; база 1.2s ×48 | sticky 0; fixed ×9 | НІ (вектор/DOM) | 0 |
| **K24** | = comp-24 | = | = | = | = | = |
| **KHLEBNY** | **екранний пейджер** $.fn.pageController (jQuery, 2016) | (.68,0,.265,1) ×19 | (.25,.74,.22,.99) ×4 · (.29,.73,.45,1) ×4 | екрани = самі собі pin | НІ (canvas-2D маски) | 0 |
| **LEVEL** | **вертикальний слайдер-пейджер** (5 слайдів, jQuery) | JS easeInOutQuint ×10 | easeOutQuart (.165,.84,.44,1) ×4 · easeInQuart; база .3s ×85 | пейджер | НІ | 0 |
| **LOFTEC** | нативний скрол + scrollTo ×28 (jQuery/Bitrix) | (.25,.74,.22,.99) ×4 | (.46,.01,.54,1) ×2 · JS Expo-сім'я | sticky 0 | НІ (canvas-2D інтро) | 0 |
| **NEVA TOWERS** | нативний + **$.fn.pager вертикальний пейджер** | (.25,.74,.22,.99) ×4 | JS Expo-сім'я | пейджер fullscreen-слайдів | НІ | 0 |
| **REPUBLIC** | n/a | n/a | n/a | n/a | ймовірно (3D-мапа кварталу) — непідтверджено | n/a |
| **ASTRIS** | n/a («long story-like pages») | n/a | n/a | n/a | ТАК — інтро: будинок із зірок морфиться у рендер | n/a |
| **FAIRY FOREST** | n/a (горизонтально-сторійна навігація, скрол-хінт + прогрес-бар) | n/a | n/a | n/a | n/a | n/a |
| **JAYASOM** | **scroll-jacked WebGL-сцени** (anchor /#1-1…/#6) + barba ×8 | **(.26,0,.22,1) ×32 — власна** | easeInOutCubic (.645,.045,.355,1) ×11; амбієнт 3.5s ×15 | сцени тримають вьюпорт (0 sticky) | ТАК, МАСИВНО — PixiJS ×199 + сирі шейдери (вся подача) | 0 |
| **VICTORY PARK** | кастомний locomotive-класу lerp .1 + barba ×24 (data-ajax-page-transition ×5) | (.25,.74,.22,.99) ×34 | **(.74,0,.24,.99) ×22 — РІЗКИЙ вхід, друга робоча** · (.29,.73,.45,1) ×6 · (.55,0,.1,1) ×2 | fixed ×13, sticky ×1; амбієнт-домінанта 8s ×18 + 4s ×17 · 1.6s ×18 | **НІ** (0 WebGL, 0 lottie) | ТАК ×2 |

## T4 · Копі-ДНК

| Сайт | hero H1 дослівно | Слів | Мова | Тон (1 слово) | Продають (1 слово) |
|---|---|---|---|---|---|
| **ERA** | «place of art» (+ лід «The place where life becomes art») | 3 | EN | мистецтвоцентричний | статус-через-мистецтво |
| **AIR** | SEO-H1 «AIR — A Premium Class A Business Center on Khodynka Field by Tekta Group»; видимий теглайн «The architecture of New Success» | 12 (теглайн 5) | EN | амбітний | успіх |
| **EVER** | «Ever» + display «Live here» (= наказ «Ever. Live here.») | 1+2 | EN/RU | есеїстичний | естетику-щодення |
| **SPRINGS** | «Splendor of Renewal» (+ «Premium Living with Unrivaled Views») | 3 | EN | гіпнотичний | самооновлення |
| **SILVER PINEWOOD** | «Silver Pinewood Residences» + теглайн «quiet luxury» (дослівно в копі) | 3+2 | EN | спадковий | статус-спадок |
| **AZURE** | «Immerse yourself in the vibrant colours of life» | 8 | EN | гедоністичний | лайфстайл-сервіс |
| **ENITEO** | «ENITEO» (+ лід про латинську етимологію «блестящий») | 1 | RU | інтелігентний | естетику/авторство |
| **POKLONNAYA 9** | видимий «A PLACE OF POWER OVERLOOKING THE PLACE OF GLORY» (SEO-H1 — машинний «LCD POKLONNAYA 9…») | 8 | EN-зонд (ru оригінал geo-blocked) | максималістський | статус+сервіс |
| **COMPOSITION №24** | <h1> ВІДСУТНІЙ — інтро = анімований супрематичний логотип «Композиция №24»; плашка «ПОСЛЕДНЯЯ КВАРТИРА В КОМПОЗИЦИЯ №24» | 0 | RU | маніфестний | мистецтво-авангард |
| **K24** | = comp-24 | = | = | = | = |
| **KHLEBNY** | «Дом на Хлебном» (+ суб про пам'ятку архітектури де-люкс) | 3 | RU | музейний | історію |
| **LEVEL** | «Level BARVIKHA RESIDENCE» (+ лід «…ваша жизнь в идеальном балансе») | 3 | RU | сенсорний | баланс |
| **LOFTEC** | «LOFTEC» (+ інтро «Выберите букву», sub «Concept Loft by Coldy») | 1 | RU | технологічний | ідентичність-«я сучасний» |
| **NEVA TOWERS** | «Апартаменты Neva Towers с собственным парком в центре Москвы» | 8 | RU (+EN/中文) | лідерський | лідерство-адресу |
| **REPUBLIC** | n/a (кейс-теза: «Republic invents a new lifestyle at the center of history») | n/a | n/a (кейс EN) | спадковий | історію-як-розкіш |
| **ASTRIS** | n/a (інтро = WebGL-морфінг; tagline «True values last forever like a scattering of stars in the night sky») | n/a | RU | позачасовий | вічність |
| **FAIRY FOREST** | «Природа» (+ лейбл «ВАШ ДОМ — В САМОМ СЕРДЦЕ ЗАПОВЕДНИКА») | 1 | RU | казковий | природу-емоцію |
| **JAYASOM** | «Jayasom» + H2 «Wellness Wisdom» + CTA «Explore» | 3 сумарно | EN | медитативний | інвестицію-партнерство |
| **VICTORY PARK** | «ЖК Victory Park Residences» + скрипт-оверлей «Victory Park / Residences» + лід «элитные резиденции от 123 580 000 ₽» (**ціна одразу в hero!**) | 5 + ціна | RU (+EN) | гедоністичний | гедонізм+статус-місця |

## T5 · Структура

| Сайт | Сторінок | Секцій home | Visual-search: ДЕ живе + назва в nav | Каталог? | Інші ключові вкладки |
|---|---|---|---|---|---|
| **ERA** | **~270+** (21 фікс + ~89 floor + 6 building + 151 unit) | 9 (10 data-scroll-section) | **окремий роут /visual-search** (SVG drill 3 рівні) + /3d-map + /panorama; nav «Visual Selection» / «3D-map»; вхід ТАКОЖ із home §8 (2 arrow-CTA) | ТАК /flats — nav «Select by Criteria» | Architecture · Location · Amenities · About · Gallery · How to buy · developer · documents · Commercial premises · Parking and storage |
| **AIR** | **~120** (71 office + 28 floor + story/news/legal) | 11 scroll-sections | **окремий роут /visual-search** (генплан → floor → office); nav «On the master plan»; + deep-link з /investment з pre-set фільтром ціни | ТАК /offices — nav «By parameters» | Choose an office · About · Location · Investment · Project management · Construction progress · News · Developer |
| **EVER** | **~400+** (212 unit ×2 мови + 6 building + ~33 floor + news) | 7 scroll-controller-секцій | **dual-view: /flats(LIST) ↔ /visual-search(PLAN)** — toggle selector__link зберігає фільтр; nav «Selection on plan» + «Choose apartment»; + /parking-storage plan+table | ТАК /flats — «Selection by parameters» | Apartments · About · Place · Territory · Gallery · How to buy(mortgage) · Progress · Developer · News · 3D-tour(krpano) |
| **SPRINGS** | **~109** (6 story + 2 catalog + ~100 /flat/{id}) | 12 l-блоків | **окремий роут /visual-search** (плита 4.4MB, дані inline 888KB JSON); nav дослівно «Visual search» | ТАК /flats — nav «Search flats»/«Residences» | About · Design · Location · Amenities · Gallery · Contact us |
| **SILVER PINEWOOD** | **2 унікальні документи** (8 «роутів» = байт-той-самий one-pager, якорі) | **17 секцій** в одному скролі | **НЕМА** (/visual-search, /flats = 404) — atmosphere-депт без інвентаря | нема | About · Location · Infrastructure · Courtyard · Architecture · Lobby · Amenities · Team (усі = якорі того ж документа) |
| **AZURE** | ~16 (home + /compounds + 11 compound + about + contacts + privacy) | ~8 | **НЕ вкладка — секція home**: WebGL-мапа compounds + 4-кроковий wizard (кімнати→район→термін→контакти) | нема класичного (compounds-список) | Menu-оверлей: Compounds · About Azure · Contacts; CTA «Book a tour» |
| **ENITEO** | nav 14 розділів + EN-версія | 7 | **подвійний вхід**: «Визуальный выбор квартир» (рендер) + «Выбор по параметрам»; + избранное з PDF | ТАК (вибір по параметрах) | О проекте · Расположение · Инфраструктура · Панорама · Галерея · Как купить · Паркинг · Застройщик · Документы |
| **POKLONNAYA 9** | ≈14 (nav 16 пунктів) | 7 (всі ui-dark) | **plan-движок** data-plugin="plan" + favourites; CTA «SELECT AN APARTMENT» (секція home + сторінки apartments/penthouses) | ТАК (apartments + penthouses) | INFRASTRUCTURE · DESIGN · LOCATION · GALLERY · LIFESTYLE · ABOUT · CONSTRUCTION PROGRESS · TEAM · TERMS OF SALE |
| **COMPOSITION №24** | nav 11 пунктів | 5 | плагіни apartmentsCount + range; вкладка/CTA «Выбрать квартиру» | ТАК | Дизайн · Расположение · Галерея · Качество жизни · Как купить · Ход строительства · Команда проекта |
| **K24** | = comp-24 | = | = | = | = |
| **KHLEBNY** | one-pager (6 екранів) + поверхові плани + EN | 6 fullscreen-екранів | **екран «Квартиры» = floor-navigation «Выберите этаж»** (8 поверхів, лічильник 2-3 кв./поверх) | нема (вибір = поверхи) | nav 5 пунктів = 5 екранів: Дом · История · Расположение · Квартиры · Дизайн |
| **LEVEL** | 7 розділів + EN | 5 fullscreen-слайдів | **«Планировщик — Вы»** — слайд 4 home + сторінка Квартиры (floor-data 76px цифри+ціна, калькулятор) | ТАК (планувальник з цінами) | О проекте · Расположение · Квартиры · Дизайн · Преимущества · Инфраструктура · Новости |
| **LOFTEC** | home + Планировки и цены + галерея + about + apartments/{id} + commercial | 8 (6 = літери LOFTEC) | **вкладка nav «Планировки и цены»** + сторінки /apartments/904/ | ТАК | nav мінімальна: Планировки и цены · Коммерческая недвижимость · телефон · «Записаться на показ» |
| **NEVA TOWERS** | каталог (продаж/оренда/пентхауси/таунхауси/комерція) + ~14 розділів, 3 мови | вертикальний пейджер (к-сть n/a) | **«Апартаменты в продаже»** (вкладка-каталог) + ОКРЕМИЙ companion-сайт для sales-офісу | ТАК | 17 nav-пунктів: O проектe · Жизнь в Neva · Фильм · Виды · Команда · Брошюра · EN · 中文 |
| **REPUBLIC** | n/a (кейс: home · історія · Lifestyle · вибір · 3D-мапа · purchase/call) | n/a | ТАК (з кейсу): «selection of houses and apartments on a visual render and by specific parameters» | ТАК | кожна сторінка = власний унікальний інтерактив |
| **ASTRIS** | n/a (довгі стори-сторінки) | n/a | n/a | n/a | «Концепции квартир» підтверджено |
| **FAIRY FOREST** | n/a (слайдо-сторі «1 атрибут = 1 екран-слово») | n/a | n/a (на скрінах не видно) | n/a | бургер · лого · телефон · кнопка-дзвінок |
| **JAYASOM** | 5 (home + about-us + for-owners + get-in-touch + privacy) | 6 WebGL-сцен | нема (не каталог); Places = 4 локації зі статусами Open Now/Soon/Later | нема | About us · For owners · Get in touch (+якорі 6 сцен) |
| **VICTORY PARK** | nav 13 сторінок + EN (2 мови) | 12 секцій (dark→light→brown ритм) | **вкладка nav «Выбор квартир»** + секція home «Сделайте свой выбор» + choiceCardList/cardScroll + favourites з лічильником і PDF | ТАК | Пентхаусы · Дизайн · Галерея · Расположение · Инфраструктура · Преимущества · Как купить · Ход строительства · Команда |

---

# ЧАСТИНА 2 — 19 ДНК-ГЛАВ

## ERA — ДНК
> era.estate · live · ЖК преміум Art Deco (Tekta Group, Москва) · джерело: живий зонд curl 2026-06-10 + D_ERA_architecture (зонд 2026-06-09)

### 🧭 Структура / роутинг
- **~270+ сторінок**: 21 фіксований роут + ~89 floor + 6 building + 151 unit (`/api/flats/count`→151). Кожна квартира/поверх/будинок = ОКРЕМИЙ SSR-URL (індексується, шериться).
- **Story (10):** / · /about · /architecture · /location · /territory · /gallery · /progress · /commercials · /parking-storage · /news. **Catalog+selection (7):** /flats · /visual-search · /3d-map · /3d-tour · /panorama · /parking-storage-list · /favourites. **Trust:** /contacts · /developer · /documents · /how-to-buy · /privacy-policy · unit `/flats/ER-{b}-{s}-{n}`.
- **Nav дослівно:** Select by Criteria · Visual Selection · 3D-map · virtual tour · Architecture · Location · Amenities · About the project · Panorama · Gallery · How to buy · news · developer · documents · contacts · Commercial premises · Parking and storage.
- **Visual-search = окремий роут /visual-search** (пункт nav «Visual Selection») + другий просторовий вхід /3d-map (Three.js маса) + третій /panorama. У home — секція §8 «Apartments» з 4 arrow-CTA → /flats та /visual-search (конверсійна передача).
- **Воронка:** Home §8 → («Select by criteria» → /flats range-фільтри, 12 карток/стор через /api/flats) АБО («Visual Selection» → /visual-search → building → floor → unit). Обидва рукави сходяться на канонічній unit-сторінці /flats/ER-2-2-279 (план, м², поверх, дата здачі, ціна → «забронювати», PDF, буклет, share, favourite).
- **Взаємозвʼязки:** КОЖНА story-page закінчується `visualizationLinesMenu` — крос-лінк-меню до сусідніх сторінок (сторінки утворюють КІЛЬЦЕ, не глухий кут). Cross-page favourites живе на всіх 270 сторінках. Глибина по сторінках: /architecture 14 секцій (carouselSync), /location 13 (mapPlacesPicker, 1.58MB POI-даних), /progress 18 (12 відео поквартально).
- Visual-search механіка: SVG-плита floors/2/2_13.svg, 10× `<path data-nr class="plan__svg__hoverable" stroke="#CF8F7D">`; статус НЕ в SVG — runtime: доступно/hover = --c-brick #cf8f7d; reserved+sold = --c-blue #051936 opacity .3–.5, sold pointer-events:none. Один компонент, 4 скоупи `.plan--main/building/floor/parking`.

### 🎨 Дизайн-система
- **Шрифти:** Decart Regular 400 (display; RU-сабсет 198 глифів, укр ЄІЇҐ 0/4) + Gilroy 500/700 (body). H1 = calc(--scale-text-rem×35.5) = **355px**@xxxxl→85 моб, uppercase, ls −0.02/−0.03em; H2 ×25.7; H3 ×11.2; body ×1.8 = 18px Gilroy 500 lowercase; caption ×2 uppercase ls .02–.05em. **H1:body ≈ 19.7:1 — найекстремальніший**.
- Fluid НЕ через clamp на font-size — глобальний токен `--scale-text-rem: max(0.84rem, min(1rem, 0.84rem + 1.6*((100vw−720px)/480)))` (html 62.5%) + каскад breakpoint-варів.
- **Колір:** #051936 blue (дарк-база ×17) · #f8f0e8 beige (×8) · #cf8f7d brick (акцент ×6) + градієнт-токени (--c-brick-gradient 90deg #dda086→#c1816f; --c-text-gradient #eab6a0→#cf8f7d на display!). Теми .ui-dark/.ui-light/.ui-white через токени --t-background/--t-heading/--t-line.
- **Сітка/UI:** container = 100vw full-bleed; gutter 40/30/0px; 12 кол → 4 моб; radius 0 домінує (×62) + 50% круглі CTA `--button-height` 120/180px; hairline 1px var(--t-line) rgba .15/.5/.2; spacing 80/60/40/20px; глобальний `--scale-px` масштабує ВСЕ.

### ⚙️ Код-движок
- SSR HTML (EJS-шаблони) + 2 бандли (shared.js 1.34MB + per-page). БЕЗ JS-фреймворку, 0 GSAP.
- **Barba.js** (68 namespace) переходи + **custom rAF smooth-scroll** (namespace="locomotive", lerp .1) + **data-plugin self-init реєстр (~35 плагінів)**.
- Three.js (163 ref) точково: /3d-map, /panorama, /3d-tour, visualizationLines*. Splitting.js (текст), Matter.js (фізика точково), comagic (трекінг дзвінків).
- Дані: /api/flats fetch (НЕ inline) — для 151-юнітного інвентаря.

### 🎬 Рух
- **House ease (.25,.74,.22,.99) ×28** · (.55,0,.1,1) ×2 · (.18,0,.78,1) ×1 · JS (.2,.6,.35,1). Durations: 1.6s ×11 · .4s ×10 · .8s ×6 · 2s ×4 + утиліти .animation--fast .2s / --slow .8s.
- Reveal: `[data-reveal]` opacity 0→1 (no transform) ×28 на home. Parallax: data-plugin="parallax" ×71 + **named patterns** data-parallax-pattern="apartments|apartments-title|apartments-image…" (keyframes у JS-реєстрі) + clamp + measure-selector.
- Pin-карта home: hero intro-sticky (6 шарів parallax) · §3 Architecture = **149-кадрова scroll-scrub секвенція** (data-sequence-frame-count=149) · data-scroll-sticky ×4 · data-scroll-gravity-well ×2 (скрол-магніт).
- WOW named: visualizationLines/Cylinder/Image/Menu (лінії-арт поверх рендерів) · sequence (кадрова анімація) · text-gradient на Decart · gravity-well · 3d-map. prefers-reduced-motion: ТАК.

### ✍️ Копірайт і сенс
- Hero: **«place of art»** + «The place where life becomes art». H2: «The new Art Deco era» · «architecture» · «Joys of every day» · «A touch of sophistication» · «Интерьеры» (неперекладений RU у EN-версії!) · «Apartments» · «A new ERA for the city, a new chapter in your life.»
- Тон: поетично-статусний; гра слів ERA/era, art/Art Deco/art de vivre; цитата архітектора (Grigorios Gavalidis, GAFA); анафора «to jog down the embankment · to enjoy a concert · to take a walk». Цифр на home майже нуль — факти в каталозі.
- CTA: Select by Criteria · Visual Selection · virtual tour · Request a call · 3D-map · select apartment.
- **Big Idea: «життя як мистецтво — перший Art Deco-район міста».** Бізнес-логіка: продають СТАТУС ЧЕРЕЗ МИСТЕЦТВО (художня спадщина як виправдання ціни); воронка на покупця преміум-квартир, конвертує бронюванням unit-сторінки + favourites-PDF.

### 💎 Signature
- За 5 сек: гігантський Decart «place of art» (355px) на глибокому синьому #051936 з цегляно-рожевим градієнт-текстом.
- Найкрутіший момент: visualization-lines поверх рендерів + 149-frame scrub + 3d-map Three.js маса.
- Що вкрасти: token-формула (1 дарк-база + 1 крем + 1 теплий акцент + градієнт-пара), H1:body 20:1, кільце сторінок через visualizationLinesMenu.

---

## AIR — ДНК
> aircenter.space · live · бізнес-центр класу A (Tekta Group, Ходинське поле) · джерело: живий зонд 2026-06-10 + D_AIR_architecture (2026-06-09)

### 🧭 Структура / роутинг
- **~120 сторінок** (sitemap.xml = 120 URL): **71 office-detail** `/office/AR-{b}-{n}` + **28 floor** `/visual-search/building/N/floor/M` + 7 story (/about /location /investment /management-service /developer /progress /panorama) + 4 catalog/selection (/visual-search /offices /parking /panorama) + 4 trust + 4 news + 2 funnel (/how-to-buy /how-to-buy/mortgage). 99 SEO-сторінок інвентаря з ОДНОГО plan-датасету.
- **Nav дослівно:** Choose an office · About the project · Location · Interactive map · On the master plan · By parameters · Project management · Investment · Construction progress · News and offers · About the developer. Header themed — перефарбовується секціями.
- **Visual-search = окремий роут /visual-search** (nav «On the master plan»); раціональний рукав = /offices (nav «By parameters», ajax-фільтр building/area/price/sort + live-count /ajax/offices-total).
- **Selection flow:** /visual-search (3-building генплан) → clickable floor (clickable=true ЛИШЕ коли count>0 → 28 floor-URL) → floor-SVG 12 офісів (disabled СВОПИТЬ ТЕГ: продане = `<div>` замість `<a>` з overlay) → /office/AR-X-NN → Reserve (/ajax/booking.json) або callback. **Investment-funnel:** стратегія-картки deep-link у каталог із pre-set ціною (/offices?price[from]=0&price[to]=50000000).
- **Unit-сторінка** /office/AR-1-1: specs (№ · 218.4 м² · Floor 7 · Building · Completion 2028 · ceiling 3.94m · view) · ціна за м² + повна (struck-through + −5% badge) · plan-tabs (Office/On-floor/Master-plan, Unfurnished|Furnished) · mini-plan · breadcrumbs · CTA Reserve + favourite · «Similar offices» карусель.
- **Cross-page shortlist:** favourite/favouriteCounter — серця всюди, drawer, лічильник у header, send-by-email (/ajax/offices/favourites/mail).
- Один plan-плагін (`data-plugin="plan"`, inline SVG + JSON data-plan-plans + EJS-тултіпи, **0 map-бібліотек**) живить: домашню карту, /location-карту (37 POI + 12 metro, js-transport-filter), генплан visual-search, плани поверхів.

### 🎨 Дизайн-система
- **Шрифт ОДИН: Onest** (Google; TTF Regular/Medium/SemiBold; 534 глифи, укр 4/4). H1 ×11.3 = **113px**→42 моб, lh 0.973em, ls −0.04em, 400 (скромний — фото головніше). **H2=H3=H4=H5 один розмір** ×4.2 = 42px. Body 14px **UPPERCASE** (єдиний з 5, де body капсом — текст як графічна текстура). Caption 11px. H1:body ≈ 8:1 — найстриманіший.
- **Колір: акцентного кольору НЕМА ВЗАГАЛІ** — #000 (×18) + #fff (×12) + сірі; колір дає тільки фото/відео. Scrim фірмові синювато-сірі (rgba(51,53,78,0)→#33354e). Теми ui-dark/ui-light + **data-themed-class ×11** — секція сама перемикає тему хедера при скролі.
- **Сітка/UI:** gutters **20px/10px — найщільніша** з 5; radius фірмовий дрібний **5px** (×15) + 2px; кнопки компактні прямокутні + btn--text-h2 (заголовок-як-кнопка); spacing 50/40/30/20px.

### ⚙️ Код-движок
- SSR PHP (Symfony, transchoice, EJS, /ajax/*.json). **Barba.js** (28 ref) + js-preloader. **Locomotive Scroll** (підтверджено: html.has-scroll-smooth, namespace «locomotive», lerp .1).
- data-plugin реєстр + named-parallax реєстр (landingIntroLogoA/I/R, landingFormatImageScale, sectionToSticky…). **0 GSAP/Lenis/Three(global)/Mapbox/Leaflet/React.** WebGL лише 1: шейдер-карусель /about (about-revolves). Comagic + reCAPTCHA форми, Mindbox аналітика. Splitting.js ×25 (по-літерні reveal).

### 🎬 Рух
- House (.25,.74,.22,.99) ×23 + **власний дует (.7,0,.3,1) ×11** (різкіший inOut) + (.29,.73,.45,1) ×4. Durations .6s ×12 · 2s ×6 · 1s ×6 — темп швидший за luxury (бізнес-аудиторія).
- Reveal: opacity **.005→1** (anti-CLS) ×27. Parallax: data-plugin="parallax" ×34 + data-parallax-pattern ×29. Sticky ×8; 11 scroll-sections з чергуванням тем.
- **Pin-карта home (11 секцій):** intro-logo (AIR = 3 окремі SVG-літери з незалежним parallax) → hero (scroll-snap, sticky bg) → impulse (clip-reveal пара, sectionToSticky) → **Format: pinned counter-slideshow «3 towers 14–34 floors»** (3 sticky-шари) → harmony (sticky-картка над parallax-фоном) → life (sticky-карта + метрики) → bridge → courtyards → atmosphere → status (1/2 slider, pin) → footer.
- prefers-reduced-motion: **НЕМА**.

### ✍️ Копірайт і сенс
- Hero: SEO-H1 «AIR — A Premium Class A Business Center on Khodynka Field by Tekta Group» + видимий **«The architecture of New Success»**. H2: «The momentum to rise higher» · «A new premium format» · «An intelligent harmony of curved glass and radiant metal» · «At the center of life. At the heart of business» · «Designed with people in mind» · «A tangible sense of status».
- Тон: статусно-амбітний, вертикаль успіху, рублені твердження («At this level, AIR has no competitors.»). Цифри: **1 min Mall · 3 min Metro · 7 min Downtown · 11 min Highway** · 3 towers 14–34 floors.
- CTA: Choose an office · Call me back · Learn more · By parameters · On the master plan · Choose a parking spot.
- **Big Idea: «архітектура нового успіху — офіс як статусний ліфт».** Бізнес-логіка: B2B-покупець/інвестор офісів; конвертує Reserve на office-сторінці, investment-картками з pre-set фільтром і favourites-mail.

### 💎 Signature
- За 5 сек: ч/б преміум-мінімал, ВСЕ uppercase Onest, єдиний колір = фото; 3 SVG-літери A-I-R розлітаються при скролі.
- Найкрутіший момент: intro-логотип з пошаровим parallax літер + pinned counter-slideshow веж.
- Що вкрасти: data-themed-class (секція керує темою хедера) · дисципліна «нуль акцентних кольорів» · disabled-своп тега a↔div · deep-link з pre-set фільтром як інвест-воронка.

## EVER — ДНК
> ever-live-here.com/en (дзеркало /ru) · live · ЖК бізнес-клас (Tekta Group, Москва), двомовний · джерело: живий зонд 2026-06-10 + D_Ever_architecture (2026-06-09). ЕТАЛОН dual-view вибору квартир.

### 🧭 Структура / роутинг
- **~400+ URL** (домінують **212 unit-сторінок** /en/flat/{code} ×2 мови; /en/api/apartments/count → 212): story (4): /en · /en/about (10 секцій) · /en/location (5) · /en/territory (10); catalog+selection: /en/flats (LIST) · /en/visual-search (PLAN 3-level) · /en/parking-storage (plan+table dual, ~528 рядків) · /en/gallery (5 категорій) · /en/progress (**frame-sequence ~1333 img**); trust: /developer /contact /documents /mortgage (калькулятор, 18 програм, trade-in) /user-agreement /privacy; news; /en/3d-tour (**krpano**).
- **Nav дослівно:** Apartments · About · Place · Territory · Gallery · How to buy · CONSTRUCTION PROGRESS · DEVELOPER · NEWS AND PROMOTIONS · CONTACTS · Selection on plan · Choose a car park and storage room (+3D-tour іконка).
- **Visual-search = DUAL-VIEW, два роути-проекції ОДНОГО датасету:** /en/flats (LIST, ajax-гідрейт із /en/api/apartments) ↔ /en/visual-search (PLAN: L1 complex 6 buildings → L2 building 33 floors → L3 floor units → /en/flat/{code}). **Toggle selector__link** (SVG #selector-list/#selector-visual) свопить проекцію, ЗБЕРІГАЮЧИ фільтр-state (square 24–144 м² · price 8.2–53 млн ₽ · floor 2–34 · rooms 1С-5 · building 1-6 · extras balcony/terrace/garden/whitebox · on-sale · exclude-reserved).
- **Статус-механіка (найбагатша):** unit JSON має isReserved:bool; SVG = парний набір `<path data-nr class="plan__svg__hoverable" fill="#AC7E65">` + `<path data-nr class="plan__svg__anchor">` (10×10 невидимий = Popper-якір). CSS: available hover opacity:1 + --clickable; **sold --disabled fill #95a3ae мертве**; **reserved --styled-disabled видиме сіре без кліку**; **filtered-out --styled-opacity бліде #dce2eb .5** (фільтр приглушує, не ховає — 4-й стан, унікально).
- **Воронка:** flats/visual-search (фільтр) → region/card → /en/flat/{code} → favourites-shortlist (PDF /en/api/favourite/pdf/mail.json) → callback/taxi-модалки (/en/api/contact.json). Mortgage-калькулятор як друга конверсійна гілка. Lang-switch /en↔/ru.

### 🎨 Дизайн-система
- **Шрифт ОДИН: ITC Avant Garde Gothic** (Book 400 + Medium 500; 810 глифів, укр 4/4). H1 **160px** (fluid media-calc 980–1440) → 270px на великих; **.text--h0 гіпер-display 324→513px, lh 0.494em** — рядки накладаються. H2 108→160px; body 14px lh 1.429 lowercase. h1–h5 uppercase глобальним правилом. H1:body 11.4:1 (h0 до 36:1).
- **Колір — ДВА КЛІМАТИ:** warm #dcc5b7/#ac7e65/#402020 · cold #dce2eb/#95a3ae/#313e48 + #293630 green. **Кожна секція отримує клімат-клас** .ui-warm-1/2/3 (×33) / .ui-cold-1/2/3 (×14) / green / white; токени --t-background/--t-accent/--t-line перемикаються.
- **UI:** колонки --col = 100vw/6 (моб /2); **radius 100%/50% домінують ×29 — все кругле**, кнопки-кола --button-height 100/120/180px; hairline 1px var(--t-line) ×19+ — табличні сітки з бордерами (фірмова риса); spacing 20px база.

### ⚙️ Код-движок
- SSR PHP-Symfony (_token CSRF) + **jQuery** (101 $()) + **Barba.js** + **Locomotive Scroll** (scroll-controller-section = JS pinned/horizontal-takeover) + **Popper.js** (всі plan-popover) + Owl Carousel (×144 реально) + Splitting.js + Google Maps (+Yandex fallback) + **krpano** /3d-tour. Кастомні: image-comparison, gallery-lightbox, cursor (×14), ajax-filter/list, favourites+PDF. **0 GSAP/WebGL/React.** shared.js 483KB + page bundle.
- Кастомна скрол-хореографія **data-custom-scroll-id ×215** — кожен елемент адресується по id (інше покоління движка, без data-scroll-sticky).

### 🎬 Рух
- House (.25,.74,.22,.99) ×30 · (.71,.01,.66,.99) · (.41,0,.07,1) · (.47,.04,.5,−.06) · JS (.13,.41,.1,1)/(.55,0,.1,1). Durations .8s ×11 · .4s ×8 · 1.6s ×7 · 2.8s ×2.
- Parallax: data-plugin="deco" ×18 + «deco parallax» ×18 + **data-deco-multiplier ×30** — «deco-парад» плаваючих овалів із різною швидкістю.
- **Home 7 секцій (scroll-controller):** hero «Ever / Live here» (6 picture + 2 video, tabs) → Architecture (Owl 28 pic + tabs-counter + pin + custom cursor) → Interior (HAAST, tab-synced swap «1/3») → Territory (суб-таби Nature/Play/Chill/Sport) → Location («7 min Kaluzhskaya metro», 28 pic) → **Apartments: before/after comparison slider** (js-image-comparison-control + scroll-ignore) → News+Footer (ajax, модалки «Request a call» / «Order a taxi»).
- WOW: deco-парад · tabs із 4-напрямними анімаціями (in/out-left/right) · cursor-плагін · text--h0 513px цифри · dual-view. prefers-reduced-motion: ТАК.

### ✍️ Копірайт і сенс
- Hero: **«Ever» + «Live here»** — назва+теглайн = речення-наказ. H2: «Architecture» · «SIMPLE SHAPES, EXPRESSIVE FINISHES» · «Interior» · «THE ENTRANCES AND COMMON AREAS ARE DESIGNED BY THE LEADING ARCHITECTURAL FIRM HAAST» · «Territory» · «Location»/«Place» · «CITY CENTER OBRUCHEVA STR. VL. 23» · «Apartments» · «NEWS, PROMOTIONS» · «Request for a call».
- Тон: спокійний наратив-есе; довгі абзаци-подорожі (портики Via Po в Турині, «feeling a little like you are in Italy», «as relaxing as meditating in a Zen garden», онікс у стелях); сценарії дня («On summer mornings… In the evening…»).
- CTA: Choose an apartment · Selection by parameters · Selection on plan · Request a call-back · Build a route · Leave a request · Download PDF · **Order a taxi(!)** — сервіс-жест.
- **Big Idea: «живи тут і зараз — щоденне життя як маленька подорож».** Бізнес-логіка: бізнес-клас покупець; найвища конверсія через dual-view + 4 стани статусу (дефіцит видно) + favourites-PDF + м'які модалки.

### 💎 Signature
- За 5 сек: моношрифтова Avant-Garde-типографіка з геометричними «A/V» + warm/cold клімат секцій + кнопки-кола.
- Найкрутіший момент: text--h0 513px цифри з lh 0.49 + deco-парад.
- Що вкрасти: warm/cold-ритм тем · «1 шрифт на все» · paired hoverable+anchor примітив · 4-й стан filtered-out · dual-view list↔plan зі збереженням фільтра.

---

## SPRINGS — ДНК
> springs.estate · live · ЖК преміум wellness (apartments + townhouses + duplex penthouses) · джерело: живий зонд 2026-06-10 + D_Springs_architecture (2026-06-09)

### 🧭 Структура / роутинг
- **~109 URL** (глибина помірна — luxury продає атмосферою): story (6): / · /about («All Shades of Beauty») · /design · /location («The Center of Your Life») · /infrastructure (Amenities) · /gallery; catalog+selection (2): /flats (Residences) · /visual-search (**плита 4.4MB**); trust (2): /agreement · /privacy-policy; unit ~100: /flat/{id} (ID несеквенційні).
- **Nav дослівно:** Residences · Search flats · About · Design · Location · Amenities · Gallery · **Visual search** · Contact us · legal information. Меню = full-screen modal (modalMenu). **/flats — найлінкованіша сторінка (9 лінків) = хаб воронки.**
- **Visual-search = окремий роут**, дані ЯК АТРИБУТ (не API): **14× data-plan-plans JSON inline, один блок 888KB** → сторінка 4.4MB. 3 рівні: buildings.svg → Floor_N.svg (~300KB) → Flat_N_n.svg. Hot-zones `<g class="plan-hoverable plan-hoverable--clickable" data-hoverable="N" mix-blend-mode:multiply>` + sibling data-anchor. Статус: база fill #583e23 opacity 0; sold --disabled rgba(70,73,63,.5) + маркер-pill #a69c8c; **reserved = інвертований pill + .plan-marker__lock іконка**. 200 records / 100 покупних; 360° pano-tour у модалках.
- **Воронка «невидима до наміру»: 0 tel/mailto/соцмереж** — контакт ЛИШЕ callback (ajaxForm recaptcha) з прихованим **currentPageLink** (форма авто-чіпляє, З ЯКОЇ сторінки/квартири лід). Favourites шиє весь сайт: серце → лічильник у header → shortlist → favouriteForm або favouriteDownload (PDF). Chain: /flats ↔ /visual-search → building → floor-modal → flat-marker → /flat/{id} (+360°+similar+compass) → favourite → callback.
- **Per-page namespace дисципліна:** кожна сторінка має свій префікс секцій (home l-*, /about a-*, /design de-*, /location lo-*, /infrastructure i-*, /gallery y-*), АЛЕ спільний footer (l-callback+l-favorites) і ОДНА моушн-мова. Infrastructure-мапа: 0 map-провайдерів, inline-SVG (59 svg) + plan-marker--feature glass-pills (backdrop-blur 5px) + tabs-фільтр.

### 🎨 Дизайн-система
- **Шрифти: Victor Serif 40 Regular (display СЕРІФ) + TT Commons Pro 400/500/700 (body).** Hero .g1 ×26 = **260px**→60 моб, **lh 0.615em**, **lowercase** — ІНВЕРСІЯ капс-стратегії: заголовки lowercase серіф, ЄДИНИЙ капс = caption 12px ls .08em. .h0 ×18=180px; H1 ×10=100px; body 20px TT Commons. EN-корекція: `[lang=en] line-height: calc(var(--lh) + .2em)` — окремий lh для латиниці(!).
- **Колір — найбагатша палітра з 5:** #162d24 dark-green (тем-база) · #1b4732 green (hover) · #e0d1b6/#f5e8d1 беж-крем · #030303 (чорний НЕ чистий) · блакить #005160/#67bfda/#bee5ee · олива #758535/#a7b431 · **error ЖОВТИЙ #e1c35b**. Теми .ui-light ×9 / .ui-dark ×4. Градієнт кнопок 101.51deg rgba(27,71,50,0)→#1b4732.
- **UI:** --grid-gutter: **0vw** (безгаттерна сітка — повітря через spacing 80/60/30, найбільше з 5); btn-rx 10/15/100px pill + **клон-текст hover (data-button-clone-content ×25)**; hairline rgba(heading,.1) ×16.

### ⚙️ Код-движок
- webpack jQuery-плагіни ($.fn.plan/visualSearch/cursor), 3 бандли (shared.js 1.42MB). **Barba.js** (94 namespace) + Locomotive-style virtual scroll (lerp .1). **Three.js + OGL** (WebGLRenderer ×37, ShaderMaterial ×23): webglTree (6 canvas) + webglNature + webglWellness — 3 шейдер-сцени НА HOME.
- Дані inline (888KB JSON у data-plan-plans) — SEO-friendly, 0 round-trips (контраст ERA fetch-API).

### 🎬 Рух
- **House (.25,.74,.22,.99) ×72 — РЕКОРД** усіх сайтів · (.55,0,.1,1) ×9 · easeInOutCubic ×4. Durations .4s ×37 · .8s ×19 · 1.6s ×10 · **8s ×2** (luxury-фони). Hero-reveal **delay 1000ms** — недбала розкіш.
- **Sticky ×28 — РЕКОРД** + data-scroll-snap-point ×20 (снап-хореографія). Parallax **136 інстансів** + named (designMoveLeftImage/RightImage — зустрічний parallax-pair) + clamp ×74 + measure-selector ×61 + data-parallax-enable-touch="false".
- **Home 12 l-блоків:** preloader → l-intro «Splendor of Renewal» → l-wellness (WebGL canvas) → l-nature (WebGL) → l-place (WebGL-дерево + Vimeo-bg) → l-map (scroll-driven SVG-карта) → l-residences → l-interiors (tabs + cursor) → l-design (зустрічний parallax) → l-callback → l-favorites → footer.
- WOW: WebGL-дерево за текстом · клон-текст hover · scroll-snap хореографія · 12 повільних sticky-сцен · inputBear(!) — форма з ведмедиком. prefers-reduced-motion: НЕМА.

### ✍️ Копірайт і сенс
- Hero: **«Splendor of Renewal»** + «Premium Living with Unrivaled Views» + лід «Apartments, terraced townhouses, and duplex penthouses in a quiet, green neighborhood.»
- H2: «Open the doors of Springs and step into your true self» · «Wellness» · «Nature» · «Place» · «Design» · «Interiors»; ліди-медитації «Enclave of peace and quiet, your personal happy place…».
- Тон: поетичний wellness-гіпноз, 2-га особа, сенсорика («aroma of espresso adorned with creamy milk foam», «fragrant warmth of the hammam»); наказово-запрошувальний + прямі питання («Do you sense the aroma…?»). Цифри ≈ нуль — продає атмосфера.
- CTA: select residence · submit a request · callback · Search flats · subscribe (квірк: в EN лишились RU-кнопки «резиденции», «оставить заявку»).
- **Big Idea: «дім як спа — оновлення себе»**. Бізнес-логіка: wellness-статус для преміум-покупця; конвертує атмосферою → favourites → єдиний callback із currentPageLink.

### 💎 Signature
- За 5 сек: lowercase-серіф Victor Serif 260px на dark-green #162d24 + крем #f5e8d1; жодного капс-заголовка.
- Найкрутіший момент: WebGL-дерево за текстом + 28 sticky-сцен повільної снап-хореографії.
- Що вкрасти: контраст «12px caption uppercase ↔ 260px lowercase serif» · клон-текст hover · house-ease ×72 як ЄДИНИЙ рух · currentPageLink у формі.

---

## SILVER PINEWOOD — ДНК
> silver-pinewood.com · live · ЖК преміум «quiet luxury» біля соснового парку/ріки · ONE-PAGER · джерело: живий зонд 2026-06-10 + D_SilverPinewood_architecture (2026-06-09)

### 🧭 Структура / роутинг
- **ГОЛОВНА ЗНАХІДКА: це НЕ багатосторінковий сайт. 2 унікальні документи:** / (609KB one-pager, 17 секцій) + /privacy-policy. 8 «роутів» (/about /architecture /engineering /infrastructure /lobby /location /territory /team) = **байт-ідентичний документ** (SEO deep-link на якір; canonical = bare-domain). **history-плагін переписує URL при скролі — сторінка сама собі scroll-spy роутер.**
- **Visual-search: НЕМА** (/visual-search, /flats = 404) — чистий atmosphere-depth пре-сейл без інвентаря. Глибина = редакторська щільність: 17 секцій, ~200 `<img>` як `<picture>` WebP (582 .webp), кожне в parallax-image-zoom (×114).
- **Nav:** header мінімальний — лише «Contact Us» (#callback-modal) + «Menu» (#menu-modal з 8 роутами; Barba перехоплює → scroll-to-anchor). Nav-пункти: About · Location · Infrastructure · Courtyard · Architecture · Lobby · Amenities · Team.
- **17 секцій скролу:** hero «Silver Pinewood Residences» (sticky--under-next) → #about (легенда місця) → ui-brown pines/bay → natural movement (gravity-well) → **#location МАПА** → beauty of idle days → #territory Courtyard → nature-area (tab) → tasteful life → fitness/wine/beauty → #architecture → water and air (carousel) → **#lobby = Three.js GLTF Zeus-скульптура** → space → #engineering → #team → CTA «Request a Call» + footer.
- **Мапа (§5, обидва роути /location і /infrastructure → ТА САМА секція):** 100% hand-built inline-SVG, 0 map-провайдерів. Два шари viewBox 0 0 1440 1256: map-image.svg (69KB видиме артворк) + map.svg (4.6KB невидимий координатний шар: **52 `<rect data-anchor transform="translate(x y) rotate(deg)">`**). Дані = ОДИН JSON data-plan-plans (50 POI + 2 ріки), EJS-партіали. 5 типів маркерів (point/metro/place/river/street), категорії Sport(8)/Education(9)/Shopping(5)/Leisure(5)/Restaurants(7), sticky-фільтр 10 inputs. **Відстані = hardcoded ТЕКСТ** («5 minutes on foot») — не live-routing.
- Воронка: єдиний CTA «Request a Call» (§17 + модалка), форма {first_name, phone, hidden utm/group/keywords/description}. Footer sparse: #top + «website by vide infra».

### 🎨 Дизайн-система
- **Радикальна дисципліна: ОДИН ШРИФТ × ОДНА ВАГА — TT Fors Medium 500** (єдиний @font-face; 1044 глифи, укр 4/4). H1 ×17 = **170px**→30 моб, lh 0.88–0.94, **ls −0.06em** (найщільніший), uppercase; H2 ×9.8 = 98px; body 16px UPPERCASE ls +0.04em; caption 12px. ВСЯ ієрархія тримається ТІЛЬКИ на розмірі. H1:body 10.6:1.
- **Колір — мінімальна палітра, 5 змінних:** #f0eae2 light (крем-база) · #282828 gray (дарк) · #ba8f71 beige · #998170 beige-background (brown-тема) · #fff. **ТРИ теми** .ui-light/.ui-dark/.ui-brown — ритм cream→brown→dark по скролу. Чистого чорного НЕМА.
- **UI:** gutter 0px; layout-колонки (100vw − spacing×2)/12; radius 0 ×18; кнопки btn-arrow + клон-текст hover (data-button-clone-content ×37); spacing 40/30/20 стриманий.

### ⚙️ Код-движок
- **0 GSAP. 0 Lenis.** Custom smooth-scroll (Locomotive-derived: data-scroll-section/sticky, draggable scrollbar, rAF lerp .1) + bespoke **gravity-well** магніт-parallax (updateGravityWellLerp). **Barba.js** (33). **Three.js + GLTFLoader + DRACOLoader** (165) — webgl-zeus GLTF (model.gltf + DRACO + AVIF), ЄДИНИЙ WebGL-момент. jQuery data-plugin (reveal/history/parallax/sticky/carousel/illustrationZeus/syncInputValues/stickyBottom). Homegrown FLIP (57). shared.js 1.0MB. Cloudflare фронт.

### 🎬 Рух
- **ЄДИНИЙ з 5 БЕЗ house-ease: власна пара easeOutQuad (.25,.46,.45,.94) ×11 + (.7,0,.4,1) ×10.** Унікально: easing у DOM — **data-parallax-easing="easeOutQuad|easeSection" ×17** (per-element криві). Durations .4s ×7 · .8s ×5 + мс-мікро (50/25/10ms).
- Reveal opacity .005→1 ×40 + reveal history ×8. Parallax **199 інстансів** + clamp ×99 + pattern ×64. Sticky ×15 + **gravity-well ×8 (max з 5)**.
- WOW: **data-plugin="svgLength" ×72 — SVG line-draw контурів по скролу (фірмовий прийом)** · illustrationZeus (WebGL GLTF-скульптура) · history scroll-spy роутер · gravity-well · клон-текст hover. prefers-reduced-motion: ТАК.

### ✍️ Копірайт і сенс
- Hero: **«Silver Pinewood Residences»** + теглайн **«quiet luxury»** (буквально в копі!). H2 = повні речення-річки: «Premium residential complex near the iconic Silver Pinewood on the riverbank — is your opportunity to make a legendary address part of your story.» · «The towering century-old pines, crystal-clear waters of a bay and fresh air have made Silver Pinewood a true symbol of resort-style elegance.» · «natural movement» · «beauty of idle days» · «Courtyard» · «tasteful life» · «ARCHITECTURE» · «Lobby» · «A full suite of advanced engineering solutions and smart features» · «team» · «Request a Call».
- Тон: спадково-статусний сторітелінг («home to generations of renowned musicians, visionary entrepreneurs, and acclaimed film directors — an exclusive haven admired by many but accessible to only a few»); «your story» — вписування покупця в легенду. Цифри словами, не числами («century-old pines», «half-hour's reach»).
- CTA мінімальний: Contact Us · Request · Request a Call (без каталогу нема що вибирати).
- **Big Idea: «легендарна адреса — тихий статус у спадок».** Бізнес-логіка: пре-сейл HNWI; конвертує атмосферою → одна форма дзвінка.

### 💎 Signature
- За 5 сек: один TT Fors Medium капсом на крем/brown/dark + SVG-контури, що домальовуються.
- Найкрутіший момент: svgLength line-draw ×72 + WebGL Zeus + URL, що сам перемикається при скролі.
- Що вкрасти: «1 шрифт × 1 вага × 3 теми» · per-element data-parallax-easing · history scroll-spy роутер · мапа = 2 SVG-шари + JSON (найвідтворюваніший патерн).

## AZURE — ДНК
> azure.sa · live (за Cloudflare bot-challenge; зонд = Wayback-дзеркало живих сирців 2025-11-16) · КОРПОРАТИВНИЙ сайт девелопера-оператора — «largest chain of premium residential compounds in Saudi Arabia» (оренда, Ріяд; НЕ промо одного ЖК) · ≈2025, turnkey VI: стратегія → копірайтинг → імплементація

### 🧭 Структура / роутинг
- **Сторінки:** home + /compounds + 11-12 сторінок compounds (Palma I, Palma II, Qairawan, Narjis, Hittin, Wadi, Takhassusi, Al Reem, Lamara, Rabwah, Asala, Central) + /about + /contacts + /privacy-policy.
- **Nav:** Menu-оверлей (Compounds · About Azure · Contacts) + CTA «Book a tour» + телефон. Мінімальна навігація — воронка живе на home.
- **Visual-search: НЕ вкладка, а ДВІ механіки на home:** ① **WebGL 3D-мапа compounds** (.js-compounds-plan-webgl, плагін webglMap, lazy-чанки) — компаунди в контексті міста; ② **wizard-воронка 4 кроки замість каталогу** (H2-питання: «How many rooms you need?» → «Which area in Riyadh are you interested in?» → «For how many months?» → «Your contacts»).
- **Home ~8 секцій:** intro (ui-dark) → exquisite-collection → compounds (список + WebGL-мапа) → home-container («more than just a place») → gallery → wizard (4-крокова воронка) → choice («Why Premier Choice») → services → contact.
- Взаємозвʼязки: home → compound-сторінка → Book a tour / Inquire Now; wizard збирає лід прямо на home. Конверсія = бронювання туру/заявка (оренда, не покупка).

### 🎨 Дизайн-система
- **Шрифти: AZURESans (кастомний бренд-гротеск, Medium+Regular; кирилиці НЕМАЄ)** + **TT Jenevers Light Italic, зареєстрований як italic-500 ВСЕРЕДИНІ родини AZURESans** — серифний курсив-акцент вмикається просто `<i>` (без другої font-family у розмітці). H1 fluid 11rem→17.6rem = **110→176px**, lh .909, ls −.04em, fw 500, sentence-case (капс майже НІ — 1 правило). H2 80→128px. Body 12→16px. H1:body 11:1.
- Fluid-формула фірмова VI: max(Xrem, min(Yrem, calc(X + N*((vw100−1440px)/960)))) + глобальний **--scale-px = max(.5px, min(1px,…))** — весь UI множиться на скейл-фактор. Брейки 667/979/1440/2400 + **aspect-ratio-медіа-запити (13/9, 10/11!)**.
- **Колір:** темна база (#000 ×12 / #fff ×11, чисті) зі вставками ui-light; акцент-1 **azure-синій #0c436a/#3f90ce** + крижані тінти #e9f2fa/#e0e8f0; акцент-2 пісочно-золотий KSA #efd6be/#d6995c/#bc9400. Теми ui-dark/ui-light + **section--over-previous / section--under-previous (стекове нашарування секцій)**. CSS vars = НЕ кольори, а скейл/спейсінг-математика.
- **UI:** radius 0 домінує ×25; кнопки **data-button-clone-content ×29** (клон-текст hover); spacing fluid 60→80px.

### ⚙️ Код-движок
- Кастомний smooth-scroll lerp .1 (locomotive-style API: data-scroll ×24, data-scroll-section ×13) + **barba.js ×28** + Splitting.js ×13 (char-split). WebGL ТІЛЬКИ 3D-мапа compounds.
- **data-reveal словник ×152: text ×66 · title ×38 · line ×23 · line block ×10 · fade-in blur-in block ×6** (+slide-in-top) з модифікаторами -distance/-delay/-repeat/-group.
- **РЕЄСТР іменованих parallax-патернів ×109:** imageMove, exquisiteImage, serviceImage, exquisiteMobCard(Overlay), imageMoveMobile (+clamp/-direction/-measure-selector/-enable-mq) — не inline-keyframes, масштабується.

### 🎬 Рух
- House **(.25,.74,.22,.99) ×25** · (.55,0,.1,1) ×9 · (.6,0,.4,1) ×6 · анти-овершут (.47,.04,.5,−.06) ×1 · 1 динамічна template-string (JS-генерована крива!). Durations .8s ×9 · .4s ×7 · 1.3s ×6 · 1.6s ×5 + мікро 10–40ms.
- data-scroll-sticky ×24 (масивно). WOW: WebGL-мапа · клон-кнопки · стекові секції over/under-previous · blur-in reveal · serif-italic як типографічний акцент. prefers-reduced-motion: є (1 обробка).

### ✍️ Копірайт і сенс
- Hero: **«Immerse yourself in the vibrant colours of life»** (8 слів). H2: «An exquisite collection of gated residential compounds in Riyadh» · «Compounds» · «Azure is more than just a place to live, it's where you can truly feel at home» · «Discover a living experience defined by quality, care and a focus on you» · «Why is Azure the Premier Choice?» · «Our Services». Сервіси = епітет-пари: «Picture-Postcard Swimming Pools» · «Opulent and Stylish Salons» · «Luxurious and Sparkling Spa» · «Enthralling Shopping Environment».
- Тон: сенсорно-гедоністичний, щедрі прикметники (vibrant/exquisite/opulent/enthralling) — НЕ мінімалізм, а luxury-hospitality голос. Прийоми: наказовий спосіб (Immerse, Discover) · питання як кроки воронки.
- CTA: «Book a tour» (головний) · «Inquire Now» · «Submit» · телефон +966 9200 25557.
- **Big Idea: оренда compound-життя як занурення в яскраві кольори життя.** Бізнес-логіка: B2C-оренда для експатів/родин у Ріяді; конвертує туром та wizard-заявкою, не каталогом.

### 💎 Signature
- За 5 сек: темна розкіш + azure-синій і пісок, гігантський AZURESans з serif-italic вкрапленнями, стекові секції наїжджають одна на одну.
- Найкрутіший момент: WebGL-мапа compounds + wizard-воронка з питань замість каталогу.
- Що вкрасти: реєстр named-parallax · токен --scale-px · serif-italic всередині родини · data-reveal словник 6 типів · wizard-питання як воронка.

---

## ENITEO — ДНК
> eniteo.ru · live, GEO-BLOCKED з-за кордону (зонд Wayback 2026-02-08, повний HTML ru + бандли; сайт оновлюється досі) · ЖК преміум-вежі (Москва, Академічний; ГК «Основа», бюро KAMEN; 662 квартири) · ≈2020

### 🧭 Структура / роутинг
- **Nav 14 розділів:** О проекте · Расположение · Инфраструктура · Благоустройство · Панорама · Галерея · Как купить · Паркинг · Ход строительства · Заселение · Застройщик · Новости и Акции · Документы · Контакты. + EN-версія (2 мови).
- **Visual-search: ПОДВІЙНИЙ ВХІД** (як ERA): «Визуальный выбор квартир» (рендер) + «Выбор по параметрам» — обидва CTA. + **«Сохранить избранное» з PDF-вивантаженням і «на почту»** (favouriteDownload).
- **Home 7 секцій:** intro ui-olive (introAnimation + introParallax + tabs в одній секції) → **цитата архітектора ui-dark ДРУГОЮ секцією** (Иван Греков, бюро KAMEN: «Пропорции и ритм фасадов существуют здесь не только в пространстве, но и во времени») → olive-блок → 2× light («Место»-таби з placeCircle кругова діаграма-мапа / інфраструктура) → olive → about-choice (вибір квартир, light).
- Сервіс-жест: **кнопка «Заказать такси»** (як Ever). CTA: «Выбрать квартиру» · «Обратный звонок» · «Открыть карту» · «PDF» · «на почту».

### 🎨 Дизайн-система
- **Шрифт ОДИН: Axiforma** (Light 300/Regular 400/Medium 500). H1 3.35→**18.9rem ≈189px**, lh .899–1.19, ls −.02→−.04em (чим більший — тим тісніше); спец-варіанти h1-infra 8.5rem, h1-docs 4.05rem. H2 2.7→4.7rem ls +.02em. Body 11→15px ls .04em. **H1:body 12.6:1 — екстремальний контраст масштабу. Капс ×1 — майже нема («тихий» люкс).**
- **Знакові переноси в заголовках: «Тер- расы», «Инфра— структура»** — дефіс/тире як типографічний жест. H2/H3 = голі цифри-факти: «662», «7», «12», «13».
- **Колір — тепла землиста трирівнева тема:** #e9e4dc крем (×146) · **#565440 ОЛИВА (×102, фірмовий)** · #2c2926 теплий майже-чорний (×94) · акцент #c49f8a пудрово-теракотовий (×80). Класи ui-olive/ui-dark/ui-light + plugin theme ×6 + data-theme-enable-mq — секції перефарбовуються на скролі. **Чистих #000/#fff НЕМА** (×4 технічні).
- **UI:** без max-width — колонкова сітка --col = 100vw/8→/12; spacing-база 20px ×множники 0.5–8; radius 20/30/40px + 50% — м'яка геометрія.

### ⚙️ Код-движок
- Кастомний smooth-scroll locomotive-класу (lerp .1) + **barba.js ×23** + js-scroll-parent-ignore. CSS vars кольорових токенів НЕМАЄ (хардкод hex по ui-класах) — зате сітка й spacing у varʼах. WebGL: НІ (0 згадок; без keen-slider — таби замість каруселей).

### 🎬 Рух
- **ВЛАСНА крива (.39,.01,.04,1) ×28** (повільний старт, довгий викат) · house (.25,.74,.22,.99) ×27 · анти-овершут (.47,.04,.5,−.06) · JS easeInOutExpo. **Durations: 4s ×47 — АМБІЄНТ-ДОМІНАНТА** · 1.2s ×15 · 2s ×12 · 8s/6s ×8 · 5000s ×4 (нескінченний marquee).
- Reveal: appear ×58 + **data-reveal="3d" ×18 — ПЕРСПЕКТИВНИЙ reveal (контейнер perspective:45vw!)** + stagger ×15. Parallax ×90 + патерни "image" ×50 + "place-circle"; -clamp ×15, **-enable-reduced-motion ×16 (доступний паралакс)**. Пінів майже нема (sticky ×1) — рух живе в амбієнтах, не в пінах.
- WOW: reveal="3d" · placeCircle (кругова діаграма-мапа «Место», 4 таби) · tabs з 4-напрямними анімаціями · вішліст із PDF · «Заказать такси». prefers-reduced-motion: ТАК ×2 + наскрізний атрибут.

### ✍️ Копірайт і сенс
- Hero: **«ENITEO»** (1 слово, латиниця-логотип) + лід: «Eniteo переводится с латыни как „блестящий". И каждый найдет свои подтверждения этому имени: в блестящем будущем для детей, в архитектуре проекта или его расположении…»
- H2: «Эстетика» · «Разнообразие» · «Отделка» · «Безопасность» · «Тер- расы» · «Место» · «На авто» · «Инфра— структура» · «662» · «Заказать звонок». H3-факти: «Дизайнерское лобби» · «Огороженная территория» · «Подземный паркинг» · «Колясочная и комната для мойки лап животных».
- Тон: тихий інтелігентний люкс — латинська етимологія як бренд-сторі, архітектор як авторитет, одно-словні H2, типографічні переноси як арт-жест.
- **Big Idea: «блестящий» — блиск у всіх гранях життя; фасади, що живуть у часі.** Бізнес-логіка: продають ЕСТЕТИКУ й АВТОРСТВО (KAMEN як мистецький обʼєкт) + статус «розумного» люксу; конвертує подвійним вибором квартир + избранное-PDF + такси-сервісом.

### 💎 Signature
- За 5 сек: оливково-кремова земляна палітра (#565440/#e9e4dc/#c49f8a), Axiforma-моношрифтовість, H1 189px поряд із боді 15px, нуль капсу.
- Найкрутіший момент: reveal="3d" у перспективі 45vw на повільних 4s-амбієнтах; цитата архітектора як друга секція.
- Що вкрасти: контраст 12.6:1 · власна «дорога» крива (.39,.01,.04,1) · доступний паралакс (data-parallax-enable-reduced-motion) · «Заказать такси» як сервіс-CTA.

---

## POKLONNAYA 9 — ДНК
> poklonnaya9.site · live, GEO-BLOCKED (зонд Wayback 2026-06-10, EN-версія повна) · ЖК преміум-вежа (Москва, Поклонна гора; ANT Development; апартаменти пов. 8–28 + готель SO/ Moscow 5* пов. 1–7 + пентхауси)

### 🧭 Структура / роутинг
- **≈14 сторінок, nav 16 пунктів:** INFRASTRUCTURE · DESIGN · LOCATION · GALLERY · LIFESTYLE · ABOUT THE PROJECT · APARTMENTS · PENTHOUSES · CONSTRUCTION PROGRESS · NEWS · CONTACTS · DOCUMENTS · TERMS OF SALE · TEAM · VIDEO ABOUT THE PROJECT · DOWNLOAD PDF BROCHURE.
- **Visual-search:** VI plan-движок — data-plugin="plan" + data-plan-plugins="anchors markers"; вхід через CTA-секцію home «SELECT AN APARTMENT» + сторінки APARTMENTS / PENTHOUSES (2 продукт-лінії). + **система «ОБРАНЕ»** (favouriteCounter + favouritesList + cardScroll — вішліст квартир, рідкість для ЖК).
- **Home 7 секцій (ВСІ ui-dark ×29):** hero (section--fix, Lottie-прелоадер-інтро) → готель SO/ + freedom → location («place of power») → architecture («gold standard») → news & offers → select apartment (plan) → contacts/footer (section--fix-2).
- Воронка: hero → 5*-сервіс-аргумент → план-вибір → REQUEST A CALLBACK; favourites накопичує інтерес.

### 🎨 Дизайн-система
- **Шрифти: Neutraface Condensed Custom 500 (display; «Neutraface Cond Medium Fin.ttf» — кастом-файл) + Futura PT Book 400/Medium 500 (body, Paratype).** H1 ≈**117px** (11.7×--scale-rem), lh 1.026–1.034, **ls +.04–.05em** (розріджений кондензед); body 12→18px **ls .1em — ШИРОКИЙ трекінг боді, фірмова риса**; заголовки набрані капсом у контенті (CSS-правил капсу лише 4).
- **Fluid: ТАК — VI scale-система:** html 62.5%; --scale-rem: calc(0.5rem + 5*((100vw − 720px)/720)); все = calc(var(--scale-*) × N). **Aspect-ratio-aware медіа-запити ×79** (13/9 тощо) — орієнтація важливіша за ширину.
- **Колір — ТЕМНИЙ сайт, моно-акцент:** **дворівнева токен-система --c-* → --t-***: фізичні (--c-orange:#ff6e00 · --c-white · --c-black · --c-dark-lines:#262626) → семантичні (--t-background/--t-text/--t-heading/--t-link-hover:orange); класи ui-dark/ui-light перемикають t-шар. Чисті #000/#fff: так.
- **UI:** без max-width (.container-h padding var(--spacing) 80/60/20×scale); radius 15–40×scale + 50% + **АРКА border-radius: calc(50vw − 60px) calc(50vw − 60px) 0 0 — арочні зображення (архітектурний мотив у CSS-геометрії)**; кнопки — inset box-shadow 1px контур → calc(height/2) заливка на hover.

### ⚙️ Код-движок
- Кастомний smooth-scroll locomotive-класу lerp .1 + **barba.js ×23** + **keen-slider ×7** + IntersectionObserver ×9. **Lottie ×47** (preloaderLottie + preloaderIntro). WebGL у бандлі Є (preloaderWebgl), але на home НЕ активований — обрано Lottie.

### 🎬 Рух
- House (.25,.74,.22,.99) ×33 **як токен --transition-easing** · (.55,0,.1,1) ×2 · (.74,0,.24,.99) ×2 · анти-овершут (.47,.04,.5,−.06) ×2. Durations-токени --transition-duration .5s (база)/1s/.25s; амбієнт 4.5–8s повільні фони.
- Reveal: appear ×93 + словник data-reveal: fade-in ×28 · slide-in-bottom slow ×15 · title ×13 · **building ×4 (кастомний reveal для рендерів вежі!)** · text ×2; -delay ×17.
- Parallax: іменні патерни block|image|**verticalText** ×18 + block-multiplier ×10 + parallaxDeco ×6 + enable-mq. Sticky ×5 + section--fix/-2 (перша й остання секції). prefers-reduced-motion: ТАК ×2 (+update:slow).

### ✍️ Копірайт і сенс
- Hero видимий: **«A PLACE OF POWER OVERLOOKING THE PLACE OF GLORY»** (гра: Поклонна гора / Парк Перемоги); SEO-H1 машинний («LCD POKLONNAYA 9 — official website, prices and promotions…»).
- H2: «5* HOTEL SERVICE IN YOUR HOME» · «THE FREEDOM TO ENJOY LIFE» · «A NEW DIMENSION FOR THE GOLD STANDARD IN ARCHITECTURE» · «NEWS & OFFERS» · «SELECT AN APARTMENT».
- Тон: статусний максималізм («place of power», «gold standard», «5*»); готельна лексика як доказ сервісу. Цифри: «5*», Floors 1–7 / 8–28.
- CTA: SELECT AN APARTMENT · REQUEST A CALLBACK · FAVORITES · DOWNLOAD PDF BROCHURE.
- **Big Idea: вежа над Парком Перемоги, де живеш як у 5* готелі — SO/ Moscow обслуговує твій дім.** Бізнес-логіка: статус+сервіс для преміум-покупця; конвертує план-вибором + favourites + callback.

### 💎 Signature
- За 5 сек: суцільно темний люкс + оранж #ff6e00, кондензований капс Neutraface, арочні вирізи зображень, широкий .1em трекінг боді.
- Найкрутіший момент: арка border-radius 50vw на фото + verticalText-паралакс.
- Що вкрасти: дворівнева токен-система --c-*→--t-* · aspect-ratio-медіа-запити · favourites для квартир · анти-овершут крива.

## COMPOSITION NO.24 — ДНК
> k24moscow.ru (домен СКВОТОВАНО ~2024 — зараз чужий WP-блог) · DEAD; джерело: **Wayback 2023-10-03 + 2023-09-17, ПОВНІ сирці HTML/CSS/JS** + fallback videinfra.com/work/composition-no-24 · запуск ~2018-12/2019 · ЖК (Москва, Хавська 24; бренд на супрематизмі/авангарді) · Awwwards SOTD
> ⚠️ = K24 Residence (один сайт, див. главу K24)

### 🧭 Структура / роутинг
- **Home 5 секцій:** top (інтро-морфінг) → location → apartments → quality → contacts.
- **Nav 11 пунктів:** Дизайн · Расположение · Выбрать квартиру · Галерея · Качество жизни · Как купить · Контакты · Новости и акции · Ход строительства · Документация · Команда проекта · EN. Сторінки: квартири (вибір), галерея, як купити, новини, хід будівництва, документація, команда, контакти.
- **Visual-search: ТАК — вкладка/CTA «Выбрать квартиру»**, плагіни apartmentsCount + range (фільтри). Hero-CTA-плашка дефіциту: «ПОСЛЕДНЯЯ КВАРТИРА В КОМПОЗИЦИЯ №24».
- CTA: «Заказать звонок» · «Выбрать квартиру» · «Узнать больше» · «Посмотреть».

### 🎨 Дизайн-система
- **Шрифти: Karloff Negative Bold (Typotheque, display fw700) + Euclid Flex 300/400/500 (body)**, kern увімкнено. H1 5.6→8.4→**14.1rem ≈141px**, lh .92, ls −.02em. H2 4.1→5.6rem; .h2-lg uppercase. Body 13→16px. H1:body 8.8:1. Fluid НІ — ступінчасті MQ (479/668/979/1279).
- **Колір — супрематична трійка:** #fff ×65 · #000 ×57 · **#f50000 ×41 (супрематичний червоний)** + #a0937c кава ×7 + #ecdebb пісок ×6. **4-темна система data-theme="dark|light|primary|tetriary"** (.ui-dark ×118 / .ui-primary ×55 / .ui-tetriary ×22 / .ui-light ×4) — світла/темна/червона/беж. Чисті #000/#fff: ТАК, свідомо.
- **UI:** кнопки-pills 100px (і напівпілюлі 100px 0 0 100px); btn--primary/secondary/tetriary/text з :before-outline механікою .6s; hairline 1px #000 / rgba(0,0,0,.1). CSS vars НЕ кольори, а **char-split математика: --char-index/--word-index/--line-index, --distance: calc((offset²)/center), --distance-sine**.

### ⚙️ Код-движок
- **НАТИВНИЙ скрол** (без Locomotive/Lenis): scrollTo ×37 (data-scrollto ×9), IntersectionObserver ×8, **barba.js ×5** page-transitions. Reveal: плагін appear ×47 + data-appear-effects ×13. Parallax: НЕМА — рух тримається на appear + theme-перемиканні. WebGL: НІ (вектор/DOM).

### 🎬 Рух
- House (.25,.74,.22,.99) ×49 · (.55,0,.1,1) ×27 · **ОВЕРШУТ (.25,.74,.22,1.1) ×9 (єдиний сайт з овершутом!)** · анти-овершут (.47,.04,.5,−.06) ×6. JS: easeOutStrong ×23, easeInStrong/InOutStrong ×14, Expo-сім'я. **Базова duration 1.2s ×48** · .6s ×14 · 7.2s амбієнт; стаггер calc(var(--line-total)×25ms + .96s).
- WOW: ① **«Супрематичний інтро-морфінг»** — introSlider: вектор-композиція Малевича морфиться в будинок (без WebGL); ② **«Char-wave заголовки»** — CSS-математика --distance-sine розкидає літери хвилею («Кв арти ры», «Расп оложе ние» — спліт прямо в сирці); ③ 4-темна рекольоровка секцій (applyTheme); ④ visual search (apartmentsCount + range); ⑤ strokeOffset — SVG dash-розчерки. prefers-reduced-motion: 0.

### ✍️ Копірайт і сенс
- **<h1> ВІДСУТНІЙ** — інтро = анімований супрематичний логотип «Композиция №24». H2 дослівно: «архитектура» · «Территория» · «Квартиры» · «Ди зай н» · «Расп оложе ние» · «Кв арти ры» · «Кач ество жизни» · «Зак азать звонок». **H3 = голі цифри-факти: «8», «9», «7», «20»** (поверхи/хвилини/планування).
- Тон: мінімалістичний маніфест — майже без прикметників, слова-секції з одного іменника; типографіка = головний меседж.
- **Big Idea: житло як твір супрематизму — мистецтво, в якому можна жити.** Бізнес-логіка: продають МИСТЕЦТВО і культурний статус (авангард як ідентичність покупця); конвертує дефіцитом («последняя квартира») + вибором квартири.

### 💎 Signature
- За 5 сек: чорний+білий+#f50000, Karloff Negative, квадрати/кола Малевича, літери розлітаються хвилею.
- Найкрутіший момент: інтро — супрематична композиція морфиться в будинок (вектор, без WebGL).
- Що вкрасти: CSS char-split математика (--distance-sine хвиля без JS-анімації кожної літери) · овершут-крива для «живих» появ · 4-темна data-theme рекольоровка.

---

## K24 RESIDENCE — ДНК (= Composition No.24)
> k24moscow.ru (сквот) · стейджинг k24.ab.videinfra.net мертвий · DEAD · джерело: той самий Wayback-бандл + Behance «K24 Residence Website» (2020)

**ВЕРДИКТ ЗОНДА: K24 Residence і Composition No.24 — ОДИН І ТОЙ САМИЙ САЙТ.** Докази: один домен k24moscow.ru; той самий бандл 2020↔2023; ідентичні data-атрибути; на videinfra.com НЕМАЄ окремого кейсу «K24» (work/k24 не існує); «K24» = назва Behance/Dribbble-публікацій того ж проєкту (К=«Композиция», 24=Хавська 24). WebSearch підтвердив: Behance-кейс описує саме «Kompozitsiya No.24».

- 🧭🎨⚙️🎬✍️ — **усі дані = глава COMPOSITION NO.24** (display Karloff Negative Bold · палітра #fff/#000+#f50000 · нативний скрол + barba · house-ease ×49 + овершут · супрематичний інтро-морфінг · char-wave · visual search квартир · продають мистецтво/авангард).
- 💎 Специфічно для «K24»-іпостасі: navigation transition окремо відзначений Awwwards-колекцією «navigation-transition-k24». **Що вкрасти: НЕ заводити окремий запис у дослідженнях — рахувати як 1 сайт VI** (інакше подвійний облік прийомів у статистиці).

---

## HOUSE AT KHLEBNY (Дом на Хлебном) — ДНК
> hleb-dom.ru — DEAD (пізніший hleb-dom.ru = ЧУЖИЙ MODX-ребілд, НЕ VI) · джерело: **Wayback-сирці VI-версії 2016-17** (повний HTML <meta Author="Vide Infra Group"> + global.css + intro.js 100KB) · 2016 · клубний дім де-люкс (Москва, Хлебный пер. 19; памʼятка архітектури) · Awwwards SOTD + CSSDA WOTD + Golden Site Silver

### 🧭 Структура / роутинг
- **One-pager — 6 fullscreen-екранів (пейджер, не скрол):** intro (canvas-маска) → концепція → історія → розташування (мапа) → квартири (вибір поверху) → дизайн дому. **Nav 5 пунктів = 5 екранів:** Дом на Хлебном · Дом с историей · Расположение · Квартиры · Дизайн дома (+EN/Ру + «Заказать звонок»).
- **Visual-search: екран «Квартиры» = floor-navigation «Выберите этаж»** — 8 поверхів зі лічильником квартир на кожному (2-3 кв./поверх), floor-nav у Ristretto. + поверхові плани як підсторінки.
- Кредит у футері: «Сайт сделан в [Vide Infra]».

### 🎨 Дизайн-система
- **Шрифти: Ristretto Slab Pro Regular (display — всі h1-h5, nav, лічильники, маркери мапи) + Maiola Pro (TypeTogether SERIF як ТІЛО — рідкість; Regular/Italic/Bold).** H1 5→10rem; .h1-large 12→**18rem ≈180px**, lh .89. H2 3.5→6rem. Body 1.6rem serif. H1:body ≈11:1 — найбільший контраст серед ранніх VI. Капс лише 9 правил — серифна елегантність замість капсу. Fluid НІ (пороги до 2560px!).
- **Колір:** #fdfbf7 тепла слонова кістка (×61, БАЗА) · **#d49256 акварельна карамель/охра (×50, акцент)** · #211c24 чорнильно-сливовий (×36). Теми ui-dark/light/black-background + **data-left-theme/right-theme — РОЗДІЛЬНІ ТЕМИ ЛІВОЇ І ПРАВОЇ ПОЛОВИН ЕКРАНА(!)**. Чисті майже ні (#000 ×3). CSS vars: немає (2016).
- **UI:** текстові лінки-CTA в **нижньому регістрі** («узнать о проекте», «читать историю») — «тихий» люкс; цифра-заголовок («16»); лічильник галереї «1 / 27» в Ristretto.

### ⚙️ Код-движок
- **ЕКРАННИЙ ПЕЙДЖЕР** — $.fn.pageController + $.fn.scrollable (fullscreen .screen js-screen слайди), jQuery webpack-збірка. CMS Bitrix-кеш. WebGL: НІ — **canvas 2D**.

### 🎬 Рух
- Головна крива **(.68,0,.265,1) ×19** (глибокий easeInOut) · house (.25,.74,.22,.99) ×4 · (.29,.73,.45,1) ×4 · анти-овершут ×1. JS: Expo-сім'я. Durations .4s ×5 · .8s ×4.
- Reveal: appear ×18 + **data-splitlines** (порядкове розкриття тексту). Parallax мінімальний (×6 в shared.js).
- WOW: ① **Canvas-MASK інтро — intro.js 100KB: canvas 2D + globalCompositeOperation + mask ×38 = акварельна маска-проявлення** (малюнок «проступає» як фарба); ② спліт-теми половин екрана; ③ floor-navigation «Виберіть поверх»; ④ акварельні ілюстрації історичних подій (Локкарт 1918) як медіа-мова; ⑤ велетенський Ristretto 18rem. prefers-reduced-motion: 0.

### ✍️ Копірайт і сенс
- Hero: **«Дом на Хлебном»** + суб «Памятник архитектуры в престижном районе Москвы, отреставрированный под жилье класса де-люкс». Section-H1: «Дом с историей» · «Расположение» · «Квартиры» · «Дизайн дома». H2: «Концепция дома» · «Уникальное прошлое» · **«16»** (цифра-заголовок) · «Заказать обратный звонок». H3: «Бесшумные лифты» · «Консьерж-сервис VIP-уровня».
- Легендарний блок: «В 1918 году здесь проживал глава английской дип. миссии Роберт Локкарт, предложивший Красным Латышским Стрелкам миллионы за измену…» — **справжній історичний трилер як продающий текст**.
- Тон: музейно-поетичний; копірайт читається як екскурсія. CTA в нижньому регістрі: «узнать о проекте» · «читать историю» · «увеличить масштаб».
- **Big Idea: купуючи квартиру — купуєш шматок історії.** Бізнес-логіка: де-люкс через спадщину (≈18 квартир у памʼятці); конвертує рідкістю + дзвінком.

### 💎 Signature
- За 5 сек: слонова кістка + охра-акварель + чорнильний слив, серифний Maiola-текст, Ristretto 180px, акварельні ілюстрації революції 1918.
- Найкрутіший момент: canvas-mask інтро — акварель «проступає» крізь маску (без WebGL).
- Що вкрасти: історичний сторітелінг як головний продукт · спліт-теми лівої/правої половини · лоуеркейс-CTA · цифра-заголовок як гачок.

## LEVEL (Barvikha Residence) — ДНК
> level-barvikha.ru живий, але це ЧУЖИЙ WordPress-ребілд; VI-версія (SiteSupra CMS) DEAD · джерело: **Wayback-сирці** (повний home HTML + main.css 206KB + app.js 400KB) · ≈2015-17 (px-епоха) · ЖК преміум у передмісті (Барвіха; архітектор Юрій Григорян) · Awwwards SOTD + CSSDA WOTD · scope VI: ПОВНИЙ бренд (нейминг, айдентика, брошура, 3D, сайт)

### 🧭 Структура / роутинг
- **Home = 5 fullscreen-слайдів (вертикальний слайдер-пейджер):** main (hero спліт left/right) → slide-1 (**Природа↔Технологии**, внутрішні slideshow) → slide-2 (**Пригород↔Столица**) → slide-3 (архітектор/інтервʼю) → slide-4 (планувальник/CTA).
- **Nav 7 пунктів:** О проекте · Расположение · Квартиры · Дизайн · Преимущества · Инфраструктура · Новости + EN + телефон + «заказать звонок».
- **Visual-search: «Планировщик — Вы»** — інтерактивний планувальник квартири (слайд 4 home + сторінка Квартиры): floor-data h2 .title **76px цифри** поверху/ціни + .price + форма + section-calculator. Мапа з категоріями місць (.places-categories).
- CTA нижнім регістром: «заказать звонок» · «подробнее» · «смотреть карту проезда» · «смотреть интервью».

### 🎨 Дизайн-система
- **Шрифт ОДИН: Circe (Paratype; файли 100/200/300/400/700/800).** Патерн «великий тонкий + дрібний капс»: H1–H5 **36px lh 24px fw 200** + small-лейбл усередині хедінга 11px fw600 UPPERCASE. Display-цифри 76px (.floor-data) і 112px fw100 (404). Body .secondary 13px uppercase. H1:body ≈2.8:1 — «велике» живе лише в цифрах планувальника. **PX-сітка (не rem!) — найстаріша система**, MQ 797/979/1024/1279/1599.
- **Колір:** #fff БАЗА (×98, світлий сайт — рідкість для VI) · текст #676265/#333 · **акцент #2dbcb6 бірюза («природа+технології»)** + #f7931d помаранч дрібний · сланцево-сині панелі #384957/#475764. Без класової системи тем (px-епоха).
- **UI:** hairline 1px #dddedb/#e9e9e9 світлі · #576774 на сланці; текстові CTA лоуеркейс + pill-кнопки 110px.

### ⚙️ Код-движок
- **Вертикальний слайдер-пейджер** (.slider > .slide), jQuery ×34 + touch-swipe, scrollTo ×44; videojs (fullscreen-інтервʼю з архітектором); canvas-2D мікроелементи (loader). SiteSupra CMS. WebGL: НІ (THREE у бандлі = константа swipe-fingers).

### 🎬 Рух
- JS-головна **easeInOutQuint ×10** · easeOutQuint ×5 · CSS easeOutQuart (.165,.84,.44,1) ×4 · easeInQuart · easeInOutSine. База **0.3s ×85** · 0.15s ×25 — швидкий UI-темп (не luxury-повільність). Reveal = слайдова зміна екранів + внутрішні slideshow. Parallax/pin: нема (пейджер). prefers-reduced-motion: 0.
- **WOW: СПЛІТ-СЛАЙДИ-ДУАЛЬНОСТІ** — кожен слайд фізично ділиться на 2 половини-антоніми (slide-part-eco↔engineering, suburbs↔capital) = **бренд-ідея балансу ВІЗУАЛЬНО, лейаутом**; «Планировщик — Вы»; fullscreen-відео інтервʼю.

### ✍️ Копірайт і сенс
- Hero: **«Level BARVIKHA RESIDENCE»** + лід «Комфорт современной городской квартиры — В окружении природы лучшего района Подмосковья — ваша жизнь в идеальном балансе».
- H2 ПАРАМИ-антонімами: «Природа» ↔ «Технологии» · «Пригород» ↔ «Столица» · «Юрий Григорян архитектор проекта» · «Планировщик — Вы» · «Интервью» · «Первозданность» · «Инфраструктура».
- Поетика сенсорна: «Аромат хвойного леса. Им невозможно надышаться… Хвойный лес, звездное небо, поющие птицы — это ваши новые соседи» · «…спустя 25 минут оказаться в самом сердце столицы». Планувальник: «Можно играючи подстраивать пространство квартиры под свои мечты».
- **Big Idea: «ваша жизнь в идеальном балансе» — баланс пар протилежностей, зашитий і в назву Level (рівень=рівновага).** Бізнес-логіка: продають БАЛАНС і ПРИРОДУ без втрати міста (ліс + Москва за 25 хв) + персоналізацію простору; конвертує планувальником (інтерактив як CTA) + дзвінком.

### 💎 Signature
- За 5 сек: білий + бірюза #2dbcb6 + сланцевий синій, Circe 200 з дрібним капс-лейблом, слайди розрізані навпіл на пари-антоніми.
- Найкрутіший момент: бренд-ідея «баланс» = композиція сайту (кожен екран = дві протилежності).
- Що вкрасти: спліт-екран як носій бренд-ідеї · патерн «тонкий 36px fw200 + 11px UPPERCASE лейбл» · «Планировщик — Вы» (пряме звертання + інтерактив як CTA) · сенсорний копірайт (запах лісу замість «екологічність»).

---

## LOFTEC — ДНК
> loftec.ru — DEAD (DNS не резолвиться) · джерело: **Wayback-сирці** (повний HTML + global.css + landing.js + shared.js, capture ≈2017-18) · ~2017 · ЖК/апартаменти-лофти (Москва, ЦАО; девелопер Coldy, CMS Bitrix) · CSSDA WOTD + Tagline Silver

### 🧭 Структура / роутинг
- **Home 8 секцій — АКРОНІМ LOFTEC:** intro (вибір літери) → **L**ifestyle → **O**pportunities → **F**usion → **T**echnologies → **E**xpanse → **C**oldy → новости. **Структура всього сайту зашита в назву бренду.**
- **Nav мінімальна (фокус на скрол-сторітелінг home):** Планировки и цены · Коммерческая недвижимость · телефон +7 495 933 83 60 · «Записаться на показ».
- **Visual-search: вкладка nav «Планировки и цены»** (вибір апартаментів) + сторінки окремих юнітів /apartments/904/. Інші сторінки: галерея (renders/interiors/improvement) · location · about (architecture, technical-solutions) · actions.
- CTA: «Записаться на показ» (головний, ×3 секції) · «Рассчитать ипотеку» · «Узнать больше про "Умный дом"».

### 🎨 Дизайн-система
- **Шрифт ОДИН: Graphik Web / GraphikLC** (кирилична версія Commercial Type; Light 300 + Regular 400; в CSS юзаються fw **100/200** — браузер мапить на Light). H1 2.8→**7rem ≈70px** fw 200; .text--h2-large fw **100**. Body 13px lh 2em. H1:body 5.4:1. **Ієрархія НАДЛЕГКИМИ вагами (100/200 на 70px), не капсом** (капс — 3 правила). Caption ls .15em/.09em.
- **Колір:** **#2f3338 графітовий сланець (БАЗА)** · **#a37063 глиняна теракота (акцент = цегла лофту)** · #d3d3d3 світло-сірий · #777c82 сіро-блакитний · #df9e70 пісочний. Теми .ui-base-background/.ui-secondary-background/.ui-dark-background. Чисті: #000 ×1 (майже нема). CSS vars: НЕМАЄ (2017).
- **UI:** контентні max-width 960/939/840px; кнопки прямокутні дрібні (h 22px, r 3px); 12-рядкова вертикальна сітка (layout-height-12).

### ⚙️ Код-движок
- **НАТИВНИЙ скрол** + scrollTo ×28 + IntersectionObserver; jQuery-архітектура (Bitrix), fancybox. Canvas-2D інтро (js-intro: getContext("2d") + офскрін-канвас для переходів). WebGL: НІ.

### 🎬 Рух
- House (.25,.74,.22,.99) ×4 · (.46,.01,.54,1) ×2 · JS Expo-сім'я (easeOutExpo/InOutExpo/InExpo ×2 кожна). Durations .4s ×5 · .8s ×3 · .625s/1.25s; JS 750ms.
- Reveal: плагін appear — **data-appear-effects="fade | image | text"** (3 іменовані ефекти) + transition.generateInSequence. Parallax: $.fn.parallax є в shared.js, у розмітці НЕ використаний. prefers-reduced-motion: 0.
- **WOW: «Виберіть літеру»** — інтро = інтерактивний вибір літер L-O-F-T-E-C, кожна літера відкриває свою секцію (навігація як гра); тематична рекольоровка секцій.

### ✍️ Копірайт і сенс
- Hero: **«LOFTEC»** (1 слово) + інтро-запрошення «Выберите букву» + суб «Concept Loft by Coldy».
- H2 — **білінгва-заголовки (en-слово + ru-розшифровка):** «Lifestyle / Стиль жизни» · «Opportunities / Возможности» · «Fusion / Синтез» · «Technologies / Технологии» · «Expanse / Пространство» · «Coldy / Колди». Ключові рядки: «Лофт в центре Москвы» · «Потолки до 4 м» · «Робот-консьерж в лобби» · «Пространство для избранных» · «Уникальные виды на старую Москву».
- Тон: технологічний, молодий, статусно-урбаністичний — «для избранных», але без пафосу старих грошей. Цифри: 98.7 м² · скидка 7,8 млн · потолки 4 м · 5 минут от метро · Coldy с 2004.
- **Big Idea: назва бренду = карта сайту — LOFTEC як акронім шести цінностей.** Бізнес-логіка: продають ТЕХНОЛОГІЧНИЙ СТИЛЬ ЖИТТЯ для молодих амбітних (smart home, робот-консьєрж) — ідентичність «я сучасний»; конвертує показом («Записаться на показ») + іпотека-калькулятором.

### 💎 Signature
- За 5 сек: графіт #2f3338 + теракота #a37063, надлегка Graphik 100/200 величезним кеглем, інтро «Выберите букву».
- Найкрутіший момент: акронім-навігація — 6 літер бренду = 6 секцій, вибір літери як гра.
- Що вкрасти: «назва = карта смислів» · ієрархія вагою замість капсу · білінгва-заголовок як дешевий «преміум».

---

## NEVA TOWERS — ДНК
> nevatowers.ru — DEAD (DNS знятий) · джерело: **Wayback-сирці** (home HTML + global.css + index.css + shared.js 416KB) · ≈2016-19 · ЖК-хмарочоси Москва-Сіті (апартаменти + офіси + торгова галерея; девелопер Ant Yapı) · особливість: VI зробили ДВА сайти — промо + внутрішній sales-office інструмент

### 🧭 Структура / роутинг
- **Home = вертикальний fullscreen-пейджер** ($.fn.pager, slider-vertical) — сайт як презентація вежі «поверх за поверхом» (повний перелік слайдів n/a — динамічний контент).
- **Nav 17 пунктів (найбільша nav серед усіх):** Апартаменты в продаже · Апартаменты в аренду · Пентхаусы · ТАУНХАУСЫ В АРЕНДУ · Торговые помещения · O проектe · Расположение · Жизнь в Neva · Фильм · Условия · Галерея интерьеров · Виды · Команда · Документы · Новости · Контакты · Брошюра + EN + 中文 (**3 мови — єдиний тримовний**).
- **Visual-search: каталог «Апартаменты в продаже»** (+ оренда/пентхаусы/таунхаусы/комерція — 5 продукт-ліній) + **ОКРЕМИЙ companion-сайт для sales-офісу** (підбір апартаментів менеджером — з кейсу VI).
- CTA: «Отправить запрос» · «Записаться…» · телефони + WhatsApp.

### 🎨 Дизайн-система
- **Шрифт: RobotoCondensed self-hosted (300/400/600 + italics)** — і display, і UI; Roboto другорядна. H1 4.8→**12rem ≈120px, lh 0.83em** (щільніше за 1!), fw 500; .h1-medium 8rem fw600. H2 4rem fw 300 ls .04em. Body 1.6rem fw300. H1:body 7.5:1. Великі цифри в slider-vertical. Капс — 21 правило (лейбли, «ТАУНХАУСЫ В АРЕНДУ»).
- **Колір:** **#cabd9b шампань-золото — ГОЛОВНИЙ акцент (×57!)** + #b2a78c темніше золото · нічний нейві #1c1f2a/#242735 (темна база) · теплий off-white #f1efed · бургунді #6e1427 ×3. **Фірмовий hairline = золото в альфі: hsla(43,20%,62%,.07) і .2 — золоті лінії як ДНК-елемент.** Чисті #000/#fff: так. CSS vars: немає.
- **UI:** max-width 1220/1060px; кнопки .btn flex з .icon + **вертикальні кнопки .btn-vertical (текст боком)**; radius 0 + 3-7px форми.

### ⚙️ Код-движок
- НАТИВНИЙ скрол + **jQuery ×55 плагін-архітектура (data-plugin="$.fn.pager", "$.fn.defaultCarousel")**. Reveal через пейджер-слайди (не scroll-reveal). Parallax: нема. WebGL: НІ. Полифіли object-fit (старі браузери).

### 🎬 Рух
- House (.25,.74,.22,.99) ×4 · JS Expo-сім'я (easeIn/Out/InOutExpo ×2). Durations швидкі: .4s ×4 · .2s ×2 (UI-темп). prefers-reduced-motion: 0.
- WOW: fullscreen vertical pager · золоті hairline-сітки · sales-office companion-site · тримовність RU/EN/中文.

### ✍️ Копірайт і сенс
- Hero: **«Апартаменты Neva Towers с собственным парком в центре Москвы»** (8 слів — **UTP прямо в H1**: «собственный парк» = диференціатор серед хмарочосів Сіті). H2: «Лидер продаж в Москве».
- Тон: статусний, прямий, «лідерський» — без поетики, факти статусу; претензія на лідерство як факт.
- **Big Idea: вертикальне місто з власним парком у Москва-Сіті — статус ділової вершини.** Бізнес-логіка: продають СТАТУС і ЛІДЕРСТВО для міжнародної аудиторії (EN/中文 = інвестори); конвертує каталогом 5 продукт-ліній + запитом/WhatsApp + брошурою-PDF.

### 💎 Signature
- За 5 сек: нічний нейві + шампань-золото #cabd9b, золоті hairline-лінії, Roboto Condensed 120px, вертикальний fullscreen-пейджер.
- Найкрутіший момент: home як вертикальна колода слайдів — презентація вежі поверх за поверхом.
- Що вкрасти: формула фірмового hairline = акцент-колір у hsla .07/.2 (золота сітка задешево) · UTP в H1 замість абстрактного слогана · companion-інструмент для відділу продажів.

## REPUBLIC — ДНК
> republic.house — DEAD (DNS повністю знятий; Wayback заархівував лише JS-щит і паркувальний lander — реальний контент НІКОЛИ не заархівовано, анти-бот) · джерело: **ТІЛЬКИ case-page videinfra.com/work/republic** (datePublished 2024-03-11; сайт ≈2023) · ЖК преміум-квартал (Москва, Пресненський Вал — 10 веж 24–45 пов. навколо 4 відреставрованих корпусів вагоноремонтних майстерень; FORMA)

### 🧭 Структура / роутинг (з кейсу; сирців НЕМАЄ)
- Сторінки, згадані в кейсі: home → **історія проєкту** («creative and original animation … as if turning the pages of a history textbook» — гортання як підручник історії) → **Lifestyle** («feeling of traveling through the four historical buildings» з **інтерактивною мапою-супутником, що завжди на екрані** — не збитися з маршруту) → **вибір будинків/квартир** → **3D-мапа кварталу** («walk along the boulevards and courtyards») → purchase / call order («навіть технічні сторінки — індивідуальний дизайн»).
- **Visual-search: ТАК (дослівно з кейсу):** «Convenient selection of houses and apartments on a visual render and by specific parameters» — рендер + параметри, два рукави як у великих VI.
- **Принцип звʼязків:** «Various interactive solutions that are not similar to each other on each page» — КОЖНА сторінка має ВЛАСНИЙ унікальний інтерактив, «retaining its individuality but obeys the general style».

### 🎨 Дизайн-система
- n/a точно. З кейсу: «Bold typography», «large images, various compositions and large typography», **«cut-out objects»** (вирізані обʼєкти без фону), «additional infographics», кастомні мапи в бренд-стилі; «texture and atmosphere … in the heart of history» — фактура цегли, історична атмосфера.

### ⚙️ Код-движок / 🎬 Рух
- n/a (сирців нема). WebGL: ймовірно так (інтерактивна 3D-мапа кварталу) — непідтверджено. Названі інтерактиви: textbook-гортання історії · 3D-прогулянка бульварами · мапа-супутник на Lifestyle.

### ✍️ Копірайт і сенс
- hero H1: n/a. Кейс-теза: «Republic is a modern residential complex that has grown up around four restored industrial buildings. **Republic invents a new lifestyle at the center of history.**»
- Філософія: «integrating the style of the brand and the style of architecture»; «special attention to the historical component — the history of the place and the unique historical architectural objects that the restorers worked on».
- **Big Idea: новий спосіб життя в серці історії.** Бізнес-логіка: продають ІСТОРІЮ як розкіш (автентичність, реставрація, фактура) + лайфстайл кварталу.

### 💎 Signature
- За 5 сек: фактурна історична цегла + жирна типографіка + cut-out обʼєкти; кожна сторінка з власним інтерактивом.
- Найкрутіший момент: історія проєкту як гортання підручника + 3D-прогулянка кварталом.
- Що вкрасти: «кожна сторінка = власний унікальний інтерактив, але в одній системі» · мапа-супутник як постійний орієнтир · visual search рендер+параметри.

---

## ASTRIS — ДНК
> astris.ru / astris-club.ru — DEAD (000) · джерело: **case-page videinfra.com/work/astris + скріншоти + кейс-відео Vimeo** (живих сирців НЕМАЄ) · ≈2019-20 · ЖК-люкс «Резиденции на Косыгина» (Воробйови гори; неокласика/Палладіо; клієнт HNWI 50+) · CSSDA WOTD + Communication Arts · обсяг VI: ВСЕ — нейминг (Astris = «of the stars»), брендинг, 3D, ілюстрації, фото, принт, сайт

### 🧭 Структура / роутинг
- n/a точно. Патерн з кейсу: **«long, story-like pages with contrasting design»** — довгі сторінки-оповіді з чергуванням темне/світле. Підтверджений розділ: «КОНЦЕПЦИИ КВАРТИР». Visual-search: n/a. Nav: n/a.

### 🎨 Дизайн-система (зі скріншотів)
- Display: висококонтрастна елегантна антиква (лого ASTRIS із **зіркою-діамантом замість крапки над A**); дрібне ВСЕ uppercase з широким трекінгом — «гравірувальний» ритм; параграфи serif. px: n/a.
- Колір: чорно-шоколадний фон ≈#1d1714 · золото/бронза ≈#c89a6a (лого, акценти) · крем/білі картки-«розвороти» · ч/б портрети. Книжкова верстка: вузькі текст-колонки, великі поля; **колаж-механіка** — фото + предметні рендери (камені, графіт) поверх карток як «ілюстрована енциклопедія». Radius 0.

### ⚙️ Код-движок / 🎬 Рух
- n/a (бандл недоступний). **ІНТРО: WebGL — будинок «складений із зірок» морфиться у 3D-рендер** (єдиний named-прийом; самі VI: «final subtle yet very effective addition»). Ім'я бренду = механіка інтро.

### ✍️ Копірайт і сенс
- hero H1: n/a (інтро = WebGL-морфінг; лого-блок «ASTRIS / РЕЗИДЕНЦИИ НА КОСЫГИНА»). Tagline (en): **«True values last forever like a scattering of stars in the night sky»**.
- Жанр секцій: **цитати архітектора (Дмитрий Великовский) і дизайнерів United Design Partnership — пряма мова як головний жанр.** Цифри-аргументи: «через 20 лет», «50 или даже 100 лет» (аргумент тривалості вартості).
- Тон: статусний, позачасовий, енциклопедичний («вічні цінності», «поза трендами»). Метафора-ім'я пронизує все: зірка в лого → зоряне інтро → «жители как звёзды в созвездии».
- **Big Idea: вічні цінності тривають як розсип зірок — дім поза часом, що тримає вартість 50–100 років.** Бізнес-логіка: продають ВІЧНІСТЬ і валідацію покупки для HNWI; контент-глибина (історія стилю, маршрути прогулянок) = інструмент довіри.

### 💎 Signature
- За 5 сек: шоколад+золото, антиква з зіркою-діамантом, гравірувальний uppercase-трекінг, палладіанські рендери в осінньому світлі.
- Найкрутіший момент: WebGL-інтро — будинок складається із зірок і морфиться у фотореальний рендер.
- Що вкрасти: «ілюстрована енциклопедія» як стратегія люксу (глибина контенту валідує ціну) · цитати архітектора як жанр · бренд-метафора, що проростає в моушн-прийом.

---

## FAIRY FOREST (Сказочный лес) — ДНК
> live_url невідомий/мертвий (Seven Suns; кандидати 000/444) · джерело: **case-page videinfra.com/work/fairy-forest + скріншоти кейсу** (живих сирців НЕМАЄ) · ≈2019-21 · великий ЖК біля лісу/заповідника (Москва) · CSSDA Website of The Day + Tagline Silver

### 🧭 Структура / роутинг
- **Слайдо-сторійна структура «1 атрибут = 1 екран-слово»** (з кейсу: «rich visual story for each of the attributes»; «unorthodox yet extremely simple navigation» — горизонтально-сторійна навігація скролом). Хінт «ИСПОЛЬЗУЙТЕ СКРОЛЛ» + жовтий прогрес-бар знизу. Хедер: бургер · лого · телефон · кнопка-дзвінок. Visual-search: n/a (на скрінах не видно). Точна к-сть екранів: n/a.

### 🎨 Дизайн-система (зі скріншотів)
- Display: **фет-фейс дідона** (high-contrast, дуже жирна, тонкі засічки; кирилиця) — ОДНЕ гігантське слово ≈25-30% висоти екрана поверх фото. Body: геометричний гротеск; лейбли uppercase letterspaced. Третій: лого-леттеринг «Сказочный лес» (казковий serif з деревом).
- Колір: глибокий лісовий зелений ≈#0e3a26 · **жовтий акцент ≈#f7c81e** (гігант-слово, CTA-кружок, прогрес-бар) · світлий лавандово-білий ≈#eef0f8. Чергування: повноекранне фото ↔ світла секція (split: фото зліва / панель справа). Кнопки = круглі кружки (бургер, телефон, стрілка-CTA). Ілюстрації — зелені гілочки-вектор як підпис бренду.

### ⚙️ Код-движок / 🎬 Рух
- n/a (бандл недоступний). Патерн: сторі-навігація без меню, скрол-хінт, прогрес-бар.

### ✍️ Копірайт і сенс
- Hero: **«Природа»** (1 слово!) + лейбл «ВАШ ДОМ — В САМОМ СЕРДЦЕ ЗАПОВЕДНИКА». Секції = гігантські ОДНОСЛІВНІ іменники-цінності: «Природа» · «Красота» · (інші слайди недоступні; патерн = слово-емоція на кожен атрибут).
- Тон: емоційно-сенсорний, тепла казка; фото = дитина з лисицею, пара на велосипеді (ЖИТТЯ, не архітектура). CTA: телефон-кружок +7 499 777-20-20 · «ДОКУМЕНТЫ» · стрілка-далі.
- **Big Idea: дім у серці заповідника — кожен атрибут ЖК спроєктований на чуттєвий пейзаж як емоційна вигода.** Бізнес-логіка: продають ПРИРОДУ і емоцію життя в казці (не метри, не статус) — найчистіший atmosphere-depth кейс VI.

### 💎 Signature
- За 5 сек: гігантське жовте дідона-слово поверх фото дівчинки з лисицею + лісовий зелений + жовтий кружок.
- Найкрутіший момент: розповідь = послідовність однослівних емоцій-екранів зі скрол-хінтом.
- Що вкрасти: «слово-цінність як секція» (1 іменник = 1 екран = 1 атрибут) · сенсорні lifestyle-фото замість рендерів для продажу природи.

---

## JAYASOM — ДНК
> jayasom.com — домен живий, але VI-сайт ЗАМІНЕНО (зараз HubSpot CMS) · DEAD (оригінал) · джерело: **Wayback 2022-01-24, повні живі сирці** (бандли ≈лип.2020) · 2020 · **НЕ нерухомість** — ultra-luxury WELLNESS-компанія (керування destination-резортами; аудиторія = партнери, резорти, ІНВЕСТОРИ) · CSSDA WOTD + Communication Arts + Rating Runeta Bronze

### 🧭 Структура / роутинг
- **5 сторінок:** home + /about-us + /for-owners + /get-in-touch + /privacy-policy. **Home = 6 WebGL-сцен** (anchor-навігація /#1-1…/#6): Wellness Wisdom (hero) → Mind, Body, Spirit → Benefits → **Modes (струни-меню 6 послуг)** → Places (4 локації) → Opportunities (CTA).
- Nav: About us · For owners · Get in touch (+якорі 6 сцен). Visual-search: нема (не каталог); **Places = локації зі статусами-маячками «Open Now — Jeddah, KSA» · «Opening Soon — Ibiza» · «Opening Later — Hyderabad» · «Japan»** — roadmap для інвестора.
- Особливість: окремі desktop/mobile бандли (global-desktop.css — UA-розгалуження на сервері).

### 🎨 Дизайн-система
- **Шрифт ОДИН: Mont (Light 300 + Regular 400 — НУЛЬ bold, light-люкс).** H1 4→**6.8rem = 68px**, lh 1em, ls −.04em. H2 22px. Body 14→16px. **H1:body 4.3:1 — еталон камерної стриманості (НЕ гігантизм).** Лейбли ls .16em. Fluid НІ.
- **Колір — ТРИКОЛІРНА система з РІВНИМИ частотами: #fff ×30 · #0006ff ×30 · #000 ×29.** Чистий ультрамарин #0006ff = ПОВНОЦІННИЙ ФОН сцен (не акцент-крапка); #4d51ff ховер. Сцени перемикають білий↔синій. Чисті #000/#fff: ТАК.
- **UI:** сцени-полотна на весь екран (без контент-контейнера); пілюлі 30/80/100px; SVG-лінії з data-dashoffset-from/-to (розчерки).

### ⚙️ Код-движок
- **Scroll-jacked СЦЕНИ** (без Locomotive/Lenis; data-nav-next-duration) + barba.js ×8. **WebGL МАСИВНО: PixiJS ×199 + сирі шейдери** (90 varying, 25 gl_FragColor) — ВСЯ подача = WebGL-сцени (кейс підкреслює CPU-оптимізацію «state-of-the-art»).

### 🎬 Рух
- **Власна фірмова крива (.26,0,.22,1) ×32** (НЕ глобальна VI-крива!) · easeInOutCubic (.645,.045,.355,1) ×11 · JS easeOut/Expo. Durations .45s ×14 · .8s ×12 · **3.5s ×15 (амбієнт — повільний wellness-темп)**.
- **WOW:** ① «Природа→силует» — фото природи морфляться в людські силуети від взаємодії юзера (комунікаційна концепція в WebGL); ② **«Струни»** — лінії-струни тягнуться крізь усі сцени, реагують на курсор хвилею; ③ у Modes струни розпадаються на прямі лінії = **ІНТЕРАКТИВНЕ МЕНЮ 6 послуг (декор → навігація)**; ④ сцен-переходи. Parallax класичного нема; pin 0 (сцени тримають вьюпорт). prefers-reduced-motion: 0.

### ✍️ Копірайт і сенс
- Hero: **«Jayasom» + H2 «Wellness Wisdom» + CTA «Explore»**. Hero-параграф: «Find us on the road less travelled, where reflection and contemplation are at ease and where time seems to stands still, where your whole person — mind, body and spirit — is nourished and restored.»
- Сцени: «Wellness Wisdom» · «Mind, Body, Spirit» · «Benefits» · «Modes» (Holistic Therapies · Physiotherapy · Fitness · Nutrition · Beauty · Spa & Body) · «Places» · «Opportunities».
- Тон: медитативно-поетичний («road less travelled»), 1-2-слівні заголовки; тріада «Mind, Body, Spirit»; майже нуль цифр (B2B-емоція, не ROI-таблиці).
- CTA: «Explore» · «Get in touch» · «New property management request» · «For owners».
- **Big Idea: природна краса стає внутрішньою частиною людини — wellness як мудрість, не послуга.** Бізнес-логіка: B2B-сайт, що говорить мовою медитації — інвестора занурюють у продукт замість пітч-деку; конвертує атмосферою + статусами Open Now/Soon/Later (наратив експансії) + формою for-owners.

### 💎 Signature
- За 5 сек: чистий ультрамарин #0006ff + Mont Light + струни, що хвилюються за курсором; фото природи морфяться в силуети.
- Найкрутіший момент: струни розпадаються і стають інтерактивним меню Modes.
- Що вкрасти: трихромія з рівними частотами (акцент як повноцінний фон) · декор-елемент, що перетворюється на навігацію · 3.5s-амбієнт для «дорогої» тиші · статуси-маячки як наратив експансії.

---

## VICTORY PARK RESIDENCES — ДНК
> vp.moscow · live, GEO-BLOCKED з-за кордону (зонд Wayback 2025-12-25, повний HTML ru + бандли лист. 2025) · ≈2020 · ЖК елітні резиденції (Москва, біля Парку Перемоги; **ANT Development — той самий девелопер, що Poklonnaya 9**; 448 квартир + 56 резиденцій з патіо + 20 видових лотів)

### 🧭 Структура / роутинг
- **Nav 13 сторінок:** Выбор квартир · Пентхаусы · Дизайн · Галерея · Расположение · Инфраструктура · Преимущества · Как купить · Ход строительства · Команда · Документы · Новости и акции · Контакты (+лічильник обраного в хедері) + EN-версія (2 мови).
- **Visual-search: вкладка nav «Выбор квартир»** + фінальна секція home «Сделайте свой выбор» + карткові скрол-стрічки вибору (choiceCardList + cardScroll) + **favourite-система з лічильником у хедері + PDF-презентація пентхаусів (36.11 mb)**.
- **Home 12 секцій, ритм dark→light→brown→dark:** hero (ui-dark, ціна+скрипт) → знакові місця (placesNav: Парк Победы / Триумфальная арка / Кутузовский) → факти 448/56/20 → дизайн/відделка (ui-light) → інтервʼю з архітектором (ui-brown) → інфраструктура → пентхаусы (PDF) → новини → «Сделайте свой выбор» → контакти.
- Воронка: ціна одразу в hero (фільтр аудиторії) → статусна географія як доказ → вибір квартир/пентхаусів → favourites → контакт.

### 🎨 Дизайн-система
- **5 шрифтових родин — найбагатший стек серед усіх VI-сайтів:** SangBleu Empire Regular 400 (display, Swiss Typefaces; всі h1-h5) + Euclid Square 300/400/500 (body) + **Wonder Garden Script 400 — РУКОПИСНИЙ акцент** («Victory Park», «Residences», «Элегантный дизайн») + SangBleu Sunrise 400 (*-landing) + Codec Pro News 300.
- H1 base 3.95rem, **СПРАВЖНІ лінійні interpolation-формули посегментно**: calc(3.95rem + 39.5*((100vw−320px)/346)); lh 1.013em; ls −.02em, флюїдно тіснішає calc(−.02em + −.3*(…)). H2 calc(2rem + 32…59*(…)).
- **Інверсія типографічної стратегії:** body = **1rem (10px!) + флюїд, ls .1em, TEXT-TRANSFORM:UPPERCASE НА BODY** — весь базовий текст = капс-лейбли з широким трекінгом; серіфні заголовки в Sentence Case; третій шар — рукопис. H1:body ≈8:1+.
- **Колір:** #f9f0ec рожево-кремовий (×182) · **#ac835e БРОНЗА/кемел (×123, фірмовий)** · #181d24 глибокий синьо-чорний (×78, домінанта; ui-dark ×39) · #ca9d75 світла бронза (×59) · #cfa261 золото (×23) · #59413e шоколад (×19). Теми ui-dark/ui-light/ui-brown. Чисті #000/#fff майже ні — все тоноване тепло. Кольорових токенів нема; сітка --spacing/--col як у Eniteo (спільний VI-фреймворк).
- **UI:** колонкова --col-сітка (100vw/8→/12) + spacing 20px ×0.5–8; radius М'ЯКИЙ calc(--spacing/2) ×8, 30px ×6, 50%; кнопки .btn--primary двошарові :before (#181d24) + :after (#ac835e бронзова заливка); брейки 567/667/979/1199/1439 + aspect-ratio варіанти.

### ⚙️ Код-движок
- Кастомний smooth-scroll locomotive-класу (lerp .1) + **barba.js ×24** (+ ajaxPageLoaderChangeUrl, data-ajax-page-transition ×5). WebGL: **НІ** (0 згадок; 0 lottie).

### 🎬 Рух
- House **(.25,.74,.22,.99) ×34** + **(.74,0,.24,.99) ×22 — РІЗКИЙ вхід як друга робоча крива** · (.29,.73,.45,1) ×6 · (.55,0,.1,1) ×2. Durations: **амбієнт-домінанта 8s ×18 + 4s ×17** · 1.6s ×18 · 1.3s ×17 · 2s ×12 · 5000s ×2 (marquee).
- Reveal: appear ×26 + reveal ×12; іменні: apartment-list-in · button-in · header-intro · landing-intro · places-deco-in; stagger ×4. Parallax ×25 (патерни image ×16 · block ×4 · intro-image). Fixed ×13, sticky ×1 + stickyHeader.
- **WOW:** ① **data-appear-decode ×14 — ТЕКСТ-ДЕКОДЕР: літери «розшифровуються» при появі** (+чар-спліт у кнопках «В ы б о р к в а р т и р»); ② рукописний Script поверх серіф-гігантів (подвійна типографіка); ③ placesNav — навігація знаковими місцями; ④ карткові скрол-стрічки; ⑤ favourites + PDF. prefers-reduced-motion: ТАК ×2.

### ✍️ Копірайт і сенс
- Hero: **«ЖК Victory Park Residences»** + скрипт-оверлей «Victory Park / Residences» + лід **«элитные резиденции от 123 580 000 ₽» — ціна без сорому в першому екрані!**
- H2: «Знаковые Места» · «В Victory park Residences есть всё для того, чтобы наслаждаться любовью к себе и своим близким» · «Варианты Отделки» · «Интервью С архитектором проекта» · «Сделайте свой выбор». H3: «Парк победы» · «Триумфальная арка» · «Кутузовский проспект» · «здесь начинается свобода» · «448 Просторных Квартир» · «56 Резиденций с патио» · «20 Эксклюзивных видовых лотов».
- Тон: гедоністичний люкс («любовь к себе», «здесь начинается свобода»); наказовий спосіб у мʼякій формі («выберите», «оцените», «наслаждаться»). Цифри: 123 580 000 ₽ · 448/56/20.
- CTA: «Выбрать квартиру» · «Выберите ваш стиль» · «Оцените расположение» · «Сделайте свой выбор» · «Видео о проекте» · «PDF».
- **Big Idea: свобода і любов до себе над Парком Перемоги — гедонізм як перемога.** Бізнес-логіка: продають ГЕДОНІЗМ + СТАТУС МІСЦЯ (тріумфальна географія як соц-доказ); фільтрують аудиторію ціною в hero, конвертують вибором квартир + favourites-PDF.

### 💎 Signature
- За 5 сек: синьо-чорний #181d24 + бронза #ac835e + рукописний script поверх серіфа SangBleu Empire; боді = 10px капс-лейбли з .1em трекінгом.
- Найкрутіший момент: декодер-ефект літер (data-appear-decode) на серіфних заголовках + ціна 123,5 млн ₽ прямо в hero.
- Що вкрасти: інверсія типографічної стратегії (body-капс-лейбли + Sentence Case серіф) · третій рукописний шрифт як «підпис бренду» · різка вхідна крива (.74,0,.24,.99) у парі з фірмовою VI.

---

# ЧАСТИНА 3 — СПІЛЬНА ДНК СТУДІЇ

## Що інваріантно у ВСІХ (або майже всіх) 19 сайтах

**1. Движок — один скелет 10 років поспіль (міняються лише покоління):**
```
SSR HTML (EJS-шаблони, дані inline або /api) + Barba.js (SPA-переходи)
+ smooth-scroll (Locomotive-style virtual scroll, lerp .1) АБО нативний/пейджер у ранніх
+ data-plugin self-init реєстр (reveal | parallax | plan | carousel | tabs | appear | theme...)
+ per-section ui-тема (ui-dark/ui-light/ui-brown/ui-warm/ui-olive...) = ритм скролу
+ favourites shortlist + callback-форма (часто з прихованим currentPageLink)
```
- **0 GSAP, 0 React, 0 Lenis** на всіх зондованих. 4 з big-5 = jQuery-era tech з award-полішем.
- Покоління: **2015-17** jQuery-пейджери (Level, Neva, Khlebny) → **2017-19** нативний скрол + barba + appear (Loftec, Comp-24) → **2020+** locomotive-lerp .1 + токени + named-патерни (Eniteo, Jayasom, Victory Park, big-5, Pok-9, Azure).
- **WebGL дозовано: 0–1 момент на сайт** (SP=Zeus, AIR=/about-карусель, Azure=мапа, ERA=/3d-map поза home). Винятки: Springs (3 сцени на home) і Jayasom (вся подача PixiJS). Мапи — ЗАВЖДИ hand-built inline-SVG, **0 mapbox/google/leaflet** на всіх.

**2. rem-база: `html{font-size:62.5%}` (1rem=10px)** — на ВСІХ зондованих, крім Level (px-епоха). Пізні сайти + глобальні скейл-токени `--scale-text-rem`/`--scale-px`/`--scale-rem` (весь UI масштабується однією змінною) і aspect-ratio-aware медіа-запити (Pok-9 ×79, Azure).

**3. Ease-філософія: «один house-ease + дозволена власна друга крива».**
- **cubic-bezier(.25,.74,.22,.99)** — підпис студії, живе на 12 сайтах від 2017 (Loftec ×4) до 2025 (Azure ×25, Victory Park ×34); рекорд Springs ×72. Один сайт = одна домінантна крива з ВЕЛИКОЮ частотою.
- Власні криві окремих сайтів (свідомий відхід, не дрейф): SP easeOutQuad (.25,.46,.45,.94) · Eniteo (.39,.01,.04,1) · Jayasom (.26,0,.22,1) · Khlebny (.68,0,.265,1) · AIR-дует (.7,0,.3,1) · VP різкий вхід (.74,0,.24,.99) у парі з house.
- Рекурентні спеції: **анти-овершут (.47,.04,.5,−.06)** (Comp-24, Ever, Azure, Pok-9, Khlebny) і овершут (.25,.74,.22,1.1) лише в Comp-24.
- Durations-сітка: UI .4s · reveal .8s · luxury 1.6s · **амбієнт 3.5–8s** (Eniteo 4s ×47, Jayasom 3.5s ×15, VP 8s ×18 + 4s ×17) — «дорога тиша» = повільні фони при швидкому UI.
- Reveal-канон: opacity .005→1 (anti-CLS) або 0→1, БЕЗ transform; reveal-delay 1s на hero (Springs).

**4. Типографіка — головний висновок: «ГІГАНТСЬКИЙ РОЗМІР × ЛЕГКА ВАГА × МАЛО РОДИН».**
- H1 від 68px (Jayasom) до 513px (Ever h0); медіана big-5 ≈ 160–355px. Ваги display: 400–500 домінують; bold-display лише Karloff (Comp-24); люкс-полюс = надлегкі 100/200/300 (Loftec, Level, Jayasom, Eniteo Light).
- **1–2 родини максимум; «одна родина на все» = окрема дисципліна** (AIR Onest, Ever Avant Garde, SP TT Fors ОДНА ВАГА, Eniteo Axiforma, Loftec Graphik, Level Circe, Jayasom Mont, Neva RobotoCondensed). Єдиний виняток-максимум: Victory Park із 5 родинами (серіф + гротеск + рукопис) — і навіть там кожна має жорстку роль.
- H1:body від 4.3:1 (камерний Jayasom) до 19.7:1 (ERA); пізні сайти тяжіють до 10–20:1. Ієрархія будується розміром/вагою, НЕ кольором і НЕ капс-хаосом: uppercase-стратегія завжди ЄДИНА на сайт (все-капс AIR/SP ↔ нуль-капс Eniteo/Springs-інверсія).
- Негативний ls на гігантах (−0.02…−0.06em), широкий ls на дрібних лейблах (+.08…+.16em); голі цифри як заголовки (Eniteo «662», Khlebny «16», Comp-24 «8/9/7/20», Level 76px-цифри).

**5. Колір — token-формула: 1 дарк-база + 1 крем/світлий + 1 теплий акцент (+опційний градієнт/металік).**
- Палітри теплі, землисті; чисті #000/#fff лише там, де це КОНЦЕПЦІЯ (Comp-24 супрематизм, AIR ч/б, Jayasom трихромія). Error-колір теж кастомиться під палітру (Springs — жовтий!).
- Семантичний шар: пізні сайти = дворівневі токени **--c-* (фізика) → --t-* (семантика)**; теми перемикаються класом секції; AIR-вершина: data-themed-class — секція сама керує темою хедера.
- Фірмовий hairline = акцент-колір в alpha .07–.2 (Neva золото, ERA t-line).

**6. Структура/воронка — канон ЖК (PB_site_architecture):**
- ГЛИБИНА = (5 page-types × ~12 section-types) × data-generated інвентар. Дві стратегії: **A inventory-depth** (ERA 270 / Ever 400 / AIR 120 URL: catalog + visual-search + unit-сторінки з одного датасету) і **B atmosphere-depth** (SP: 1 документ × 17 секцій + якорі-роути; Fairy Forest: 1 слово = 1 екран).
- **Visual-search = конверсійне ядро і ОДИН движок на всі сайти:** inline-SVG плити + `data-nr` join + `plan/plan-marker` + EJS + статус ЯК CSS-modifier (available тепла барва / sold глухе сіре / reserved видиме без кліку / Ever +4-й стан filtered-out). Той самий примітив = карта району (POI-маркери).
- **2 on-ramps → 1 unit-page → favourites(PDF) → 1 callback** — раціональний (фільтр-каталог) + просторовий (плита/мапа/планувальник) рукави сходяться. Форма знає, звідки лід (currentPageLink). Сервіс-жести люксу: «Заказать такси» (Ever, Eniteo), Order a taxi, sales-companion (Neva).
- Story-сторінки = кільце (крос-лінк-меню в кінці кожної, ERA visualizationLinesMenu), не глухі кути.

**7. Копі-патерни хедлайнів:**
- **Hero = 1–3 слова** у більшості («place of art» · «Ever. Live here» · «Splendor of Renewal» · «Природа» · «ENITEO» · «LOFTEC» · «Дом на Хлебном»); або UTP/SEO-речення 8–12 слів (Neva, AIR, Azure, Pok-9).
- **Ім'я бренду = сенс-машина:** етимологія/метафора проростає в механіку сайту (Astris-зірки→WebGL-інтро; LOFTEC-акронім→6 секцій; Level-баланс→спліт-екрани; ERA-гра слів; Eniteo-латинь; AIR-стихія).
- Жанри, що повторюються: цитата архітектора як секція (Eniteo, Astris, ERA, Level) · голі цифри-заголовки · однослівні H2-іменники · сенсорні сценарії дня (Ever, Springs, Level) · історичний наратив як продукт (Khlebny, Republic) · статуси-маячки дефіциту («последняя квартира», Open Now/Soon/Later, sold/reserved на плиті).
- Що продають НЕ метри: статус (через мистецтво/успіх/спадок/лідерство) · атмосферу (природа/спокій/wellness) · ідентичність (авангард/технологічність) · історію/вічність. Факти живуть у каталозі, емоція — на home.

**Підсумок одним рядком:** Vide Infra = один інженерний скелет (SSR + Barba + lerp-скрол + data-plugin + ui-теми) × одна типографічна теза (гігант легкої ваги, 1-2 родини, 62.5%-rem) × один ease із власною другою кривою × token-палітра «дарк+крем+теплий акцент» × воронка «2 входи → unit → favourites → callback» — а ВСЯ впізнаваність кожного сайту досягається однією концепт-ідеєю бренду, що проростає в типографіку, механіку інтро і копірайт одночасно.

---
*Кінець VI_DNA_MASTER. Покрито всі 19 проєктів (18 унікальних сайтів: K24 = Composition No.24). Pending: нічого.*
