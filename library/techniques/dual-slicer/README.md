# dual-slicer — двоплатформний прийом (springs coupled-split)

> Батч C · #6/17. Формат A. Desktop-PIN + forceMotion/manualDrive.

Права колонка — вертикальний render-strip що **слайсить** крізь N рендерів; ліворуч
per-line reveal заголовка + rising inset. Усе зчеплено на одному пін-скролі. Pure `render(prog)`.

## 🔴 Чим mobile відрізняється
Слайс+reveal — один; той самий `render(prog)`. Desktop скрубить скролом у піні; mobile
авто-слайсить за часом. Springs mobile слайсить сам; desktop прив'язує до скролу.

## Патч+pin
forceMotion + manualDrive (guard registerPlugin/CustomEase/lenis). Desktop: `.ds-stage` sticky у `.pin-wrap`.

## API
`DualSlicerDual.init('#stage',{platform:'auto',holdMs:1000,moveMs:950})`.
Розмітка: `.ds-stage > .ds-left(.ds-head>.ds-line>.ds-line__i + .ds-inset) + .ds-right(.ds-render×N)`.
