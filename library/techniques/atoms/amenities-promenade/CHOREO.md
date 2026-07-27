# PROMENADE (блок 06) — КАРТА ХОРЕОГРАФІЇ (S46, з live-кадрів 12fps)

> Джерело: кроп 86-107с з повного amenities-ролика (ScreenRecording_07-20-2026 23-29-38, 247с).
> → `atoms/amenities-promenade/reference/promenade-live.mp4` (21с). Розбір: 252 кадри 12fps +
> choreo-montage (0.5с) + fade-zoom (0.33с). Модель: Opus 4.8 (тест системи).
> Механіка = A6 render-scroll-hero-fade, ТЕ САМЕ сімейство що прийнятий hero (parallax-hero-fade).

## ФАЗИ (по scroll progress p, кроп 86-107с → p=(t-86)/21)

### Ф1 (p 0.00–0.10, ~86-88с) — ШОВ S05: promenade заходить знизу
- Хвіст попереднього (Stone Hammam wellness-хвіст) угорі; знизу вилазить cream serif
  «Riverside Promenade at Your Doorstep» + фото набережної наповзає знизу-вгору.
- (Це шов між атомами; у standalone-атомі промо стартуємо з full-bleed + title, шов буде в organism.)

### Ф2 (p 0.10–0.48, ~88-96с) — full-bleed parallax scroll, title ТРИМАЄТЬСЯ
- Full-bleed фото 3:4: вежа з вигнутими балконами праворуч, дерева, гранітна набережна знизу,
  ДВІ фігури йдуть, синьо-бірюзові сутінки.
- Фото СКРОЛИТЬСЯ вгору повільніше за скрол (parallax drift, як hero M2).
- Cream serif «Riverside Promenade / at Your Doorstep» lower-LEFT, НЕПРОЗОРИЙ, тримається.

### Ф3 (p 0.48–0.62, ~96-99с) — title FADE (ключова механіка A6)
- Заголовок РОЗЧИНЯЄТЬСЯ opacity 1→0 IN PLACE (scroll-coupled, НЕ clip, НЕ виїжджає).
  🔴 ВИМІРЯНО з fade-zoom: тримається непрозорим до ~96с, бліднути 96-99с.
  Верифікатор таксономії REFUTED «clip artifact» — це справжній opacity fade (M06 taxonomy:51).
- Фон продовжує parallax-scroll.

### Ф4 (p 0.57–1.0, ~98-107с) — body-copy reveal + вихід у шов S06
- Body-copy «Winding paths, paved with gray granite, resemble creeks and riverbeds that flow gently
  around Springs. White froth of hydrangeas and slender torsos of shadberries, suspended above
  invisible water, become a picturesque backdrop for a riverside walk.» reveal-иться у НИЖНІЙ частині
  (темна смуга внизу, НЕ cream-панель як hero — promenade без cream).
- Body-copy старт reveal ~98с (p0.57), повний ~101с.
- ~106с (p0.95) botanical-плитки (свайп-стрічка) вилазять знизу на панелі = ШОВ S06 → M07.

### Ф5 (t≈107-116с) — ХВІСТ-ПЛИТКИ = ГОРИЗОНТАЛЬНА СВАЙП-СТРІЧКА (🔴 S47, вимір з повного ролика)
> Джерело: повний ролик 104-116с, розбір 4fps + 10fps horizontal-cross-corr track (track.mjs) +
> full-res triptych t109.2/t109.9/t111.2. Це і був баг ітерації-1: я поставив 2 СТАТИЧНІ плитки.
- **≥3 РІЗНІ портретні плитки** на band-панелі, ~3:4.4, ~2 видно за раз, gap між ними:
  1. **LUSCIOUS TREES** (темний зелений кущ)
  2. **DECORATIVE FLOWERBEDS** (жовті квіти крупним планом)
  3. **BOTANICAL ZONES** (садові зони, червоні кущі, стрижене дерево) — остання справа (за нею край).
