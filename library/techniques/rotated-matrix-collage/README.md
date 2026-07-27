# rotated-matrix-collage — двоплатформний прийом (springs hero)

> **Еталон формату A** (одна папка + 2 гілки коду + meta-різниця). Це перший
> модуль нового executable-конвеєра «розбір сайту на робочі прийоми». Форму
> валідує Єгор оком через `demo.html`; після ОК — та сама форма на решту прийомів.

## Що це

Signature-hero springs: сітка фото, обернена як **одна жорстка площина** (~−9°),
під multiply-washем що зшиває різні кадри в одне спокійне поле. Площина **дрейфує
цілком** (плитки не контр-обертаються) — глибина безкоштовна від нахилу: верхній і
нижній ряди їдуть з різною екранною швидкістю, коли площина рухається.

## 🔴 Чим mobile відрізняється й чому (обов'язкове поле формату)

Прийом — **один** (жорстка обернена площина, що пливе по одній осі translateY).
Що **відрізняється — ДЖЕРЕЛО руху**:

| аспект            | desktop                          | mobile                                  |
|-------------------|----------------------------------|-----------------------------------------|
| тригер дрейфу     | **скрол-позиція** (scroll-linked)| **wall-clock час** (auto-play, ambient) |
| функція движка    | `scrollDrift()`                  | `autoDrift()`                           |
| вісь              | translateY площини               | translateY площини (та сама)            |
| поза + wash       | ідентичні                        | ідентичні                               |
| ручки             | `parallax`                       | `autoMs`, `autoDrift`                   |
| живий вимір       | plane Y 0 → −121px по скролу      | item tx 531→766→1005 за ~12с при s=0    |

**Чому різний:** на mobile springs немає віртуального scroll-driver — hero живе
**сам, за часом**, щоб залишатись живим до першого дотику користувача. На desktop
дрейф прив'язаний до скролу. Це не наш вибір — це **емпірично так на живому springs**
(доведено same-run timing-екстрактором, S18-F).

> **Extras на mobile (не в цьому модулі):** живий springs на mobile ДОДАЄ слайдер-
> секції (wellness / residences / interiors slider), яких desktop не має (там вони —
> скрол-секції). Це **окремі прийоми**, не частина цього колажу.

## Походження коду (НЕ з нуля — витягнуто з бази)

- **desktop scroll-drift** ← `library/components/rotated-mosaic-hero/component.js`
  (gate CURTAIN PASS: 0 blank, 59.9fps, jank 1/685).
- **mobile auto-drift** ← `library/combos/springs-home/springs-engine.js`, mobile-гілка
  (`if (!isDesktop)`, ambient auto-play по wall-time; пікс-парність 1.99%, S18-F).

Тут вони зведені в один config-driven модуль зі спільною статичною позою; гілки
розділені **явно** (`platform==='desktop' ? scrollDrift() : autoDrift()`) — щоб
різниця платформ читалась у структурі коду, а не ховалась у matchMedia всередині.

## API

```js
RotatedMatrixCollage.init(target, {
  tiles: ['a.webp', …],   // або .rmc-tile img children
  cols: 4, rows: 3,
  angle: -9, scale: 1.4, wash: 0.55, gutter: 8,
  parallax: 16,           // desktop-only (yPercent дрейфу по скролу)
  autoMs: 12000,          // mobile-only (довжина авто-циклу, ms)
  autoDrift: 240,         // mobile-only (px за цикл)
  platform: 'auto'        // 'auto' | 'desktop' | 'mobile' (форс для демо)
});
```

Розмітка: `.rmc-stage > .rmc-bg + .rmc-plane(.rmc-grid + .rmc-wash) + .rmc-content`.
`platform:'auto'` читає `matchMedia('(min-width:1024px)')`.

## Закон (LAW)

Тільки transform (translate/rotate/scale площини) + opacity. Wash — `mix-blend:multiply`,
але **запечений у статичну площину** (уся площина трансформується разом — єдиний
дозволений mix-blend spot, каталог P18). GPU-шар на площині. `prefers-reduced-motion`
→ без дрейфу на **обох** платформах. **NO WebGL.**

## Демо

`demo.html` — обидві платформи **поруч**, обидві живі:
- ліва панель — скрол панелі рухає площину (desktop scroll-drift, readout `y …px`);
- права панель — площина дрейфує сама за часом (mobile auto-drift).

Плюс таблиця «чим mobile відрізняється й чому» внизу. Асети — реальні springs-рендери
в `tiles/` (self-contained, офлайн).
