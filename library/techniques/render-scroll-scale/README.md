# render-scroll-scale — двоплатформний прийом (springs hero breathe)

> Батч C · модуль #10/17. Формат A (`library/techniques/FORMAT.md`). Desktop-PIN.

## Що це
Один full-bleed рендер у фіксованому clip-фреймі, що **масштабується** — примітив
«hero-кадр дихає/штовхається». Pure `set(p)` скраб масштабу.

## 🔴 Чим mobile відрізняється й чому
Механіка масштабу — одна; той самий `set(p)`. Різне джерело `p`:

| аспект | телефон | десктоп |
|---|---|---|
| тригер | **auto-breathe** (за часом) | **scroll-scrub у піні** (за скролом) |
| функція | `autoScale()` | `scrollScale()` |
| механіка | transform: scale | та сама |

**Чому:** springs mobile — кадр дихає сам як живий фон; desktop прив'язує масштаб до скролу.

## Патч + pin
- `forceMotion` (пропуск `<=820px` static-lock; owns_pin:false → нема ScrollTrigger).
- Desktop-PIN: `.rss-frame` sticky у `.pin-wrap` (кадр тримається поки скрол масштабує).

## API
```html
<script src="engine.js"></script><script src="component.js"></script>
```
```js
RenderScrollScaleDual.init('#frame', { platform:'auto', scaleFrom:1.0, scaleTo:1.35, cycleMs:2600 });
```
Розмітка: `.rss-frame > img.rss-render`.

## Демо
`demo.html` — телефон (auto-breathe) + десктоп (scroll-scale у піні).
