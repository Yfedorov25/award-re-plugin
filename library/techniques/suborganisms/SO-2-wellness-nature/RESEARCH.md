# SO-2 · Wellness → Nature — дослідження «ЧОМУ ТАК»

> Другий під-організм springs. Пам'ять [[taxonomy-suborganisms-research]] [[live-first-before-visual]].
> 🔴 ДЖЕРЕЛО РУХУ — не headless-scrollTo (він бреше про pin-секції), а РЕАЛЬНІ екстракти:
> `extraction/springs-home/animation-map-{wellness,nature}.json` (CDP synthesizeScrollGesture +
> getComputedStyle — справжній жест) + DOM-fact (`querySelectorAll h1,h2`: заголовки-акти існують).

## Що це за під-організм
`[Wellness / l-wellness]` + **ШОВ (pin-unpin між sticky-секціями)** + `[Nature / l-nature]`.
Акт-слова-заголовки: **«Wellness»** та **«Nature» (Lightness of Breathing)** — реальні 180px H2 у DOM.

## 🔬 LIVE-МЕХАНІКА (з екстрактів, НЕ вигадано)
**Wellness** (`.l-wellness sticky--full-height`, пінена, stepPx 119, 1199 кадрів):
- `sticky__layer--sticky` рухається `transform` (parallax-шар).
- Слайдер `col--md-6` + `l-wellness__slider__caption` розкриваються **clipPath** — копі
  «Spa Yoga Fitness Café», «Essence of Self-Care», «Springs brings wellness right…».
- Бічний текст входить `opacity`. Фон = `wellness-webgl-gradient` (WebGL — паритет не заявляємо).

**Nature** (`.l-nature sticky--full-height`, пінена, stepPx 150, 1145 кадрів):
- `sticky__layer` `transform`; `l-nature-bg-item background` розкривається **clipPath**.
- `l-nature-bg-caption` входить `transform + opacity` — заголовок «Nature / Lightness of Breathing»,
  копі «Enjoy nature's embrace that shields you from the world outside», «Breathe in the air and open
  space. Do you feel like running?».

**ШОВ Wellness→Nature** = перша sticky-секція **розпінюється** (unpin) коли її scroll-діапазон
вичерпано, наступна `.l-nature` **пініться під нею** (sticky--under-previous механіка, як SO-1 hero).
Всередині кожної секції — clipPath-reveal медіа/копі. Акт-слово «Nature» = заголовок-титул секції,
що входить transform+opacity на в'їзді. НЕ окремий слайсер посеред екрану (урок SO-1).

## 1. Чому саме ці дві поруч?
Wellness — тіло/спокій (спа, йога). Nature — розчинення в природі («shields you from the world»,
«do you feel like running?»). Дуга: спершу доглянуте тіло всередині → потім вихід у природу зовні.
Обидві — «емоційні біти» (WebGL), поставлені підряд щоб тримати стан перед фактами про ЖК.

## 2. Чому такий шов (pin-unpin, clipPath-reveal)?
Springs НЕ монтує секції встик — кожна пініться на ~кілька екранів і розкриває контент clipPath'ом,
поки скрол «протягує» її. Перехід = unpin поточної + pin наступної. Чому? Бо pin дає ЧАС на
reveal-хореографію (одне поетичне речення на секцію, luxury-темп .8-1.6s), а безперервність
(ЄДИНА крива cubic-bezier(.25,.74,.22,.99)) не дає «клацання».

## 3. Чому такі анімації і в такому порядку?
Всередині секції: pinned-layer parallax (Ambient) → clipPath-reveal медіа/слайдера (Entrance) →
opacity-вхід копі. Жодних двох сильних reveal підряд. На шві акт-слово наступної секції входить
transform+opacity — м'яко називає новий стан.

## 4. Чому така кольорова гама?
Wellness = wellness-webgl-gradient (глибша спа-зелень); Nature = зелень природи/вода. 🟢→🟢 у
зеленому сімействі — ще НЕ кремовий передих (той на Place→Location, SO-4). Тон-shift, не флип —
тримає стан.

## 5. Як користувач взаємодіє?
Desktop: pure scroll — pin протягує секції, clipPath розкриває контент. Жодного кліку (стан-транс).
Mobile (teardown T-PIN-RUNSCENE): pinned ~4 екрани + копі crossfade поверх застиглого медіа — та сама
pin-логіка, вертикальна.

## 🎯 Висновок для НОВИХ сайтів
Секція-як-pinned-сцена з внутрішнім clipPath-reveal + акт-слово-титул на в'їзді = як дати кожному
«біту» час і назву без різких монтажів. Кілька таких підряд = організм-настрій перед фактами.

## ▶ Executable-репліка
`seam.html` / `index.html` — [Wellness pinned + pin-unpin шов + Nature pinned], clipPath-reveal
всередині, акт-слово-титул на в'їзді. Прийоми-цегла: render-scroll-scale (wellness breathe),
vertical-curtain-wipe (clipPath-шов), stat-odometer (метрики place поруч). Пікс-парність НЕ заявляємо.
