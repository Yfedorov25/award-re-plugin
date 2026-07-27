# SUBORGANISMS — springs.estate під-організми = [секція + ШОВ + секція]

> НОВИЙ рівень таксономії (Єгор, S21→S22). Пам'ять [[taxonomy-suborganisms-research]].
> Атом(рух) → Молекула(прийом) → **ПІД-ОРГАНІЗМ [секція+ШОВ+секція]** → Організм(повна секція)
> → Сайт(над-рівень). Цей файл = **список під-організмів springs головної** + шов кожного +
> дослідження «чому так». Робимо СЕКЦІЯ ЗА СЕКЦІЄЮ, не одна гігант-задача.
>
> Джерела (не з голови): `D_Springs_architecture.md §2` (12 блоків l-*), `D_SPRINGS_video.md`
> (ДЕЛЬТИ ГРАМАТИКИ + seam + color-rhythm), `composition-map/index.html` (стек прийомів секції).

---

## 🧵 ЩО ТАКЕ ШОВ (окремий об'єкт таксономії — НЕ пропускати)

Springs НЕ монтує секції встик. Кожна межа = **шов** з трьох керунків одночасно:
1. **Механіка доводчика** (D_video ДЕЛЬТИ): desktop = **push-over смугою + magnetic overshoot-settle**
   (нове медіа врізається поверх старого, за ціль → осідає). Це основний акт→акт перехід.
   Mobile = той самий доводчик **роздвоюється**: акт→акт = довгий CROSSFADE + scale-creep (бічний
   вріз неприродний вузько); акт-СЛОВО = overshoot-settle серіфом 1:1; бігова сцена = PINNED-scroll.
2. **Акт-слово-роздільник** — одне слово серіфом (Victor Serif) = «главка фільму»:
   Wellness / Spa / Café / Yoga / Place / Design / Residences / Interiors / Penthouses.
   Часто це і Є видимий шов (translateY overshoot-settle слова на межі).
3. **Кольоровий флип** — «зелений ритм: смарагд ↔ оливка ↔ **КРЕМОВИЙ (передих)** ↔ захід-сонця».
   Шов часто = зміна теми (темна WebGL-зелень → кремова карта → назад). Це ДИХАННЯ ритму.

**Правило звірки шва:** під-організм не «готовий», поки не відтворено ВСІ три керунки шва
(механіка + акт-слово якщо є + колірний флип), а не лише дві сусідні секції окремо.

---

## 📋 СПИСОК ПІД-ОРГАНІЗМІВ (scroll-порядок головної — S27 live-DOM: 8 scroll-секцій → 7 швів + 2 модалки)

Порядок секцій з `D_arch §2` + `composition-map`. Тема: 🟢=темна WebGL-зелень · 🫒=оливка ·
🟡=кремовий передих · 🌅=захід. Кожен під-організм = [секція A] +ШОВ+ [секція B].

| # | Під-організм (A → B) | Механіка шва | Акт-слово | Колір-флип | Статус |
|---|---|---|---|---|---|
| **SO-1** | **Hero → Wellness** | push-over / mobile crossfade | «Wellness» | 🟢→🟢 (тон-shift, не флип) | 🔜 ПЕРШИЙ |
| SO-2 | Wellness → Nature | crossfade + scale-creep | «Spa/Café/Yoga» | 🟢→🟢 (nature caption-up) | ⬜ |
| SO-3 | Nature → Place | ~~push-over доводчик~~ **snap-scroll + card-odometer roll** ✏️ | ~~«Place»~~ **немає видимого акт-слова** ✏️ | 🟢→🟢 (тепліший захід, WebGL-листя) | 🔬 LIVE-звірено S23 |
| SO-4 | Place → Location(map) | **колірний флип у передих** | — | 🟢→🟡 КРЕМОВИЙ | ⬜ |
| SO-5 | Location → Residences | ~~флип крем→темне~~ **КРЕМ ТРИВАЄ, карта→арх-картки scatter** ✏️ | «Residences» (хедер) | ~~🟡→🟢~~ **🟡→🟡 крем ТРИВАЄ** ✏️ | ✅ S25 (parity 17.4%, self-floor 3.4%) |
| SO-6 | Residences → Interiors | ~~slide/tab-in~~ **full-bleed інтер'єр-фото + акт-слово** ✏️ | «Interiors» + «Beauty in the essence of things» | ~~🟢→🟢~~ **🟡→тепле-нейтральне** (дерево/камінь) ✏️ | ✅ S25 (parity 18%, self-floor 0.3%) |
| SO-7 | Interiors → **Footer** ✏️ | **sticky--under-previous: інтер'єр'їде вгору, темно-зелений footer підіймається знизу** ✏️ | — | 🟡тепле-нейтр.→🟢 **темно-зелений аутро** ✏️ | 🔬 LIVE-звірено S27 (кадр `SO-7-int-cta-b/frame-000`), ⬜ побудова |
| ~~SO-8~~ **МОДАЛКИ** ✏️ | ~~Gallery → CTA~~ **Callback(CTA) + Favorites = OVERLAY-модалки, НЕ шви** ✏️ | тригер «Contact us»→`#callback-modal`, ♡→`#favorites-modal` | — | оверлей поверх сцени | 🔬 LIVE-класиф. S27 (окремі overlay-компоненти, поза швами) |

