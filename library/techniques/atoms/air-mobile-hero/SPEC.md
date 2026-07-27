# ATOM: air-mobile-hero — вертикальний scroll-наратив головної AIR (7 бітів, білий→чорна інверсія)

> Закон руху, НЕ сніпет. MOBILE 390×844 (портрет). Ролі абстрактні:
> stage (full-viewport scroll-полотно) / photo-bleed (full-bleed фото як тло) / headline (гротеск-заголовок оверлеєм) /
> spiral-motif (fan/гвинтова стрічка-рефрен «3 вежі») / glass-card (frosted-панель) / brand-object (chrome-сфера що обертається — асет) /
> act-invert (шов світлий-акт → темний-акт скролом).
> Джерело: live-запис Єгора `ScreenRecording 23-13-04` (28.4s, 1170×2532), 2026-07-18.
> Рух ВИМІРЯНО frame-diff (`scratchpad/air-mob/v1-MOTION-MEASURED.md`) — не вигадано ([[measure-motion-before-spec]]).
> 🔴 iOS-перф вшито ([[ios-perf-mobile-scroll]]): touch = scrub:0.25 БЕЗ Lenis; touch-action НЕ pan-x; blur→rgba-tint;
> will-change динамічно; opacity не autoAlpha; --vh з 100vh-probe; culling ±1.5vh.

## СУТЬ (одне речення)
Головна AIR на моб = довгий вертикальний scroll-наратив, де контент їде вгору суцільним потоком (continuous-strip),
фото-беби full-bleed служать тлом, гротеск-заголовки заходять оверлеєм; секція проходить світлий акт
(wordmark → вежа → лобі → спіраль → format → chrome-сфера) і завершується КОМПОЗИЦІЙНОЮ інверсією в чорний акт
«AT THE CENTER OF LIFE» (світла секція виходить угору, нативно-чорна заходить знизу, затемнення градієнтне ~1.5s).

## ЧОМУ ЦЕ ПРАЦЮЄ
Scroll-наратив = кіно (кожен біт — окремий кадр-твердження). Фото full-bleed = довіра (реальні простори).
Chrome-сфера + спіраль = кінетичний бренд-рефрен (метал/скло = матеріальність AIR). Інверсія білий→чорний =
драматургічна межа акту (перехід від «що це» до «де це / центр життя»), яку око читає як зміну розділу.

## БІТИ (порядок фіксований; VERBATIM текст load-bearing)
- **B0 wordmark** (акт світлий): гігантське **AIR** гротеском, **fan-спіраль-мотив плететься КРІЗЬ літери** (білі гофровані
  стрічки за/навколо A·I·R). Над ним «THE ARCHITECTURE / OF NEW SUCCESS». Під ним по центру «CLASS (A) / PREMIUM BUSINESS / CENTER» (сірий).
  ↓ down-arrow низ-право. Короткий HOLD на старті (виміряно: gDiff≈0.3 @t2-3s).
- **B1 tower**: full-bleed фото скляної вежі (синє небо) вгорі + «AIR» мале top-left. Під фото на білому — «THE MOMENTUM / TO RISE HIGHER»
  (великий гротеск). Нижче **blur-reveal** сірий body: «AIR IS A NEW GENERATION OF OFFICES THAT BRINGS A NEW LEVEL OF PREMIUM QUALITY
  AND STYLE TO CLASS A BUSINESS REAL ESTATE.» (= air-blur-reveal у моб-формі — слова різкішають по входу).
- **B2 lobby**: full-bleed фото лобі (скляні хвилі-стелі, chrome-ресепшн) + body «EFFICIENT LAYOUTS AND PREMIUM INFRASTRUCTURE,
  PANORAMIC GLAZING AND IMPRESSIVE VIEWS, LUXURIOUS LOBBIES, AND FORWARD-LOOKING FACADES SET A NEW BENCHMARK FOR BUSINESS ENVIRONMENT.»
- **B3 spiral = 🔴 PINNED CAPTION-SLIDER (2 слайди)** [ВИПРАВЛЕНО v2 після фідбеку Єгора — перевиміряно live t12-22]:
  велика вертикальна **гвинтова fan-спіраль-скульптура** на білому (символ «3 вежі») ПІНИТЬСЯ; по скролу СВАПАЄТЬСЯ
  тільки КАПТІОН, 2-сегментний прогрес-бар унизу заповнюється сегмент-за-сегментом (спіраль ТА САМА обидва слайди):
  · Слайд 1 (сегм.1 чорний): «THREE TOWERS RANGING FROM 14 TO 34 FLOORS REFLECT THE DYNAMIC CHARACTER OF OFFICE LIFE
    THROUGH THEIR EXPRESSIVE FORMS. THEY SYMBOLIZE ONE OF THE CAPITAL'S KEY BUSINESS DISTRICTS»
  · Слайд 2 (сегм.2 чорний): «THE SMOOTH ROTATION OF THE FACADES AROUND A CENTRAL AXIS ADDS MOVEMENT AND ENERGY TO
    THE OVERALL SILHOUETTE. THE ROTATIONAL EFFECT CREATES A DISTINCTIVE ARCHITECTURAL RHYTHM.»
  Після 2 слайдів → unpin → потік далі. Свап каптіону = ЧИСТИЙ handoff (стара гасне → нова заходить), НЕ cross-fade.
