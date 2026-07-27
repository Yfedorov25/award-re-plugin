# ORGANISM MANIFEST: air-mobile-hero

> 🏛️ COUNCIL-5 (2026-07-20): hero — це **організм**, НЕ атом. Він НЕ вводить жодного нового закону руху.
> Цей файл = `compose(atomID, params, шви, scroll-timeline)`. Нуль нових законів усередині (доведено beat-list + око B4).
> Джерело правди руху = кожен атом за ID + шви. SPEC.md лишається як опис ФАСАДУ (тексти/біти/асети); MANIFEST — як СКЛАДАННЯ.
> Пов'язано: [[atom-first-not-monolith]] · [[organism-extract-loop]] · S37-ATOM-MOBILE-VERIFY.md · CD-RUN-air-mobile-hero-v2/BEAT-LIST.md

---

## 🔴🔴 S39 ПЕРЕГЛЯД: біти цього MANIFEST були ВИГАДАНІ (не з live). Правда = `KAI/AIR-HERO-SECTION-MAP.md`.
Кістяк `organism/hero.html` зібрано з цього MANIFEST → Єгор: «зовсім по іншому». Корінь: писав з beat-кадрів+припущень.
Реальні біти (з покадрового розбору live): B0 гігант-AIR величезний letter-spacing+fan-спіраль КРІЗЬ; B2/B4 текст ЧОРНИЙ
не сірий; B5 фото full-bleed+панель напливає+сфера ВСЕРЕДИНІ панелі (не окремо); ABOUT/LOCATION-панель константа-рефрен.
Переробляти кістяк ПІД SECTION-MAP. B3 scroll-pin + Onest + механіка-складання лишаються.

## ДОКАЗ «0 НОВИХ ЗАКОНІВ» (число, не думка)
- Beat-list: 6-7 із 7 бітів = атоми ВЖЕ в базі. NEW = 0-1.
- B4 «A NEW PREMIUM FORMAT» звірено ОКОМ проти `reference-frames/beats/04-format.jpg` (S37): twin-tower фото з blur по краях +
  continuous flow = **той самий закон, що air-blur-reveal (B1)**. НЕ новий закон. → hero = **0 нових законів, 100% складання**.
- Playwright 390×844 (S37): усі 5 build-атомів реально рухаються на mobile (звіт S37-ATOM-MOBILE-VERIFY.md).

---

## COMPOSE — 6 атомів за ID (тягнути, НЕ переспецувати)

**4-ГЕЙТ прогнано S38** (`scripts/air-atom-gate.mjs`, foreign-facade 390×844 числами) — звіт `KAI/S38-HERO-ATOMS-4GATE.md`.

| Біт | atomID (за ID з бази) | params композиції (фасад hero) | 4-гейт (foreign 390×844) |
|---|---|---|---|
| B0 | **air-kinetic-letters** | wordmark «AIR» гротеск + fan-спіраль-мотив крізь літери; kicker «THE ARCHITECTURE / OF NEW SUCCESS»; «CLASS (A) / PREMIUM BUSINESS / CENTER» | ✅ **PASS** (FLIP scale 1→0.23, `__KINETIC.p` рахується) |
| B1 | **air-blur-reveal** | body «AIR IS A NEW GENERATION…CLASS A BUSINESS REAL ESTATE»; фото-tower full-bleed зверху | ✅ **PASS** (blur→none, stagger 0,1,2) |
| B2 | **reveal-sequence** | lobby-фото full-bleed + body «EFFICIENT LAYOUTS…BUSINESS ENVIRONMENT» | ✅ **PASS** (clip reveal, parallax 1.04; ⚠ gsap/ST з CDN — див. RISK) |
| B3 | **air-wipe-pin-slider** `{mobile:'scroll-pin', N:2}` | спіраль-скульптура пінится; 2 каптіони свапаються ПО СКРОЛУ; 2-сегм. progress-bar | ✅ **PASS + APPROVED** (S38): scroll-pin реалізовано в engine, counter свап@0.53, pin тримає, Onest-шрифт live; блокер ЗНЯТО |
| B5 | **air-brand-object** `{asset:'sphere-loop.mp4'}` | frosted-glass картка «AN INTELLIGENT HARMONY OF CURVED GLASS AND RADIANT METAL» + chrome-сфера-loop | ⏭ н/д (відео-асет, DOM-руху нема за задумом) |
| B6 | **air-theme-flip** `{palette:AIR}` | інверсія білий→чорний; «AT THE CENTER OF LIFE» + «AT THE HEART OF BUSINESS» + body «…A SYMBOL THE CITY…» | ✅ **PASS** (6 --bg станів, color-only; передати AIR-пресети замість LAGUNA) |

