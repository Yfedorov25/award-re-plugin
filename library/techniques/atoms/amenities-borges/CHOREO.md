# BORGES (блок 08) — КАРТА ХОРЕОГРАФІЇ (S47, з live-кадрів 3-12fps + вимір)

> Джерело: повний amenities-ролик (ScreenRecording_07-20-2026 23-29-38, 247с). Розбір: contact 2fps
> (113-131с) + entry 3fps (114-122с) + bg-drift track (bgtrack.mjs) + machine-timeline.
> 🔴 reference ЗВУЖЕНО до ЧИСТОГО borges **t119-124.5** (5.5с): тіло секції БЕЗ шва promenade (плитки
> зверху) і БЕЗ шва ivy (cream-панель знизу). Причина: surface-parity зловив темп-розбіжність — на
> ширшому кропі 113-126с ранні стани p0.25/0.5 = ще ШОВ promenade→borges (темна перехідна зона, яку
> ґаттер бачив як «панель»), а standalone-атом стартує borges-фото з p0. Шви належать сусіднім атомам.
> cleantrack на чистому кропі: vShift≈0 весь блок (фон майже статичний, НЕ великий drift). Модель: Opus 4.8.
> Механіка = A6 render-scroll-hero-fade, ТЕ САМЕ сімейство що прийняті hero + promenade.
> ВІДМІННІСТЬ від promenade: текст НЕ fade і НЕ swipe-стрічка — стабільний serif-параграф на фото.

## СУТЬ
Full-bleed фото ТЕМНОГО ЛИСТЯ (одне) parallax-drift вгору на вході потім hold; borges-текст
(cream serif) виїжджає знизу ЦІЛИМ блоком (шов з promenade), тоді ТРИМАЄТЬСЯ внизу-ліворуч
непрозорий увесь блок. Текстова «дихальна» секція між фото-важкими сусідами. Наприкінці ivy
cream-панель заходить знизу = шов у блок 09.

## ФАЗИ (по scroll progress p, кроп 113-126с → p=(t-113)/13)

### Ф1 (p 0.00–0.15, ~113-115с) — ШОВ promenade→borges
- promenade-хвіст (свайп-плитки FLOWERBEDS/BOTANICAL ZONES) ще вгорі; знизу ВИЇЖДЖАЄ borges-текст
  ЦІЛИМ блоком (спершу видно хвіст «...of endless possibilities. At Springs...WowHouse...goals.»,
  потім повний параграф). Timeline: f21-37 UP centroidDrift -5.6%h (t114.75-116.08).
- (Це шов між атомами; у standalone borges стартуємо з full-bleed листя + текст уже внизу.)

### Ф2 (p 0.15–0.45, ~115-119с) — фон встановлюється, plitки promenade виїжджають
- promenade-плитки виїжджають угору (зменшуються зверху → зникають), borges-текст піднявся й тримається.
- Фон borges (темне листя) з'являється під текстом, DRIFT-иться вгору. Вимір bgtrack: vShift сумарно
  ~368px екрана на t118.0-119.0 (similarity зростає 0.51→0.96). Timeline f55-70 UP -9.1%h.

### Ф3 (p 0.45–0.90, ~119-124с) — borges HOLD (тіло секції)
- borges на ПОВНИЙ екран: full-bleed темне листя-фото + cream serif borges-параграф внизу-ліворуч.
- Фон ЗАСТИГАЄ. Вимір bgtrack: vShift 0, similarity 0.94-1.00 на t119-124 = ОДНЕ фото (НЕ crossfade;
  жодного падіння similarity<0.5). Дрібні коливання = боке/світло, не зміна кадру.
- Текст ТРИМАЄТЬСЯ cream-непрозорий (НЕ fade як promenade title, НЕ clip-reveal). Стабільний.

### Ф4 (p 0.90–1.0, ~124-126с) — вихід у шов borges→ivy
- ~125с (p0.94) ivy cream/бежева панель заходить знизу «Sit down to read under ivy-covered awning»
  = ШОВ S08→S09 → блок 09 (окремий атом ivy). Timeline f147-155 bottomEntry 0.16.

## МЕХАНІКИ (перенесено з hero/promenade A6, адаптовано)
- **M1 pin-stage**: `.wrap{height:~240vh}` + `.stage{sticky;top:0;height:100dvh}`, p 0..1.
- **M2 leaf parallax (ДУЖЕ малий)**: full-bleed фото листя `height:114%`, translateY -p*4% (ледь помітне
  «дихання»). Вимір cleantrack на чистому borges: vShift≈0 весь блок → фон майже статичний, не великий
  drift. Попередній «~368px» вимір був на шві promenade→borges (секції мінялись), не в тілі borges.
- **M3 borges text HOLD (🔴 ключова відмінність)**: Victor Serif 26px cream внизу-ліворуч, ТРИМАЄТЬСЯ
  непрозорий весь блок (opacity 1). НЕ fade (на відміну promenade M3), НЕ clip-reveal. Легкий
  translateY-lift. Текст ЦІЛИЙ від входу. 🔴 КЕГЛЬ З ВИМІРУ: live-текст 35% висоти/топ58%
  (brightness-profile); наш 31%/топ60% при 26px. Переноси ПО ФРАЗАХ (`<br>`) як live, не auto-wrap.
  (Урок S47: спершу звіряв кегль ОКОМ і помилився напрямком — зменшував замість збільшувати;
  число виправило — [[verify-dont-agree-analyze-every-frame]]).
- **M4 header scrim/статичний хедер**: Springs-лого+heart+burger зверху (той самий що hero/promenade).
- **M5 no cream-панель, no swipe-стрічка**: borges = чистий текст-на-фото (найпростіший сімейства).

## ІНВАРІАНТИ ЗАКОНУ
Фото листя parallax-drift вгору на вході потім hold (ОДНЕ фото, не crossfade); borges serif-текст
ТРИМАЄТЬСЯ непрозорий (не fade, не reveal, не swipe); 0 cream-панелі; 0 плиток; усе від scroll-годинника.

## АСЕТ (наш higgsfield, НЕ springs — закон higgsfield-facade-photos)
1 full-bleed фото 3:4 ТЕМНОГО ЛИСТЯ: крупний план листків/гілок на майже чорному тлі, м'яке зелене
світло знизу підсвічує деякі листки, боке-глибина, атмосферне приглушене. Настрій live-borges
(нічний сад, споглядальний). nano_banana_pro. НЕ скрін springs.

## ТЕКСТИ (verbatim з live)
Borges: `In The Garden of Forking Paths, a short story by Borges, the author created a world of
endless possibilities. At Springs, the acclaimed design bureau WowHouse paved artistic paths towards
your goals.`

## НЕВИЗНАЧЕНОСТІ (борд-блокер Єгору?)
- Title-fade наприкінці: у кадрах текст тримається непрозорий до t125 (виходить у шов з ivy). Беру HOLD
  (без fade). Якщо Єгор побачить fais на компараторі — додам. НЕ блокер (сімейство прийняте hero+promenade).
- Решта механік ОДНОЗНАЧНІ з кадрів+вимірів+прецеденту. Борд Єгору НЕ потрібен.
