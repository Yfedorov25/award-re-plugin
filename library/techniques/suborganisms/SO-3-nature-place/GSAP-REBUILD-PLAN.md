# SO-3 Nature→Place — GSAP ScrollTrigger REBUILD (S31, Єгор: «хореографія поламана»)

> Video-parity FAIL (2 text-collisions p0.92) + Єгор дав відео нашого поламаного результату
> (`Screen Recording 2026-07-15 at 14.48.07.mov`, 30s). КОРІНЬ: я будую всю хореографію ВРУЧНУ
> в одному index.html з НАКЛАДЕНИМИ render(p)-вікнами → beat-и налазять один на одного (текст,
> картки, морф — все разом = каша 9-16s). Live робить beat-и ПОСЛІДОВНО.

## ✅ РЕЗЬОРЧ: springs = GSAP ScrollTrigger + Locomotive (ДОВЕДЕНО з бандла)
- `springs-shared.js` містить `ScrollTrigger` (власний клас) + `locomotive` + GSAP timeline.
- Архітектура: кожна секція = sticky-контейнер зі `stickyContentHeight`; scroll-progress `i`(0-1)
  драйвить `this.animation.set(i)` де `animation` = GSAP timeline. `smoothScroll=$(window).data('smooth-scroll')`.
- Тобто: **per-section SCRUBBED GSAP timeline** (pin + scrub). Кожен beat = tween що ЗАКІНЧУЄТЬСЯ
  перш ніж наступний почнеться (timeline position params) → НЕ налазять.

## 🎯 ПІДХІД (Єгор обрав): переписати SO-3 на GSAP ScrollTrigger timeline
- Викинути ручний `render(p)` + накладені TRACKS.
- Nature і Place = ОКРЕМІ pinned-сцени (їх тексти НІКОЛИ не в одному пині → нема колізії).
- Кожна сцена = `gsap.timeline({scrollTrigger:{trigger, start:'top top', end:'+=Nvh', pin:true, scrub:1}})`
  з ПОСЛІДОВНИМИ beat-tween-ами (fade-in → hold → fade-OUT перш ніж наступний beat fade-in).
- Lenis (вже підключений) як smooth-scroll; для __SCAN__ гейтів — `tl.progress(p)` замість window.render(p).

## 📋 LIVE BEAT-SEQUENCE (істина з contact-sheet vidscan, 2-42s) — КОЖЕН beat ОКРЕМА сцена:
| Beat | live-t | Композиція (текст ЗНИКАЄ перш ніж наступний) |
|---|---|---|
| N1 | 2-4s  | «Nature» title LEFT (серіф 180px x60) на dark macro-leaf bg; body RIGHT fade-in |
| N2 | 6-10s | «Nature» LEFT HOLD + «Here nature merges…» body RIGHT (повний) |
| N3 | 12-14s| «Enjoy nature's embrace…» body LEFT + мала hand/plant фото center (N2-текст ЗНИК) |
| N4 | 16-20s| terrace-render входить (right→full) + «Landscaped terraces…» caption LEFT |
| N5 | 22-26s| sunset-terrace render full + «Shady leafy-coniferous…» caption |
| M  | 28s   | morph: glassy ЗЕЛЕНА S-ribbon (не хром!) + мала фото top |
| P1 | 30s   | «Place» title CENTER-RIGHT над morph + «Springs is situated…» body LEFT |
| P2 | 34-36s| RUNNERS «Do you feel like running?» + одометр **3** (minute walk to Nature Park) |
| P3 | 38-40s| runners-фото card + одометр **9** (to embankment) |
| P4 | 42s   | вода/embankment + одометр **16** (by car to MIBC) |

## 🔴 НАШІ ПОМИЛКИ (з нашого відео 14.48) — що НЕ повторити:
1. 9-16s: Nature-title + Landscaped-текст + картки + морф-стрічка + body — ВСЕ разом = каша. → beat-и РОЗВЕСТИ.
2. Морф-стрічка ХРОМОВА/метал → має бути СКЛЯНА ПРОЗОРО-ЗЕЛЕНА (live 28s).
3. 21-25s: «Place» налазить на «Springs is situated» + одометр дрібний. → Place-title окремий beat, чистий.
4. Композицій МЕНШЕ ніж live (live ~10 beat-ів, у нас злилось у ~3 мутні).

## Кроки виконання (наступна сесія):
1. Assets: N3 hand/plant фото, N4/N5 terrace-renders (є t12?), runners-фото (P2-P3), water (P4), одометр-числа.
   Багато вже в media/. Витягнути відсутні через spec-scraper по beat-фазах.
2. Розмітка: N-сцена (pin) + P-сцена (pin) окремими секціями. Кожен beat = свій .beat div (absolute).
3. GSAP timeline per scene: beat-tween-и з position-params (кожен .to fade-in, .to fade-OUT перед наступним).
4. Морф = окрема коротка pin-сцена між N і P (скляна зелена ribbon rise).
5. video-parity доки collisions=0 + борд ОКОМ проти live-beat-ів (кожен beat 1-в-1).
6. element-gate (числовий) + so3-gate лишаються як technical backstop.

Пам'ять: [[live-first-before-visual]] #13/#22, [[gate-green-not-done]]. GSAP-скіли завантажені (scrolltrigger/timeline).
