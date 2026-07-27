# brand-overlay-crossfade — двоплатформний прийом (springs place-seam)

> Батч A · модуль #3/17. Формат A (див. еталон [[rotated-matrix-collage]]).
> Той самий forceMotion/manualDrive-патерн, що #2 (пам'ять [[dual-platform-forcemotion]]).

## Що це

**Доводчик акт→акт** springs (шов `l-place → jogging`). ОДИН движок, ДВА режими шва:
- **desktop `mode:'push'`** — друге full-bleed фото **врізається смугою знизу поверх** першого,
  **over-travel вгору за ціль → осідає назад** (magnetic overshoot-settle). `render(prog)` =
  `translateY` наступного кадру 100%→0 з пружним settle. Реверсивний.
- **mobile `mode:'wash'`** — брендовий **wash стікає wash→0** (crossfade без врізу).
  `render(prog)` = `wash*(1-prog)`.

## 🔴 Чим mobile відрізняється й чому — тут РІЗНІ механіки

Це **не** «одна механіка, різний тригер». Springs **сам** роздвоює доводчик за межею
(джерело: `D_SPRINGS_video.md` seam-таблиця):

| аспект | телефон | десктоп |
|---|---|---|
| механіка | **crossfade** (wash-drain) | **push-over смугою** + settle |
| рух | `wash*(1−prog)` (opacity) | `translateY` наступного кадру, over-travel→settle |
| функція | `autoDrain()` · `mode:'wash'` | `scrollPush()` · `mode:'push'` |
| тригер | auto-play на вході | scroll-scrub у піні (реверсивно) |

**Чому різний:** на вузькому екрані **бічний/нижній вріз смугою читається неприродно**,
тому springs замінює push-over на **довгий crossfade** (opacity-tween 0.6–0.8с, без врізу).
На десктопі акти резолвляться push-over смугою з overshoot-settle.

## Походження коду + патч движка

- **core** ← `library/components/brand-overlay-crossfade/component.js` → `engine.js`.
- **Патч движка (additive, opt-in, default не змінює desktop):**
  - `forceMotion` — пропускає внутрішній `<=820px` static-guard (движок був
    desktop-only й глушив рух на phone — див. [[dual-platform-forcemotion]]);
  - `manualDrive` — віддає `render()` БЕЗ власного ScrollTrigger/pin движка, щоб
    dual-обгортка володіла драйвером однаково на обох платформах;
  - `mode:'push'|'wash'` — вибір механіки шва (push-over смугою vs wash-crossfade).
    Обидві механіки лишаються В движку — одне джерело правди.
- **dual-обгортка** (`component.js`): desktop→`scrollPush` (mode:'push'), mobile→`autoDrain` (mode:'wash').

## API

```html
<script src="engine.js"></script>
<script src="component.js"></script>
```
```js
BrandOverlayCrossfadeDual.init('#stage', {
  platform: 'auto',   // 'auto' | 'desktop' | 'mobile'
  wash: 1.0,          // старт непрозорості washу
  drainMs: 1500       // mobile-only: тривалість auto-drain
});
```
Розмітка: `.boc-stage > .boc-img(img) + .boc-img--next(img, push-шар) + .boc-wash`
(+ опц. `.boc-content`). Колір washу — CSS `--boc-wash` / background.

## Закон

render(prog) PURE; transform (push) / opacity (wash) only; GPU; NO mix-blend/backdrop
над scrubbed-поверхнею; NO WebGL. reduced-motion → резолвлено (desktop: наступний кадр
осів; mobile: wash 0).

## Демо

`demo.html` — телефон (crossfade, «↻ програти знову») + десктоп (push-over + settle).
```
python3 -m http.server 8879   # з library/techniques/ → /brand-overlay-crossfade/demo.html
```
