# layer-accordion-reveal — двоплатформний прийом (springs interiors)

> Батч B · модуль #8/17. Формат A (`library/techniques/FORMAT.md`).
> **Найгостріший desktop/mobile-розкол** батчу: hover → swipe-slider.

## Що це

N рендерів springs як вертикальні слаби, один відкритий за раз: у спокої кожен —
вузька **СТРІЧКА**, відкритий розкривається до майже-повного рендеру з лейблом+спекою
(**clip-path inset + translateX, БЕЗ width-tween**). Движок дає `open(i)`/`rest()`.

## 🔴 Чим mobile відрізняється й чому

Механіка розкриття — **одна**. Обидві платформи ганяють **той самий `open(i)`**.
Відрізняється **ВВІД**:

| аспект | телефон | десктоп |
|---|---|---|
| інтеракція | **свайп-слайдер + auto** | **hover** розкриває слаб |
| функція | `swipeSlider()` | `hoverNav()` |
| драйвер | той самий `open(i)` | той самий `open(i)` |
| механіка | clip-path inset + translateX | та сама |

**Чому різний (найважливіше в цьому модулі):** на touch **немає hover** — оригінальний
компонент тут просто гас у статичний список (це і є «одноплатформність»). Наш
mobile-branch тримає **ЖИВИЙ accordion** (`forceMotion`) і драйвить той самий `open(i)`
**свайпом + авто-циклом**, перетворюючи hover-стійку на **свайп-слайдер**. Springs саме
так подає інтер'єри на mobile (слайдер), а на desktop — hover-стійка.

## Походження коду + патч

- **core** ← `library/components/layer-accordion-reveal/component.js` → `engine.js`.
- **Патч:** `forceMotion` — пропускає `hover:none` static-fallback, щоб accordion
  лишався живим на touch. reduced-motion лишається чинним (тоді статичний список — ок).
  Additive, default desktop/reduced не міняє.
- **dual-обгортка**: desktop→`hoverNav` (нативні hover-хендлери движка), mobile→`swipeSlider`.

## API

```html
<script src="engine.js"></script>
<script src="component.js"></script>
```
```js
LayerAccordionRevealDual.init('#rack', {
  platform: 'auto',   // 'auto' | 'desktop' | 'mobile'
  defaultIndex: 0,
  autoMs: 2600,       // mobile-only: auto-cycle слайдера
  panels: [{ img, label, kicker, spec }, …]
});
```
target = `.lar-rack`; движок будує слаби з `panels`.

## Закон

transform (translateX) + clip-path (inset) + opacity + filter only; `width:100%`
кожного слабу ФІКСОВАНИЙ, ніколи не анімується; NO width/height/top animation; NO WebGL.
reduced-motion → статичний список з лейблами.

## Демо

`demo.html` — телефон (свайп-слайдер + auto) + десктоп (hover). Кожен фрейм сам обрав гілку.
```
python3 -m http.server 8879   # з library/techniques/ → /layer-accordion-reveal/demo.html
```
