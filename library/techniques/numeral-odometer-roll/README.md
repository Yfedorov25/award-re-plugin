# numeral-odometer-roll — двоплатформний прийом (springs stat)

> Батч A · модуль #4/17. Формат A (див. еталон [[rotated-matrix-collage]]).
> **Найпростіший у батчі** — движок без narrow-guard, `owns_pin:false`, тож
> патч не потрібен (на відміну від #2/#3, див. [[dual-platform-forcemotion]]).

## Що це

Вертикальна стрічка цифр у **одно-число-заввишки overflow-вікні**; колонка
`translateY` так, щоб активне значення сиділо в кадрі — число **котиться** (старе
вгору-геть, нове знизу-вгору). Pure `set(p)` мапить p по послідовності значень.

## 🔴 Чим mobile відрізняється й чому

Механіка ролу — **одна**. Обидві платформи ганяють **той самий pure `set(p)`**.
Відрізняється **джерело `p`**:

| аспект | телефон | десктоп |
|---|---|---|
| тригер | **auto-play циклічно** (за часом) | **scroll-scrub у піні** (за скролом) |
| функція | `autoRoll()` | `scrollRoll()` |
| механіка | translateY колонки | translateY колонки (та сама) |
| реверс | цикл 0→1→0 | так (скрубиться ↕) |

**Чому різний:** springs mobile показує стат як **живий авто-біт** — число котиться
само, бо нема пін-скролу «докрутити». На десктопі стат пінить, число котиться по скролу.

## Походження коду (без патчу движка)

- **core** ← `library/components/numeral-odometer-roll/component.js` → `engine.js`
  (без змін). Цей движок ВЖЕ спроєктований бути host-driven (`owns_pin:false`) і не
  має narrow-guard, тож dual-обгортка просто драйвить `set(p)`.
- **dual-обгортка** (`component.js`): desktop→`scrollRoll`, mobile→`autoRoll`.

## API

```html
<script src="engine.js"></script>
<script src="component.js"></script>
```
```js
NumeralOdometerRollDual.init('#odo', {
  platform: 'auto',        // 'auto' | 'desktop' | 'mobile'
  values: [6, 12, 24, 48], // послідовність
  digits: 2,
  cycleMs: 1800            // mobile-only: тривалість одного ролу в авто-циклі
});
```
Розмітка: `.nor-window > .nor-col` (движок будує `.nor-num` рядки з `values`).

## Закон

translateY колонки only; overflow:hidden window; tabular-nums; GPU; NO mix-blend/
backdrop/WebGL; NO width/height animation. reduced-motion → спокій на фінальному значенні.

## Демо

`demo.html` — телефон (auto-roll циклічно) + десктоп (scroll-roll). Кожен фрейм сам
обрав гілку.
```
python3 -m http.server 8879   # з library/techniques/ → /numeral-odometer-roll/demo.html
```
