# funnel-curtain — двоплатформний прийом (springs lead-funnel / callback CTA)

> Батч D · модуль #16/17. Формат A (`library/techniques/FORMAT.md`).
> **Без патчу движка** — імперативний API (`create → play`), інтеракційний біт.

## Що це

**Конверсійний біт** springs: секція `l-callback` / lead-воронка + `/flats` hub
(найзв'язніший вузол сайту — 9 посилань = воронка-hub). CTA «SEARCH FLATS» /
«AVAILABLE SOON» + лід-форма резолвяться **чорною wordmark-шторою**: панель їде
знизу вгору, на її кромці — розведений бренд-рядок, накриває екран, **під повним
покриттям міняє сторінку** й виходить угору (~2.25s). Жест — «переступив поріг у
інший простір». `mode:'flash'` — короткий чорний блимок (T-530) для рівнів
visual-search дрілу.

## 🔴 Чим mobile відрізняється й чому

Механіка штори — **одна**. Обидві платформи ганяють **той самий `play(swapFn, mode)`**,
що рухає **той самий** `translateY` панелі. Це **інтеракційний** підтип (не «scroll
vs time»): тригер = `play()` на **ТАП CTA**, НЕ скрол.

| аспект | телефон | десктоп |
|---|---|---|
| інтеракція | **тап у CTA** (1-col full-bleed) | **клік у CTA** (wide 2-col hub) |
| функція | `tapFunnel('curtain')` | `tapFunnel('curtain')` |
| драйвер | той самий `play(swapFn)` | той самий `play(swapFn)` |
| механіка | `transform: translateY` штори | та сама |
| пресет | `curtain` (~2.25s) | `curtain`; `flash` (~0.45s) для дрілу |

**Чому різний:** це **конверсійна CTA**, а конверсія — це **тап-жест**, не scroll-pin
(teardown: RECIPE `trigger = play() на тап CTA; НЕ скрол`; `[[mobile-is-pinned-scroll]]`
виняток-список — CTA-конверсія тапом). Механіка штори одна; змінюється лише **layout**
(mobile 1-col full-bleed / desktop wide 2-col) + який пресет.

## Походження коду (без патчу)

- **core** ← `library/components/funnel-curtain/component.js` → `engine.js` (**без змін**).
  Движок імперативний (`create → play`), без scroll-драйвера, без narrow-guard,
  `owns_pin:false` — нема чого обходити (та сама постава, що `portrait-carousel`).
- **dual-обгортка**: обидві платформи → `tapFunnel` (дротує `[data-fc-cta]` на `play()`,
  кросфейдить `.fc-page` під покриттям). Різниця — layout у CSS/розмітці, не в JS.

## API

```html
<script src="engine.js"></script>
<script src="component.js"></script>
```
```js
FunnelCurtainDual.init('#stage', {
  platform: 'auto',   // 'auto' | 'desktop' | 'mobile'
  wordmark: 'ДІМ'     // бренд-рядок на кромці штори
});
```
Розмітка: `.fc-stage > .fc-page(.is-on)` з кнопками
`[data-fc-cta data-fc-swap='<sel>' data-fc-mode='curtain|flash']`.

## Закон

`transform` (translateY панелі; літери кромки їдуть **разом** з панеллю — нуль
окремих твінів) only; GPU; `swapFn` кличеться **рівно** під повним покриттям
(глядач не бачить свапу); панель ЗНІМАЄТЬСЯ з DOM після ритуалу; паралельні
`play()` ігноруються; NO WebGL. reduced-motion → `swapFn` одразу, нуль штори.

## Демо

`demo.html` — телефон (тап + 1-col) + десктоп (клік + 2-col hub). Кожен фрейм сам
обрав гілку.
```
python3 -m http.server 8879   # з library/techniques/ → /funnel-curtain/demo.html
```

`[[techniques-format-spec]] [[mobile-is-pinned-scroll]]`
