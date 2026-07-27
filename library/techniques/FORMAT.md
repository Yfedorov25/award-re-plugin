# techniques/ — формат двоплатформного модуля (СТАНДАРТ конвеєра)

> Це специфікація, якій підкоряється КОЖЕН модуль у `library/techniques/`.
> Затверджено Єгором на еталоні `rotated-matrix-collage`. Розбираємо springs (і далі
> інші award-сайти) на прийоми як РОБОЧІ двоплатформні прототипи-модулі.

## Формат A — одна папка, 2 гілки коду, meta-різниця

Кожен модуль = одна папка `techniques/<id>/` з файлами:

| файл | що це |
|---|---|
| `component.js` | **dual-обгортка**: `<Id>Dual.init(target, {platform, …})`. Явна гілка `platform==='desktop' ? scroll…() : auto…()`. Різниця платформ ЧИТАЄТЬСЯ у структурі коду, не ховається в matchMedia всередині логіки. |
| `engine.js` | **доведений core** (скопійований з `library/components/<id>/component.js`, НЕ з нуля). Дає pure `set(p)`/`render(prog)`. Мінімальні additive-патчі (див. нижче). |
| `component.css` | стилі прийому (з компонента). |
| `stage.html` | standalone один прийом, `platform:'auto'` — те, що вантажать iframe-фрейми. Значок-бейдж угорі показує обрану гілку. |
| `demo.html` | **два справжні пристрої-фрейми (iframe)**: phone 390×844 (1:1) + desktop 1440 (scaled-to-fit, iframe рапортує справжні 1440 у matchMedia). Унизу таблиця «Чим mobile відрізняється й чому». |
| `meta.json` | поля `dual_platform`, `differs`, `desktop{driver,knobs}`, `mobile{driver,knobs}`, `knobs`, `entry`, `law`, `files`. |
| `README.md` | обов'язкове поле «чим mobile відрізняється й чому» + походження коду. |
| `tiles/` `img/` | (за потреби) реальні springs-асети, self-contained (офлайн). |

## 🔴 Уніфікований dual-патерн (діє на всі прийоми)

Движок дає **pure-драйвер** (`set(p)` 0..1 або `render(prog)`). Обгортка володіє джерелом:
- **desktop** → драйвер від СКРОЛУ (scroll-linked, реверсивний), плавний Lenis.
- **mobile** → драйвер від ЧАСУ (auto-play / цикл), бо springs mobile живе сам.

Механіка (translateY / wash / roll…) лишається В движку — ОДНЕ джерело правди.

### forceMotion / manualDrive (патчі движка — additive, opt-in)
Наявні `component.js` будувалися DESKTOP-ONLY і **глушать рух на phone-ширині**
(`matchMedia('(max-width:560/820px)')` → static/showAll; їхній `set(p)` стає no-op).
Тому:
- додати опт-ін **`forceMotion`**: `var narrow = !options.forceMotion && matchMedia(...)`.
  Mobile-гілка передає `forceMotion:true` (коли !reduced). `reduced-motion` лишати
  чинним (доступність). Default (без флагу) = стара desktop-поведінка, не чіпаємо.
- якщо движок володіє ВЛАСНИМ ScrollTrigger/pin (напр. brand-overlay-crossfade),
  додати **`manualDrive`**: віддати `render()` БЕЗ власного ScrollTrigger, щоб обгортка
  драйвила однаково на обох платформах.
- движки з `owns_pin:false` і без narrow-guard (напр. numeral-odometer-roll) — БЕЗ патчу.

Перевіряти playwright-ом що елемент РЕАЛЬНО травелить на phone (не лишається identity).

## 🔴 Mobile-safe правило stage (щоб текст не клипив фрейм)

`stage.html` МУСИТЬ бути безпечним на 390px — жодного горизонтального overflow, жоден
текст/число не вилазить за фрейм:
- великі заголовки: `font-size:clamp(…, Nvw, …)` з ПОМІРНИМ vw (≤8vw для serif-hero,
  інакше на 390px переповнює) + `max-width:100%` + `overflow-wrap:break-word`;
- stat-число + слово — СТЕКАТИ (число над словом), не в один рядок (довге слово + велика
  цифра не влазять поряд на phone);
- контейнери: `max-width:100%`; лейбли `max-width:min(22ch,100%)`;
- ГЕЙТ: playwright на 390px → `documentElement.scrollWidth - clientWidth === 0` для всіх
  модулів; візуально звірити що число/тайтл не обрізані правим краєм.

Це проблема ДЕМО-stage, не движка — але правило форми, бо стосується всіх 17 модулів.

