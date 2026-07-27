# ATOM: scroll-wipe-4slide (amenities-carousel) 📱🧬 — ✅ ПРИЙНЯТО Єгором (S44, «так це воно», на компараторі)

> Закон РУХУ (scroll-driven, snap). Джерело правди: springs.estate/amenities блок 05 «зручності».
> Приймання = ОКО Єгора на side-by-side компараторі (наш живий скрол vs live-відео).
>
> **extends: `scrub-carousel-2slide`/`slider-cycle`** (N-слайд карусель) АЛЕ нова цеглина:
> HARD-CLIP vertical WIPE + SNAP-доводчик + пасивні таби-індикатори. НЕ crossfade, НЕ auto-timer.

## СУТЬ (одне речення)
Пінена картка-слот у фікс viewport-позиції; вертикальний СКРОЛ драйвить дискретний індекс 4 слайдів
(POOL/FITNESS/BEAUTY/HAMMAM); між сусідніми слайдами тверда ВЕРТИКАЛЬНА clip-межа їде справа-наліво
(incoming з правого краю); на idle SNAP-доводчик доводить до найближчого слайда (ніколи не застрягає
посередині); заголовок+опис свапаються ЧИСТИМ opacity-crossfade на доведеному стані; таби пасивні (яскравість).

## МЕХАНІКИ
- **M1 pin-band**: `.pinwrap{height:500vh}` + `.stage{sticky;top:0;height:100dvh}`. 4 станції на scroll-діапазоні.
- **M2 scroll-index**: float index = f(scrollY у pin-band) 0..N-1.
- **M3 hard-wipe R→L**: слайди стековані; кожен incoming reveal-иться `clip-path:inset(0 0 0 X%)` де X=(1-frac)*100
  (з правого краю наліво). Обидва фото зрендерені, розділені твердим краєм. НЕ crossfade.
- **M4 SNAP-доводчик (🔴 ключове, Єгор)**: під час скролу disp слідує за raw float (wipe track-ає палець);
  на idle (debounce ~90ms) target=Math.round(raw) → disp ease-иться до цілого (rAF, factor .16). Слайд
  ніколи не лишається半-wipe. Це виправило «застрягання між A і B».
- **M5 clean caption-swap (🔴 Єгор)**: усі capset ABSOLUTE-стековані в одному боксі; лише opacity-crossfade
  на Math.round(disp); нуль layout-jump, нуль «третього стану»/мигання (баг v1: absolute↔relative toggle).
- **M6 passive tabs**: 4 лейбли POOL/FITNESS/BEAUTY/HAMMAM + 4 ПОСТІЙНІ hairline-підкреслення на фото
  внизу; активний лише ЯСКРАВІШЕ (color+underline opacity). НЕ клікабельні (Єгор блокер 3).
- **M7 reduced-motion**: слайд 0 статично, без wipe.

## ІНВАРІАНТИ ЗАКОНУ
Вертикальний скрол (не tap/свайп-horizontal/auto); hard vertical clip-wipe R→L (не crossfade); SNAP до
дискретного слайда на idle (0 stuck-wipe); чистий opacity-swap тексту (0 flicker/третій-стан); таби пасивні.

## АСЕТИ (наші, не springs)
4× square 1:1 higgsfield-рендери у `variants/assets/`: `pool.webp` (зелена вода, колони, арки) ·
`fitness.webp` (тренажери, панорамні вікна) · `beauty.webp` (темна масажна, олив-рушники) ·
`hammam.webp` (2 круглих кам'яних подіуми, перфор-стеля). 2k, springs-настрій. НЕ скріншот springs.

## ТЕКСТИ (verbatim SECTION-MAP)
Spacious Swimming Pool / Fitness Center with Panoramic Windows / Beauty Lounge with Massage Parlour /
Luxurious Stone Hammam + 4 body-параграфи.

## ГЕЙТ / ЗВІРКА
- playwright: index 0→3 по скролу; snap на idle (clip=0|100 не 50); onCapsCount===1 завжди; midWipeStuck=false;
  таби+підкреслення track; 0 console-err; 0 404.
- приймання = ОКО Єгора на компараторі `variants/compare.html`.

## ФАЙЛИ
`variants/carousel.html` (ПРИЙНЯТИЙ канон, snap-версія) · `variants/compare.html` · `variants/assets/{pool,fitness,beauty,hammam}.webp` ·
`variants/_fonts/` · `variants/_springs-tokens.css` · `reference/carousel-live.mp4`.
