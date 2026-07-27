# SO-3 · Nature → Place — дослідження «ЧОМУ ТАК»

> Третій під-організм springs. Пам'ять [[taxonomy-suborganisms-research]] [[live-first-before-visual]].
> 🔴 ДЖЕРЕЛО РУХУ — **LIVE, CDP synthesizeScrollGesture** (scrollTo І mouse.wheel НЕ рухають springs:
> `documentElement.scrollHeight == viewport`, сцена progress-driven, не overflow-scroll). Знято S23:
> - `extraction/live-ref/SO-3-nature-place-cdp3/` — 26 кадрів живої бігової сцени (eyeball: `/tmp/so3-compact.png`)
> - `extraction/springs-home/timing-map-place.json` — покроковий рух (CDP-жести + rAF, S8-S12 драйвер)
> - `extraction/springs-home/animation-map-place.json` — `odometer` + `l-place-webgl-caption`
> - Реальні springs-медіа (не генеровані): `media/{place-bg, caption-1, caption-2, caption-3, nature-video}.webp`

## Що це за під-організм
`[Nature / l-nature]` + **ШОВ (pin-унаслідування + одометр-снап)** + `[Place / l-place]`.

## 🔬 LIVE-МЕХАНІКА (зі знятого руху, НЕ вигадано — і НЕ з таблиці-гіпотези)

**🔴 Таблиця SUBORGANISMS.md брехала** (складена з тексту): казала «push-over доводчик» + «акт-слово
Place». Live це СПРОСТУВАВ. Реальність:

1. **НЕМАЄ окремого акт-слова «Place»** на в'їзді. У DOM заголовок «Nature» тримається op=1 весь
   перехід (24/24 кадри). Place НЕ входить велетенською назвою-роздільником як «Wellness»/«Nature».
2. **НЕМАЄ push-over смуги.** Секція не врізається збоку поверх попередньої.
3. **Механіка = pin + full-bleed WebGL-листя + card-odometer, що СНАП-СКРОЛИТЬСЯ по кроках.**
   - **Фон** (`place-bg.webp`): пара **біжить** лісовою алеєю на золотому заході — full-bleed,
     повільно дрейфує/паралаксить (це відповідь на копі «Do you feel like running?»). Поверх —
     велике розмите листя проти сонця з боке (WebGL-шар, паритет не заявляємо).
   - **Картка праворуч-центр** з великим серіф-**одометром 3 → 9 → 16**:
     `3 minute walk to Nature Park` (дівчина+собака, `caption-1`) →
     `9 minute walk to the embankment` (рука у воді, `caption-3`) →
     `16 minutes by car to the MIBC` (чоловік в авто, `caption-2`).
   - Кожен крок = **снап-плато**: timing-map-place показав s стрибає 900→2070→2970→4499→5579→7199,
     між плато рух ~900-1620px за ~2-2.9s (ЄДИНА springs-крива). Це `stat-odometer` +
     `numeral-odometer-roll` + `brand-overlay-crossfade` (рівно рядок Place у composition-map).
4. **Текстовий Place-intro** (`l-place`/`l-place-webgl-caption`, з timing-map targets) передує біговій
   сцені: заголовок «Place» + «Essence of Contemplation» + «Springs is situated in the prestigious W…»
   + «Breathe in the air and open space. Do you feel like running?». У нашому seam-вікні він ще op=0.005
   (не проявлений) — тобто intro-текст іде РАНІШЕ бігової картки-одометра.

**ШОВ Nature→Place** = Nature-секція вичерпує свій pin-діапазон і Place пініться під нею
(`sticky--under-previous`, як SO-1/SO-2 — це стала springs-грамат.), АЛЕ видима «подія» шва тут — не
акт-слово, а **поява card-odometer над біговим фоном + перший ролл 3**. Тобто шов озвучений
контентом (числом), не назвою.

## 1. Чому саме ці дві секції поруч?
Nature — розчинення в природі («shields you from the world», «do you feel like running?»). Place —
відповідь на це питання **фактами локації**: 3 хв до парку, 9 хв до набережної, 16 хв авто до
ділового центру. Дуга: спершу ЕМОЦІЯ природи (Nature, поетична) → потім та сама природа стає
ПЕРЕВАГОЮ адреси (Place, вимірна). «Do you feel like running?» з Nature буквально продовжується
біговою парою у фоні Place. Емоційний біт → раціональний доказ, без розриву теми.

## 2. Чому такий шов (одометр-снап, а не push-over/акт-слово)?
Бо контент Place — це **набір рівнозначних фактів** (3/9/16), а не одна нова тема. Push-over/акт-слово
оголошують ЗМІНУ РОЗДІЛУ; тут розділ той самий («природа поруч»), змінюються лише цифри. Тому springs
залишає заголовок Nature жити і дає **одометр** — форму, що природно тримає серію («крутиться»
рахунок хвилин). Снап між кроками (не безперервний скрол) = кожен факт отримує момент уваги,
luxury-темп. Колірний флип тут НЕ потрібен (обидві — тепла зелень+захід); повний флип у кремове
springs береже для SO-4 Place→Location (карта) — «дихання» ритму.

## 3. Чому такі анімації (порядок Ambient→Entrance→Interaction)?
- **Ambient:** фон-листя+бігова алея повільно паралаксить безперервно (живий, не статичний кадр).
- **Entrance:** card-odometer з'являється (rise+opacity), перше число «3» роллиться знизу.
- **Interaction (scroll-driven snap):** кожен крок скролу перемикає число 3→9→16, картку і підпис
  crossfade'ом. Одометр веде, картинка+підпис лагають (stagger) — та сама reveal-грамат. що SO-2
  (translateY-rise + clip-wipe + stagger), але носій — число, не рядок копі.

## 4. Чому така кольорова гама і як міняється?
Тепла темна зелень + золото заходу (менш «спа-стерильно» ніж Wellness, глибша/тепліша ніж Nature).
На цьому шві теми НЕ флипаються (🟢→🟢, лише тон теплішає до заходу) — навмисно, щоб контраст
приберегти для наступного шва (SO-4 → кремова карта). Тепле світло = «жива, обжита природа поруч»,
підкріплює меседж «все за пару хвилин пішки».

## 5. Як користувач взаємодіє і чому саме так?
**Scroll-driven snap** (не таймер, не жест-свайп). Кожен «клац» скролу = наступний факт локації.
Чому снап, а не вільний скрол: 3 факти = 3 обіцянки, кожна має «прочитатися» окремо — снап
примусово зупиняє на кожній. Це той самий контроль темпу, що pin дає reveal-секціям, але
застосований до ЛІЧИЛЬНИКА. Mobile: той самий одометр = PINNED-scroll ([[mobile-is-pinned-scroll]]),
картка по центру, число крупним серіфом — бічний вріз тут не потрібен (визначальний рух = ролл числа,
[[mobile-mechanic-when-differ]]).

---
## Звідки що (провенанс, щоб не «з голови»)
- Рух/снап-плато: `timing-map-place.json` (CDP-жести, s 900..7199).
- Числа 3/9/16 + підписи + асети: `live-ref/SO-3-nature-place-cdp3/manifest.json` digits + `.asset-cache`.
- Odometer/caption клас: `animation-map-place.json` (`odometer`, `l-place-webgl-caption`).
- Механіка pin (sticky--under-previous): успадкована з SO-1/SO-2 live (стала springs-грамат.).
