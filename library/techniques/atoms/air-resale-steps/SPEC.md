# ATOM: air-resale-steps (B12) — MODEL-2 таб: sub-таби + гігант 1·2·3 blur-sharpen + ~40% count-up + check-cards

> Закон = T-417. Джерело: Desktop-air.mp4 investment t175-180 (розкадровка
> `CD-RUN-air-batch-5/reference-frames/b12-steps-*`). BUILD: CD DC-формат → Я ТРАНСПІЛЮВАВ у vanilla.
> 3 варіанти (LEDGER/TERMINAL/PRIVATE).

## СУТЬ
MODEL 2 (Asset Resale) активний. Два sub-таби «Capitalization through resale / Sale of ready-made
rental business». State A: гігантські 1·2·3 виходять З БЛЮРУ стаггером (90ms), під кожним step-caption
+ rule-draw; «~40%» count-up 0→40 + (i)-тултіп. State B: параграф + ~40% + check-cards. Внизу обох —
3 check-cards з ✓ стаггером.

## ІНВАРІАНТИ
Blur-sharpen filter+opacity стаггером; sub-tab swap = ЧИСТИЙ HANDOFF (innerHTML повністю
заміщається — два стани НІКОЛИ не співіснують, per-rAF доведено 0 overlap); ~40% count-up per-enter;
return-A re-runs sharpen; тач = tap-діє.

## 🔴 УРОК (застосовано з batch-4): swap стану = handoff/маска, НЕ overlap-cross-fade двох текстів.
Тут гарантовано конструкцією (fade-out → innerHTML swap → fade-in). Див. [[gate-green-not-done]].

## ГЕЙТИ (С33-6 vanilla, 15/15): stateA-settled (1·2·3 sharp, pct=40) · clean-handoff (per-rAF 0 overlap) · single-state · return-A · 0 err ×3.
## ФАЙЛИ
`build.html` = **AIR-мова redo** (NORTH, Swiss tech-minimal — правильний фасад С33-8; гейти пройдені, борд vs live `cd-b5r/parity/board-b5r.html`). `build-editorial-rejected.html` = старий serif+атмосфера варіант (фасад ВІДХИЛЕНО). Variant-*.html = editorial-банк. `variant-terminal.html` · `variant-private.html` = банк.
