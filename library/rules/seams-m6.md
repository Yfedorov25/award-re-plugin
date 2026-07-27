---
id: seams-m6
kind: sub-organism-catalog
extends: STACKING-GRAMMAR
source: springs frozen-music (M6, /design continuation)
---

# ШВИ M6 — під-організми (секція+шов+секція, рівень якого в springs був 0)

> Рада ([[taxonomy-suborganisms-research]] + [[atom-first-not-monolith]]): рівень ПІД-ОРГАНІЗМ =
> ШОВ між секціями як окремий записаний об'єкт. Там жили помилки ×N (десинхрон, різкі переходи).
> Джерело: `KAI/M6-SECTION-MAP.md` §«Послідовність швів» + власні виміри S42.
> Це доповнює STACKING-GRAMMAR §4 (theme-flow) конкретними springs-швами. Джерело правди типу шва
> = виконуваний atom-gate (для 2 внутрішніх швів) + око Єгора на борді (для 3 flow-швів).

## Таксономія типів шва (springs-діалект)

| тип шва | що робить | driver | приклад M6 |
|---------|-----------|--------|------------|
| **hard-cut-flow** | обидві секції рухаються разом, твердий край, нуль fade/overlap | native scroll | glass→tower, card→ivy, RIL→gallery, wellness→flats |
| **overlap-cover** | секція A пін/settle СТОЇТЬ, секція B наїжджає ПОВЕРХ знизу | pin-band | tower→card (⊂ `card-overlap-reveal`) |
| **crossfade-under-hold** | фон A→B opacity-crossfade під ЗАПІНЕНИМ caption | pin-band | ivy→tree (⊂ `pinned-caption-crossfade`) |
| **pin-release-push** | пінована сцена релізиться, їде вгору потоком, контент кліпається краєм | pin→scroll | RIL-pin→gallery |
| **fade-dissolve-in-place** | текст гасне opacity НА МІСЦІ (не scroll-out), знизу проступає наступне | scroll-scrub | concept-текст перед crossfade |

## 5 ШВІВ M6 (по черзі)

### ШОВ 1 — glass → tower  ·  `hard-cut-flow`
Green-glass caption (block1) → рендер вежі (block2). Обидва рухаються разом звичайним скролом,
жорсткий горизонтальний край, БЕЗ fade/overlap. Вежа «виростає» знизу поки glass їде вгору.
→ примітив: чистий document-flow, покрито базою (`wipe-up`-родина).

### ШОВ 2 — tower → card  ·  `overlap-cover`  ⊂ card-overlap-reveal
Рендер вежі (block2) пін/settle СТОЇТЬ (scale 1.06→1.0), крем-картка (block3) наїжджає ПОВЕРХ
знизу (yPercent 100→0), лишає слівер рендера ~12px зліва. Це ВНУТРІШНІЙ шов атома
`card-overlap-reveal` (M3). Гейт: atom-gate card-overlap-reveal п.1-3 (card yPercent + слівер).
🔴 УРОК: card CSS translateY(100%) + gsap yPercent СКЛАДАЛИСЯ (px+%) → шторка ніколи не закривала
(S41 location-урок). set y:0 гасить px. Тому в атомі — ЛИШЕ yPercent, нуль CSS-transform на картці.

### ШОВ 3 — ivy → tree  ·  `crossfade-under-hold`  ⊂ pinned-caption-crossfade
Темне листя (block4) → дерево в атріумі (block5). Фон crossfade ivy→tree ПІД запіненим caption
«Ultra-transparent…». Caption з'являється РАНІШЕ за зміну фону, тримає viewport-позицію, потім
холд ~1.5-2s, release. Це ВНУТРІШНІЙ шов атома `pinned-caption-crossfade` (M2+M3+M4).
Гейт: atom-gate pinned-caption-crossfade п.1-5 (перехрест opacity + held-caption Δy≤1px).
🔴 УРОК: перед crossfade concept-текст (block4) робить `fade-dissolve-in-place` (opacity гасне на
місці, НЕ scroll-out) — інакше два тексти налазять (ghost-bleed).

### ШОВ 4 — cream-run  ·  суцільний `hard-cut-flow` + overlay-injection
Frozen Music (block6) → hotspot-фото (block7) → glass/metal (block8) → спіраль (block9) →
clarity (block10) → RIL (block11). Суцільний document-flow БЕЗ wipe між блоками. Hotspot-оверлеї
(block7) = fade-in/out ≤0.5s ПОВЕРХ (Interaction-шар, не рухає flow) — інжектиться на будь-який
блок cream-run. Спіраль (block9) = parallax-drift ~1.08× потоку, БЕЗ обертання (виміряно S42).
→ примітив: flow + `hotspot-tap-overlay` overlay-injection (z:200 поза scroll).

### ШОВ 5 — RIL-pin → gallery  ·  `pin-release-push` + `hard-cut-flow`
Rich Interior Life (block11, `scrub-carousel-2slide`) пін заголовка релізиться → картка виходить
угору звичайним потоком → hard cut cream → dark-green Art Gallery (block12). Два шви поспіль:
pin-release (вихід RIL) + hard-cut (зміна теми cream→dark-green).
🔴 УРОК: pin-release не вигадувати freeze/exit-хорео якого нема в записі (S33 air-sticky-card урок) —
картка просто виходить потоком угору, заголовок відпінюється, наступна секція заходить знизу.

## СУМІСНІСТЬ ШВІВ (композиція)
- overlap-cover і crossfade-under-hold — ВНУТРІШНІ шви атомів (не окремі об'єкти для складання).
- hard-cut-flow — універсальний, стекується з будь-чим (§STACKING-GRAMMAR §1: pin→flow→pin).
- pin-release-push ЗАВЖДИ веде у hard-cut-flow (не в інший pin — §3 «не два суміжні піни»).
- fade-dissolve-in-place ЗАВЖДИ передує crossfade-under-hold (готує ґрунт, гасить ghost).

## СТАТУС
5 швів M6 каталогізовано (перший набір під-організмів springs). 2 внутрішні шви верифіковані
atom-gate; 3 flow-шви = око Єгора на борді. Наступні секції (M8/M5/M7) додаватимуть нові типи швів
у цю таксономію (напр. hero-full-bleed-enter для M8).