**B4 «format»** = НЕ окремий атом. Це reveal-hold усередині continuous-strip (air-blur-reveal на короткому тексті
«A NEW PREMIUM FORMAT / AT THIS LEVEL, AIR HAS NO COMPETITORS» + twin-tower фото). Компонується тим самим B1-законом.

### Два ПАРАМЕТРИ композиції (НЕ нові закони руху):
1. `air-wipe-pin-slider{mobile:'scroll-pin'}` — hero пінить+скрабить, не тапає (SPEC M8 дописано S37).
2. `air-theme-flip{palette:AIR light↔dark}` — `#f4efe6/#fafafa`+ink`#0a0a0a` ↔ `#0a0a0a`+ink`#f4efe6` (замість LAGUNA dawn-sand).

---

## ШВИ (seam) — під-організми, компонуються МІЖ бітами (каталог: ../../suborganisms/AIR-SEAMS.md)
| шов | між | закон шва (за каталогом під-організмів) |
|---|---|---|
| S0→1 | B0 wordmark → B1 tower | `seam-scroll-wipe` (світле виходить угору, фото заходить) |
| S1→2 | B1 tower → B2 lobby | `seam-continuous-strip` (суцільний потік translateY) |
| S2→3 | B2 lobby → B3 spiral | `seam-pin-enter` (вхід у pin-під-трек air-wipe-pin-slider) |
| S3→4 | B3 spiral → B4 format | `seam-pin-exit` (unpin, потік відновлюється) |
| S4→5 | B4 format → B5 sphere-card | `seam-continuous-strip` + фон темніє (підготовка до інверсії) |
| S5→6 | B5 sphere → B6 dark-act | **`seam-act-invert`** (= air-theme-flip шов: світле вгору / чорне знизу, градієнт ~1.5s) |

---

## SCROLL-TIMELINE (спільний трек — розкладка бітів по одному p∈[0,1])
Один довгий scrub-трек висотою Σбітів. Кожен атом отримує СВОЄ вікно p; шви = переходи між вікнами.
```
p 0.00 ─ B0 kinetic-letters   (HOLD старт ~0.3 gDiff)
p 0.14 ─ S0→1 scroll-wipe
p 0.16 ─ B1 blur-reveal (tower)
p 0.30 ─ S1→2 strip
p 0.32 ─ B2 reveal-sequence (lobby)
p 0.44 ─ S2→3 pin-enter
p 0.46 ─ B3 wipe-pin-slider  [PIN ~2 екрани: slide1 → поріг → slide2]
p 0.62 ─ S3→4 pin-exit
p 0.64 ─ B4 blur-reveal (format + twin-tower)
p 0.72 ─ S4→5 strip (фон темніє)
p 0.74 ─ B5 brand-object (sphere-card, loop автономний)
p 0.86 ─ S5→6 ACT-INVERT (theme-flip шов, ~1.5s ефективно)
p 0.88 ─ B6 theme-flip dark act («AT THE CENTER OF LIFE»)
p 1.00 ─ кінець hero → шов до minute-cards (v2)
```
Пороги — орієнтир розкладки; точні межі вікон = висоти реальних бітів (визначаються при складанні, НЕ вигадуються).

---

## ІНВАРІАНТ ОРГАНІЗМУ (як маніфест, не як рух)
hero готовий ⟺ він виражається ЦИМ compose(): [air-kinetic-letters, air-blur-reveal, reveal-sequence,
air-wipe-pin-slider{scroll-pin}, air-brand-object{sphere-loop}, air-theme-flip{AIR}] + 6 швів + один scroll-таймлайн,
і НЕ вводить жодного закону руху, якого немає в цих атомах/швах. Якщо під час складання зʼявляється потреба
в НОВОМУ русі → це НЕ hero-параметр, це bug report на атом (або новий атом через atom-пайплайн).

## RISK / TODO складання
- **reveal-sequence (B2) CDN-залежність**: тягне gsap/ScrollTrigger з CDN (4 refs). hero-artifact self-contained? →
  або вбудувати gsap локально в organism-збірку, або лишити CDN (hero не offline). Рішення при складанні.
- **air-theme-flip build = LAGUNA**: передати AIR-пресети (не форкати build; палітра — data-параметр).
- **air-wipe-pin-slider scroll-pin**: опція в SPEC є (S37), у build.html реалізації scroll-pin-гілки ще НЕМА (default=tap) →
  дописати гілку в engine перед складанням hero, з playwright-пробою на pin-стабільність (390×844).

## СТАТУС
🟡 MANIFEST готовий (S37). Складання organism-html = НАСТУПНИЙ крок (коли scroll-pin-гілка B3 реалізована +
AIR-пресети B6 передані). Старий v1/v2 `variants/{a,b,c}.html` = референс-механіки (моноліт), НЕ канон.
