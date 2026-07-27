# ATOM: parallax-hero-fade (amenities-hero) 📱🧬 — ✅ ПРИЙНЯТО оком Єгора (S45, «так супер»)

> ✅ S45 ПРИЙНЯТО на компараторі в русі. Механіка з першого разу вірна (розкадрував live h_001→h_009
> покадрово ДО побудови). Темп cream wipe підстроєно раз (був швидший за live). Блок 01 закрито.

> Закон РУХУ (scroll-driven, pinned stage). Джерело: springs.estate/amenities блок 01 hero.
> Приймання = ОКО Єгора на компараторі в русі. Механіка звірена з live покадрово (h_001→h_009).

## СУТЬ (одне речення)
Full-bleed фасад-рендер скролить вгору (parallax drift); «Amenities» serif lower-left + «BEAUTY AT YOUR
FINGERTIPS» kicker + scroll-hint ⊘ РОЗЧИНЯЮТЬСЯ (opacity fade) по скролу; знизу піднімається cream-панель
(wipe-up шов S01) з «Springs is a rational choice» serif на ній.

## МЕХАНІКИ
- **M1 pin-stage**: `.hero-wrap{height:200vh}` + `.stage{sticky;top:0;height:100dvh}`. scroll p 0..1.
- **M2 facade ЗУМ-АУТ (🔴 ПЕРЕПИСАНО S55; було «parallax translateY −14%» — закон був ПРОТИЛЕЖНИЙ live)**:
  `.facade{height:100%; transform-origin:50% 39.9%}`, `scale(1.96·s)`, де `s = 1 − 1.568·rise`
  з НАСИЧЕННЯМ на `s = 0.51` (фасад ×1.96 → ×1.00 і далі стоїть).
  `rise` — той самий, що жене крем-панель (M4): масштаб медіа ЗЧЕПЛЕНИЙ з положенням крему.
  Джерело: вимір з live трьома незалежними шляхами, CHOREO §S55. Точка сходу зуму 39.9% висоти
  контенту (стабільна 1.6px на трьох парах). s(верхКрему%): 94.4→0.918 · 90.3→0.847 · 85.8→0.773 ·
  80.8→0.710 · 75.1→0.610 · 73.1→0.555 · 67.9→0.510 · 63.2→0.509 · 58.3→0.510 (насичення).
  Парність збірки проти live на СПІЛЬНОМУ годиннику (верх крему) ≤1.2% на всьому діапазоні.
  ⚠️ ПОЗА виміром: live-запис кінчається на верху крему 58.3% (наш p≈0.60), бо там спинилась РУКА.
  Що фасад робить далі — не знято ніде; тримаємо насичення і руху не вигадуємо.
- **M3 title fade-coupling (🔴)**: titleblock+hint opacity 1→0 over p 0→0.62 (holds довше як live h_007
  де «Amenities» ще напівпрозорий); titleblock також translateY -p*40px (легкий lift).
- **M4 cream wipe-up (шов S01)**: `.cream` translateY 100%→0 over p 0.32→0.98 (пізніше+повільніше, темп live).
- **M5 header scrim**: top gradient scrim щоб Springs-лого+burger читались над рендером.
- **M6 prose on cream**: «Springs is a rational choice…» serif ink на cream-панелі.

## ІНВАРІАНТИ ЗАКОНУ
1. Фасад ЗМЕНШУЄТЬСЯ монотонно (зум-аут), НЕ травелить: `Δtranslate ≈ 0`, `Δclip = 0`, змінюється
   лише bbox. Зум ОДНОРІДНИЙ (sx = sy) і довкола НЕРУХОМОЇ точки — додаткового зсуву немає.
2. Масштаб фасаду ЗЧЕПЛЕНИЙ з положенням крем-панелі (спільний `rise`), а не з власним таймером.
3. Зум НАСИЧУЄТЬСЯ (доходить до ×1.00 і стоїть), а крем після цього їде далі САМ.
4. title+hint FADE (не виїжджають, opacity-ramp), fade coupled (разом).
5. cream wipe-up знизу монотонно; усе від scroll-годинника.
🔴 Інваріант 1 прямо суперечить редакції до S55 («фасад скролить вгору, parallax»). Стара редакція
була НЕВІРНА: у live медіа зменшується і сповзає вниз, у нас не масштабувалось і їхало вгору.

## АСЕТ (наш higgsfield, не springs)
`variants/assets/hero.webp` (nano_banana_pro 2k) — модерна вілла dusk, curved cantilever-дах, wood-slat
фасад, turquoise басейн, лежаки, topiary, skyline. Настрій live-hero. НЕ скрін springs.
🔴 **S55: асет ЗАМАЛИЙ під новий закон.** Реально 896×1200. Стейдж 390×844 CSS при DPR 2: `cover`
уже на p=1 дає ×1.4 апскейлу (так було й у S45), а зум ×1.96 на старті робить ×2.76 — стартовий
кадр найм'якіший. Потрібен асет ≥1600px по ширині. Це різкість, не рух; закон від неї не залежить.

## ТЕКСТИ (verbatim з live)
Title: `Amenities` · kicker: `Beauty at Your Fingertips` · prose: «Springs is a rational choice that you
make with your heart. Listen: City's pulse steadies and synchronizes with the rhythm of your life.»

## ГЕЙТ / ЗВІРКА
- ⚠️ `scripts/hero-gate.mjs` — **ЗАСТАРІЛИЙ з S55**: він перевіряв `facade parallax drift 139px`,
  тобто рівно той закон, який виявився невірним. Гейт, який стереже скасований закон, гірший за
  відсутній. Не посилатись на нього, поки не переписано під M2 (зум).
- `node scripts/self-check.mjs --atom amenities-hero` — робоча обвʼязка (config поруч).
  `mech:facade` тепер судить арм `mechanism:'scale'` (S55, свій інжектор `scratchpad scaleinj.mjs`:
  чистий PASS, «фасад травелить замість зуму» FAIL).
- 🔴 `surface-parity` і `composition-static` на цьому атомі ЧЕРВОНІ СВІДОМО: вони парують наш `p`
  до live ПО ЧАСУ (`t = p·dur`), а рука в записі стоїть паузами — розбіжність станів росте
  монотонно 8% → 38% → 51%. Плюс наше тіло довше за ЗАПИС. Це питання до Єгора (PLAN §5б),
  а не борг атома. **Не «фіксити» їх підгонкою станів.**
- Самозвірка числом: парність зуму проти live на спільному годиннику ≤1.2% (таблиця в CHOREO §S55).
- приймання = ОКО Єгора. Борд станів (спарований ПО СТАНУ) і сам атом викладено на
  https://springs-atom-parking.vercel.app

## ФАЙЛИ
`variants/hero.html` · `variants/compare.html` · `variants/assets/hero.webp` · `variants/_fonts/` ·
`variants/_springs-tokens.css` · `reference/hero-live.mp4`.
