# ATOM: parallax-drift — віконний translate по скролу (найчастіший закон springs, ~170 інстансів)

## СУТЬ
Елемент у ЗВИЧАЙНОМУ потоці рухається лінійно по своєму «вікну» видимості: keyframes задають
transform на позиціях елемента відносно в'юпорта; між ними — чиста інтерполяція від скролу. Різні
елементи мають різні коефіцієнти → шари «дихають» на різних швидкостях. НЕ pinned; driver = вікно елемента.

## МЕХАНІКИ (декларативно з markup)
- M1: driver = per-element scrub window (springs: `data-parallax-<from>-<to>`, measure vs viewport;
  GSAP: ScrollTrigger trigger=елемент, start 'top bottom' end 'bottom top', scrub).
- M2: закон = ЛІНІЙНА інтерполяція (`ease:none`) між keyframes; типові пари з markup:
  `translateY(20%)→0` (вхід), `0→translateY(-20%)` (дрейф угору), зсуви на vw для горизонталі.
- M3: clamp за межами вікна (springs: data-parallax-clamp).
- M4: коефіцієнти малі (±10-25%) — дрейф ЛЕДЬ помітний, преміум = стриманість.

## TRANSFER-ГЕЙТ
3+ шари на dummy-фасаді рухаються з різними коефіцієнтами, лінійно, реверсно, без jank.

## v2-CD (S37, прийнято блоково)
BUILD = CD (проєкт e87a1553), RAW без фіксів; гейти 7/7 (cd-batch5-gate.mjs).
Параметри v2: 3 band-и ×4 шари, коефіцієнти ±8..24 yPercent, вікна 'top bottom'→'bottom top',
ease:none, різноспрямованість slab/card. Демо-фасад: Orchard/Colonnade/Dusk Line.
APPROVE: блоковий вердикт Єгора кінець S37 («так супер, прийнято»).
