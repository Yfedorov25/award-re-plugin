# s28 m390 /about — services intro diagnosis (recovered + verified fresh)

> The s27 diagnosis file (`s27-m390-diagnosis.md`) was lost (scratchpad didn't survive).
> Re-measured fresh 2026-07-11 with live probe + ours probe @390. Numbers confirm STATE line 35.

## Live `#service` @390 (aircenter.space/about)
- section id = **`service`** (singular!) — this is why `px-solve-m390.mjs` PAIRS `['services',...]` missed it (`live.secs` had no services key). Fix PAIRS to `'service'` later.
- section top 14746, **height 2641px**, totalScrollH 25072.

Element relTops (relative to section top):
| element | relTop | size |
|---|---|---|
| h2 "Service excellence" | 20 | 350×75 |
| privileges paragraph | 255 | 290×73 |
| wide-parking (`.h2`) | 488 | 350×183 |
| **garage photo** | 751 | **350×350 SQUARE** (`.col--md-8`, parallax-image-move) |
| from-electric paragraph | 1181 | 350×41 |
| **cards (`sticky--under-next`)** | 1382 | 350×2103 (sticky region) |
| — card slider layer (`l-life-cards-background`) | 1484 | 390×**640** |

Live intro (before cards) = **1382px**. Cards are a sticky-under-next block (2103px tall region, 640px visible slider).

## Ours `#services` + `#services-cards` @390 (combo-lab)
- `#services` top 14109, height **925px**. `#services-cards` follows; combined span = **2557px** (docH 24106).
| element | ours relTop | live relTop | Δ (live−ours) |
|---|---|---|---|
| h2 | 84 | 20 | −64 (ours too LOW — h2 is 92px vs live 75, plus top margin) |
| privileges | 252 | 255 | +3 ✓ |
| wide | 385 | 488 | +103 |
| garage photo | 633 (367×**234 WIDE**) | 751 (350×**350 SQ**) | +118 |
| from-electric | 874 | 1181 | +307 |
| **cards start** | **925** | **1382** | **+457** ← core deficit |

## Diagnosis (corrected vs STATE's "+1345")
- **Total span already ~matches**: ours 2557 vs live 2641 = only −84px. NOT a total-height problem.
- **Real problem = internal distribution**: our cards start 457px too early → content runs ~half a screen ahead of live (matches STATE line 14 "PREMIUM картки рано"). This is what SSIM #1 penalizes.
- **Fix = push cards down +457px by expanding intro to live relTops**, not adding 1345px of raw height:
  1. h2: reduce top offset so h2 sits at rel ~20 (tighten top).
  2. wide-parking: rel 385→488 (+~100 margin above).
  3. garage photo: make it a **350×350 square** (currently 367×234 wide) at rel 751.
  4. from-electric: rel 874→1181 (+~300 via margin/photo-square gain).
  5. cards then land at ~1382 naturally.
- Keep total ≈ live 2641: intro grows +457 → trim ~457 from `#services-cards` bottom padding (currently `42vh`+106px) OR let solver rebalance the tail. Verify with board-diff SSIM after.

## ⚠️ РЕЗУЛЬТАТ СПРОБИ С28 — ВІДКОЧЕНО (frac-coupling знову вкусив)

Застосував інтро-фікс (margins під live relTops + гараж 350×350 + `#services-cards` padding 38vh→20px):
- **Геометрія СІЛА 1-в-1**: cards@1389 vs live 1382 (±7px); solver `service→certificate` −382 → **−81px**.
- **Композиція ПІДТВЕРДЖЕНА оком**: ours@072 ≈ live@074 (privileges + wide + гараж-квадрат, той самий порядок/пропорції). Інтро тепер структурно = live.
- **АЛЕ SSIM НЕ ВПАВ — global 33.81 → 34.31 (+0.5, трохи ГІРШЕ).** Причина: борд судить на СПІЛЬНИХ frac; +465px у services зсунув frac-мапінг → services на ~2 кадри ВПЕРЕД live (ours@072 = live@074), і **autonomy РЕГРЕСував 35.6 → 40.4 (+4.8)** — колатераль. service лише −0.8.
- **УРОК (= STATE закон #1 відтворено): не можна вирівнювати ОДНУ зону ізольовано.** Solver діагностичний (лише друкує Δ, НЕ мутує) → «then solver» означає Я маю застосувати ЙОГО region-deltas на СУСІДНІ зони в ТІЙ САМІЙ операції. Я зупинився на пів-дорозі → frac-scale розмазав шкоду вгору на autonomy.
- **ВІДКОЧЕНО** combo-lab (git checkout, назад на 91fe403). Solver `service`-анкор bug-fix ЗАЛИШЕНО (окремий, коректний).

## ⏭️ ЯК ЗРОБИТИ ПРАВИЛЬНО (наступна сесія — ХОЛІСТИЧНО, за solver-списком)
Solver rebalance-список (за |Δ|, свіжий s28 з інтро-фіксом ще застосованим):
1. `headquarters→space` ДОДАТИ **+285px** (live 3054 vs ours 2769)
2. `revolves→headquarters` ЗРІЗАТИ **179px** (live 1328 vs ours 1507)
3. `certificate→solutions` ДОДАТИ **+130px** (live 1075 vs ours 945)
4. `solutions→кінець` ДОДАТИ **+116px** (live 5767 vs ours 5651)
5. `autonomy→service` ДОДАТИ **+103px** (live 2044 vs ours 1941)
6. `service→certificate` ЗРІЗАТИ **81px** (після інтро-фіксу; було −382)
7. `space→autonomy` ЗРІЗАТИ **64px**
→ Застосувати інтро-фікс (нижче) + УСІ ці 7 region-deltas РАЗОМ, ПОТІМ один board-diff. Тоді frac-scale сяде (total → live 24228) і services/autonomy впадуть одночасно.

Інтро-фікс (перевірений, для повторного застосування) — блок у `@media(max-width:768px)` services:
```
#services > .act { padding-top: 20px !important; padding-bottom: 151px !important; }
#services .h1.spread { margin-bottom: 0 !important; }
#services > .act > p.reveal-text:first-of-type { margin: 143px auto 0 !important; }  /* privileges 255 */
#services .h2r { margin: 175px 0 0 auto !important; }                                 /* wide 488 */
#services .svc-introw { margin-top: 83px !important; grid-template-columns: 1fr; }    /* гараж 751 */
#services .svc-introw .svc-img { width: 350px !important; max-width: 100%; aspect-ratio: 1/1 !important; margin: 0 !important; }
#services .svc-introw p.reveal-text { margin-top: 80px !important; }                  /* from-electric 1181 */
#services-cards { padding-bottom: 20px !important; }                                  /* cards-регіон → live 1258 */
```
⚠️ INLINE margins на інтро-елементах → потрібен `!important` (інакше desktop-inline перебиває).

## 🔴🔴 С29 — ХОЛІСТИЧНИЙ ЗАХІД ЗРОБЛЕНО → РЕГРЕС +3.48 → ВІДКОЧЕНО (геометрія = глухий кут)

Застосував інтро-фікс + УСІ 7 region-deltas разом (solver-loop, 4 ітер, 5/7 регіонів Δ=0px).
Геометрія збіглась ідеально. **SSIM 33.81 → 37.29 (+3.48, регрес майже скрізь):**
cert +22.8 · sol +13.6 · autonomy +7.5 · revolves +6.0 · service +5.6 · space −5.0.
Gates OK (0 err ×2, scrollWidth, desktop 35614 незмінний). **ВІДКОЧЕНО (git checkout 91fe403).**

**КОРІНЬ (кадри #85 cert s27-vs-s29):** frac-борд = позиція КОНТЕНТУ на спільному frac, НЕ doc-top відстань. Baseline мав випадкові перекриття live; вирівнявши відстані я їх зруйнував (cert поїхав на екран далі за live). Doc-top ≠ екран (кумулятивний скрол + внутрішні піни/слайдери).

**ВИСНОВОК: НЕ робити геом-заходів на m390 (3× регрес: с27/с28/с29).** Шляхи вгору — внутр. скрол-механіка посекційно (фундаментально) АБО прийняти baseline + судити око (прагматично). Solver = діагностика, не рецепт. Деталі: memory m390-frac-coupling + STATE § С28+С29 УРОК.
Числа інтро/region лишаю вище — валідні для варіанту (1) якщо колись відтворюватимемо піни.
