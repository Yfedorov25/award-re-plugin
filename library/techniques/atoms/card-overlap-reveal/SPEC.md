# ATOM: card-overlap-reveal — картка накриває пінований бекдроп + curtain-mask тексту

> Закон руху, НЕ сніпет. Ролі АБСТРАКТНІ: backdrop (пінований full-bleed медіа) /
> card (панель, що виїжджає знизу поверх backdrop) / masked-copy (текст, ЗАПІНЕНИЙ усередині
> картки, який відкриває рухомий верхній край картки) / anchor-row (низ-заякорений ряд, поза reveal).
> Джерело правди: springs frozen-music M6, блок 3 (Tabanlioglu-картка). Донор коду:
> `atoms/frozen-music/variants/frozen-music-a.html` L38-58 (markup) + L222-226 (holdA-логіка).
>
> **extends: `reveal-sequence`** — спільна родина (pin-band + overlap + card), АЛЕ додає ДВІ цеглини,
> яких у reveal-sequence немає (див. §НОВА ЦЕГЛИНА). Це springs-mobile атом (390×844), не desktop.

## СУТЬ (одне речення)
Backdrop-медіа стоїть майже нерухомо (settle scale 1.06→1.0) під час одного pinned-band'у, а
card виїжджає ЗНИЗУ (yPercent 100→0) і накриває його overlap-wipe'ом; ВСЕРЕДИНІ картки текст
запінений, а рухомий верхній край картки працює curtain-маскою і відкриває його рядки.

## ЧОМУ ЦЕ ПРАЦЮЄ
Дві протилежні швидкості читаються як глибина без жодного 3D: backdrop гальмує (settle), картка
йде повним ходом. Curtain-mask (текст стоїть, маска-край рухається) відчувається як «сторінка сама
пише себе» — рух надає тексту, який фізично нерухомий. Слівер backdrop зліва не дає картці
«з'їсти» сцену — око тримає обидва шари.

## НОВА ЦЕГЛИНА (чим відрізняється від reveal-sequence)
1. **curtain-mask над FROZEN-текстом**: у reveal-sequence вхід контенту = wipe-up САМОГО контенту
   (clip на елементі, текст їде). Тут навпаки — текст СТОЇТЬ (запінений), а маскою служить рухомий
   верхній край картки, що відкриває рядки повз нього. Інший закон появи.
2. **backdrop-settle ПІД overlap**: backdrop одночасно з overlap робить scale 1.06→1.0 + y-settle
   (двофазний розподіл одного hold: th=hold/0.42 для settle, card=spr((hold−0.42)/0.58) для наїзду).
   reveal-sequence такого зв'язаного settle-під-overlap не має.

## МЕХАНІКИ (весь механізм, НЕ додавати більше)
- **M1 pin-band**: `.pin-wrap{height:(N+1)*100vh}` дає довжину; `.stage{position:sticky;top:0;
  height:100vh}` тримає на екрані. Прогрес `hold = clamp((scrollProgressLocal),0,1)`.
- **M2 backdrop-settle**: backdrop full-bleed (`inset:-2% 0`), `scale lerp(1.06,1.0,th)` +
  `y lerp(-8,0,th)`, де `th=clamp(hold/0.42,0,1)`. Лінійна ease-none на settle.
- **M3 card-overlap**: card `position:absolute;top:0;right:0;width:calc(100% − sliver);height:100%`;
  вхід `yPercent = (1 − cardProg)*100`, де `cardProg = ease(clamp((hold−0.42)/0.58,0,1))`.
  Зліва лишається слівер backdrop (`sliver` = 12px за замовч.). Тінь на лівому краї картки.
- **M4 curtain-mask copy**: masked-copy живе у ВЕРХНІЙ частині картки; поки картка виїжджає, її
  верхній край рухається повз текст і поступово його відкриває (natural clip краєм картки —
  overflow:hidden на картці + текст на фіксованому top всередині). Текст НЕ анімується сам.
- **M5 anchor-row**: ряд (медальйони/лого/CTA) прибитий до низу картки (`bottom:N`), тримає
  ~82% висоти viewport на момент повного розкриття; НЕ бере участі в reveal (їде з карткою).
- **M6 reduced-motion**: settle і overlap вимкнені; card на yPercent:0, backdrop scale:1 — усе видиме.

## ІНВАРІАНТИ ЗАКОНУ
Backdrop СЕТТЛИТЬСЯ (не стоїть мертво, не їде повним ходом) під overlap; card наїжджає повним
yPercent-shift'ом знизу лишаючи слівер; текст ЗАПІНЕНИЙ (curtain-mask рухомим краєм, не власним wipe);
anchor-row не reveal-иться. Фасад-асет, палітра, копі, ширина слівера, N-hold — параметри фасаду.

## РОЗКАДРОВКА (springs-темп, з SECTION-MAP M6 блок 3; hold 0..1 локально)
| hold | стан |
|---|---|
| 0.00 | тільки backdrop (settle-старт scale 1.06); картки нема (yPercent 100) |
| 0.20 | backdrop settle ~scale 1.04; card ще внизу |
| 0.42 | settle завершено (scale 1.0); card ПОЧИНАЄ наїзд (cardProg 0) |
| 0.70 | card ~55% розкриття; верхні рядки тексту вже видно повз край |
| 1.00 | card повністю (yPercent 0); текст розкритий; anchor-row на ~82% viewport |

## TRANSFER-ГЕЙТ (acceptance, ганяти числами; умова (а) = ЧУЖИЙ фасад)
1. Card yPercent: на hold≤0.42 == 100 (не наїхала); на hold==1.0 == 0 (Δ≤1). Наїзд лише у [0.42,1].
2. Backdrop scale: на hold==0 ≈1.06; на hold≥0.42 ≈1.00 (settle завершено ДО наїзду картки).
3. Слівер backdrop зліва: ширина card == (100% − sliver); слівер видимий на hold==1 (>0px зліва).
4. Curtain-mask: masked-copy top-край НЕ рухається (Δy≤1px між hold 0.5 і 1.0) — маскує КРАЙ картки,
   не власний рух тексту; видима висота тексту росте з hold (0 на hold 0.42 → повна на hold 1).
5. Anchor-row: bottom-заякорений, тримає позицію відносно НИЗУ картки (не reveal-иться окремо).
6. Телепорт будь-куди = коректний стан миттєво; reduced-motion = все видиме (snap).
7. Хук `window.__CARD_OVERLAP_OK__=true`; 0 console-errors; scrollWidth−clientWidth==0 на 390px.
8. **ЧУЖИЙ фасад**: build.html використовує НЕ-springs контент (інший бренд/копі/кольори/dummy-медіа) —
   доводить, що переноситься ЗАКОН, а не springs-фасад.

## ФАЙЛИ
`build.html` = self-contained, dummy-фасад (уявна студія «MERIDIAN», CSS-градієнтний backdrop,
чужа палітра індиго/пісок), власний mini render(hold). Гейт: `../../../scripts/atom-gate.mjs card-overlap-reveal`.
§КАЛІБРУВАТИ: точну частку hold на завершення settle (0.42) і швидкість curtain знято з springs-темпу
2fps — калібрувати оком проти live при збірці організму (frozen-music/manifest.md).
