# ATOM: render-scroll-hero-hold (amenities-borges) 📱🧬 — ✅ ПРИЙНЯТО Єгором (S47 «так супер», компаратор, ітерація 2)
# блок 08. Модель: Opus 4.8. Ітерацій: 2 (кегль тексту виправлено виміром brightness-profile).

> Закон РУХУ (scroll-driven, pinned stage). Джерело: springs.estate/amenities блок 08 borges.
> Механіка = A6-family render-scroll-hero-fade, ТЕ САМЕ сімейство що прийняті hero + promenade.
> ВІДМІННІСТЬ: текст ТРИМАЄТЬСЯ (hold), НЕ fade (як promenade) і НЕ swipe-стрічка. Найпростіший сімейства.
> Розбір: `CHOREO.md` (кроп 113-126с, contact+entry+bg-drift track+timeline). Вимір: bgtrack.mjs.
> 🔴 Будується через ПОВНУ систему-контроль S45-d. Приймання = ОКО Єгора на компараторі + self-check зелений.

## СУТЬ (одне речення)
Full-bleed фото темного листя (одне) parallax-drift вгору на вході потім hold; cream serif borges-параграф
виїжджає знизу цілим блоком (шов з promenade) і ТРИМАЄТЬСЯ непрозорий внизу-ліворуч увесь блок. Без
cream-панелі, без swipe-стрічки, без title-fade. Текстова «дихальна» секція.

## ФАЗИ (scroll p, детально в CHOREO)
- **Ф1 (p 0.00–0.15):** шов promenade→borges (текст виїжджає знизу цілим блоком).
- **Ф2 (p 0.15–0.45):** фон листя встановлюється, parallax-drift вгору (~368px екрана виміряно bgtrack).
- **Ф3 (p 0.45–0.90):** borges HOLD — фон застигає (1 фото, similarity 0.94-1.0), текст тримається непрозорий.
- **Ф4 (p 0.90–1.0):** вихід у шов borges→ivy (cream-панель заходить знизу).

## МЕХАНІКИ (перенесено з hero/promenade A6)
- **M1 pin-stage**: `.wrap{height:~240vh}` + `.stage{position:sticky;top:0;height:100dvh}`, p 0..1.
- **M2 leaf parallax (ДУЖЕ малий)**: `.leaf{height:114%}` translateY -p*4% (ледь-дихання). Вимір
  cleantrack на ЧИСТОМУ borges (t119-124.5): vShift≈0 весь блок → фон майже статичний. Не великий drift.
- **M3 borges text HOLD (🔴 ключова відмінність від promenade)**: `.copy` Victor Serif 26px cream
  внизу-ліворуч, opacity 1 ВЕСЬ блок (НЕ fade). Легкий translateY -p*lift. Текст цілий від входу.
  🔴 КЕГЛЬ З ВИМІРУ (не око): live-текст = 35% висоти екрана, топ 58% (виміряно brightness-profile).
  Наш: 31%/топ60% при 26px. Переноси ПО ФРАЗАХ (`<br>` по синтагмах-комах) як live, НЕ auto-wrap.
- **M4 header scrim**: top gradient scrim для Springs-лого+heart+burger над фото.
- **M5 no cream / no swipe**: НЕ має cream-панелі і НЕ має swipe-стрічки. Текст прямо на затемненні фото.

## ІНВАРІАНТИ
Фото листя parallax-drift вгору на вході потім hold (ОДНЕ фото, не crossfade); borges serif-текст
ТРИМАЄТЬСЯ непрозорий (не fade, не reveal, не swipe); 0 cream-панелі; 0 плиток; усе від scroll-годинника.

## АСЕТ (наш higgsfield, НЕ springs)
`variants/assets/borges-leaves.webp` (nano_banana_pro 3:4) — крупний план темного листя на майже чорному
тлі, м'яке зелене світло знизу підсвічує деякі листки, боке-глибина, атмосферне приглушене (нічний сад).

## ТЕКСТИ (verbatim live)
Borges: «In The Garden of Forking Paths, a short story by Borges, the author created a world of endless
possibilities. At Springs, the acclaimed design bureau WowHouse paved artistic paths towards your goals.»

## ГЕЙТ / ЗВІРКА (система S45-d)
- `node scripts/self-check.mjs --atom amenities-borges` МУСИТЬ бути зелений ПЕРЕД компаратором.
  Виміри: channel-identity (leaf translate) · surface-parity (наш↔live на якорях) · census (шари
  задекларовані) · geometry · purity · timing (leaf drift-старт). Текст HOLD → typography exit НЕ
  застосовний (текст не уходить у цій секції, виходить у шов з ivy).
- config+expectations генерую `--init`, числа підтверджую з CHOREO/live (закон B22).
- Самозвірка ОКОМ покадрово (закон B20) ДО показу.
- приймання = ОКО Єгора на компараторі `variants/compare.html` (з UNCHECKED поруч з URL).

## ФАЙЛИ
`variants/borges.html` · `variants/compare.html` · `variants/assets/borges-leaves.webp` ·
`variants/_fonts/` · `variants/_springs-tokens.css` · `reference/borges-live.mp4`.
