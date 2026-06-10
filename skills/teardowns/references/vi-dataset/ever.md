# EVER — ever-live-here.com/en (живий зонд curl, 2026-06-10)

## 0. META
site_slug: ever · live_url: https://ever-live-here.com/en (дзеркало /ru) · liveness: **live** (200) · рік: n/a в сирці (© Tekta Group без року) · тип: ЖК бізнес-клас (Москва, Tekta Group), двомовний

## 1. ТИПОГРАФІКА
- **display_font = body_font: ITC Avant Garde Gothic** (`ITCAvantGardeGothicWeb`) — itc-avant-garde-gothic_book.woff2 (400) + _medium.woff2 (500); 810 глифів; кирилиця 64/64, укр ЄІЇҐ 4/4. ОДНА родина на весь сайт
- third_font: нема. Ваги: 400 (усе, включно заголовки), 500 (btn/captions)
- **H1** `.h1,h1`: **16rem = 160px** desktop; fluid `calc(10.889rem + 51.111*((100vw−980px)/460))` між 980–1440; до **27rem = 270px** на великих екранах; lh 1em; ls −0.04em; **uppercase**; 400
- **`.text--h0`** (гіпер-display): **32.4rem = 324px → 51.3rem = 513px**; lh **0.494em**(!) — рядки накладаються
- **H2**: 10.8rem = 108px → 16rem=160px; lh 1.019em; ls −0.02em; uppercase
- **H3**: 8rem = 80px → 10.8rem; lh 1em
- **body**: 1.4rem = **14px**; lh 1.429em; ls .02em; lowercase
- **caption** `.text--small`: 1.2rem = 12px; lh 1.25em; ls .02em
- fluid-формула: rem-based (html 62.5%) + media-calc `calc(Xrem + Y*((100vw−980px)/460))` лише 980–1440
- **H1:body ≈ 11.4:1** (160:14); з text--h0 — до 36:1
- uppercase-стратегія: ВСІ h1–h5 uppercase (глобальне правило `text-transform:uppercase`), body lowercase
- числа: text--h0-гіганти для цифр-фактів; tabular нема

## 2. КОЛІР
- Палітра (:root) — ДВА КЛІМАТИ: **warm** #dcc5b7 / #ac7e65 / #402020 · **cold** #dce2eb / #95a3ae / #313e48 · + #293630 green · #fff white · #000 print · #d9534f error / #b20000 dark-error
- Теми секцій: `.ui-warm-1/2/3` (×33) + `.ui-cold-1/2/3` (×14) + .ui-green/.ui-white — **кожна секція отримує свій клімат-клас**, токени `--t-background/--t-accent/--t-line` перемикаються
- Scrim: `linear-gradient(180deg,rgba(0,0,0,.3),transparent 50%)` ×2 · `.7→transparent 20.83%` · flat overlay `rgba(0,0,0,.3)`
- hairline: `rgba(тон-rgb, 0.4)` (`--t-line-alt`) та 0.15 (light)
- Чисті #000/#fff: #000 лише як `--c-print`; білий #fff так

## 3. ДИЗАЙН-СИСТЕМА
- container: 100vw; колонки `--col: calc(100vw/6)` (моб /2)
- gutters/spacing: `--spacing-s` 20px · `--spacing-l` 20→50→70px fluid
- radius: **100%/50% домінують** (×29) — все кругле; кнопки-кола `border-radius:calc(var(--button-height)/2)`, `--button-height` 100/120/180px; картки 20/40px
- hairline: `1px solid var(--t-line)` ×19+ — табличні сітки з бордерами (фірмова риса)
- іконки: SVG-спрайт; кнопки = ідеальні кола з текстом
- spacing-ритм: 20px база