- **B4 format**: короткий світлий текст-hold «A NEW PREMIUM FORMAT» / «AT THIS LEVEL, AIR HAS NO COMPETITORS».
- **B5 brand-object**: full-bleed фото скляної вежі (темніше) + **frosted-glass КАРТКА** з текстом «AN INTELLIGENT / HARMONY OF CURVED /
  GLASS AND RADIANT / METAL» + **chrome+gold twisted сфера-тор що ОБЕРТАЄТЬСЯ** (виміряно: сегменти повертаються — АСЕТ, не статик).
- **B6 act-invert** (шов + акт темний): інверсія білий→чорний → «AT THE CENTER / OF LIFE» (білий гротеск на чорному) + «AT THE HEART /
  OF BUSINESS» (сірий, right-align) + body «THE PREMIUM AIR BUSINESS CENTER IS DESIGNED TO BECOME A SYMBOL THE CITY — A LARGE-SCALE AREA
  SPANNING ONE OF THE CITY'S PRIMARY BUSINESS DISTRICTS.» Це межа акту → шов до наступної секції (minute-cards, v2).

## МЕХАНІКИ
- **M1 scroll-strip (головний рух)**: полотно рухається вертикально суцільним потоком — контент translateY(-p·H) або нативний
  скрол по секції висотою Σбітів. Continuous-strip як springs mobile-hero/design-section/location-A. 🔴 НЕ yPercent-виштовхування
  (duration:0.04 «різкий форс» — заборонено, урок S41). НЕ CSS scroll-snap між бітами (наратив плавний).
- **M2 blur-reveal (B1 body)**: слова заходять з blur(8-10px)→0 + opacity по входу у в'юпорт, stagger ~40-60ms, transform+opacity only.
  На touch: blur через rgba-tint шар, НЕ backdrop-filter (iOS-перф).
- **M3 photo-bleed parallax (тонкий)**: фото-беби мають ЛЕГКИЙ y-parallax відносно тексту (фон рухається повільніше, ~0.85×),
  щоб читалось як глибина. Максимум translate, нуль scale-скачків.
