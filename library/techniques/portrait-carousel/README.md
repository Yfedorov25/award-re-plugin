# portrait-carousel — двоплатформний прийом (springs residences)

> Батч B · модуль #7/17. Формат A (`library/techniques/FORMAT.md`).
> **Без патчу движка** — імперативний API, вже responsive.

## Що це

Вертикальний push-slice портретних карток springs з **copy-lag + ken-burns**.
Імперативний движок: `go(dir)` крокає ±1, `current()`, дротує кнопки ← →.

## 🔴 Чим mobile відрізняється й чому

Механіка push-slice — **одна**. Обидві платформи ганяють **той самий `go(dir)`**.
Відрізняється **ВВІД** (не джерело-драйвер, а сам жест):

| аспект | телефон | десктоп |
|---|---|---|
| інтеракція | **свайп пальцем + auto-advance** | **стрілки ← →** (клік/клавіші) |
| функція | `swipeAuto()` | `arrowNav()` |
| драйвер | той самий `go(dir)` | той самий `go(dir)` |
| механіка | push-slice + ken-burns | та сама |

**Чому різний:** на телефоні природний жест — **свайп**, і слайдер живе **сам**
(auto-advance), бо палець не завжди на екрані. На десктопі — **стрілки** (курсор
точний). Механіка гортання — одна; змінюється лише спосіб введення.

> Це важливий підтип dual-різниці: не «scroll vs time», а **«який ВВІД драйвить
> той самий imperative go()»**. Arrows-стрілки лишаються на mobile як fallback, але
> свайп — первинний.

## Походження коду (без патчу)

- **core** ← `library/components/portrait-carousel/component.js` → `engine.js` (без змін).
  Движок імперативний (`go/current`), без scroll-драйвера й без narrow-guard (grid
  сам колапсує на 820px). Тож обгортка лише додає mobile touch-swipe + auto-advance.
- **dual-обгортка**: desktop→`arrowNav` (нативні кнопки движка), mobile→`swipeAuto`.

## API

```html
<script src="engine.js"></script>
<script src="component.js"></script>
```
```js
PortraitCarouselDual.init('#stage', {
  platform: 'auto',   // 'auto' | 'desktop' | 'mobile'
  loop: true,
  autoMs: 3200        // mobile-only: інтервал auto-advance
});
```
Розмітка: `.pc-stage > .pc-frame + .pc-copy + .pc-prev/.pc-next + .pc-slide[data-image,data-copy]`.

## Закон

transform (image push + ken-burns) + opacity (copy crossfade) only; GPU; NO mix-blend/
backdrop над рухомим зображенням; NO WebGL. reduced-motion → жорсткий cut.

## Демо

`demo.html` — телефон (свайп + auto) + десктоп (стрілки). Кожен фрейм сам обрав гілку.
```
python3 -m http.server 8879   # з library/techniques/ → /portrait-carousel/demo.html
```
