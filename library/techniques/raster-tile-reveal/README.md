# raster-tile-reveal — двоплатформний прийом (springs aerial-map assemble)

> Батч D · модуль #11/17. Формат A ([[techniques-format-spec]]). Обидві платформи scroll-pin ([[mobile-is-pinned-scroll]]).

## Що це
Застигла мозаїка з растрових плиток-мапи, що **проявляється плитка за плиткою** по
діагоналі, а тоді на свої реальні точки спускаються POI-дроти (магазин, пошта, школа).
Плитки force-decode до першого малювання (decode-guard — недекодована плитка блимає
чорним). Pure `set(p)` скраб усього reveal: плитки завершуються при `p~0.62`, точки
сідають при `p=1`. Реверсивно. NO live-tile-server / NO Leaflet / NO canvas / no-WebGL —
мозаїка заморожена, рухається лише reveal.

## 🔴 Чим mobile відрізняється й чому
Механіка (tile-reveal + POI-drop) — одна; той самий `set(p)`; **обидві платформи
scroll-pin**. Різне — лише layout + pin-length, НЕ джерело руху:

| аспект | телефон | десктоп |
|---|---|---|
| механіка | tile-reveal (плитки + POI) | та сама |
| тригер | **scroll-scrub у піні** | **scroll-scrub у піні** (той самий) |
| функція | `scrollReveal()` | `scrollReveal()` |
| драйвер | той самий `set(p)` | той самий `set(p)` |
| layout | full-bleed **1-col** sticky | мозаїка по центру (макс-ширина) |

**Чому:** springs mobile ПІНИТЬ секцію і скрабить reveal ПО СКРОЛУ (T-PIN-RUNSCENE) —
так само як desktop. Різниця = layout (mobile full-bleed 1-col) + pin-length, а НЕ
«scroll vs time». Еталон патерну — `editorial-act-crossfade` ([[mobile-is-pinned-scroll]]).

## Походження коду + патч движка
- `engine.js` = **дослівна копія** `library/components/raster-tile-reveal/component.js`.
- **Патч движка: НЕМАЄ.** Движок не має narrow-guard (немає `max-width` matchMedia
  static-lock), тож `forceMotion` не потрібен. Обгортка передає `auto:false`, щоб власний
  ScrollTrigger-one-shot движка НЕ спрацював і не перехопив контроль — обгортка сама
  володіє scroll-pin драйвером на обох платформах і драйвить `set(p)`.
- Pin: `.rtr-stage.rtr-pinned` sticky у `.pin-wrap` (мозаїка тримається поки скрол
  скрабить reveal); mobile теж пінить, лише мозаїка стає full-bleed 1-col.

## API
```html
<script src="engine.js"></script><script src="component.js"></script>
```
```js
RasterTileRevealDual.init('#map', {
  platform:'auto', cols:3, rows:4,
  tiles:[ /* {src,col,row} для кожної плитки */ ],
  pois:[ { x:48.1, y:89.1, label:'Нова Пошта' } /* реальні OSM-координати, % боксу */ ],
  stagger:0.04, scaleFrom:1.04, ease:'air'
});
```
Розмітка: `.rtr-stage` (`.rtr-mosaic` + плитки + дроти інжектяться движком).

## Закон
transform (scale + translateY) + opacity + filter only; decode-guard до першого paint;
GPU; NO width/height/top/left; NO mix-blend/backdrop; NO WebGL; NO canvas. reduced-motion
→ static (усе показано). Обидві платформи scroll-pin.

## Демо
`demo.html` — телефон (scroll-reveal, full-bleed 1-col) + десктоп (scroll-reveal у піні)
поруч + таблиця «Чим mobile відрізняється й чому».
