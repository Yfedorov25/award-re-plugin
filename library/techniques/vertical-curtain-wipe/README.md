# vertical-curtain-wipe — двоплатформний прийом (springs section-entry seam)

> Батч D · #16/17. Формат A (`library/techniques/FORMAT.md`). Desktop-PIN + forceMotion/manualDrive.

Section-ENTRY wipe між актами springs: панель заходить **вертикальним clip-швом** L→R і
паркується на колонковому спліті (~50%), поки попередній full-bleed рендер **crop-zoom**-иться
(scale up + object-position shift), щоб лишитись скомпонованим у колонці, що звужується. Секція
«складається» на вході. Pure `render(prog)`, реверсивний.

## 🔴 Чим mobile відрізняється й чому
Механіка (vertical clip-wipe + scale/pan) — одна; той самий `render(prog)`; **тригер теж один** —
обидві платформи scroll-scrub у піні (S19g: springs mobile = pinned-scroll, не таймер).
Різне лише **layout + pin-length**:

| аспект | телефон | десктоп |
|---|---|---|
| механіка | vertical clip-wipe + scale/pan | та сама |
| тригер | **scroll-scrub у піні** (full-bleed 1-col) | **scroll-scrub у піні** |
| функція | `scrollWipe()` | `scrollWipe()` |
| драйвер | той самий `render(prog)` | той самий `render(prog)` |
| layout | full-bleed **1-col** sticky | full-bleed, довший pin |

**Чому:** springs mobile ПІНИТЬ секцію і сунеться швом ПО СКРОЛУ (T-PIN-RUNSCENE) — так само
як desktop. Різниця = layout + pin-length, НЕ scroll-vs-time.

## Походження + патч
- Движок = копія `library/components/vertical-curtain-wipe/component.js` (доведений core).
- Патчі (additive, opt-in): **`forceMotion`** (пропуск `<=820px` static-guard, бо обгортка
  володіє mobile-гілкою) + **`manualDrive`** (віддати `render()` БЕЗ власного ScrollTrigger/pin
  движка, щоб обгортка драйвила `render(prog)` від скролу на обох платформах). Логіка шва
  (clip-path + scale як функція prog) живе ОДИН раз у движку.
- PIN: `.vcw-stage` sticky у `.pin-wrap` (обидві платформи).

## API
```html
<script src="engine.js"></script><script src="component.js"></script>
```
```js
VerticalCurtainWipeDual.init('#stage', { platform:'auto', park:50, zoom:0.12 });
```
Розмітка: `.vcw-stage > .vcw-out(img) + .vcw-panel(eyebrow + heading)`.

## Закон
`render(prog)` PURE; clip-path (inset) + transform (scale) only; GPU; NO mix-blend/backdrop над
скрабленою поверхнею; NO WebGL. reduced-motion → `render(1)` (панель запаркована, зображення
скомпоноване). `window.__LAB_OK__` на init.

## Демо
`demo.html` — телефон + десктоп поруч, обидва scroll-wipe у піні + differs-таблиця.

`[[techniques-format-spec]] [[mobile-is-pinned-scroll]] [[dual-platform-forcemotion]]`
