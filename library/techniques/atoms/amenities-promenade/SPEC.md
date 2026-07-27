# ATOM: render-scroll-hero-fade (amenities-promenade) 📱🧬 — ✅ ПРИЙНЯТО Єгором (S47 «так все супер», компаратор)
# блок 06 (S46 будова + S47 хвіст-плитки = свайп-стрічка M7). Модель: Opus 4.8.

> Закон РУХУ (scroll-driven, pinned stage). Джерело: springs.estate/amenities блок 06 promenade.
> Механіка = A6 render-scroll-hero-fade, ТЕ САМЕ сімейство що прийнятий hero (parallax-hero-fade).
> Розбір: `KAI/PROMENADE-CHOREO-MAP-S46.md` (кроп 86-107с, 252 кадри 12fps + fade-zoom 0.33с).
> 🔴 Будується через ПОВНУ систему-контроль S45-d (тест: Opus використовує архітектуру Fable).
> Приймання = ОКО Єгора на компараторі в русі + self-check зелений ПЕРЕД показом.

## СУТЬ (одне речення)
Full-bleed 3:4 рендер набережної скролить вгору (parallax drift); cream serif «Riverside Promenade
at Your Doorstep» lower-left ТРИМАЄТЬСЯ до p0.48 тоді РОЗЧИНЯЄТЬСЯ (opacity fade in place); знизу
reveal-иться body-copy на темно-зеленій ПАНЕЛІ що травелить угору, а під копією — ГОРИЗОНТАЛЬНА
СВАЙП-СТРІЧКА з ≥3 botanical-плиток (touch-drag+snap, ~2 видно). БЕЗ cream-панелі (відмінність від hero).

## ФАЗИ (scroll p, детально в CHOREO-MAP)
- **Ф2 (p 0.10–0.48):** фото parallax-scroll вгору; title непрозорий, тримається lower-left.
- **Ф3 (p 0.48–0.62):** title FADE opacity 1→0 in place (виміряно з fade-zoom: тримається до ~96с=p0.48,
  бліднути 96-99с). Верифікатор таксономії REFUTED «clip» — це справжній opacity fade.
- **Ф4 (p 0.57–1.0):** body-copy reveal знизу (темна смуга), ПІЗНІШЕ за title-fade.

## МЕХАНІКИ (перенесено з hero A6)
- **M1 pin-stage**: `.wrap{height:200vh}` + `.stage{position:sticky;top:0;height:100dvh}`, p 0..1.
- **M2 facade parallax**: `.facade{height:114%}` translateY -p*12% (drift вгору повільніше скролу).
- **M3 title fade (🔴 ключова)**: `.title` opacity 1→0 over p **0.48→0.62** (тримається довше за hero!
  hero=0→0.62); title lower-left, легкий translateY -p*20px. Coupled (весь блок разом).
- **M4 body-copy reveal**: `.body` clip-path inset bottom 100%→0 over p **0.57→0.72** (знизу вгору).
- **M5 header scrim**: top gradient scrim для Springs-лого+burger над фото.
- **M6 no cream**: НЕ має cream-панелі (hero-M4 тут відсутній). Body на затемненні фото знизу.
- **M7 swipe-strip (🔴 S47, вимір повного ролика)**: горизонтальна стрічка НА band-панелі під body-copy.
  `.tiles{overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch}`; ≥3 плитки
  `.tile{scroll-snap-align:start; flex:0 0 66%}` (візирає ~1/3 наступної). Трек ПЕРЕПОВНЕНИЙ
  (scrollWidth>clientWidth). Driver = touch-swipe drag + iOS momentum + rubber-band + snap. НЕ auto-loop,
  НЕ scroll-scrub (обидва REFUTED виміром track.mjs: скрол монотонний, стрічка стоїть-ривок-стоїть з
  пружним відкотом). Стрічка = дитя `.band` → вертикально їде з панеллю.

## ІНВАРІАНТИ
Фото scroll+parallax вгору; title FADE opacity (не виїжджає, тримається до p0.48); body reveal знизу
ПІЗНІШЕ за title-fade; 0 cream-панелі; вертикаль усе від scroll-годинника — КРІМ хвоста-плиток (M7):
горизонтальна свайп-стрічка ≥3 плиток на touch-drag+snap (окремий driver, НЕ scroll), переповнений
трек (scrollWidth>clientWidth), кожна snap-align, ~2 видно за раз.

## АСЕТИ (наші higgsfield, НЕ springs)
- `variants/assets/promenade.webp` (nano_banana_pro 3:4) — гранітна набережна, curved-balcony вежа праворуч,
  звивиста доріжка сірого граніту, 1-2 фігури, дерева, синьо-бірюзові сутінки. Настрій live-promenade.
- **Стрічка M7 (3 портретні tile-асети, ~3:4.4):**
  - `tile-trees.webp` — LUSCIOUS TREES: темний зелений кущ/дерево крупним планом, м'яке боке.
  - `tile-flowers.webp` — DECORATIVE FLOWERBEDS: жовті квіти крупним планом, тепле світло (ЄСТЬ).
  - `tile-zones.webp` — BOTANICAL ZONES: садові зони, різнобарвні кущі (червоні), стрижене дерево (ЄСТЬ).

## ТЕКСТИ (verbatim live)
Title: `Riverside Promenade at Your Doorstep`
Body: «Winding paths, paved with gray granite, resemble creeks and riverbeds that flow gently around
Springs. White froth of hydrangeas and slender torsos of shadberries, suspended above invisible water,
become a picturesque backdrop for a riverside walk.»

## ГЕЙТ / ЗВІРКА (система S45-d + S47 swipe-strip детектор)
- `node scripts/self-check.mjs --atom amenities-promenade` МУСИТЬ бути зелений ПЕРЕД компаратором.
  Виміри: fade (title 0.48-0.62) · timing (band.motion.start 0.36) · channel-identity (band translate) ·
  surface-parity (панель наша↔live) · census (усі шари задекларовані) · geometry · purity.
- **🔴 S47 НОВИЙ вимір `swipe-strip` (детектор B23, вердикт Єгора):** трек хвоста-плиток МУСИТЬ:
  (а) scrollWidth > clientWidth (переповнений, свайп-кью є); (б) ≥3 плитки-діти; (в) scroll-snap-type
  містить x; (г) кожна плитка scroll-snap-align set; (д) програмний scrollLeft=+200 РЕАЛЬНО зміщує
  трек (свайп працює, не заблокований). Провал будь-якого = STATIC-tiles баг ітерації-1.
- config+expectations генерую `--init`, числа підтверджую з CHOREO/live (закон B22).
- Самозвірка ОКОМ покадрово (закон B20) ДО показу.
- приймання = ОКО Єгора на компараторі `variants/compare.html` (з UNCHECKED поруч з URL).

## ФАЙЛИ
`variants/promenade.html` · `variants/compare.html` · `variants/assets/promenade.webp` ·
`variants/_fonts/` · `variants/_springs-tokens.css` · `reference/promenade-live.mp4`.
