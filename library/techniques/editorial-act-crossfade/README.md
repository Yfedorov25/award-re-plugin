# editorial-act-crossfade — двоплатформний прийом (springs design)

> Батч C · #13/17. Формат A. Desktop-PIN + forceMotion/manualDrive.

Один пін-скрол драйвить N актів, що **кросфейдять 4 шари разом** (push-zoom фото +
split-word центр-слово + topline swap + body crossfade). Pure `set(p)`.

## 🔴 Чим mobile відрізняється
Механіка 4-шарового акту — одна; той самий `set(p)`. Desktop скрубить set(p) скролом
у піні; mobile авто-прокручує акти за часом (тримає→їде, цикл). Springs mobile програє
акти сам; desktop прив'язує до скролу.

## Патч+pin
forceMotion (skip <=820px) + manualDrive (set() без пін-ScrollTrigger движка). Desktop:
`.eac-stage` sticky у `.pin-wrap`.

## API
`EditorialActCrossfadeDual.init('#stage',{platform:'auto',holdMs:1100,moveMs:1000})`.
Розмітка: `.eac-stage > .eac-images(.eac-img[data-act]) + .eac-toplines + .eac-headline + .eac-bodies`.
