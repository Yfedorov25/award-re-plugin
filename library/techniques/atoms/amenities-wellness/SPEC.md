# ATOM: scroll-card-over-media (amenities-wellness) 📱🧬 — ✅ ПРИЙНЯТО оком Єгора (S45, «це те що треба»)

> ✅ S45 ПРИЙНЯТО після 7 ітерацій (найскладніший атом). Ключові уроки: фон=незалежний медіа-потік;
> перехід=wipe-знизу-вгору; олив-полотно #5d6c2d + картинка ЦІЛА (не clip-reveal); ОДИН слайсер не два;
> текст УХОДИТЬ (не пінится); новий фон стартує ТІЛЬКИ коли картка дійшла до P2-only (виміряно f89/56.3с
> коли P1cream→0). Народило залізне правило [[verify-dont-agree-analyze-every-frame]] + метод self-check.

> Закон РУХУ (scroll-driven, 4 фази, pinned stage). Джерело: springs.estate/amenities блок 04.
> 🔴 ПЕРШИЙ атом БУВ НЕВІРНИЙ (проста locked-to-scroll + статичні фото). Єгор описав справжню
> хореографію → я глибоко розібрав 6fps 156 кадрів (KAI/WELLNESS-CHOREO-MAP-S45.md), підтвердив бордом.
> Приймання = ОКО Єгора на компараторі в русі. Відео буде ПІСЛЯ приймання механіки (Єгор: photo-first).

## СУТЬ (4 фази по scroll progress)
- **Ф1 (0–0.16):** full-bleed МЕДІА грає (відео → поки jog-фото), картки нема.
- **Ф2 (0.16–0.50):** dark-green картка вилазить знизу; P1 (serif cream) РОЗКРИВАЄТЬСЯ рядок за рядком
  (clip-mask знизу); долазить до pin ~38% top і ЗАСТИГАЄ; зверху медіа міняється (m1 slide-up).
- **Ф3 (0.50–0.68):** новий ФОН (m2 басейн+meadow) вилазить знизу; під P1 з'являється P2 (дрібний sans
  dimmer, reveal ПІЗНІШЕ за P1); картка P1+P2 дрейфує вгору.
- **Ф4 (0.68–1.0):** ланцюг фонів slide-up (m3 spa → m4 marble-LED); картка nudge→hold→дрейф вгору-out.

## МЕХАНІКИ
- **M1 pin-stage**: `.wrap{height:600vh}` + `.stage{sticky;top:0;height:100dvh}`.
- **M2 media-chain slide-up**: 5 `.bg` translateY 100%→0, кожен на своєму band (0.16/0.50/0.68/0.84).
- **M3 card rise+pin+drift**: translateY dvh: 100→38 rise (p0.16–0.38) → 38 PIN (0.38–0.52) →
  38→-34 travel/P1-clip-off (0.52–0.66) → -34→-118 out (0.66–0.92). 🔄 S45-d: синхронізовано під
  ПРИЙНЯТИЙ код (старі числа 24/-14 були чернеткою до фіксів; істина = прийняте око + вимір харнеса).
- **M4 P1 reveal**: clip-path inset bottom 100%→0 over p 0.16–0.36 (рядок за рядком).
- **M5 P2 reveal ПІЗНІШЕ**: clip bottom 100%→0 over p 0.44–0.52 (окрема фаза, не з P1).
  🔄 S45-d: було 0.50–0.64 (чернетка); прийнятий код = 0.44–0.52, виміряно харнесом 0.440–0.520.
- **M6 no opacity**: reveal чисто геометричний clip (card opacity=1 завжди).

## ІНВАРІАНТИ
Медіа-ланцюг slide-up знизу; картка rise→PIN→drift; P1 reveal рядок-за-рядком; P2 reveal ПІЗНІШЕ за P1;
0 opacity-fade (clip-геометрія). Усе від scroll-годинника.

## АСЕТИ (наші higgsfield, не springs) — 5 фонів
`jog.webp` (Ф1 бігун ≈ live елліптик/jog) · `facial.webp` (Ф2 spa) · `meadow.webp` (Ф3 басейн+лука) ·
`spa.webp` (Ф4 wood-slat lounge) · `marble.webp` (Ф4 marble-LED хол). nano_banana_pro 2k.
🔴 Ф1-2 медіа = ВІДЕО в live (kling2_6 після приймання механіки, як swim). Зараз jog-фото як плейсхолдер.

## ТЕКСТИ (verbatim live)
P1 serif: «Our elegant Wellness-center is a crown jewel of Springs… here relaxation originates.»
P2 sans dimmer: «Our yoga space is meant for thoughtful relaxation… It's easy to show yourself love.»

## КАНОН-8 (ярлик, рішення Єгора S45-d «як рекомендуєш»)
Канонічний список 8 поітераційних багів wellness = пам'ять [[verify-dont-agree-analyze-every-frame]]:
crossfade · картка-налазить-на-фото · темп · full-bleed-vs-олив · clip-reveal-vs-ціла ·
зайвий-2й-слайсер · послідовно-vs-паралельно · старт-фону-зарано. Калібрація харнеса покриває
ОБ'ЄДНАННЯ (канон-8 + locked-to-scroll «ітерація 0» + media-type) = матриця 15/15.

## ГЕЙТ / ЗВІРКА
- `scripts/wellness-gate.mjs` (PASS ✅): P1 reveal 100→0; P2 reveal ПІЗНІШЕ за P1; картка pin-фаза;
  медіа m1/m4 slide-up у своїх бендах; картка їде вгору; 0 opacity-fade; 0 err/404.
- Самозвірка ОКОМ: board /tmp/well-deep/cmp-6 (наш 6 фаз vs live) — хореографія фаза-в-фазу збіг.
- приймання = ОКО Єгора на компараторі `variants/compare.html`.

## ФАЙЛИ
`variants/wellness.html` · `variants/compare.html` · `variants/assets/{jog,facial,meadow,spa,marble}.webp` ·
`variants/_fonts/` · `variants/_springs-tokens.css` · `reference/wellness-live.mp4`.
