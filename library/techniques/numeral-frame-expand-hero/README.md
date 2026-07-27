# numeral-frame-expand-hero — двоплатформний прийом (springs nature hero)

> Батч C · #14/17. Формат A. Desktop-PIN + forceMotion/manualDrive.

Гігантські контурні цифри з малим кадром усередині; кадр **розкривається** у full-bleed,
цифри гаснуть, підіймається serif-тайтл, паралакс-пан, exit-rise — одна пін-нарація. Pure `set(p)`.

## 🔴 Чим mobile відрізняється
Нарація одна; той самий `set(p)`. Desktop скрубить повну 0..1 (з exit) скролом у піні;
mobile програє 0→restAt один раз за часом на mount (без exit), лишається на resolved-кадрі.
Springs mobile програє hero на завантаженні; desktop скрубить повну історію.

## Патч+pin
forceMotion + manualDrive. Desktop: `.nfe-hero` sticky у `.pin-wrap`.

## API
`NumeralFrameExpandHeroDual.init('#hero',{platform:'auto',playMs:2200,restAt:0.8})`.
Розмітка: `.nfe-hero > .nfe-bg(.nfe-frame>img) + .nfe-numerals + .nfe-title + .nfe-sub`.
