# SO-3 Nature — LIVE video teardown (Screen Recording 2026-07-14 21.17.25, Єгор)

> 🔴 Знято з ЖИВОГО springs.estate відео (не extraction/таблиць). Це ІСТИНА темпу+композиції.
> Єгор спіймав: наш композит 2× швидший, текст не встигає, композицій менше, переходи не ті.
> Frames: `scratchpad/live-nat/n*.png` (0.8s step). Sheet: `LIVE-NAT-detail.png`.

## Живі стадії Nature (по кадрах, 0.8s крок)

| ~t | Стадія | Композиція | Що РУХАЄТЬСЯ |
|---|---|---|---|
| 2.4→4.0s | **Nature intro** | leaf-фон темний, «Nature» серіф вел. ЛІВОРУЧ-внизу піднімається | title rise + clip |
| 4.0→13.0s | **Nature HOLD (~9s!)** | «Nature»/«Lightness of Breathing» ЛІВОРУЧ тримаються; абзац «Here, nature merges with architecture…» ПРАВОРУЧ проявляється ПОСТУПОВО (line-by-line, довго) | body text staggered reveal, leaf ледь дрейф |
| 13.6→15.2s | **картка МАЛЕНЬКА** | новий текст «Enjoy nature's embrace…» ЛІВОРУЧ + МАЛЕНЬКА картка (hand-in-greenery) центр-низ | text swap + small card fade-in |
| 16.8→18.4s | **картка РОСТЕ** | та сама картка РОЗРОСТАЄТЬСЯ на full-bleed (landscaped terrace), текст ЛІВОРУЧ тримається | card scale small→full |
| 20.0→24.8s | **Nature слайдер** | садові кадри (terrace / sunset garden) міняються, підпис «Landscaped terraces with topiary trees, framed with glass…» ПРАВОРУЧ-внизу + dot-нав ‹○○› | slide crossfade (повільно ~2s кожен) |
| (далі) | зелений градієнт-МОРФ → Place | абстрактна зелена хвиля перетікає, тоді «Place» справа | wave morph (окремий місток!) |

## Реальні тексти (з живого відео)
- Header: **Nature** / **Lightness of Breathing**
- Body-1 (HOLD, праворуч): «Here, nature merges with architecture and becomes an integral part of your home. Nature takes the spotlight, embodied in the painterly curves of our gardens and the green silhouettes of the façade terraces. Nature becomes your companion on meditative walks and at family gatherings, providing a soothing backdrop.»
- Body-2 (картка, ліворуч): «Enjoy nature's embrace that shields you from the world outside. Climbing rooftop plants, winding layouts of flowerbeds, emerald lawns. Springs lets you learn the art of leisure.»
- Slider caption (праворуч-низ): «Landscaped terraces with topiary trees, framed with glass, create the atmosphere of a miniature park floating above the City»
- (далі Place): «Shady leafy-coniferous garden that evokes winding paths, branchy trees…»

## 🔴 ЩО Я ЗРОБИВ НЕ ТАК (фікс-ліст)
1. **Nature HOLD ~9s → у мене ~1s.** #1 причина «текст не встигає». → title + body-1 мусять тримати
   ВЕЛИКУ частку скролу (розтягнути track; body-1 line-by-line reveal довгий, тоді довгий hold).
2. **Картка МАЛЕНЬКА→РОСТЕ** — двостадійна. У мене одразу full-bleed. → додати small-card→scale-to-full.
3. **Body-1 «Here nature merges» ВЗАГАЛІ нема** у мене (поставив «Landscaped terraces» одразу). → додати.
4. **Два послідовні текст-блоки** (Here→Enjoy) — у мене один. → додати другий.
5. **Зелений градієнт-МОРФ місток Nature→Place** — у мене різкий cross-dissolve. → додати wave-морф.
6. **ТЕМП мірити в СКРОЛІ (progress), не секундах** (швидкість скролу рукою — змінна). Кожна фаза =
   мінімальна частка скролу щоб текст встиг: HOLD ≥25% скролу секції, картка-росте ≥12%, слайдер ≥18%.

## Метод фіксу (для gate)
Новий гейт «readability»: на кожній текст-фазі --r/opacity мусить бути ≥0.9 протягом ≥N кадрів скролу
(текст встиг проявитись і ПОСТОЯТИ), не лише «промайнув». Технічні гейти сліпі до цього — Єгор ловить оком.

---

## 🔴🔴🔴 S29 РОЗШИРЕНИЙ TEARDOWN (повний прохід 2..52с відео, ffmpeg 0.8/1.0s) — ІСТИНА

