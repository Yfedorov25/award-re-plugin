# map-dim-carousel — двоплатформний прийом (springs /location announce)

> Батч D · модуль #12/17. Формат A (`library/techniques/FORMAT.md`). Both scroll-pin (S19g).

## Що це
Мапа локації **дімиться** (opacity 1 → 0.3 + scale 1 → 1.04) у темний backdrop, коли секція
входить; поверх сходить serif-заголовок-**анонс** + sub, а рейка карток-«beats» локації
(набережна, парк, галерея) сходить staggerʼом знизу. Скінченна рейка **крокує** через
`go()/next()/prev()`. Pure `set(p)` скраб ENTER-фази. Springs: `l-map / landingMapScroll` +
сторінка `/location` — «The Center of Your Life».

## 🔴 Чим mobile відрізняється й чому
Механіка map-dim + rail-advance — одна; той самий `set(p)`/`go()`. **Обидві платформи
scroll-pin** (S19g: mobile = pinned-scroll, НЕ таймер) — джерело `p` те саме (скрол):

| аспект | телефон | десктоп |
|---|---|---|
| тригер | **scroll-scrub у піні** (full-bleed 1-col) | **scroll-scrub у піні** (wide / 2-col) |
| функція | `scrollMap()` | `scrollMap()` |
| механіка | map-dim + rail-advance | та сама |
| драйвер | той самий `set(p)`+`go()` | той самий `set(p)`+`go()` |
| layout | 1-col, повний екран | 2-col / wide |

**Чому:** springs mobile ПІНИТЬ мапу і крокує announce/rail ПО СКРОЛУ (T-PIN-RUNSCENE) —
так само як desktop. Різниця = **layout + pin-length**, НЕ «scroll vs time».

## Патч + pin
- **`forceMotion`** — пропуск `<=820px` static-lock (обгортка сама драйвить `set(p)`+`go()`).
- **`manualDrive`** — пропуск власного ScrollTrigger движка, щоб обгортка володіла скрол-драйвером.
- **Both-PIN**: `.mdc-stage` sticky у `.pin-wrap` (мапа тримається поки скрол драйвить прогрес);
  mobile ТЕЖ пінить (не native overflow). `.pin-wrap` високий (~250vh) — рейці треба скрол-room.
- reduced-motion → resolved state (мапа dimmed, картки видно, рейка на 0).

## Походження коду
`engine.js` = копія `library/components/map-dim-carousel-announce/component.js` +
additive-патчі `forceMotion`+`manualDrive`. `global.MapDimCarouselAnnounce` збережено.

## API
```html
<script src="engine.js"></script><script src="component.js"></script>
```
```js
MapDimCarouselDual.init('#stage', { platform:'auto', dimTo:0.3, cardStagger:0.5, step:1, railSteps:2, railStart:0.6 });
```
Розмітка: `.mdc-stage > .mdc-map + .mdc-overlay(.mdc-headline + .mdc-sub + .mdc-rail-wrap(.mdc-rail > .mdc-card × N) + .mdc-nav)`, загорнута в `.pin-wrap`.

## Закон
opacity + transform лише; GPU; NO mix-blend над мапою; NO backdrop-filter над скролом; NO WebGL.

## Демо
`demo.html` — телефон (scroll-map 1-col) + десктоп (scroll-map wide) поруч + differs-таблиця.

`[[techniques-format-spec]] [[mobile-is-pinned-scroll]]`