**Пастка height:auto на mobile.** Деякі component.css мають `@media(max-width:820px){ .X-stage{
height:auto } }` — це для їхнього СТАТИЧНОГО списку (fallback). Коли dual-mobile тримає ЖИВУ
сцену з absolute-контентом, стейдж колапсує в 0 (нічого не видно, порожній phone-фрейм). Фікс:
у stage.html override `height:100vh !important` на живому мобільному. Симптом: phone-фрейм
порожній, `getBoundingClientRect().height === 0`. Перевіряти stageH>0 у гейті.

## 🔴 Desktop-PIN правило (scroll-pin модулі) — щоб контент НЕ їхав геть

Модулі де desktop = «скрол крокає стан у піні» (stat-odometer, brand-crossfade, будь-який
scroll-scrub з pin) МУСЯТЬ реально ПІНИТИСЬ: контент лишається на екрані поки скрол
драйвить прогрес, а не скролиться вниз. Патерн:
```
.pin-wrap{ position:relative; height:(N+1)*100vh }   /* дає довжину скролу */
.X-stage{ position:sticky; top:0; height:100vh }      /* тримає на екрані */
@media(max-width:1023px){ .pin-wrap{height:auto} .X-stage{position:relative} } /* mobile без піна */
```
Драйвер читає прогрес з **pin-wrap** (стейдж sticky → його `top` завжди 0):
`prog = -pinWrap.getBoundingClientRect().top / (pinWrap.offsetHeight - vh)`.
Симптом бага: на десктопі «екран уходить вниз, стан не докрокує». Перевіряти playwright:
stage.top≈0 і stageVisible на КІЛЬКОХ скрол-позиціях + стан реально просувається.

## 🔴🔴 MOBILE = PINNED-SCROLL, НЕ auto-timer (виправлено S19g, головне правило)

**Помилка яку я робив у батчах A/B/C:** mobile-гілку кодував як «auto за часом» (слайдер що
сам їде). Розбір реального springs-mobile (`D_SPRINGS_video.md`, T-PIN-RUNSCENE — «доводчик
#1 за вагою») каже ІНШЕ: springs mobile = **PINNED-SCROLL + CROSSFADE копі по scroll-progress**.
Секція ПІНИТЬ (~4 екрани), фон застиглий, текст-блоки crossfade поверх ПО СКРОЛУ. Тобто
mobile ТЕЖ керується скролом (через pin), НЕ таймером.

⇒ **Дефолт mobile-гілки = scroll-pin, не auto.** Обидві платформи драйвлять той самий
set(p)/render(prog) від СКРОЛУ через pin-wrap. **Різниця desktop/mobile = LAYOUT + pin-length**
(desktop wide/2-col; mobile full-bleed single-col sticky), а НЕ «scroll vs time».
Еталон: `editorial-act-crossfade` (S19g). Перевіряти playwright: (1) noAutoAdvance —
без скролу стан НЕ міняється; (2) scrollAdvances — скрол міняє стан; (3) pinned — stage.top≈0.

**Винятки де mobile-жест НЕ scroll-pin (з teardown):** residences/portrait = вертикальний
СВАЙП (не auto); interiors/accordion = TAP по картці (по одній); split-word = overshoot-settle
на вході. Тобто: спершу дивись teardown ЩО САМЕ springs робить на mobile, не став auto за замовч.

## 🟡 Плавність auto (де auto доречний) — springs-темп, не хард-кат

Auto-advance МУСИТЬ читатись плавно: тривалість переходу помірна (springs slider ~0.9-1.1s),
а auto-інтервал ЗАВЖДИ > тривалості переходу + пауза на прочитання (interval ≥ transition*3).
Discrete `go()`/`open()` — ок, ЯКЩО їхня CSS/JS-анімація достатньо довга (не 0.3s) і інтервал
не наступає їй на хвіст. Симптом: «швидко стрибає картинка+текст». Дефолти: accordion dur≥0.9
+ autoMs≥3400; carousel pushMs≥1100 + copyLagMs≥260 + autoMs≥4200. Копі КРОСФЕЙДИТЬ (fade-out→
swap→fade-in), не хард-swap textContent.

## Гейт готовності модуля (форма+функція, НЕ parity vs live)

1. `<Id>Dual.init` не кидає; `__LAB_OK__` true в обох iframe.
2. phone-iframe (innerWidth 390) → mobile-гілка; desktop-iframe (innerWidth 1440) →
   desktop-гілка (бейджі підтверджують; вибір через matchMedia, не форс).
3. драйвери РЕАЛЬНО травелять: mobile за часом без інпуту, desktop за скролом.
4. 0 console-errors; 0 горизонтального overflow на 390px.
5. demo показує обидві платформи поруч + differs-таблиця.

Пікс-звірка проти live springs — ОКРЕМО (не входить у гейт форми).
