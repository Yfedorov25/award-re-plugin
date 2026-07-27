# ATOM: air-invest-calculator (B11) — MODEL/CASE-таби + param-табл зі степерами + live payback/monthly readout

> Закон = T-416. Джерело: Desktop-air.mp4 investment desktop t165-174 (розкадровка
> `CD-RUN-air-batch-5/reference-frames/b11-calc-*`). BUILD: CD віддав DC-формат (React) → Я
> ТРАНСПІЛЮВАВ у vanilla зі збереженням логіки. 3 варіанти (LEDGER/TERMINAL/PRIVATE).

## СУТЬ
Ліворуч рейка MODEL 1 (Rental Income, active) / MODEL 2 (Asset Resale, hover-highlight). Панель
праворуч: CASE 1/2 таби → «OFFICE {area} M²» + param-таблиця (unit price, rental rate, indexation,
op costs, tax) зі степерами; зміна параметра/офісу/кейса перераховує «PAYBACK ~{years} YEARS /
MONTHLY ~{n}» LIVE. Бенд-плитки «UP TO 50 / 50-150 / 150+ MILLION» ставлять офіс.

## ІНВАРІАНТИ
Readout = f(params) (обидва оновлюються консистентно, ніколи один застарілий); number-swap =
ЧИСТИЙ (стара гасне повністю → нова count-up, НЕ overlap двох чисел); CASE-таб underline slide +
table clean-swap; transform/opacity only; тач = tap-діє.

## ГЕЙТИ (С33-6 vanilla, 12/12): renders+__CALC · case-consistent (pay 8.3→7.7=readout) · office-update · 0 err ×3 варіанти.
## ФАЙЛИ
`build.html` = **AIR-мова redo** (NORTH, Swiss tech-minimal — правильний фасад С33-8; гейти пройдені, борд vs live `cd-b5r/parity/board-b5r.html`). `build-editorial-rejected.html` = старий serif+атмосфера варіант (фасад ВІДХИЛЕНО). Variant-*.html = editorial-банк. `variant-terminal.html` · `variant-private.html` = банк.
Борд vs live: `_transfer-tests/cd-b5/parity/board-b5.html`. CD DC-оригінали: `cd-b5/RESULTS/*.dc.html`.
