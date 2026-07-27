# fullscreen-media-carousel — двоплатформний прийом (springs residence gallery)

> Батч D · модуль #15/17. Формат A (`library/techniques/FORMAT.md`).
> **Без патчу движка** — імперативний API (`go/next/prev`), вже responsive, без narrow-guard.

## Що це

Edge-to-edge **full-bleed** карусель springs: кожен слайд заповнює **ВЕСЬ в'юпорт**
(без карткового chrome, без peek), гортається **по одному повному екрану** за раз.
Трек `translateX(-index*100%)`; слайд може бути **img або video** (video грає лише
поки активний + на екрані — IntersectionObserver). Імперативний движок:
`go(i)` / `next()` / `prev()` / `index()`, дротує ‹ ›, клавіші ← →, pointer-drag (F-08).

## 🔴 Чим mobile відрізняється й чому

Механіка push-slide — **одна**. Обидві платформи ганяють **той самий `go/next/prev`**.
Відрізняється **ВВІД** (не джерело-драйвер, а сам жест):

| аспект | телефон | десктоп |
|---|---|---|
| інтеракція | **свайп пальцем** | **стрілки ‹ ›** (клік / клавіші ← →) |
| функція | `swipe()` | `arrowNav()` |
| драйвер | той самий `go/next/prev` | той самий `go/next/prev` |
| механіка | push-slide `translateX(-i*100%)` | та сама |
| auto | **НІ** — стоїть до свайпу | **НІ** — стоїть до кліку |

**Чому різний:** на телефоні природний жест — **свайп** full-bleed кадру; на десктопі —
**стрілки** (курсор точний). Механіка гортання одна; змінюється лише спосіб введення.
**Auto-advance немає на жодній платформі** — карусель це swipe/arrow-affordance, вона
не гортає сама (S20-корекція; портретна карусель теж прибрала `autoMs`).

> Це важливий підтип dual-різниці: не «scroll vs time», а **«який ВВІД драйвить
> той самий imperative go/next/prev»**.

## Походження коду (без патчу)

- **core** ← `library/components/fullscreen-media-carousel/component.js` → `engine.js`
  (без змін). Движок імперативний (`go/next/prev`), interaction-driven (стрілки/drag/
  клавіші), БЕЗ scroll-драйвера й БЕЗ narrow-guard що глушить рух на phone-ширині —
  тож **forceMotion не потрібен** (`go()` працює однаково на будь-якій ширині).
- **dual-обгортка**: desktop→`arrowNav` (нативні кнопки+клавіші движка), mobile→`swipe`
  (нативний pointer-drag движка). reduced-motion → перший слайд статично.

## API

```html
<script src="engine.js"></script>
<script src="component.js"></script>
```
```js
FullscreenMediaCarouselDual.init('#stage', {
  platform: 'auto',   // 'auto' | 'desktop' | 'mobile'
  duration: 700,
  drag: true,
  loop: false
});
```
Розмітка: `.fmc-stage > .fmc-track > .fmc-slide (img|video) xN + .fmc-prev/.fmc-next +
.fmc-counter(.fmc-cur/.fmc-total)`.

## Закон

`transform: translateX` (трек) only; GPU; NO mix-blend/backdrop над медіа; NO WebGL.
Video muted+loop+playsinline, грає лише active+on-screen, ніколи не скрабить currentTime.
reduced-motion → instant index (перший слайд статично).

## Демо

`demo.html` — телефон (свайп) + десктоп (стрілки). Кожен фрейм сам обрав гілку.
```
python3 -m http.server 8879   # з library/techniques/ → /fullscreen-media-carousel/demo.html
```

`[[techniques-format-spec]] [[mobile-is-pinned-scroll]]`