- **DRIVER = touch-swipe (horizontal drag) з ІНЕРЦІЄЮ + RUBBER-BAND + SNAP.** НЕ auto-loop, НЕ
  scroll-scrub. 🔴 ДОВЕДЕНО ВИМІРОМ (track.mjs cross-corr горизонт-профілів, 10fps 108-114с):
  - t108.0-108.8: стрічка НЕРУХОМА (Δ=0), скрол тим часом монотонний (band піднімається) →
    **не scroll-coupled** (інакше рухалась би плавно й монотонно з скролом).
  - t108.9-109.2: різкий зсув вліво +336px екрана (свайп-жест 1).
  - t109.3-109.9: **ПРУЖНИЙ ВІДКАТ назад до +18px** (rubber-band: недоведений свайп → snap до старту;
    підтверджено triptych: t109.9 LUSCIOUS TREES знову видно = стрічка повернулась).
  - t110.0-110.5: нерухома; t110.6-111.2: зсув вліво до +501px (свайп-жест 2, довів до наступного слайда).
  - t111.3-114.0: ЗАСТИГЛА на +501px (snap-стан FLOWERBEDS+BOTANICAL).
  - Сигнатура «стоїть → ривок → стоїть, з пружним відкотом» = нативний iOS scroll-snap horizontal
    (touch drag + inertia + rubber-band + snap-align), НЕ таймер, НЕ прив'язка до скролу.
- Крок одного слайда ≈ ширина плитки+gap (~500px екрана ≈ 1 плитка).
- Уся стрічка сидить НА band-панелі → вертикально їде з нею (band-travel, уже реалізовано).
- Таксономія M07 підтверджена ЧИСЛОМ: driver=swipe ✓, scroll-scrub REFUTED ✓.
- Прецедент коду: M18-патерн `.icr-swipe` (INDEX.json:1586) — нативний `scroll-snap-type:x mandatory`,
  трек переповнений (scrollWidth>clientWidth), картка ≤90% трека, кожна snap-align. НЕ amenities-carousel
  (той вертикально-скрол-драйвлений wipe, інша механіка).

## МЕХАНІКИ (перенесено з hero A6, адаптовано)
- **M1 pin-stage**: `.wrap{height:200vh}` + `.stage{sticky;top:0;height:100dvh}`, p 0..1.
- **M2 facade parallax**: full-bleed фото `height:114%`, translateY -p*12% (drift вгору повільніше скролу).
- **M3 title fade-coupling (🔴)**: title opacity 1→0 over p **0.48→0.62** (ТРИМАЄТЬСЯ довше за hero!
  hero було 0→0.62, promenade 0.48→0.62 — заголовок стоїть непрозорий пів-скролу, тоді швидкий fade).
  title lower-left, легкий translateY -p*20px lift.
- **M4 body-copy reveal**: body clip-path inset bottom 100%→0 over p **0.57→0.72** (рядок за рядком,
  знизу вгору) АБО opacity 0→1 — уточнити оком (обидва читаються в темній смузі; беру clip-reveal
  як hero-prose-family, звірю на компараторі).
- **M5 header scrim**: top gradient scrim щоб Springs-лого+burger читались над фото.
- **M6 no cream**: promenade НЕ має cream-панелі (на відміну hero M4). Body-copy на затемненні фото.
- **M7 swipe-strip (🔴 S47, вимір)**: горизонтальний трек НА панелі під body-copy. ≥3 портретні
  плитки (LUSCIOUS TREES · DECORATIVE FLOWERBEDS · BOTANICAL ZONES), ~2 видно. Нативний
  `overflow-x:auto; scroll-snap-type:x mandatory`; кожна плитка `scroll-snap-align:start`; трек
  переповнений (scrollWidth>clientWidth). Драйв = **touch-swipe (drag) з інерцією+rubber-band+snap**
  (нативний iOS momentum-scroll), НЕ auto, НЕ scroll-scrub, НЕ прив'язка до вертикального скролу.
  Ширина плитки ≈ 66% трека (щоб визирала ~1/3 наступної = «свайп-кью»). Стрічка = дитя band-панелі
  (їде вертикально з нею).

## ІНВАРІАНТИ ЗАКОНУ
Фото scroll+parallax вгору; title FADE opacity (не виїжджає, тримається до p0.48 тоді бліднути);
body-copy reveal знизу ПІЗНІШЕ за title-fade; 0 cream-панелі; усе від scroll-годинника — КРІМ
хвоста-плиток (M7): горизонтальна свайп-стрічка ≥3 плиток на touch-drag+snap (окремий driver,
НЕ scroll), переповнений трек, ~2 видно.

