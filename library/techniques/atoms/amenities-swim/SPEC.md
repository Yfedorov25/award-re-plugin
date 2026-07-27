# ATOM: scroll-scale-morph-video (amenities-swim) 📱🧬 — ✅ МЕХАНІКА ПРИЙНЯТА Єгором (S44, «це ідеально»)

> Закон РУХУ (scroll-scrub, pinned). Джерело правди: springs.estate/amenities блок 03 «Where Change Becomes Art».
> Приймання МЕХАНІКИ = ОКО Єгора на компараторі. 🆕 НОВИЙ атом (жоден наявний не морфить-масштаб+coupled-fade).

## СУТЬ (одне речення)
Секція ПІНиться; вертикальний scroll-scrub масштабує ОДНУ media-картку від landscape-thumb → square →
portrait → full-bleed; ПАРАЛЕЛЬНО заголовок+body РОЗЧИНЯЮТЬСЯ (opacity 1→0) від того ж годинника; всередині
картки ЛУПИТЬСЯ відео (decoupled від скролу). Картка, заголовок, текст, відео = ОДИН clock (scroll progress).

## МЕХАНІКИ
- **M1 pin-band**: `.pinwrap{height:420vh}` + `.stage{sticky;top:0;height:100dvh}`. scroll p 0..1.
- **M2 scale-morph**: картка `translate(-50%,-50%)` центр; w/h scrub-иться через KF-стадії:
  thumb(w66%,ar1.45) → square(w80%,ar1.10) → portrait(w90%,ar0.82) → full-bleed(w100%,ar0.462).
  height clamp ≤ viewport. border-radius→0 на full-bleed.
- **M3 coupled text-fade (🔴 Єгор)**: title opacity 1→0 over p 0.06→0.42 (front-loaded, зникає до square);
  body opacity 1→0 over p 0.10→0.52. НЕ просто перекривати карткою — РОЗЧИНЯТИ синхронно з ростом.
- **M4 video-loop**: всередині картки `<video autoplay muted loop playsinline>` decoupled від scroll
  (грає на власному годиннику). [асет: image-to-video з нашого swim-фото, kling2_6 5s silent].
- **M5 title/body позаду**: title upper, body lower, z під карткою; перекриваються як картка росте + згасають.
- **M6 branch line-art** зліва (live має faint bare-branch) — SVG декор.
- **M7 reduced-motion**: картка full-bleed статично.

## ІНВАРІАНТИ ЗАКОНУ
Scroll-scrub масштаб картки (thumb→full-bleed); title+body РОЗЧИНЯЮТЬСЯ coupled до росту (не просто
перекриваються); відео лупиться decoupled; усе від ОДНОГО scroll-годинника; pinned.

## АСЕТ (наш, не springs)
`variants/assets/swim.webp` (higgsfield 2k, плавчиня у зеленій воді) → анімовано у `variants/assets/swim.mp4`
(image-to-video kling2_6, 5s, seamless loop, вода+хвилі). НЕ скрін springs.
ТЕКСТ: cream serif `Where Change / Becomes Art` + body "The capital feels smaller…What will you choose today?".

## РОЗКАДРОВКА (live f_028→f_034→f_040)
| крок | стан |
|---|---|
| f_028 thumb | мала landscape-картка (бігун-клип), заголовок+текст ЯСКРАВІ |
| f_031/034 square | картка росте, заголовок+текст ЗГАСАЮТЬ (напівпрозорі), клип змінюється |
| f_040 full-bleed | картка на весь екран, заголовок+текст ЗНИКЛИ, відео грає |

## ГЕЙТ / ЗВІРКА
- playwright: card w/h scrub thumb→full (257×178 → 390×844); title opacity 1→0 coupled (thumb 1.0, square ~0.19, full 0); 0 err; 0 404.
- приймання МЕХАНІКИ = ОКО Єгора на компараторі `variants/compare.html` (✅ «ідеально»).
- video-loop додано ПІСЛЯ приймання механіки (варіант 3 Єгора).

## ФАЙЛИ
`variants/swim.html` · `variants/compare.html` · `variants/assets/swim.webp` (+swim.mp4) · `variants/_fonts/` ·
`variants/_springs-tokens.css` · `reference/swim-live.mp4`.