## 4. РУХ/СКРОЛ
- движок: **Locomotive Scroll** (namespace="locomotive" у shared.js, lerp:.1) + Barba.js + **кастомна скрол-хореографія `data-custom-scroll-id` ×215**(!) — кожен елемент адресується по id
- бібліотеки: Owl Carousel (реально, ×144) · Splitting.js · Popper · krpano (3D-tour, окрема сторінка)
- ease: house **cubic-bezier(.25,.74,.22,.99) ×30** · (.71,.01,.66,.99) · (.41,0,.07,1) · (.47,.04,.5,−.06) · JS: (.13,.41,.1,1), (.55,0,.1,1)
- durations: .8s ×11 · .4s ×8 · 1.6s ×7 · 2.8s ×2; `.animation--fast` 0.2s / `--slow` 0.8s
- reveal: `[data-reveal]` opacity 0→1
- parallax: `data-plugin="deco"` ×18 + `"deco parallax"` ×18 + **`data-deco-multiplier` ×30** — плаваючий декор з різною швидкістю; data-parallax-enable-mq
- pin/sticky: через custom-scroll хореографію (data-scroll-sticky відсутній — інше покоління движка)
- WOW: ① deco-парад (плаваючі овали/декор) ② tabs із 4-напрямними анімаціями (data-tabs-element-animation-in/out-left/right) ③ cursor-плагін (×14, кастомний курсор) ④ text--h0 513px цифри ⑤ dual-view list↔plan вибір квартир
- WebGL: **НІ** (3D-tour = krpano embedpano на /3d-tour)
- prefers-reduced-motion: ТАК

## 5. КОПІРАЙТ/СЕНС
- hero H1: **"Ever"** (1 слово!) + display-теглайн **"Live here"** — назва+теглайн = речення-наказ "Ever. Live here."
- section-headlines дослівно: "Architecture" · "SIMPLE SHAPES, EXPRESSIVE FINISHES" · "Interior" · "THE ENTRANCES AND COMMON AREAS ARE DESIGNED BY THE LEADING ARCHITECTURAL FIRM HAAST" · "Territory" · "Location" / "Place" · "CITY CENTER OBRUCHEVA STR. VL. 23" · "Apartments" · "NEWS, PROMOTIONS" · "Request for a call"
- тон: спокійний наратив-есе; довгі абзаци-подорожі: портики Via Po в Турині, "feeling a little like you are in Italy", "as relaxing as meditating in a Zen garden", онікс у стелях
- Big Idea: **«живи тут і зараз — щоденне життя як маленька подорож»**
- прийоми: культурна метафора (Італія/дзен), сценарії дня ("On summer mornings… In the evening…")
- цифри-в-копі: мало; дати в новинах (02.05, 19.04, 22.08)
- CTA-дієслова: Choose an apartment · Selection by parameters · Selection on plan · Request a call-back · Build a route · Leave a request · Download PDF · Order a taxi(!)
- ВИСНОВОК: продають **ЕСТЕТИКУ ЩОДЕННОГО ЖИТТЯ** (спокій + культурність, не статус-крик)

## 6. СТРУКТУРА
- home ~9 секцій: hero(Ever/Live here)→architecture→interior→entrances(HAAST)→territory→location(+map "CITY CENTER")→apartments(dual list/plan)→news→callback/footer
- сторінок: **~400+** (212 unit-сторінок /en/flat/{code}, ×2 мови)
- nav дослівно: Apartments · About · Place · Territory · Gallery · How to buy · CONSTRUCTION PROGRESS · DEVELOPER · NEWS AND PROMOTIONS · CONTACTS · Selection on plan · Choose a car park and storage room
- visual-search: **ТАК** — еталонний dual-view (list ↔ plan, 3 рівні)

## 7. SIGNATURE
- За 5 сек: моношрифтова Avant-Garde-типографіка з геометричними «A/V» + warm/cold клімат секцій + кнопки-кола
- Найкрутіший момент: text--h0 513px цифри з lh 0.49 + deco-парад плаваючого декору
- Що вкрасти: warm/cold-ритм тем по секціях + дисципліна «1 шрифт на все» + Order a taxi у CTA (сервіс-жест)