- **M3b pin-caption-slider (B3) 🔴 НОВЕ v2**: спіраль-скульптура ПІНИТЬСЯ (position:sticky/pin на ~2 екрани треку); прогрес по цьому
  під-треку розбитий на 2 пороги → каптіон свапається (слайд1→слайд2, чистий handoff) + 2-сегментний прогрес-бар заповнюється
  (i.on послідовно). Спіраль лишається на місці весь під-трек. Після p_під-трек=1 → unpin, потік далі. Тач: свап по скролу (НЕ
  auto-timer, НЕ горизонтальний свайп-обов'язок — driven скролом; додатково tap на бар може стрибати). Патерн = interiors-cycle/
  residences-slab, адаптований під моб-тач. transform+opacity only; реверс симетричний.
- **M4 brand-object обертання (B5)**: chrome-сфера обертається безперервним loop-ом. 🔴 АСЕТ = **higgsfield seamless-loop video**
  (`assets/sphere-loop.mp4`, справжнє 3D-обертання тора навколо вертик.осі) — НЕ плаский CSS `rotate(360deg)` кола (це дало «чужий»
  вигляд у v1, фідбек Єгора). Обертання АВТОНОМНЕ (не scroll-linked). Живе у frosted-glass картці. Fallback: 3D `rotateY` loop, не 2D rotate.
- **M5 act-invert (B6 шов)**: КОМПОЗИЦІЙНИЙ, не color-tween. Світлий акт (B0-B5 контейнер) виходить угору потоком; темний акт (нативно
  bg:#0a0a0a) заходить знизу тим самим потоком. Затемнення градієнтне ~1.5s ефективно (виміряно: lum 145→114→90→62 за 3-4 кадри).
  Хедер-чіп/burger інвертують колір на межі (chrome = секція під хедер-лінією — закон air-theme-flip A4).
- **M7 layout-frame (фікс «чорні полоски» з v1)**: designed-width моб-каркас **max-width ~430px, main margin:0 auto**; фон СТОРІНКИ
  (html/body) поза каркасом = такий самий, як активний акт (світлий #fff / темний #0a0a0a), щоб при перегляді в ширшому в'юпорті
  не було випадкових темних смуг по боках. Нуль повноширинних розтягнень мобільної верстки.
- **M6 reduced-motion**: усе видиме статично, нуль обертання, нуль blur; сфера = статичний кадр; B3 показує обидва каптіони або слайд1.

## COUPLING / SCROLL-WINDOW
Наратив scrub-driven по всій висоті секції (один довгий трек), АЛЕ **B3 = пін-під-трек** усередині (спіраль пінується ~2 екрани,
каптіон свапається 2 слайди — M3b), і **B5-обертання (M4)** + **blur-reveal (M2)** локальні. Решта бітів — суцільний потік.
Інверсія (M5) = останнє вікно треку; темний акт має власну висоту для читання body перед шво́м до v2.

## ІНВАРІАНТИ ЗАКОНУ (що робить це ЦИМ атомом)
Порядок 7 бітів фіксований; головний рух = вертикальний continuous-strip (НЕ виштовхування, НЕ snap);
інверсія білий→чорний = компонований scroll-шов (світлий виходить угору / темний заходить знизу), НЕ color-tween;
brand-object обертається автономним loop-ом у frosted картці; blur-reveal на B1-body; transform+opacity only;
determinism (стан = f(scroll), реверс симетричний). Конкретні фото, шрифт-фасад, точні висоти бітів, ступінь
parallax, тривалість blur — параметри фасаду.

## TRANSFER-ГЕЙТ (acceptance, ганяти числами — патерн location-section-gate)
1. **Continuous-strip**: при русі скролу зсув контенту монотонний і пропорційний (Δcontent ≈ Δp·H ±шум); НЕ стрибки
   yPercent >1 екрана на малий Δp (анти-«форс-перехід»). Тортура-телепорт → детермінований стан.
2. **7 бітів присутні** з VERBATIM textContent (не innerText): усі 7 текст-блоків у DOM у правильному порядку + ОБИДВА B3-каптіони.
3. **B3 pin-slider 🔴**: під час B3-під-треку rect спіралі СТАБІЛЬНИЙ (пін тримається, Δtop≈0 при русі скролу в межах під-треку);
   каптіон свапається слайд1→слайд2 на порозі (textContent обох verbatim); прогрес-бар: i.on = 1 сегмент на слайді1, 2 на слайді2;
   свап = чистий handoff (нема кадру з обома каптіонами видимими); реверс симетричний. Тортура-телепорт у B3 → детермінований слайд.
4. **blur-reveal B1**: слова body стартують blur>4px поза в'юпортом і =0 у в'юпорті (проба filter обчислена per-word).
4. **brand-object обертається**: screenshot-diff кропу сфери між двома кадрами при статичному скролі > поріг (крутиться);
   і це асет (є `assets/sphere*`), не CSS.
5. **act-invert**: на порозі інверсії фон переходить світлий→#0a0a0a; хедер-чіп інвертує; НЕ cross-fade двох текстів в одному місці
   (чистий handoff). textContent «AT THE CENTER OF LIFE» + «A SYMBOL THE CITY» присутні у темному акті.
6. **layout-frame**: main max-width ≤ ~430px; фон сторінки == активний акт (нуль випадкових темних смуг по боках при в'юпорті >430px).
7. **iOS-перф**: 0 `backdrop-filter` на рухомих шарах (rgba-tint замість); 0 `touch-action:pan-x`; will-change знімається після руху;
   `--vh` з 100vh-probe. Хук `window.__HERO = { p:()=>progress, act:()=>('light'|'dark'), objSpins:()=>bool, b3slide:()=>1|2 }`; 0 console errors.

## VERBATIM SPELLING (load-bearing, НЕ нормалізувати)
«A SYMBOL THE CITY» (без "of"!) · «CLASS (A)» (з дужками, B0) · «CLASS A BUSINESS REAL ESTATE» (без дужок, B1) ·
«14 TO 34 FLOORS» · «— A LARGE-SCALE» (em-dash) · «THE CAPITAL'S KEY BUSINESS DISTRICTS» (typographic apostrophe) ·
B3-слайд2: «THE SMOOTH ROTATION OF THE FACADES AROUND A CENTRAL AXIS ADDS MOVEMENT AND ENERGY TO THE OVERALL SILHOUETTE.
THE ROTATIONAL EFFECT CREATES A DISTINCTIVE ARCHITECTURAL RHYTHM.»

## АСЕТИ (генеруються ДО CD-промпта — фото-залежний атом, ТЗ-v3 п.2)
- `assets/sphere-loop.*` — chrome+gold twisted сфера-тор, ОБЕРТАННЯ loop (higgsfield: seamless-loop video АБО 24-frame sprite;
  springs-настрій, near-white/neutral). Fallback: pre-rendered .webm.
- `assets/spiral-motif.svg|png` — fan/гофрована гвинтова стрічка (B0 крізь літери + B3 скульптура). Можна CSS/SVG якщо читається як спіраль.
- `assets/photo-tower.webp` · `assets/photo-lobby.webp` — скляна вежа / лобі зі скляними хвилями-стелями (higgsfield 9:16 або чесний кроп master).
🔴 Фото/сфера НЕ CSS-градієнти (стеля=плями доведена, [[higgsfield-facade-photos]]).

## ФАЙЛИ
`build.html` = CD-RAW канон (після APPROVE). `variants/{a,b,c}.html` = 3 CD-варіанти. `SPEC.md` = цей файл.
Реф-кадри live: `scratchpad/air-mob/hero-ref/beat-0..6.jpg`. Вимір руху: `scratchpad/air-mob/v1-MOTION-MEASURED.md`.