## АСЕТ (наш higgsfield, НЕ springs — закон higgsfield-facade-photos)
Потрібен 1 full-bleed 3:4 рендер: гранітна набережна вздовж вежі з вигнутими балконами (curved-balcony
tower), звивиста доріжка сірого граніту як русло річки, 1-2 фігури що йдуть, дерева-канопі, синьо-бірюзові
сутінки. nano_banana_pro 2k. Настрій live-promenade. НЕ скрін springs.

## ТЕКСТИ (verbatim з live)
Title: `Riverside Promenade at Your Doorstep`
Body: `Winding paths, paved with gray granite, resemble creeks and riverbeds that flow gently around
Springs. White froth of hydrangeas and slender torsos of shadberries, suspended above invisible water,
become a picturesque backdrop for a riverside walk.`

## НЕВИЗНАЧЕНОСТІ (чи потрібен борд-блокер Єгору?)
- M4 body reveal: clip-reveal vs opacity-fade — ОБИДВА правдоподібні в темній смузі. НЕ критично для
  first-cut: беру clip-reveal (hero-family), Єгор скаже на компараторі якщо opacity. НЕ блокер.
- Решта механік ОДНОЗНАЧНІ з кадрів + hero-прецедент. Борд Єгору НЕ потрібен (на відміну forest де був
  спір swipe/tap — тут сімейство вже прийняте на hero).

## S54 ГОРИЗОНТАЛЬНИЙ БОРГ ЗАКРИТО: ЗУМ-АУТ ФОТО ×1.47

**Борг знайшов новий гейт `pan-parity`:** live відкриває кадр по горизонталі ×1.45 у фазі
[0.35, 0.90] тіла, а наш атом не відкривався ЗОВСІМ (зиск ×1.00) — фасад був статичним
`cover`-фото з самим лише вертикальним дрейфом −8%.

**ЧИМ САМЕ live це робить — з'ясовано виміром з ДОВЕДЕНИМ розділенням, а не на око.**
- Спершу спробував ознаку «відношення зиску близького плану до далекого». Вона **ПРОВАЛИЛА
  калібрацію**: на ВІДОМІЙ статиці (синтетичний зум ×1.45) дала 1.037, на ВІДОМОМУ русі камери
  (live parking, доведено в S52) дала 1.003 — тобто не розділяє взагалі, ще й у зворотний бік.
  Ознаку викинуто, жодного висновку з неї не зроблено.
- Робочий вимір: `bestPatchFit` «чи є РАННІЙ кадр підпрямокутником ПІЗНЬОГО». Контроль на тих
  самих двох відомих відповідях дав **справжнє розділення: статика NCC 0.934 · рух камери 0.366**.
  Live promenade f78→f200: **NCC 0.843, масштаб 0.68 (тобто ×1.47)** ⇒ ЗУМ-АУТ СТАТИЧНОГО ФОТО.
  Незалежне підтвердження іншим інструментом: scene-walk на тій самій фазі дав ×1.45.

**ФІКС (без нового асета):** `#facade` отримав `scale(1.47 → 1.0)` у фазі p[0.35, 0.90] поверх
наявного вертикального дрейфу, `transform-origin: 55% 30%` (55% = нерухома точка потоку,
виміряна scene-walk; 30% = та сама точка, що вже стояла в `background-position`).

**РЕЗУЛЬТАТ:** `pan-parity` PASS — наш зиск **×1.43** проти live ×1.45 (розбіжність 1.0% при
допуску 15%), sL −0.23 проти −0.18, sR 1.20 проти 1.26. Вертикальні виміри не зачеплені:
self-check PASS.

**✅ ВЕРДИКТ ОКА ЄГОРА (S54, з телефона через публічний лінк): «приймаю».**
Прийнято збірку із зум-аутом фасаду ×1.47 у фазі p[0.35, 0.90], origin 55% 30%.
Стан на момент приймання: pan-parity PASS (наш ×1.56 проти live ×1.51 на смузі з media-зони),
self-check PASS, UNCHECKED лишався один вимір (media-type).