> ✏️✏️ **S25 LIVE-СКАН СПРОСТУВАВ СТРУКТУРУ (CDP, повний прохід):** реальні `l-*` класи springs у
> DOM: `l-gallery-container(hero) · l-intro · l-wellness · l-nature · l-place · l-map(Location) ·
> l-residences · l-interiors · l-callback(CTA) · l-favorites`. 🔴 **НЕМАЄ окремого `l-design`** —
> «Design» + архітектурна будівля (Tabanlioglu bureau, «Each floor reflects boundless perspectives»)
> живуть УСЕРЕДИНІ `l-residences` (Design = архітектурний ПІДБЛОК Residences, не окрема секція).
> → Було 9 швів з окремими Design; тепер **8 секцій-меж → 8 швів** (SO-1..SO-8). Residences містить
> Design+Penthouses+Townhouses (138 flats / 5 townhouses / 7 penthouses = картки ВСЕРЕДИНІ Residences).
> SO-5 = Location→Residences ВІРНИЙ (таблиця не помилялась у ньому), лише Design був хибно окремий.

> ✏️✏️✏️ **S27 LIVE-DOM СПРОСТУВАВ ХВІСТ ТРЕКУ (7-й раз таблиця vs live) — виправлено вище:**
> Повний DOM-скан `[class*=l-]` дав РЕАЛЬНИЙ scroll-порядок:
> `l-gallery-container(HERO reel) · l-intro · l-wellness · l-nature · l-place · l-map · l-design(⊂residences)
> · l-residences · l-interiors · [FOOTER]`. 🔴 **«Gallery» З ТАБЛИЦІ НЕ ІСНУЄ як окрема пізня секція** —
> `l-gallery`/`l-gallery__item__mask-list` = **ГЕРОЙ НА ВЕРХУ** (нахилений masked фото-reel «Splendor of
> Renewal»), тобто вже в межах SO-1. 🔴 **`l-callback`(CTA «Open the doors of Springs») і `l-favorites` =
> МОДАЛКИ-ОВЕРЛЕЇ** (`getBoundingClientRect h:0`; лінк «Contact us»→`#callback-modal`, ♡→`#favorites-modal`),
> НЕ прокручувані секції. → Після `l-interiors` (layout top 25020, h 3150) одразу **FOOTER** (28170→28878,
> темно-зелене поле, кремовий серіф-лого «Springs», back-to-top, LEGAL / SITE BY VIDE INFRA / © 2026).
> **Реальний залишок треку = 1 шов: SO-7 Interiors→Footer** (аутро). SO-8 переозначено на МОДАЛКИ
> (overlay-об'єкти поза граматикою швів). Чистий live-кадр шва: `SO-7-int-cta-b/frame-000.png`.
> ⚠️ ПАСТКА S27: `l-interiors` — довгий PIN (3150px layout); CDP-жести ВСЕРЕДИНІ нього СТАЛЯТЬ
> (26+ кадрів byte-identical luma 70.7). Живий springs НЕ рухається scrollTo/Locomotive.scrollTo теж
> (стрибок на hero). Чистий кадр шва зловлено warmup-жестами що перескочили pin (warmup 27→residences,
> 33→footer; 29 з великим settle зловив interiors-tail+footer). Для pin-band використовуй warmup-стрибок,
> НЕ дрібні sample-жести. Пам'ять [[live-first-before-visual]] правило #5.

> 🔴 Шви SO-4 (колірний передих у кремове) і SO-7 (vertical-curtain clip) — найхарактерніші
> springs-шви, бо там граматика найбільш видима. SO-4 = «дихання» ритму (єдиний повний флип теми).
>
> ✏️ **S23 LIVE-ПРАВКА SO-3 (CDP-жести живого springs, `extraction/live-ref/SO-3-nature-place-cdp3/`):**
> Рядок SO-3 у таблиці був складений з ТЕКСТУ (push-over + акт-слово «Place») — live це СПРОСТУВАВ.
> Реальний Nature→Place: заголовок «Nature» тримається у DOM (op=1), Place НЕ входить окремим
> акт-словом і НЕ push-over смугою. Механіка = **pin + full-bleed WebGL-листя (велике листя
> проти сонця, боке, повільний дрейф) + фото-картка з великим серіф-одометром 3→9→16**, що
> **снап-скролиться по кроках** (плато s 900/2070/2970/4499/5579/7199 у timing-map-place).
> Кожен крок одометра міняє картку+підпис: «3 minute walk to Nature Park» → «9 minute walk to
> the embankment» → «16 minutes by car to the MIBC». Це `stat-odometer`+`numeral-odometer-roll`+
> `brand-overlay-crossfade` (рівно рядок Place у composition-map), НЕ шов-доводчик.
> Текстовий Place-intro («Place / Essence of Contemplation / Breathe in the air… Do you feel
> like running?») передує біговій сцені. 🔴 Урок [[live-first-before-visual]]: план-таблиця = гіпотеза.

### Прийоми в кожній секції (з composition-map, готові як цегла — 17 модулів)
- **Hero**: rotated-matrix-collage(A) + split-word-headline(B) + numeral-frame-expand-hero(B)
- **Wellness**: render-scroll-scale(B) [+WebGL шар, паритет не заявляємо]
- **Nature**: numeral-frame(B) + brand-overlay-crossfade(A) [+WebGL]
- **Place**: stat-odometer(B) + numeral-odometer-roll(B) + brand-overlay-crossfade(B) [+WebGL 3D-tree]
- **Location**: map-dim-carousel(B)
- **Residences**: portrait-carousel(C) + fullscreen-media-carousel(C)
- **Interiors**: layer-accordion-reveal(C)
- **Design** (⊂ Residences): dual-slicer(B) + vertical-curtain-wipe(B) + editorial-act-crossfade(B)
- **Footer** (аутро): sticky--under-previous reveal (темно-зелене поле, серіф-лого, back-to-top)
- ~~**Gallery**~~ = ГЕРОЙ зверху (rotated-matrix-collage + masked reel) — вже в Hero/SO-1, НЕ пізня секція
- ~~**CTA**~~ **Callback-модалка**: funnel-curtain(C) як OVERLAY (тригер «Contact us»), поза scroll-швами
- **Favorites-модалка**: overlay-список (тригер ♡), поза scroll-швами

---

## 🔬 ШАБЛОН ДОСЛІДЖЕННЯ «ЧОМУ ТАК» (заповнювати до КОЖНОГО під-організму)

Не машинна копія — глибоке розуміння, щоб робити НОВІ сайти усвідомлено (пам'ять
[[taxonomy-suborganisms-research]]). До кожного SO-N відповідати на:

1. **Чому саме ці дві секції поруч?** Що робить їх сусідство осмисленим (наратив, емоційна дуга)?
2. **Чому такий шов між ними?** Чому push-over а не cut? Чому саме тут колірний флип / акт-слово?
3. **Чому такі анімації?** Що за чим і чому в такому порядку (Ambient→Entrance→Interaction)?
4. **Чому така кольорова гама?** Як вона міняється на цьому шві, що це дає відчуттю?
5. **Як користувач взаємодіє і чому так спроектовано?** (scroll-driven vs жест; чому саме так)

Формат виводу: `library/techniques/suborganisms/SO-N-<a>-<b>/RESEARCH.md` + executable-репліка
[секція+шов+секція] РАЗОМ. Дослідження й код ідуть разом, не окремо.

---

## 🔜 ПЕРШИЙ КРОК (S22): SO-1 Hero → Wellness
Репліка [Hero + push-over-шов + Wellness] РАЗОМ із дослідженням «чому». Файли:
`suborganisms/SO-1-hero-wellness/{RESEARCH.md, index.html (композит desktop+mobile), README.md}`.
Прийоми вже є (rotated-collage, split-word, numeral-frame, render-scroll-scale) — збираємо в
під-організм зі швом, не наново.
