# stat-odometer — двоплатформний прийом (springs wellness stat, 4 механіки/крок)

> Батч B · модуль #5/17. Формат A (`library/techniques/FORMAT.md`). Той самий
> forceMotion/manualDrive-патерн, що #3 (пам'ять [[dual-platform-forcemotion]]).

## Що це

Пінований стат-слайдер springs — **4 механіки за крок разом**: bg вертикальний
slide-up + card-photo crossfade + numeral odometer-roll + swap лейбла. Pure
`render(prog)` драйвить усі чотири з одного 0..1.

## 🔴 Чим mobile відрізняється й чому

4 механіки кроку — **ті самі**. Обидві платформи ганяють **той самий `render(prog)`**.
Відрізняється **джерело `prog`**:

| аспект | телефон | десктоп |
|---|---|---|
| тригер | **auto-slider** (за часом, тримає крок) | **scroll-pin scrub** (за скролом) |
| функція | `autoSlider()` | `scrollStep()` |
| механіки | bg+photo+odometer+label | ті самі 4 |
| реверс | цикл вперед | так (скрубиться ↕) |

**Чому різний:** springs mobile показує стат **авто-слайдером** — кроки самі
змінюються (нема пін-скролу «докрутити»). На десктопі стат пінить і крокає по скролу.

## Походження коду + патч движка

- **core** ← `library/components/stat-odometer/component.js` → `engine.js`.
- **Патч (additive, opt-in, default desktop не міняє):**
  - `forceMotion` — пропускає `<=820px` static-guard;
  - `manualDrive` — віддає `render()` БЕЗ власного ScrollTrigger/pin движка; ще й
    НЕ створює його Lenis і guard-ить `registerPlugin`/`ticker`, щоб працювало навіть
    коли ScrollTrigger не завантажений (обгортка володіє скролом). Механіка (4-в-1)
    лишається В движку.
- **dual-обгортка**: desktop→`scrollStep`, mobile→`autoSlider`.

## API

```html
<script src="engine.js"></script>
<script src="component.js"></script>
```
```js
StatOdometerDual.init('#stage', {
  platform: 'auto',   // 'auto' | 'desktop' | 'mobile'
  holdMs: 1100,       // mobile: тримання кроку
  moveMs: 900         // mobile: перехід між кроками
});
```
Розмітка: `.so-stage > .so-bg + content + .so-step[data-num,data-label,data-bg]` діти.

## Закон

render(prog) PURE; transform (bg slide, roll) + opacity (photo/label crossfade) only;
GPU; NO mix-blend/backdrop над scrubbed-поверхнею; NO WebGL. reduced-motion →
спокій на останньому кроці.

## Демо

`demo.html` — телефон (auto-slider) + десктоп (scroll-step). Кожен фрейм сам обрав гілку.
```
python3 -m http.server 8879   # з library/techniques/ → /stat-odometer/demo.html
```
