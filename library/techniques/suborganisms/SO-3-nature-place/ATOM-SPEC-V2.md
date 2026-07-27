# SO-3 Nature→Place — ATOM SPEC V2 (з ОРИГІНАЛЬНОГО .mov 21.17.25, покадрово 2fps)

> Джерело істини: `Screen Recording 2026-07-14 at 21.17.25.mov` (52s), розбите 2fps → 105 кадрів.
> Це виправляє ATOM-помилки що Єгор спіймав у recording 17.09.58 (2/10): конвеєр-механіка,
> слайдер-позиція, Place scroll-up, explainer між атомами, кліп титулу, Place off-screen.

## КЛЮЧОВІ МЕХАНІКИ (те що я флеттив):
1. **ВЕРТИКАЛЬНИЙ КОНВЕЄР фото** (13-18s): фото входять З НИЗУ, піднімаються, 2 на екрані одночасно
   (hand-photo center + terrace входить bottom-right = зустрічний рух). Текст-панель СТОЇТЬ фіксовано ліворуч.
   НЕ прості fade-in картки.
2. **СЛАЙДЕР card = CENTER** (20-29s): великий портрет-card ~45%w вертикально ЦЕНТРОВАНИЙ, caption ПРАВОРУЧ,
   круглі стрілки ‹○ ○› під caption. НЕ ліворуч. Слайди crossfade (sunset→shady→recreation).
3. **PLACE входить BOTTOM-RIGHT і СКРОЛИТЬ ВГОРУ** (30-33s): «Place» серіф з'являється y~70% справа →
   піднімається до y~45% → виходить вгору. body «Springs is situated» TOP-LEFT. НЕ статичний center-reveal.
4. **МОРФ** (29.5-30.5s): зелена glassy S-стрічка ПІДНІМАЄТЬСЯ з низу поки terrace-card виходить вгору;
   зелене поле (yellow-green glow TOP-LEFT) заповнює; стрічка ТРИМАЄТЬСЯ за Place.
5. **RUNNERS** (34-42s): full-bleed бігуни crossfade; «Breathe in the air» body BOTTOM-RIGHT.
6. **ODOMETER** (35-50s): темна card ПРАВОРУЧ, фото+число+caption; 3→9→16; bg forest→water.

## ТОЧНА ПОСЛІДОВНІСТЬ (scroll-progress приблизно, tempo з секунд):
| beat | live-t | scroll-p | композиція |
|---|---|---|---|
| N1 Nature hold | 2-12s | 0.00-0.22 | «Nature» серіф LEFT baseline~mid + body RIGHT (повний абзац), dark leaf bg |
| N2 Nature→Enjoy | 12.5-14s | 0.22-0.28 | Nature fade; hand-photo входить З НИЗУ center; «Enjoy» текст LEFT з'являється |
| N3 conveyor | 14-18s | 0.28-0.40 | «Enjoy» LEFT hold; hand-photo center + terrace входить bottom-right (2 фото зустрічно) |
| N4 slider settle | 18-21s | 0.40-0.47 | terrace-card CENTER ~45%w; «Landscaped terraces» caption RIGHT + arrows |
| N5 slider cycle | 21-29s | 0.47-0.62 | card center crossfade (sunset/shady/recreation); caption RIGHT swap per slide |
| M morph | 29.5-30.5s | 0.62-0.68 | green S-ribbon RISES from bottom; card exits up; green field (glow TOP-LEFT) |
| P1 Place | 30.5-33s | 0.68-0.76 | «Place» серіф enters BOTTOM-RIGHT y70% → scrolls UP to y45%→out; body «Springs» TOP-LEFT |
| P2 runners | 34-42s | 0.76-0.86 | runners full-bleed crossfade; «Breathe in the air» body BOTTOM-RIGHT |
| P3 odo 3 | 35-42s | 0.82-0.88 | dark card RIGHT: kid+dog photo, «3», «minute walk to Nature Park» |
| P4 odo 9→16 | 42-50s | 0.88-1.00 | «9» hand-in-water (water bg), «16» man-in-car (city bg) |

## ГЕОМЕТРІЯ (виміряна, desktop 1440):
- Nature title: LEFT x~60, baseline ~55-62% height, fontSize ~200px (cap-w 564@782 baseline)
- Nature body: RIGHT-aligned, x~ right 90px, y~55-72%, повний 3-речення абзац
- Enjoy panel: dark green panel LEFT ~40%w, vertically centered, серіф-ish body
- slider card: CENTER-ish, ~45%w portrait, vertically centered
- slider caption: RIGHT ~x1000, mid-height, + circular arrows below
- Place title: серіф ~180px, enters bottom-right x~980 y~70% → scrolls up
- odometer card: RIGHT x~ right 110, vertically centered, dark panel, photo+num+cap

## FIX-ЛІСТ (проти recording 17.09.58):
1. ❌ explainer div між атомами → ВИДАЛИТИ повністю (debug-шум)
2. ❌ Nature title clipped top → title у своїй зоні, pin covers
3. ❌ Place cut off right (x983 + w396 overflow) → Place enters within viewport, scrolls up
4. ❌ conveyor = прості fade cards → справжній bottom-rise conveyor, 2 фото зустрічно
5. ❌ slider card ліворуч → CENTER
6. ❌ Place static center → enters bottom-right, scrolls up
7. ❌ text selectable/jank → user-select:none на pin