Розбито ВСЕ живе відео (не лише Nature-вікно): `scratchpad/live-nat/n*.png` (2-26с) +
`scratchpad/live-rest/r*.png` (26-52с). Виявлено ПОВНУ послідовність, якої не було в короткому teardown:

**Nature → [зелений МОРФ-місток] → Place → бігуни → одометр 3/9/16 → Location-карта → Design.**

### Точна композиція Nature (кадр n02 — еталон):
- **BG = ТЕМНИЙ МАКРО-ЛИСТ** (`nature-bg.webp` з .asset-cache = `nature-bg-xs`), величезні діагональні
  фрони, глибокий зелений. ТРИМАЄТЬСЯ весь intro+hold (n01→n13, ~9с). ❌ Я мав sunset-сад (не той асет).
- **«Nature»** = ВЕЛИЧЕЗНИЙ серіф, ЛІВОРУЧ, вертикально ~ЦЕНТР (базлайн ~60% висоти), не bottom-left/малий.
  «LIGHTNESS OF BREATHING» дрібним капсом ПІД ним.
- **Body-1** «Here, nature merges…» = bottom-RIGHT, ~40% ширини. Проявляється й ТРИМАЄТЬСЯ довго.

### Nature слайдер (кадр n27, r01 — еталон), НЕ full-bleed crossfade:
- **Картка ЛІВОРУЧ** (~48% ширини, з полями) — садове фото (sunset-garden → loggia → …).
- **Підпис ПРАВОРУЧ-центр** на зеленій градієнт-панелі: «Landscaped terraces with topiary trees…» /
  «Artfully designed recreation areas…» — КОЖЕН слайд має СВІЙ підпис.
- **Стрілки-нав ‹○ ○›** (круглі prev/next) під підписом. ❌ Я мав dots + full-bleed. → card-left/cap-right/arrows.
- Мінімум 2-3 слайди (терраса → loggia). Довше ніж у мене.

### 🔴 ЗЕЛЕНИЙ МОРФ-МІСТОК (кадри r04-r06 — residual (b), ВІДСУТНІЙ у мене):
- **Зелений радіальний градієнт**: тепло-жовто-зелений `#6d7f27` upper-left → глибокий teal `#16312e`/
  `#122620` lower-right.
- **Скляна напівпрозора ЗЕЛЕНА СТРІЧКА** (glassy ribbon): згорнутий діагональний «лист скла» від upper-left
  до lower-right, з яскравим краєм + м'яким тілом (blur). Це ГЕРОЙ-перехід (~2-3 слайди скролу), НЕ швидкий
  cross-dissolve. «Place» серіф ВИПЛИВАЄ bottom-right поки стрічка ще на екрані.

### Place (r05-r08): «Place» серіф ПРАВОРУЧ + «Essence of Contemplation» + body «Springs is situated in
  the prestigious Western District…» — над зеленим градієнтом зі стрічкою.

### 🔴 ТЕМП (residual c — головна помилка): за все відео (2-26с = ~перші 50% скролу) ЖИВЕ ЩЕ В NATURE.
  Place стартує лише ~28с. Я входив у Place на p=0.66 (бігуни+одометр вже на p=0.74). → Nature мусить
  володіти ПЕРШИМИ ~45% скролу; морф ~45-55%; Place+бігуни ~55-75%; одометр ~75-100%.

### Порядок після Place (для КОНТЕКСТУ, будується в інших SO): бігуни (forest lane, «Breathe in the air…»)
  → одометр 3/9/16 (картка ПРАВОРУЧ, число+«MINUTE WALK TO NATURE PARK», bg = leaf-blur/water/city-skyline)
  → Location-карта (cream, пін) → Design (будівля). SO-3 покриває Nature→Place→одометр; далі — SO-4+.

### Fix-ліст S29 (проти BEFORE-board `scratchpad/so3-before-board.png`):
1. ❌→✅ bg intro/hold: sunset-сад → **макро-лист** `nature-bg.webp`.
2. ❌→✅ «Nature»: bottom-left малий → **велика, вертикально-центр ліворуч**.
3. ❌→✅ слайдер: full-bleed dots → **card-left + caption-right + arrow-nav**, довший.
4. ❌→✅ картка-росте: loggia → **hand-in-greenery** (`nature-video.webp`) перша.
5. ❌→✅ **додати зелений МОРФ-стрічка місток** (radial grad + glass ribbon).
6. ❌→✅ **темп**: Place на p0.66 → на p~0.55 ПІСЛЯ морфу; Nature володіє першими 45%.
