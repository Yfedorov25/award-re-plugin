# ATOM: reveal-sequence — text/media in→swap→out (springs Enjoy-біт)

> Закон руху, НЕ сніпет. Ролі: stage / copy-block (текст на скрімі) / media-card / full-bleed-next.
> Джерела: SOURCE.md (плівка 14–21s). Наратив Єгора: PENDING — v1 зі спостережень. CD-ТРІАЛ 1/2 (рада #4).

## СУТЬ (одне речення)
На запіненій сцені елементи входять/виходять **послідовністю з overlap на ОДНОМУ scrubbed-timeline**:
copy-block in → media-card in (з відставанням) → card wipe-out + нове full-bleed знизу (copy ТРИМАЄТЬСЯ) →
copy виходить ВГОРУ → наступний контент тим самим законом.

## МЕХАНІКИ
- **M1 pin**: сцена запінена, band ≈ 5vh скролу; ОДИН master-timeline, scrub.
- **M2 вхід**: кожен вхід = wipe-up знизу (clipPath) + невеликий y-travel; НЕ fade-only. Media-card
  заходить ПІСЛЯ copy-block з overlap (position '<0.25').
- **M3 swap**: card wipe-out ВГОРУ одночасно (same position) з підйомом нового full-bleed знизу;
  copy-block НЕ рухається під час swap — тримається поверх нового шару.
- **M4 вихід**: тексти завжди виходять ВГОРУ (y→негатив + clip collapse до верху). Медіа ніколи не crossfade.
- **M5 живість**: медіа, що тримається, має повільний inner-zoom settle (scale ~1.06→1.0).
- **M6 повтор**: закон чейниться — наступний copy/caption заходить тим самим M2.

## P-ВІКНА v2 (покадрова звірка з плівкою, S36 16:00)
in [0–0.08] · hold [0.08–0.30] · swap [0.30–0.44] · hold2 [0.44–0.72] · exit [0.72–0.85] · **next-in [0.75–0.89] — ПЕРЕКРИВАЄТЬСЯ з exit** (live 19.5–21.0s: наступний контент заходить при ще живому тексті; послідовність БЕЗ overlap = НЕ springs)
+ v2: card-in РОСТЕ (scale 0.85→1.0 разом з clip; live 13.0–14.0s) і сидить центр-право (~60% x, ~середина по вертикалі) · swap-межа рівномірна (power1.inOut, live 15.3–16.8s лінійна)

## ТЕМП (з плівки, скрол Єгора)
Band ≈ 8s: входи ~0.6-0.9s, swap ~1.2s, hold-и довгі (награність = у hold-ах, не в швидкості твінів).

## BUILD-BINDING
ОДИН pinned ScrollTrigger (end +=500%) → ОДИН scrubbed master-tl; позиції з §P-ВІКНА; ease
cubic-bezier(0.25,0.74,0.22,0.99) на shaped-рухах. Transform-ownership: GSAP-only (dom-lint гейт).

## TRANSFER-ГЕЙТ
Інший фасад (dummy-градієнти, інші тексти), той самий закон: порядок, overlap, «текст тримається під час swap»,
виходи вгору, wipe-not-fade.

## КАЛІБРУВАТИ З НАРАТИВОМ ЄГОРА (v2)
1) точний overlap card-після-тексту; 2) чи swap строго одночасний (card-out vs bg-rise); 3) величина hold-ів.
