# ATOM: pinned-caption-crossfade — held-caption над crossfade двох фонів + ride-and-clip release

> Закон руху, НЕ сніпет. Ролі АБСТРАКТНІ: bg-a (перший full-bleed фон) / bg-b (другий фон) /
> held-caption (текст, ЗАПІНЕНИЙ через crossfade) / stage (pinned band). Джерело правди: springs
> frozen-music M6, блок 5 (дерево-в-атріумі, ivy→tree). Донор коду: `atoms/frozen-music/variants/
> frozen-music-a.html` L68-77 (markup) + L235-241 (holdB-логіка).
>
> **extends: `editorial-act-crossfade`** (звужений 2-act випадок: crossfade двох фонів + один
> held-caption замість swap-word) **+ pin-release-tail з `pin-release-seam`** (release-фаза).
> springs-mobile атом (390×844).

## СУТЬ (одне речення)
На одному pinned-band'і caption з'являється РАНІШЕ за зміну фону і тримає viewport-позицію, поки
під ним bg-a crossfade-иться у bg-b (opacity 1→0 / 0→1 + scale-settle); після короткого холду band
релізиться — фон їде вгору scroll-push'ом, а caption їде РАЗОМ з ним і кліпається нижнім краєм фото.

## ЧОМУ ЦЕ ПРАЦЮЄ
Caption, що стоїть, поки світ під ним змінюється, робить текст «істиною над сценою» — він не
прив'язаний до жодного з фонів, тому читається як авторська думка, а не підпис. Crossfade (а не
cut) дає відчуття «те саме місце в інший момент». Ride-and-clip на виході прибирає текст природно
(його з'їдає край кадру), без окремого fade — рух виходу належить сцені, не тексту.

## НОВА ЦЕГЛИНА (чим відрізняється від editorial-act-crossfade)
1. **held-caption замість swap-word**: editorial-act-crossfade свапає ЦЕНТРАЛЬНЕ слово в split-word
   headline на кожен акт. Тут caption ОДИН, з'являється рано і ТРИМАЄТЬСЯ через увесь crossfade
   (capIn на старті, capOut лише на самому виході) — не свапається.
2. **pin-release-tail**: після crossfade band релізиться і caption КЛІПАЄТЬСЯ нижнім краєм фото
   (їде разом з фото, маска = межа сцени). editorial-act-crossfade не має release-хвоста —
   він лишається пінованим до кінця акту.

## МЕХАНІКИ (весь механізм)
- **M1 pin-band**: `.pin-wrap{height:(N+1)*100vh}`; `.stage{sticky;top:0;height:100vh}`. hold 0..1.
- **M2 bg-crossfade**: bg-a і bg-b стековані (`inset:-7% 0` / `-4% 0`). `cx = ease(clamp((hold−0.14)/0.34,0,1))`.
  `bg-b.opacity = cx`, `bg-a.opacity = 1−cx`, `bg-b.scale = lerp(1.06,1.0,cx)`.
- **M3 held-caption**: `capIn = ease(clamp(hold/0.12,0,1))` (рання поява), `capOut = 1 − ease(clamp(
  (hold−0.82)/0.18,0,1))` (пізнє зникнення). `caption.opacity = capIn*capOut`, `y=(1−capIn)*18`.
  Між 0.12 і 0.82 caption ПОВНІСТЮ видимий і НЕ рухається (held).
- **M4 release-clip**: caption лежить у нижній частині stage (`bottom:N`); на релізі (hold→1) фон
  і caption їдуть угору потоком, `overflow:hidden` на stage кліпає caption нижнім краєм фото.
  (У self-contained атомі релізом керує тей самий scroll поза pin-band; у моноліті — сусідній beat.)
- **M5 reduced-motion**: crossfade миттєвий (bg-b visible), caption статичний visible.

## ІНВАРІАНТИ ЗАКОНУ
Caption з'являється ДО зміни фону і ТРИМАЄТЬСЯ (не свапається, не зникає в середині); crossfade =
opacity двох фонів (не cut, не wash одного шару); scale-settle на вхідному фоні; вихід = ride-and-clip
краєм кадру (не окремий fade тексту). Асети, копі, палітра, довжина холду — параметри фасаду.

## РОЗКАДРОВКА (springs-темп, SECTION-MAP M6 блок 5; hold 0..1)
| hold | стан |
|---|---|
| 0.00 | тільки bg-a; caption ще не з'явився |
| 0.12 | caption повністю видимий (held-старт); фон ще bg-a |
| 0.14→0.48 | crossfade bg-a→bg-b під нерухомим caption (cx 0→1) |
| 0.48→0.82 | холд: bg-b + caption стоять |
| 0.82→1.0 | release: усе їде вгору, caption кліпається нижнім краєм |

## TRANSFER-ГЕЙТ (acceptance; умова (а) = ЧУЖИЙ фасад)
1. bg-crossfade: на hold 0.14 bg-b.opacity≈0; на hold 0.48 bg-b.opacity≈1, bg-a.opacity≈0 (перехрест).
2. bg-b scale: 1.06 на вході crossfade → 1.00 на завершенні (settle).
3. held-caption: opacity==1 (повністю) НА ВСЬОМУ [0.2, 0.8]; НЕ свапається (той самий textContent).
4. caption y: не рухається (Δ≤1px) між hold 0.3 і 0.7 — тримає позицію під crossfade.
5. caption capOut: на hold 1.0 opacity < на hold 0.7 (почав зникати на релізі).
6. Телепорт будь-куди коректний; reduced-motion = bg-b visible + caption static.
7. Хук `window.__PIN_CAPTION_OK__=true`; 0 console-errors; scrollWidth−clientWidth==0 на 390px.
8. **ЧУЖИЙ фасад**: build.html — не-springs (інші градієнт-фони, чужа копі/палітра).

## ФАЙЛИ
`build.html` = self-contained, dummy-фасад (crossfade двох чужих градієнт-«пейзажів» — світанковий
→ туманний — під held-caption про уявний об'єкт). Гейт: `../../../scripts/atom-gate.mjs pinned-caption-crossfade`.
§КАЛІБРУВАТИ: точні пороги crossfade (0.14/0.48) і холду знято з springs 2fps — калібрувати оком
проти live при збірці організму.
